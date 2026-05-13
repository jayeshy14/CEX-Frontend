import { useState, useEffect } from 'react';
import { addCrypto, removeCrypto } from '../api/admin';
import { fetchCryptocurrencies } from '../api/cryptocurrencies';

interface AdminCrypto {
  name: string;
  symbol: string;
  address: string;
  liquidity: string;
}

interface CryptosResponse {
  status: string;
  cryptos?: AdminCrypto[];
}

const AdminPanel = () => {
  const [cryptos, setCryptos] = useState<AdminCrypto[]>([]);
  const [newCrypto, setNewCrypto] = useState<AdminCrypto>({
    name: '',
    symbol: '',
    address: '',
    liquidity: '',
  });
  const [isAddingCrypto, setIsAddingCrypto] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const fetchCryptos = async () => {
    try {
      const data = (await fetchCryptocurrencies()) as CryptosResponse;
      if (data.status === 'success' && data.cryptos) {
        setCryptos(data.cryptos);
      }
    } catch (err) {
      console.error('Error fetching cryptocurrencies:', err);
    }
  };

  useEffect(() => {
    fetchCryptos();
  }, []);

  const handleAddCrypto = async () => {
    try {
      const token = localStorage.getItem('token') ?? '';
      const result = (await addCrypto(newCrypto, token)) as { status?: string };

      if (result?.status === 'success') {
        fetchCryptos();
        setNewCrypto({ name: '', symbol: '', address: '', liquidity: '' });
        setIsAddingCrypto(false);
      }
    } catch (err) {
      console.error('Error adding cryptocurrency:', err);
      setError(typeof err === 'string' ? err : 'Failed to add cryptocurrency');
    }
  };

  const handleRemoveCrypto = async (symbol: string) => {
    try {
      const token = localStorage.getItem('token') ?? '';
      const result = (await removeCrypto(symbol, token)) as { status?: string };

      if (result?.status === 'success') {
        fetchCryptos();
      }
    } catch (err) {
      console.error('Error removing cryptocurrency:', err);
      setError(typeof err === 'string' ? err : 'Failed to remove cryptocurrency');
    }
  };

  return (
    <div className="min-h-screen flex bg-black">
      <aside className="w-64 bg-gray-800 text-white p-6 flex flex-col">
        <h2 className="text-2xl font-semibold text-yellow-400">Admin Panel</h2>
        <nav className="mt-8 flex-1">
          <ul className="space-y-4">
            {[{ id: 'cryptos', label: 'Cryptocurrencies' }].map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className="block px-4 py-2 rounded hover:text-yellow-400"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <div className="flex-1 bg-gray-900 p-8 overflow-auto">
        <h2 className="text-3xl font-semibold text-yellow-400 text-center">
          Listed Cryptocurrencies
        </h2>
        {error && <p className="text-red-500 text-center mt-2">{error}</p>}
        <div className="flex justify-between mt-6">
          <button
            onClick={() => setIsAddingCrypto(true)}
            className="px-4 py-2 bg-yellow-400 text-black rounded-md hover:bg-yellow-500"
          >
            Add Crypto
          </button>
        </div>

        <table className="min-w-full bg-gray-800 border border-gray-700 rounded-lg shadow-sm mt-6">
          <thead>
            <tr className="text-gray-300 bg-gray-700">
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Symbol</th>
              <th className="px-4 py-3 text-left">Wallet Address</th>
              <th className="px-4 py-3 text-left">Liquidity</th>
              <th className="px-4 py-3 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {cryptos.map((crypto, index) => (
              <tr key={index} className="border-b border-gray-700 text-white">
                <td className="px-4 py-3">{crypto.name}</td>
                <td className="px-4 py-3">{crypto.symbol}</td>
                <td className="px-4 py-3">{crypto.address}</td>
                <td className="px-4 py-3">{crypto.liquidity}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleRemoveCrypto(crypto.symbol)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {isAddingCrypto && (
        <div className="fixed inset-0 flex justify-center items-center bg-gray-700 bg-opacity-75">
          <div className="bg-gray-800 p-6 rounded-lg shadow-xl text-yellow-400 w-96">
            <h3 className="text-xl font-bold mb-4">Add New Cryptocurrency</h3>

            <input
              type="text"
              placeholder="Name"
              value={newCrypto.name}
              onChange={(e) => setNewCrypto({ ...newCrypto, name: e.target.value })}
              className="px-4 py-2 bg-gray-700 border border-yellow-500 rounded mb-4 w-full text-yellow-400 placeholder-yellow-500"
            />

            <input
              type="text"
              placeholder="Symbol"
              value={newCrypto.symbol}
              onChange={(e) => setNewCrypto({ ...newCrypto, symbol: e.target.value })}
              className="px-4 py-2 bg-gray-700 border border-yellow-500 rounded mb-4 w-full text-yellow-400 placeholder-yellow-500"
            />

            <input
              type="text"
              placeholder="Wallet Address"
              value={newCrypto.address}
              onChange={(e) => setNewCrypto({ ...newCrypto, address: e.target.value })}
              className="px-4 py-2 bg-gray-700 border border-yellow-500 rounded mb-4 w-full text-yellow-400 placeholder-yellow-500"
            />

            <input
              type="text"
              placeholder="Initial Liquidity"
              value={newCrypto.liquidity}
              onChange={(e) => setNewCrypto({ ...newCrypto, liquidity: e.target.value })}
              className="px-4 py-2 bg-gray-700 border border-yellow-500 rounded mb-4 w-full text-yellow-400 placeholder-yellow-500"
            />

            <button
              onClick={handleAddCrypto}
              className="px-4 py-2 bg-yellow-500 text-gray-900 rounded w-full"
            >
              Add
            </button>

            <button
              onClick={() => setIsAddingCrypto(false)}
              className="px-4 py-2 bg-gray-600 text-yellow-400 rounded w-full mt-4 flex items-center justify-center"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
