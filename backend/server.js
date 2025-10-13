// backend/server.js - Refactored and organized
const express = require('express');
const cors = require('cors');

const config = require('./config/constants');

// Enhanced error handling
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  console.error('Stack:', error.stack);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

console.log('Starting server initialization...');
console.log('Node version:', process.version);
console.log('Environment:', process.env.NODE_ENV || 'development');

const app = express();

// Basic health check routes
app.get('/', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date().toISOString() });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', uptime: process.uptime() });
});

// Middleware setup
console.log('Setting up middleware...');
const corsOptions = {
  origin: config.CORS_ORIGINS,
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());
console.log('✓ Middleware configured');

// Import routes
console.log('Loading routes...');
const authRoutes = require('./routes/auth');
const gamesRoutes = require('./routes/games');
const wagersRoutes = require('./routes/wagers');
const cartRoutes = require('./routes/cart');
const adminRoutes = require('./routes/admin');

// Mount routes
app.use('/api', authRoutes);
app.use('/api', gamesRoutes);
app.use('/api', wagersRoutes);
app.use('/api', cartRoutes);
app.use('/api/admin', adminRoutes);

console.log('✓ Routes configured');

// Start server
const PORT = config.PORT;
console.log('Attempting to start server on port:', PORT);

app.listen(PORT, '0.0.0.0', (err) => {
  if (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
  console.log(`Server successfully running on port ${PORT}`);
  console.log(`Health check available at: http://localhost:${PORT}/health`);
});

console.log('Server setup complete');

module.exports = app;