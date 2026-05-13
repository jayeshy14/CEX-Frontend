import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchUserData } from '../api/user';

interface UserDataPayload {
  status: string;
  data: {
    user: {
      first_name?: string;
      last_name?: string;
      email?: string;
    };
  };
}

const UserProfile = () => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState<boolean>(false);
  const [userData, setUserData] = useState<UserDataPayload | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const hideMenuTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const getUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');

        if (!token || !userId) {
          navigate('/login');
          return;
        }

        const data = (await fetchUserData(userId, token)) as UserDataPayload;
        if (data?.status === 'success') {
          setUserData(data);
        } else {
          setError('Failed to fetch user data.');
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError(typeof err === 'string' ? err : 'Error fetching user data');
      } finally {
        setLoading(false);
      }
    };

    getUserData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    navigate('/login');
  };

  const firstName = userData?.data?.user?.first_name;
  const lastName = userData?.data?.user?.last_name;
  const initial = firstName?.[0] ?? '?';

  return (
    <div
      className="relative"
      onMouseEnter={() => {
        if (hideMenuTimeout.current) clearTimeout(hideMenuTimeout.current);
        setIsUserMenuOpen(true);
      }}
      onMouseLeave={() => {
        hideMenuTimeout.current = setTimeout(() => setIsUserMenuOpen(false), 300);
      }}
    >
      <div
        className="w-10 h-10 bg-gray-300 rounded-full cursor-pointer flex items-center justify-center"
        onClick={() => navigate('/user-dashboard')}
      >
        <span className="text-gray-700 font-bold">{initial}</span>
      </div>

      {isUserMenuOpen && (
        <div
          className="absolute right-0 mt-2 w-56 bg-gray-900 text-white border border-gray-700 rounded-lg shadow-lg z-50"
          onMouseEnter={() => {
            if (hideMenuTimeout.current) clearTimeout(hideMenuTimeout.current);
          }}
          onMouseLeave={() => setIsUserMenuOpen(false)}
        >
          {loading ? (
            <div className="px-4 py-2 text-center">Loading...</div>
          ) : error ? (
            <div className="px-4 py-2 text-center text-red-500">{error}</div>
          ) : (
            <ul className="text-white">
              <li className="px-4 py-2 font-semibold border-b border-gray-700">
                {firstName} {lastName}
              </li>
              <li
                className="px-4 py-2 hover:bg-gray-800 cursor-pointer"
                onClick={() => navigate('/user-dashboard')}
              >
                My Profile
              </li>
              <li
                className="px-4 py-2 hover:bg-gray-800 cursor-pointer"
                onClick={() => navigate('/user-dashboard#settings')}
              >
                Settings
              </li>
              <li
                className="px-4 py-2 hover:bg-gray-800 cursor-pointer"
                onClick={handleLogout}
              >
                Logout
              </li>
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default UserProfile;
