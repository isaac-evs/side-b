import React from 'react';
import { Calendar } from 'lucide-react';
import useAppStore from '../../../store/appStore';

const ThisWeekWidget = () => {
  const { entries } = useAppStore();

  // Calculate entries this week
  const calculateThisWeek = () => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    return entries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= startOfWeek;
    }).length;
  };

  const thisWeek = calculateThisWeek();

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
      <Calendar className="w-10 h-10 mb-2" style={{ color: '#6EC9B1' }} />
      <div 
        className="text-3xl font-bold"
        style={{
          color: '#000',
          fontFamily: 'Lucida Grande, -apple-system, system-ui, sans-serif'
        }}
      >
        {thisWeek}
      </div>
      <div 
        className="text-xs mt-1"
        style={{
          color: '#666',
          fontFamily: 'Lucida Grande, -apple-system, system-ui, sans-serif'
        }}
      >
        This Week
      </div>
    </div>
  );
};

export default ThisWeekWidget;
