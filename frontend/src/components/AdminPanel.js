// frontend/src/components/AdminPanel.js
import React, { useState } from 'react';
import { Check, X, ChevronDown, ChevronUp, Plus, Coins, TrendingDown, TrendingUp, Lock, Unlock } from 'lucide-react';

const AdminPanel = ({
  adminSections = {},
  toggleAdminSection,
  groupedPendingWagers = [],
  handleUserWagerDecision,
  loading,
  wagers = [],
  games = [],
  leaderboard = [],
  handleSettleWager,
  formatDate,
  handleUpdateSpread,
  adminForm = {},
  setAdminForm,
  handleCreateUser,
  refreshGames
}) => {
  // Local state for spread inputs
  const [spreadInputs, setSpreadInputs] = useState({});

  const updateSpreadInput = (gameId, value) => {
    setSpreadInputs(prev => ({ ...prev, [gameId]: value }));
  };

  const handleToggleLock = async (gameId, currentLockStatus) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://andys-zipline-production.up.railway.app'}/api/admin/games/${gameId}/lock`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ locked: !currentLockStatus })
      });

      if (!response.ok) throw new Error('Failed to toggle lock');
      
      // Refresh games data without page reload
      if (refreshGames) {
        await refreshGames();
      }
    } catch (error) {
      alert('Failed to toggle game lock');
      console.error(error);
    }
  };

  const getSpreadPreview = (gameId) => {
    const value = parseFloat(spreadInputs[gameId]) || 0;
    return {
      home: value,
      away: -value
    };
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Admin Panel</h2>
      
      {/* Pending Wagers - Collapsible */}
      <div className="bg-gray-800 shadow rounded-lg border border-gray-700">
        <div 
          className="p-6 border-b border-gray-700 cursor-pointer flex justify-between items-center hover:bg-gray-750 transition-colors"
          onClick={() => toggleAdminSection('pending')}
        >
          <h3 className="text-lg font-medium text-white flex items-center">
            <Check className="h-5 w-5 mr-2 text-blue-500" />
            Pending Wagers 
            {groupedPendingWagers.length > 0 && (
              <span className="ml-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                {groupedPendingWagers.length}
              </span>
            )}
          </h3>
          {adminSections.pending ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
        </div>
        
        {adminSections.pending && (
          <div className="p-6">
            {groupedPendingWagers.length === 0 ? (
              <p className="text-gray-400 text-center py-4">No pending wagers</p>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {groupedPendingWagers.map((userGroup) => {
                  const userId = userGroup.userId || userGroup.user_id;
                  const userBalance = userGroup.coins || userGroup.balance || 0;
                  return (
                    <div key={userId} className="border border-gray-600 rounded-lg p-4 bg-gray-700 transition-all hover:border-blue-500">
                      {/* User Header */}
                      <div className="mb-4 pb-3 border-b border-gray-600">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-lg text-white">{userGroup.username}</h4>
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center bg-gray-800 px-3 py-1 rounded">
                              <Coins className="h-4 w-4 mr-1 text-gray-400" />
                              <span className="text-gray-300 text-sm font-medium">{userBalance}</span>
                            </div>
                            <div className="flex items-center bg-yellow-900 bg-opacity-30 border border-yellow-600 px-3 py-1 rounded">
                              <Coins className="h-4 w-4 mr-1 text-yellow-400" />
                              <span className="text-yellow-400 font-bold">{userGroup.totalAmount}</span>
                            </div>
                          </div>
                        </div>
                        <p className="text-xs text-gray-400">
                          {userGroup.wagers?.length || 0} wager{(userGroup.wagers?.length || 0) !== 1 ? 's' : ''} pending • Balance after: <span className="text-blue-400 font-medium">{userBalance - userGroup.totalAmount}</span>
                        </p>
                      </div>

                      {/* Wagers List */}
                      <div className="space-y-2 mb-4">
                        {(userGroup.wagers || []).map((wager) => (
                          <div key={wager.id} className="bg-gray-600 rounded-lg p-3">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <p className="text-sm font-medium text-white mb-1">{wager.gameName}</p>
                                <div className="flex items-center space-x-2 text-xs">
                                  <span className="text-gray-300">{wager.team}</span>
                                  <span className="text-blue-400 font-medium">
                                    ({wager.spread > 0 ? '+' : ''}{wager.spread})
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center bg-yellow-900 bg-opacity-20 px-2 py-1 rounded">
                                <Coins className="h-4 w-4 mr-1 text-yellow-400" />
                                <span className="text-yellow-400 font-bold text-sm">{wager.amount}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleUserWagerDecision(userId, 'approved')}
                          disabled={loading}
                          className="flex-1 bg-green-700 text-white px-4 py-2 rounded-md hover:bg-green-600 disabled:opacity-50 flex items-center justify-center font-medium transition-colors"
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Approve All
                        </button>
                        <button
                          onClick={() => handleUserWagerDecision(userId, 'rejected')}
                          disabled={loading}
                          className="flex-1 bg-red-800 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center justify-center font-medium transition-colors"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Reject All
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Game Spreads - Collapsible */}
      <div className="bg-gray-800 shadow rounded-lg border border-gray-700">
        <div 
          className="p-6 border-b border-gray-700 cursor-pointer flex justify-between items-center hover:bg-gray-750 transition-colors"
          onClick={() => toggleAdminSection('spreads')}
        >
          <h3 className="text-lg font-medium text-white flex items-center">
            <TrendingDown className="h-5 w-5 mr-2 text-blue-500" />
            Set Game Spreads
          </h3>
          {adminSections.spreads ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
        </div>
        
        {adminSections.spreads && (
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {games.map((game) => {
                const preview = getSpreadPreview(game.id);
                const currentValue = spreadInputs[game.id] !== undefined ? spreadInputs[game.id] : game.spread;
                const isLocked = game.locked || false;
                
                return (
                  <div key={game.id} className={`border rounded-lg p-4 transition-all ${isLocked ? 'border-red-500 bg-gray-750' : 'border-gray-600 bg-gray-700'}`}>
                    {/* Game Header with Lock Button */}
                    <div className="mb-3 flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-base text-white mb-1">
                          {game.away_team} @ {game.home_team}
                        </p>
                        <p className="text-xs text-gray-400">
                          {game.game_date} • {game.game_time}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleToggleLock(game.id, isLocked);
                        }}
                        disabled={loading}
                        className={`ml-2 p-2 rounded-md transition-colors ${
                          isLocked 
                            ? 'bg-red-600 hover:bg-red-700 text-white' 
                            : 'bg-gray-600 hover:bg-gray-500 text-gray-300'
                        } disabled:opacity-50`}
                        title={isLocked ? 'Unlock game for betting' : 'Lock game (prevent betting)'}
                      >
                        {isLocked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                      </button>
                    </div>

                    {isLocked && (
                      <div className="mb-3 p-2 bg-red-900 border border-red-600 rounded text-xs text-red-300 flex items-center">
                        <Lock className="h-3 w-3 mr-2" />
                        Game locked - betting disabled
                      </div>
                    )}

                    {/* Spread Input */}
                    <div className="mb-3">
                      <label className="block text-xs font-medium text-gray-300 mb-2">
                        Home Team Spread ({game.home_team}):
                      </label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          step="0.5"
                          placeholder="-7"
                          value={currentValue}
                          onChange={(e) => updateSpreadInput(game.id, e.target.value)}
                          className="flex-1 px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          onClick={() => {
                            const newSpread = parseFloat(currentValue);
                            if (isNaN(newSpread)) {
                              alert('Please enter a valid number');
                              return;
                            }
                            handleUpdateSpread(game.id, newSpread);
                          }}
                          disabled={loading}
                          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm font-medium whitespace-nowrap"
                        >
                          Set
                        </button>
                      </div>
                    </div>

                    {/* Preview */}
                    <div className="bg-gray-600 rounded-lg p-3">
                      <p className="text-xs text-gray-400 mb-2">Preview:</p>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center justify-between p-2 bg-gray-700 rounded">
                          <span className="text-xs text-gray-300 truncate">{game.away_team}</span>
                          <span className={`font-bold text-sm ${preview.away > 0 ? 'text-green-400' : preview.away < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                            {preview.away > 0 ? '+' : ''}{preview.away || 'PK'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-gray-700 rounded">
                          <span className="text-xs text-gray-300 truncate">{game.home_team}</span>
                          <span className={`font-bold text-sm ${preview.home > 0 ? 'text-green-400' : preview.home < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                            {preview.home > 0 ? '+' : ''}{preview.home || 'PK'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Game Settlement - Collapsible */}
      <div className="bg-gray-800 shadow rounded-lg border border-gray-700">
        <div 
          className="p-6 border-b border-gray-700 cursor-pointer flex justify-between items-center hover:bg-gray-750 transition-colors"
          onClick={() => toggleAdminSection('settlement')}
        >
          <h3 className="text-lg font-medium text-white flex items-center">
            <Coins className="h-5 w-5 mr-2 text-yellow-400" />
            Settle Wagers
          </h3>
          {adminSections.settlement ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
        </div>
        
        {adminSections.settlement && (
          <div className="p-6">
            <div className="space-y-4">
              {wagers.filter(w => w.status === 'active').map((wager) => {
                const game = games.find(g => g.id === wager.gameId);
                const user = leaderboard.find(u => u.id === (wager.userId || wager.user_id));
                const winPayout = wager.amount * 2;
                const pushPayout = wager.amount;
                
                return (
                  <div key={wager.id} className="border border-gray-600 rounded-lg p-5 bg-gray-700">
                    {/* Wager Header */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-semibold text-lg text-white">
                          {user?.username || 'Unknown'}
                        </p>
                        <div className="flex items-center bg-gray-600 px-3 py-1 rounded">
                          <Coins className="h-4 w-4 mr-1 text-yellow-400" />
                          <span className="text-yellow-400 font-medium">{wager.amount}</span>
                          <span className="text-gray-400 text-sm ml-1">wagered</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-300">
                        <span className="font-medium">{wager.team}</span>
                        <span className="text-blue-400 ml-2">({wager.spread > 0 ? '+' : ''}{wager.spread})</span>
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {game ? `${game.away_team} @ ${game.home_team}` : 'Game not found'}
                      </p>
                    </div>

                    {/* Payout Breakdown */}
                    <div className="bg-gray-600 rounded-lg p-4 mb-4">
                      <p className="text-xs text-gray-400 mb-3">Payout Options:</p>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-green-400 flex items-center">
                            <TrendingUp className="h-4 w-4 mr-2" />
                            Win
                          </span>
                          <div className="flex items-center">
                            <Coins className="h-4 w-4 mr-1 text-green-400" />
                            <span className="text-green-400 font-bold">+{winPayout}</span>
                            <span className="text-gray-400 text-xs ml-1">(2x)</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-yellow-400 flex items-center">
                            <span className="h-4 w-4 mr-2 flex items-center justify-center">↔</span>
                            Push
                          </span>
                          <div className="flex items-center">
                            <Coins className="h-4 w-4 mr-1 text-yellow-400" />
                            <span className="text-yellow-400 font-bold">+{pushPayout}</span>
                            <span className="text-gray-400 text-xs ml-1">(refund)</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-red-400 flex items-center">
                            <TrendingDown className="h-4 w-4 mr-2" />
                            Loss
                          </span>
                          <div className="flex items-center">
                            <Coins className="h-4 w-4 mr-1 text-red-400" />
                            <span className="text-red-400 font-bold">+0</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          if (window.confirm(`Settle as WIN? ${user?.username} will receive ${winPayout} coins.`)) {
                            handleSettleWager(wager.id, 'win');
                          }
                        }}
                        disabled={loading}
                        className="flex-1 bg-green-600 text-white px-4 py-3 rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center justify-center font-medium transition-colors"
                      >
                        <Check className="h-5 w-5 mr-2" />
                        Win
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Settle as PUSH? ${user?.username} will receive ${pushPayout} coins (refund).`)) {
                            handleSettleWager(wager.id, 'push');
                          }
                        }}
                        disabled={loading}
                        className="flex-1 bg-yellow-600 text-white px-4 py-3 rounded-md hover:bg-yellow-700 disabled:opacity-50 flex items-center justify-center font-medium transition-colors"
                      >
                        <span className="mr-2">↔</span>
                        Push
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Settle as LOSS? ${user?.username} will receive 0 coins.`)) {
                            handleSettleWager(wager.id, 'loss');
                          }
                        }}
                        disabled={loading}
                        className="flex-1 bg-red-600 text-white px-4 py-3 rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center justify-center font-medium transition-colors"
                      >
                        <X className="h-5 w-5 mr-2" />
                        Loss
                      </button>
                    </div>
                  </div>
                );
              })}
              {wagers.filter(w => w.status === 'active').length === 0 && (
                <p className="text-gray-400 text-center py-8">No active wagers to settle</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Create User - Collapsible */}
      <div className="bg-gray-800 shadow rounded-lg border border-gray-700">
        <div 
          className="p-6 border-b border-gray-700 cursor-pointer flex justify-between items-center hover:bg-gray-750 transition-colors"
          onClick={() => toggleAdminSection('createUser')}
        >
          <h3 className="text-lg font-medium text-white flex items-center">
            <Plus className="h-5 w-5 mr-2 text-blue-500" />
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
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter password"
                />
              </div>

              <button
                onClick={handleCreateUser}
                disabled={loading || !adminForm.username || !adminForm.password}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create User
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;