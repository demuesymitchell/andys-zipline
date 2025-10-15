// frontend/src/components/LoginPage.js
import React from 'react';
import { Lock } from 'lucide-react';

const LoginPage = ({ loginForm, setLoginForm, handleLogin, loading }) => {
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* NFL Teams Banner with Scrolling Logos */}
      <div className="bg-gray-800 border-b border-gray-700 py-4 overflow-hidden relative">
        <div className="flex animate-scroll whitespace-nowrap">
          {[
            'https://a.espncdn.com/i/teamlogos/nfl/500/ari.png',
            'https://a.espncdn.com/i/teamlogos/nfl/500/atl.png',
            'https://a.espncdn.com/i/teamlogos/nfl/500/bal.png',
            'https://a.espncdn.com/i/teamlogos/nfl/500/buf.png',
            'https://a.espncdn.com/i/teamlogos/nfl/500/car.png',
            'https://a.espncdn.com/i/teamlogos/nfl/500/chi.png',
            'https://a.espncdn.com/i/teamlogos/nfl/500/cin.png',
            'https://a.espncdn.com/i/teamlogos/nfl/500/cle.png',
            'https://a.espncdn.com/i/teamlogos/nfl/500/dal.png',
            'https://a.espncdn.com/i/teamlogos/nfl/500/den.png',
            'https://a.espncdn.com/i/teamlogos/nfl/500/det.png',
            'https://a.espncdn.com/i/teamlogos/nfl/500/gb.png',
            'https://a.espncdn.com/i/teamlogos/nfl/500/hou.png',
            'https://a.espncdn.com/i/teamlogos/nfl/500/ind.png',
            'https://a.espncdn.com/i/teamlogos/nfl/500/jax.png',
            'https://a.espncdn.com/i/teamlogos/nfl/500/kc.png',
            'https://a.espncdn.com/i/teamlogos/nfl/500/lv.png',
            'https://a.espncdn.com/i/teamlogos/nfl/500/lac.png',
            'https://a.espncdn.com/i/teamlogos/nfl/500/lar.png',
            'https://a.espncdn.com/i/teamlogos/nfl/500/mia.png',
            'https://a.espncdn.com/i/teamlogos/nfl/500/min.png',
            'https://a.espncdn.com/i/teamlogos/nfl/500/ne.png',
            'https://a.espncdn.com/i/teamlogos/nfl/500/no.png',
            'https://a.espncdn.com/i/teamlogos/nfl/500/nyg.png',
            'https://a.espncdn.com/i/teamlogos/nfl/500/nyj.png',
            'https://a.espncdn.com/i/teamlogos/nfl/500/phi.png',
            'https://a.espncdn.com/i/teamlogos/nfl/500/pit.png',
            'https://a.espncdn.com/i/teamlogos/nfl/500/sf.png',
            'https://a.espncdn.com/i/teamlogos/nfl/500/sea.png',
            'https://a.espncdn.com/i/teamlogos/nfl/500/tb.png',
            'https://a.espncdn.com/i/teamlogos/nfl/500/ten.png',
            'https://a.espncdn.com/i/teamlogos/nfl/500/wsh.png'
          ].concat([
            'https://a.espncdn.com/i/teamlogos/nfl/500/ari.png',
            'https://a.espncdn.com/i/teamlogos/nfl/500/atl.png',
            'https://a.espncdn.com/i/teamlogos/nfl/500/bal.png',
            'https://a.espncdn.com/i/teamlogos/nfl/500/buf.png',
            'https://a.espncdn.com/i/teamlogos/nfl/500/car.png',
            'https://a.espncdn.com/i/teamlogos/nfl/500/chi.png',
            'https://a.espncdn.com/i/teamlogos/nfl/500/cin.png',
            'https://a.espncdn.com/i/teamlogos/nfl/500/cle.png',
            'https://a.espncdn.com/i/teamlogos/nfl/500/dal.png',
            'https://a.espncdn.com/i/teamlogos/nfl/500/den.png',
            'https://a.espncdn.com/i/teamlogos/nfl/500/det.png',
            'https://a.espncdn.com/i/teamlogos/nfl/500/gb.png',
            'https://a.espncdn.com/i/teamlogos/nfl/500/hou.png',
            'https://a.espncdn.com/i/teamlogos/nfl/500/ind.png',
            'https://a.espncdn.com/i/teamlogos/nfl/500/jax.png',
            'https://a.espncdn.com/i/teamlogos/nfl/500/kc.png',
            'https://a.espncdn.com/i/teamlogos/nfl/500/lv.png',
            'https://a.espncdn.com/i/teamlogos/nfl/500/lac.png',
            'https://a.espncdn.com/i/teamlogos/nfl/500/lar.png',
            'https://a.espncdn.com/i/teamlogos/nfl/500/mia.png',
            'https://a.espncdn.com/i/teamlogos/nfl/500/min.png',
            'https://a.espncdn.com/i/teamlogos/nfl/500/ne.png',
            'https://a.espncdn.com/i/teamlogos/nfl/500/no.png',
            'https://a.espncdn.com/i/teamlogos/nfl/500/nyg.png',
            'https://a.espncdn.com/i/teamlogos/nfl/500/nyj.png',
            'https://a.espncdn.com/i/teamlogos/nfl/500/phi.png',
            'https://a.espncdn.com/i/teamlogos/nfl/500/pit.png',
            'https://a.espncdn.com/i/teamlogos/nfl/500/sf.png',
            'https://a.espncdn.com/i/teamlogos/nfl/500/sea.png',
            'https://a.espncdn.com/i/teamlogos/nfl/500/tb.png',
            'https://a.espncdn.com/i/teamlogos/nfl/500/ten.png',
            'https://a.espncdn.com/i/teamlogos/nfl/500/wsh.png'
          ]).map((logoUrl, index) => (
            <img 
              key={index}
              src={logoUrl} 
              alt="NFL Team"
              className="h-10 w-10 mx-4 flex-shrink-0"
            />
          ))}
        </div>
        <style jsx>{`
          @keyframes scroll {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .animate-scroll {
            animation: scroll 30s linear infinite;
          }
        `}</style>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-lg shadow-2xl p-8 w-full max-w-md border border-gray-700">
          <div className="text-center mb-8">
            <Lock className="mx-auto h-12 w-12 text-blue-500 mb-4" />
            <h1 className="text-3xl font-bold text-white">Andy's Zipline</h1>
            <p className="text-gray-400 mt-2">Login to access your account</p>
          </div>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Username
              </label>
              <input
                type="text"
                value={loginForm.username}
                onChange={(e) => setLoginForm({...loginForm, username: e.target.value})}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <button
              type="button"
              onClick={handleLogin}
              disabled={loading || !loginForm.username || !loginForm.password}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;