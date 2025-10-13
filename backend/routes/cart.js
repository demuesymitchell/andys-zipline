// backend/routes/cart.js
// Shopping cart routes

const express = require('express');
const router = express.Router();

const storage = require('../data/storage');
const config = require('../config/constants');
const { authenticateToken } = require('../middleware/auth');

// Get user's cart
router.get('/cart', authenticateToken, (req, res) => {
  const userId = req.user.userId;
  const userCart = storage.carts[userId] || [];
  res.json(userCart);
});

// Add item to cart
router.post('/cart', authenticateToken, (req, res) => {
  const { gameId, team, amount, spread } = req.body;
  const userId = req.user.userId;
  
  const user = storage.users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const game = storage.games.find(g => g.id === gameId);
  if (!game) {
    return res.status(404).json({ error: 'Game not found' });
  }

  if (!storage.carts[userId]) {
    storage.carts[userId] = [];
  }

  const existingIndex = storage.carts[userId].findIndex(item => item.gameId === gameId);
  
  const cartItem = {
    id: Date.now(),
    gameId,
    team,
    amount,
    spread,
    gameName: `${game.awayTeam} @ ${game.homeTeam}`
  };

  if (existingIndex >= 0) {
    storage.carts[userId][existingIndex] = cartItem;
  } else {
    storage.carts[userId].push(cartItem);
  }

  res.json(cartItem);
});

// Remove item from cart
router.delete('/cart/:itemId', authenticateToken, (req, res) => {
  const userId = req.user.userId;
  const itemId = parseInt(req.params.itemId);
  
  if (storage.carts[userId]) {
    storage.carts[userId] = storage.carts[userId].filter(item => item.id !== itemId);
  }
  
  res.json({ success: true });
});

// Submit cart for approval
router.post('/cart/submit', authenticateToken, (req, res) => {
  const userId = req.user.userId;
  const userCart = storage.carts[userId] || [];
  
  if (userCart.length === 0) {
    return res.status(400).json({ error: 'Cart is empty' });
  }

  const user = storage.users.find(u => u.id === userId);
  const totalAmount = userCart.reduce((sum, item) => sum + item.amount, 0);
  
  const pendingAmount = storage.wagers
    .filter(w => w.userId === userId && w.status === 'pending_approval')
    .reduce((sum, w) => sum + w.amount, 0);
  
  const minimumCartTotal = Math.floor(user.coins * config.MINIMUM_CART_PERCENTAGE);
  if (totalAmount < minimumCartTotal) {
    return res.status(400).json({ 
      error: `Cart total must be at least ${minimumCartTotal} coins (${config.MINIMUM_CART_PERCENTAGE * 100}% of your balance)` 
    });
  }
  
  if (user.coins < totalAmount + pendingAmount) {
    return res.status(400).json({ error: 'Insufficient coins including pending wagers' });
  }

  userCart.forEach(item => {
    const wager = {
      id: storage.wagers.length + 1,
      userId,
      gameId: item.gameId,
      team: item.team,
      amount: item.amount,
      spread: item.spread,
      status: 'pending_approval',
      createdAt: new Date().toISOString(),
      submittedAt: new Date().toISOString()
    };
    storage.wagers.push(wager);
  });

  storage.carts[userId] = [];
  
  res.json({ message: 'Wagers submitted for approval', count: userCart.length });
});

module.exports = router;