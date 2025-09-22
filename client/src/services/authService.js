const API_URL = 'http://localhost:5000/api/auth';

// Register user
const register = async (userData) => {
  const response = await fetch(`${API_URL}/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Registration failed');
  }

  // Save user to localStorage
  if (data.token) {
    localStorage.setItem('user', JSON.stringify(data));
  }

  return data;
};

// Login user
const login = async (userData) => {
  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Login failed');
  }

  // Save user to localStorage
  if (data.token) {
    localStorage.setItem('user', JSON.stringify(data));
  }

  return data;
};

// Logout user
const logout = () => {
  localStorage.removeItem('user');
};

// Get user profile
const getProfile = async () => {
  const user = JSON.parse(localStorage.getItem('user'));

  if (!user || !user.token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${API_URL}/profile`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${user.token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to get profile');
  }

  return data;
};

// Create checkout session
const createCheckoutSession = async () => {
  const user = JSON.parse(localStorage.getItem('user'));

  if (!user || !user.token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${API_URL}/create-checkout-session`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${user.token}`,
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to create checkout session');
  }

  return data;
};

// Get subscription status
const getSubscriptionStatus = async () => {
  const user = JSON.parse(localStorage.getItem('user'));

  if (!user || !user.token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${API_URL}/subscription-status`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${user.token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to get subscription status');
  }

  return data;
};

const authService = {
  register,
  login,
  logout,
  getProfile,
  createCheckoutSession,
  getSubscriptionStatus,
};

export default authService;