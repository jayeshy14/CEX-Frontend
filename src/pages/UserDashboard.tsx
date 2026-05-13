import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Wallet, ClipboardList, Clock, ArrowDownToLine, ArrowUpFromLine, LogOut } from 'lucide-react';
import { fetchUserData, fetchMyWallet, fetchMyOrders } from '../api/user';
import { useAuth } from '../context/AuthContext';

type Section = 'overview' | 'portfolio' | 'open-orders' | 'history';
interface Token { symbol: string; amount: number; }
interface Order {
  _id: string;
  cryptocurrency_id_A: string;
  cryptocurrency_id_B: string;
  type?: string;
  amount: number;
  price: number;
  status: string;
  createdAt?: string;
}
interface UserInfo { first_name?: string; last_name?: string; email?: string; }

const NAV: { id: Section; label: string; icon: React.ReactNode }[] = [
  { id: 'overview',    label: 'Overview',      icon: <LayoutDashboard size={16} /> },
  { id: 'portfolio',   label: 'Portfolio',     icon: <Wallet size={16} /> },
  { id: 'open-orders', label: 'Open Orders',   icon: <ClipboardList size={16} /> },
  { id: 'history',     label: 'Order History', icon: <Clock size={16} /> },
];

const StatCard = ({ label, value, sub }: { label: string; value: string; sub?: string }) => (
  <div className="bg-bg-surface border border-border rounded-xl p-6">
    <p className="text-text-secondary text-sm">{label}</p>
    <p className="text-2xl font-bold text-text-primary mt-1 font-mono">{value}</p>
    {sub && <p className="text-text-muted text-xs mt-0.5">{sub}</p>}
  </div>
);

const UserDashboard = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [section, setSection] = useState<Section>('overview');
  const [user, setUser] = useState<UserInfo>({});
  const [usdBalance, setUsdBalance] = useState(0);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [openOrders, setOpenOrders] = useState<Order[]>([]);
  const [history, setHistory] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    if (!token || !userId) { navigate('/login'); return; }
    const load = async () => {
      try {
        const [userData, walletData, ordersData] = await Promise.allSettled([
          fetchUserData(userId, token),
          fetchMyWallet(),
          fetchMyOrders(),
        ]);
        if (userData.status === 'fulfilled') {
          const d = userData.value as { status: string; data?: { user?: UserInfo } };
          if (d.status === 'success') setUser(d.data?.user ?? {});
        }
        if (walletData.status === 'fulfilled') {
          const d = walletData.value as { status: string; data?: { wallet?: { usd_balance?: number; balances?: Record<string, number> } } };
          if (d.status === 'success' && d.data?.wallet) {
            setUsdBalance(d.data.wallet.usd_balance ?? 0);
            setTokens(Object.entries(d.data.wallet.balances ?? {}).filter(([, v]) => v > 0).map(([symbol, amount]) => ({ symbol, amount })));
          }
        }
        if (ordersData.status === 'fulfilled') {
          const d = ordersData.value as { status: string; data?: { orders?: Order[] } };
          if (d.status === 'success' && d.data?.orders) {
            setOpenOrders(d.data.orders.filter((o) => o.status === 'open'));
            setHistory(d.data.orders.filter((o) => o.status !== 'open'));
          }
        }
      } finally { setLoading(false); }
    };
    void load();
  }, [navigate]);

  const handleLogout = () => { logout(); navigate('/login'); };

  if (loading) return <div className="min-h-screen bg-bg flex items-center justify-center text-text-secondary">Loading…</div>;

  return (
    <div className="flex min-h-screen bg-bg">
      <aside className="w-56 bg-bg-surface border-r border-border flex flex-col shrink-0 sticky top-0 h-screen">
        <div className="p-6 border-b border-border">
          <Link to="/" className="text-accent font-bold text-lg">TradeInSec</Link>
          <p className="text-text-secondary text-xs mt-1 truncate">{user.first_name} {user.last_name}</p>
        </div>
        <nav className="flex-1 p-3">
          {NAV.map((item) => (
            <button key={item.id} onClick={() => setSection(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors mb-0.5 ${section === item.id ? 'bg-accent-muted text-accent' : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated'}`}>
              {item.icon} {item.label}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-border">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sell hover:bg-sell-muted transition-colors">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      <div className="flex-1 p-8 overflow-auto">
        {section === 'overview' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-text-primary">Overview</h1>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCard label="USD Balance" value={`$${usdBalance.toFixed(2)}`} sub="Available to trade" />
              <StatCard label="Token Holdings" value={String(tokens.length)} sub="Unique assets" />
              <StatCard label="Open Orders" value={String(openOrders.length)} sub="Active" />
            </div>
            <div className="flex gap-3">
              <Link to="/deposit" className="flex items-center gap-2 bg-buy hover:bg-buy-hover text-bg font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors">
                <ArrowDownToLine size={15} /> Deposit
              </Link>
              <Link to="/withdraw" className="flex items-center gap-2 bg-sell hover:bg-sell-hover text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors">
                <ArrowUpFromLine size={15} /> Withdraw
              </Link>
            </div>
          </div>
        )}

        {section === 'portfolio' && (
          <div className="space-y-4">
            <h1 className="text-2xl font-bold text-text-primary">Portfolio</h1>
            <div className="bg-bg-surface border border-border rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead><tr className="bg-bg-elevated text-text-secondary text-xs uppercase">
                  <th className="px-6 py-3 text-left">Asset</th>
                  <th className="px-6 py-3 text-right">Balance</th>
                  <th className="px-6 py-3 text-right">Action</th>
                </tr></thead>
                <tbody>
                  {tokens.length === 0
                    ? <tr><td colSpan={3} className="px-6 py-12 text-center text-text-muted">No token balances yet</td></tr>
                    : tokens.map((t) => (
                      <tr key={t.symbol} className="border-t border-border hover:bg-bg-elevated/50">
                        <td className="px-6 py-4 text-text-primary font-medium">{t.symbol}</td>
                        <td className="px-6 py-4 text-right font-mono text-text-primary">{t.amount}</td>
                        <td className="px-6 py-4 text-right"><Link to={`/token/${t.symbol}/USDT`} className="text-accent text-xs hover:underline">Trade</Link></td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {section === 'open-orders' && (
          <div className="space-y-4">
            <h1 className="text-2xl font-bold text-text-primary">Open Orders</h1>
            <div className="bg-bg-surface border border-border rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead><tr className="bg-bg-elevated text-text-secondary text-xs uppercase">
                  <th className="px-6 py-3 text-left">Pair</th>
                  <th className="px-6 py-3 text-left">Type</th>
                  <th className="px-6 py-3 text-right">Amount</th>
                  <th className="px-6 py-3 text-right">Price</th>
                  <th className="px-6 py-3 text-right">Status</th>
                </tr></thead>
                <tbody>
                  {openOrders.length === 0
                    ? <tr><td colSpan={5} className="px-6 py-12 text-center text-text-muted">No open orders</td></tr>
                    : openOrders.map((o) => (
                      <tr key={o._id} className="border-t border-border hover:bg-bg-elevated/50">
                        <td className="px-6 py-4 text-text-primary font-mono text-xs">{String(o.cryptocurrency_id_A)}/{String(o.cryptocurrency_id_B)}</td>
                        <td className="px-6 py-4"><span className={`text-xs font-semibold ${o.type === 'buy' ? 'text-buy' : 'text-sell'}`}>{(o.type ?? '').toUpperCase()}</span></td>
                        <td className="px-6 py-4 text-right font-mono text-text-primary">{o.amount}</td>
                        <td className="px-6 py-4 text-right font-mono text-text-primary">{o.price}</td>
                        <td className="px-6 py-4 text-right"><span className="bg-accent-muted text-accent text-xs px-2 py-0.5 rounded-full">{o.status}</span></td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {section === 'history' && (
          <div className="space-y-4">
            <h1 className="text-2xl font-bold text-text-primary">Order History</h1>
            <div className="bg-bg-surface border border-border rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead><tr className="bg-bg-elevated text-text-secondary text-xs uppercase">
                  <th className="px-6 py-3 text-left">Pair</th>
                  <th className="px-6 py-3 text-left">Type</th>
                  <th className="px-6 py-3 text-right">Amount</th>
                  <th className="px-6 py-3 text-right">Price</th>
                  <th className="px-6 py-3 text-right">Status</th>
                  <th className="px-6 py-3 text-right">Date</th>
                </tr></thead>
                <tbody>
                  {history.length === 0
                    ? <tr><td colSpan={6} className="px-6 py-12 text-center text-text-muted">No history</td></tr>
                    : history.map((o) => (
                      <tr key={o._id} className="border-t border-border hover:bg-bg-elevated/50">
                        <td className="px-6 py-4 font-mono text-xs text-text-primary">{String(o.cryptocurrency_id_A)}/{String(o.cryptocurrency_id_B)}</td>
                        <td className="px-6 py-4"><span className={`text-xs font-semibold ${o.type === 'buy' ? 'text-buy' : 'text-sell'}`}>{(o.type ?? '').toUpperCase()}</span></td>
                        <td className="px-6 py-4 text-right font-mono text-text-primary">{o.amount}</td>
                        <td className="px-6 py-4 text-right font-mono text-text-primary">{o.price}</td>
                        <td className="px-6 py-4 text-right"><span className={`text-xs px-2 py-0.5 rounded-full ${o.status === 'filled' ? 'bg-buy-muted text-buy' : 'bg-bg-elevated text-text-secondary'}`}>{o.status}</span></td>
                        <td className="px-6 py-4 text-right text-text-muted text-xs">{o.createdAt ? new Date(o.createdAt).toLocaleDateString() : '—'}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
