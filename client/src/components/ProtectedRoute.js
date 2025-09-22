import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, isLoading } = useContext(AuthContext);

  // Show loading state while checking authentication
  if (isLoading) {
    return <div className="container mx-auto p-4 text-center">Loading...</div>;
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" />;
  }

  // Render the protected component
  return children;
};

export default ProtectedRoute;