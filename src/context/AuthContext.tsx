import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthUser {
  id: string;
}

interface IAuthContext {
  token: string | null;
  userId: string | null;
  isAuthenticated: boolean | null;
  user: AuthUser | null;
  login: (token: string, userId: string) => void;
  logout: () => void;
}

export const AuthContext = createContext<IAuthContext | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [userId, setUserId] = useState<string | null>(localStorage.getItem('userId'));
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUserId = localStorage.getItem('userId');

    if (storedToken && storedUserId) {
      setIsAuthenticated(true);
      setUser({ id: storedUserId });
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  const login = (newToken: string, newUserId: string) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('userId', newUserId);
    setToken(newToken);
    setUserId(newUserId);
    setIsAuthenticated(true);
    setUser({ id: newUserId });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    setToken(null);
    setUserId(null);
    setIsAuthenticated(false);
    setUser(null);
  };

  if (isAuthenticated === null) {
    return <div className="text-white">Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ token, userId, isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): IAuthContext => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export default AuthProvider;
