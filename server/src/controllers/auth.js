const jwt = require('jsonwebtoken');
const User = require('../models/User');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create Stripe customer
    const customer = await stripe.customers.create({
      email,
      name: name || email,
    });

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      stripeCustomerId: customer.id,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isSubscribed: user.isSubscribed,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isSubscribed: user.isSubscribed,
      subscriptionStatus: user.subscriptionStatus,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isSubscribed: user.isSubscribed,
        subscriptionStatus: user.subscriptionStatus,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create subscription checkout session
// @route   POST /api/auth/create-checkout-session
// @access  Private
const createCheckoutSession = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create a checkout session
    const session = await stripe.checkout.sessions.create({
      customer: user.stripeCustomerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: 'Auction Dashboard Subscription',
              description: 'Monthly subscription to Auction Dashboard',
            },
            unit_amount: 9999, // £99.99
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.CLIENT_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/payment-cancel`,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Handle Stripe webhook
// @route   POST /api/auth/webhook
// @access  Public
const handleWebhook = async (req, res) => {
  const signature = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    console.error(`Webhook Error: ${error.message}`);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      // Update user subscription status
      await handleCheckoutSessionCompleted(session);
      break;
    case 'customer.subscription.updated':
      const subscription = event.data.object;
      await handleSubscriptionUpdated(subscription);
      break;
    case 'customer.subscription.deleted':
      const canceledSubscription = event.data.object;
      await handleSubscriptionCanceled(canceledSubscription);
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
};

// Helper function to handle checkout session completed
const handleCheckoutSessionCompleted = async (session) => {
  try {
    // Get subscription details
    const subscription = await stripe.subscriptions.retrieve(session.subscription);
    
    // Find user by Stripe customer ID
    const user = await User.findOne({ stripeCustomerId: session.customer });
    if (!user) {
      console.error('User not found for customer ID:', session.customer);
      return;
    }

    // Update user subscription status
    user.isSubscribed = true;
    user.subscriptionStatus = subscription.status;
    user.subscriptionId = subscription.id;
    user.subscriptionEndDate = new Date(subscription.current_period_end * 1000);
    
    await user.save();
    console.log(`User ${user.email} subscription activated`);
  } catch (error) {
    console.error('Error handling checkout session completed:', error);
  }
};

// Helper function to handle subscription updated
const handleSubscriptionUpdated = async (subscription) => {
  try {
    const user = await User.findOne({ stripeCustomerId: subscription.customer });
    if (!user) {
      console.error('User not found for customer ID:', subscription.customer);
      return;
    }

    user.subscriptionStatus = subscription.status;
    user.subscriptionEndDate = new Date(subscription.current_period_end * 1000);
    
    // Update subscription status
    if (subscription.status === 'active') {
      user.isSubscribed = true;
    } else if (['canceled', 'unpaid', 'past_due'].includes(subscription.status)) {
      user.isSubscribed = false;
    }
    
    await user.save();
    console.log(`User ${user.email} subscription updated to ${subscription.status}`);
  } catch (error) {
    console.error('Error handling subscription updated:', error);
  }
};

// Helper function to handle subscription canceled
const handleSubscriptionCanceled = async (subscription) => {
  try {
    const user = await User.findOne({ stripeCustomerId: subscription.customer });
    if (!user) {
      console.error('User not found for customer ID:', subscription.customer);
      return;
    }

    user.isSubscribed = false;
    user.subscriptionStatus = 'canceled';
    user.subscriptionEndDate = new Date(subscription.canceled_at * 1000);
    
    await user.save();
    console.log(`User ${user.email} subscription canceled`);
  } catch (error) {
    console.error('Error handling subscription canceled:', error);
  }
};

// @desc    Verify subscription status
// @route   GET /api/auth/subscription-status
// @access  Private
const getSubscriptionStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // If user has a subscription ID, check its status with Stripe
    if (user.subscriptionId) {
      const subscription = await stripe.subscriptions.retrieve(user.subscriptionId);
      
      // Update user subscription status in database
      user.subscriptionStatus = subscription.status;
      user.isSubscribed = subscription.status === 'active';
      user.subscriptionEndDate = new Date(subscription.current_period_end * 1000);
      await user.save();
    }

    res.json({
      isSubscribed: user.isSubscribed,
      subscriptionStatus: user.subscriptionStatus,
      subscriptionEndDate: user.subscriptionEndDate,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  createCheckoutSession,
  handleWebhook,
  getSubscriptionStatus,
};