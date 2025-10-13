// backend/routes/games.js
// Game-related routes

const express = require('express');
const router = express.Router();

const storage = require('../data/storage');
const week7Games = require('../data/games');
const { authenticateToken, authenticateAdmin } = require('../middleware/auth');

// Get NFL games
router.get('/games', authenticateToken, (req, res) => {
  console.log('Serving Week 7 Sunday games');
  
  // If games haven't been loaded yet, load from data file
  if (storage.games.length === 0) {
    storage.games = [...week7Games];
  }
  
  res.json(storage.games);
});

// Admin: Set spreads for games
router.put('/games/:id/spreads', authenticateToken, authenticateAdmin, (req, res) => {
  const { homeSpread } = req.body;
  const gameId = parseInt(req.params.id);
  
  const game = storage.games.find(g => g.id === gameId);
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

module.exports = router;