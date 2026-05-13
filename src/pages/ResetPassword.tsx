import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axios';

const ResetPassword = () => {
  const { token } = useParams<{ token: string }>();
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      setError('Please fill in both password fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const response = await axiosInstance.post<{ message?: string }>(
        `/users/reset-password/${token}`,
        { password }
      );

      if (response.status === 200) {
        setMessage('Password reset successfully. You can now login.');
        setTimeout(() => navigate('/login'), 3000);
      } else {
        setError(response.data?.message || 'An error occurred. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="p-8 rounded-lg shadow-lg w-full max-w-md bg-gray-800">
        <h2 className="text-3xl text-yellow-400 font-bold mb-6 text-center">Reset Password</h2>

        {message && <p className="text-green-500 text-sm mb-4 text-center">{message}</p>}
        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-300 text-sm font-medium mb-1" htmlFor="password">
              New Password
            </label>
            <input
              type="password"
              id="password"
              className="w-full px-4 py-2 border border-gray-600 bg-gray-700 text-white rounded-md focus:ring focus:ring-yellow-500 focus:outline-none"
              value={password}
              placeholder="Enter new password"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label
              className="block text-gray-300 text-sm font-medium mb-1"
              htmlFor="confirmPassword"
            >
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              className="w-full px-4 py-2 border border-gray-600 bg-gray-700 text-white rounded-md focus:ring focus:ring-yellow-500 focus:outline-none"
              value={confirmPassword}
              placeholder="Confirm new password"
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <div className="text-center">
            <button
              type="submit"
              className="w-full text-white bg-gradient-to-br from-yellow-500 to-yellow-600 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-yellow-500 font-medium rounded-lg text-sm px-5 py-2.5 text-center mb-4"
            >
              Reset Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
