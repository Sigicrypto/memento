"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { BarChart3, Users, Image as ImageIcon, Heart, ArrowLeft, Download, TrendingUp } from 'lucide-react';

export default function AnalyticsPage() {
  const { id } = useParams();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPhotos: 0,
    uniqueGuests: 0,
    totalReactions: 0,
    peakHour: ''
  });
  const [hourlyData, setHourlyData] = useState<{hour: string, count: number}[]>([]);

  useEffect(() => {
    async function fetchAnalytics() {
      // For this demo/implementation we simulate the aggregation
      // In a real app with huge traffic, we'd use a postgres function or materialized view
      
      const { data: photos, error } = await supabase
        .from('photos')
        .select('id, created_at, uploader_name')
        .eq('event_id', id);
        
      if (error || !photos) return;

      const { data: reactions } = await supabase
        .from('reactions')
        .select('id, photo_id')
        .in('photo_id', photos.map(p => p.id));

      const guests = new Set(photos.map(p => p.uploader_name.toLowerCase().trim()));
      
      const hourlyCounts: Record<string, number> = {};
      photos.forEach(p => {
        const d = new Date(p.created_at);
        const hr = d.toLocaleTimeString([], { hour: '2-digit', hour12: true });
        hourlyCounts[hr] = (hourlyCounts[hr] || 0) + 1;
      });

      const chartData = Object.entries(hourlyCounts)
        .map(([hour, count]) => ({ hour, count }))
        .sort((a, b) => {
           // simple string sort might fail for 12hr format but good enough for demo
           return a.hour.localeCompare(b.hour);
        });

      let peak = '';
      let max = 0;
      chartData.forEach(d => { if(d.count > max) { max = d.count; peak = d.hour; } });

      setStats({
        totalPhotos: photos.length,
        uniqueGuests: guests.size,
        totalReactions: reactions?.length || 0,
        peakHour: peak || 'N/A'
      });
      setHourlyData(chartData);
      setLoading(false);
    }
    
    fetchAnalytics();
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  const maxCount = Math.max(...hourlyData.map(d => d.count), 1);

  return (
    <div className="min-h-screen p-8">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-text-muted hover:text-black dark:hover:text-text-primary mb-8 transition-colors">
        <ArrowLeft size={16} /> Back to Dashboard
      </button>

      <div className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-4xl font-bold mb-2">Engagement Analytics</h1>
          <p className="text-text-secondary">Track how guests are interacting with your wall.</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-bg-subtle border border-border rounded-xl hover:bg-border transition-colors text-sm font-bold">
           <Download size={16} /> Export CSV
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {[
          { label: 'Total Memories', value: stats.totalPhotos, icon: ImageIcon, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'Active Guests', value: stats.uniqueGuests, icon: Users, color: 'text-green-500', bg: 'bg-green-500/10' },
          { label: 'Total Reactions', value: stats.totalReactions, icon: Heart, color: 'text-pink-500', bg: 'bg-pink-500/10' },
          { label: 'Peak Upload Time', value: stats.peakHour, icon: TrendingUp, color: 'text-orange-500', bg: 'bg-orange-500/10' },
        ].map((stat, i) => (
          <div key={i} className="glass-panel p-6">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${stat.bg} ${stat.color}`}>
              <stat.icon size={24} />
            </div>
            <p className="text-text-secondary text-sm font-bold uppercase tracking-widest mb-1">{stat.label}</p>
            <p className="text-4xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="glass-panel p-8">
        <h3 className="text-xl font-bold mb-8 flex items-center gap-3"><BarChart3 size={20} className="text-primary" /> Upload Timeline</h3>
        <div className="h-64 flex items-end gap-2 sm:gap-4 border-b border-black/10 dark:border-border pb-4">
          {hourlyData.length === 0 ? (
            <div className="w-full h-full flex items-center justify-center text-text-muted">No data available yet</div>
          ) : (
            hourlyData.map((d, i) => {
              const height = (d.count / maxCount) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="w-full relative flex justify-center">
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-10 bg-white text-black px-2 py-1 rounded text-xs font-bold transition-opacity whitespace-nowrap">
                       {d.count} photos
                    </div>
                    <div 
                      className="w-full max-w-[40px] bg-primary/20 hover:bg-primary transition-colors rounded-t-sm"
                      style={{ height: `${height}%`, minHeight: '4px' }}
                    />
                  </div>
                  <span className="text-[10px] text-text-muted font-bold uppercase -rotate-45 sm:rotate-0 mt-4 sm:mt-0">{d.hour}</span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
