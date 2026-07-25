"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Camera, Layout, Shield, Copy, Trash2, Sparkles, BarChart2, Image as ImageIcon, LogOut, Settings, ArrowRight, Search, CheckCircle } from 'lucide-react';
import AnimatedLogo from '@/components/AnimatedLogo';
import ThemeToggle from '@/components/ThemeToggle';

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

// Re-implement icons for local use as they were missing from imports
import { Zap, Star, Heart } from 'lucide-react';

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
      <div className="min-h-screen flex items-center justify-center bg-bg">
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
    <div className="min-h-screen bg-bg relative">
      
      {/* ── NAV ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-border bg-bg/90 backdrop-blur flex items-center justify-between px-6">
        <div className="flex items-center gap-6">
          <Link href="/">
            <AnimatedLogo width={120} height={32} />
          </Link>
          <div className="h-4 w-px bg-border hidden md:block" />
          <span className="text-xs font-semibold text-text-secondary hidden md:block">Studio</span>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          {isSuperAdmin && (
            <Link href="/admin" className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-md bg-bg-subtle border border-border text-xs font-semibold text-text-primary hover:bg-border transition-all">
              <Shield size={14} /> Admin
            </Link>
          )}
          <button
            onClick={() => supabase.auth.signOut().then(() => router.push('/'))}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md text-text-secondary hover:text-text-primary hover:bg-bg-subtle transition-all text-sm font-medium"
          >
            <LogOut size={16} /> <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </nav>

      {/* ── MAIN ── */}
      <main className="pt-24 pb-20 px-6 container mx-auto max-w-6xl">
        
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-10">
           <div className="w-16 h-16 rounded-full bg-bg-subtle border border-border flex items-center justify-center text-xl font-bold text-text-primary">
             {initial}
           </div>
           <div className="text-center md:text-left pt-2">
             <h1 className="text-2xl font-bold mb-1 text-text-primary">
               Welcome back, {firstName}
             </h1>
             <p className="text-text-secondary text-sm">{profile?.email || user?.email}</p>
           </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="card flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-bg-subtle border border-border flex items-center justify-center text-text-primary flex-shrink-0">
              <BarChart2 size={20} />
            </div>
            <div>
              <div className="text-2xl font-bold leading-none mb-1 text-text-primary">{events.length}</div>
              <div className="text-xs font-medium text-text-secondary">Active Events</div>
            </div>
          </div>

          <div className="card flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-bg-subtle border border-border flex items-center justify-center text-text-primary flex-shrink-0">
              <ImageIcon size={20} />
            </div>
            <div>
              <div className="text-2xl font-bold leading-none mb-1 text-text-primary">{totalPhotos}</div>
              <div className="text-xs font-medium text-text-secondary">Photos Collected</div>
            </div>
          </div>

          {/* Plan Card */}
          <div className="card flex flex-col justify-between">
             <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                   <div className="text-text-primary">{planInfo.icon}</div>
                   <span className="text-sm font-semibold text-text-primary">{planInfo.name}</span>
                </div>
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-bg-subtle border border-border text-text-secondary">Active</span>
             </div>
             
             <div className="flex flex-col gap-1.5 mb-4">
               {planInfo.features.slice(0, 2).map((f, i) => (
                 <div key={i} className="flex items-center gap-2 text-xs text-text-secondary">
                   <CheckCircle size={12} className="text-text-muted" />
                   {f}
                 </div>
               ))}
             </div>

             {currentPlan !== 'whitelabel' && (
               <Link href="/#pricing" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 w-max">
                 Upgrade Plan <ArrowRight size={12} />
               </Link>
             )}
          </div>
        </div>

        {/* Events Section */}
        <section>
          <div className="flex flex-col sm:flex-row justify-between items-end gap-6 mb-6">
            <div>
              <h2 className="text-xl font-bold mb-1 text-text-primary">Your Events</h2>
              <p className="text-text-secondary text-sm">Capture and moderate shared memories.</p>
            </div>
            
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-grow sm:flex-grow-0">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search events..." 
                  className="input pl-8 w-full sm:w-56"
                />
              </div>
              <Link href="/create" className="btn btn-primary flex items-center gap-1.5 flex-shrink-0">
                 <Plus size={16} /> <span className="hidden sm:inline">Create Wall</span>
              </Link>
            </div>
          </div>

          {events.length === 0 ? (
            <div className="card p-12 text-center flex flex-col items-center">
               <div className="w-16 h-16 rounded-full bg-bg-subtle border border-border flex items-center justify-center text-text-muted mb-4">
                 <Layout size={24} />
               </div>
               <h3 className="text-lg font-semibold mb-2 text-text-primary">No active events yet</h3>
               <p className="text-text-secondary max-w-sm mb-6 text-sm">Create your first photo wall and start collecting cinematic memories instantly.</p>
               <Link href="/create" className="btn btn-primary">
                 Launch your first wall
               </Link>
            </div>
          ) : filteredEvents.length === 0 ? (
             <div className="card p-12 text-center text-text-muted text-sm">No events found matching "{searchQuery}"</div>
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-bg/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="card w-full max-w-md p-6 relative z-10 shadow-xl"
            >
              <div className="flex flex-col gap-4">
                <div>
                  <h3 className="text-lg font-bold text-text-primary">Delete Event</h3>
                  <p className="text-text-secondary text-sm mt-1">This action cannot be undone. All photos will be permanently erased.</p>
                </div>

                <div className="p-3 rounded-md bg-bg-subtle border border-border">
                  <p className="text-text-muted text-xs mb-1">Confirm deletion of:</p>
                  <p className="font-semibold text-text-primary text-sm">{deleteEvent.name}</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                    Type <span className="text-text-primary">{deleteEvent.name}</span> to confirm
                  </label>
                  <input
                    type="text"
                    value={deleteText}
                    onChange={(e) => setDeleteText(e.target.value)}
                    placeholder="Enter event name..."
                    className="input w-full"
                  />
                </div>

                <div className="flex gap-3 mt-2">
                  <button
                    onClick={() => setDeleteEvent(null)}
                    className="btn btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={executeDelete}
                    disabled={deleteText !== deleteEvent.name || isDeleting}
                    className="btn flex-1 bg-[#E00000] text-white border-[#E00000] hover:bg-[#C00000] disabled:opacity-50 disabled:cursor-not-allowed"
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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="card flex flex-col justify-between h-full p-5"
    >
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-start gap-3">
          <div className="min-w-0">
            <h3 className="text-base font-semibold truncate mb-1 text-text-primary">{event.name}</h3>
            <div className="flex items-center gap-2 text-xs text-text-secondary">
               <span>{dateStr}</span>
               <span className="w-1 h-1 rounded-full bg-border" />
               <span className="font-medium text-text-primary">{event.photo_count || 0} Photos</span>
            </div>
          </div>
          <Link href={`/dashboard/edit/${event.id}`} className="p-1.5 rounded-md text-text-muted hover:bg-bg-subtle hover:text-text-primary transition-colors flex-shrink-0">
            <Settings size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {[
            { href: `/wall/${event.slug}`, icon: <Layout size={14} />, label: 'Wall' },
            { href: `/mobile/${event.slug}`, icon: <Camera size={14} />, label: 'Scan' },
            { href: `/moderate/${event.slug}`, icon: <Shield size={14} />, label: 'Mod' },
            { href: `/dashboard/${event.id}/analytics`, icon: <BarChart2 size={14} />, label: 'Stats' },
          ].map((btn) => (
            <Link key={btn.label} href={btn.href} className="flex flex-col items-center justify-center gap-1.5 py-2 px-1 rounded-md bg-bg-subtle hover:bg-border transition-colors text-text-primary">
              <div>{btn.icon}</div>
              <span className="text-[10px] font-medium">{btn.label}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="flex gap-2 pt-4 mt-4 border-t border-border">
        <button
          onClick={() => onCopy(event.slug)}
          className="flex-1 flex items-center justify-between px-3 py-1.5 rounded-md bg-bg-subtle hover:bg-border transition-colors text-xs font-medium text-text-primary truncate"
        >
          <span className="truncate">{copied === event.slug ? 'Copied' : `memento.live/${event.slug}`}</span>
          <Copy size={copied === event.slug ? 0 : 12} className="flex-shrink-0 ml-2 text-text-muted" />
        </button>
        <button
          onClick={() => onDelete(event)}
          className="p-1.5 px-3 rounded-md text-text-muted hover:bg-bg-subtle hover:text-[#E00000] transition-colors flex-shrink-0 flex items-center justify-center"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </motion.div>
  );
}