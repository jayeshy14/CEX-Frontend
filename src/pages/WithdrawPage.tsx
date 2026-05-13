import { useState, useEffect } from 'react';
import { fetchCryptocurrencies } from '../api/cryptocurrencies';

interface ChainOption {
  chain_name: string;
}

interface WithdrawCrypto {
  name: string;
  symbol: string;
  amount: number;
  chains: ChainOption[];
}

const WithdrawPage = () => {
  const [cryptocurrencies] = useState<WithdrawCrypto[]>([
    { name: 'Ethereum', symbol: 'ETH', amount: 1.5, chains: [{ chain_name: 'ETHEREUM' }, { chain_name: 'SOLANA' }, { chain_name: 'POLYGON' }, { chain_name: 'BSC' }] },
    { name: 'Bitcoin', symbol: 'BTC', amount: 0.2, chains: [{ chain_name: 'BITCOIN' }] },
    { name: 'Solana', symbol: 'SOL', amount: 20, chains: [{ chain_name: 'SOLANA' }] },
    { name: 'Binance Coin', symbol: 'BNB', amount: 5, chains: [{ chain_name: 'BSC' }] },
    { name: 'Polygon', symbol: 'MATIC', amount: 100, chains: [{ chain_name: 'POLYGON' }] },
    { name: 'Cardano', symbol: 'ADA', amount: 250, chains: [{ chain_name: 'CARDANO' }] },
    { name: 'Dogecoin', symbol: 'DOGE', amount: 10000, chains: [{ chain_name: 'DOGECOIN' }] },
    { name: 'Litecoin', symbol: 'LTC', amount: 2, chains: [{ chain_name: 'LITECOIN' }] },
    { name: 'Chainlink', symbol: 'LINK', amount: 50, chains: [{ chain_name: 'ETHEREUM' }] },
    { name: 'Avalanche', symbol: 'AVAX', amount: 12, chains: [{ chain_name: 'AVALANCHE' }] },
  ]);
  const [amount, setAmount] = useState<string>('');
  const [isCryptoWithdraw, setIsCryptoWithdraw] = useState<boolean>(true);
  const [selectedCrypto, setSelectedCrypto] = useState<WithdrawCrypto | null>(null);
  const [selectedChain, setSelectedChain] = useState<string>('');
  const [usdBalance, setUsdBalance] = useState<number>(0);

  useEffect(() => {
    const fetchCryptos = async () => {
      try {
        await fetchCryptocurrencies();
      } catch (error) {
        console.error('Error fetching cryptocurrencies:', error);
      }
    };
    fetchCryptos();
  }, []);

  const handleWithdraw = async () => {
    if (parseFloat(amount) > usdBalance) {
      alert('Insufficient balance');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/user/withdraw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token ?? ''}`,
        },
        body: JSON.stringify({ amount: parseFloat(amount) }),
      });

      await response.json();
    } catch (error) {
      console.error('Withdrawal failed:', error);
    }
  };

  // Reference the setter so it stays usable for future real-data wiring.
  void setUsdBalance;
  void handleWithdraw;

  const handleCryptoWithdraw = () => {
    alert('Crypto Withdraw functionality is being handled!');
  };

  const handleUSDWithdraw = () => {
    alert('USD Withdraw functionality is being handled!');
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <header className="bg-gray-900 py-6 shadow-md">
        <div className="max-w-6xl mx-auto px-6">
          <h1 className="text-4xl text-center font-bold text-yellow-400">Withdraw Funds</h1>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-4xl bg-gray-900 p-8 rounded-lg shadow-lg">
          <div className="flex justify-center gap-8 mb-8">
            <button
              onClick={() => setIsCryptoWithdraw(false)}
              className={`w-1/2 py-3 rounded-lg text-lg font-semibold transition ${
                !isCryptoWithdraw ? 'bg-yellow-500 text-black' : 'bg-gray-700 text-gray-300'
              }`}
            >
              Withdraw USD
            </button>
            <button
              onClick={() => setIsCryptoWithdraw(true)}
              className={`w-1/2 py-3 rounded-lg text-lg font-semibold transition ${
                isCryptoWithdraw ? 'bg-yellow-500 text-black' : 'bg-gray-700 text-gray-300'
              }`}
            >
              Withdraw Crypto
            </button>
          </div>

          {isCryptoWithdraw ? (
            <div className="space-y-6">
              <select
                onChange={(e) => {
                  const selected = cryptocurrencies.find((t) => t.symbol === e.target.value);
                  setSelectedCrypto(selected ?? null);
                  setSelectedChain('');
                }}
                className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white border border-gray-600 focus:ring-2 focus:ring-yellow-400"
              >
                <option value="">-- Select Crypto --</option>
                {cryptocurrencies.map((crypto) => (
                  <option key={crypto.symbol} value={crypto.symbol}>
                    {crypto.name} ({crypto.symbol})
                  </option>
                ))}
              </select>

              <select
                onChange={(e) => setSelectedChain(e.target.value)}
                disabled={!selectedCrypto}
                className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white border border-gray-600 focus:ring-2 focus:ring-yellow-400 disabled:opacity-50"
              >
                <option value="">-- Select Chain --</option>
                {selectedCrypto?.chains.map((chain) => (
                  <option key={chain.chain_name} value={chain.chain_name}>
                    {chain.chain_name}
                  </option>
                ))}
              </select>

              <input
                type="text"
                placeholder="Amount to withdraw"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white border border-gray-600 focus:ring-2 focus:ring-yellow-400"
              />

              <button
                onClick={handleCryptoWithdraw}
                className="w-full py-3 bg-red-500 text-white font-semibold rounded-lg transition hover:bg-red-600 disabled:opacity-50"
                disabled={!selectedCrypto || !selectedChain || !amount}
              >
                Withdraw Crypto
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <input
                type="number"
                placeholder="Amount to withdraw"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white border border-gray-600 focus:ring-2 focus:ring-yellow-400"
              />
              <button
                onClick={handleUSDWithdraw}
                className="w-full py-3 bg-red-500 text-white font-semibold rounded-lg transition hover:bg-red-600 disabled:opacity-50"
                disabled={!amount}
              >
                Withdraw USD
              </button>
            </div>
          )}
        </div>
      </main>

      <footer className="py-6 text-center">
        <a
          href="/user-dashboard"
          className="px-6 py-3 bg-gray-700 text-white font-semibold rounded-lg transition hover:bg-gray-600"
        >
          Back to Dashboard
        </a>
      </footer>
    </div>
  );
};

export default WithdrawPage;
