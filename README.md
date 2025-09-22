# Auction Dashboard

A full-stack application for monitoring and managing auction data with user authentication and subscription-based access.

## Features

- User registration and authentication
- Subscription-based access using Stripe
- Auction data management
- Excel export functionality
- Responsive UI built with React and Tailwind CSS

## Project Structure

The project is divided into two main parts:

1. **Backend (server)**: Node.js/Express server with MongoDB database
2. **Frontend (client)**: React application with authentication and subscription management

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- Stripe account for payment processing

## Environment Variables

### Backend (.env)

Create a `.env` file in the server directory with the following variables:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/auctions-dashboard
JWT_SECRET=your_jwt_secret_key_change_in_production
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
CLIENT_URL=http://localhost:3000
```

## Installation

### Backend

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Start the server in development mode
npm run dev
```

### Frontend

```bash
# Navigate to client directory
cd client

# Install dependencies
npm install

# Start the development server
npm start
```

## Authentication Flow

1. User registers with email and password
2. User logs in and receives JWT token
3. User subscribes via Stripe Checkout
4. After successful payment, user gains access to auction data

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (protected)
- `POST /api/auth/create-checkout-session` - Create Stripe checkout session (protected)
- `GET /api/auth/subscription-status` - Get subscription status (protected)
- `POST /api/auth/webhook` - Stripe webhook endpoint

### Auctions

- `GET /api/auctions` - Get all auctions (protected, requires subscription)
- `GET /api/auctions/:id` - Get auction by ID (protected, requires subscription)

## Testing the Application

1. Start both the backend and frontend servers
2. Register a new user account
3. Log in with the registered credentials
4. Subscribe using the test card number: 4242 4242 4242 4242
5. Access the auction dashboard

## Stripe Testing

For testing Stripe payments, use the following test card details:
- Card Number: 4242 4242 4242 4242
- Expiry Date: Any future date
- CVC: Any 3 digits
- ZIP: Any 5 digits

## Production Deployment

For production deployment:

1. Update environment variables with production values
2. Set up proper MongoDB security
3. Configure Stripe webhooks for production
4. Build the React frontend: `cd client && npm run build`
5. Serve the static files from the backend or a CDN