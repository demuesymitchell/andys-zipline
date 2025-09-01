import React, { useState, useEffect } from 'react';
import { User, Coins, Trophy, Calendar, Lock, Plus, Users, ShoppingCart, Check, X, Award, ChevronDown, ChevronUp } from 'lucide-react';

const API_BASE = 'https://andys-zipline-production.up.railway.app/api';

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
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-lg shadow-2xl p-8 w-full max-w-md border border-gray-700">
          <div className="text-center mb-8">
            <Lock className="mx-auto h-12 w-12 text-emerald-500 mb-4" />
            <h1 className="text-3xl font-bold text-white">Andy's Zipline</h1>
            <p className="text-gray-400 mt-2">Login to access your account</p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Username
              </label>
              <input
                type="text"
                value={loginForm.username}
                onChange={(e) => setLoginForm({...loginForm, username: e.target.value})}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <button
              type="button"
              onClick={handleLogin}
              disabled={loading || !loginForm.username || !loginForm.password}
              className="w-full bg-emerald-600 text-white py-2 px-4 rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
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

  const minimumCartTotal = Math.floor(user?.coins * 0.1) || 200;
  const cartTotal = cart.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 shadow-sm border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="bg-blue-600 text-white px-2 py-1 rounded font-bold text-lg mr-3">
                AZ
              </div>
              <h1 className="text-xl font-bold text-white">Andy's Zipline</h1>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center text-sm text-gray-300">
                <User className="h-4 w-4 mr-1" />
                {user?.username} {user?.isAdmin && <span className="ml-2 px-2 py-1 bg-emerald-900 text-emerald-300 text-xs rounded-full">(ADMIN)</span>}
              </div>
              <div className="flex items-center text-sm font-medium text-yellow-400">
                <Coins className="h-4 w-4 mr-1" />
                {user?.coins} coins
              </div>
              {cart.length > 0 && (
                <button
                  onClick={() => setCartOpen(true)}
                  className="flex items-center text-sm font-medium text-blue-400 hover:text-blue-300"
                >
                  <ShoppingCart className="h-4 w-4 mr-1" />
                  {cart.length} items ({cartTotal} coins)
                </button>
              )}
              <button
                onClick={handleLogout}
                className="text-sm text-gray-400 hover:text-white"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* NFL Teams Banner with Scrolling Logos */}
      <div className="bg-gray-800 border-b border-gray-700 py-4 overflow-hidden relative">
        <div className="flex animate-scroll whitespace-nowrap">
          {[
            'https://a.espncdn.com/i/teamlogos/nfl/500/ari.png',
            'https://a.espncdn.com/i/teamlogos/nfl/500/atl.png',
            'https://a.espncdn.com/i/teamlogos/nfl/500/bal.png',
            'https://a.espncdn.com/i/teamlogos/nfl/500/buf.png',
            'https://a.espncdn.com/i/teamlogos/nfl/500/car.png',
            'https://a.espncdn.com/i/teamlogos/nfl/500/chi.png',
            'https://a.espncdn.com/i/teamlogos/nfl/500/cin.png',
            'https://a.espncdn.com/i/teamlogos/nfl/500/cle.png',
            'https://a.espncdn.com/i/teamlogos/nfl/500/dal.png',
            'https://a.espncdn.com/i/teamlogos/nfl/500/den.png',
            'https://a.espncdn.com/i/teamlogos/nfl/500/det.png',
            'https://a.espncdn.com/i/teamlogos/nfl/500/gb.png',
            'https://a.espncdn.com/i/teamlogos/nfl/500/hou.png',
            'https://a.espncdn.com/i/teamlogos/nfl/500/ind.png',
            'https://a.espncdn.com/i/teamlogos/nfl/500/jax.png',
            'https://a.espncdn.com/i/teamlogos/nfl/500/kc.png',
            'https://a.espncdn.com/i/teamlogos/nfl/500/lv.png',
            'https://a.espncdn.com/i/teamlogos/nfl/500/lac.png',
            'https://a.espncdn.com/i/teamlogos/nfl/500/lar.png',
            'https://a.espncdn.com/i/teamlogos/nfl/500/mia.png',
            'https://a.espncdn.com/i/teamlogos/nfl/500/min.png',
            'https://a.espncdn.com/i/teamlogos/nfl/500/ne.png',
            'https://a.espncdn.com/i/teamlogos/nfl/500/no.png',
            'https://a.espncdn.com/i/teamlogos/nfl/500/nyg.png',
            'https://a.espncdn.com/i/teamlogos/nfl/500/nyj.png',
            'https://a.espncdn.com/i/teamlogos/nfl/500/phi.png',
            'https://a.espncdn.com/i/teamlogos/nfl/500/pit.png',
            'https://a.espncdn.com/i/teamlogos/nfl/500/sf.png',
            'https://a.espncdn.com/i/teamlogos/nfl/500/sea.png',
            'https://a.espncdn.com/i/teamlogos/nfl/500/tb.png',
            'https://a.espncdn.com/i/teamlogos/nfl/500/ten.png',
            'https://a.espncdn.com/i/teamlogos/nfl/500/wsh.png'
          ].concat([
            'https://a.espncdn.com/i/teamlogos/nfl/500/ari.png',
            'https://a.espncdn.com/i/teamlogos/nfl/500/atl.png',
            'https://a.espncdn.com/i/teamlogos/nfl/500/bal.png',
            'https://a.espncdn.com/i/teamlogos/nfl/500/buf.png',
            'https://a.espncdn.com/i/teamlogos/nfl/500/car.png',
            'https://a.espncdn.com/i/teamlogos/nfl/500/chi.png',
            'https://a.espncdn.com/i/teamlogos/nfl/500/cin.png',
            'https://a.espncdn.com/i/teamlogos/nfl/500/cle.png',
            'https://a.espncdn.com/i/teamlogos/nfl/500/dal.png',
            'https://a.espncdn.com/i/teamlogos/nfl/500/den.png',
            'https://a.espncdn.com/i/teamlogos/nfl/500/det.png',
            'https://a.espncdn.com/i/teamlogos/nfl/500/gb.png',
            'https://a.espncdn.com/i/teamlogos/nfl/500/hou.png',
            'https://a.espncdn.com/i/teamlogos/nfl/500/ind.png',
            'https://a.espncdn.com/i/teamlogos/nfl/500/jax.png',
            'https://a.espncdn.com/i/teamlogos/nfl/500/kc.png',
            'https://a.espncdn.com/i/teamlogos/nfl/500/lv.png',
            'https://a.espncdn.com/i/teamlogos/nfl/500/lac.png',
            'https://a.espncdn.com/i/teamlogos/nfl/500/lar.png',
            'https://a.espncdn.com/i/teamlogos/nfl/500/mia.png',
            'https://a.espncdn.com/i/teamlogos/nfl/500/min.png',
            'https://a.espncdn.com/i/teamlogos/nfl/500/ne.png',
            'https://a.espncdn.com/i/teamlogos/nfl/500/no.png',
            'https://a.espncdn.com/i/teamlogos/nfl/500/nyg.png',
            'https://a.espncdn.com/i/teamlogos/nfl/500/nyj.png',
            'https://a.espncdn.com/i/teamlogos/nfl/500/phi.png',
            'https://a.espncdn.com/i/teamlogos/nfl/500/pit.png',
            'https://a.espncdn.com/i/teamlogos/nfl/500/sf.png',
            'https://a.espncdn.com/i/teamlogos/nfl/500/sea.png',
            'https://a.espncdn.com/i/teamlogos/nfl/500/tb.png',
            'https://a.espncdn.com/i/teamlogos/nfl/500/ten.png',
            'https://a.espncdn.com/i/teamlogos/nfl/500/wsh.png'
          ]).map((logoUrl, index) => (
            <img 
              key={index}
              src={logoUrl} 
              alt="NFL Team"
              className="h-10 w-10 mx-4 flex-shrink-0"
            />
          ))}
        </div>
        <style jsx>{`
          @keyframes scroll {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .animate-scroll {
            animation: scroll 30s linear infinite;
          }
        `}</style>
      </div>

      {/* Navigation */}
      <nav className="bg-gray-800 shadow-sm border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {['games', 'wagers', 'leaderboard'].concat(user?.isAdmin ? ['admin'] : []).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm capitalize transition-colors ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-gray-300 hover:text-white hover:border-gray-500'
                }`}
              >
                {tab}
                {tab === 'admin' && user?.isAdmin && groupedPendingWagers.length > 0 && ` (${groupedPendingWagers.length})`}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Sliding Cart Panel */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setCartOpen(false)}></div>
          <div className="absolute right-0 top-0 h-full w-96 bg-gray-800 shadow-xl transform transition-transform">
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <h2 className="text-xl font-semibold text-white">Shopping Cart</h2>
              <button onClick={() => setCartOpen(false)} className="text-gray-400 hover:text-white">
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              {cart.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <ShoppingCart className="mx-auto h-12 w-12 text-gray-600 mb-4" />
                  <p>Your cart is empty</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div key={item.id} className="border border-gray-600 rounded-lg p-4 bg-gray-700">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-medium text-white">{item.gameName}</h3>
                          <p className="text-sm text-gray-400">
                            {item.team} ({item.spread > 0 ? '+' : ''}{item.spread})
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="font-medium text-yellow-400">{item.amount} coins</div>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-400 hover:text-red-300"
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

            <div className="border-t border-gray-700 p-6">
              <div className="space-y-4">
                <div className="flex justify-between text-lg font-semibold">
                  <span className="text-white">Total:</span>
                  <span className="text-yellow-400">{cartTotal} coins</span>
                </div>
                <div className="text-sm text-gray-400">
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
                  className="w-full bg-emerald-600 text-white py-3 px-4 rounded-md hover:bg-emerald-700 disabled:opacity-50 font-medium"
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
                <div className="text-sm text-gray-400">
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
                      <div className="border-b border-gray-700 pb-2">
                        <h3 className="text-xl font-semibold text-white flex items-center">
                          <Calendar className="h-5 w-5 mr-2 text-emerald-500" />
                          {timeSlot} Games
                        </h3>
                      </div>
                      
                      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {slotGames.map((game) => (
                          <div key={game.id} className="bg-gray-800 rounded-lg shadow p-6 border-l-4 border-emerald-500">
                            <div className="text-center mb-4">
                              <div className="text-sm text-gray-400 mb-2">
                                <Calendar className="inline h-4 w-4 mr-1" />
                                {formatDate(game.gameTime)}
                              </div>
                              <div className="font-semibold text-lg text-white">
                                {game.awayTeam} @ {game.homeTeam}
                              </div>
                            </div>

                            <div className="space-y-3">
                              <div className="flex justify-between items-center p-2 bg-gray-700 rounded">
                                <span className="text-sm text-gray-300">{game.awayTeam}</span>
                                <span className="font-medium text-yellow-400">+{Math.abs(game.awaySpread)}</span>
                              </div>
                              <div className="flex justify-between items-center p-2 bg-gray-700 rounded">
                                <span className="text-sm text-gray-300">{game.homeTeam}</span>
                                <span className="font-medium text-yellow-400">{game.homeSpread}</span>
                              </div>
                            </div>

                            <div className="mt-4 space-y-3">
                              <select 
                                id={`team-select-${game.id}`}
                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white text-sm"
                              >
                                <option value="">Select team</option>
                                <option value={`${game.homeTeam}|${game.homeSpread}`}>{game.homeTeam} ({game.homeSpread})</option>
                                <option value={`${game.awayTeam}|${game.awaySpread}`}>{game.awayTeam} (+{Math.abs(game.awaySpread)})</option>
                              </select>

                              <input
                                id={`amount-${game.id}`}
                                type="number"
                                placeholder="Wager amount"
                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white text-sm"
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
                                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm"
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
                  <Calendar className="mx-auto h-12 w-12 text-gray-600 mb-4" />
                  <p className="text-gray-400 text-lg">No games available</p>
                  <p className="text-gray-500 text-sm">Games will appear here once loaded from ESPN</p>
                </div>
              )}
            </div>
          )}

          {/* Wagers Tab */}
          {activeTab === 'wagers' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white">My Wagers</h2>
              
              <div className="bg-gray-800 shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-700">
                  {wagers.map((wager) => {
                    const game = games.find(g => g.id === wager.gameId);
                    return (
                      <li key={wager.id} className="px-6 py-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="font-medium text-white">
                              {wager.team} ({wager.spread > 0 ? '+' : ''}{wager.spread})
                            </div>
                            <div className="text-sm text-gray-400">
                              {game ? `${game.awayTeam} @ ${game.homeTeam}` : 'Game not found'}
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <div className="font-medium text-yellow-400">{wager.amount} coins</div>
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
                  <div className="text-center py-8 text-gray-400">
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
              
              <div className="bg-gray-800 shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-700">
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
                            <div className={`font-medium ${player.username === user?.username ? 'text-yellow-400' : 'text-white'}`}>
                              {player.username} {player.username === user?.username && '(You)'}
                            </div>
                          </div>
                        </div>
                        <div className="font-bold text-yellow-400">
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
              <div className="bg-gray-800 shadow rounded-lg">
                <div 
                  className="p-6 border-b border-gray-700 cursor-pointer flex justify-between items-center hover:bg-gray-700"
                  onClick={() => toggleAdminSection('pending')}
                >
                  <h3 className="text-lg font-medium text-white">
                    Pending Wagers ({groupedPendingWagers.length})
                  </h3>
                  {adminSections.pending ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
                </div>
                
                {adminSections.pending && (
                  <div className="p-6">
                    {groupedPendingWagers.length === 0 ? (
                      <p className="text-gray-400">No pending wagers</p>
                    ) : (
                      <div className="space-y-4">
                        {groupedPendingWagers.map((userGroup) => (
                          <div key={userGroup.userId} className="border border-gray-600 rounded-lg p-4 bg-gray-700">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h4 className="font-medium text-lg text-white">{userGroup.username}</h4>
                                <p className="text-sm text-gray-400">
                                  {userGroup.wagers.length} wagers • Total: {userGroup.totalAmount} coins
                                </p>
                              </div>
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleUserWagerDecision(userGroup.userId, 'approved')}
                                  disabled={loading}
                                  className="bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 disabled:opacity-50 flex items-center"
                                >
                                  <Check className="h-4 w-4 mr-1" />
                                  Approve All
                                </button>
                                <button
                                  onClick={() => handleUserWagerDecision(userGroup.userId, 'rejected')}
                                  disabled={loading}
                                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center"
                                >
                                  <X className="h-4 w-4 mr-1" />
                                  Reject All
                                </button>
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              {userGroup.wagers.map((wager) => (
                                <div key={wager.id} className="bg-gray-600 p-3 rounded text-sm">
                                  <strong className="text-white">{wager.gameName}</strong> - {wager.team} ({wager.spread > 0 ? '+' : ''}{wager.spread}) - <span className="text-yellow-400">{wager.amount} coins</span>
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
              <div className="bg-gray-800 shadow rounded-lg">
                <div 
                  className="p-6 border-b border-gray-700 cursor-pointer flex justify-between items-center hover:bg-gray-700"
                  onClick={() => toggleAdminSection('spreads')}
                >
                  <h3 className="text-lg font-medium text-white">
                    Set Game Spreads
                  </h3>
                  {adminSections.spreads ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
                </div>
                
                {adminSections.spreads && (
                  <div className="p-6">
                    <div className="space-y-4">
                      {games.map((game) => (
                        <div key={game.id} className="border border-gray-600 rounded-lg p-4 bg-gray-700">
                          <div className="flex justify-between items-center">
                            <div className="flex-1">
                              <p className="font-medium text-white">
                                Game #{game.id}: {game.awayTeam} @ {game.homeTeam}
                              </p>
                              <p className="text-sm text-gray-400">
                                {formatDate(game.gameTime)}
                              </p>
                              <p className="text-sm text-gray-300 mt-1">
                                Current spread: {game.homeTeam} {game.homeSpread} / {game.awayTeam} +{Math.abs(game.awaySpread)}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2 ml-4">
                              <input
                                id={`spread-${game.id}`}
                                type="number"
                                step="0.5"
                                placeholder="Home spread"
                                className="w-24 px-2 py-1 bg-gray-600 border border-gray-500 rounded text-white text-sm"
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
                                className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
                              >
                                Update
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                      {games.length === 0 && (
                        <p className="text-gray-400">No games available to set spreads</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Create User - Collapsible */}
              <div className="bg-gray-800 shadow rounded-lg">
                <div 
                  className="p-6 border-b border-gray-700 cursor-pointer flex justify-between items-center hover:bg-gray-700"
                  onClick={() => toggleAdminSection('createUser')}
                >
                  <h3 className="text-lg font-medium text-white">
                    Create New User
                  </h3>
                  {adminSections.createUser ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
                </div>
                
                {adminSections.createUser && (
                  <div className="p-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Username
                        </label>
                        <input
                          type="text"
                          value={adminForm.username}
                          onChange={(e) => setAdminForm({...adminForm, username: e.target.value})}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          placeholder="Enter username"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Password
                        </label>
                        <input
                          type="password"
                          value={adminForm.password}
                          onChange={(e) => setAdminForm({...adminForm, password: e.target.value})}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          placeholder="Enter password"
                        />
                      </div>

                      <button
                        onClick={handleCreateUser}
                        disabled={loading || !adminForm.username || !adminForm.password}
                        className="bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 disabled:opacity-50 flex items-center"
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