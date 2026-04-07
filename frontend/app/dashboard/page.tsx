"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Camera, Layout, Shield, Copy, ExternalLink, Trash2, Settings, Sparkles } from 'lucide-react';
import '../landing.css';

interface Profile {
  id: string;
  full_name: string;
  email: string;
  plan: string;
  payment_status: string;
  created_at: string;
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

const PLAN_INFO: Record<string, { name: string; emoji: string; color: string; features: string[] }> = {
  starter: {
    name: 'Starter',
    emoji: '🟢',
    color: '#22c55e',
    features: ['Up to 150 guests', 'Live photo wall', 'Unlimited uploads', 'Download as ZIP', '1 Month Storage'],
  },
  standard: {
    name: 'Standard',
    emoji: '🔵',
    color: '#3b82f6',
    features: ['Up to 300 guests', 'Auto album creation', 'Custom wall theme', 'Slideshow TV Mode', 'Live reactions', '3 Months Storage'],
  },
  premium: {
    name: 'Premium',
    emoji: '🟣',
    color: '#a855f7',
    features: ['Unlimited guests', 'Music slideshow', 'Expiring galleries', 'Priority support', 'Google Drive sync', '6 Months Storage'],
  },
  whitelabel: {
    name: 'White Label',
    emoji: '🟡',
    color: '#eab308',
    features: ['Full branding removal', 'Custom domain', 'Partner resell rights', 'Client management', 'Training & Priority Setup'],
  },
};

export default function DashboardPage() {
  const { user, profile, isApproved, isLoading } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState('');

  useEffect(() => {
    if (isLoading) return;
    if (!user) { router.push('/'); return; }
    if (!isApproved) { router.push('/pending'); return; }

    const fetchEvents = async () => {
      // Fetch events
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

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this event and all its photos?')) return;
    await supabase.from('events').delete().eq('id', id);
    setEvents((prev) => prev.filter((e) => e.id !== id));
  };

  const copyUrl = (slug: string) => {
    const url = `${window.location.origin}/upload/${slug}`;
    navigator.clipboard.writeText(url);
    setCopied(slug);
    setTimeout(() => setCopied(''), 2000);
  };

  if (isLoading || loading) {
    return (
      <div className="lp" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="orbs"><div className="orb orb1" /><div className="orb orb2" /><div className="orb orb3" /></div>
        <div style={{ width: 40, height: 40, border: '3px solid rgba(245,158,11,0.2)', borderTopColor: '#f59e0b', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Dashboard View for All Authenticated Users
  const currentPlan = profile?.plan || 'starter';
  const planInfo = PLAN_INFO[currentPlan] || PLAN_INFO.starter;

  return (
    <div className="lp min-h-screen pb-16 relative overflow-hidden">
      <div className="aurora-bg fixed inset-0 opacity-40 z-0" />
      <div className="grain fixed inset-0 z-1 opacity-[0.03] pointer-events-none" />

      <div className="max-w-[1100px] mx-auto px-6 pt-32 relative z-10">

        {/* Welcome + Plan Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">

          {/* Welcome */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="gcard cinematic-glow p-8 flex flex-col h-full"
          >
            <div className="gcard-border" />
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-6">
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
                  className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-rose-400 flex items-center justify-center text-white text-2xl font-bold shadow-lg"
                >
                  {(profile?.full_name || 'U').charAt(0).toUpperCase()}
                </motion.div>
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold text-slate-900">
                      Welcome, {(profile?.full_name || 'there').split(' ')[0]}!
                    </h1>
                    {profile?.role === 'admin' && (
                      <Link href="/admin" className="nm-badge !bg-amber-500/10 !text-amber-500 !border-amber-500/20 px-3 py-1 flex items-center gap-1 hover:!bg-amber-500/20 transition-all text-[10px] font-black tracking-widest">
                        <Shield size={10} /> ADMIN
                      </Link>
                    )}
                  </div>
                  <p className="text-sm text-slate-500">{profile?.email || user?.email}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-1 text-center py-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 group hover:bg-amber-500/20 transition-colors">
                  <span className="block text-2xl font-bold text-amber-500 group-hover:scale-110 transition-transform">{events.length}</span>
                  <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Events</span>
                </div>
                <div className="flex-1 text-center py-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 group hover:bg-rose-500/20 transition-colors">
                  <span className="block text-2xl font-bold text-rose-500 group-hover:scale-110 transition-transform">{events.reduce((sum, e) => sum + (e.photo_count || 0), 0)}</span>
                  <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Photos</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Plan Card */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
            className="gcard cinematic-glow p-8 flex flex-col h-full"
          >
            <div className="gcard-border" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Current Plan</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-2xl">{planInfo.emoji}</span>
                    <span className="text-xl font-bold" style={{ color: planInfo.color }}>{planInfo.name}</span>
                  </div>
                </div>
                <span className="px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 uppercase">
                  Active
                </span>
              </div>
              <div className="space-y-2 mb-6">
                {planInfo.features.slice(0, 4).map((f, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm text-slate-600">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: `${planInfo.color}15` }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={planInfo.color} strokeWidth="3"><path d="M20 6L9 17l-5-5" /></svg>
                    </div>
                    {f}
                  </div>
                ))}
              </div>
              {currentPlan !== 'whitelabel' && (
                <Link href="/#pricing" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border transition-all hover:scale-105" style={{ backgroundColor: `${planInfo.color}15`, color: planInfo.color, borderColor: `${planInfo.color}30`, fontWeight: 700, fontSize: '0.85rem' }}>
                  Upgrade Plan
                  <Sparkles size={14} />
                </Link>
              )}
            </div>
          </motion.div>
        </div>

        {/* Events Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Your Events</h2>
            <p className="text-sm text-slate-500">Manage your photo walls and sharing</p>
          </div>
          <Link href="/create" className="btn-hero-primary !py-3 !px-6 shadow-xl shadow-amber-500/20">
            <Plus size={18} /> Create Event
          </Link>
        </motion.div>

        {/* Events Grid */}
        {events.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="gcard p-20 text-center cinematic-glow"
          >
            <div className="gcard-border" />
            <div className="relative z-10">
              <span className="text-5xl block mb-6">🎈</span>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">No Events Yet</h3>
              <p className="text-slate-500 mb-8 max-w-sm mx-auto">Create your first photo wall and start collecting memories in cinematic quality!</p>
              <Link href="/create" className="btn-hero-primary">
                <Plus size={20} /> Create Your First Wall
              </Link>
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {events.map((event, i) => (
                <motion.div 
                  key={event.id}
                  layout
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  whileHover={{ y: -8 }}
                  className="gcard p-6 cinematic-glow group flex flex-col h-full"
                >
                  <div className="gcard-border" />
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h3 className="text-lg font-bold text-slate-800 group-hover:gradient-text-vibrant transition-all">{event.name}</h3>
                        <div className="flex items-center gap-3 text-[11px] font-bold text-slate-400 mt-1">
                          <span className="uppercase">{new Date(event.created_at).toLocaleDateString()}</span>
                          <span>•</span>
                          <span className="text-amber-500">📸 {event.photo_count || 0} PHOTOS</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleDelete(event.id)} 
                        className="w-10 h-10 rounded-xl border border-slate-200 bg-white/50 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:border-rose-200 hover:bg-rose-50 transition-all opacity-0 group-hover:opacity-100 shadow-sm"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2 mb-6">
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-1">
                        <Link href={`/wall/${event.slug}`} className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 text-xs font-bold hover:bg-amber-500/20 hover:shadow-lg hover:shadow-amber-500/20 transition-all group/btn">
                          <Layout size={14} className="transition-transform duration-300 group-hover/btn:scale-125 group-hover/btn:rotate-6" /> Wall
                        </Link>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-1">
                        <Link href={`/upload/${event.slug}`} className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs font-bold hover:bg-rose-500/20 hover:shadow-lg hover:shadow-rose-500/20 transition-all group/btn">
                          <Camera size={14} className="transition-transform duration-300 group-hover/btn:scale-125 group-hover/btn:-rotate-6" /> Upload
                        </Link>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-1">
                        <Link href={`/moderate/${event.slug}`} className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-600 text-xs font-bold hover:bg-violet-500/20 hover:shadow-lg hover:shadow-violet-500/20 transition-all group/btn">
                          <Shield size={14} className="transition-transform duration-300 group-hover/btn:scale-125 group-hover/btn:rotate-6" /> Mod
                        </Link>
                      </motion.div>
                    </div>

                    {/* Copy link */}
                    <button 
                      onClick={() => copyUrl(event.slug)} 
                      className="w-full flex items-center justify-between p-3 rounded-xl bg-amber-500/5 border border-amber-500/10 transition-all hover:bg-amber-500/10 text-xs text-slate-600 group/btn"
                    >
                      <span className="truncate pr-4">
                        {typeof window !== 'undefined' ? `${window.location.origin}/upload/${event.slug}` : `/upload/${event.slug}`}
                      </span>
                      <span className={`shrink-0 ${copied === event.slug ? 'text-emerald-500' : 'text-slate-400 opacity-0 group-hover/btn:opacity-100 transition-all'}`}>
                        {copied === event.slug ? '✓ Copied' : <Copy size={14} />}
                      </span>
                    </button>
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
