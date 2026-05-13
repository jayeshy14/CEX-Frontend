import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { toast } from 'react-toastify';
import { ArrowDownToLine } from 'lucide-react';
import { depositCrypto } from '../utils/deposit-crypto/depositCrypto';
import ConnectButton from '../components/ConnectButton';
import { fetchCryptocurrencies } from '../api/cryptocurrencies';


interface ChainOption { chain_name: string; }
interface DepositCrypto { name: string; symbol: string; chains: ChainOption[]; }
interface CryptosResponse { status: string; data?: { cryptocurrencies?: DepositCrypto[] }; }

const inputCls = 'w-full bg-bg border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent transition-colors';
const labelCls = 'block text-text-secondary text-xs mb-1.5';

const DepositPage = () => {
  const [cryptos, setCryptos] = useState<DepositCrypto[]>([]);
  const [selectedCrypto, setSelectedCrypto] = useState<DepositCrypto | null>(null);
  const [selectedChain, setSelectedChain] = useState('');
  const [amount, setAmount] = useState('');
  const [isCrypto, setIsCrypto] = useState(true);
  const [signer, setEthereumSigner] = useState<ethers.Signer | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = (await fetchCryptocurrencies()) as CryptosResponse;
        if (data.status === 'success' && data.data?.cryptocurrencies) {
          setCryptos(data.data.cryptocurrencies);
        }
      } catch { toast.error('Failed to load cryptocurrencies'); }
    };
    void load();
  }, []);

  const handleDeposit = async () => {
    if (!selectedCrypto || !selectedChain || !amount) {
      toast.error('Please fill in all fields');
      return;
    }
    await depositCrypto(selectedCrypto.symbol, selectedChain, amount, signer as ethers.Signer | null, undefined);
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-buy-muted flex items-center justify-center">
            <ArrowDownToLine size={20} className="text-buy" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-text-primary">Deposit Funds</h1>
            <p className="text-text-secondary text-sm">Add funds to your trading account</p>
          </div>
        </div>

        {/* Tab toggle */}
        <div className="flex bg-bg-elevated rounded-xl p-1 mb-6">
          <button onClick={() => setIsCrypto(true)} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${isCrypto ? 'bg-bg-surface text-text-primary shadow' : 'text-text-secondary hover:text-text-primary'}`}>
            Crypto
          </button>
          <button onClick={() => setIsCrypto(false)} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${!isCrypto ? 'bg-bg-surface text-text-primary shadow' : 'text-text-secondary hover:text-text-primary'}`}>
            USD
          </button>
        </div>

        <div className="bg-bg-surface border border-border rounded-xl p-6 space-y-4">
          {isCrypto ? (
            <>
              <div>
                <label className={labelCls}>Select Asset</label>
                <select
                  className={inputCls}
                  onChange={(e) => {
                    const c = cryptos.find((x) => x.symbol === e.target.value) ?? null;
                    setSelectedCrypto(c);
                    setSelectedChain('');
                  }}
                >
                  <option value="">— Select asset —</option>
                  {cryptos.map((c) => <option key={c.symbol} value={c.symbol}>{c.name} ({c.symbol})</option>)}
                </select>
              </div>

              {selectedCrypto && (
                <div>
                  <label className={labelCls}>Select Chain</label>
                  <select className={inputCls} onChange={(e) => setSelectedChain(e.target.value)}>
                    <option value="">— Select chain —</option>
                    {selectedCrypto.chains.map((ch) => <option key={ch.chain_name} value={ch.chain_name}>{ch.chain_name}</option>)}
                  </select>
                </div>
              )}

              <div>
                <label className={labelCls}>Amount</label>
                <input type="number" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} className={inputCls} />
              </div>

              <ConnectButton selectedChain={selectedChain} setEthereumSigner={setEthereumSigner} />

              <button
                onClick={() => void handleDeposit()}
                disabled={!selectedCrypto || !selectedChain || !amount}
                className="w-full bg-buy hover:bg-buy-hover text-bg font-semibold py-3 rounded-xl text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Deposit {selectedCrypto?.symbol ?? 'Crypto'}
              </button>
            </>
          ) : (
            <div className="py-8 text-center">
              <p className="text-text-secondary text-sm">USD deposits are coming soon.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DepositPage;
