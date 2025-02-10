import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchUserData } from "../api/user";

const UserProfile = () => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  let hideMenuTimeout;

  useEffect(() => {
    const getUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');

        if (!token || !userId) {
          navigate('/login');
          return;
        }

        const data = await fetchUserData(userId, token);
        if (data.status === 'success') {
          setUserData(data.data);
        } else {
          setError('Failed to fetch user data.');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    getUserData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    navigate("/login");
  };

  return (
    <div
      className="relative"
      onMouseEnter={() => {
        clearTimeout(hideMenuTimeout);
        setIsUserMenuOpen(true);
      }}
      onMouseLeave={() => {
        hideMenuTimeout = setTimeout(() => setIsUserMenuOpen(false), 300);
      }}
    >
      {/* Profile Icon */}
      <div
        className="w-10 h-10 bg-gray-300 rounded-full cursor-pointer flex items-center justify-center"
        onClick={() => navigate("/user-dashboard")}
      >
        <span className="text-gray-700 font-bold">
          {userData ? userData.user.first_name[0] : "U"}
        </span>
      </div>

      {/* Dropdown Menu */}
      {isUserMenuOpen && (
        <div
          className="absolute right-0 mt-2 w-56 bg-gray-900 text-white border border-gray-700 rounded-lg shadow-lg z-50"
          onMouseEnter={() => clearTimeout(hideMenuTimeout)}
          onMouseLeave={() => setIsUserMenuOpen(false)}
        >
          {loading ? (
            <div className="px-4 py-2 text-center">Loading...</div>
          ) : error ? (
            <div className="px-4 py-2 text-center text-red-500">{error}</div>
          ) : (
            <ul className="text-white">
              <li className="px-4 py-2 font-semibold border-b border-gray-700">
                {userData?.user.first_name} {userData?.user.last_name}
              </li>
              <li
                className="px-4 py-2 hover:bg-gray-800 cursor-pointer"
                onClick={() => navigate("/user-dashboard")}
              >
                My Profile
              </li>
              <li className="px-4 py-2 hover:bg-gray-800 cursor-pointer"
              onClick={() => navigate("/user-dashboard#settings")}
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
