import React from 'react';
import { X, Sparkles, Trophy } from 'lucide-react';

const WelcomeModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleClose = () => {
    console.log('Welcome modal closing'); // Debug log
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
      <div className="bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full border border-gray-700 relative animate-fadeIn">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X className="h-6 w-6" />
        </button>

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-t-lg">
          <div className="flex items-center justify-center space-x-3">
            <Sparkles className="h-8 w-8 text-yellow-400 animate-pulse" />
            <h2 className="text-3xl font-bold text-white">Welcome to Andy's Zipline! 🏈</h2>
            <Sparkles className="h-8 w-8 text-yellow-400 animate-pulse" />
          </div>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          <div className="text-center">
            <p className="text-xl text-white font-semibold mb-4">
              Your Private Game Day Experience
            </p>
            <p className="text-gray-300 leading-relaxed">
              Make your picks, compete with friends, and climb the leaderboard! 
              Each week brings new games and new opportunities to show what you know.
            </p>
          </div>

          {/* How it works */}
          <div className="bg-gray-700 rounded-lg p-6 space-y-3">
            <h3 className="text-lg font-bold text-blue-400 flex items-center">
              <Trophy className="h-5 w-5 mr-2" />
              How It Works
            </h3>
            <ul className="space-y-2 text-gray-300 text-sm">
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