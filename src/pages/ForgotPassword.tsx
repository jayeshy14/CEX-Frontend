import { useState } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../api/axios';

const inputCls = 'w-full bg-bg border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent transition-colors';
const labelCls = 'block text-text-secondary text-xs mb-1.5';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await axiosInstance.post('/users/forgot-password', { email });
      setSent(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link to="/" className="text-accent font-bold text-2xl">TradeInSec</Link>
          <p className="text-text-secondary text-sm mt-2">Reset your password</p>
        </div>

        <div className="bg-bg-surface border border-border rounded-xl p-8">
          {sent ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 rounded-full bg-buy-muted flex items-center justify-center mx-auto mb-4">
                <span className="text-buy text-xl">✓</span>
              </div>
              <p className="text-text-primary font-medium mb-2">Check your inbox</p>
              <p className="text-text-secondary text-sm">
                If <span className="text-text-primary">{email}</span> has an account, a reset link has been sent.
              </p>
            </div>
          ) : (
            <>
              {error && (
                <div className="bg-sell-muted border border-sell/30 text-sell text-sm rounded-lg px-4 py-3 mb-6">
                  {error}
                </div>
              )}
              <p className="text-text-secondary text-sm mb-6">
                Enter your email and we'll send you a link to reset your password.
              </p>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className={labelCls} htmlFor="email">Email address</label>
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
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-accent hover:bg-accent-hover text-bg font-semibold py-3 rounded-xl text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {loading ? 'Sending…' : 'Send Reset Link'}
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-text-secondary text-sm mt-6">
          Remember it?{' '}
          <Link to="/login" className="text-accent hover:text-accent-hover transition-colors">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
