import React from 'react';
import { Flame } from 'lucide-react';
import useAppStore from '../../../store/appStore';

const StreakWidget = () => {
  const { entries } = useAppStore();

  // Calculate streak
  const calculateStreak = () => {
    if (entries.length === 0) return 0;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const sortedDates = [...new Set(entries.map(e => e.date))].sort().reverse();
    let currentStreak = 0;
    
    for (let i = 0; i < sortedDates.length; i++) {
      const entryDate = new Date(sortedDates[i]);
      entryDate.setHours(0, 0, 0, 0);
      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - i);
      
      if (entryDate.getTime() === expectedDate.getTime()) {
        currentStreak++;
      } else {
        break;
      }
    }
    
    return currentStreak;
  };

  const streak = calculateStreak();

  return (
    <div 
      className="w-32 h-32 rounded-xl flex flex-col items-center justify-center"
      style={{
        background: 'linear-gradient(to bottom, rgba(255,255,255,0.8) 0%, rgba(240,240,240,0.8) 100%)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(0,0,0,0.1)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.5)'
      }}
    >
      <Flame className="w-10 h-10 mb-2" style={{ color: '#ff6b35' }} />
      <div 
        className="text-3xl font-bold"
        style={{
          color: '#000',
          fontFamily: 'Lucida Grande, -apple-system, system-ui, sans-serif'
        }}
      >
        {streak}
      </div>
      <div 
        className="text-xs mt-1"
        style={{
          color: '#666',
          fontFamily: 'Lucida Grande, -apple-system, system-ui, sans-serif'
        }}
      >
        Day Streak
      </div>
    </div>
  );
};

export default StreakWidget;
