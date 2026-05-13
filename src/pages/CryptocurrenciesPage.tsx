import { useState, useEffect } from 'react';
import { fetchCryptocurrencies } from '../api/cryptocurrencies';

interface MarketCrypto {
  name: string;
  symbol: string;
  price: number;
  change: number;
}

interface SortConfig {
  key: keyof MarketCrypto | null;
  direction: 'asc' | 'desc';
}

interface CryptosResponse {
  status: string;
  data?: { cryptocurrencies?: Array<{ name: string; symbol: string; current_price: number }> };
}

const CryptocurrencyPage = () => {
  const [cryptocurrencies, setCryptocurrencies] = useState<MarketCrypto[]>([]);

  const [selectedCrypto, setSelectedCrypto] = useState<MarketCrypto | null>(null);
  const [tradeAmount, setTradeAmount] = useState<string>('');
  const [isTradeOpen, setIsTradeOpen] = useState<boolean>(false);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: 'asc' });

  useEffect(() => {
    const fetchCryptos = async () => {
      try {
        const data = (await fetchCryptocurrencies()) as CryptosResponse;
        if (data.status === 'success' && data.data?.cryptocurrencies) {
          setCryptocurrencies(
            data.data.cryptocurrencies.map((c) => ({
              name: c.name,
              symbol: c.symbol,
              price: c.current_price,
              change: 0,
            }))
          );
        }
      } catch (error) {
        console.error('Error fetching cryptocurrencies:', error);
      }
    };

    fetchCryptos();
  }, []);

  const handleSort = (key: keyof MarketCrypto) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });

    const sortedData = [...cryptocurrencies].sort((a, b) => {
      const av = a[key];
      const bv = b[key];
      if (av < bv) return direction === 'asc' ? -1 : 1;
      if (av > bv) return direction === 'asc' ? 1 : -1;
      return 0;
    });

    setCryptocurrencies(sortedData);
  };

  return (
    <div className="min-h-screen w-full bg-gray-900 text-white">
      <div className="w-full bg-gray-900 p-6 rounded-lg shadow-lg overflow-auto">
        <div className="text-center border-b border-gray-700 pb-4">
          <h2 className="text-3xl font-semibold text-yellow-400">Cryptocurrency Market</h2>
        </div>

        <table className="w-full mt-4 border-collapse text-sm">
          <thead>
            <tr className="text-gray-400 border-b border-gray-700">
              <th
                className="px-4 py-3 text-left cursor-pointer"
                onClick={() => handleSort('name')}
              >
                Name {sortConfig.key === 'name' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
              </th>
              <th
                className="px-4 py-3 text-left cursor-pointer"
                onClick={() => handleSort('symbol')}
              >
                Symbol{' '}
                {sortConfig.key === 'symbol' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
              </th>
              <th
                className="px-4 py-3 text-left cursor-pointer"
                onClick={() => handleSort('price')}
              >
                Price (USD){' '}
                {sortConfig.key === 'price' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
              </th>
              <th
                className="px-4 py-3 text-left cursor-pointer"
                onClick={() => handleSort('change')}
              >
                Change (%){' '}
                {sortConfig.key === 'change' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
              </th>
              <th className="px-4 py-3 text-left">Trade</th>
            </tr>
          </thead>
          <tbody>
            {cryptocurrencies.map((crypto, index) => (
              <tr key={index} className="border-b border-gray-800 hover:bg-gray-800">
                <td className="px-4 py-3 font-semibold text-white">{crypto.name}</td>
                <td className="px-4 py-3 text-gray-300">{crypto.symbol}</td>
                <td className="px-4 py-3 text-gray-300">${crypto.price}</td>
                <td
                  className={`px-4 py-3 ${
                    crypto.change >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {crypto.change}%
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => {
                      setSelectedCrypto(crypto);
                      setIsTradeOpen(true);
                    }}
                    className="text-yellow-400 hover:underline"
                  >
                    Trade
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {isTradeOpen && selectedCrypto && (
          <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
            <div className="bg-gray-900 p-6 rounded-lg max-w-md w-full shadow-lg">
              <h3 className="text-xl font-bold mb-4 text-yellow-400">
                Trade {selectedCrypto.name} ({selectedCrypto.symbol})
              </h3>
              <input
                type="number"
                value={tradeAmount}
                onChange={(e) => setTradeAmount(e.target.value)}
                placeholder="Enter amount"
                className="px-4 py-2 bg-gray-800 border border-gray-700 rounded mb-4 w-full text-white"
              />
              <div className="flex space-x-4">
                <button
                  onClick={() => alert('Buying')}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg w-full hover:bg-green-700"
                >
                  Buy
                </button>
                <button
                  onClick={() => alert('Selling')}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg w-full hover:bg-red-700"
                >
                  Sell
                </button>
              </div>
              <button
                onClick={() => setIsTradeOpen(false)}
                className="w-full mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CryptocurrencyPage;
