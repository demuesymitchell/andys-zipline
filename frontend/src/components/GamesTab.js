// frontend/src/components/GamesTab.js
import React from 'react';
import { Calendar, Lock } from 'lucide-react';

const GamesTab = ({ games, minimumCartTotal, formatDate, user, addToCart, loading }) => {
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Week 7 NFL Games</h2>
        <div className="text-sm text-gray-400">
          Cart minimum: {minimumCartTotal} coins total (10% of your balance)
        </div>
      </div>
      
      {Object.entries(timeSlots).map(([timeSlot, slotGames]) => (
        slotGames.length > 0 && (
          <div key={timeSlot} className="space-y-4">
            <div className="border-b border-gray-700 pb-2">
              <h3 className="text-xl font-semibold text-white flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-blue-500" />
                {timeSlot} Games
              </h3>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {slotGames.map((game) => {
                const isLocked = game.locked || false;
                // Check if spread is actually set (not null/undefined and not 0)
                const hasSpread = game.spread !== null && game.spread !== undefined && game.spread !== 0;
                
                return (
                  <div key={game.id} className={`rounded-lg shadow p-6 border-l-4 transition-colors ${
                    isLocked 
                      ? 'bg-gray-900 border-gray-600 opacity-60' 
                      : 'bg-gray-800 border-blue-500 hover:border-blue-400'
                  }`}>
                  <div className="text-center mb-4">
                    <div className="text-sm text-gray-400 mb-2">
                      <Calendar className="inline h-4 w-4 mr-1" />
                      {game.game_date} - {game.game_time}
                    </div>
                    <div className="font-semibold text-lg text-white">
                      {game.away_team} @ {game.home_team}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-2 bg-gray-700 rounded hover:bg-gray-650 transition-colors">
                      <span className="text-sm text-gray-300">{game.away_team}</span>
                      <span className="font-medium text-yellow-400">
                        {!hasSpread ? 'TBD' : `+${Math.abs(game.spread)}`}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-gray-700 rounded hover:bg-gray-650 transition-colors">
                      <span className="text-sm text-gray-300">{game.home_team}</span>
                      <span className="font-medium text-yellow-400">
                        {!hasSpread ? 'TBD' : game.spread}
                      </span>
                    </div>
                  </div>

                  {isLocked ? (
                    <div className="mt-4 p-3 bg-gray-700 border border-gray-600 rounded-md">
                      <div className="flex items-center text-gray-400 text-sm">
                        <Lock className="h-4 w-4 mr-2" />
                        Game locked - betting unavailable
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4 space-y-3">
                      <select 
                        id={`team-select-${game.id}`}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-blue-500 transition-colors"
                      >
                        <option value="">Select team</option>
                        <option value={`${game.home_team}|${game.spread}`}>{game.home_team} ({game.spread || 'TBD'})</option>
                        <option value={`${game.away_team}|${-game.spread}`}>{game.away_team} (+{Math.abs(game.spread) || 'TBD'})</option>
                      </select>

                      <input
                        id={`amount-${game.id}`}
                        type="number"
                        placeholder="Wager amount"
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-blue-500 transition-colors"
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
                        disabled={loading || !hasSpread}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-colors text-sm"
                      >
                        {!hasSpread ? 'Spread Not Set' : 'Add to Cart'}
                      </button>
                    </div>
                  )}
                </div>
              );
              })}
            </div>
          </div>
        )
      ))}
      
      {games.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="mx-auto h-12 w-12 text-gray-600 mb-4" />
          <p className="text-gray-400 text-lg">No games available</p>
          <p className="text-gray-500 text-sm">Games will appear here once loaded</p>
        </div>
      )}
    </div>
  );
};

export default GamesTab;