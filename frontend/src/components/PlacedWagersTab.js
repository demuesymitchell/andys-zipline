// frontend/src/components/PlacedWagersTab.js
import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Trophy, Target, Calendar, DollarSign } from 'lucide-react';

const PlacedWagersTab = ({ wagerHistory, loading }) => {
  const [selectedWeek, setSelectedWeek] = useState(null);

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="text-gray-400 mt-4">Loading your betting history...</p>
      </div>
    );
  }

  if (!wagerHistory || wagerHistory.allWagers?.length === 0) {
    return (
      <div className="text-center py-12">
        <Trophy className="mx-auto h-16 w-16 text-gray-600 mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">No Betting History Yet</h3>
        <p className="text-gray-400">Your settled wagers will appear here once games are completed!</p>
      </div>
    );
  }

  const { totalStats, weeklyBreakdown } = wagerHistory;

  return (
    <div className="space-y-6">
      {/* Overall Stats Header */}
      <div className="bg-gradient-to-r from-blue-900 to-purple-900 rounded-lg p-6 border border-blue-700">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
          <Trophy className="h-7 w-7 mr-3 text-yellow-400" />
          Your Betting History
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-800 bg-opacity-50 rounded-lg p-4">
            <div className="text-gray-400 text-sm mb-1">Total Wagers</div>
            <div className="text-2xl font-bold text-white">{totalStats.totalWagers}</div>
          </div>
          
          <div className="bg-gray-800 bg-opacity-50 rounded-lg p-4">
            <div className="text-gray-400 text-sm mb-1">Win Rate</div>
            <div className="text-2xl font-bold text-green-400">{totalStats.winRate}%</div>
          </div>
          
          <div className="bg-gray-800 bg-opacity-50 rounded-lg p-4">
            <div className="text-gray-400 text-sm mb-1">Record</div>
            <div className="text-lg font-bold text-white">
              <span className="text-green-400">{totalStats.totalWins}W</span>
              <span className="text-gray-500"> - </span>
              <span className="text-red-400">{totalStats.totalLosses}L</span>
              {totalStats.totalPushes > 0 && (
                <>
                  <span className="text-gray-500"> - </span>
                  <span className="text-gray-400">{totalStats.totalPushes}P</span>
                </>
              )}
            </div>
          </div>
          
          <div className="bg-gray-800 bg-opacity-50 rounded-lg p-4">
            <div className="text-gray-400 text-sm mb-1 flex items-center">
              {totalStats.netProfit >= 0 ? (
                <TrendingUp className="h-4 w-4 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 mr-1" />
              )}
              Net Profit
            </div>
            <div className={`text-2xl font-bold ${totalStats.netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {totalStats.netProfit >= 0 ? '+' : ''}{totalStats.netProfit}
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Breakdown Cards */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-white flex items-center">
          <Calendar className="h-5 w-5 mr-2 text-blue-400" />
          Weekly Performance
        </h3>
        
        {weeklyBreakdown.map((week, index) => (
          <div key={index} className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
            {/* Week Header - Clickable */}
            <button
              onClick={() => setSelectedWeek(selectedWeek === week.week ? null : week.week)}
              className="w-full p-5 hover:bg-gray-750 transition-colors"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <div className="text-left">
                    <div className="text-lg font-bold text-white">{week.week}</div>
                    <div className="text-sm text-gray-400">
                      {week.wins}W - {week.losses}L
                      {week.pushes > 0 && ` - ${week.pushes}P`}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-6">
                  <div className="text-right">
                    <div className="text-sm text-gray-400">Wagered</div>
                    <div className="text-lg font-semibold text-yellow-400">{week.totalWagered}</div>
                  </div>
                  
                  <div className={`text-right px-4 py-2 rounded-lg ${
                    week.netProfit > 0 ? 'bg-green-900 bg-opacity-30' : 
                    week.netProfit < 0 ? 'bg-red-900 bg-opacity-30' : 
                    'bg-gray-700'
                  }`}>
                    <div className="text-sm text-gray-400">Net</div>
                    <div className={`text-xl font-bold ${
                      week.netProfit > 0 ? 'text-green-400' : 
                      week.netProfit < 0 ? 'text-red-400' : 
                      'text-gray-400'
                    }`}>
                      {week.netProfit > 0 ? '+' : ''}{week.netProfit}
                    </div>
                  </div>
                </div>
              </div>
            </button>

            {/* Expandable Wagers List */}
            {selectedWeek === week.week && (
              <div className="border-t border-gray-700 bg-gray-900 p-4 space-y-3">
                {week.wagers.map((wager) => (
                  <div
                    key={wager.id}
                    className={`rounded-lg p-4 border-l-4 ${
                      wager.result === 'win' ? 'bg-green-900 bg-opacity-20 border-green-500' :
                      wager.result === 'loss' ? 'bg-red-900 bg-opacity-20 border-red-500' :
                      'bg-gray-800 border-gray-500'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="font-semibold text-white">{wager.game_matchup}</span>
                          {wager.result === 'win' && <Trophy className="h-4 w-4 text-yellow-400" />}
                        </div>
                        <div className="text-sm text-gray-400">
                          Picked: <span className="text-white font-medium">{wager.team}</span>
                          <span className="mx-2">•</span>
                          Spread: <span className="text-blue-400">{wager.spread > 0 ? '+' : ''}{wager.spread}</span>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-lg font-bold text-yellow-400 mb-1">
                          {wager.amount} coins
                        </div>
                        <div className={`text-sm font-semibold px-2 py-1 rounded ${
                          wager.result === 'win' ? 'bg-green-600 text-white' :
                          wager.result === 'loss' ? 'bg-red-600 text-white' :
                          'bg-gray-600 text-white'
                        }`}>
                          {wager.result === 'win' && `+${wager.amount}`}
                          {wager.result === 'loss' && `-${wager.amount}`}
                          {wager.result === 'push' && 'PUSH'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlacedWagersTab;