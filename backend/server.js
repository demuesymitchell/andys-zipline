const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool, initDatabase } = require('./config/database');
const { JWT_SECRET, PORT } = require('./config/constants');
const { authenticateToken, authenticateAdmin } = require('./middleware/auth');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database on startup
initDatabase().catch(console.error);

// ============================================
// AUTH ROUTES
// ============================================

// Login
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const result = await pool.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password);
    
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { 
        userId: user.id, 
        username: user.username,
        isAdmin: user.is_admin 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ 
      token,
      user: {
        id: user.id,
        username: user.username,
        coins: user.coins,
        isAdmin: user.is_admin
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current user info
app.get('/api/user', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, username, coins, is_admin FROM users WHERE id = $1',
      [req.user.userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = result.rows[0];
    // Convert database fields to camelCase for frontend
    res.json({
      id: user.id,
      username: user.username,
      coins: user.coins,
      isAdmin: user.is_admin
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ============================================
// GAME ROUTES
// ============================================

// Get all games
app.get('/api/games', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM games 
      ORDER BY game_time, home_team
    `);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Get games error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ============================================
// CART ROUTES
// ============================================

// Get user's cart
app.get('/api/cart', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.*, g.home_team, g.away_team, g.game_time, g.game_date
      FROM cart_items c
      JOIN games g ON c.game_id = g.id
      WHERE c.user_id = $1
      ORDER BY c.created_at
    `, [req.user.userId]);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add to cart
app.post('/api/cart', authenticateToken, async (req, res) => {
  try {
    const { gameId, team, amount, spread } = req.body;
    
    // Check if item already in cart
    const existing = await pool.query(
      'SELECT * FROM cart_items WHERE user_id = $1 AND game_id = $2',
      [req.user.userId, gameId]
    );
    
    if (existing.rows.length > 0) {
      return res.status(400).json({ message: 'Game already in cart' });
    }

    const result = await pool.query(`
      INSERT INTO cart_items (user_id, game_id, team, amount, spread)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [req.user.userId, gameId, team, amount, spread]);
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove from cart
app.delete('/api/cart/:gameId', authenticateToken, async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM cart_items WHERE user_id = $1 AND game_id = $2',
      [req.user.userId, req.params.gameId]
    );
    
    res.json({ message: 'Item removed from cart' });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Submit cart as wagers
app.post('/api/cart/submit', authenticateToken, async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Get user's cart
    const cartResult = await client.query(
      'SELECT * FROM cart_items WHERE user_id = $1',
      [req.user.userId]
    );
    
    if (cartResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Calculate total
    const total = cartResult.rows.reduce((sum, item) => sum + item.amount, 0);
    
    // Get user's balance
    const userResult = await client.query(
      'SELECT coins FROM users WHERE id = $1',
      [req.user.userId]
    );
    
    const userCoins = userResult.rows[0].coins;
    
    // Check minimum (10% of balance)
    if (total < userCoins * 0.1) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        message: `Minimum cart total is ${Math.ceil(userCoins * 0.1)} coins (10% of your balance)` 
      });
    }

    // Create wagers from cart items
    for (const item of cartResult.rows) {
      await client.query(`
        INSERT INTO wagers (user_id, game_id, team, amount, spread, status)
        VALUES ($1, $2, $3, $4, $5, 'pending')
      `, [req.user.userId, item.game_id, item.team, item.amount, item.spread]);
    }

    // Clear cart
    await client.query(
      'DELETE FROM cart_items WHERE user_id = $1',
      [req.user.userId]
    );

    await client.query('COMMIT');
    res.json({ message: 'Wagers submitted for approval' });
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Submit cart error:', error);
    res.status(500).json({ message: 'Server error' });
  } finally {
    client.release();
  }
});

// ============================================
// WAGER ROUTES
// ============================================

// Get user's wagers
app.get('/api/wagers', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT w.*, g.home_team, g.away_team, g.game_time, g.game_date, g.status as game_status
      FROM wagers w
      JOIN games g ON w.game_id = g.id
      WHERE w.user_id = $1
      ORDER BY w.created_at DESC
    `, [req.user.userId]);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Get wagers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ============================================
// LEADERBOARD ROUTE
// ============================================

app.get('/api/leaderboard', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        username,
        coins,
        is_admin
      FROM users
      ORDER BY coins DESC
    `);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ============================================
// ADMIN ROUTES
// ============================================

// Get all pending wagers (admin)
app.get('/api/admin/wagers/pending', authenticateToken, authenticateAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT w.*, u.username, g.home_team, g.away_team, g.game_time
      FROM wagers w
      JOIN users u ON w.user_id = u.id
      JOIN games g ON w.game_id = g.id
      WHERE w.status = 'pending'
      ORDER BY w.created_at ASC
    `);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Get pending wagers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Approve wager (admin)
app.post('/api/admin/wagers/:id/approve', authenticateToken, authenticateAdmin, async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Get wager
    const wagerResult = await client.query(
      'SELECT * FROM wagers WHERE id = $1',
      [req.params.id]
    );
    
    if (wagerResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Wager not found' });
    }

    const wager = wagerResult.rows[0];
    
    // Get user
    const userResult = await client.query(
      'SELECT coins FROM users WHERE id = $1',
      [wager.user_id]
    );
    
    const user = userResult.rows[0];
    
    if (user.coins < wager.amount) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'User has insufficient funds' });
    }

    // Deduct coins
    await client.query(
      'UPDATE users SET coins = coins - $1 WHERE id = $2',
      [wager.amount, wager.user_id]
    );

    // Update wager status
    await client.query(
      'UPDATE wagers SET status = $1, approved_at = CURRENT_TIMESTAMP WHERE id = $2',
      ['active', req.params.id]
    );

    await client.query('COMMIT');
    res.json({ message: 'Wager approved' });
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Approve wager error:', error);
    res.status(500).json({ message: 'Server error' });
  } finally {
    client.release();
  }
});

// Reject wager (admin)
app.post('/api/admin/wagers/:id/reject', authenticateToken, authenticateAdmin, async (req, res) => {
  try {
    await pool.query(
      'UPDATE wagers SET status = $1 WHERE id = $2',
      ['rejected', req.params.id]
    );
    
    res.json({ message: 'Wager rejected' });
  } catch (error) {
    console.error('Reject wager error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Set game spread (admin)
app.post('/api/admin/games/:id/spread', authenticateToken, authenticateAdmin, async (req, res) => {
  try {
    const { spread } = req.body;
    
    await pool.query(
      'UPDATE games SET spread = $1 WHERE id = $2',
      [spread, req.params.id]
    );
    
    res.json({ message: 'Spread updated' });
  } catch (error) {
    console.error('Update spread error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Lock/Unlock game (admin) ← NEW ENDPOINT
app.post('/api/admin/games/:id/lock', authenticateToken, authenticateAdmin, async (req, res) => {
  try {
    const { locked } = req.body;
    
    await pool.query(
      'UPDATE games SET locked = $1 WHERE id = $2',
      [locked, req.params.id]
    );
    
    res.json({ message: `Game ${locked ? 'locked' : 'unlocked'} successfully` });
  } catch (error) {
    console.error('Lock game error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new user (admin)
app.post('/api/admin/users', authenticateToken, authenticateAdmin, async (req, res) => {
  try {
    const { username, password, isAdmin } = req.body;
    
    // Check if user exists
    const existing = await pool.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );
    
    if (existing.rows.length > 0) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const result = await pool.query(`
      INSERT INTO users (username, password, coins, is_admin)
      VALUES ($1, $2, 2000, $3)
      RETURNING id, username, coins, is_admin
    `, [username, hashedPassword, isAdmin || false]);
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Settle wager (admin)
app.post('/api/admin/wagers/:id/settle', authenticateToken, authenticateAdmin, async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { result } = req.body; // 'win', 'loss', or 'push'
    
    // Get wager
    const wagerResult = await client.query(
      'SELECT * FROM wagers WHERE id = $1',
      [req.params.id]
    );
    
    if (wagerResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Wager not found' });
    }

    const wager = wagerResult.rows[0];
    
    // Calculate payout
    let payout = 0;
    if (result === 'win') {
      payout = wager.amount * 2;
    } else if (result === 'push') {
      payout = wager.amount;
    }
    
    // Update user coins if there's a payout
    if (payout > 0) {
      await client.query(
        'UPDATE users SET coins = coins + $1 WHERE id = $2',
        [payout, wager.user_id]
      );
    }

    // Update wager
    await client.query(
      'UPDATE wagers SET status = $1, result = $2, settled_at = CURRENT_TIMESTAMP WHERE id = $3',
      ['settled', result, req.params.id]
    );

    await client.query('COMMIT');
    res.json({ message: `Wager settled as ${result}` });
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Settle wager error:', error);
    res.status(500).json({ message: 'Server error' });
  } finally {
    client.release();
  }
});

// Seed Week 7 games (admin only - run once)
app.post('/api/admin/seed-games', authenticateToken, authenticateAdmin, async (req, res) => {
  try {
    const week7Games = [
      { id: 'NO@CHI', home_team: 'Chicago Bears', away_team: 'New Orleans Saints', game_time: '1:00 PM', game_date: 'Sunday, October 19' },
      { id: 'MIA@CLE', home_team: 'Cleveland Browns', away_team: 'Miami Dolphins', game_time: '1:00 PM', game_date: 'Sunday, October 19' },
      { id: 'NE@TEN', home_team: 'Tennessee Titans', away_team: 'New England Patriots', game_time: '1:00 PM', game_date: 'Sunday, October 19' },
      { id: 'LV@KC', home_team: 'Kansas City Chiefs', away_team: 'Las Vegas Raiders', game_time: '1:00 PM', game_date: 'Sunday, October 19' },
      { id: 'PHI@MIN', home_team: 'Minnesota Vikings', away_team: 'Philadelphia Eagles', game_time: '1:00 PM', game_date: 'Sunday, October 19' },
      { id: 'CAR@NYJ', home_team: 'New York Jets', away_team: 'Carolina Panthers', game_time: '1:00 PM', game_date: 'Sunday, October 19' },
      { id: 'NYG@DEN', home_team: 'Denver Broncos', away_team: 'New York Giants', game_time: '4:05 PM', game_date: 'Sunday, October 19' },
      { id: 'IND@LAC', home_team: 'Los Angeles Chargers', away_team: 'Indianapolis Colts', game_time: '4:05 PM', game_date: 'Sunday, October 19' },
      { id: 'WAS@DAL', home_team: 'Dallas Cowboys', away_team: 'Washington Commanders', game_time: '4:25 PM', game_date: 'Sunday, October 19' },
      { id: 'GB@ARI', home_team: 'Arizona Cardinals', away_team: 'Green Bay Packers', game_time: '4:25 PM', game_date: 'Sunday, October 19' },
      { id: 'ATL@SF', home_team: 'San Francisco 49ers', away_team: 'Atlanta Falcons', game_time: '8:20 PM', game_date: 'Sunday, October 19' }
    ];

    for (const game of week7Games) {
      await pool.query(`
        INSERT INTO games (id, home_team, away_team, game_time, game_date, status)
        VALUES ($1, $2, $3, $4, $5, 'scheduled')
        ON CONFLICT (id) DO NOTHING
      `, [game.id, game.home_team, game.away_team, game.game_time, game.game_date]);
    }

    res.json({ message: 'Week 7 games seeded successfully' });
  } catch (error) {
    console.error('Seed games error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});