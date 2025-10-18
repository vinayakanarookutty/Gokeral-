import { useState, useEffect } from 'react';
import { authUtils } from '../utils/auth';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userType, setUserType] = useState<'user' | 'driver' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const authenticated = authUtils.isAuthenticated();
      const type = authUtils.getUserType();
      
      setIsAuthenticated(authenticated);
      setUserType(type);
      setLoading(false);
    };

    checkAuth();
  }, []);

  const logout = () => {
    authUtils.removeToken();
    setIsAuthenticated(false);
    setUserType(null);
  };

  return {
    isAuthenticated,
    userType,
    loading,
    logout
  };
};