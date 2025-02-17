import { useState } from 'react';
import axios from 'axios';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      const response = await axios.post('http://localhost:3000/api/v1/users/forgot-password', { email });

      if (response.status === 200) {
        setMessage('Check your inbox for the password reset link.');
        // Optionally, you could also guide the user to check their spam folder.
      } else {
        setError(response.data.message || 'An error occurred. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="p-8 rounded-lg shadow-lg w-full max-w-md bg-gray-800">
        <h2 className="text-3xl text-yellow-400 font-bold mb-6 text-center">
          Forgot Password
        </h2>

        {message && (
          <p className="text-green-500 text-sm mb-4 text-center">{message}</p>
        )}
        {error && (
          <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              className="block text-gray-300 text-sm font-medium mb-1"
              htmlFor="email"
            >
              Enter your email
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

          <div className="text-center">
            <button
              type="submit"
              className="w-full text-white bg-gradient-to-br from-yellow-500 to-yellow-600 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-yellow-500 font-medium rounded-lg text-sm px-5 py-2.5 text-center mb-4"
            >
              Submit
            </button>
          </div>
        </form>

        <div className="text-center">
          <p className="text-white">
            Remember your password?{' '}
            <a href="/login" className="text-yellow-400 hover:text-white">
              Login here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
