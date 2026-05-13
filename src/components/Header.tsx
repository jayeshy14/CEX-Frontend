import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BarChart2, Wallet, LogOut, User, ChevronDown, LayoutDashboard, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navigate = useNavigate();

  const openMenu = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setMenuOpen(true);
  };
  const closeMenu = () => {
    timeoutRef.current = setTimeout(() => setMenuOpen(false), 150);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initial = (user?.role === 'admin' ? 'A' : 'U');

  return (
    <header className="h-14 bg-bg-surface border-b border-border flex items-center px-6 shrink-0 z-50">
      <div className="flex items-center justify-between w-full max-w-screen-2xl mx-auto">
        {/* Logo */}
        <Link to="/" className="text-accent font-bold text-xl tracking-tight">
          TradeInSec
        </Link>

        {/* Nav */}
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/cryptocurrencies" className="flex items-center gap-1.5 text-text-secondary hover:text-text-primary text-sm font-medium transition-colors">
            <BarChart2 size={15} />
            Markets
          </Link>
          <Link to="/cryptocurrencies" className="flex items-center gap-1.5 text-text-secondary hover:text-text-primary text-sm font-medium transition-colors">
            <BarChart2 size={15} />
            Trade
          </Link>
          {isAuthenticated && (
            <Link to="/user-dashboard" className="flex items-center gap-1.5 text-text-secondary hover:text-text-primary text-sm font-medium transition-colors">
              <Wallet size={15} />
              Portfolio
            </Link>
          )}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <div
              className="relative"
              onMouseEnter={openMenu}
              onMouseLeave={closeMenu}
            >
              <button className="flex items-center gap-2 bg-bg-elevated hover:bg-border rounded-lg px-3 py-1.5 text-sm text-text-primary transition-colors">
                <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center text-bg text-xs font-bold">
                  {initial}
                </div>
                <ChevronDown size={14} className="text-text-secondary" />
              </button>

              {menuOpen && (
                <div
                  className="absolute right-0 top-full mt-1 w-52 bg-bg-surface border border-border rounded-xl shadow-2xl py-1 z-50"
                  onMouseEnter={openMenu}
                  onMouseLeave={closeMenu}
                >
                  <div className="px-4 py-2 border-b border-border">
                    <p className="text-xs text-text-muted">Signed in as</p>
                    <p className="text-sm text-text-primary font-medium capitalize">{user?.role}</p>
                  </div>
                  <Link
                    to="/user-dashboard"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors"
                  >
                    <LayoutDashboard size={15} /> Dashboard
                  </Link>
                  <Link
                    to="/deposit"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors"
                  >
                    <ArrowDownToLine size={15} /> Deposit
                  </Link>
                  <Link
                    to="/withdraw"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors"
                  >
                    <ArrowUpFromLine size={15} /> Withdraw
                  </Link>
                  {user?.role === 'admin' && (
                    <Link
                      to="/admin"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors"
                    >
                      <User size={15} /> Admin Panel
                    </Link>
                  )}
                  <div className="border-t border-border mt-1 pt-1">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-sell hover:bg-sell-muted w-full transition-colors"
                    >
                      <LogOut size={15} /> Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm text-text-secondary hover:text-text-primary font-medium px-4 py-1.5 border border-border rounded-lg hover:border-border-light transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="text-sm bg-accent hover:bg-accent-hover text-bg font-semibold px-4 py-1.5 rounded-lg transition-colors"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
