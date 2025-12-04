import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { 
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend 
} from 'recharts';
import { Activity, Music, Heart, Calendar, Share2 } from 'lucide-react';
import api from '../../../services/api';

const Insights = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // overview, moods, music

  useEffect(() => {
    const fetchInsights = async () => {
      if (!user) return;
      try {
        const userId = user.id || user._id;
        const response = await api.get(`/insights/${userId}`);
        setData(response.data);
      } catch (error) {
        console.error("Failed to fetch insights:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, [user]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-500">No insights available yet.</p>
      </div>
    );
  }

  const COLORS = {
    joy: '#F6DD73',
    calm: '#6EC9B1',
    sad: '#5386FE',
    stress: '#FE5344',
    unknown: '#CBD5E1'
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-100 shadow-lg rounded-lg">
          <p className="font-medium text-gray-900">{payload[0].name}</p>
          <p className="text-gray-600">
            {payload[0].value} entries
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Insights</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Your emotional and musical journey</p>
        </div>
        <div className="flex space-x-2">
          {['overview', 'moods', 'music'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          
          {/* Overview Cards */}
          {activeTab === 'overview' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-gray-500 dark:text-gray-400 font-medium">Total Entries</h3>
                    <Activity className="w-5 h-5 text-blue-500" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{data.stats.total_entries}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-gray-500 dark:text-gray-400 font-medium">Top Mood</h3>
                    <Heart className="w-5 h-5 text-pink-500" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white capitalize">
                    {data.stats.top_moods[0]?.name || 'None'}
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-gray-500 dark:text-gray-400 font-medium">Top Artist</h3>
                    <Music className="w-5 h-5 text-purple-500" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white truncate">
                    {data.stats.top_artists[0]?.name || 'None'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Mood Distribution Chart */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Mood Distribution</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={data.stats.top_moods}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {data.stats.top_moods.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[entry.name] || COLORS.unknown} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Top Artists Chart */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Top Artists</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.stats.top_artists}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" hide />
                        <YAxis />
                        <Tooltip 
                          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                          cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                        />
                        <Bar dataKey="value" fill="#8884d8" radius={[4, 4, 0, 0]}>
                          {data.stats.top_artists.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe'][index % 5]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Moods Tab */}
          {activeTab === 'moods' && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 min-h-[500px]">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Mood Timeline</h3>
              <p className="text-gray-500 mb-8">Visualizing your emotional journey over time.</p>
              
              <div className="relative h-[400px] w-full overflow-hidden">
                 {/* Simple visualization of entries as bubbles */}
                 <div className="flex flex-wrap gap-4 justify-center items-center h-full content-center">
                    {(data.raw_entries || []).map((entry, i) => (
                      <div 
                        key={i}
                        className="rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm transition-transform hover:scale-110 cursor-default"
                        style={{
                          width: Math.max(40, Math.min(100, (entry.text_length || 100) / 5)) + 'px',
                          height: Math.max(40, Math.min(100, (entry.text_length || 100) / 5)) + 'px',
                          backgroundColor: COLORS[entry.mood] || COLORS.unknown,
                          opacity: 0.8
                        }}
                        title={`${new Date(entry.date).toLocaleDateString()}: ${entry.mood}`}
                      >
                        {entry.mood}
                      </div>
                    ))}
                 </div>
              </div>
            </div>
          )}

          {/* Music Tab - Graph Visualization */}
          {activeTab === 'music' && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 min-h-[600px]">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Music & Mood Network</h3>
              <p className="text-gray-500 mb-8">How your music choices connect to your feelings.</p>
              
              <div className="relative h-[500px] border border-gray-100 rounded-lg bg-gray-50 flex items-center justify-center overflow-hidden">
                {/* 
                  Note: A real force-directed graph would require d3-force or react-force-graph.
                  For now, we'll create a radial layout using absolute positioning.
                */}
                <div className="relative w-full h-full">
                  {/* Center Node (User) */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
                    <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                      You
                    </div>
                  </div>

                  {/* Mood Nodes (Inner Circle) */}
                  {data.stats.top_moods.map((mood, i, arr) => {
                    const angle = (i / arr.length) * 2 * Math.PI;
                    const radius = 120;
                    const x = Math.cos(angle) * radius;
                    const y = Math.sin(angle) * radius;
                    
                    return (
                      <React.Fragment key={mood.name}>
                        {/* Line to center */}
                        <div 
                          className="absolute top-1/2 left-1/2 h-0.5 bg-gray-300 origin-left -z-0"
                          style={{
                            width: radius,
                            transform: `rotate(${angle * (180/Math.PI)}deg)`
                          }}
                        />
                        
                        {/* Mood Node */}
                        <div 
                          className="absolute top-1/2 left-1/2 w-12 h-12 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-md z-10 transition-transform hover:scale-110"
                          style={{
                            backgroundColor: COLORS[mood.name] || COLORS.unknown,
                            transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`
                          }}
                        >
                          {mood.name}
                        </div>
                      </React.Fragment>
                    );
                  })}

                  {/* Song Nodes (Outer Circle - Randomly distributed near their mood) */}
                  {data.graph_data.nodes.filter(n => n.type === 'song').slice(0, 20).map((song, i) => {
                    // Find the mood this song is connected to
                    const link = data.graph_data.links.find(l => l.target === song.id);
                    const moodName = link ? link.source : 'unknown';
                    const moodIndex = data.stats.top_moods.findIndex(m => m.name === moodName);
                    
                    // Base angle on mood, plus some randomness
                    const baseAngle = moodIndex >= 0 
                      ? (moodIndex / data.stats.top_moods.length) * 2 * Math.PI 
                      : Math.random() * 2 * Math.PI;
                    
                    const angle = baseAngle + (Math.random() - 0.5) * 0.5;
                    const radius = 220 + Math.random() * 40;
                    
                    const x = Math.cos(angle) * radius;
                    const y = Math.sin(angle) * radius;

                    return (
                      <div 
                        key={song.id}
                        className="absolute top-1/2 left-1/2 w-2 h-2 bg-gray-400 rounded-full hover:w-24 hover:h-auto hover:bg-white hover:p-2 hover:rounded hover:shadow-xl hover:z-50 group transition-all duration-300"
                        style={{
                          transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`
                        }}
                      >
                        <div className="hidden group-hover:block text-center">
                          <p className="text-xs font-bold text-gray-900 truncate">{song.name}</p>
                          <p className="text-[10px] text-gray-500 truncate">{song.artist}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Insights;
