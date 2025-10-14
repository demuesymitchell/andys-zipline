const { Pool } = require('pg');

// Database connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Test connection
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected database error:', err);
});

// Initialize database tables
const initDatabase = async () => {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Initializing database tables...');
    
    // Users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        coins INTEGER DEFAULT 2000,
        is_admin BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Games table
    await client.query(`
      CREATE TABLE IF NOT EXISTS games (
        id VARCHAR(50) PRIMARY KEY,
        home_team VARCHAR(100) NOT NULL,
        away_team VARCHAR(100) NOT NULL,
        game_time VARCHAR(20) NOT NULL,
        game_date VARCHAR(50) NOT NULL,
        spread DECIMAL(4,1),
        home_score INTEGER,
        away_score INTEGER,
        status VARCHAR(20) DEFAULT 'scheduled',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Wagers table
    await client.query(`
      CREATE TABLE IF NOT EXISTS wagers (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        game_id VARCHAR(50) REFERENCES games(id) ON DELETE CASCADE,
        team VARCHAR(100) NOT NULL,
        amount INTEGER NOT NULL,
        spread DECIMAL(4,1) NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        result VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        approved_at TIMESTAMP,
        settled_at TIMESTAMP
      )
    `);

    // Shopping cart table
    await client.query(`
      CREATE TABLE IF NOT EXISTS cart_items (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        game_id VARCHAR(50) NOT NULL,
        team VARCHAR(100) NOT NULL,
        amount INTEGER NOT NULL,
        spread DECIMAL(4,1) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, game_id)
      )
    `);

    console.log('✅ Database tables initialized successfully');

    // Check if we need to seed initial admin users
    const userCount = await client.query('SELECT COUNT(*) FROM users');
    if (parseInt(userCount.rows[0].count) === 0) {
      console.log('🌱 Seeding initial admin users...');
      
      // Insert initial admin users (you'll want to hash these passwords properly)
      const bcrypt = require('bcrypt');
      const adminPassword = await bcrypt.hash('admin123', 10);
      
      await client.query(`
        INSERT INTO users (username, password, coins, is_admin) VALUES
        ('Andy', $1, 2000, true),
        ('Mitchell', $1, 2000, true)
        ON CONFLICT (username) DO NOTHING
      `, [adminPassword]);
      
      console.log('✅ Initial admin users created');
    }

  } catch (err) {
    console.error('❌ Error initializing database:', err);
    throw err;
  } finally {
    client.release();
  }
};

module.exports = {
  pool,
  initDatabase
};