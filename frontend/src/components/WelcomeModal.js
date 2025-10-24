import React from 'react';
import { X, Sparkles, Trophy, Clock, Users } from 'lucide-react';

const WelcomeModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleClose = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
      <div className="bg-gray-800 rounded-lg shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto border border-gray-700 relative animate-fadeIn">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X className="h-6 w-6" />
        </button>

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-t-lg">
          <div className="flex items-center justify-center space-x-2">
            <Sparkles className="h-6 w-6 text-yellow-400 animate-pulse" />
            <h2 className="text-2xl font-bold text-white">Welcome to Andy's Zipline! 🏈</h2>
            <Sparkles className="h-6 w-6 text-yellow-400 animate-pulse" />
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Wager Opening Notice */}
          <div className="bg-gradient-to-r from-green-900 to-emerald-900 rounded-lg p-4 border border-green-600">
            <div className="flex items-center justify-center space-x-2 mb-1">
              <Clock className="h-5 w-5 text-green-400" />
              <h3 className="text-base font-bold text-green-400">Wagers Open!</h3>
            </div>
            <p className="text-green-100 text-center font-semibold">
              Saturday, October 18, 2025 @ 1:00 PM EST
            </p>
            <p className="text-green-200 text-center text-sm mt-1">
              Get ready to lock in your picks for Week 7! 🔥
            </p>
          </div>

          {/* Wager Closing Notice */}
          <div className="bg-gradient-to-r from-red-900 to-rose-900 rounded-lg p-4 border border-red-600">
            <div className="flex items-center justify-center space-x-2 mb-1">
              <Clock className="h-5 w-5 text-red-400" />
              <h3 className="text-base font-bold text-red-400">Wagers Close!</h3>
            </div>
            <p className="text-red-100 text-center font-semibold">
              Sunday, October 19, 2025 @ 1:00 PM EST
            </p>
            <p className="text-red-200 text-center text-sm mt-1">
              Last call to get your picks in! ⏰
            </p>
          </div>

          {/* How it works */}
          <div className="bg-gray-700 rounded-lg p-4 space-y-2">
            <h3 className="text-base font-bold text-blue-400 flex items-center">
              <Trophy className="h-4 w-4 mr-2" />
              How It Works
            </h3>
            <ul className="space-y-1.5 text-gray-300 text-sm">
              <li className="flex items-start">
                <span className="text-blue-400 mr-2">1.</span>
                <span>Browse games and add your picks to your cart</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-400 mr-2">2.</span>
                <span>Submit your cart for approval</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-400 mr-2">3.</span>
                <span>Watch the games and track your picks</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-400 mr-2">4.</span>
                <span>Win big and dominate the leaderboard! 🎉</span>
              </li>
            </ul>
          </div>

          {/* Beta Testers Shoutout */}
          <div className="bg-gradient-to-r from-yellow-900 to-amber-900 rounded-lg p-4 border-2 border-yellow-500">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Users className="h-5 w-5 text-yellow-400" />
              <h3 className="text-base font-bold text-yellow-400">Shoutout to Our Beta Testers! 🌟</h3>
            </div>
            <p className="text-yellow-100 text-center text-sm leading-relaxed">
              A huge thank you to our incredible beta testing crew who helped shape this platform. 
              Your feedback, dedication, and willingness to break things (so I can fix them) has been invaluable. 
              This one's for you! 🏆
            </p>
          </div>

          {/* Close button */}
          <button
            onClick={handleClose}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-3 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105"
          >
            Let's Get Started! 🚀
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeModal;