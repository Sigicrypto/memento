"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, ShieldAlert, Image as ImageIcon, Trash2, ShieldCheck, AlertCircle } from 'lucide-react';

interface Photo {
  id: string;
  url: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  guest_name?: string;
}

export default function ModerationQueue({ eventId }: { eventId: string }) {
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Mock fetching photos
  useEffect(() => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setPhotos([
        { id: '1', url: '/landing-hero/photo1.jpg', status: 'pending', created_at: new Date().toISOString(), guest_name: 'Alice' },
        { id: '2', url: '/landing-hero/photo2.jpg', status: 'pending', created_at: new Date(Date.now() - 5000).toISOString(), guest_name: 'Bob' },
        { id: '3', url: '/landing-hero/photo3.jpg', status: 'approved', created_at: new Date(Date.now() - 10000).toISOString(), guest_name: 'Charlie' },
        { id: '4', url: '/landing-hero/photo4.jpg', status: 'rejected', created_at: new Date(Date.now() - 15000).toISOString() },
      ]);
      setIsLoading(false);
    }, 1000);
  }, [eventId]);

  const handleModerate = (id: string, newStatus: 'approved' | 'rejected') => {
    setPhotos(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p));
    // In a real app, this would trigger a Supabase update:
    // supabase.from('photos').update({ status: newStatus }).eq('id', id)
  };

  const filteredPhotos = photos.filter(p => p.status === activeTab);

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 text-white rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="p-6 border-b border-white/10 bg-slate-900/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <ShieldCheck className="text-cyan-400" /> Host Moderation Queue
          </h2>
          <p className="text-slate-400 text-sm mt-1">Review guest uploads in real-time before they appear on the Live Wall.</p>
        </div>
        
        <div className="flex p-1 bg-slate-950 rounded-lg border border-white/10">
          {(['pending', 'approved', 'rejected'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-md text-sm font-bold capitalize transition-all ${
                activeTab === tab 
                  ? 'bg-cyan-500/20 text-cyan-400' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab} ({photos.filter(p => p.status === tab).length})
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6 bg-slate-900/20">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-500">
            <div className="w-8 h-8 border-4 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin mb-4"></div>
            <p className="font-medium animate-pulse">Loading queue...</p>
          </div>
        ) : filteredPhotos.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-500">
            <ShieldAlert size={48} className="mb-4 opacity-50" />
            <p className="font-medium">No {activeTab} photos found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence>
              {filteredPhotos.map((photo) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  key={photo.id}
                  className="group relative rounded-xl overflow-hidden border border-white/10 bg-slate-900 aspect-[3/4]"
                >
                  <img src={photo.url} alt="Guest Upload" className="w-full h-full object-cover" />
                  
                  {/* Overlay Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  
                  {/* Moderation Controls (Overlay) */}
                  <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform flex justify-between items-center bg-black/60 backdrop-blur-md">
                    {photo.status !== 'approved' && (
                      <button 
                        onClick={() => handleModerate(photo.id, 'approved')}
                        className="flex-1 mr-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 py-2 rounded-lg flex items-center justify-center gap-2 font-bold text-sm transition-colors"
                      >
                        <Check size={16} /> Approve
                      </button>
                    )}
                    {photo.status !== 'rejected' && (
                      <button 
                        onClick={() => handleModerate(photo.id, 'rejected')}
                        className="flex-1 ml-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/30 py-2 rounded-lg flex items-center justify-center gap-2 font-bold text-sm transition-colors"
                      >
                        <X size={16} /> Reject
                      </button>
                    )}
                  </div>
                  
                  {/* Info Badge */}
                  <div className="absolute top-3 left-3 flex gap-2">
                    {photo.status === 'pending' && <span className="px-2.5 py-1 bg-amber-500/80 backdrop-blur-md text-white text-[10px] font-black uppercase rounded shadow-lg border border-white/10 flex items-center gap-1"><AlertCircle size={10} /> Pending Review</span>}
                    {photo.status === 'approved' && <span className="px-2.5 py-1 bg-emerald-500/80 backdrop-blur-md text-white text-[10px] font-black uppercase rounded shadow-lg border border-white/10 flex items-center gap-1"><Check size={10} /> Live</span>}
                    {photo.status === 'rejected' && <span className="px-2.5 py-1 bg-rose-500/80 backdrop-blur-md text-white text-[10px] font-black uppercase rounded shadow-lg border border-white/10 flex items-center gap-1"><X size={10} /> Hidden</span>}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
