import React, { useState } from 'react';
import useAppStore from '../../../store/appStore';
import { User, Camera } from 'lucide-react';

const Profile = () => {
  const { user, updateUser } = useAppStore();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || 'Guest');

  const handleSave = () => {
    updateUser({ name });
    setIsEditing(false);
  };

  return (
    <div className="h-full overflow-auto" style={{ backgroundColor: '#f5f5f5' }}>
      {/* Header */}
      <div 
        className="p-8 flex flex-col items-center"
        style={{
          background: 'linear-gradient(to bottom, #6ea3d8 0%, #4580d4 100%)',
          borderBottom: '1px solid rgba(0,0,0,0.2)'
        }}
      >
        <div className="relative mb-4">
          <div 
            className="w-32 h-32 rounded-full flex items-center justify-center text-5xl font-bold cursor-pointer group"
            style={{
              background: 'linear-gradient(to bottom, rgba(255,255,255,0.4), rgba(255,255,255,0.2))',
              border: '4px solid rgba(255,255,255,0.6)',
              color: '#fff',
              boxShadow: '0 4px 16px rgba(0,0,0,0.3)'
            }}
          >
            {name?.charAt(0).toUpperCase() || 'U'}
            <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Camera className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>
        
        {isEditing ? (
          <div className="flex flex-col items-center space-y-2">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="px-4 py-2 rounded-lg text-center text-xl font-bold"
              style={{
                background: 'rgba(255,255,255,0.9)',
                border: '1px solid rgba(0,0,0,0.2)',
                fontFamily: 'Lucida Grande, -apple-system, system-ui, sans-serif',
                outline: 'none'
              }}
              autoFocus
            />
            <div className="flex space-x-2">
              <button
                onClick={handleSave}
                className="px-4 py-1.5 rounded-lg text-sm font-medium"
                style={{
                  background: 'linear-gradient(to bottom, #fff 0%, #e8e8e8 100%)',
                  border: '1px solid rgba(0,0,0,0.2)',
                  fontFamily: 'Lucida Grande, -apple-system, system-ui, sans-serif',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                }}
              >
                Save
              </button>
              <button
                onClick={() => {
                  setName(user?.name || 'Guest');
                  setIsEditing(false);
                }}
                className="px-4 py-1.5 rounded-lg text-sm font-medium"
                style={{
                  background: 'linear-gradient(to bottom, #fff 0%, #e8e8e8 100%)',
                  border: '1px solid rgba(0,0,0,0.2)',
                  fontFamily: 'Lucida Grande, -apple-system, system-ui, sans-serif',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <h1 
              className="text-3xl font-bold text-white mb-2"
              style={{
                fontFamily: 'Lucida Grande, -apple-system, system-ui, sans-serif',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)'
              }}
            >
              {name}
            </h1>
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-1.5 rounded-lg text-sm font-medium"
              style={{
                background: 'linear-gradient(to bottom, rgba(255,255,255,0.9), rgba(255,255,255,0.7))',
                border: '1px solid rgba(0,0,0,0.2)',
                fontFamily: 'Lucida Grande, -apple-system, system-ui, sans-serif',
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
              }}
            >
              Edit Profile
            </button>
          </div>
        )}
      </div>

      {/* About Section */}
      <div className="p-6">
        <h2 
          className="text-base font-bold mb-4"
          style={{
            color: '#000',
            fontFamily: 'Lucida Grande, -apple-system, system-ui, sans-serif'
          }}
        >
          About This Mac
        </h2>
        
        <div 
          className="p-6 rounded-lg"
          style={{
            background: 'linear-gradient(to bottom, #fff 0%, #f0f0f0 100%)',
            border: '1px solid rgba(0,0,0,0.1)',
            boxShadow: '0 2px 6px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.5)'
          }}
        >
          <div className="flex items-center justify-center mb-6">
            <div className="text-6xl">🎵</div>
          </div>
          
          <div className="space-y-3 text-sm" style={{ fontFamily: 'Lucida Grande, -apple-system, system-ui, sans-serif' }}>
            <div className="flex justify-between">
              <span style={{ color: '#666' }}>Version:</span>
              <span style={{ color: '#000', fontWeight: 500 }}>Side-B 1.0</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: '#666' }}>System:</span>
              <span style={{ color: '#000', fontWeight: 500 }}>Music OS X 10.0</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: '#666' }}>Interface:</span>
              <span style={{ color: '#000', fontWeight: 500 }}>Aqua</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
