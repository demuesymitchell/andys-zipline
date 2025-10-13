// frontend/src/components/Header.js
import React from 'react';
import { User, Coins, ShoppingCart } from 'lucide-react';

const Header = ({ user, cart, cartTotal, setCartOpen, handleLogout }) => {
  return (
    <header className="bg-gray-800 shadow-sm border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="bg-blue-600 text-white px-2 py-1 rounded font-bold text-lg mr-3">AZ</div>
            <h1 className="text-xl font-bold text-white">Andy's Zipline - Week 7</h1>
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
            <button onClick={handleLogout} className="text-sm text-gray-400 hover:text-white">
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;