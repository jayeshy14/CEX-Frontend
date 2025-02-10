import React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null); // null instead of false
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");

    if (token && userId) {
      setIsAuthenticated(true);
      setUser({ id: userId });
    } else {
      setIsAuthenticated(false); // Explicitly set false if not authenticated
    }
  }, []);

  const login = (token, userId) => {
    localStorage.setItem("token", token);
    localStorage.setItem("userId", userId);
    setIsAuthenticated(true);
    setUser({ id: userId });
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    setIsAuthenticated(false);
    setUser(null);
  };

  if (isAuthenticated === null) {
    return <div className="text-white">Loading...</div>; // Prevent flashing logged-out state
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;