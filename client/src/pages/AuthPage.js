import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Login from '../components/Login';
import Register from '../components/Register';
import AuthContext from '../context/AuthContext';

const AuthPage = ({ isRegister = false }) => {
  const [showRegister, setShowRegister] = useState(isRegister);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      if (user.isSubscribed) {
        navigate('/dashboard');
      } else {
        navigate('/subscription');
      }
    }
  }, [user, navigate]);

  const toggleForm = () => {
    setShowRegister(!showRegister);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      {showRegister ? (
        <Register onToggleForm={toggleForm} />
      ) : (
        <Login onToggleForm={toggleForm} />
      )}
    </div>
  );
};

export default AuthPage;