import React, { useState, useEffect } from 'react';
import { User, DollarSign, Trophy, Calendar, Lock, Plus, Users, ShoppingCart, Check, X, Award } from 'lucide-react';

const API_BASE = 'https://andys-zipline-production.up.railway.app/api';

const App = () => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const [games, setGames] = useState([]);
  const [wagers, setWagers] = useState([]);
  const [cart, setCart] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [pendingWagers, setPendingWagers] = useState([]);
  const [activeTab, setActiveTab] = useState('games');
  const [loading, setLoading] = useState(false);

  // Login form state
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });

  // Admin form state
  const [adminForm, setAdminForm] = useState({ username: '', password: '' });

  // eslint-disable-next-line react-hooks/exhaustive-deps
useEffect(() => {
  if (token) {
    fetchUserData();
    fetchGames();
    fetchWagers();
    fetchCart();
    fetchLeaderboard();
    if (user?.username === 'admin') {
      fetchPendingWagers();
    }
  }
}, [token, user?.username]);

  const apiCall = async (endpoint, options = {}) => {
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` })
      },
      ...options
    };

    const response = await fetch(`${API_BASE}${endpoint}`, config);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  };

  const fetchUserData = async () => {
    try {
      const userData = await apiCall('/user');
      setUser(userData);
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      handleLogout();
    }
  };

  const fetchGames = async () => {
    try {
      const gamesData = await apiCall('/games');
      setGames(gamesData);
    } catch (error) {
      console.error('Failed to fetch games:', error);
    }
  };

  const fetchWagers = async () => {
    try {
      const wagersData = await apiCall('/wagers');
      setWagers(wagersData);
    } catch (error) {
      console.error('Failed to fetch wagers:', error);
    }
  };

  const fetchCart = async () => {
    try {
      const cartData = await apiCall('/cart');
      setCart(cartData);
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const leaderboardData = await apiCall('/leaderboard');
      setLeaderboard(leaderboardData);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    }
  };

  const fetchPendingWagers = async () => {
    try {
      const pendingData = await apiCall('/admin/wagers/pending');
      setPendingWagers(pendingData);
    } catch (error) {
      console.error('Failed to fetch pending wagers:', error);
    }
  };

  const handleLogin = async () => {
    setLoading(true);
    
    try {
      const response = await apiCall('/login', {
        method: 'POST',
        body: JSON.stringify(loginForm)
      });
      
      setToken(response.token);
      setUser(response.user);
      localStorage.setItem('token', response.token);
      setLoginForm({ username: '', password: '' });
    } catch (error) {
      alert('Login failed. Please check your credentials.');
    }
    
    setLoading(false);
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    setGames([]);
    setWagers([]);
    setCart([]);
    setLeaderboard([]);
    setPendingWagers([]);
    localStorage.removeItem('token');
  };

  const addToCart = async (gameId, team, amount, spread) => {
    setLoading(true);

    try {
      await apiCall('/cart', {
        method: 'POST',
        body: JSON.stringify({ gameId, team, amount, spread })
      });

      fetchCart();
      alert('Added to cart successfully!');
    } catch (error) {
      alert(error.message || 'Failed to add to cart.');
    }

    setLoading(false);
  };

  const removeFromCart = async (itemId) => {
    try {
      await apiCall(`/cart/${itemId}`, { method: 'DELETE' });
      fetchCart();
    } catch (error) {
      alert('Failed to remove from cart.');
    }
  };

  const submitCart = async () => {
    setLoading(true);

    try {
      await apiCall('/cart/submit', { method: 'POST' });
      fetchCart();
      fetchWagers();
      fetchUserData();
      alert('Cart submitted for admin approval!');
    } catch (error) {
      alert(error.message || 'Failed to submit cart.');
    }

    setLoading(false);
  };

  const handleWagerDecision = async (wagerId, decision) => {
    setLoading(true);

    try {
      await apiCall(`/admin/wagers/${wagerId}/decision`, {
        method: 'PUT',
        body: JSON.stringify({ decision })
      });

      fetchPendingWagers();
      fetchLeaderboard();
      alert(`Wager ${decision} successfully!`);
    } catch (error) {
      alert('Failed to process wager decision.');
    }

    setLoading(false);
  };

  const handleCreateUser = async () => {
    setLoading(true);

    try {
      await apiCall('/admin/users', {
        method: 'POST',
        body: JSON.stringify(adminForm)
      });

      setAdminForm({ username: '', password: '' });
      fetchLeaderboard();
      alert('User created successfully!');
    } catch (error) {
      alert('Failed to create user. Username may already exist.');
    }

    setLoading(false);
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 to-blue-800 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <Lock className="mx-auto h-12 w-12 text-green-600 mb-4" />
            <h1 className="text-3xl font-bold text-gray-900">Andy's Zipline</h1>
            <p className="text-gray-600 mt-2">Login to access your account</p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                type="text"
                value={loginForm.username}
                onChange={(e) => setLoginForm({...loginForm, username: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>

            <button
              type="button"
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </div>

          <div className="mt-6 text-center text-sm text-gray-600">
            Demo credentials: testuser / password
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getWagerStatus = (status) => {
    const statusStyles = {
      pending_approval: 'bg-yellow-100 text-yellow-800',
      active: 'bg-blue-100 text-blue-800',
      win: 'bg-green-100 text-green-800',
      loss: 'bg-red-100 text-red-800',
      push: 'bg-gray-100 text-gray-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return statusStyles[status] || statusStyles.pending_approval;
  };

  const getStatusText = (status) => {
    const statusText = {
      pending_approval: 'Pending Approval',
      active: 'Active',
      win: 'Win',
      loss: 'Loss',
      push: 'Push',
      rejected: 'Rejected'
    };
    return statusText[status] || status;
  };

  const minimumBet = Math.floor(user?.coins * 0.1) || 200;
  const cartTotal = cart.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Trophy className="h-8 w-8 text-green-600 mr-3" />
              <h1 className="text-xl font-bold text-gray-900">Andy's Zipline</h1>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center text-sm text-gray-600">
                <User className="h-4 w-4 mr-1" />
                {user?.username}
              </div>
              <div className="flex items-center text-sm font-medium text-green-600">
                <DollarSign className="h-4 w-4 mr-1" />
                {user?.coins} coins
              </div>
              {cart.length > 0 && (
                <div className="flex items-center text-sm font-medium text-blue-600">
                  <ShoppingCart className="h-4 w-4 mr-1" />
                  {cart.length} items
                </div>
              )}
              <button
                onClick={handleLogout}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {['games', 'cart', 'wagers', 'leaderboard'].concat(user?.username === 'admin' ? ['admin'] : []).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                  activeTab === tab
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab} {tab === 'cart' && cart.length > 0 && `(${cart.length})`}
                {tab === 'admin' && user?.username === 'admin' && pendingWagers.length > 0 && ` (${pendingWagers.length})`}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          
          {/* Games Tab */}
          {activeTab === 'games' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Available Games</h2>
                <div className="text-sm text-gray-600">
                  Minimum bet: {minimumBet} coins (10% of your balance)
                </div>
              </div>
              
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {games.map((game) => (
                  <div key={game.id} className="bg-white rounded-lg shadow p-6">
                    <div className="text-center mb-4">
                      <div className="text-sm text-gray-500 mb-2">
                        <Calendar className="inline h-4 w-4 mr-1" />
                        {formatDate(game.gameTime)}
                      </div>
                      <div className="font-semibold text-lg">
                        {game.awayTeam} @ {game.homeTeam}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="text-sm">{game.awayTeam}</span>
                        <span className="font-medium">+{game.awaySpread}</span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="text-sm">{game.homeTeam}</span>
                        <span className="font-medium">{game.homeSpread}</span>
                      </div>
                    </div>

                    <div className="mt-4 space-y-3">
                      <select 
                        id={`team-select-${game.id}`}
                        className="w-full px-3 py-2 border rounded-md text-sm"
                      >
                        <option value="">Select team</option>
                        <option value={`${game.homeTeam}|${game.homeSpread}`}>{game.homeTeam} ({game.homeSpread})</option>
                        <option value={`${game.awayTeam}|${game.awaySpread}`}>{game.awayTeam} (+{game.awaySpread})</option>
                      </select>

                      <input
                        id={`amount-${game.id}`}
                        type="number"
                        placeholder={`Minimum ${minimumBet} coins`}
                        className="w-full px-3 py-2 border rounded-md text-sm"
                        min={minimumBet}
                        max={user?.coins}
                      />

                      <button
                        type="button"
                        onClick={() => {
                          const teamSelect = document.getElementById(`team-select-${game.id}`);
                          const amountInput = document.getElementById(`amount-${game.id}`);
                          
                          if (!teamSelect.value || !amountInput.value) {
                            alert('Please select a team and enter an amount');
                            return;
                          }

                          const [team, spread] = teamSelect.value.split('|');
                          const amount = parseInt(amountInput.value);

                          if (amount < minimumBet) {
                            alert(`Minimum bet is ${minimumBet} coins`);
                            return;
                          }

                          addToCart(game.id, team, amount, parseFloat(spread));
                          teamSelect.value = '';
                          amountInput.value = '';
                        }}
                        disabled={loading}
                        className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 text-sm"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cart Tab */}
          {activeTab === 'cart' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Shopping Cart</h2>
                <div className="text-lg font-semibold text-green-600">
                  Total: {cartTotal} coins
                </div>
              </div>
              
              {cart.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <ShoppingCart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p>Your cart is empty</p>
                  <p className="text-sm mt-2">Add some wagers from the Games tab</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-white shadow rounded-lg overflow-hidden">
                    {cart.map((item) => (
                      <div key={item.id} className="p-6 border-b last:border-b-0">
                        <div className="flex justify-between items-center">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900">{item.gameName}</h3>
                            <p className="text-sm text-gray-600">
                              {item.team} ({item.spread > 0 ? '+' : ''}{item.spread})
                            </p>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="font-medium">{item.amount} coins</div>
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                    <div>
                      <p className="font-medium">Total: {cartTotal} coins</p>
                      <p className="text-sm text-gray-600">
                        {cartTotal > user?.coins ? 'Insufficient coins!' : 'Ready to submit for approval'}
                      </p>
                    </div>
                    <button
                      onClick={submitCart}
                      disabled={loading || cartTotal > user?.coins || cart.length === 0}
                      className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
                    >
                      Submit for Approval
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Wagers Tab */}
          {activeTab === 'wagers' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">My Wagers</h2>
              
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                  {wagers.map((wager) => {
                    const game = games.find(g => g.id === wager.gameId);
                    return (
                      <li key={wager.id} className="px-6 py-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">
                              {wager.team} ({wager.spread > 0 ? '+' : ''}{wager.spread})
                            </div>
                            <div className="text-sm text-gray-500">
                              {game ? `${game.awayTeam} @ ${game.homeTeam}` : 'Game not found'}
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <div className="font-medium">{wager.amount} coins</div>
                              <div className="text-sm text-gray-500">
                                {new Date(wager.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getWagerStatus(wager.status)}`}>
                              {getStatusText(wager.status)}
                            </span>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
                {wagers.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No wagers placed yet
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Leaderboard Tab */}
          {activeTab === 'leaderboard' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Leaderboard</h2>
              
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                  {leaderboard.map((player, index) => (
                    <li key={player.id} className="px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="mr-4">
                            {index === 0 && <Award className="h-6 w-6 text-yellow-500" />}
                            {index === 1 && <Award className="h-6 w-6 text-gray-400" />}
                            {index === 2 && <Award className="h-6 w-6 text-yellow-600" />}
                            {index > 2 && <span className="text-lg font-bold text-gray-400">#{index + 1}</span>}
                          </div>
                          <div>
                            <div className={`font-medium ${player.username === user?.username ? 'text-green-600' : 'text-gray-900'}`}>
                              {player.username} {player.username === user?.username && '(You)'}
                            </div>
                          </div>
                        </div>
                        <div className="font-bold text-green-600">
                          {player.coins} coins
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Admin Tab */}
          {activeTab === 'admin' && user?.username === 'admin' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Admin Panel</h2>
              
              {/* Pending Wagers */}
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Pending Wagers ({pendingWagers.length})
                </h3>
                {pendingWagers.length === 0 ? (
                  <p className="text-gray-500">No pending wagers</p>
                ) : (
                  <div className="space-y-4">
                    {pendingWagers.map((wager) => (
                      <div key={wager.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">{wager.username}</p>
                            <p className="text-sm text-gray-600">
                              {wager.gameName} - {wager.team} ({wager.spread > 0 ? '+' : ''}{wager.spread})
                            </p>
                            <p className="text-sm text-gray-500">{wager.amount} coins</p>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleWagerDecision(wager.id, 'approved')}
                              disabled={loading}
                              className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center"
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Approve
                            </button>
                            <button
                              onClick={() => handleWagerDecision(wager.id, 'rejected')}
                              disabled={loading}
                              className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center"
                            >
                              <X className="h-4 w-4 mr-1" />
                              Reject
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Create New User */}
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Create New User</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Username
                      </label>
                      <input
                        type="text"
                        value={adminForm.username}
                        onChange={(e) => setAdminForm({...adminForm, username: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Password
                      </label>
                      <input
                        type="password"
                        value={adminForm.password}
                        onChange={(e) => setAdminForm({...adminForm, password: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        required
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleCreateUser}
                    disabled={loading}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create User
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'admin' && user?.username !== 'admin' && (
            <div className="text-center py-8">
              <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
              <p className="text-gray-500">You don't have admin privileges.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;