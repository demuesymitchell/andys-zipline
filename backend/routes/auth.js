// backend/routes/auth.js
// Authentication routes

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();

const storage = require('../data/storage');
const config = require('../config/constants');
const { authenticateToken } = require('../middleware/auth');

// Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  
  const user = storage.users.find(u => u.username === username);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { userId: user.id, username: user.username },
    config.JWT_SECRET,
    { expiresIn: '24h' }
  );

  res.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      coins: user.coins,
      isAdmin: user.isAdmin || false
    }
  });
});

// Get current user info
router.get('/user', authenticateToken, (req, res) => {
  const user = storage.users.find(u => u.id === req.user.userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  res.json({
    id: user.id,
    username: user.username,
    coins: user.coins,
    isAdmin: user.isAdmin || false
  });
});

// Get leaderboard
router.get('/leaderboard', authenticateToken, (req, res) => {
  const leaderboard = storage.users
    .filter(u => !u.hideFromLeaderboard)
    .map(u => ({
      id: u.id,
      username: u.username,
      coins: u.coins
    }))
    .sort((a, b) => b.coins - a.coins);
  
  res.json(leaderboard);
});

module.exports = router;