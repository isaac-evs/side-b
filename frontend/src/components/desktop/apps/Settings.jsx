import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAppStore from '../../../store/appStore';
import { useAuth } from '../../../contexts/AuthContext';
import { usersAPI } from '../../../services/api';
import { Moon, Sun, Bell, Image as ImageIcon, Trash2, Monitor, Wifi } from 'lucide-react';

const Settings = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useAppStore();
  const { user, updateUserData, logout } = useAuth();
  const [bgImage, setBgImage] = useState(user?.settings?.backgroundImage || 'https://images.pexels.com/photos/691668/pexels-photo-691668.jpeg?_gl=1*3jir2t*_ga*MTE2NzEzMzk3OC4xNzY0ODk4MTIy*_ga_8JE65Q40S6*czE3NjQ4OTgxMjEkbzEkZzEkdDE3NjQ4OTgxMjQkajU3JGwwJGgw');

  const handleIconColorChange = (color) => {
    updateUserData({ settings: { ...user.settings, iconColor: color } });
  };

  const handleBgImageSave = () => {
    updateUserData({ settings: { ...user.settings, backgroundImage: bgImage } });
  };

  const handleDeleteData = async (deleteUser) => {
    if (!confirm(deleteUser ? "Are you sure you want to delete your account and all data? This cannot be undone." : "Are you sure you want to delete all your data? This cannot be undone.")) return;
    
    try {
      if (deleteUser) {
        await usersAPI.deleteUser(user.id || user._id);
        navigate('/');
        setTimeout(() => {
            logout();
        }, 100);
      } else {
        await usersAPI.deleteUserData(user.id || user._id);
        alert("Data deleted successfully.");
      }
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete data.");
    }
  };
  
  const Checkbox = ({ label, checked, onChange }) => (
    <div className="flex items-center gap-2 mb-2">
      <input 
        type="checkbox" 
        checked={checked} 
        onChange={onChange}
        className="w-3.5 h-3.5 rounded-sm border-gray-400 text-blue-600 focus:ring-blue-500"
      />
      <span className="text-sm text-gray-700" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>{label}</span>
    </div>
  );

  return (
    <div className="h-full bg-[#ececec] flex flex-col">
      {/* Header */}
      <div className="h-12 border-b border-[#d1d1d1] flex items-center justify-center bg-[#f6f6f6] shadow-sm z-10">
        <Monitor className="w-5 h-5 mr-2 text-gray-600" />
        <span className="font-semibold text-gray-700" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>System Preferences</span>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
           
           {/* Appearance Pane */}
           <div className="bg-white/50 border border-gray-300 rounded p-4 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                 <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 shadow-inner">
                    <Monitor size={20} />
                 </div>
                 <span className="font-medium text-gray-800" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>General</span>
              </div>
              
              <div className="space-y-4 pl-2">
                 <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>Appearance:</span>
                    <div className="flex bg-gray-200 p-0.5 rounded-lg">
                       <button 
                          onClick={() => theme === 'dark' && toggleTheme()}
                          className={`px-3 py-1 rounded-md text-xs flex items-center gap-1 transition-all ${theme !== 'dark' ? 'bg-white shadow-sm text-black' : 'text-gray-500'}`}
                       >
                          <Sun size={12} /> Light
                       </button>
                       <button 
                          onClick={() => theme !== 'dark' && toggleTheme()}
                          className={`px-3 py-1 rounded-md text-xs flex items-center gap-1 transition-all ${theme === 'dark' ? 'bg-white shadow-sm text-black' : 'text-gray-500'}`}
                       >
                          <Moon size={12} /> Dark
                       </button>
                    </div>
                 </div>
                 
                 <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>Icon Color:</span>
                    <div className="flex gap-1.5">
                       {['#007aff', '#a650c2', '#ff2d55', '#ff9500', '#ffcc00', '#4cd964'].map(c => (
                          <div 
                            key={c} 
                            className={`w-4 h-4 rounded-full shadow-sm cursor-pointer border border-black/5 hover:scale-110 transition-transform ${user?.settings?.iconColor === c ? 'ring-2 ring-offset-1 ring-gray-400' : ''}`}
                            style={{ backgroundColor: c }} 
                            onClick={() => handleIconColorChange(c)}
                            title="Change Icon Color"
                          />
                       ))}
                    </div>
                 </div>
              </div>
           </div>

           {/* Notifications Pane */}
           <div className="bg-white/50 border border-gray-300 rounded p-4 shadow-sm opacity-75">
              <div className="flex items-center gap-3 mb-4">
                 <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-500 shadow-inner">
                    <Bell size={20} />
                 </div>
                 <span className="font-medium text-gray-800" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>Notifications (Future Update)</span>
              </div>
              
              <div className="pl-2 pointer-events-none">
                 <Checkbox label="Allow Notifications" checked={true} onChange={() => {}} />
                 <Checkbox label="Play sound for notifications" checked={true} onChange={() => {}} />
                 <Checkbox label="Show previews" checked={true} onChange={() => {}} />
                 <Checkbox label="Show in Lock Screen" checked={false} onChange={() => {}} />
              </div>
           </div>

           {/* Background Image Pane (Replaces Sound) */}
           <div className="bg-white/50 border border-gray-300 rounded p-4 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                 <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-500 shadow-inner">
                    <ImageIcon size={20} />
                 </div>
                 <span className="font-medium text-gray-800" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>Background Image</span>
              </div>
              
              <div className="pl-2 space-y-3">
                 <div>
                    <span className="text-xs text-gray-500 block mb-1" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>Image URL</span>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={bgImage}
                        onChange={(e) => setBgImage(e.target.value)}
                        className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded"
                        placeholder="https://..."
                      />
                      <button 
                        onClick={handleBgImageSave}
                        className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        Save
                      </button>
                    </div>
                 </div>
                 <div className="h-20 w-full bg-gray-200 rounded overflow-hidden relative">
                    <img src={bgImage} alt="Preview" className="w-full h-full object-cover" onError={(e) => e.target.style.display = 'none'} />
                    <span className="absolute inset-0 flex items-center justify-center text-xs text-gray-500 pointer-events-none">Preview</span>
                 </div>
              </div>
           </div>

           {/* Delete Data Pane (Replaces Network) */}
           <div className="bg-white/50 border border-gray-300 rounded p-4 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                 <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white shadow-inner">
                    <Trash2 size={20} />
                 </div>
                 <span className="font-medium text-gray-800" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>Delete Data</span>
              </div>
              
              <div className="pl-2 space-y-3">
                 <p className="text-xs text-gray-600">Manage your data stored in the 4 databases.</p>
                 <div className="flex flex-col gap-2">
                    <button 
                      onClick={() => handleDeleteData(false)}
                      className="px-3 py-1.5 text-xs bg-white border border-red-300 text-red-600 rounded hover:bg-red-50 text-left"
                    >
                      Delete Data (Keep User)
                    </button>
                    <button 
                      onClick={() => handleDeleteData(true)}
                      className="px-3 py-1.5 text-xs bg-red-600 text-white rounded hover:bg-red-700 text-left"
                    >
                      Delete All (Including User)
                    </button>
                 </div>
              </div>
           </div>

        </div>
      </div>
    </div>
  );
};

export default Settings;
