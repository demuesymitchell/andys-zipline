// backend/middleware/auth.js
// Authentication and authorization middleware

const jwt = require('jsonwebtoken');
const config = require('../config/constants');

// Auth middleware - verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, config.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Admin middleware - check if user is admin
const authenticateAdmin = (req, res, next) => {
  console.log('Admin auth check for user:', req.user.username);
  if (req.user.username !== 'admin' && req.user.username !== 'AndyM') {
    console.log('Access denied for user:', req.user.username);
    return res.status(403).json({ error: 'Access denied: Admin privileges required' });
  }
  console.log('Admin access granted for:', req.user.username);
  next();
};

module.exports = {
  authenticateToken,
  authenticateAdmin
};

// NOTHING SHOULD BE AFTER THIS LINE!