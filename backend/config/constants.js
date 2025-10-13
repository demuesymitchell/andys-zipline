// backend/config/constants.js
// Configuration constants

const config = {
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
  PORT: process.env.PORT || 3001,
  CORS_ORIGINS: [
    'https://www.andyszipline.club',
    'https://andyszipline.club',
    'http://localhost:3000',
    'http://localhost:3001'
  ],
  MINIMUM_CART_PERCENTAGE: 0.1, // 10% of user's balance
  DEFAULT_STARTING_COINS: 2000
};

module.exports = config;