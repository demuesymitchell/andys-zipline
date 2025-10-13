// data/users.js
// User data - separated for easy management

const users = [
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

module.exports = users;