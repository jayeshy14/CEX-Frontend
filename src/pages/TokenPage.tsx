import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { createChart, IChartApi, ISeriesApi, UTCTimestamp } from 'lightweight-charts';
import { fetchOrderBook, placeOrder, cancelOrder } from '../api/orders';
import { fetchCryptocurrency } from '../api/cryptocurrencies';
import type { CryptoData } from '../types/api';

type Interval = '1m' | '5m' | '15m' | '1h' | '4h' | '1d' | '1w';

interface OrderRow {
  _id: string;
  type: 'buy' | 'sell';
  amount: number;
  price: number | null;
}

interface OrderBookData {
  limitBuyOrders: OrderRow[];
  limitSellOrders: OrderRow[];
  marketBuyOrders: OrderRow[];
  marketSellOrders: OrderRow[];
}

interface CandlePayload {
  t: number; o: string; h: string; l: string; c: string;
}
interface BinanceMsg { k?: CandlePayload; }

const INTERVALS: Interval[] = ['1m', '5m', '15m', '1h', '4h', '1d', '1w'];

const toBinancePair = (a: string, b: string): string => {
  const sym = a.toUpperCase();
  const quote = b.toUpperCase() === 'USDT' || b.toUpperCase() === 'USDC' ? 'USDT' : b.toUpperCase();
  return `${sym}${quote}`;
};

const TokenPage = () => {
  const { symbolA = '', symbolB = 'USDT' } = useParams<{ symbolA: string; symbolB: string }>();

  const [cryptoA, setCryptoA] = useState<CryptoData | null>(null);
  const [cryptoB, setCryptoB] = useState<CryptoData | null>(null);
  const [orderBook, setOrderBook] = useState<OrderBookData | null>(null);
  const [orderType, setOrderType] = useState<'buy' | 'sell'>('buy');
  const [orderMode, setOrderMode] = useState<'limit' | 'market'>('limit');
  const [amount, setAmount] = useState('');
  const [price, setPrice] = useState('');
  const [loading, setLoading] = useState(true);
  const [interval, setChartInterval] = useState<Interval>('1h');

  // Chart refs
  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const loadOrderBook = useCallback(async (idA: string, idB: string) => {
    try {
      const data = (await fetchOrderBook(idA, idB)) as OrderBookData | null;
      if (data) setOrderBook(data);
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    if (!symbolA || !symbolB) return;
    const load = async () => {
      setLoading(true);
      try {
        const [dataA, dataB] = await Promise.all([
          fetchCryptocurrency(symbolA),
          fetchCryptocurrency(symbolB),
        ]);
        if (!dataA) { toast.error(`${symbolA} not found`); return; }
        if (!dataB) { toast.error(`${symbolB} not found`); return; }
        setCryptoA(dataA);
        setCryptoB(dataB);
        if (dataA._id && dataB._id) await loadOrderBook(dataA._id, dataB._id);
      } catch { toast.error('Failed to load trading data'); }
      finally { setLoading(false); }
    };
    void load();
  }, [symbolA, symbolB, loadOrderBook]);

  // Refresh order book every 5s
  useEffect(() => {
    if (!cryptoA?._id || !cryptoB?._id) return;
    const id = setInterval(() => void loadOrderBook(cryptoA._id!, cryptoB._id!), 5000);
    return () => clearInterval(id);
  }, [cryptoA, cryptoB, loadOrderBook]);

  // Chart setup
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight || 420,
      layout: { background: { color: '#0B0E11' }, textColor: '#848E9C' } as unknown as object,
      grid: { vertLines: { color: '#2B3139' }, horzLines: { color: '#2B3139' } },
      crosshair: { mode: 1 } as unknown as object,
      timeScale: { borderColor: '#2B3139', timeVisible: true },
      rightPriceScale: { borderColor: '#2B3139' },
    } as unknown as object);

    chartRef.current = chart;

    const chartAny = chart as unknown as {
      addCandlestickSeries: (opts: object) => ISeriesApi<'Candlestick'>;
    };

    const series = chartAny.addCandlestickSeries({
      upColor: '#0ECB81', downColor: '#F6465D',
      borderUpColor: '#0ECB81', borderDownColor: '#F6465D',
      wickUpColor: '#0ECB81', wickDownColor: '#F6465D',
    });
    candleSeriesRef.current = series;

    const pair = toBinancePair(symbolA, symbolB);

    const fetchHistory = async () => {
      try {
        const res = await fetch(`https://api.binance.com/api/v3/klines?symbol=${pair}&interval=${interval}&limit=500`);
        const data = (await res.json()) as Array<[number, string, string, string, string, ...unknown[]]>;
        if (!Array.isArray(data)) return;
        series.setData(data.map(([t, o, h, l, c]) => ({
          time: (t / 1000) as UTCTimestamp,
          open: parseFloat(o), high: parseFloat(h),
          low: parseFloat(l), close: parseFloat(c),
        })));
      } catch { /* Binance may CORS block — chart stays empty */ }
    };

    void fetchHistory();

    if (wsRef.current) wsRef.current.close();
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${pair.toLowerCase()}@kline_${interval}`);
    wsRef.current = ws;
    ws.onmessage = (e: MessageEvent<string>) => {
      const msg = JSON.parse(e.data) as BinanceMsg;
      if (msg.k) {
        const { t, o, h, l, c } = msg.k;
        series.update({ time: (t / 1000) as UTCTimestamp, open: parseFloat(o), high: parseFloat(h), low: parseFloat(l), close: parseFloat(c) });
      }
    };

    const ro = new ResizeObserver(() => {
      if (chartContainerRef.current) chart.resize(chartContainerRef.current.clientWidth, chartContainerRef.current.clientHeight);
    });
    if (chartContainerRef.current) ro.observe(chartContainerRef.current);

    return () => {
      ro.disconnect();
      ws.close();
      (chart as unknown as { remove: () => void }).remove();
      chartRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interval, symbolA, symbolB]);

  const handlePlaceOrder = async () => {
    if (!cryptoA || !cryptoB) return;
    if (!amount || parseFloat(amount) <= 0) { toast.error('Enter a valid amount'); return; }
    if (orderMode === 'limit' && (!price || parseFloat(price) <= 0)) { toast.error('Enter a valid price'); return; }
    try {
      await placeOrder({ orderType, orderMode, cryptoA: cryptoA._id!, cryptoB: cryptoB._id!, amount, price });
      toast.success('Order placed');
      setAmount(''); setPrice('');
      if (cryptoA._id && cryptoB._id) await loadOrderBook(cryptoA._id, cryptoB._id);
    } catch (err) { toast.error(typeof err === 'string' ? err : 'Failed to place order'); }
  };

  const handleCancelOrder = async (id: string) => {
    try {
      await cancelOrder(id);
      toast.success('Order cancelled');
      if (cryptoA?._id && cryptoB?._id) await loadOrderBook(cryptoA._id!, cryptoB._id!);
    } catch { toast.error('Failed to cancel order'); }
  };

  const asks = orderBook?.limitSellOrders ?? [];
  const bids = orderBook?.limitBuyOrders ?? [];
  const myOrders = [
    ...(orderBook?.limitBuyOrders ?? []),
    ...(orderBook?.limitSellOrders ?? []),
    ...(orderBook?.marketBuyOrders ?? []),
    ...(orderBook?.marketSellOrders ?? []),
  ];

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-3.5rem)] items-center justify-center bg-bg">
        <div className="text-text-secondary text-sm">Loading {symbolA}/{symbolB}…</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] bg-bg overflow-hidden">
      {/* Pair header bar */}
      <div className="bg-bg-surface border-b border-border px-6 py-3 flex items-center gap-6 shrink-0">
        <div>
          <span className="text-text-primary font-bold text-lg">{symbolA.toUpperCase()}</span>
          <span className="text-text-secondary text-lg">/{symbolB.toUpperCase()}</span>
        </div>
        {cryptoA && (
          <div>
            <p className="font-mono font-bold text-text-primary text-lg">
              ${cryptoA.current_price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
          </div>
        )}
        <div className="ml-auto text-text-muted text-xs">Powered by Binance data</div>
      </div>

      {/* Main 3-panel layout */}
      <div className="flex flex-1 overflow-hidden">

        {/* Chart (left) */}
        <div className="flex flex-col flex-1 min-w-0 border-r border-border">
          {/* Interval tabs */}
          <div className="flex items-center gap-1 px-4 py-2 bg-bg-surface border-b border-border shrink-0">
            {INTERVALS.map((iv) => (
              <button
                key={iv}
                onClick={() => setChartInterval(iv)}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  interval === iv ? 'bg-accent text-bg' : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {iv}
              </button>
            ))}
          </div>
          <div ref={chartContainerRef} className="flex-1" />
        </div>

        {/* Order Book (center) */}
        <div className="w-56 flex flex-col bg-bg-surface border-r border-border overflow-hidden shrink-0">
          <div className="px-4 py-3 border-b border-border">
            <h3 className="text-text-primary font-semibold text-sm">Order Book</h3>
          </div>
          <div className="flex-1 overflow-y-auto">
            {/* Asks (sells) — red */}
            <div className="px-2 py-1">
              <p className="text-text-muted text-xs px-2 pb-1">Asks</p>
              {asks.length === 0 ? (
                <p className="text-text-muted text-xs px-2 py-2">No asks</p>
              ) : (
                asks.slice(0, 12).map((o) => (
                  <div key={o._id} className="flex justify-between px-2 py-0.5 hover:bg-sell-muted rounded text-xs">
                    <span className="font-mono text-sell">{o.price ?? 'MKT'}</span>
                    <span className="font-mono text-text-secondary">{o.amount}</span>
                  </div>
                ))
              )}
            </div>
            <div className="border-t border-border mx-4 my-1" />
            {/* Bids (buys) — green */}
            <div className="px-2 py-1">
              <p className="text-text-muted text-xs px-2 pb-1">Bids</p>
              {bids.length === 0 ? (
                <p className="text-text-muted text-xs px-2 py-2">No bids</p>
              ) : (
                bids.slice(0, 12).map((o) => (
                  <div key={o._id} className="flex justify-between px-2 py-0.5 hover:bg-buy-muted rounded text-xs">
                    <span className="font-mono text-buy">{o.price ?? 'MKT'}</span>
                    <span className="font-mono text-text-secondary">{o.amount}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Order Form (right) */}
        <div className="w-72 flex flex-col bg-bg-surface overflow-y-auto shrink-0">
          {/* Buy/Sell tabs */}
          <div className="flex border-b border-border shrink-0">
            <button
              onClick={() => setOrderType('buy')}
              className={`flex-1 py-3 text-sm font-semibold transition-colors border-b-2 ${
                orderType === 'buy' ? 'text-buy border-buy' : 'text-text-secondary border-transparent hover:text-text-primary'
              }`}
            >
              Buy
            </button>
            <button
              onClick={() => setOrderType('sell')}
              className={`flex-1 py-3 text-sm font-semibold transition-colors border-b-2 ${
                orderType === 'sell' ? 'text-sell border-sell' : 'text-text-secondary border-transparent hover:text-text-primary'
              }`}
            >
              Sell
            </button>
          </div>

          <div className="p-4 flex flex-col gap-4">
            {/* Limit / Market toggle */}
            <div className="flex gap-2">
              {(['limit', 'market'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setOrderMode(m)}
                  className={`flex-1 py-1.5 text-xs rounded font-medium capitalize transition-colors ${
                    orderMode === m ? 'bg-bg-elevated text-text-primary' : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>

            {/* Price (limit only) */}
            {orderMode === 'limit' && (
              <div>
                <label className="text-text-secondary text-xs mb-1 block">Price ({symbolB.toUpperCase()})</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent font-mono"
                />
              </div>
            )}

            {/* Amount */}
            <div>
              <label className="text-text-secondary text-xs mb-1 block">Amount ({symbolA.toUpperCase()})</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent font-mono"
              />
            </div>

            <button
              onClick={() => void handlePlaceOrder()}
              className={`w-full py-3 rounded-xl font-semibold text-sm transition-colors ${
                orderType === 'buy'
                  ? 'bg-buy hover:bg-buy-hover text-bg'
                  : 'bg-sell hover:bg-sell-hover text-white'
              }`}
            >
              {orderType === 'buy' ? `Buy ${symbolA.toUpperCase()}` : `Sell ${symbolA.toUpperCase()}`}
            </button>

            {/* Open orders for this pair */}
            {myOrders.length > 0 && (
              <div className="mt-2">
                <p className="text-text-secondary text-xs mb-2 font-medium">Open Orders</p>
                {myOrders.map((o) => (
                  <div key={o._id} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                    <div>
                      <span className={`text-xs font-semibold ${o.type === 'buy' ? 'text-buy' : 'text-sell'}`}>
                        {o.type.toUpperCase()}
                      </span>
                      <span className="text-text-secondary text-xs ml-2 font-mono">{o.amount}</span>
                    </div>
                    <button
                      onClick={() => void handleCancelOrder(o._id)}
                      className="text-sell text-xs hover:underline"
                    >
                      Cancel
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenPage;
