import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axios';

const inputCls = 'w-full bg-bg border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent transition-colors';
const labelCls = 'block text-text-secondary text-xs mb-1.5';

const ResetPassword = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (password !== confirmPassword) { setError('Passwords do not match'); return; }
    setLoading(true);
    setError('');
    try {
      await axiosInstance.post(`/users/reset-password/${token}`, { password });
      setDone(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch {
      setError('Reset failed. The link may be expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link to="/" className="text-accent font-bold text-2xl">TradeInSec</Link>
          <p className="text-text-secondary text-sm mt-2">Set a new password</p>
        </div>

        <div className="bg-bg-surface border border-border rounded-xl p-8">
          {done ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 rounded-full bg-buy-muted flex items-center justify-center mx-auto mb-4">
                <span className="text-buy text-xl">✓</span>
              </div>
              <p className="text-text-primary font-medium mb-2">Password updated</p>
              <p className="text-text-secondary text-sm">Redirecting you to sign in…</p>
            </div>
          ) : (
            <>
              {error && (
                <div className="bg-sell-muted border border-sell/30 text-sell text-sm rounded-lg px-4 py-3 mb-6">
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className={labelCls} htmlFor="password">New Password</label>
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
                <div>
                  <label className={labelCls} htmlFor="confirmPassword">Confirm Password</label>
                  <input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={inputCls}
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-accent hover:bg-accent-hover text-bg font-semibold py-3 rounded-xl text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {loading ? 'Updating…' : 'Update Password'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
