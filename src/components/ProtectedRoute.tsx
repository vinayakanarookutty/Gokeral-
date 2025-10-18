import { Navigate } from 'react-router-dom';
import { authUtils } from '../utils/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  userType?: 'user' | 'driver';
}

export const ProtectedRoute = ({ children, userType }: ProtectedRouteProps) => {
  const isAuthenticated = authUtils.isAuthenticated();
  const currentUserType = authUtils.getUserType();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (userType && currentUserType !== userType) {
    const redirectPath = currentUserType === 'driver' ? '/driverProfile' : '/userDashboard';
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
};