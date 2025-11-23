import React from 'react';
import { TrendingUp } from 'lucide-react';
import useAppStore from '../../../store/appStore';

const ThisMonthWidget = () => {
  const { entries } = useAppStore();

  // Calculate entries this month
  const calculateThisMonth = () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    return entries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= startOfMonth;
    }).length;
  };

  const thisMonth = calculateThisMonth();

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
      <TrendingUp className="w-10 h-10 mb-2" style={{ color: '#F6DD73' }} />
      <div 
        className="text-3xl font-bold"
        style={{
          color: '#000',
          fontFamily: 'Lucida Grande, -apple-system, system-ui, sans-serif'
        }}
      >
        {thisMonth}
      </div>
      <div 
        className="text-xs mt-1"
        style={{
          color: '#666',
          fontFamily: 'Lucida Grande, -apple-system, system-ui, sans-serif'
        }}
      >
        This Month
      </div>
    </div>
  );
};

export default ThisMonthWidget;
