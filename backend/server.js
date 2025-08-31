const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const axios = require('axios');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage (replace with database in production)
let users = [
  {
    id: 1,
    username: 'testuser',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    coins: 2000
  },
  {
    id: 2,
    username: 'admin',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    coins: 5000
  },
  {
    id: 3,
    username: 'player2',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    coins: 1800
  },
  {
    id: 4,
    username: 'highroller',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    coins: 3200
  }
];

let wagers = [];
let games = [];
let carts = {}; // userId -> array of cart items

const JWT_SECRET = 'your-secret-key-change-in-production';

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Admin middleware
const authenticateAdmin = (req, res, next) => {
  if (req.user.username !== 'admin') {
    return res.sendStatus(403);
  }
  next();
};

// Routes

// Login
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  
  const user = users.find(u => u.username === username);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { userId: user.id, username: user.username },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  res.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      coins: user.coins
    }
  });
});

// Get current user info
app.get('/api/user', authenticateToken, (req, res) => {
  const user = users.find(u => u.id === req.user.userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  res.json({
    id: user.id,
    username: user.username,
    coins: user.coins
  });
});

// Get leaderboard
app.get('/api/leaderboard', authenticateToken, (req, res) => {
  const leaderboard = users
    .map(u => ({
      id: u.id,
      username: u.username,
      coins: u.coins
    }))
    .sort((a, b) => b.coins - a.coins);
  
  res.json(leaderboard);
});

// Admin: Create user
app.post('/api/admin/users', authenticateToken, authenticateAdmin, async (req, res) => {
  const { username, password } = req.body;
  
  if (users.find(u => u.username === username)) {
    return res.status(400).json({ error: 'Username already exists' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = {
    id: users.length + 1,
    username,
    password: hashedPassword,
    coins: 2000
  };

  users.push(newUser);
  res.status(201).json({
    id: newUser.id,
    username: newUser.username,
    coins: newUser.coins
  });
});

// Get NFL games
app.get('/api/games', authenticateToken, async (req, res) => {
  try {
    const mockGames = [
      {
        id: 1,
        homeTeam: 'Kansas City Chiefs',
        awayTeam: 'Buffalo Bills',
        homeSpread: -3.5,
        awaySpread: 3.5,
        gameTime: '2024-01-28T18:00:00.000Z',
        status: 'upcoming',
        minimumBet: 200 // 10% of 2000 starting coins
      },
      {
        id: 2,
        homeTeam: 'Philadelphia Eagles',
        awayTeam: 'San Francisco 49ers',
        homeSpread: -1.5,
        awaySpread: 1.5,
        gameTime: '2024-01-28T21:30:00.000Z',
        status: 'upcoming',
        minimumBet: 200
      },
      {
        id: 3,
        homeTeam: 'Dallas Cowboys',
        awayTeam: 'Green Bay Packers',
        homeSpread: -2.5,
        awaySpread: 2.5,
        gameTime: '2024-01-29T16:00:00.000Z',
        status: 'upcoming',
        minimumBet: 200
      }
    ];

    games = mockGames;
    res.json(mockGames);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch games' });
  }
});

// Cart management
app.get('/api/cart', authenticateToken, (req, res) => {
  const userId = req.user.userId;
  const userCart = carts[userId] || [];
  res.json(userCart);
});

app.post('/api/cart', authenticateToken, (req, res) => {
  const { gameId, team, amount, spread } = req.body;
  const userId = req.user.userId;
  
  const user = users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const game = games.find(g => g.id === gameId);
  if (!game) {
    return res.status(404).json({ error: 'Game not found' });
  }

  // Check minimum bet (10% of current coins)
  const minimumBet = Math.floor(user.coins * 0.1);
  if (amount < minimumBet) {
    return res.status(400).json({ error: `Minimum bet is ${minimumBet} coins (10% of your balance)` });
  }

  if (!carts[userId]) {
    carts[userId] = [];
  }

  // Check if item already in cart for this game
  const existingIndex = carts[userId].findIndex(item => item.gameId === gameId);
  
  const cartItem = {
    id: Date.now(),
    gameId,
    team,
    amount,
    spread,
    gameName: `${game.awayTeam} @ ${game.homeTeam}`
  };

  if (existingIndex >= 0) {
    carts[userId][existingIndex] = cartItem;
  } else {
    carts[userId].push(cartItem);
  }

  res.json(cartItem);
});

app.delete('/api/cart/:itemId', authenticateToken, (req, res) => {
  const userId = req.user.userId;
  const itemId = parseInt(req.params.itemId);
  
  if (carts[userId]) {
    carts[userId] = carts[userId].filter(item => item.id !== itemId);
  }
  
  res.json({ success: true });
});

// Submit cart for approval
app.post('/api/cart/submit', authenticateToken, (req, res) => {
  const userId = req.user.userId;
  const userCart = carts[userId] || [];
  
  if (userCart.length === 0) {
    return res.status(400).json({ error: 'Cart is empty' });
  }

  const user = users.find(u => u.id === userId);
  const totalAmount = userCart.reduce((sum, item) => sum + item.amount, 0);
  
  if (user.coins < totalAmount) {
    return res.status(400).json({ error: 'Insufficient coins for all wagers' });
  }

  // Create pending wagers
  userCart.forEach(item => {
    const wager = {
      id: wagers.length + 1,
      userId,
      gameId: item.gameId,
      team: item.team,
      amount: item.amount,
      spread: item.spread,
      status: 'pending_approval',
      createdAt: new Date().toISOString(),
      submittedAt: new Date().toISOString()
    };
    wagers.push(wager);
  });

  // Clear cart
  carts[userId] = [];

  res.json({ message: 'Wagers submitted for approval', count: userCart.length });
});

// Get user's wagers
app.get('/api/wagers', authenticateToken, (req, res) => {
  const userWagers = wagers.filter(w => w.userId === req.user.userId);
  res.json(userWagers);
});

// Admin: Get all pending wagers
app.get('/api/admin/wagers/pending', authenticateToken, authenticateAdmin, (req, res) => {
  const pendingWagers = wagers
    .filter(w => w.status === 'pending_approval')
    .map(w => {
      const user = users.find(u => u.id === w.userId);
      const game = games.find(g => g.id === w.gameId);
      return {
        ...w,
        username: user?.username,
        gameName: game ? `${game.awayTeam} @ ${game.homeTeam}` : 'Unknown Game'
      };
    });
  
  res.json(pendingWagers);
});

// Admin: Approve/Reject wager
app.put('/api/admin/wagers/:id/decision', authenticateToken, authenticateAdmin, (req, res) => {
  const { decision } = req.body; // 'approved' or 'rejected'
  const wagerId = parseInt(req.params.id);
  
  const wager = wagers.find(w => w.id === wagerId);
  if (!wager) {
    return res.status(404).json({ error: 'Wager not found' });
  }

  const user = users.find(u => u.id === wager.userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  if (decision === 'approved') {
    // Deduct coins and mark as active
    user.coins -= wager.amount;
    wager.status = 'active';
    wager.approvedAt = new Date().toISOString();
  } else if (decision === 'rejected') {
    wager.status = 'rejected';
    wager.rejectedAt = new Date().toISOString();
  } else {
    return res.status(400).json({ error: 'Invalid decision' });
  }

  res.json({ 
    wager, 
    userCoins: user.coins,
    message: `Wager ${decision} successfully` 
  });
});

// Admin: Settle wager (win/loss/push)
app.put('/api/admin/wagers/:id/settle', authenticateToken, authenticateAdmin, (req, res) => {
  const { result } = req.body; // 'win', 'loss', 'push'
  const wagerId = parseInt(req.params.id);
  
  const wager = wagers.find(w => w.id === wagerId);
  if (!wager) {
    return res.status(404).json({ error: 'Wager not found' });
  }

  if (wager.status !== 'active') {
    return res.status(400).json({ error: 'Can only settle active wagers' });
  }

  const user = users.find(u => u.id === wager.userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  wager.status = result;
  wager.settledAt = new Date().toISOString();

  if (result === 'win') {
    user.coins += wager.amount * 2; // Double the wager
  } else if (result === 'push') {
    user.coins += wager.amount; // Return original wager
  }
  // For loss, coins already deducted when approved

  res.json({ wager, userCoins: user.coins });
});

// Get all users (admin only)
app.get('/api/admin/users', authenticateToken, authenticateAdmin, (req, res) => {
  const safeUsers = users.map(u => ({
    id: u.id,
    username: u.username,
    coins: u.coins
  }));
  res.json(safeUsers);
});

// Admin: Get all wagers
app.get('/api/admin/wagers', authenticateToken, authenticateAdmin, (req, res) => {
  const allWagers = wagers.map(w => {
    const user = users.find(u => u.id === w.userId);
    const game = games.find(g => g.id === w.gameId);
    return {
      ...w,
      username: user?.username,
      gameName: game ? `${game.awayTeam} @ ${game.homeTeam}` : 'Unknown Game'
    };
  });
  
  res.json(allWagers);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;