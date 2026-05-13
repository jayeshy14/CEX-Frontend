import { useState, useEffect, ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { fetchUserData, fetchMyWallet, fetchMyOrders } from '../api/user';
import { fetchCryptocurrencies } from '../api/cryptocurrencies';

interface UserState {
  firstName: string;
  lastName: string;
  email: string;
}

interface Token {
  symbol: string;
  amount: number;
}

interface OrderRow {
  _id: string;
  cryptocurrency_id_A: string;
  cryptocurrency_id_B: string;
  amount: number;
  price: number;
  status: string;
  created_at?: string;
}

interface DashboardCrypto {
  name: string;
  symbol: string;
  chains: Array<{ chain_name: string }>;
}

interface SortConfig {
  key: keyof DashboardCrypto | string;
  direction: 'asc' | 'desc';
}

const UserDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState<UserState>({ firstName: '', lastName: '', email: '' });
  const [usdBalance, setUsdBalance] = useState<number>(0);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [openOrders, setOpenOrders] = useState<OrderRow[]>([]);
  const [orderHistory, setOrderHistory] = useState<OrderRow[]>([]);
  const [cryptocurrencies, setCryptocurrencies] = useState<DashboardCrypto[]>([]);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'name', direction: 'asc' });
  const [loading, setLoading] = useState(true);

  const handleSort = (key: keyof DashboardCrypto) => {
    const direction: 'asc' | 'desc' =
      sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    setSortConfig({ key, direction });
    setCryptocurrencies((prev) =>
      [...prev].sort((a, b) => {
        const av = a[key] as unknown as string | number;
        const bv = b[key] as unknown as string | number;
        if (av < bv) return direction === 'asc' ? -1 : 1;
        if (av > bv) return direction === 'asc' ? 1 : -1;
        return 0;
      })
    );
  };

  void handleSort;

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');

    if (!token || !userId) {
      navigate('/login');
      return;
    }

    const load = async () => {
      try {
        setLoading(true);
        const [userData, walletData, ordersData, cryptosData] = await Promise.allSettled([
          fetchUserData(userId, token),
          fetchMyWallet(),
          fetchMyOrders(),
          fetchCryptocurrencies(),
        ]);

        if (userData.status === 'fulfilled') {
          const d = userData.value as { status: string; data?: { user?: { first_name?: string; last_name?: string; email?: string } } };
          if (d.status === 'success' && d.data?.user) {
            setUser({
              firstName: d.data.user.first_name ?? '',
              lastName: d.data.user.last_name ?? '',
              email: d.data.user.email ?? '',
            });
          }
        }

        if (walletData.status === 'fulfilled') {
          const d = walletData.value as { status: string; data?: { wallet?: { usd_balance?: number; balances?: Record<string, number> } } };
          if (d.status === 'success' && d.data?.wallet) {
            setUsdBalance(d.data.wallet.usd_balance ?? 0);
            const balances = d.data.wallet.balances ?? {};
            setTokens(
              Object.entries(balances)
                .filter(([, amount]) => amount > 0)
                .map(([symbol, amount]) => ({ symbol, amount }))
            );
          }
        }

        if (ordersData.status === 'fulfilled') {
          const d = ordersData.value as { status: string; data?: { orders?: OrderRow[] } };
          if (d.status === 'success' && d.data?.orders) {
            setOpenOrders(d.data.orders.filter((o) => o.status === 'open'));
            setOrderHistory(d.data.orders.filter((o) => o.status !== 'open'));
          }
        }

        if (cryptosData.status === 'fulfilled') {
          const d = cryptosData.value as { status: string; cryptos?: DashboardCrypto[] };
          if (d.status === 'success') {
            setCryptocurrencies(d.cryptos ?? []);
          }
        }
      } catch (error) {
        console.error('Dashboard load error:', error);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [navigate]);

  useEffect(() => {
    const section = location.hash.replace('#', '');
    if (section) setActiveSection(section);
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-black">
      <aside className="w-64 bg-gray-800 text-white p-6 flex flex-col">
        <a href="/" className="text-2xl font-semibold text-yellow-400">
          TradeInSec
        </a>
        <nav className="mt-8 flex-1">
          <ul className="space-y-4">
            {[
              { id: 'my-tokens', label: 'My Tokens' },
              { id: 'open-orders', label: 'Open Orders' },
              { id: 'order-history', label: 'Order History' },
              { id: 'settings', label: 'Settings' },
            ].map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  onClick={() => setActiveSection(item.id)}
                  className={`block px-4 py-2 rounded transition-colors ${
                    activeSection === item.id
                      ? 'bg-yellow-400 text-black font-bold'
                      : 'hover:bg-gray-700 hover:text-yellow-400'
                  }`}
                  aria-current={activeSection === item.id ? 'page' : undefined}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <button
          onClick={handleLogout}
          className="mt-auto w-full px-4 py-2 bg-red-600 hover:bg-red-700 transition-all duration-200 text-white rounded"
        >
          Logout
        </button>
      </aside>

      <div className="flex-1 bg-gray-900 p-8 overflow-auto">
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-semibold text-yellow-400">
              {user.firstName} {user.lastName}
            </h2>
            <p className="text-gray-300">Email: {user.email}</p>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg shadow-md flex items-center justify-between border border-gray-700">
            <div>
              <h3 className="text-xl font-medium text-gray-300">USD Balance</h3>
              <p className="text-2xl font-bold text-white">${usdBalance.toFixed(2)}</p>
            </div>
            <div className="space-x-4">
              <a href="/deposit" className="px-6 py-3 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700">
                Deposit
              </a>
              <a href="/withdraw" className="px-6 py-3 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700">
                Withdraw
              </a>
            </div>
          </div>

          {activeSection === 'my-tokens' && (
            <SectionContainer title="My Tokens">
              <StyledTable
                headers={['Symbol', 'Amount']}
                data={tokens.map((t) => [t.symbol, t.amount])}
              />
            </SectionContainer>
          )}

          {activeSection === 'open-orders' && (
            <SectionContainer title="Open Orders">
              <StyledTable
                headers={['Pair', 'Amount', 'Price', 'Status']}
                data={openOrders.map((o) => [
                  `${String(o.cryptocurrency_id_A)}/${String(o.cryptocurrency_id_B)}`,
                  o.amount,
                  o.price,
                  o.status,
                ])}
              />
            </SectionContainer>
          )}

          {activeSection === 'order-history' && (
            <SectionContainer title="Order History">
              <StyledTable
                headers={['Pair', 'Amount', 'Price', 'Status', 'Date']}
                data={orderHistory.map((o) => [
                  `${String(o.cryptocurrency_id_A)}/${String(o.cryptocurrency_id_B)}`,
                  o.amount,
                  o.price,
                  o.status,
                  o.created_at ? new Date(o.created_at).toLocaleDateString() : '',
                ])}
              />
            </SectionContainer>
          )}

          {activeSection === 'settings' && (
            <SectionContainer title="Settings">
              <p className="text-gray-400">Configure your preferences here.</p>
            </SectionContainer>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;

interface SectionContainerProps {
  title: string;
  children: ReactNode;
}

const SectionContainer = ({ title, children }: SectionContainerProps) => (
  <div className="mt-8">
    <h2 className="text-2xl font-semibold text-yellow-400 mb-4">{title}</h2>
    {children}
  </div>
);

type TableCell = string | number;

interface StyledTableProps {
  headers: string[];
  data: TableCell[][];
}

const StyledTable = ({ headers, data }: StyledTableProps) => (
  <div className="min-h-screen bg-black text-white flex justify-center">
    <div className="w-full max-w-6xl bg-gray-900 p-6 rounded-lg shadow-lg overflow-auto">
      <table className="w-full mt-4 border-collapse text-sm">
        <thead>
          <tr className="text-gray-400 bg-gray-800 border-b border-gray-700">
            {headers.map((header, index) => (
              <th key={index} className="px-4 py-3 text-left">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((row, rowIndex) => (
              <tr key={rowIndex} className="border-b border-gray-800 hover:bg-gray-800">
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="px-4 py-3 text-white">
                    {cell}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={headers.length} className="px-4 py-3 text-center text-gray-400">
                No data available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);
