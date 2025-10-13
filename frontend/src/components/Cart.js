// frontend/src/components/Cart.js
import React from 'react';
import { ShoppingCart, X } from 'lucide-react';

const Cart = ({ 
  cartOpen, 
  setCartOpen, 
  cart, 
  removeFromCart, 
  cartTotal, 
  minimumCartTotal, 
  user, 
  submitCart, 
  loading 
}) => {
  if (!cartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setCartOpen(false)}></div>
      <div className="absolute right-0 top-0 h-full w-96 bg-gray-800 shadow-xl transform transition-transform">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">Shopping Cart</h2>
          <button onClick={() => setCartOpen(false)} className="text-gray-400 hover:text-white">
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">
          {cart.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <ShoppingCart className="mx-auto h-12 w-12 text-gray-600 mb-4" />
              <p>Your cart is empty</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <div key={item.id} className="border border-gray-600 rounded-lg p-4 bg-gray-700">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-medium text-white">{item.gameName}</h3>
                      <p className="text-sm text-gray-400">
                        {item.team} ({item.spread > 0 ? '+' : ''}{item.spread})
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="font-medium text-yellow-400">{item.amount} coins</div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-gray-700 p-6">
          <div className="space-y-4">
            <div className="flex justify-between text-lg font-semibold">
              <span className="text-white">Total:</span>
              <span className="text-yellow-400">{cartTotal} coins</span>
            </div>
            <div className="text-sm text-gray-400">
              {cartTotal < minimumCartTotal 
                ? `Minimum cart total: ${minimumCartTotal} coins (10% of your balance)`
                : cartTotal > user?.coins 
                ? 'Insufficient coins!'
                : 'Ready to submit for approval'
              }
            </div>
            <button
              onClick={submitCart}
              disabled={loading || cartTotal < minimumCartTotal || cartTotal > user?.coins || cart.length === 0}
              className="w-full bg-emerald-600 text-white py-3 px-4 rounded-md hover:bg-emerald-700 disabled:opacity-50 font-medium"
            >
              Submit for Approval
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;