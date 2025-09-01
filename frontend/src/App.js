import React, { useState, useEffect } from 'react';
import { User, Coins, Trophy, Calendar, Lock, Plus, Users, ShoppingCart, Check, X, Award, ChevronDown, ChevronUp } from 'lucide-react';

const API_BASE = 'https://andys-zipline-production.up.railway.app/api';

// NFL Teams for scrolling banner
const NFL_TEAMS = [
  'Arizona Cardinals', 'Atlanta Falcons', 'Baltimore Ravens', 'Buffalo Bills',
  'Carolina Panthers', 'Chicago Bears', 'Cincinnati Bengals', 'Cleveland Browns',
  'Dallas Cowboys', 'Denver Broncos', 'Detroit Lions', 'Green Bay Packers',
  'Houston Texans', 'Indianapolis Colts', 'Jacksonville Jaguars', 'Kansas City Chiefs',
  'Las Vegas Raiders', 'Los Angeles Chargers', 'Los Angeles Rams', 'Miami Dolphins',
  'Minnesota Vikings', 'New England Patriots', 'New Orleans Saints', 'New York Giants',
  'New York Jets', 'Philadelphia Eagles', 'Pittsburgh Steelers', 'San Francisco 49ers',
  'Seattle Seahawks', 'Tampa Bay Buccaneers', 'Tennessee Titans', 'Washington Commanders'
];

const ScrollingBanner = () => {
  return (
    <div className="bg-slate-900 border-y border-slate-700 overflow-hidden py-2">
      <div className="flex animate-scroll whitespace-nowrap">
        {[...NFL_TEAMS, ...NFL_TEAMS].map((team, index) => (
          <span
            key={index}
            className="text-emerald-400 font-semibold text-sm mx-8 flex items-center"
          >
            <Trophy className="h-4 w-4 mr-2" />
            {team}
          </span>
        ))}
      </div>
      <style jsx>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll {
          animation: scroll 60s linear infinite;
        }
      `}</style>
    </div>
  );
};

const App = () => {
  const [token, setToken] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  });
  const [user, setUser] = useState(null);
  const [games, setGames] = useState([]);
  const [wagers, setWagers] = useState([]);
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [groupedPendingWagers, setGroupedPendingWagers] = useState([]);
  const [activeTab, setActiveTab] = useState('games');
  const [loading, setLoading] = useState(false);

  // Admin panel collapsible sections
  const [adminSections, setAdminSections] = useState({
    pending: true,
    spreads: false,
    createUser: false
  });

  // Login form state
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });

  // Admin form state
  const [adminForm, setAdminForm] = useState({ username: '', password: '' });

  useEffect(() => {
    if (token) {
      fetchUserData();
      fetchGames();
      fetchWagers();
      fetchCart();
      fetchLeaderboard();
    }
  }, [token]);

  useEffect(() => {
    console.log('User data:', user);
    if (user?.isAdmin) {
      console.log('Fetching pending wagers for admin:', user.username);
      fetchGroupedPendingWagers();
    }
  }, [user?.isAdmin]);

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

  const fetchGroupedPendingWagers = async () => {
    try {
      const pendingData = await apiCall('/admin/wagers/pending/grouped');
      setGroupedPendingWagers(pendingData);
    } catch (error) {
      console.error('Failed to fetch grouped pending wagers:', error);
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
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', response.token);
      }
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
    setGroupedPendingWagers([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
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
      setCartOpen(false);
      alert('Cart submitted for admin approval!');
    } catch (error) {
      alert(error.message || 'Failed to submit cart.');
    }

    setLoading(false);
  };

  const handleUserWagerDecision = async (userId, decision) => {
    setLoading(true);

    try {
      await apiCall(`/admin/wagers/user/${userId}/decision`, {
        method: 'PUT',
        body: JSON.stringify({ decision })
      });

      fetchGroupedPendingWagers();
      fetchLeaderboard();
      alert(`User's wagers ${decision} successfully!`);
    } catch (error) {
      alert('Failed to process wager decision.');
    }

    setLoading(false);
  };

  const handleUpdateSpread = async (gameId, homeSpread) => {
    setLoading(true);

    try {
      await apiCall(`/admin/games/${gameId}/spreads`, {
        method: 'PUT',
        body: JSON.stringify({ homeSpread })
      });

      fetchGames();
      alert('Spread updated successfully!');
    } catch (error) {
      alert('Failed to update spread.');
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

  const toggleAdminSection = (section) => {
    setAdminSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <div className="bg-emerald-500/20 p-3 rounded-full">
                <Lock className="h-8 w-8 text-emerald-400" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Andy's Zipline</h1>
            <p className="text-slate-400">Login to access your account</p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Username
              </label>
              <input
                type="text"
                value={loginForm.username}
                onChange={(e) => setLoginForm({...loginForm, username: e.target.value})}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="Enter your username"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Password
              </label>
              <input
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="Enter your password"
                required
              />
            </div>

            <button
              type="button"
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 text-white py-3 px-4 rounded-lg font-medium hover:from-emerald-700 hover:to-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:opacity-50 transition-all duration-200"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
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
      pending_approval: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      active: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      win: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      loss: 'bg-red-500/20 text-red-300 border-red-500/30',
      push: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
      rejected: 'bg-red-500/20 text-red-300 border-red-500/30'
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

  const minimumCartTotal = Math.floor(user?.coins * 0.1) || 200;
  const cartTotal = cart.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="bg-emerald-500/20 p-2 rounded-lg mr-3">
                <Trophy className="h-6 w-6 text-emerald-400" />
              </div>
              <h1 className="text-xl font-bold text-white">Andy's Zipline</h1>
            </div>

            <div className="flex items-center space-x-6">
              <div className="flex items-center text-sm text-slate-300">
                <User className="h-4 w-4 mr-2" />
                <span className="text-white">{user?.username}</span>
                {user?.isAdmin && <span className="ml-2 px-2 py-1 bg-emerald-500/20 text-emerald-300 text-xs rounded-full border border-emerald-500/30">ADMIN</span>}
              </div>
              <div className="flex items-center text-sm font-medium text-emerald-400 bg-emerald-500/10 px-3 py-2 rounded-lg border border-emerald-500/20">
                <Coins className="h-4 w-4 mr-2" />
                {user?.coins} coins
              </div>
              {cart.length > 0 && (
                <button
                  onClick={() => setCartOpen(true)}
                  className="flex items-center text-sm font-medium text-blue-400 hover:text-blue-300 bg-blue-500/10 px-3 py-2 rounded-lg border border-blue-500/20 hover:bg-blue-500/20 transition-colors"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  {cart.length} items ({cartTotal} coins)
                </button>
              )}
              <button
                onClick={handleLogout}
                className="text-sm text-slate-400 hover:text-white transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* NFL Teams Scrolling Banner */}
      <ScrollingBanner />

      {/* Navigation */}
      <nav className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {['games', 'wagers', 'leaderboard'].concat(user?.isAdmin ? ['admin'] : []).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm capitalize transition-colors ${
                  activeTab === tab
                    ? 'border-emerald-500 text-emerald-400'
                    : 'border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-600'
                }`}
              >
                {tab}
                {tab === 'admin' && user?.isAdmin && groupedPendingWagers.length > 0 && 
                  <span className="ml-1 px-2 py-1 bg-red-500/20 text-red-300 text-xs rounded-full">
                    {groupedPendingWagers.length}
                  </span>
                }
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Sliding Cart Panel */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setCartOpen(false)}></div>
          <div className="absolute right-0 top-0 h-full w-96 bg-slate-800 border-l border-slate-700 shadow-xl transform transition-transform">
            <div className="flex items-center justify-between p-6 border-b border-slate-700">
              <h2 className="text-xl font-semibold text-white">Shopping Cart</h2>
              <button onClick={() => setCartOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              {cart.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <ShoppingCart className="mx-auto h-12 w-12 text-slate-600 mb-4" />
                  <p>Your cart is empty</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div key={item.id} className="bg-slate-700 border border-slate-600 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-medium text-white">{item.gameName}</h3>
                          <p className="text-sm text-slate-400">
                            {item.team} ({item.spread > 0 ? '+' : ''}{item.spread})
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="font-medium text-emerald-400">{item.amount} coins</div>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-400 hover:text-red-300 transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-slate-700 p-6">
              <div className="space-y-4">
                <div className="flex justify-between text-lg font-semibold">
                  <span className="text-white">Total:</span>
                  <span className="text-emerald-400">{cartTotal} coins</span>
                </div>
                <div className="text-sm text-slate-400">
                  {cartTotal < minimumCartTotal 
                    ? `Minimum cart total: ${minimumCartTotal} coins (10% of your balance)`
                    : cartTotal > user?.coins 
                    ? 'Insufficient coins!'
                    : 'Ready to submit for approval'
                  }
                </div>
                <button
                  onClick={submitCart}
                  disabled={loading || cartTotal < minimumCartTotal || cartTotal > user?.coins || cart.length === 0}
                  className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 text-white py-3 px-4 rounded-lg font-medium hover:from-emerald-700 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  Submit for Approval
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          
          {/* Games Tab */}
          {activeTab === 'games' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Available Games</h2>
                <div className="text-sm text-slate-400 bg-slate-800 px-3 py-2 rounded-lg border border-slate-700">
                  Cart minimum: {minimumCartTotal} coins total (10% of your balance)
                </div>
              </div>
              
              {/* Group games by time slots */}
              {(() => {
                const timeSlots = {
                  '1:00 PM ET': [],
                  '4:05 PM ET': [],
                  '4:25 PM ET': [], 
                  '8:20 PM ET': []
                };

                games.forEach(game => {
                  const gameTime = new Date(game.gameTime);
                  const hour = gameTime.getUTCHours();
                  const minute = gameTime.getUTCMinutes();
                  
                  if (hour === 17 && minute === 0) {
                    timeSlots['1:00 PM ET'].push(game);
                  } else if (hour === 20 && minute === 5) {
                    timeSlots['4:05 PM ET'].push(game);
                  } else if (hour === 20 && minute === 25) {
                    timeSlots['4:25 PM ET'].push(game);
                  } else if (hour === 0 && minute === 20) {
                    timeSlots['8:20 PM ET'].push(game);
                  } else {
                    if (hour >= 17 && hour < 20) {
                      timeSlots['1:00 PM ET'].push(game);
                    } else if (hour >= 20 && hour < 23) {
                      timeSlots['4:25 PM ET'].push(game);
                    } else {
                      timeSlots['8:20 PM ET'].push(game);
                    }
                  }
                });

                return Object.entries(timeSlots).map(([timeSlot, slotGames]) => (
                  slotGames.length > 0 && (
                    <div key={timeSlot} className="space-y-4">
                      <div className="border-b border-slate-700 pb-3">
                        <h3 className="text-xl font-semibold text-white flex items-center">
                          <Calendar className="h-5 w-5 mr-2 text-emerald-400" />
                          {timeSlot} Games
                        </h3>
                      </div>
                      
                      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {slotGames.map((game) => (
                          <div key={game.id} className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-slate-600 transition-colors shadow-lg">
                            <div className="text-center mb-4">
                              <div className="text-sm text-slate-400 mb-2">
                                <Calendar className="inline h-4 w-4 mr-1" />
                                {formatDate(game.gameTime)}
                              </div>
                              <div className="font-semibold text-lg text-white">
                                {game.awayTeam} @ {game.homeTeam}
                              </div>
                            </div>

                            <div className="space-y-3 mb-4">
                              <div className="flex justify-between items-center p-3 bg-slate-700/50 rounded-lg border border-slate-600/50">
                                <span className="text-sm text-slate-300">{game.awayTeam}</span>
                                <span className="font-bold text-emerald-400">+{Math.abs(game.awaySpread)}</span>
                              </div>
                              <div className="flex justify-between items-center p-3 bg-slate-700/50 rounded-lg border border-slate-600/50">
                                <span className="text-sm text-slate-300">{game.homeTeam}</span>
                                <span className="font-bold text-emerald-400">{game.homeSpread}</span>
                              </div>
                            </div>

                            <div className="space-y-3">
                              <select 
                                id={`team-select-${game.id}`}
                                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                              >
                                <option value="">Select team</option>
                                <option value={`${game.homeTeam}|${game.homeSpread}`}>{game.homeTeam} ({game.homeSpread})</option>
                                <option value={`${game.awayTeam}|${game.awaySpread}`}>{game.awayTeam} (+{Math.abs(game.awaySpread)})</option>
                              </select>

                              <input
                                id={`amount-${game.id}`}
                                type="number"
                                placeholder="Wager amount"
                                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                min="1"
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

                                  if (amount < 1) {
                                    alert('Amount must be at least 1 coin');
                                    return;
                                  }

                                  addToCart(game.id, team, amount, parseFloat(spread));
                                  teamSelect.value = '';
                                  amountInput.value = '';
                                }}
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 text-white py-2 px-4 rounded-lg hover:from-emerald-700 hover:to-emerald-600 disabled:opacity-50 text-sm font-medium transition-all duration-200"
                              >
                                Add to Cart
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                ));
              })()}
              
              {games.length === 0 && (
                <div className="text-center py-12">
                  <Calendar className="mx-auto h-12 w-12 text-slate-600 mb-4" />
                  <p className="text-slate-400 text-lg">No games available</p>
                  <p className="text-slate-500 text-sm">Games will appear here once loaded from ESPN</p>
                </div>
              )}
            </div>
          )}

          {/* Wagers Tab */}
          {activeTab === 'wagers' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white">My Wagers</h2>
              
              <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-lg overflow-hidden">
                <ul className="divide-y divide-slate-700">
                  {wagers.map((wager) => {
                    const game = games.find(g => g.id === wager.gameId);
                    return (
                      <li key={wager.id} className="p-6 hover:bg-slate-750 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="font-medium text-white">
                              {wager.team} ({wager.spread > 0 ? '+' : ''}{wager.spread})
                            </div>
                            <div className="text-sm text-slate-400">
                              {game ? `${game.awayTeam} @ ${game.homeTeam}` : 'Game not found'}
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <div className="font-medium text-emerald-400">{wager.amount} coins</div>
                              <div className="text-sm text-slate-500">
                                {new Date(wager.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getWagerStatus(wager.status)}`}>
                              {getStatusText(wager.status)}
                            </span>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
                {wagers.length === 0 && (
                  <div className="text-center py-8 text-slate-400">
                    No wagers placed yet
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Leaderboard Tab */}
          {activeTab === 'leaderboard' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white">Leaderboard</h2>
              
              <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-lg overflow-hidden">
                <ul className="divide-y divide-slate-700">
                  {leaderboard.map((player, index) => (
                    <li key={player.id} className="p-6 hover:bg-slate-750 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="mr-4">
                            {index === 0 && <Award className="h-6 w-6 text-yellow-400" />}
                            {index === 1 && <Award className="h-6 w-6 text-slate-400" />}
                            {index === 2 && <Award className="h-6 w-6 text-amber-600" />}
                            {index > 2 && <span className="text-lg font-bold text-slate-500">#{index + 1}</span>}
                          </div>
                          <div>
                            <div className={`font-medium ${player.username === user?.username ? 'text-emerald-400' : 'text-white'}`}>
                              {player.username} {player.username === user?.username && '(You)'}
                            </div>
                          </div>
                        </div>
                        <div className="font-bold text-emerald-400">
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
          {activeTab === 'admin' && user?.isAdmin && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white">Admin Panel</h2>
              
              {/* Pending Wagers - Collapsible */}
              <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-lg">
                <div 
                  className="p-6 border-b border-slate-700 cursor-pointer flex justify-between items-center hover:bg-slate-750 transition-colors"
                  onClick={() => toggleAdminSection('pending')}
                >
                  <h3 className="text-lg font-medium text-white">
                    Pending Wagers ({groupedPendingWagers.length})
                  </h3>
                  {adminSections.pending ? <ChevronUp className="h-5 w-5 text-slate-400" /> : <ChevronDown className="h-5 w-5 text-slate-400" />}
                </div>
                
                {adminSections.pending && (
                  <div className="p-6">
                    {groupedPendingWagers.length === 0 ? (
                      <p className="text-slate-400">No pending wagers</p>
                    ) : (
                      <div className="space-y-4">
                        {groupedPendingWagers.map((userGroup) => (
                          <div key={userGroup.userId} className="bg-slate-700 border border-slate-600 rounded-lg p-4">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h4 className="font-medium text-lg text-white">{userGroup.username}</h4>
                                <p className="text-sm text-slate-400">
                                  {userGroup.wagers.length} wagers • Total: {userGroup.totalAmount} coins
                                </p>
                              </div>
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleUserWagerDecision(userGroup.userId, 'approved')}
                                  disabled={loading}
                                  className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 disabled:opacity-50 flex items-center transition-colors"
                                >
                                  <Check className="h-4 w-4 mr-1" />
                                  Approve All
                                </button>
                                <button
                                  onClick={() => handleUserWagerDecision(userGroup.userId, 'rejected')}
                                  disabled={loading}
                                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center transition-colors"
                                >
                                  <X className="h-4 w-4 mr-1" />
                                  Reject All
                                </button>
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              {userGroup.wagers.map((wager) => (
                                <div key={wager.id} className="bg-slate-600 p-3 rounded text-sm border border-slate-500">
                                  <span className="text-white font-medium">{wager.gameName}</span>
                                  <span className="text-slate-300"> - {wager.team} ({wager.spread > 0 ? '+' : ''}{wager.spread}) - </span>
                                  <span className="text-emerald-400 font-medium">{wager.amount} coins</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Game Spreads - Collapsible */}
              <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-lg">
                <div 
                  className="p-6 border-b border-slate-700 cursor-pointer flex justify-between items-center hover:bg-slate-750 transition-colors"
                  onClick={() => toggleAdminSection('spreads')}
                >
                  <h3 className="text-lg font-medium text-white">
                    Set Game Spreads
                  </h3>
                  {adminSections.spreads ? <ChevronUp className="h-5 w-5 text-slate-400" /> : <ChevronDown className="h-5 w-5 text-slate-400" />}
                </div>
                
                {adminSections.spreads && (
                  <div className="p-6">
                    <div className="space-y-4">
                      {games.map((game) => (
                        <div key={game.id} className="bg-slate-700 border border-slate-600 rounded-lg p-4">
                          <div className="flex justify-between items-center">
                            <div className="flex-1">
                              <p className="font-medium text-white">
                                Game #{game.id}: {game.awayTeam} @ {game.homeTeam}
                              </p>
                              <p className="text-sm text-slate-400">
                                {formatDate(game.gameTime)}
                              </p>
                              <p className="text-sm text-slate-300 mt-1">
                                Current spread: {game.homeTeam} {game.homeSpread} / {game.awayTeam} +{Math.abs(game.awaySpread)}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2 ml-4">
                              <input
                                id={`spread-${game.id}`}
                                type="number"
                                step="0.5"
                                placeholder="Home spread"
                                className="w-24 px-2 py-1 bg-slate-600 border border-slate-500 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                defaultValue={game.homeSpread}
                              />
                              <button
                                onClick={() => {
                                  const spreadInput = document.getElementById(`spread-${game.id}`);
                                  const newSpread = parseFloat(spreadInput.value);
                                  if (isNaN(newSpread)) {
                                    alert('Please enter a valid number');
                                    return;
                                  }
                                  handleUpdateSpread(game.id, newSpread);
                                }}
                                disabled={loading}
                                className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 disabled:opacity-50 transition-colors"
                              >
                                Update
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                      {games.length === 0 && (
                        <p className="text-slate-400">No games available to set spreads</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Create User - Collapsible */}
              <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-lg">
                <div 
                  className="p-6 border-b border-slate-700 cursor-pointer flex justify-between items-center hover:bg-slate-750 transition-colors"
                  onClick={() => toggleAdminSection('createUser')}
                >
                  <h3 className="text-lg font-medium text-white">
                    Create New User
                  </h3>
                  {adminSections.createUser ? <ChevronUp className="h-5 w-5 text-slate-400" /> : <ChevronDown className="h-5 w-5 text-slate-400" />}
                </div>
                
                {adminSections.createUser && (
                  <div className="p-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Username
                        </label>
                        <input
                          type="text"
                          value={adminForm.username}
                          onChange={(e) => setAdminForm({...adminForm, username: e.target.value})}
                          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          placeholder="Enter username"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Password
                        </label>
                        <input
                          type="password"
                          value={adminForm.password}
                          onChange={(e) => setAdminForm({...adminForm, password: e.target.value})}
                          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          placeholder="Enter password"
                        />
                      </div>

                      <button
                        onClick={handleCreateUser}
                        disabled={loading || !adminForm.username || !adminForm.password}
                        className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 disabled:opacity-50 flex items-center transition-colors"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Create User
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default App;