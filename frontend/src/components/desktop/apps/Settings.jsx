import React from 'react';
import useAppStore from '../../../store/appStore';
import { Moon, Sun, Bell, Volume2, Wifi } from 'lucide-react';

const Settings = () => {
  const { theme, toggleTheme } = useAppStore();
  
  const SettingToggle = ({ icon: Icon, label, description, checked, onChange }) => (
    <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="flex items-center space-x-4">
        <Icon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
        <div>
          <p className="font-semibold text-gray-800 dark:text-gray-200">{label}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
        </div>
      </div>
      <button
        onClick={onChange}
        className={`relative w-14 h-8 rounded-full transition-colors ${
          checked ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
        }`}
      >
        <div
          className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
            checked ? 'transform translate-x-6' : ''
          }`}
        />
      </button>
    </div>
  );

  return (
    <div className="h-full overflow-auto p-6">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6">
        Settings
      </h2>

      {/* Appearance Section */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
          Appearance
        </h3>
        <SettingToggle
          icon={theme === 'dark' ? Moon : Sun}
          label="Dark Mode"
          description="Switch between light and dark theme"
          checked={theme === 'dark'}
          onChange={toggleTheme}
        />
      </div>

      {/* Notifications Section */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
          Notifications
        </h3>
        <div className="space-y-3">
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
          />
        </div>
      </div>

      {/* System Section */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
          System
        </h3>
        <SettingToggle
          icon={Wifi}
          label="Auto Sync"
          description="Automatically sync your data"
          checked={true}
          onChange={() => {}}
        />
      </div>

      {/* About Section */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
          About Side-B
        </h3>
        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <p>Version: 1.0.0</p>
          <p>A reflective digital diary with desktop environment</p>
          <p className="mt-4 text-xs">© 2024 Side-B. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default Settings;
