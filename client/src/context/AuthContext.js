import { createContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState({
    isSubscribed: false,
    status: 'inactive',
    endDate: null,
  });

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      checkSubscriptionStatus();
    }
    setIsLoading(false);
  }, []);

  // Register user
  const register = async (userData) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.register(userData);
      setUser(response);
      setIsLoading(false);
      return response;
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
      throw err;
    }
  };

  // Login user
  const login = async (userData) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.login(userData);
      setUser(response);
      if (response.isSubscribed) {
        await checkSubscriptionStatus();
      }
      setIsLoading(false);
      return response;
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
      throw err;
    }
  };

  // Logout user
  const logout = () => {
    authService.logout();
    setUser(null);
    setSubscriptionStatus({
      isSubscribed: false,
      status: 'inactive',
      endDate: null,
    });
  };

  // Check subscription status
  const checkSubscriptionStatus = async () => {
    try {
      const status = await authService.getSubscriptionStatus();
      setSubscriptionStatus(status);
      
      // Update user's subscription status
      if (user) {
        setUser({
          ...user,
          isSubscribed: status.isSubscribed,
          subscriptionStatus: status.subscriptionStatus,
        });
      }
      
      return status;
    } catch (err) {
      console.error('Failed to check subscription status:', err);
      return {
        isSubscribed: false,
        status: 'error',
        endDate: null,
      };
    }
  };

  // Create checkout session
  const createCheckoutSession = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.createCheckoutSession();
      setIsLoading(false);
      return response;
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        subscriptionStatus,
        register,
        login,
        logout,
        checkSubscriptionStatus,
        createCheckoutSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;