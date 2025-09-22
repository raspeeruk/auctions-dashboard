import { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const PaymentCancel = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to subscription page after 5 seconds
    const timer = setTimeout(() => {
      navigate('/subscription');
    }, 5000);

    if (!user) {
      navigate('/login');
    }

    return () => clearTimeout(timer);
  }, [navigate, user]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <div className="bg-white p-6 rounded-lg shadow-md text-center">
        <div className="text-red-500 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold mb-4">Payment Cancelled</h1>
        <p className="mb-4">Your subscription payment was cancelled.</p>
        <p className="mb-4">You can try again whenever you're ready.</p>
        <button 
          onClick={() => navigate('/subscription')} 
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Try Again
        </button>
        <p className="text-sm text-gray-500 mt-4">You will be redirected to the subscription page in a few seconds...</p>
      </div>
    </div>
  );
};

export default PaymentCancel;