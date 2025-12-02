import React from 'react';
import useAppStore from '../../../store/appStore';
import { Moon, Sun, Bell, Volume2, Wifi } from 'lucide-react';

const Settings = () => {
  const { theme, toggleTheme } = useAppStore();
  
  const SettingToggle = ({ icon: Icon, label, description, checked, onChange, last }) => (
    <div className={`flex items-center justify-between p-3 bg-white dark:bg-gray-800 ${!last ? 'border-b border-gray-200 dark:border-gray-700' : ''}`}>
      <div className="flex items-center space-x-3">
        <div className="w-7 h-7 rounded-md bg-blue-500 flex items-center justify-center text-white">
          <Icon className="w-4 h-4" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{label}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
        </div>
      </div>
      <button
        onClick={onChange}
        className={`relative w-10 h-6 rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
          checked ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
        }`}
      >
        <div
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ease-in-out ${
            checked ? 'transform translate-x-4' : ''
          }`}
        />
      </button>
    </div>
  );

  return (
    <div className="h-full overflow-auto bg-[#f5f5f7] dark:bg-gray-900 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-center mb-8">
          <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center mb-2">
            <SettingsIcon className="w-8 h-8 text-gray-600" />
          </div>
        </div>

        {/* Appearance Section */}
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 ml-2">
            Appearance
          </h3>
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <SettingToggle
              icon={theme === 'dark' ? Moon : Sun}
              label="Dark Mode"
              description="Switch between light and dark theme"
              checked={theme === 'dark'}
              onChange={toggleTheme}
              last={true}
            />
          </div>
        </div>

        {/* Notifications Section */}
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 ml-2">
            Notifications
          </h3>
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <SettingToggle
              icon={Bell}
              label="Daily Reminders"
              description="Get reminded to write your daily entry"
              checked={false}
              onChange={() => {}}
            />
            <SettingToggle
              icon={Volume2}
              label="Sound Effects"
              description="Play sounds for app interactions"
              checked={true}
              onChange={() => {}}
              last={true}
            />
          </div>
        </div>

        {/* System Section */}
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 ml-2">
            System
          </h3>
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <SettingToggle
              icon={Wifi}
              label="Auto Sync"
              description="Automatically sync your data"
              checked={true}
              onChange={() => {}}
              last={true}
            />
          </div>
        </div>

        {/* About Section */}
        <div className="text-center mt-8">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Side-B</p>
          <p className="text-xs text-gray-500">Version 1.0.0</p>
          <p className="text-xs text-gray-400 mt-1">© 2024 Side-B. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

const SettingsIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"></circle>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
  </svg>
);

export default Settings;
