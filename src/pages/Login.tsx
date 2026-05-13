import { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { loginUser } from '../api/user';

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
    if (isAuthenticated) {
      navigate('/user-dashboard');
    }
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
      setError(typeof err === 'string' ? err : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="p-8 rounded-lg shadow-lg w-full max-w-md bg-gray-800">
        <h2 className="text-3xl text-yellow-400 font-bold mb-6 text-center">Login</h2>

        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-gray-300 text-sm font-medium mb-1" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              id="email"
              className="w-full px-4 py-2 border border-gray-600 bg-gray-700 text-white rounded-md focus:ring focus:ring-yellow-500 focus:outline-none"
              value={email}
              placeholder="example@ex.com"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-300 text-sm font-medium mb-1" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              id="password"
              className="w-full px-4 py-2 border border-gray-600 bg-gray-700 text-white rounded-md focus:ring focus:ring-yellow-500 focus:outline-none"
              value={password}
              placeholder="Enter password"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <div className="text-red-500 text-sm mb-4">{error}</div>}

          <button
            type="submit"
            className="w-full text-white bg-gradient-to-br from-yellow-500 to-yellow-600 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-yellow-500 font-medium rounded-lg text-sm px-5 py-2.5 text-center mb-4"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>

          <Link to="/forgot-password">
            <button
              type="button"
              className="w-full text-yellow-400 bg-transparent hover:text-white font-medium rounded-lg text-sm px-5 py-2.5 text-center transition-all duration-300 mb-4"
            >
              Forgot Password?
            </button>
          </Link>
        </form>

        <div className="text-center mt-4">
          <p className="text-white">
            New user?{' '}
            <Link to="/register" className="text-yellow-400 ml-1">
              Register here!
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
