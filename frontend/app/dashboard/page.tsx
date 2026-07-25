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
    <div className="min-h-screen bg-bg-subtle relative flex flex-col">
      <div className="grain" />
      <div className="orbs"><div className="orb orb-primary" /><div className="orb orb-secondary" /></div>
      
      {/* ── NAV ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-[64px] border-b border-border bg-bg/90 backdrop-blur-md flex items-center">
        <div className="container w-full flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <AnimatedLogo width={120} height={32} />
            </Link>
            <div className="h-4 w-px bg-border hidden md:block" />
            <span className="text-xs font-semibold text-text-secondary hidden md:block uppercase tracking-wider">Studio</span>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            {isSuperAdmin && (
              <Link href="/admin" className="hidden sm:flex items-center gap-2 px-3 py-1 rounded bg-bg-subtle border border-border text-xs font-medium text-text-primary hover:bg-border transition-colors">
                <Shield size={14} /> Admin
              </Link>
            )}
            <button
              onClick={() => supabase.auth.signOut().then(() => router.push('/'))}
              className="flex items-center gap-2 px-3 py-1 text-text-secondary hover:text-text-primary hover:bg-bg-subtle rounded transition-colors text-sm font-medium"
            >
              <LogOut size={14} /> <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </nav>

      {/* ── MAIN ── */}
      <main className="flex-grow pt-24 pb-20 container">
        
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

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="card flex items-center gap-4">
            <div className="w-10 h-10 rounded bg-bg-subtle border border-border flex items-center justify-center text-text-primary flex-shrink-0">
              <BarChart2 size={18} />
            </div>
            <div>
              <div className="text-xl font-bold leading-none mb-1 text-text-primary">{events.length}</div>
              <div className="text-xs font-medium text-text-secondary">Active Events</div>
            </div>
          </div>

          <div className="card flex items-center gap-4">
            <div className="w-10 h-10 rounded bg-bg-subtle border border-border flex items-center justify-center text-text-primary flex-shrink-0">
              <ImageIcon size={18} />
            </div>
            <div>
              <div className="text-xl font-bold leading-none mb-1 text-text-primary">{totalPhotos}</div>
              <div className="text-xs font-medium text-text-secondary">Photos Collected</div>
            </div>
          </div>

          {/* Plan Card */}
          <div className="card flex flex-col justify-between p-5">
             <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2 text-text-primary">
                   {planInfo.icon}
                   <span className="text-sm font-semibold">{planInfo.name}</span>
                </div>
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-success/10 text-success">Active</span>
             </div>
             
             <div className="flex flex-col gap-2 mb-4">
               {planInfo.features.slice(0, 2).map((f, i) => (
                 <div key={i} className="flex items-center gap-2 text-xs text-text-secondary">
                   <CheckCircle size={12} className="text-text-muted" />
                   {f}
                 </div>
               ))}
             </div>

             {currentPlan !== 'whitelabel' && (
               <Link href="/#pricing" className="text-xs font-semibold text-text-primary hover:underline flex items-center gap-1 w-max">
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
            <div className="card p-12 text-center flex flex-col items-center">
               <div className="w-12 h-12 rounded-full bg-bg-subtle border border-border flex items-center justify-center text-text-muted mb-4">
                 <Layout size={20} />
               </div>
               <h3 className="text-base font-semibold mb-2 text-text-primary">No active events yet</h3>
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
      transition={{ duration: 0.2, delay: index * 0.05 }}
      className="card-interactive flex flex-col justify-between h-full p-5"
    >
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-start gap-3">
          <div className="min-w-0">
            <h3 className="text-sm font-semibold truncate mb-1 text-text-primary">{event.name}</h3>
            <div className="flex items-center gap-2 text-xs text-text-secondary">
               <span>{dateStr}</span>
               <span className="w-1 h-1 rounded-full bg-border" />
               <span className="font-medium text-text-primary">{event.photo_count || 0} Photos</span>
            </div>
          </div>
          <Link href={`/dashboard/edit/${event.id}`} className="p-1.5 rounded text-text-muted hover:bg-bg-subtle hover:text-text-primary transition-colors flex-shrink-0" title="Edit settings">
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
            <Link key={btn.label} href={btn.href} className="flex flex-col items-center justify-center gap-1.5 py-2 px-1 rounded bg-bg-subtle hover:bg-border transition-colors text-text-primary border border-transparent hover:border-border">
              <div>{btn.icon}</div>
              <span className="text-[10px] font-medium">{btn.label}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="flex gap-2 pt-4 mt-4 border-t border-border">
        <button
          onClick={() => onCopy(event.slug)}
          className="flex-1 flex items-center justify-between px-3 py-1.5 rounded bg-bg-subtle hover:bg-border transition-colors text-xs font-medium text-text-primary truncate border border-transparent hover:border-border"
        >
          <span className="truncate">{copied === event.slug ? 'Copied' : `memento.live/${event.slug}`}</span>
          <Copy size={copied === event.slug ? 0 : 12} className="flex-shrink-0 ml-2 text-text-muted" />
        </button>
        <button
          onClick={() => onDelete(event)}
          className="p-1.5 px-3 rounded text-text-muted hover:bg-bg-subtle hover:text-error transition-colors flex-shrink-0 flex items-center justify-center border border-transparent hover:border-error/20 hover:bg-error/10"
          title="Delete event"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </motion.div>
  );
}