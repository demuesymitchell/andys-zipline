// frontend/src/components/AdminPanel.js
import React from 'react';
import { Check, X, ChevronDown, ChevronUp, Plus, DollarSign } from 'lucide-react';

const AdminPanel = ({
  adminSections,
  toggleAdminSection,
  groupedPendingWagers,
  handleUserWagerDecision,
  loading,
  wagers,
  games,
  leaderboard,
  handleSettleWager,
  formatDate,
  handleUpdateSpread,
  adminForm,
  setAdminForm,
  handleCreateUser
}) => {
  return (
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

      {/* Game Settlement - Collapsible */}
      <div className="bg-gray-800 shadow rounded-lg">
        <div 
          className="p-6 border-b border-gray-700 cursor-pointer flex justify-between items-center hover:bg-gray-700"
          onClick={() => toggleAdminSection('settlement')}
        >
          <h3 className="text-lg font-medium text-white">
            <DollarSign className="inline h-5 w-5 mr-2" />
            Settle Wagers
          </h3>
          {adminSections.settlement ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
        </div>
        
        {adminSections.settlement && (
          <div className="p-6">
            <div className="space-y-4">
              {wagers.filter(w => w.status === 'active').map((wager) => {
                const game = games.find(g => g.id === wager.gameId);
                const user = leaderboard.find(u => u.id === wager.userId);
                return (
                  <div key={wager.id} className="border border-gray-600 rounded-lg p-4 bg-gray-700">
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <p className="font-medium text-white">
                          {user?.username || 'Unknown'} - {wager.team} ({wager.spread > 0 ? '+' : ''}{wager.spread})
                        </p>
                        <p className="text-sm text-gray-400">
                          {game ? `${game.awayTeam} @ ${game.homeTeam}` : 'Game not found'} • {wager.amount} coins
                        </p>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <button
                          onClick={() => handleSettleWager(wager.id, 'win')}
                          disabled={loading}
                          className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 disabled:opacity-50"
                        >
                          Win
                        </button>
                        <button
                          onClick={() => handleSettleWager(wager.id, 'loss')}
                          disabled={loading}
                          className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 disabled:opacity-50"
                        >
                          Loss
                        </button>
                        <button
                          onClick={() => handleSettleWager(wager.id, 'push')}
                          disabled={loading}
                          className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700 disabled:opacity-50"
                        >
                          Push
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
              {wagers.filter(w => w.status === 'active').length === 0 && (
                <p className="text-gray-400">No active wagers to settle</p>
              )}
            </div>
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
  );
};

export default AdminPanel;