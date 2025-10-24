// frontend/src/components/Header.js
import React from 'react';
import { LogOut, ShoppingCart, Coins } from 'lucide-react';

const Header = ({ user, cart, cartTotal, setCartOpen, handleLogout }) => {
  return (
    <header className="bg-gray-800 border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side - App name */}
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-white">Andy's Zipline</h1>
          </div>

          {/* Right side - User info, cart, logout */}
          <div className="flex items-center space-x-4">
            {/* Username */}
            <div className="text-white font-medium">
              {user?.username}
            </div>

            {/* User coins */}
            <div className="flex items-center bg-gray-700 px-4 py-2 rounded-lg">
              <Coins className="h-5 w-5 text-yellow-400 mr-2" />
              <span className="text-white font-semibold">{user?.coins || 0}</span>
              <span className="text-gray-400 text-sm ml-1">coins</span>
            </div>

            {/* Cart button */}
            <button
              onClick={() => setCartOpen(true)}
              className="relative bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              <span>Cart</span>
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                  {cart.length}
                </span>
              )}
              {cartTotal > 0 && (
                <span className="ml-2 text-yellow-400 font-semibold">
                  ({cartTotal})
                </span>
              )}
            </button>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="bg-red-900 bg-opacity-60 text-red-200 px-4 py-2 rounded-lg hover:bg-red-800 hover:bg-opacity-80 hover:text-white transition-all flex items-center"
            >
              <LogOut className="h-5 w-5 mr-2" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;