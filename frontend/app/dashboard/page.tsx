"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Camera, Layout, Shield, Copy, Trash2, Sparkles, BarChart2, Image as ImageIcon, LogOut, Settings, ArrowRight, Search } from 'lucide-react';

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

const PLAN_INFO: Record<string, { name: string; icon: string; color: string; glow: string; features: string[] }> = {
  starter: {
    name: 'Starter',
    icon: '⚡',
    color: '#22c55e',
    glow: 'rgba(34,197,94,0.15)',
    features: ['Up to 150 guests', 'Live photo wall', 'Unlimited uploads', 'Download as ZIP', '1 Month Storage'],
  },
  standard: {
    name: 'Standard',
    icon: '🔷',
    color: '#06b6d4',
    glow: 'rgba(6,182,212,0.15)',
    features: ['Up to 300 guests', 'Auto album creation', 'Custom wall theme', 'Slideshow TV Mode', '3 Months Storage'],
  },
  premium: {
    name: 'Premium',
    icon: '💎',
    color: '#ec4899',
    glow: 'rgba(236,72,153,0.15)',
    features: ['Unlimited guests', 'Music slideshow', 'Expiring galleries', 'Priority support', '6 Months Storage'],
  },
  whitelabel: {
    name: 'White Label',
    icon: '👑',
    color: '#6366f1',
    glow: 'rgba(99,102,241,0.15)',
    features: ['Full branding removal', 'Custom domain', 'Partner resell rights', 'Client management', 'Priority Setup'],
  },
};

export default function DashboardPage() {
  const { user, profile, isApproved, isLoading } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState('');
  const [deleteEvent, setDeleteEvent] = useState<Event | null>(null);
  const [deleteText, setDeleteText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isLoading) return;
    if (!user) { router.push('/'); return; }
    if (!isApproved) { router.push('/pending'); return; }

    const fetchEvents = async () => {
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
    fetchEvents();
  }, [user, isLoading, router]);

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
      <div className="lp" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="orbs"><div className="orb orb1" /><div className="orb orb2" /><div className="orb orb3" /></div>
        <div style={{ width: 44, height: 44, border: '3px solid rgba(6,182,212,0.15)', borderTopColor: '#06b6d4', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
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
    <div className="min-h-screen relative overflow-hidden bg-black text-white">
      {/* Background foundation */}
      <div className="orbs">
        <div className="orb orb-primary" />
        <div className="orb orb-secondary" />
      </div>
      <div className="grain" />

      {/* ── NAV ── */}
      <nav className="fixed top-0 left-0 right-0 z-[100] h-20 border-b border-white/5 bg-black/50 backdrop-blur-xl flex items-center justify-between px-6 md:px-12">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-[0_0_20px_var(--primary)] group-hover:scale-110 transition-transform">
             <span className="text-xl">📸</span>
          </div>
          <span className="text-xl font-bold tracking-tighter">memento</span>
        </Link>

        <div className="flex items-center gap-4">
          {profile?.role === 'admin' && (
            <Link href="/admin" className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-[10px] font-black tracking-widest uppercase hover:bg-secondary/20 transition-all">
              <Shield size={14} /> Admin
            </Link>
          )}
          <button
            onClick={() => supabase.auth.signOut().then(() => router.push('/'))}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 text-text-muted hover:text-white hover:bg-white/10 transition-all text-sm font-bold"
          >
            <LogOut size={16} /> <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </nav>

      {/* ── MAIN ── */}
      <main className="relative z-10 pt-32 pb-20 px-6 container mx-auto max-w-7xl">
        
        {/* Profile Header */}
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
           className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-16"
        >
           <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-4xl font-black shadow-2xl">
             {initial}
           </div>
           <div className="text-center md:text-left pt-2">
             <h1 className="display-text !text-4xl md:!text-5xl mb-2">
               Welcome back, <span className="text-secondary">{firstName}</span>
             </h1>
             <p className="text-text-secondary font-medium">{profile?.email || user?.email}</p>
           </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="gcard flex items-center gap-6 h-full">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <BarChart2 size={24} />
            </div>
            <div>
              <div className="text-3xl font-bold text-white leading-none mb-2">{events.length}</div>
              <div className="text-xs font-bold text-text-muted uppercase tracking-widest">Active Events</div>
            </div>
          </div>

          <div className="gcard flex items-center gap-6 h-full">
            <div className="w-16 h-16 rounded-2xl bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary">
              <ImageIcon size={24} />
            </div>
            <div>
              <div className="text-3xl font-bold text-white leading-none mb-2">{totalPhotos}</div>
              <div className="text-xs font-bold text-text-muted uppercase tracking-widest">Photos Collected</div>
            </div>
          </div>

          {/* Plan Card */}
          <div className="gcard relative overflow-hidden group flex flex-col h-full">
             {/* Plan background glow */}
             <div className="absolute -top-10 -right-10 w-32 h-32 blur-[60px] opacity-20 transition-colors duration-500" style={{ backgroundColor: planInfo.color }} />
             
             <div className="flex flex-col h-full relative z-10">
                <div className="flex justify-between items-start mb-6">
                   <div className="flex items-center gap-3">
                      <span className="text-2xl">{planInfo.icon}</span>
                      <span className="text-lg font-bold text-white">{planInfo.name}</span>
                   </div>
                   <span className="text-[9px] font-black tracking-widest uppercase px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 border border-green-500/20">Active</span>
                </div>
                
                <div className="flex-grow flex flex-col gap-2 mb-6">
                  {planInfo.features.slice(0, 2).map((f, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-text-secondary">
                      <div className="w-1 h-1 rounded-full" style={{ backgroundColor: planInfo.color }} />
                      {f}
                    </div>
                  ))}
                </div>

                {currentPlan !== 'whitelabel' && (
                  <Link href="/#pricing" className="text-[10px] font-black tracking-widest uppercase text-white hover:text-primary transition-colors flex items-center gap-2 group/link">
                    Upgrade Plan <ArrowRight size={10} className="group-hover/link:translate-x-1 transition-transform" />
                  </Link>
                )}
             </div>
          </div>
        </div>

        {/* Events Section */}
        <section>
          <div className="flex flex-col sm:flex-row justify-between items-end gap-6 mb-10">
            <div>
              <h2 className="text-3xl font-bold text-white tracking-tight mb-2">Your Events</h2>
              <p className="text-text-secondary">Capture and moderate shared memories from your walls.</p>
            </div>
            
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className="relative flex-grow sm:flex-grow-0">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search events..." 
                  className="w-full sm:w-64 bg-white/5 border border-white/10 rounded-full pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              <Link href="/create" className="btn-premium flex items-center gap-2 !py-3 !px-6 text-sm flex-shrink-0">
                 <Plus size={18} /> <span className="hidden sm:inline">Create New Wall</span>
              </Link>
            </div>
          </div>

          {events.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-panel p-20 text-center flex flex-col items-center"
            >
               <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-3xl mb-8">
                 🎈
               </div>
               <h3 className="text-2xl font-bold text-white mb-3">No active events yet</h3>
               <p className="text-text-secondary max-w-sm mb-10">Create your first photo wall and start collecting cinematic memories instantly.</p>
               <Link href="/create" className="btn-premium flex items-center gap-2">
                 <Plus size={20} /> Launch your first wall
               </Link>
            </motion.div>
          ) : filteredEvents.length === 0 ? (
             <div className="glass-panel p-16 text-center text-text-muted">No events found matching "{searchQuery}"</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
                {filteredEvents.map((event, i) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    index={i}
                    copied={copied}
                    onCopy={copyUrl}
                    onDelete={confirmDelete}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </section>
      </main>

      {/* ── DELETE MODAL ── */}
      <AnimatePresence>
        {deleteEvent && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
              onClick={() => setDeleteEvent(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="glass-panel w-full max-w-md p-8 relative z-10 overflow-hidden"
            >
              {/* Danger accent */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-red-500" />
              
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500">
                  <Trash2 size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Delete Event</h3>
                  <p className="text-red-500 text-xs font-bold uppercase tracking-widest">Permanent Action</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/10 mb-8">
                <p className="text-text-muted text-xs mb-1">Confirm deletion of:</p>
                <p className="text-white font-bold">{deleteEvent.name}</p>
                <p className="text-text-muted text-[10px] mt-2 italic">{deleteEvent.photo_count || 0} photos will be permanently erased.</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black tracking-widest uppercase text-text-muted mb-3">
                    Type <span className="text-white">{deleteEvent.name}</span> to confirm
                  </label>
                  <input
                    type="text"
                    value={deleteText}
                    onChange={(e) => setDeleteText(e.target.value)}
                    placeholder="Enter event name..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors"
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setDeleteEvent(null)}
                    className="flex-1 py-3 rounded-xl bg-white/5 text-text-muted font-bold hover:bg-white/10 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={executeDelete}
                    disabled={deleteText !== deleteEvent.name || isDeleting}
                    className={`flex-1 py-3 rounded-xl font-bold transition-all ${deleteText === deleteEvent.name ? 'bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.4)]' : 'bg-red-500/20 text-red-500/50 cursor-not-allowed'}`}
                  >
                    {isDeleting ? 'Deleting...' : 'Delete Wall'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── STAT CARD ── */
function StatCard({ icon, value, label, color, delay }: { icon: React.ReactNode; value: number; label: string; color: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      className="gcard flex items-center gap-6"
    >
      <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center" style={{ color }}>
        {icon}
      </div>
      <div>
        <div className="text-3xl font-bold text-white leading-none mb-2">{value}</div>
        <div className="text-xs font-bold text-text-muted uppercase tracking-widest">{label}</div>
      </div>
    </motion.div>
  );
}

/* ── EVENT CARD ── */
function EventCard({ event, index, copied, onCopy, onDelete }: {
  event: Event; index: number; copied: string;
  onCopy: (slug: string) => void;
  onDelete: (event: Event) => void;
}) {
  const dateStr = new Date(event.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="gcard flex flex-col justify-between h-full group"
    >
      <div className="flex flex-col gap-8">
        <div className="flex justify-between items-start">
        <div className="min-w-0">
          <h3 className="text-xl font-bold text-white tracking-tight truncate mb-2">{event.name}</h3>
          <div className="flex items-center gap-2">
             <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{dateStr}</span>
             <span className="w-1 h-1 rounded-full bg-white/10" />
             <span className="text-primary text-[10px] font-bold uppercase tracking-widest">{event.photo_count || 0} Photos</span>
          </div>
        </div>
        <Link href={`/dashboard/edit/${event.id}`} className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-text-muted hover:text-white transition-colors">
          <Settings size={18} />
        </Link>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {[
          { href: `/wall/${event.slug}`, icon: <Layout size={18} />, label: 'Wall', color: 'primary' },
          { href: `/mobile/${event.slug}`, icon: <Camera size={18} />, label: 'Scan', color: 'secondary' },
          { href: `/moderate/${event.slug}`, icon: <Shield size={18} />, label: 'Mod', color: 'text-white' },
          { href: `/dashboard/${event.id}/analytics`, icon: <BarChart2 size={18} />, label: 'Stats', color: 'text-white' },
        ].map((btn) => (
          <Link key={btn.label} href={btn.href} className="flex flex-col items-center justify-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all group/btn">
            <div className={`text-${btn.color} group-hover/btn:scale-110 transition-transform`}>{btn.icon}</div>
            <span className="text-[9px] font-black tracking-widest uppercase text-text-muted">{btn.label}</span>
          </Link>
        ))}
      </div>
      </div>

      <div className="flex gap-3 pt-6 border-t border-white/5 mt-auto">
        <button
          onClick={() => onCopy(event.slug)}
          className="flex-1 flex items-center justify-between px-4 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-xs font-medium text-text-secondary truncate"
        >
          <span className="truncate">{copied === event.slug ? 'Copied' : `memento.live/${event.slug}`}</span>
          <Copy size={copied === event.slug ? 0 : 14} className="flex-shrink-0 ml-2" />
        </button>
        <button
          onClick={() => onDelete(event)}
          className="w-12 h-12 rounded-xl bg-red-500/5 border border-red-500/10 flex items-center justify-center text-red-500 hover:bg-red-500/10 transition-all"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </motion.div>
  );
}