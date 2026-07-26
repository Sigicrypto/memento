"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Camera, Layout, Shield, Copy, Trash2, Sparkles, BarChart2, Image as ImageIcon, LogOut, Settings, ArrowRight, Search, CheckCircle, Zap, Star, Heart } from 'lucide-react';
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
    navigator.clipboard.writeText(`${window.location.origin}/upload/${slug}`);
    setCopied(slug);
    setTimeout(() => setCopied(''), 2000);
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-subtle">
        <div className="w-8 h-8 border-2 border-border border-t-primary rounded-full animate-spin" />
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
    <div className="relative flex flex-col w-full">
      <div className="grain" />
      <div className="orbs"><div className="orb orb-primary" /><div className="orb orb-secondary" /></div>

      {/* ── MAIN ── */}
      <main className="flex-grow pt-10 pb-20 px-4 md:px-10 max-w-7xl mx-auto w-full">
        
        {/* Profile Header */}
        <div className="flex items-center gap-5 mb-10">
           <div className="w-14 h-14 rounded-full bg-bg border border-border flex items-center justify-center text-lg font-bold text-text-primary">
             {initial}
           </div>
           <div>
             <h1 className="h2-text mb-1 text-text-primary">
               Welcome, {firstName}
             </h1>
             <p className="text-text-secondary text-sm">{profile?.email || user?.email}</p>
           </div>
        </div>

        {/* Tremor-style Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="card flex flex-col justify-between p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-text-secondary">Active Events</span>
              <BarChart2 size={16} className="text-text-muted" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight text-text-primary">{events.length}</span>
            </div>
            <div className="mt-4 h-12 w-full flex items-end gap-1 opacity-60">
              {/* Dummy sparkline */}
              {[40, 20, 60, 80, 50, 90, 70].map((h, i) => (
                <div key={i} className="flex-1 bg-accent-cyan rounded-t-sm" style={{ height: `${h}%` }} />
              ))}
            </div>
          </div>

          <div className="card flex flex-col justify-between p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-text-secondary">Total Photos Collected</span>
              <ImageIcon size={16} className="text-text-muted" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight text-text-primary">{totalPhotos}</span>
              <span className="text-xs font-medium text-success bg-success/10 px-2 py-0.5 rounded-full">+12%</span>
            </div>
            <div className="mt-4 h-12 w-full flex items-end">
              {/* Dummy area chart */}
              <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible opacity-50">
                <path d="M0,40 L0,30 L20,35 L40,15 L60,25 L80,5 L100,20 L100,40 Z" fill="var(--accent-cyan)" fillOpacity="0.2" />
                <path d="M0,30 L20,35 L40,15 L60,25 L80,5 L100,20" fill="none" stroke="var(--accent-cyan)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>

          <div className="card flex flex-col justify-between p-6 bg-gradient-to-br from-surface to-bg-subtle">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2 text-text-primary">
                {planInfo.icon}
                <span className="text-sm font-semibold">{planInfo.name} Plan</span>
              </div>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-success/20 text-success tracking-wider border border-success/30">Active</span>
            </div>
            <div className="flex flex-col gap-2 mb-4 mt-2">
              {planInfo.features.slice(0, 3).map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-text-secondary">
                  <CheckCircle size={12} className="text-accent-cyan" />
                  {f}
                </div>
              ))}
            </div>
            {currentPlan !== 'whitelabel' && (
              <Link href="/#pricing" className="text-xs font-semibold text-text-primary hover:text-accent-cyan flex items-center gap-1 w-max mt-auto transition-colors">
                Upgrade Plan <ArrowRight size={12} />
              </Link>
            )}
          </div>
        </div>

        {/* Events Section */}
        <section>
          <div className="flex flex-col sm:flex-row justify-between items-end gap-6 mb-6">
            <div>
              <h2 className="text-lg font-semibold mb-1 text-text-primary">Your Events</h2>
              <p className="text-text-secondary text-sm">Manage your active photo walls.</p>
            </div>
            
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className="relative flex-grow sm:flex-grow-0">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search events..." 
                  className="input pl-8 w-full sm:w-64"
                />
              </div>
              <Link href="/create" className="btn btn-primary flex-shrink-0">
                 <Plus size={16} /> <span className="hidden sm:inline">Create Wall</span>
              </Link>
            </div>
          </div>

          {events.length === 0 ? (
            <div className="card p-12 text-center flex flex-col items-center border-dashed border-2">
               <div className="w-12 h-12 rounded-full bg-bg-subtle border border-border flex items-center justify-center text-text-muted mb-4">
                 <Layout size={20} />
               </div>
               <h3 className="text-base font-semibold mb-2 text-text-primary">No active events yet</h3>
               <p className="text-text-secondary max-w-sm mb-6 text-sm">Create your first photo wall and start collecting cinematic memories instantly.</p>
               <Link href="/create" className="btn btn-primary">
                 <Plus size={16} /> Launch your first wall
               </Link>
            </div>
          ) : filteredEvents.length === 0 ? (
             <div className="card p-12 text-center text-text-muted text-sm border-dashed">No events found matching "{searchQuery}"</div>
          ) : (
            <div className="table-container shadow-card">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Event Name</th>
                    <th>Date Created</th>
                    <th>Photos</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence mode="popLayout">
                    {filteredEvents.map((event, i) => (
                      <motion.tr 
                        key={event.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ delay: i * 0.05 }}
                        className="group"
                      >
                        <td className="font-medium">
                          <Link href={`/wall/${event.slug}`} className="hover:text-accent-cyan transition-colors">{event.name}</Link>
                        </td>
                        <td className="text-text-secondary text-sm">
                          {new Date(event.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td>
                          <span className="inline-flex items-center justify-center bg-bg-subtle border border-border rounded-full px-3 py-1 text-xs font-semibold">
                            {event.photo_count || 0}
                          </span>
                        </td>
                        <td>
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => copyUrl(event.slug)} className="p-2 text-text-muted hover:text-text-primary hover:bg-bg-subtle rounded-md transition-colors" title="Copy Link">
                              {copied === event.slug ? <CheckCircle size={14} className="text-success" /> : <Copy size={14} />}
                            </button>
                            <Link href={`/dashboard/${event.id}/analytics`} className="p-2 text-text-muted hover:text-text-primary hover:bg-bg-subtle rounded-md transition-colors" title="Analytics">
                              <BarChart2 size={14} />
                            </Link>
                            <button onClick={() => setEditingEventId(event.id)} className="p-2 text-text-muted hover:text-text-primary hover:bg-bg-subtle rounded-md transition-colors" title="Settings">
                              <Settings size={14} />
                            </button>
                            <button onClick={() => confirmDelete(event)} className="p-2 text-text-muted hover:text-error hover:bg-error/10 rounded-md transition-colors" title="Delete">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      {/* ── DELETE MODAL ── */}
      <AnimatePresence>
        {deleteEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-bg/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="card w-full max-w-sm relative z-10 shadow-xl border-border"
            >
              <div className="flex flex-col gap-6">
                <div>
                  <h3 className="text-base font-bold text-text-primary">Delete Event</h3>
                  <p className="text-text-secondary text-sm mt-1">This action cannot be undone. All photos will be permanently erased.</p>
                </div>

                <div className="p-3 rounded bg-bg-subtle border border-border">
                  <p className="text-text-muted text-xs mb-1">Confirm deletion of:</p>
                  <p className="font-medium text-text-primary text-sm">{deleteEvent.name}</p>
                </div>

                <div className="input-group">
                  <label className="label">
                    Type <span className="text-text-primary font-bold">{deleteEvent.name}</span> to confirm
                  </label>
                  <input
                    type="text"
                    value={deleteText}
                    onChange={(e) => setDeleteText(e.target.value)}
                    placeholder="Enter event name"
                    className="input w-full"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setDeleteEvent(null)}
                    className="btn btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={executeDelete}
                    disabled={deleteText !== deleteEvent.name || isDeleting}
                    className="btn flex-1 bg-[#E00000] text-white border-[#E00000] hover:bg-[#C00000] disabled:opacity-50 disabled:cursor-not-allowed border"
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
