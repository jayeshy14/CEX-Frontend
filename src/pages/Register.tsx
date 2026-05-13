import { useState } from 'react';
import { toast } from 'react-toastify';
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { firstName, lastName, phoneNumber, email, password, confirmPassword } = userData;

    if (password.trim() !== confirmPassword.trim()) {
      setError('Passwords do not match!');
      toast.error('Passwords do not match!');
      return;
    }

    try {
      await registerUser({ firstName, lastName, phoneNumber, email, password, confirmPassword });
      toast.success('Registration successful!');
      setUserData({ firstName: '', lastName: '', phoneNumber: '', email: '', password: '', confirmPassword: '' });
    } catch (err) {
      const msg = typeof err === 'string' ? err : 'Registration failed';
      setError(msg);
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="p-8 rounded-lg shadow-lg w-full max-w-screen-md bg-gray-800">
        <h2 className="text-3xl text-yellow-400 text-center font-bold mb-6">Register</h2>
        {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}

        <form onSubmit={handleSubmit}>
          {(['firstName', 'lastName', 'email', 'phoneNumber'] as const).map((field) => (
            <div key={field} className="mb-4">
              <label className="block text-gray-300 mb-1 capitalize">{field.replace(/([A-Z])/g, ' $1')}</label>
              <input
                type={field === 'email' ? 'email' : 'text'}
                name={field}
                value={userData[field]}
                onChange={handleChange}
                required
                className="border border-gray-600 p-3 w-full rounded-md bg-gray-700 text-white"
              />
            </div>
          ))}
          {(['password', 'confirmPassword'] as const).map((field) => (
            <div key={field} className="mb-4">
              <label className="block text-gray-300 mb-1 capitalize">{field.replace(/([A-Z])/g, ' $1')}</label>
              <input
                type="password"
                name={field}
                value={userData[field]}
                onChange={handleChange}
                required
                className="border border-gray-600 p-3 w-full rounded-md bg-gray-700 text-white"
              />
            </div>
          ))}

          <div className="text-center">
            <button
              type="submit"
              className="text-white bg-gradient-to-br from-yellow-500 to-yellow-600 hover:bg-gradient-to-bl font-medium rounded-lg text-sm px-5 py-2.5 text-center mb-4"
            >
              Register
            </button>
          </div>
        </form>
        <div className="text-center flex justify-center items-center text-white">
          <span>Existing User? </span>
          <a href="/login" className="text-yellow-400 ml-1">Login here!</a>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
