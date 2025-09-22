const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const auctionRoutes = require('./routes/auctions');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());

// Special handling for Stripe webhook
app.use('/api/auth/webhook', express.raw({ type: 'application/json' }));

// Regular body parsing for other routes
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/auctions', auctionRoutes);

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Auction Dashboard API' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});