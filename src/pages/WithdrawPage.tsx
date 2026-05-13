import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { ArrowUpFromLine } from 'lucide-react';
import { fetchMyWallet } from '../api/user';
import axiosInstance from '../api/axios';

interface TokenBalance { symbol: string; amount: number; }

const inputCls = 'w-full bg-bg border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent transition-colors';
const labelCls = 'block text-text-secondary text-xs mb-1.5';

const WithdrawPage = () => {
  const [tokens, setTokens] = useState<TokenBalance[]>([]);
  const [usdBalance, setUsdBalance] = useState(0);
  const [isCrypto, setIsCrypto] = useState(true);
  const [selectedSymbol, setSelectedSymbol] = useState('');
  const [chainName, setChainName] = useState('');
  const [toAddress, setToAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = (await fetchMyWallet()) as { status: string; data?: { wallet?: { usd_balance?: number; balances?: Record<string, number> } } };
        if (data.status === 'success' && data.data?.wallet) {
          setUsdBalance(data.data.wallet.usd_balance ?? 0);
          setTokens(Object.entries(data.data.wallet.balances ?? {}).filter(([, v]) => v > 0).map(([symbol, amount]) => ({ symbol, amount })));
        }
      } catch { console.error('Failed to load wallet'); }
    };
    void load();
  }, []);

  const handleWithdraw = async () => {
    if (!selectedSymbol || !toAddress || !amount || !chainName) {
      toast.error('Please fill in all fields');
      return;
    }
    const amtNum = parseFloat(amount);
    const token = tokens.find((t) => t.symbol === selectedSymbol);
    if (!token || amtNum > token.amount) {
      toast.error('Insufficient balance');
      return;
    }
    setLoading(true);
    try {
      await axiosInstance.post('/withdrawals/withdraw', { toAddress, amount: amtNum, symbol: selectedSymbol, chainName });
      toast.success(`Withdrawal of ${amount} ${selectedSymbol} submitted`);
      setAmount(''); setToAddress('');
    } catch { toast.error('Withdrawal failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-sell-muted flex items-center justify-center">
            <ArrowUpFromLine size={20} className="text-sell" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-text-primary">Withdraw Funds</h1>
            <p className="text-text-secondary text-sm">Send funds from your trading account</p>
          </div>
        </div>

        <div className="flex bg-bg-elevated rounded-xl p-1 mb-6">
          <button onClick={() => setIsCrypto(true)} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${isCrypto ? 'bg-bg-surface text-text-primary shadow' : 'text-text-secondary hover:text-text-primary'}`}>Crypto</button>
          <button onClick={() => setIsCrypto(false)} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${!isCrypto ? 'bg-bg-surface text-text-primary shadow' : 'text-text-secondary hover:text-text-primary'}`}>USD</button>
        </div>

        <div className="bg-bg-surface border border-border rounded-xl p-6 space-y-4">
          {isCrypto ? (
            <>
              <div>
                <label className={labelCls}>Select Asset</label>
                <select className={inputCls} onChange={(e) => setSelectedSymbol(e.target.value)}>
                  <option value="">— Select asset —</option>
                  {tokens.map((t) => <option key={t.symbol} value={t.symbol}>{t.symbol} (Balance: {t.amount})</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Destination Chain</label>
                <input type="text" placeholder="e.g. Ethereum" value={chainName} onChange={(e) => setChainName(e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Destination Address</label>
                <input type="text" placeholder="0x..." value={toAddress} onChange={(e) => setToAddress(e.target.value)} className={`${inputCls} font-mono text-xs`} />
              </div>
              <div>
                <label className={labelCls}>Amount</label>
                <input type="number" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} className={inputCls} />
              </div>
              <p className="text-text-muted text-xs">USD Balance: ${usdBalance.toFixed(2)}</p>
              <button
                onClick={() => void handleWithdraw()}
                disabled={!selectedSymbol || !toAddress || !amount || !chainName || loading}
                className="w-full bg-sell hover:bg-sell-hover text-white font-semibold py-3 rounded-xl text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing…' : `Withdraw ${selectedSymbol || 'Crypto'}`}
              </button>
            </>
          ) : (
            <div className="py-8 text-center">
              <p className="text-text-secondary text-sm">USD withdrawals are coming soon.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WithdrawPage;
