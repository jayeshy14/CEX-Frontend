import { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { loginUser } from '../api/user';

const inputCls = 'w-full bg-bg border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent transition-colors';
const labelCls = 'block text-text-secondary text-xs mb-1.5';

const LoginPage = () => {
  const auth = useContext(AuthContext);
  const isAuthenticated = auth?.isAuthenticated ?? false;
  const login = auth?.login;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) navigate('/user-dashboard');
  }, [isAuthenticated, navigate]);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await loginUser(email, password);
      login?.(data.token, data.userId, data.role ?? 'user');
      navigate('/user-dashboard');
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link to="/" className="text-accent font-bold text-2xl">TradeInSec</Link>
          <p className="text-text-secondary text-sm mt-2">Sign in to your account</p>
        </div>

        <div className="bg-bg-surface border border-border rounded-xl p-8">
          {error && (
            <div className="bg-sell-muted border border-sell/30 text-sell text-sm rounded-lg px-4 py-3 mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className={labelCls} htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputCls}
                required
              />
            </div>
            <div>
              <label className={labelCls} htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputCls}
                required
              />
            </div>

            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-accent text-xs hover:text-accent-hover transition-colors">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent hover:bg-accent-hover text-bg font-semibold py-3 rounded-xl text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="text-center text-text-secondary text-sm mt-6">
          No account?{' '}
          <Link to="/register" className="text-accent hover:text-accent-hover transition-colors">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
