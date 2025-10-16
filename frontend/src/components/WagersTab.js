// frontend/src/components/WagersTab.js
import React from 'react';
import { Edit, Trash2 } from 'lucide-react';

const WagersTab = ({ 
  wagers, 
  games, 
  getWagerStatus, 
  getStatusText, 
  setEditWagerModal, 
  handleCancelWager 
}) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">My Wagers</h2>
      
      <div className="bg-gray-800 shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-700">
          {wagers.map((wager) => {
            const game = games.find(g => g.id === wager.gameId);
            const canEdit = wager.status === 'pending_approval';
            return (
              <li key={wager.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-white">
                      {wager.team} ({wager.spread > 0 ? '+' : ''}{wager.spread})
                    </div>
                    <div className="text-sm text-gray-400">
                      {game ? `${game.away_team} @ ${game.home_team}` : 'Game not found'}
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="font-medium text-yellow-400">{wager.amount} coins</div>
                      <div className="text-sm text-gray-500">
                        {new Date(wager.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getWagerStatus(wager.status)}`}>
                        {getStatusText(wager.status)}
                      </span>
                      {canEdit && (
                        <>
                          <button
                            onClick={() => setEditWagerModal({ 
                              open: true, 
                              wager: wager, 
                              amount: wager.amount.toString() 
                            })}
                            className="text-blue-400 hover:text-blue-300"
                            title="Edit wager"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleCancelWager(wager.id)}
                            className="text-red-400 hover:text-red-300"
                            title="Cancel wager"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
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
  );
};

export default WagersTab;