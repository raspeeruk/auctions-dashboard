const express = require('express');
const router = express.Router();
const { 
  registerUser, 
  loginUser, 
  getUserProfile, 
  createCheckoutSession, 
  handleWebhook,
  getSubscriptionStatus
} = require('../controllers/auth');
const { protect } = require('../middleware/auth');

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

// Protected routes
router.get('/profile', protect, getUserProfile);
router.post('/create-checkout-session', protect, createCheckoutSession);
router.get('/subscription-status', protect, getSubscriptionStatus);

module.exports = router;