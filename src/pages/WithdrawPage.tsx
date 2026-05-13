import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { fetchMyWallet } from '../api/user';
import axiosInstance from '../api/axios';

interface TokenBalance {
  symbol: string;
  amount: number;
}

const WithdrawPage = () => {
  const [tokens, setTokens] = useState<TokenBalance[]>([]);
  const [usdBalance, setUsdBalance] = useState<number>(0);
  const [amount, setAmount] = useState<string>('');
  const [toAddress, setToAddress] = useState<string>('');
  const [selectedSymbol, setSelectedSymbol] = useState<string>('');
  const [chainName, setChainName] = useState<string>('');
  const [isCryptoWithdraw, setIsCryptoWithdraw] = useState<boolean>(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = (await fetchMyWallet()) as {
          status: string;
          data?: { wallet?: { usd_balance?: number; balances?: Record<string, number> } };
        };
        if (data.status === 'success' && data.data?.wallet) {
          setUsdBalance(data.data.wallet.usd_balance ?? 0);
          const balances = data.data.wallet.balances ?? {};
          setTokens(
            Object.entries(balances)
              .filter(([, amt]) => amt > 0)
              .map(([symbol, amt]) => ({ symbol, amount: amt }))
          );
        }
      } catch (error) {
        console.error('Error fetching wallet:', error);
      }
    };
    void load();
  }, []);

  const handleCryptoWithdraw = async () => {
    if (!selectedSymbol || !toAddress || !amount || !chainName) {
      toast.error('Please fill in all fields.');
      return;
    }

    const amountNum = parseFloat(amount);
    const token = tokens.find((t) => t.symbol === selectedSymbol);
    if (!token || amountNum > token.amount) {
      toast.error('Insufficient balance.');
      return;
    }

    setLoading(true);
    try {
      await axiosInstance.post('/withdrawals/withdraw', {
        toAddress,
        amount: amountNum,
        symbol: selectedSymbol,
        chainName,
      });
      toast.success(`Withdrawal of ${amount} ${selectedSymbol} submitted.`);
      setAmount('');
      setToAddress('');
    } catch (error) {
      console.error('Withdrawal failed:', error);
      toast.error('Withdrawal failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUSDWithdraw = () => {
    toast.info('USD withdrawal is not yet available.');
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
              className={`w-1/2 py-3 rounded-lg text-lg font-semibold transition ${!isCryptoWithdraw ? 'bg-yellow-500 text-black' : 'bg-gray-700 text-gray-300'}`}
            >
              Withdraw USD
            </button>
            <button
              onClick={() => setIsCryptoWithdraw(true)}
              className={`w-1/2 py-3 rounded-lg text-lg font-semibold transition ${isCryptoWithdraw ? 'bg-yellow-500 text-black' : 'bg-gray-700 text-gray-300'}`}
            >
              Withdraw Crypto
            </button>
          </div>

          {isCryptoWithdraw ? (
            <div className="space-y-6">
              <p className="text-gray-400 text-sm">USD Balance: ${usdBalance.toFixed(2)}</p>

              <select
                onChange={(e) => setSelectedSymbol(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white border border-gray-600 focus:ring-2 focus:ring-yellow-400"
              >
                <option value="">-- Select Token --</option>
                {tokens.map((t) => (
                  <option key={t.symbol} value={t.symbol}>
                    {t.symbol} (Balance: {t.amount})
                  </option>
                ))}
              </select>

              <input
                type="text"
                placeholder="Destination chain (e.g. Ethereum)"
                value={chainName}
                onChange={(e) => setChainName(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white border border-gray-600 focus:ring-2 focus:ring-yellow-400"
              />

              <input
                type="text"
                placeholder="Destination address"
                value={toAddress}
                onChange={(e) => setToAddress(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white border border-gray-600 focus:ring-2 focus:ring-yellow-400"
              />

              <input
                type="text"
                placeholder="Amount to withdraw"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white border border-gray-600 focus:ring-2 focus:ring-yellow-400"
              />

              <button
                onClick={() => void handleCryptoWithdraw()}
                disabled={!selectedSymbol || !toAddress || !amount || !chainName || loading}
                className="w-full py-3 bg-red-500 text-white font-semibold rounded-lg transition hover:bg-red-600 disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Withdraw Crypto'}
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
                disabled={!amount}
                className="w-full py-3 bg-red-500 text-white font-semibold rounded-lg transition hover:bg-red-600 disabled:opacity-50"
              >
                Withdraw USD
              </button>
            </div>
          )}
        </div>
      </main>

      <footer className="py-6 text-center">
        <a href="/user-dashboard" className="px-6 py-3 bg-gray-700 text-white font-semibold rounded-lg transition hover:bg-gray-600">
          Back to Dashboard
        </a>
      </footer>
    </div>
  );
};

export default WithdrawPage;
