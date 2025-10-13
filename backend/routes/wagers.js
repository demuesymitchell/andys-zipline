// backend/routes/wagers.js
// Wager-related routes

const express = require('express');
const router = express.Router();

const storage = require('../data/storage');
const { authenticateToken } = require('../middleware/auth');

// Get user's wagers
router.get('/wagers', authenticateToken, (req, res) => {
  const userWagers = storage.wagers.filter(w => w.userId === req.user.userId);
  res.json(userWagers);
});

// Edit user's pending wager
router.put('/wagers/:id', authenticateToken, (req, res) => {
  const wagerId = parseInt(req.params.id);
  const { amount } = req.body;
  const userId = req.user.userId;

  const wager = storage.wagers.find(w => w.id === wagerId && w.userId === userId);
  if (!wager) {
    return res.status(404).json({ error: 'Wager not found' });
  }

  if (wager.status !== 'pending_approval') {
    return res.status(400).json({ error: 'Can only edit pending wagers' });
  }

  const user = storage.users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const otherPendingAmount = storage.wagers
    .filter(w => w.userId === userId && w.status === 'pending_approval' && w.id !== wagerId)
    .reduce((sum, w) => sum + w.amount, 0);

  if (amount < 1) {
    return res.status(400).json({ error: 'Amount must be at least 1 coin' });
  }

  if (amount + otherPendingAmount > user.coins) {
    return res.status(400).json({ error: 'Insufficient coins including pending wagers' });
  }

  wager.amount = amount;
  wager.updatedAt = new Date().toISOString();

  res.json({
    message: 'Wager updated successfully',
    wager
  });
});

// Cancel user's pending wager
router.delete('/wagers/:id', authenticateToken, (req, res) => {
  const wagerId = parseInt(req.params.id);
  const userId = req.user.userId;

  const wagerIndex = storage.wagers.findIndex(w => w.id === wagerId && w.userId === userId);
  if (wagerIndex === -1) {
    return res.status(404).json({ error: 'Wager not found' });
  }

  const wager = storage.wagers[wagerIndex];
  if (wager.status !== 'pending_approval') {
    return res.status(400).json({ error: 'Can only cancel pending wagers' });
  }

  storage.wagers.splice(wagerIndex, 1);

  res.json({ message: 'Wager cancelled successfully' });
});

module.exports = router;