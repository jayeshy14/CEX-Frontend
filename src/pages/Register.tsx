import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { registerUser } from '../api/user';

const inputCls = 'w-full bg-bg border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent transition-colors';
const labelCls = 'block text-text-secondary text-xs mb-1.5';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phoneNumber: '', password: '', confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await registerUser({
        firstName: form.firstName,
        lastName: form.lastName,
        phoneNumber: form.phoneNumber,
        email: form.email,
        password: form.password,
        confirmPassword: form.confirmPassword,
      });
      toast.success('Account created! Please sign in.');
      navigate('/login');
    } catch (err) {
      const msg = typeof err === 'string' ? err : 'Registration failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link to="/" className="text-accent font-bold text-2xl">TradeInSec</Link>
          <p className="text-text-secondary text-sm mt-2">Create your trading account</p>
        </div>

        <div className="bg-bg-surface border border-border rounded-xl p-8">
          {error && (
            <div className="bg-sell-muted border border-sell/30 text-sell text-sm rounded-lg px-4 py-3 mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>First Name</label>
                <input type="text" name="firstName" value={form.firstName} onChange={handleChange} placeholder="John" className={inputCls} required />
              </div>
              <div>
                <label className={labelCls}>Last Name</label>
                <input type="text" name="lastName" value={form.lastName} onChange={handleChange} placeholder="Doe" className={inputCls} required />
              </div>
            </div>
            <div>
              <label className={labelCls}>Email</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@example.com" className={inputCls} required />
            </div>
            <div>
              <label className={labelCls}>Phone Number</label>
              <input type="tel" name="phoneNumber" value={form.phoneNumber} onChange={handleChange} placeholder="+1 555 000 0000" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Password</label>
              <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="••••••••" className={inputCls} required />
            </div>
            <div>
              <label className={labelCls}>Confirm Password</label>
              <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} placeholder="••••••••" className={inputCls} required />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent hover:bg-accent-hover text-bg font-semibold py-3 rounded-xl text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed mt-2"
            >
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>
        </div>

        <p className="text-center text-text-secondary text-sm mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-accent hover:text-accent-hover transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
