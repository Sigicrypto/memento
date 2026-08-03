"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Camera, Layout, Shield, Copy, Trash2, Sparkles, BarChart2, Image as ImageIcon, LogOut, Settings, ArrowRight, Search, CheckCircle, Zap, Star, Heart, Grid, List, ExternalLink, QrCode } from 'lucide-react';
import Lottie from 'lottie-react';
import AnimatedLogo from '@/components/AnimatedLogo';
import ThemeToggle from '@/components/ThemeToggle';
import EventSettingsDrawer from '@/components/EventSettingsDrawer';

interface Profile {
  id: string;
  full_name: string;
  email: string;
  plan: string;
  payment_status: string;
  created_at: string;
  role?: string;
}

interface Event {
  id: string;
  name: string;
  slug: string;
  created_at: string;
  photo_count?: number;
  custom_domain?: string;
  plan_type?: string;
}

const PLAN_INFO: Record<string, { name: string; icon: React.ReactNode; features: string[] }> = {
  starter: {
    name: 'Starter',
    icon: <Zap size={16} />,
    features: ['Up to 150 guests', 'Live photo wall', '25 uploads/guest'],
  },
  standard: {
    name: 'Standard',
    icon: <Star size={16} />,
    features: ['Up to 300 guests', 'Auto album creation', '50 uploads/guest'],
  },
  premium: {
    name: 'Premium',
    icon: <Heart size={16} />,
    features: ['Unlimited guests', 'Music slideshow', 'Expiring galleries'],
  },
  whitelabel: {
    name: 'White Label',
    icon: <Shield size={16} />,
    features: ['Full branding removal', 'Custom domain', 'Partner resell rights'],
  },
};

export default function DashboardPage() {
  const { user, profile, isApproved, isLoading, isSuperAdmin } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState('');
  const [deleteEvent, setDeleteEvent] = useState<Event | null>(null);
  const [deleteText, setDeleteText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [emptyLottieData, setEmptyLottieData] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  useEffect(() => {
    fetch('https://assets9.lottiefiles.com/packages/lf20_swnrn2oy.json')
      .then(res => res.json())
      .then(setEmptyLottieData)
      .catch(() => {});
  }, []);

  const fetchEvents = async () => {
    if (!user) return;
    const { data: eventData } = await supabase.from('events').select('*')
      .eq('owner_id', user.id).order('created_at', { ascending: false });

    if (eventData) {
      const eventsWithCounts = await Promise.all(eventData.map(async (event) => {
        const { count } = await supabase
          .from('photos')
          .select('*', { count: 'exact', head: true })
          .eq('event_id', event.id);
        return { ...event, photo_count: count || 0 };
      }));
      setEvents(eventsWithCounts);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isLoading) return;
    if (!user) { router.push('/'); return; }
    if (!isApproved) { router.push('/pending'); return; }

    fetchEvents();
  }, [user, isLoading, router, isApproved]);

  const confirmDelete = (event: Event) => { setDeleteEvent(event); setDeleteText(''); };

  const executeDelete = async () => {
    if (!deleteEvent || deleteText !== deleteEvent.name) return;
    setIsDeleting(true);
    await supabase.from('events').delete().eq('id', deleteEvent.id);
    setEvents((prev) => prev.filter((e) => e.id !== deleteEvent.id));
    setDeleteEvent(null);
    setIsDeleting(false);
  };

  const copyUrl = (slug: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/mobile/${slug}`);
    setCopied(slug);
    setTimeout(() => setCopied(''), 2000);
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="w-10 h-10 border-2 border-white/10 border-t-accent-cyan rounded-full animate-spin" />
      </div>
    );
  }

  const currentPlan = profile?.plan || 'starter';
  const planInfo = PLAN_INFO[currentPlan] || PLAN_INFO.starter;
  const totalPhotos = events.reduce((sum, e) => sum + (e.photo_count || 0), 0);
  const firstName = (profile?.full_name || 'there').split(' ')[0];
  const initial = (profile?.full_name || 'U').charAt(0).toUpperCase();

  const filteredEvents = events.filter(e => e.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="relative flex flex-col w-full min-h-screen">
      {/* ── MAIN CONTENT ── */}
      <main className="flex-grow pt-8 pb-20 px-4 md:px-10 max-w-7xl mx-auto w-full relative z-10">
        
        {/* Welcome Glass Banner */}
        <div className="relative mb-10 p-6 md:p-8 rounded-3xl border border-white/10 bg-gradient-to-r from-purple-950/40 via-surface/60 to-cyan-950/30 backdrop-blur-2xl shadow-2xl overflow-hidden">
          <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 -mb-12 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="relative">
                <div className="w-16 h-16 rounded-full p-0.5 bg-gradient-to-tr from-purple-500 via-pink-500 to-accent-cyan shadow-lg shadow-purple-500/20 flex items-center justify-center">
                  <div className="w-full h-full rounded-full bg-bg flex items-center justify-center text-xl font-black text-white">
                    {initial}
                  </div>
                </div>
                <span className="absolute bottom-0 right-0 w-4 h-4 bg-success border-2 border-bg rounded-full" />
              </div>

              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-accent-cyan bg-clip-text text-transparent">
                    Welcome back, {firstName}
                  </h1>
                  <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-accent-cyan/10 border border-accent-cyan/20 text-accent-cyan tracking-wider">
                    {planInfo.name} Plan
                  </span>
                </div>
                <p className="text-text-secondary text-sm flex items-center gap-2">
                  <span>{profile?.email || user?.email}</span>
                  {isSuperAdmin && (
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      Super Admin
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <Link href="/create" className="w-full md:w-auto btn btn-primary flex items-center justify-center gap-2 !py-3.5 !px-6 shadow-lg shadow-purple-500/25">
                <Plus size={18} />
                <span>Create New Wall</span>
              </Link>
            </div>
          </div>
        </div>

        {/* KPI Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Card 1: Active Events */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.4, delay: 0.1 }} 
            className="p-6 rounded-2xl border border-white/10 bg-surface/40 backdrop-blur-xl hover:border-white/20 transition-all duration-300 flex flex-col justify-between group shadow-card"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-text-secondary">Active Photo Walls</span>
              <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 group-hover:scale-110 transition-transform">
                <Layout size={18} />
              </div>
            </div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-4xl font-black tracking-tight text-white">{events.length}</span>
              <span className="text-xs text-text-muted">walls active</span>
            </div>
            <div className="mt-4 h-10 w-full flex items-end gap-1 opacity-70">
              {[35, 45, 30, 65, 80, 55, 90, 75, 100].map((h, i) => (
                <div key={i} className="flex-1 bg-gradient-to-t from-purple-600 to-cyan-400 rounded-t-sm" style={{ height: `${h}%` }} />
              ))}
            </div>
          </motion.div>

          {/* Card 2: Total Photos */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.4, delay: 0.2 }} 
            className="p-6 rounded-2xl border border-white/10 bg-surface/40 backdrop-blur-xl hover:border-white/20 transition-all duration-300 flex flex-col justify-between group shadow-card"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-text-secondary">Total Photos Collected</span>
              <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-accent-cyan group-hover:scale-110 transition-transform">
                <ImageIcon size={18} />
              </div>
            </div>
            <div className="flex items-baseline gap-3 mb-2">
              <span className="text-4xl font-black tracking-tight text-white">{totalPhotos}</span>
              <span className="text-xs font-bold text-success bg-success/10 border border-success/20 px-2.5 py-1 rounded-full flex items-center gap-1">
                <Sparkles size={10} /> Live Synced
              </span>
            </div>
            <div className="mt-4 h-10 w-full flex items-end">
              <svg viewBox="0 0 100 30" className="w-full h-full overflow-visible opacity-70">
                <defs>
                  <linearGradient id="photoGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0891A8" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#0891A8" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d="M0,30 L0,22 L15,25 L30,12 L45,18 L60,8 L75,15 L90,5 L100,10 L100,30 Z" fill="url(#photoGrad)" />
                <path d="M0,22 L15,25 L30,12 L45,18 L60,8 L75,15 L90,5 L100,10" fill="none" stroke="#5EE6FF" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
          </motion.div>

          {/* Card 3: Active Plan */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.4, delay: 0.3 }} 
            className="p-6 rounded-2xl border border-white/10 bg-gradient-to-br from-surface/60 to-bg-subtle/80 backdrop-blur-xl hover:border-white/20 transition-all duration-300 flex flex-col justify-between shadow-card"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2.5 text-white">
                <div className="p-2 rounded-lg bg-accent-cyan/10 border border-accent-cyan/20 text-accent-cyan">
                  {planInfo.icon}
                </div>
                <span className="text-base font-bold">{planInfo.name} Tier</span>
              </div>
              <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-success/20 text-success border border-success/30 tracking-widest">
                Active
              </span>
            </div>
            <div className="flex flex-col gap-2 my-2">
              {planInfo.features.slice(0, 3).map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-text-secondary">
                  <CheckCircle size={13} className="text-accent-cyan shrink-0" />
                  <span>{f}</span>
                </div>
              ))}
            </div>
            {currentPlan !== 'whitelabel' && (
              <Link href="/#pricing" className="text-xs font-bold text-accent-cyan hover:underline flex items-center gap-1.5 w-max mt-3 transition-all">
                <span>Upgrade Plan</span> <ArrowRight size={12} />
              </Link>
            )}
          </motion.div>
        </div>

        {/* Events Section Header */}
        <section>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-white tracking-tight">Your Events</h2>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-white/10 text-white border border-white/10">
                  {filteredEvents.length}
                </span>
              </div>
              <p className="text-text-secondary text-xs mt-1">Manage and monitor all your interactive photo walls.</p>
            </div>
            
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative flex-grow md:flex-grow-0">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search events..." 
                  className="input pl-9 pr-4 py-2 text-sm w-full md:w-64 bg-surface/50 border-white/10 rounded-xl focus:border-accent-cyan"
                />
              </div>

              {/* View Switcher: Grid vs Table */}
              <div className="flex items-center p-1 bg-surface/60 border border-white/10 rounded-xl shrink-0">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/30' : 'text-text-muted hover:text-white'}`}
                  title="Grid View"
                >
                  <Grid size={16} />
                </button>
                <button 
                  onClick={() => setViewMode('table')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'table' ? 'bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/30' : 'text-text-muted hover:text-white'}`}
                  title="Table View"
                >
                  <List size={16} />
                </button>
              </div>
            </div>
          </div>

          {events.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center border border-dashed border-white/10 bg-surface/20 rounded-3xl backdrop-blur-xl">
               <div className="w-48 h-48 mb-2 flex items-center justify-center opacity-90">
                 {emptyLottieData ? (
                   <Lottie 
                     animationData={emptyLottieData}
                     loop={true} 
                     autoplay={true} 
                   />
                 ) : (
                   <Camera size={48} className="text-text-muted opacity-50" />
                 )}
               </div>
               <h3 className="text-lg font-bold mb-2 text-white">No active photo walls yet</h3>
               <p className="text-text-secondary max-w-sm mb-6 text-sm">Create your first photo wall in seconds and start collecting guest memories instantly.</p>
               <Link href="/create" className="btn btn-primary flex items-center gap-2 !py-3 !px-6">
                 <Plus size={18} /> <span>Launch your first wall</span>
               </Link>
            </div>
          ) : filteredEvents.length === 0 ? (
             <div className="p-12 text-center text-text-muted text-sm border border-dashed border-white/10 rounded-2xl bg-surface/30">
               No events found matching "{searchQuery}"
             </div>
          ) : viewMode === 'grid' ? (
            /* ── GRID VIEW ── */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
                {filteredEvents.map((event, i) => (
                  <motion.div 
                    key={event.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: i * 0.05 }}
                    className="p-6 rounded-2xl border border-white/10 bg-surface/40 backdrop-blur-xl hover:border-white/20 transition-all duration-300 flex flex-col justify-between group shadow-card"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-accent-cyan/10 border border-accent-cyan/20 text-accent-cyan">
                          {event.photo_count || 0} Photos Collected
                        </span>
                        <span className="text-xs text-text-muted">
                          {new Date(event.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-white mb-2 group-hover:text-accent-cyan transition-colors">
                        <Link href={`/wall/${event.slug}`}>{event.name}</Link>
                      </h3>
                    </div>

                    <div className="pt-6 border-t border-white/10 mt-6 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <button 
                          onClick={() => copyUrl(event.slug)} 
                          className="p-2 rounded-xl text-text-muted hover:text-white hover:bg-white/10 transition-colors"
                          title="Copy Upload Link"
                        >
                          {copied === event.slug ? <CheckCircle size={16} className="text-success" /> : <Copy size={16} />}
                        </button>
                        <Link 
                          href={`/dashboard/${event.id}/analytics`} 
                          className="p-2 rounded-xl text-text-muted hover:text-white hover:bg-white/10 transition-colors" 
                          title="Analytics"
                        >
                          <BarChart2 size={16} />
                        </Link>
                        <button 
                          onClick={() => setEditingEventId(event.id)} 
                          className="p-2 rounded-xl text-text-muted hover:text-white hover:bg-white/10 transition-colors" 
                          title="Settings"
                        >
                          <Settings size={16} />
                        </button>
                        <button 
                          onClick={() => confirmDelete(event)} 
                          className="p-2 rounded-xl text-text-muted hover:text-error hover:bg-error/10 transition-colors" 
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <Link 
                        href={`/wall/${event.slug}`}
                        className="text-xs font-bold text-accent-cyan flex items-center gap-1 hover:underline"
                      >
                        <span>Launch Wall</span> <ExternalLink size={12} />
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            /* ── TABLE VIEW ── */
            <div className="rounded-2xl border border-white/10 bg-surface/30 backdrop-blur-xl overflow-hidden shadow-card">
              <div className="overflow-x-auto w-full">
                <table className="data-table w-full">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/[0.02]">
                      <th className="py-4 px-6 text-left text-xs font-bold uppercase text-text-muted">Event Name</th>
                      <th className="py-4 px-6 text-left text-xs font-bold uppercase text-text-muted">Created Date</th>
                      <th className="py-4 px-6 text-left text-xs font-bold uppercase text-text-muted">Photos</th>
                      <th className="py-4 px-6 text-right text-xs font-bold uppercase text-text-muted">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    <AnimatePresence mode="popLayout">
                      {filteredEvents.map((event, i) => (
                        <motion.tr 
                          key={event.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          transition={{ delay: i * 0.05 }}
                          className="hover:bg-white/[0.02] transition-colors group"
                        >
                          <td className="py-4 px-6 font-semibold text-sm">
                            <Link href={`/wall/${event.slug}`} className="hover:text-accent-cyan transition-colors text-white">{event.name}</Link>
                          </td>
                          <td className="py-4 px-6 text-text-secondary text-sm">
                            {new Date(event.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </td>
                          <td className="py-4 px-6">
                            <span className="inline-flex items-center justify-center bg-white/5 border border-white/10 rounded-full px-3 py-1 text-xs font-bold text-accent-cyan">
                              {event.photo_count || 0}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button onClick={() => copyUrl(event.slug)} className="p-2 text-text-muted hover:text-white hover:bg-white/10 rounded-lg transition-colors" title="Copy Link">
                                {copied === event.slug ? <CheckCircle size={15} className="text-success" /> : <Copy size={15} />}
                              </button>
                              <Link href={`/dashboard/${event.id}/analytics`} className="p-2 text-text-muted hover:text-white hover:bg-white/10 rounded-lg transition-colors" title="Analytics">
                                <BarChart2 size={15} />
                              </Link>
                              <button onClick={() => setEditingEventId(event.id)} className="p-2 text-text-muted hover:text-white hover:bg-white/10 rounded-lg transition-colors" title="Settings">
                                <Settings size={15} />
                              </button>
                              <button onClick={() => confirmDelete(event)} className="p-2 text-text-muted hover:text-error hover:bg-error/10 rounded-lg transition-colors" title="Delete">
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* ── DELETE MODAL ── */}
      <AnimatePresence>
        {deleteEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm relative z-10 shadow-2xl border border-white/10 bg-surface/90 backdrop-blur-2xl rounded-3xl p-6"
            >
              <div className="flex flex-col gap-6">
                <div>
                  <h3 className="text-lg font-bold text-white">Delete Event</h3>
                  <p className="text-text-secondary text-sm mt-1">This action cannot be undone. All collected photos will be permanently erased.</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                  <p className="text-text-muted text-xs mb-1">Confirm deletion of:</p>
                  <p className="font-bold text-white text-sm">{deleteEvent.name}</p>
                </div>

                <div className="input-group">
                  <label className="label text-xs">
                    Type <span className="text-white font-bold">{deleteEvent.name}</span> to confirm
                  </label>
                  <input
                    type="text"
                    value={deleteText}
                    onChange={(e) => setDeleteText(e.target.value)}
                    placeholder="Enter event name"
                    className="input w-full bg-white/5 border-white/10 rounded-xl"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setDeleteEvent(null)}
                    className="btn btn-secondary flex-1 !rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={executeDelete}
                    disabled={deleteText !== deleteEvent.name || isDeleting}
                    className="btn flex-1 bg-error text-white border-error hover:bg-error/80 disabled:opacity-50 disabled:cursor-not-allowed border !rounded-xl"
                  >
                    {isDeleting ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <EventSettingsDrawer 
        eventId={editingEventId}
        onClose={() => setEditingEventId(null)}
        onSuccess={fetchEvents}
        user={user}
      />
    </div>
  );
}
