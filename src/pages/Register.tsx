import { useState } from 'react';
import { registerUser } from '../api/user';

interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
}

const RegisterPage = () => {
  const [userData, setUserData] = useState<RegisterFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserData({
      ...userData,
      [e.target.name]: e.target.value,
    });

    if (error) {
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { firstName, lastName, phoneNumber, email, password, confirmPassword } = userData;

    console.log('Registering user with:', { firstName, lastName, phoneNumber, email });

    if (password.trim() !== confirmPassword.trim()) {
      setError('Passwords do not match!');
      alert('Passwords do not match!');
      return;
    }

    try {
      await registerUser({
        firstName,
        lastName,
        phoneNumber,
        email,
        password,
        confirmPassword,
      });

      setSuccess('Registration successful!');
      alert('Registration successful!');

      setUserData({
        firstName: '',
        lastName: '',
        phoneNumber: '',
        email: '',
        password: '',
        confirmPassword: '',
      });
    } catch (err) {
      console.error('Error during registration:', err);
      const msg = typeof err === 'string' ? err : 'Registration failed';
      setError(msg);
      alert(msg);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="p-8 rounded-lg shadow-lg w-full max-w-screen-md bg-gray-800">
        <h2 className="text-3xl text-yellow-400 text-center font-bold mb-6">Register</h2>
        {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}
        {success && <p className="text-green-500 text-sm text-center mb-4">{success}</p>}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-300 mb-1">First Name</label>
            <input
              type="text"
              name="firstName"
              value={userData.firstName}
              onChange={handleChange}
              placeholder="Enter First Name"
              required
              className="border border-gray-600 p-3 w-full rounded-md bg-gray-700 text-white"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-300 mb-1">Last Name</label>
            <input
              type="text"
              name="lastName"
              value={userData.lastName}
              onChange={handleChange}
              placeholder="Enter Last Name"
              required
              className="border border-gray-600 p-3 w-full rounded-md bg-gray-700 text-white"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-300 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={userData.email}
              onChange={handleChange}
              placeholder="example@ex.com"
              required
              className="border border-gray-600 p-3 w-full rounded-md bg-gray-700 text-white"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-300 mb-1">Phone Number</label>
            <input
              type="text"
              name="phoneNumber"
              value={userData.phoneNumber}
              onChange={handleChange}
              placeholder="+1893289424"
              required
              className="border border-gray-600 p-3 w-full rounded-md bg-gray-700 text-white"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-300 mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={userData.password}
              onChange={handleChange}
              placeholder="Enter Password"
              required
              className="border border-gray-600 p-3 w-full rounded-md bg-gray-700 text-white"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-300 mb-1">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={userData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm Password"
              required
              className="border border-gray-600 p-3 w-full rounded-md bg-gray-700 text-white"
            />
          </div>

          <div className="text-center">
            <button
              type="submit"
              className="text-white bg-gradient-to-br from-yellow-500 to-yellow-600 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-yellow-500 font-medium rounded-lg text-sm px-5 py-2.5 text-center mb-4"
            >
              Register
            </button>
          </div>
        </form>
        <div className="text-center">
          <div className="flex justify-center items-center text-white">
            <span>Existing User? </span>
            <a href="/login" className="text-yellow-400 ml-1">
              Login here!
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
