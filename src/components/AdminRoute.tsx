import { ReactElement } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface AdminRouteProps {
  element: ReactElement;
}

const AdminRoute = ({ element }: AdminRouteProps): ReactElement => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" />;
  if (user?.role !== 'admin') return <Navigate to="/" />;

  return element;
};

export default AdminRoute;
