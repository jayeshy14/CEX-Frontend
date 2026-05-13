import { useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import UserProfile from './UserProfile';

const Header = () => {
  const auth = useContext(AuthContext);
  const isAuthenticated = auth?.isAuthenticated ?? false;
  const location = useLocation();

  const isAuthPage =
    location.pathname === '/login' || location.pathname === '/register';

  return (
    <header className="bg-gray-800 text-yellow-400 p-4 flex justify-between items-center shadow-lg">
      <a href={'/'} className="text-3xl font-bold">
        TradeInSec
      </a>
      <div className="flex items-center gap-4">
        <div className="hidden xl:flex space-x-5 items-center"></div>
        {!isAuthPage && (
          <>
            {isAuthenticated ? (
              <UserProfile />
            ) : (
              <>
                <a
                  href="/login"
                  className="bg-yellow-400 text-black px-6 py-3 rounded-lg hover:bg-yellow-500 transition ease-in-out"
                >
                  Login
                </a>
                <a
                  href="/register"
                  className="bg-yellow-400 text-black px-6 py-3 rounded-lg hover:bg-yellow-500 transition ease-in-out"
                >
                  Register
                </a>
              </>
            )}
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
