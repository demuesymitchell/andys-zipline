// frontend/src/components/LeaderboardTab.js
import React from 'react';
import { Award } from 'lucide-react';

const LeaderboardTab = ({ leaderboard, user }) => {
  return (
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
  );
};

export default LeaderboardTab;