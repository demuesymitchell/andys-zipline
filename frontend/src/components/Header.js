// frontend/src/components/Header.js
import React from 'react';
import { LogOut, ShoppingCart, Coins } from 'lucide-react';

const Header = ({ user, cart, cartTotal, setCartOpen, handleLogout }) => {
  return (
    <header className="bg-gray-800 border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - App title */}
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-white">🏈 Andy's Zipline</h1>
          </div>

          {/* Right side - User info, cart, logout */}
          <div className="flex items-center space-x-4">
            {/* Username */}
            <div className="text-white font-medium">
              {user?.username}
            </div>

            {/* Coins */}
            <div className="flex items-center text-yellow-400 font-semibold">
              <Coins className="w-5 h-5 mr-1" />
              {user?.coins || 0}
            </div>

            {/* Cart button */}
            <button
              onClick={() => setCartOpen(true)}
              className="relative bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              Cart
              {cart && cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold">
                  {cart.length}
                </span>
              )}
              {cartTotal > 0 && (
                <span className="ml-2 text-sm">
                  ({cartTotal})
                </span>
              )}
            </button>

            {/* Logout button - more subtle with hover effect */}
            <button
              onClick={handleLogout}
              className="flex items-center text-red-400 hover:text-red-300 hover:bg-red-900/20 px-3 py-2 rounded-lg transition-all"
            >
              <LogOut className="w-5 h-5 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;