import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthUser {
  id: string;
  role: string;
}

interface IAuthContext {
  token: string | null;
  userId: string | null;
  isAuthenticated: boolean | null;
  user: AuthUser | null;
  login: (token: string, userId: string, role: string) => void;
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
    const storedRole = localStorage.getItem('role') ?? 'user';

    if (storedToken && storedUserId) {
      setIsAuthenticated(true);
      setUser({ id: storedUserId, role: storedRole });
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  const login = (newToken: string, newUserId: string, role: string) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('userId', newUserId);
    localStorage.setItem('role', role);
    setToken(newToken);
    setUserId(newUserId);
    setIsAuthenticated(true);
    setUser({ id: newUserId, role });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('role');
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
