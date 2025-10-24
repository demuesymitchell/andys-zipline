// frontend/src/components/PlacedWagersTab.js
import React from 'react';
import { Construction, Lock, Wrench, HardHat } from 'lucide-react';

const PlacedWagersTab = ({ user }) => {
  // Check if user is admin
  const isAdmin = user?.isAdmin || user?.is_admin;

  if (!isAdmin) {
    // Show construction page for non-admins
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <div className="relative mb-8">
            <Construction className="h-32 w-32 text-yellow-500 mx-auto animate-bounce" />
            <HardHat className="h-16 w-16 text-yellow-600 absolute top-0 right-1/3 animate-pulse" />
            <Wrench className="h-12 w-12 text-gray-400 absolute bottom-4 left-1/3 rotate-45" />
          </div>
          
          <h2 className="text-3xl font-bold text-white mb-4">
            🚧 Under Construction 🚧
          </h2>
          
          <p className="text-gray-300 text-lg mb-6">
            We're building something awesome here!
          </p>
          
          <div className="bg-yellow-900 bg-opacity-30 border-2 border-yellow-600 rounded-lg p-6">
            <Lock className="h-8 w-8 text-yellow-500 mx-auto mb-3" />
            <p className="text-yellow-200 font-semibold">
              Community Glance Coming Soon
            </p>
            <p className="text-yellow-300 text-sm mt-2">
              Check back later to see everyone's picks and betting stats!
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Admin view - show the actual feature (placeholder for now)
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-900 to-pink-900 rounded-lg p-6 border border-purple-700">
        <h2 className="text-2xl font-bold text-white mb-2">
          👑 Admin Preview - Community Glance
        </h2>
        <p className="text-purple-200">
          You're seeing this because you're an admin. Regular users see a construction page.
        </p>
      </div>

      <div className="bg-gray-800 rounded-lg p-8 border border-gray-700 text-center">
        <Construction className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">
          Feature In Development
        </h3>
        <p className="text-gray-400">
          Community betting stats and graphs will be displayed here once complete.
        </p>
      </div>
    </div>
  );
};

export default PlacedWagersTab;