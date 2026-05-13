interface Crypto {
  name: string;
  symbol: string;
  amount?: number;
  value?: number;
  price?: number;
  change?: number;
}

interface SortConfig {
  key: string | null;
  direction: 'asc' | 'desc';
}

interface CryptocurrencyTableProps {
  cryptocurrencies: Crypto[];
  sortConfig?: SortConfig;
  handleSort: (key: string) => void;
}

const CryptocurrencyTable = ({
  cryptocurrencies,
  handleSort,
}: CryptocurrencyTableProps) => {
  return (
    <div className="min-h-screen bg-black text-white flex justify-center">
      <div className="w-full max-w-6xl bg-gray-900 p-6 rounded-lg shadow-lg overflow-auto">
        <div className="flex items-center space-x-6 border-b border-gray-700 pb-3">
          <h2 className="text-2xl font-semibold text-white">Markets</h2>
        </div>

        <table className="w-full mt-4 border-collapse text-sm">
          <thead>
            <tr className="text-gray-400 border-b border-gray-700">
              <th
                className="px-4 py-3 text-left cursor-pointer"
                onClick={() => handleSort('name')}
              >
                Asset
              </th>
              <th className="px-4 py-3 text-left">Amount</th>
              <th className="px-4 py-3 text-left">Value (USD)</th>
              <th className="px-4 py-3 text-left">Price</th>
              <th className="px-4 py-3 text-left">24H Change</th>
              <th className="px-4 py-3 text-left">Trade</th>
            </tr>
          </thead>
          <tbody>
            {cryptocurrencies.map((crypto, index) => (
              <tr
                key={index}
                className="border-b border-gray-800 hover:bg-gray-800"
              >
                <td className="px-4 py-3 flex items-center space-x-2">
                  <div>
                    <p className="font-semibold text-white">{crypto.symbol}</p>
                    <p className="text-gray-500 text-xs">{crypto.name}</p>
                  </div>
                </td>
                <td className="px-4 py-3 text-white">{crypto.amount}</td>
                <td className="px-4 py-3 text-gray-300">${crypto.value}</td>
                <td className="px-4 py-3 text-gray-300">${crypto.price}</td>
                <td
                  className={`px-4 py-3 ${
                    (crypto.change ?? 0) >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {crypto.change}%
                </td>
                <td className="px-4 py-3">
                  <button className="text-yellow-400 hover:underline">
                    Trade
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

export default CryptocurrencyTable;
