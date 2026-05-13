import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { fetchOrderBook, placeOrder, cancelOrder } from '../api/orders';
import { fetchCryptocurrency } from '../api/cryptocurrencies';
import type { CryptoData } from '../types/api';

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

const TokenPage = () => {
  const { symbolA, symbolB } = useParams<{ symbolA: string; symbolB: string }>();

  const [cryptoA, setCryptoA] = useState<CryptoData | null>(null);
  const [cryptoB, setCryptoB] = useState<CryptoData | null>(null);
  const [orderBook, setOrderBook] = useState<OrderBookData | null>(null);
  const [orderType, setOrderType] = useState<'buy' | 'sell'>('buy');
  const [orderMode, setOrderMode] = useState<'limit' | 'market'>('limit');
  const [amount, setAmount] = useState<string>('');
  const [price, setPrice] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const loadOrderBook = useCallback(async (idA: string, idB: string) => {
    try {
      const data = (await fetchOrderBook(idA, idB)) as OrderBookData | null;
      if (data) setOrderBook(data);
    } catch (error) {
      console.error('Error fetching order book:', error);
    }
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

        if (!dataA) { toast.error(`Cryptocurrency ${symbolA} not found.`); return; }
        if (!dataB) { toast.error(`Cryptocurrency ${symbolB} not found.`); return; }

        setCryptoA(dataA);
        setCryptoB(dataB);

        const idA = dataA._id;
        const idB = dataB._id;
        if (idA && idB) await loadOrderBook(idA, idB);
      } catch (error) {
        console.error('Failed to load token page:', error);
        toast.error('Failed to load trading data.');
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [symbolA, symbolB, loadOrderBook]);

  const handlePlaceOrder = async () => {
    if (!cryptoA || !cryptoB) return;

    const idA = cryptoA._id;
    const idB = cryptoB._id;

    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Enter a valid amount.');
      return;
    }
    if (orderMode === 'limit' && (!price || parseFloat(price) <= 0)) {
      toast.error('Enter a valid price for limit orders.');
      return;
    }

    try {
      await placeOrder({ orderType, orderMode, cryptoA: idA, cryptoB: idB, amount, price });
      toast.success('Order placed!');
      setAmount('');
      setPrice('');
      await loadOrderBook(idA, idB);
    } catch (error) {
      toast.error(typeof error === 'string' ? error : 'Failed to place order.');
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    try {
      await cancelOrder(orderId);
      toast.success('Order canceled.');
      if (cryptoA && cryptoB) await loadOrderBook(cryptoA._id, cryptoB._id);
    } catch (error) {
      toast.error(typeof error === 'string' ? error : 'Failed to cancel order.');
    }
  };

  const allOrders: OrderRow[] = orderBook
    ? [
        ...orderBook.limitBuyOrders,
        ...orderBook.limitSellOrders,
        ...orderBook.marketBuyOrders,
        ...orderBook.marketSellOrders,
      ]
    : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        Loading {symbolA}/{symbolB}...
      </div>
    );
  }

  if (!cryptoA || !cryptoB) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <p className="text-red-400">Token pair not found. <a href="/cryptocurrencies" className="text-yellow-400 underline">Back to markets</a></p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex flex-col items-center py-12 px-4 md:px-8 space-y-8">

      {/* Token Info */}
      <div className="w-full bg-gray-800/60 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-700/50 p-8">
        <h2 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 mb-6">
          {cryptoA.name} / {cryptoB.name}
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center pb-3 border-b border-gray-700">
              <span className="text-gray-400">{symbolA} Price</span>
              <span className="font-semibold text-white">${cryptoA.current_price?.toFixed(2) ?? '—'}</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-gray-700">
              <span className="text-gray-400">{symbolB} Price</span>
              <span className="font-semibold text-white">${cryptoB.current_price?.toFixed(2) ?? '—'}</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center pb-3 border-b border-gray-700">
              <span className="text-gray-400">Pair</span>
              <span className="font-semibold text-yellow-400">{symbolA}/{symbolB}</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-gray-700">
              <span className="text-gray-400">Open Orders</span>
              <span className="font-semibold text-white">{allOrders.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Place Order */}
      <div className="w-full bg-gray-800/60 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-700/50 p-6">
        <h3 className="text-2xl font-bold text-yellow-400 mb-4">Place Order</h3>
        <div className="flex flex-col space-y-4">
          <div className="flex space-x-4">
            <button
              onClick={() => setOrderType('buy')}
              className={`flex-1 px-6 py-3 font-bold rounded-lg transition-all ${orderType === 'buy' ? 'bg-green-500 text-black' : 'bg-green-900 text-white hover:bg-green-700'}`}
            >
              Buy {symbolA}
            </button>
            <button
              onClick={() => setOrderType('sell')}
              className={`flex-1 px-6 py-3 font-bold rounded-lg transition-all ${orderType === 'sell' ? 'bg-red-500 text-black' : 'bg-red-900 text-white hover:bg-red-700'}`}
            >
              Sell {symbolA}
            </button>
          </div>

          <select
            value={orderMode}
            onChange={(e) => setOrderMode(e.target.value as 'limit' | 'market')}
            className="p-3 rounded bg-gray-700 text-white"
          >
            <option value="limit">Limit Order</option>
            <option value="market">Market Order</option>
          </select>

          <input
            type="number"
            placeholder={`Amount (${symbolA})`}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="p-3 rounded bg-gray-700 text-white"
          />

          {orderMode === 'limit' && (
            <input
              type="number"
              placeholder={`Price (${symbolB})`}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="p-3 rounded bg-gray-700 text-white"
            />
          )}

          <button
            onClick={() => void handlePlaceOrder()}
            disabled={!amount}
            className="bg-yellow-500 p-3 rounded text-black font-bold hover:bg-yellow-600 disabled:opacity-50"
          >
            Place {orderType === 'buy' ? 'Buy' : 'Sell'} Order
          </button>
        </div>
      </div>

      {/* Order Book */}
      <div className="w-full bg-gray-800/60 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-700/50 p-6">
        <h3 className="text-2xl font-bold text-yellow-400 mb-4">Order Book</h3>
        {allOrders.length === 0 ? (
          <p className="text-gray-400 text-center py-6">No open orders for this pair.</p>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-gray-700/50 text-gray-300">
              <tr>
                <th className="px-4 py-3 font-semibold">Type</th>
                <th className="px-4 py-3 font-semibold">Amount ({symbolA})</th>
                <th className="px-4 py-3 font-semibold">Price ({symbolB})</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {allOrders.map((order) => (
                <tr key={order._id} className="border-b border-gray-700 hover:bg-gray-800/40">
                  <td className={`px-4 py-3 font-semibold ${order.type === 'buy' ? 'text-green-400' : 'text-red-400'}`}>
                    {order.type.toUpperCase()}
                  </td>
                  <td className="px-4 py-3">{order.amount}</td>
                  <td className="px-4 py-3">{order.price != null ? order.price : 'Market'}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => void handleCancelOrder(order._id)}
                      className="bg-red-600 px-3 py-1 rounded text-white text-sm font-bold hover:bg-red-700"
                    >
                      Cancel
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default TokenPage;
