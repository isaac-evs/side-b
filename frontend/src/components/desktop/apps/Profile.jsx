import React, { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { Camera } from 'lucide-react';

const Profile = () => {
  const { user, updateUserData } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || 'Guest');

  const handleSave = () => {
    updateUserData({ name });
    setIsEditing(false);
  };

  return (
    <div className="h-full flex flex-col bg-[#ececec] text-[#333] font-sans">
      {/* Top Section - User Info */}
      <div className="flex flex-col items-center pt-10 pb-8 border-b border-[#d1d1d1] bg-[#f6f6f6]">
        <div className="relative group mb-4">
          <div className="w-24 h-24 rounded-full bg-gray-300 overflow-hidden shadow-inner border-4 border-white">
             {/* Placeholder or User Image */}
             <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-400 to-gray-500 text-white text-4xl font-medium select-none">
                {name?.charAt(0).toUpperCase() || 'U'}
             </div>
          </div>
          <button className="absolute bottom-0 right-0 bg-gray-700 text-white p-1.5 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera size={14} />
          </button>
        </div>

        {isEditing ? (
          <div className="flex flex-col items-center gap-2">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="px-2 py-1 text-lg text-center bg-white border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none w-48"
              autoFocus
            />
            <div className="flex gap-2 mt-1">
              <button
                onClick={() => {
                  setName(user?.name || 'Guest');
                  setIsEditing(false);
                }}
                className="px-3 py-0.5 text-sm bg-white border border-gray-300 rounded shadow-sm hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-3 py-0.5 text-sm bg-[#007aff] text-white border border-[#0062cc] rounded shadow-sm hover:bg-[#0062cc]"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <h1 className="text-2xl font-medium mb-1 text-gray-900">{name}</h1>
            <p className="text-sm text-gray-500 mb-3">Admin User</p>
            <button
              onClick={() => setIsEditing(true)}
              className="px-3 py-0.5 text-sm bg-white border border-gray-300 rounded shadow-sm hover:bg-gray-50 active:bg-gray-100 text-gray-700"
            >
              Edit Profile
            </button>
          </div>
        )}
      </div>

      {/* Bottom Section - About This Mac style */}
      <div className="flex-1 p-8 bg-[#ececec]">
        <div className="flex gap-8 items-start max-w-2xl mx-auto">
           {/* Icon */}
           <div className="w-32 flex-shrink-0 flex flex-col items-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-200 to-gray-400 flex items-center justify-center shadow-lg mb-4 border border-gray-300 select-none">
                 <span className="text-4xl">🍎</span>
              </div>
           </div>

           {/* Info */}
           <div className="flex-1 space-y-1">
              <h2 className="text-2xl font-medium text-gray-900">Side-B OS</h2>
              <p className="text-sm text-gray-500 font-medium">Version 10.15.7 (Catalina)</p>
              
              <div className="mt-4 space-y-1 text-xs text-gray-600">
                 <div className="flex gap-2">
                    <span className="font-semibold w-20 text-right">MacBook Pro</span>
                    <span>(13-inch, 2020, Two Thunderbolt 3 ports)</span>
                 </div>
                 <div className="flex gap-2">
                    <span className="font-semibold w-20 text-right">Processor</span>
                    <span>1.4 GHz Quad-Core Intel Core i5</span>
                 </div>
                 <div className="flex gap-2">
                    <span className="font-semibold w-20 text-right">Memory</span>
                    <span>8 GB 2133 MHz LPDDR3</span>
                 </div>
                 <div className="flex gap-2">
                    <span className="font-semibold w-20 text-right">Graphics</span>
                    <span>Intel Iris Plus Graphics 645 1536 MB</span>
                 </div>
                 <div className="flex gap-2">
                    <span className="font-semibold w-20 text-right">Serial Number</span>
                    <span>C02C1234P3XY</span>
                 </div>
              </div>

              <div className="flex gap-3 mt-6">
                 <button className="px-3 py-1 text-xs bg-white border border-gray-300 rounded shadow-sm hover:bg-gray-50 text-gray-700">System Report...</button>
                 <button className="px-3 py-1 text-xs bg-white border border-gray-300 rounded shadow-sm hover:bg-gray-50 text-gray-700">Software Update...</button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
