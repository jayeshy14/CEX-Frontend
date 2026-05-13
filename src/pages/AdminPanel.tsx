import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Plus, Trash2, X } from 'lucide-react';
import { toast } from 'react-toastify';
import { addCrypto, removeCrypto } from '../api/admin';
import { fetchCryptocurrencies } from '../api/cryptocurrencies';

interface Crypto { _id: string; name: string; symbol: string; current_price: number; }
interface FetchResponse { status: string; data?: { cryptocurrencies: Crypto[] }; }

const inputCls = 'w-full bg-bg border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent transition-colors';
const labelCls = 'block text-text-secondary text-xs mb-1.5';

const AdminPanel = () => {
  const [cryptos, setCryptos] = useState<Crypto[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newCrypto, setNewCrypto] = useState({ name: '', symbol: '', current_price: '' });
  const [loading, setLoading] = useState(false);

  const loadCryptos = async () => {
    try {
      const data = (await fetchCryptocurrencies()) as FetchResponse;
      if (data.status === 'success' && data.data?.cryptocurrencies) {
        setCryptos(data.data.cryptocurrencies);
      }
    } catch { toast.error('Failed to load cryptocurrencies'); }
  };

  useEffect(() => { void loadCryptos(); }, []);

  const handleAdd = async () => {
    if (!newCrypto.name || !newCrypto.symbol || !newCrypto.current_price) {
      toast.error('Fill in all fields'); return;
    }
    setLoading(true);
    try {
      const result = (await addCrypto({
        name: newCrypto.name,
        symbol: newCrypto.symbol.toUpperCase(),
        current_price: parseFloat(newCrypto.current_price),
      })) as { status?: string };
      if (result?.status === 'success') {
        toast.success(`${newCrypto.symbol.toUpperCase()} added`);
        setNewCrypto({ name: '', symbol: '', current_price: '' });
        setShowModal(false);
        await loadCryptos();
      }
    } catch (err) {
      toast.error(typeof err === 'string' ? err : 'Failed to add');
    } finally { setLoading(false); }
  };

  const handleRemove = async (symbol: string) => {
    try {
      await removeCrypto(symbol);
      toast.success(`${symbol} removed`);
      await loadCryptos();
    } catch (err) {
      toast.error(typeof err === 'string' ? err : 'Failed to remove');
    }
  };

  return (
    <div className="flex min-h-screen bg-bg">
      {/* Sidebar */}
      <aside className="w-52 bg-bg-surface border-r border-border flex flex-col shrink-0 sticky top-0 h-screen">
        <div className="p-6 border-b border-border">
          <Link to="/" className="text-accent font-bold text-lg">TradeInSec</Link>
          <div className="flex items-center gap-1.5 mt-2">
            <Shield size={12} className="text-sell" />
            <span className="text-sell text-xs font-medium">Admin</span>
          </div>
        </div>
        <nav className="flex-1 p-3">
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium bg-accent-muted text-accent">
            Cryptocurrencies
          </button>
        </nav>
      </aside>

      {/* Main */}
      <div className="flex-1 p-8 overflow-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Cryptocurrencies</h1>
            <p className="text-text-secondary text-sm mt-0.5">{cryptos.length} assets listed</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-bg font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors"
          >
            <Plus size={15} /> Add Asset
          </button>
        </div>

        <div className="bg-bg-surface border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-bg-elevated text-text-secondary text-xs uppercase">
                <th className="px-6 py-3 text-left">Asset</th>
                <th className="px-6 py-3 text-left">Symbol</th>
                <th className="px-6 py-3 text-right">Price (USD)</th>
                <th className="px-6 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {cryptos.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-16 text-center text-text-muted">No assets yet</td></tr>
              ) : (
                cryptos.map((c) => (
                  <tr key={c._id} className="border-t border-border hover:bg-bg-elevated/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-bg-elevated flex items-center justify-center text-xs font-bold text-accent">
                          {c.symbol.slice(0, 2)}
                        </div>
                        <span className="text-text-primary font-medium">{c.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-text-secondary font-mono">{c.symbol}</td>
                    <td className="px-6 py-4 text-right font-mono text-text-primary">
                      ${c.current_price < 0.01
                        ? c.current_price.toFixed(8)
                        : c.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => void handleRemove(c.symbol)}
                        className="flex items-center gap-1.5 text-sell hover:text-sell-hover text-xs font-medium ml-auto transition-colors"
                      >
                        <Trash2 size={13} /> Remove
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="bg-bg-surface border border-border rounded-xl p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-text-primary font-semibold">Add New Asset</h2>
              <button onClick={() => setShowModal(false)} className="text-text-muted hover:text-text-primary">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className={labelCls}>Name</label>
                <input type="text" placeholder="Bitcoin" value={newCrypto.name} onChange={(e) => setNewCrypto({ ...newCrypto, name: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Symbol</label>
                <input type="text" placeholder="BTC" value={newCrypto.symbol} onChange={(e) => setNewCrypto({ ...newCrypto, symbol: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Current Price (USD)</label>
                <input type="number" placeholder="95000" value={newCrypto.current_price} onChange={(e) => setNewCrypto({ ...newCrypto, current_price: e.target.value })} className={inputCls} />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl text-sm font-medium text-text-secondary border border-border hover:bg-bg-elevated transition-colors">
                  Cancel
                </button>
                <button onClick={() => void handleAdd()} disabled={loading} className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-accent hover:bg-accent-hover text-bg transition-colors disabled:opacity-40">
                  {loading ? 'Adding…' : 'Add'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
