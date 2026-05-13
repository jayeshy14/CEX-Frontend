import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { fetchOrderBook, placeOrder, cancelOrder } from '../api/orders';
import { useAuth } from '../context/AuthContext';

interface TokenInfo {
  name: string;
  symbol: string;
  current_price: number;
  _24hr_change: number;
  _24hr_volume: string;
  total_supply: string;
  market_cap: string;
  _24hr_low: number;
  _24hr_high: number;
}

interface OrderRow {
  _id: string;
  type: 'buy' | 'sell';
  amount: number;
  price: number | null;
}

const TokenPage = () => {
  const { userId } = useAuth();

  const [tokenData] = useState<TokenInfo>({
    name: 'Ethereum',
    symbol: 'ETH',
    current_price: 2300,
    _24hr_change: -1.5,
    _24hr_volume: '2,500,000 ETH',
    total_supply: '100,000,000 ETH',
    market_cap: '250B',
    _24hr_low: 2200,
    _24hr_high: 2400,
  });

  const [orderType, setOrderType] = useState<'buy' | 'sell'>('buy');
  const [orderMode, setOrderMode] = useState<'limit' | 'market'>('limit');
  const [amount, setAmount] = useState<string>('');
  const [price, setPrice] = useState<string>('');
  const [cryptoA, setCryptoA] = useState<string>('');
  const [cryptoB, setCryptoB] = useState<string>('');
  const [orderBook, setOrderBook] = useState<OrderRow[]>([
    { _id: '1', type: 'buy', amount: 2.5, price: 45000 },
    { _id: '2', type: 'sell', amount: 1.2, price: 45500 },
    { _id: '3', type: 'buy', amount: 3.8, price: 44800 },
    { _id: '4', type: 'sell', amount: 0.9, price: 46000 },
    { _id: '5', type: 'buy', amount: 5.0, price: null },
    { _id: '6', type: 'sell', amount: 2.3, price: null },
  ]);

  // Reference setters used by future real-data wiring.
  void setCryptoA;
  void setCryptoB;

  const handleFetchOrderBook = async () => {
    if (!cryptoA || !cryptoB) return;
    try {
      const data = (await fetchOrderBook(cryptoA, cryptoB)) as { orderBook?: OrderRow[] };
      if (data?.orderBook) setOrderBook(data.orderBook);
    } catch (error) {
      console.error('Error fetching order book:', error);
    }
  };

  useEffect(() => {
    handleFetchOrderBook();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePlaceOrder = async () => {
    if (!userId) {
      toast.error('You must be logged in to place an order.');
      return;
    }
    try {
      await placeOrder({
        orderType,
        orderMode,
        userId,
        cryptoA,
        cryptoB,
        amount,
        price,
      });

      toast.success('Order placed successfully!');
      handleFetchOrderBook();
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error(typeof error === 'string' ? error : 'Failed to place order');
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    try {
      await cancelOrder(orderId);
      toast.success('Order canceled successfully!');
      handleFetchOrderBook();
    } catch (error) {
      console.error('Error canceling order:', error);
      toast.error(typeof error === 'string' ? error : 'Failed to cancel order');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex flex-col items-center py-12 px-4 md:px-8 space-y-8">
      <div className="w-full bg-gray-800/60 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-700/50 hover:scale-[1.02] hover:shadow-xl transition-transform">
        <div className="p-8 space-y-6">
          <h2 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
            {tokenData.name} ({tokenData.symbol})
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center pb-3 border-b border-gray-700">
                <span className="text-gray-400">Current Price</span>
                <span className="font-semibold text-white">${tokenData.current_price}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-gray-700">
                <span className="text-gray-400">Market Cap</span>
                <span className="font-semibold text-white">{tokenData.market_cap}</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center pb-3 border-b border-gray-700">
                <span className="text-gray-400">24h Change</span>
                <span
                  className={`font-semibold ${
                    tokenData._24hr_change >= 0 ? 'text-green-500' : 'text-red-500'
                  }`}
                >
                  {tokenData._24hr_change}%
                </span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-gray-700">
                <span className="text-gray-400">24h Volume</span>
                <span className="font-semibold text-white">{tokenData._24hr_volume}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full bg-gray-800/60 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-700/50 p-6">
        <h3 className="text-3xl font-bold text-yellow-400 mb-4">Place Order</h3>
        <div className="flex flex-col space-y-4">
          <div className="flex space-x-4">
            <button
              onClick={() => setOrderType('buy')}
              className={`px-6 py-3 font-bold rounded-lg transition-all duration-300 ${
                orderType === 'buy'
                  ? 'bg-green-500 text-black'
                  : 'bg-green-700 text-white hover:bg-green-600'
              }`}
            >
              Buy
            </button>

            <button
              onClick={() => setOrderType('sell')}
              className={`px-6 py-3 font-bold rounded-lg transition-all duration-300 ${
                orderType === 'sell'
                  ? 'bg-red-500 text-black'
                  : 'bg-red-700 text-white hover:bg-red-600'
              }`}
            >
              Sell
            </button>
          </div>

          <select
            value={orderMode}
            onChange={(e) => setOrderMode(e.target.value as 'limit' | 'market')}
            className="p-3 rounded bg-gray-700"
          >
            <option value="limit">Limit Order</option>
            <option value="market">Market Order</option>
          </select>

          <input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="p-3 rounded bg-gray-700 text-white"
          />

          {orderMode === 'limit' && (
            <input
              type="number"
              placeholder="Price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="p-3 rounded bg-gray-700 text-white"
            />
          )}

          <button
            onClick={handlePlaceOrder}
            className="bg-yellow-500 p-3 rounded text-black font-bold hover:bg-yellow-600"
          >
            Place Order
          </button>
        </div>
      </div>

      <div className="w-full bg-gray-800/60 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-700/50 p-6">
        <h3 className="text-3xl font-bold text-yellow-400 mb-4">Order Book</h3>
        <table className="w-full text-left">
          <thead className="bg-gray-700/50 text-gray-300">
            <tr>
              <th className="px-4 py-3 font-semibold">Type</th>
              <th className="px-4 py-3 font-semibold">Amount</th>
              <th className="px-4 py-3 font-semibold">Price</th>
              <th className="px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orderBook.map((order) => (
              <tr key={order._id} className="border-b border-gray-700">
                <td className={order.type === 'buy' ? 'text-green-400' : 'text-red-400'}>
                  {order.type}
                </td>
                <td>{order.amount}</td>
                <td>${order.price ?? 'Market Price'}</td>
                <td>
                  <button
                    onClick={() => handleCancelOrder(order._id)}
                    className="bg-red-500 p-2 rounded text-black font-bold hover:bg-red-600"
                  >
                    Cancel
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TokenPage;
