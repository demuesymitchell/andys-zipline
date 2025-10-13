// frontend/src/components/EditWagerModal.js
import React from 'react';

const EditWagerModal = ({ 
  editWagerModal, 
  setEditWagerModal, 
  handleEditWager, 
  loading, 
  user 
}) => {
  if (!editWagerModal.open) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div 
        className="absolute inset-0 bg-black bg-opacity-50" 
        onClick={() => setEditWagerModal({ open: false, wager: null, amount: '' })}
      ></div>
      <div className="absolute inset-x-0 top-1/2 transform -translate-y-1/2 mx-auto w-96 bg-gray-800 shadow-xl rounded-lg">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Edit Wager</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">New Amount</label>
              <input
                type="number"
                value={editWagerModal.amount}
                onChange={(e) => setEditWagerModal({...editWagerModal, amount: e.target.value})}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                min="1"
                max={user?.coins}
              />
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleEditWager}
                disabled={loading || !editWagerModal.amount}
                className="flex-1 bg-emerald-600 text-white py-2 px-4 rounded-md hover:bg-emerald-700 disabled:opacity-50"
              >
                Save Changes
              </button>
              <button
                onClick={() => setEditWagerModal({ open: false, wager: null, amount: '' })}
                className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditWagerModal;