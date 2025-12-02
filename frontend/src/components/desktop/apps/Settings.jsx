import React from 'react';
import useAppStore from '../../../store/appStore';
import { Moon, Sun, Bell, Volume2, Wifi, Monitor } from 'lucide-react';

const Settings = () => {
  const { theme, toggleTheme } = useAppStore();
  
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
                    <span className="text-sm text-gray-600" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>Accent Color:</span>
                    <div className="flex gap-1.5">
                       {['#007aff', '#a650c2', '#ff2d55', '#ff9500', '#ffcc00', '#4cd964'].map(c => (
                          <div key={c} className="w-4 h-4 rounded-full shadow-sm cursor-pointer border border-black/5" style={{ backgroundColor: c }} />
                       ))}
                    </div>
                 </div>
              </div>
           </div>

           {/* Notifications Pane */}
           <div className="bg-white/50 border border-gray-300 rounded p-4 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                 <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-500 shadow-inner">
                    <Bell size={20} />
                 </div>
                 <span className="font-medium text-gray-800" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>Notifications</span>
              </div>
              
              <div className="pl-2">
                 <Checkbox label="Allow Notifications" checked={true} onChange={() => {}} />
                 <Checkbox label="Play sound for notifications" checked={true} onChange={() => {}} />
                 <Checkbox label="Show previews" checked={true} onChange={() => {}} />
                 <Checkbox label="Show in Lock Screen" checked={false} onChange={() => {}} />
              </div>
           </div>

           {/* Sound Pane */}
           <div className="bg-white/50 border border-gray-300 rounded p-4 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                 <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-500 shadow-inner">
                    <Volume2 size={20} />
                 </div>
                 <span className="font-medium text-gray-800" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>Sound</span>
              </div>
              
              <div className="pl-2 space-y-3">
                 <div>
                    <span className="text-xs text-gray-500 block mb-1" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>Output Volume</span>
                    <input type="range" className="w-full h-1 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-gray-500" />
                 </div>
                 <Checkbox label="Play user interface sound effects" checked={true} onChange={() => {}} />
                 <Checkbox label="Play feedback when volume is changed" checked={false} onChange={() => {}} />
              </div>
           </div>

           {/* Network Pane */}
           <div className="bg-white/50 border border-gray-300 rounded p-4 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                 <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-inner">
                    <Wifi size={20} />
                 </div>
                 <span className="font-medium text-gray-800" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>Network</span>
              </div>
              
              <div className="pl-2">
                 <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_4px_rgba(34,197,94,0.6)]"></div>
                    <span className="text-sm text-gray-700" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>Wi-Fi is connected</span>
                 </div>
                 <Checkbox label="Ask to join new networks" checked={true} onChange={() => {}} />
                 <Checkbox label="Show Wi-Fi status in menu bar" checked={true} onChange={() => {}} />
              </div>
           </div>

        </div>
      </div>
    </div>
  );
};

export default Settings;
