const express = require('express');

// Enhanced error handling and logging
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

let bcrypt, jwt, cors, axios;

try {
  console.log('Loading bcryptjs...');
  bcrypt = require('bcryptjs');
  console.log('✓ bcryptjs loaded');

  console.log('Loading jsonwebtoken...');
  jwt = require('jsonwebtoken');
  console.log('✓ jsonwebtoken loaded');

  console.log('Loading cors...');
  cors = require('cors');
  console.log('✓ cors loaded');

  console.log('Loading axios...');
  axios = require('axios');
  console.log('✓ axios loaded');

} catch (error) {
  console.error('Failed to load dependencies:', error);
  process.exit(1);
}

console.log('Creating Express app...');
const app = express();

// Basic health check route first
app.get('/', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date().toISOString() });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', uptime: process.uptime() });
});

console.log('Setting up middleware...');

try {
  // Configure CORS to allow your frontend domain
  const corsOptions = {
    origin: [
      'https://www.andyszipline.club',
      'https://andyszipline.club',
      'http://localhost:3000',
      'http://localhost:3001'
    ],
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  };
  
  app.use(cors(corsOptions));
  console.log('✓ CORS middleware added with origins:', corsOptions.origin);
  
  app.use(express.json());
  console.log('✓ JSON middleware added');
} catch (error) {
  console.error('Middleware setup failed:', error);
  process.exit(1);
}

// In-memory storage (replace with database in production)
let users = [
  {
    id: 1,
    username: 'admin',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    coins: 0,
    isAdmin: true,
    hideFromLeaderboard: true
  },
  {
    id: 2,
    username: 'AndyM',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    coins: 2000,
    isAdmin: true,
    hideFromLeaderboard: false
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

// Admin middleware - Updated to include AndyM
const authenticateAdmin = (req, res, next) => {
  console.log('Admin auth check for user:', req.user.username);
  if (req.user.username !== 'admin' && req.user.username !== 'AndyM') {
    console.log('Access denied for user:', req.user.username);
    return res.status(403).json({ error: 'Access denied: Admin privileges required' });
  }
  console.log('Admin access granted for:', req.user.username);
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
      coins: user.coins,
      isAdmin: user.isAdmin || false
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
    coins: user.coins,
    isAdmin: user.isAdmin || false
  });
});

// Get leaderboard - only hide admin, show AndyM
app.get('/api/leaderboard', authenticateToken, (req, res) => {
  const leaderboard = users
    .filter(u => !u.hideFromLeaderboard)
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
    coins: 2000,
    isAdmin: false
  };

  users.push(newUser);
  res.status(201).json({
    id: newUser.id,
    username: newUser.username,
    coins: newUser.coins
  });
});

// Get NFL games from ESPN API - Week 3 fallback games
app.get('/api/games', authenticateToken, async (req, res) => {
  try {
    // Fetch live NFL data from ESPN
    const response = await axios.get('http://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard');
    const espnGames = response.data.events;
    
    // Filter for Sunday games and Monday Night Football
    const relevantGames = espnGames.filter(event => {
      const gameDate = new Date(event.date);
      const dayOfWeek = gameDate.getDay();
      const hour = gameDate.getUTCHours();
      
      if (dayOfWeek === 0) {
        return hour >= 17 || hour <= 4;
      } else if (dayOfWeek === 1) {
        return hour >= 23 || hour <= 4;
      }
      
      return false;
    });

    console.log(`Found ${relevantGames.length} relevant NFL games`);

    // Convert ESPN data to our format
    let apiGames = relevantGames.map((event, index) => {
      const homeTeam = event.competitions[0].competitors.find(team => team.homeAway === 'home');
      const awayTeam = event.competitions[0].competitors.find(team => team.homeAway === 'away');
      
      return {
        id: index + 1,
        homeTeam: homeTeam.team.displayName,
        awayTeam: awayTeam.team.displayName,
        homeSpread: 0,
        awaySpread: 0,
        gameTime: event.date,
        status: event.status.type.name === 'STATUS_SCHEDULED' ? 'upcoming' : 'active',
        spreadsSet: false
      };
    });

    // Merge with existing games that have spreads set
    if (games.length > 0) {
      apiGames = apiGames.map(apiGame => {
        const existingGame = games.find(g => 
          g.homeTeam === apiGame.homeTeam && g.awayTeam === apiGame.awayTeam
        );
        return existingGame || apiGame;
      });
    }

    games = apiGames;
    res.json(games);
  } catch (error) {
    console.error('Failed to fetch NFL data:', error.message);
    
    // Week 3 fallback games for September 21, 2025
    const week3Games = [
      {
        id: 1,
        homeTeam: 'Jacksonville Jaguars',
        awayTeam: 'Houston Texans',
        homeSpread: -1.5,
        awaySpread: 1.5,
        gameTime: '2025-09-21T17:00:00.000Z', // 1:00 PM ET
        status: 'upcoming',
        spreadsSet: true
      },
      {
        id: 2,
        homeTeam: 'Minnesota Vikings',
        awayTeam: 'Cincinnati Bengals',
        homeSpread: -3.5,
        awaySpread: 3.5,
        gameTime: '2025-09-21T17:00:00.000Z', // 1:00 PM ET
        status: 'upcoming',
        spreadsSet: true
      },
      {
        id: 3,
        homeTeam: 'Green Bay Packers',
        awayTeam: 'Cleveland Browns',
        homeSpread: -7.5,
        awaySpread: 7.5,
        gameTime: '2025-09-21T17:00:00.000Z', // 1:00 PM ET
        status: 'upcoming',
        spreadsSet: true
      },
      {
        id: 4,
        homeTeam: 'Pittsburgh Steelers',
        awayTeam: 'New England Patriots',
        homeSpread: -1.5,
        awaySpread: 1.5,
        gameTime: '2025-09-21T17:00:00.000Z', // 1:00 PM ET
        status: 'upcoming',
        spreadsSet: true
      },
      {
        id: 5,
        homeTeam: 'Tampa Bay Buccaneers',
        awayTeam: 'New York Jets',
        homeSpread: -6.5,
        awaySpread: 6.5,
        gameTime: '2025-09-21T17:00:00.000Z', // 1:00 PM ET
        status: 'upcoming',
        spreadsSet: true
      },
      {
        id: 6,
        homeTeam: 'Indianapolis Colts',
        awayTeam: 'Tennessee Titans',
        homeSpread: -3.5,
        awaySpread: 3.5,
        gameTime: '2025-09-21T17:00:00.000Z', // 1:00 PM ET
        status: 'upcoming',
        spreadsSet: true
      },
      {
        id: 7,
        homeTeam: 'Philadelphia Eagles',
        awayTeam: 'Los Angeles Rams',
        homeSpread: -3.5,
        awaySpread: 3.5,
        gameTime: '2025-09-21T17:00:00.000Z', // 1:00 PM ET
        status: 'upcoming',
        spreadsSet: true
      },
      {
        id: 8,
        homeTeam: 'Los Angeles Chargers',
        awayTeam: 'Denver Broncos',
        homeSpread: -2.5,
        awaySpread: 2.5,
        gameTime: '2025-09-21T20:05:00.000Z', // 4:05 PM ET
        status: 'upcoming',
        spreadsSet: true
      },
      {
        id: 9,
        homeTeam: 'Seattle Seahawks',
        awayTeam: 'New Orleans Saints',
        homeSpread: -7.5,
        awaySpread: 7.5,
        gameTime: '2025-09-21T20:05:00.000Z', // 4:05 PM ET
        status: 'upcoming',
        spreadsSet: true
      },
      {
        id: 10,
        homeTeam: 'Chicago Bears',
        awayTeam: 'Dallas Cowboys',
        homeSpread: -1.5,
        awaySpread: 1.5,
        gameTime: '2025-09-21T20:25:00.000Z', // 4:25 PM ET
        status: 'upcoming',
        spreadsSet: true
      },
      {
        id: 11,
        homeTeam: 'San Francisco 49ers',
        awayTeam: 'Arizona Cardinals',
        homeSpread: -1.5,
        awaySpread: 1.5,
        gameTime: '2025-09-21T20:25:00.000Z', // 4:25 PM ET
        status: 'upcoming',
        spreadsSet: true
      },
      {
        id: 12,
        homeTeam: 'New York Giants',
        awayTeam: 'Kansas City Chiefs',
        homeSpread: 6,
        awaySpread: -6,
        gameTime: '2025-09-22T00:20:00.000Z', // 8:20 PM ET Sunday Night
        status: 'upcoming',
        spreadsSet: true
      }
    ];
        spreadsSet: true
      }
    ];
    
    games = week3Games;
    res.json(week3Games);
  }
});

// Admin: Set spreads for games
app.put('/api/admin/games/:id/spreads', authenticateToken, authenticateAdmin, (req, res) => {
  const { homeSpread } = req.body;
  const gameId = parseInt(req.params.id);
  
  const game = games.find(g => g.id === gameId);
  if (!game) {
    return res.status(404).json({ error: 'Game not found' });
  }

  game.homeSpread = parseFloat(homeSpread);
  game.awaySpread = -parseFloat(homeSpread);
  game.spreadsSet = true;

  res.json({
    message: 'Spreads updated successfully',
    game
  });
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
  
  console.log(`Cart submission attempt by user ${userId}:`, userCart);
  
  if (userCart.length === 0) {
    return res.status(400).json({ error: 'Cart is empty' });
  }

  const user = users.find(u => u.id === userId);
  const totalAmount = userCart.reduce((sum, item) => sum + item.amount, 0);
  
  // Calculate existing pending wagers
  const pendingAmount = wagers
    .filter(w => w.userId === userId && w.status === 'pending_approval')
    .reduce((sum, w) => sum + w.amount, 0);
  
  console.log(`User ${user.username} submitting ${userCart.length} wagers for ${totalAmount} total coins, has ${pendingAmount} pending`);
  
  // Check 10% minimum on total cart amount
  const minimumCartTotal = Math.floor(user.coins * 0.1);
  if (totalAmount < minimumCartTotal) {
    return res.status(400).json({ error: `Cart total must be at least ${minimumCartTotal} coins (10% of your balance)` });
  }
  
  // Check total commitment including pending wagers
  if (user.coins < totalAmount + pendingAmount) {
    return res.status(400).json({ error: 'Insufficient coins including pending wagers' });
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
    console.log('Created wager:', wager);
  });

  // Clear cart
  carts[userId] = [];

  console.log(`Total wagers in system: ${wagers.length}`);
  
  res.json({ message: 'Wagers submitted for approval', count: userCart.length });
});

// Get user's wagers
app.get('/api/wagers', authenticateToken, (req, res) => {
  const userWagers = wagers.filter(w => w.userId === req.user.userId);
  res.json(userWagers);
});

// NEW: Edit user's pending wager
app.put('/api/wagers/:id', authenticateToken, (req, res) => {
  const wagerId = parseInt(req.params.id);
  const { amount } = req.body;
  const userId = req.user.userId;

  const wager = wagers.find(w => w.id === wagerId && w.userId === userId);
  if (!wager) {
    return res.status(404).json({ error: 'Wager not found' });
  }

  if (wager.status !== 'pending_approval') {
    return res.status(400).json({ error: 'Can only edit pending wagers' });
  }

  const user = users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Calculate total pending wagers excluding this one
  const otherPendingAmount = wagers
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

// NEW: Cancel user's pending wager
app.delete('/api/wagers/:id', authenticateToken, (req, res) => {
  const wagerId = parseInt(req.params.id);
  const userId = req.user.userId;

  const wagerIndex = wagers.findIndex(w => w.id === wagerId && w.userId === userId);
  if (wagerIndex === -1) {
    return res.status(404).json({ error: 'Wager not found' });
  }

  const wager = wagers[wagerIndex];
  if (wager.status !== 'pending_approval') {
    return res.status(400).json({ error: 'Can only cancel pending wagers' });
  }

  // Remove wager from array
  wagers.splice(wagerIndex, 1);

  res.json({ message: 'Wager cancelled successfully' });
});

// Admin: Get grouped pending wagers (by user)
app.get('/api/admin/wagers/pending/grouped', authenticateToken, authenticateAdmin, (req, res) => {
  console.log(`Admin ${req.user.username} requesting pending wagers`);
  console.log(`Total wagers in system: ${wagers.length}`);
  
  const pendingWagers = wagers.filter(w => w.status === 'pending_approval');
  console.log(`Pending wagers found: ${pendingWagers.length}`, pendingWagers);
  
  // Group wagers by user
  const groupedWagers = pendingWagers.reduce((groups, wager) => {
    const user = users.find(u => u.id === wager.userId);
    const game = games.find(g => g.id === wager.gameId);
    
    console.log(`Processing wager for user ID ${wager.userId}, found user:`, user?.username);
    
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
  
  // Convert to array and sort by submission time
  const groupedArray = Object.values(groupedWagers).sort((a, b) => 
    new Date(a.submittedAt) - new Date(b.submittedAt)
  );
  
  console.log(`Returning ${groupedArray.length} grouped pending wagers`);
  
  res.json(groupedArray);
});

// Admin: Approve/Reject multiple wagers (user's entire cart)
app.put('/api/admin/wagers/user/:userId/decision', authenticateToken, authenticateAdmin, (req, res) => {
  const { decision } = req.body; // 'approved' or 'rejected'
  const userId = parseInt(req.params.userId);
  
  const userWagers = wagers.filter(w => w.userId === userId && w.status === 'pending_approval');
  if (userWagers.length === 0) {
    return res.status(404).json({ error: 'No pending wagers found for this user' });
  }

  const user = users.find(u => u.id === userId);
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

  // Only deduct coins if approved
  if (decision === 'approved') {
    user.coins -= totalAmount;
  }

  res.json({ 
    message: `${userWagers.length} wagers ${decision} successfully`,
    totalAmount,
    userCoins: user.coins
  });
});

// NEW: Admin: Settle wager (win/loss/push)
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