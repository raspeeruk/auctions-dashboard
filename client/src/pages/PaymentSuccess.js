import { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const PaymentSuccess = () => {
  const { checkSubscriptionStatus, user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const updateSubscription = async () => {
      try {
        // Update subscription status
        await checkSubscriptionStatus();
        
        // Redirect to dashboard after 5 seconds
        setTimeout(() => {
          navigate('/dashboard');
        }, 5000);
      } catch (error) {
        console.error('Error updating subscription status:', error);
      }
    };

    if (user) {
      updateSubscription();
    } else {
      navigate('/login');
    }
  }, [checkSubscriptionStatus, navigate, user]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <div className="bg-white p-6 rounded-lg shadow-md text-center">
        <div className="text-green-500 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold mb-4">Payment Successful!</h1>
        <p className="mb-4">Thank you for subscribing to Auction Dashboard.</p>
        <p className="mb-4">Your subscription is now active and you have full access to all features.</p>
        <p className="text-sm text-gray-500">You will be redirected to the dashboard in a few seconds...</p>
      </div>
    </div>
  );
};

export default PaymentSuccess;