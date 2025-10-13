// backend/routes/admin.js
// Admin-only routes

const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();

const storage = require('../data/storage');
const config = require('../config/constants');
const { authenticateToken, authenticateAdmin } = require('../middleware/auth');

// All routes in this file require admin authentication
router.use(authenticateToken);
router.use(authenticateAdmin);

// Get all users
router.get('/users', (req, res) => {
  const safeUsers = storage.users.map(u => ({
    id: u.id,
    username: u.username,
    coins: u.coins
  }));
  res.json(safeUsers);
});

// Create new user
router.post('/users', async (req, res) => {
  const { username, password } = req.body;
  
  if (storage.users.find(u => u.username === username)) {
    return res.status(400).json({ error: 'Username already exists' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = {
    id: storage.users.length + 1,
    username,
    password: hashedPassword,
    coins: config.DEFAULT_STARTING_COINS,
    isAdmin: false
  };

  storage.users.push(newUser);
  res.status(201).json({
    id: newUser.id,
    username: newUser.username,
    coins: newUser.coins
  });
});

// Get all wagers
router.get('/wagers', (req, res) => {
  const allWagers = storage.wagers.map(w => {
    const user = storage.users.find(u => u.id === w.userId);
    const game = storage.games.find(g => g.id === w.gameId);
    return {
      ...w,
      username: user?.username,
      gameName: game ? `${game.awayTeam} @ ${game.homeTeam}` : 'Unknown Game'
    };
  });
  
  res.json(allWagers);
});

// Get grouped pending wagers
router.get('/wagers/pending/grouped', (req, res) => {
  const pendingWagers = storage.wagers.filter(w => w.status === 'pending_approval');
  
  const groupedWagers = pendingWagers.reduce((groups, wager) => {
    const user = storage.users.find(u => u.id === wager.userId);
    const game = storage.games.find(g => g.id === wager.gameId);
    
    const userId = wager.userId;
    if (!groups[userId]) {
      groups[userId] = {
        userId: userId,
        username: user?.username || 'Unknown User',
        wagers: [],
        totalAmount: 0,
        submittedAt: wager.submittedAt
      };
    }
    
    groups[userId].wagers.push({
      ...wager,
      gameName: game ? `${game.awayTeam} @ ${game.homeTeam}` : 'Unknown Game'
    });
    groups[userId].totalAmount += wager.amount;
    
    return groups;
  }, {});
  
  const groupedArray = Object.values(groupedWagers).sort((a, b) => 
    new Date(a.submittedAt) - new Date(b.submittedAt)
  );
  
  res.json(groupedArray);
});

// Approve/Reject user's wagers
router.put('/wagers/user/:userId/decision', (req, res) => {
  const { decision } = req.body;
  const userId = parseInt(req.params.userId);
  
  const userWagers = storage.wagers.filter(w => w.userId === userId && w.status === 'pending_approval');
  if (userWagers.length === 0) {
    return res.status(404).json({ error: 'No pending wagers found for this user' });
  }

  const user = storage.users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const totalAmount = userWagers.reduce((sum, wager) => sum + wager.amount, 0);

  userWagers.forEach(wager => {
    if (decision === 'approved') {
      wager.status = 'active';
      wager.approvedAt = new Date().toISOString();
    } else if (decision === 'rejected') {
      wager.status = 'rejected';
      wager.rejectedAt = new Date().toISOString();
    }
  });

  if (decision === 'approved') {
    user.coins -= totalAmount;
  }

  res.json({ 
    message: `${userWagers.length} wagers ${decision} successfully`,
    totalAmount,
    userCoins: user.coins
  });
});

// Settle wager
router.put('/wagers/:id/settle', (req, res) => {
  const { result } = req.body;
  const wagerId = parseInt(req.params.id);
  
  const wager = storage.wagers.find(w => w.id === wagerId);
  if (!wager) {
    return res.status(404).json({ error: 'Wager not found' });
  }

  if (wager.status !== 'active') {
    return res.status(400).json({ error: 'Can only settle active wagers' });
  }

  const user = storage.users.find(u => u.id === wager.userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  wager.status = result;
  wager.settledAt = new Date().toISOString();

  if (result === 'win') {
    user.coins += wager.amount * 2;
  } else if (result === 'push') {
    user.coins += wager.amount;
  }

  res.json({ wager, userCoins: user.coins });
});

module.exports = router;