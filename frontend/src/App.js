// frontend/src/App.js - REFACTORED VERSION
import React, { useState, useEffect } from 'react';

// Import components
import LoginPage from './components/LoginPage';
import Header from './components/Header';
import Navigation from './components/Navigation';
import Cart from './components/Cart';
import EditWagerModal from './components/EditWagerModal';
import GamesTab from './components/GamesTab';
import WagersTab from './components/WagersTab';
import PlacedWagersTab from './components/PlacedWagersTab';
import LeaderboardTab from './components/LeaderboardTab';
import AdminPanel from './components/AdminPanel';
import WelcomeModal from './components/WelcomeModal';
import { ToastContainer, useToast } from './components/Toast';

// Import utilities and data
import { apiCall, getStoredToken, setStoredToken, removeStoredToken } from './utils/api';
import { week7SundayGames } from './data/week7Games';

const App = () => {
  // Toast notifications
  const { toasts, removeToast, showSuccess, showError, showInfo } = useToast();
  
  // State management
  const [token, setToken] = useState(() => getStoredToken());
  const [user, setUser] = useState(null);
  const [games, setGames] = useState([]);
  const [wagers, setWagers] = useState([]);
  const [wagerHistory, setWagerHistory] = useState(null);
  const [adminActiveWagers, setAdminActiveWagers] = useState([]);
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [groupedPendingWagers, setGroupedPendingWagers] = useState([]);
  const [activeTab, setActiveTab] = useState('games');
  const [loading, setLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);

  // Admin state
  const [adminSections, setAdminSections] = useState({
    pending: true,
    spreads: false,
    settlement: false,
    createUser: false
  });

  // Form state
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [adminForm, setAdminForm] = useState({ username: '', password: '' });
  const [editWagerModal, setEditWagerModal] = useState({
    open: false,
    wager: null,
    amount: ''
  });

  // Fetch data on mount
  useEffect(() => {
    if (token) {
      fetchUserData();
      fetchGames();
      fetchCart();
      fetchLeaderboard();
      // Show welcome modal when token is set (after login)
      setShowWelcome(true);
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      fetchWagers();
      fetchWagerHistory();
    }
  }, [user]);

  useEffect(() => {
    if (user?.isAdmin) {
      fetchGroupedPendingWagers();
      fetchAdminActiveWagers();
    }
  }, [user?.isAdmin]);

  // API fetch functions
  const fetchUserData = async () => {
    try {
      const userData = await apiCall('/user', token);
      setUser(userData);
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      handleLogout();
    }
  };

  const fetchGames = async () => {
    try {
      const gamesData = await apiCall('/games', token);
      setGames(gamesData.length > 0 ? gamesData : week7SundayGames);
    } catch (error) {
      console.error('Failed to fetch games:', error);
      setGames(week7SundayGames);
    }
  };

  const fetchWagers = async () => {
    try {
      const wagersData = await apiCall('/wagers', token);
      setWagers(wagersData || []);
    } catch (error) {
      console.error('Failed to fetch wagers:', error);
      setWagers([]);
    }
  };

  const fetchWagerHistory = async () => {
    try {
      const historyData = await apiCall('/wagers/history', token);
      setWagerHistory(historyData || null);
    } catch (error) {
      console.error('Failed to fetch wager history:', error);
      setWagerHistory(null);
    }
  };

  const fetchAdminActiveWagers = async () => {
    try {
      const wagersData = await apiCall('/admin/wagers/active', token);
      setAdminActiveWagers(wagersData || []);
    } catch (error) {
      console.error('Failed to fetch admin active wagers:', error);
      setAdminActiveWagers([]);
    }
  };

  const fetchCart = async () => {
    try {
      const cartData = await apiCall('/cart', token);
      setCart(cartData || []);
    } catch (error) {
      console.error('Failed to fetch cart:', error);
      setCart([]);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const leaderboardData = await apiCall('/leaderboard', token);
      setLeaderboard(leaderboardData || []);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
      setLeaderboard([]);
    }
  };

  const fetchGroupedPendingWagers = async () => {
    try {
      const pendingData = await apiCall('/admin/wagers/pending', token);
      setGroupedPendingWagers(pendingData || []);
    } catch (error) {
      console.error('Failed to fetch grouped pending wagers:', error);
      setGroupedPendingWagers([]);
    }
  };

  // Auth handlers
  const handleLogin = async () => {
    setLoading(true);
    try {
      const response = await apiCall('/login', token, {
        method: 'POST',
        body: JSON.stringify(loginForm)
      });
      setToken(response.token);
      setUser(response.user);
      setStoredToken(response.token);
      setLoginForm({ username: '', password: '' });
      // Welcome modal will be shown by useEffect when token changes
    } catch (error) {
      showError('Login failed. Please check your credentials.');
    }
    setLoading(false);
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    setGames([]);
    setWagers([]);
    setAdminActiveWagers([]);
    setCart([]);
    setLeaderboard([]);
    setGroupedPendingWagers([]);
    removeStoredToken();
  };

  // Cart handlers
  const addToCart = async (gameId, team, amount, spread) => {
    setLoading(true);
    try {
      await apiCall('/cart', token, {
        method: 'POST',
        body: JSON.stringify({ gameId, team, amount, spread })
      });
      fetchCart();
      showSuccess('Added to cart successfully!');
    } catch (error) {
      showError(error.message || 'Failed to add to cart.');
    }
    setLoading(false);
  };

  const removeFromCart = async (itemId) => {
    try {
      await apiCall(`/cart/${itemId}`, token, { method: 'DELETE' });
      fetchCart();
    } catch (error) {
      showError('Failed to remove from cart.');
    }
  };

  const submitCart = async () => {
    setLoading(true);
    try {
      await apiCall('/cart/submit', token, { method: 'POST' });
      fetchCart();
      fetchWagers();
      fetchUserData();
      if (user?.isAdmin) {
        fetchGroupedPendingWagers();
      }
      setCartOpen(false);
      showSuccess('Cart submitted for admin approval!');
    } catch (error) {
      showError(error.message || 'Failed to submit cart.');
    }
    setLoading(false);
  };

  // Wager handlers
  const handleEditWager = async () => {
    setLoading(true);
    try {
      await apiCall(`/wagers/${editWagerModal.wager.id}`, token, {
        method: 'PUT',
        body: JSON.stringify({ amount: parseInt(editWagerModal.amount) })
      });
      fetchWagers();
      fetchUserData();
      if (user?.isAdmin) {
        fetchGroupedPendingWagers();
      }
      setEditWagerModal({ open: false, wager: null, amount: '' });
      showSuccess('Wager updated successfully!');
    } catch (error) {
      showError('Failed to update wager.');
    }
    setLoading(false);
  };

  const handleCancelWager = async (wagerId) => {
    if (!window.confirm('Are you sure you want to cancel this wager?')) {
      return;
    }
    setLoading(true);
    try {
      await apiCall(`/wagers/${wagerId}`, token, {
        method: 'DELETE'
      });
      fetchWagers();
      fetchUserData();
      if (user?.isAdmin) {
        fetchGroupedPendingWagers();
      }
      showSuccess('Wager cancelled successfully!');
    } catch (error) {
      showError('Failed to cancel wager.');
    }
    setLoading(false);
  };

  // Admin handlers
  const handleUserWagerDecision = async (userId, decision) => {
    setLoading(true);
    try {
      await apiCall(`/admin/wagers/user/${userId}/decision`, token, {
        method: 'PUT',
        body: JSON.stringify({ decision })
      });
      fetchGroupedPendingWagers();
      fetchAdminActiveWagers();
      fetchLeaderboard();
      showSuccess(`User's wagers ${decision} successfully!`);
    } catch (error) {
      showError('Failed to process wager decision.');
    }
    setLoading(false);
  };

  const handleUpdateSpread = async (gameId, homeSpread) => {
    setLoading(true);
    try {
      await apiCall(`/admin/games/${gameId}/spread`, token, {
        method: 'POST',
        body: JSON.stringify({ spread: homeSpread })
      });
      fetchGames();
      showSuccess('Spread updated successfully!');
    } catch (error) {
      showError('Failed to update spread.');
    }
    setLoading(false);
  };

  const handleCreateUser = async () => {
    setLoading(true);
    try {
      await apiCall('/admin/users', token, {
        method: 'POST',
        body: JSON.stringify(adminForm)
      });
      setAdminForm({ username: '', password: '' });
      fetchLeaderboard();
      showSuccess('User created successfully!');
    } catch (error) {
      showError('Failed to create user. Username may already exist.');
    }
    setLoading(false);
  };

  const handleSettleWager = async (wagerId, result) => {
    setLoading(true);
    try {
      await apiCall(`/admin/wagers/${wagerId}/settle`, token, {
        method: 'POST',
        body: JSON.stringify({ result })
      });
      fetchAdminActiveWagers();
      fetchLeaderboard();
      showSuccess(`Wager settled as ${result}!`);
    } catch (error) {
      showError('Failed to settle wager.');
    }
    setLoading(false);
  };

  const toggleAdminSection = (section) => {
    setAdminSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Utility functions
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

  // Render login page if not authenticated
  if (!token) {
    return (
      <LoginPage 
        loginForm={loginForm}
        setLoginForm={setLoginForm}
        handleLogin={handleLogin}
        loading={loading}
      />
    );
  }

  // Render main app
  return (
    <div className="min-h-screen bg-gray-900">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <WelcomeModal 
        isOpen={showWelcome} 
        onClose={() => setShowWelcome(false)} 
      />
      
      <Header 
        user={user}
        cart={cart}
        cartTotal={cartTotal}
        setCartOpen={setCartOpen}
        handleLogout={handleLogout}
      />

      <Navigation 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        groupedPendingWagers={groupedPendingWagers}
      />

      <EditWagerModal 
        editWagerModal={editWagerModal}
        setEditWagerModal={setEditWagerModal}
        handleEditWager={handleEditWager}
        loading={loading}
        user={user}
      />

      <Cart 
        cartOpen={cartOpen}
        setCartOpen={setCartOpen}
        cart={cart}
        removeFromCart={removeFromCart}
        cartTotal={cartTotal}
        minimumCartTotal={minimumCartTotal}
        user={user}
        submitCart={submitCart}
        loading={loading}
      />

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {activeTab === 'games' && (
            <GamesTab 
              games={games}
              minimumCartTotal={minimumCartTotal}
              formatDate={formatDate}
              user={user}
              addToCart={addToCart}
              loading={loading}
            />
          )}

          {activeTab === 'wagers' && (
            <WagersTab 
              wagers={wagers}
              games={games}
              getWagerStatus={getWagerStatus}
              getStatusText={getStatusText}
              setEditWagerModal={setEditWagerModal}
              handleCancelWager={handleCancelWager}
            />
          )}

          {activeTab === 'placed wagers' && (
            <PlacedWagersTab 
              user={user}
            />
          )}

          {activeTab === 'leaderboard' && (
            <LeaderboardTab 
              leaderboard={leaderboard}
              user={user}
            />
          )}

          {activeTab === 'admin' && user?.isAdmin && (
            <AdminPanel 
              adminSections={adminSections}
              toggleAdminSection={toggleAdminSection}
              groupedPendingWagers={groupedPendingWagers}
              handleUserWagerDecision={handleUserWagerDecision}
              loading={loading}
              wagers={adminActiveWagers}
              games={games}
              leaderboard={leaderboard}
              handleSettleWager={handleSettleWager}
              formatDate={formatDate}
              handleUpdateSpread={handleUpdateSpread}
              adminForm={adminForm}
              setAdminForm={setAdminForm}
              handleCreateUser={handleCreateUser}
              refreshGames={fetchGames}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;