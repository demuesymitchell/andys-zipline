// frontend/src/components/Navigation.js
import React from 'react';
import { Sparkles } from 'lucide-react';

const Navigation = ({ activeTab, setActiveTab, user, groupedPendingWagers }) => {
  const tabs = ['games', 'wagers', 'community picks', 'leaderboard'];
  if (user?.isAdmin || user?.is_admin) tabs.push('admin');

  return (
    <nav className="bg-gray-800 shadow-sm border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-1 border-b-2 font-medium text-sm capitalize transition-colors relative ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-300 hover:text-white hover:border-gray-500'
              }`}
            >
              <span className="flex items-center space-x-2">
                <span>{tab}</span>
                {tab === 'history' && (
                  <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs font-bold px-2 py-0.5 rounded-full">
                    NEW
                  </span>
                )}
              </span>
              {tab === 'admin' && (user?.isAdmin || user?.is_admin) && groupedPendingWagers.length > 0 && ` (${groupedPendingWagers.length})`}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;