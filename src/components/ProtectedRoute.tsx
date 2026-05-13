import { useContext, ReactElement } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

interface ProtectedRouteProps {
  element: ReactElement;
}

const ProtectedRoute = ({ element }: ProtectedRouteProps): ReactElement => {
  const auth = useContext(AuthContext);
  const isAuthenticated = auth?.isAuthenticated ?? false;

  return isAuthenticated ? element : <Navigate to="/login" />;
};

export default ProtectedRoute;
