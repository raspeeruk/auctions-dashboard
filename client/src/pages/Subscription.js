import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const Subscription = () => {
  const { createCheckoutSession, isLoading, error, user, subscriptionStatus } = useContext(AuthContext);
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  const handleSubscribe = async () => {
    setIsProcessing(true);
    try {
      const { url } = await createCheckoutSession();
      // Redirect to Stripe Checkout
      window.location.href = url;
    } catch (err) {
      setIsProcessing(false);
      console.error('Error creating checkout session:', err);
    }
  };

  // If user is already subscribed, redirect to dashboard
  if (user && subscriptionStatus.isSubscribed) {
    navigate('/dashboard');
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Subscribe to Auction Dashboard</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <div className="mb-6">
          <p className="text-gray-700 mb-4">
            Get access to auction data from Allsops, Savills, and Strettons.
          </p>
          <ul className="list-disc pl-5 mb-4 text-gray-700">
            <li>Weekly auction catalogue monitoring</li>
            <li>Consolidated Excel exports</li>
            <li>Auction day recording instructions</li>
            <li>Post-auction data analysis</li>
          </ul>
          <p className="font-bold text-lg text-center mb-4">£99.99 / month</p>
        </div>
        
        <div className="flex items-center justify-center">
          <button
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
            onClick={handleSubscribe}
            disabled={isLoading || isProcessing}
          >
            {isProcessing ? 'Processing...' : 'Subscribe Now'}
          </button>
        </div>
        
        <p className="text-center text-gray-500 text-xs mt-4">
          Secure payment processed by Stripe. Cancel anytime.
        </p>
      </div>
    </div>
  );
};

export default Subscription;