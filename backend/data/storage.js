// backend/data/storage.js
// In-memory storage arrays
// In production, replace with database

const initialUsers = require('./users');

const storage = {
  users: [...initialUsers], // Clone to avoid mutating original
  wagers: [],
  games: [],
  carts: {} // userId -> array of cart items
};

module.exports = storage;