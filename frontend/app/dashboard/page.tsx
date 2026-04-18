"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Camera, Layout, Shield, Copy, Trash2, Sparkles, BarChart2, Image as ImageIcon, LogOut, Settings } from 'lucide-react';
import '../landing.css';

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

  return (
    <div className="lp min-h-screen relative overflow-hidden">
      {/* Background layers */}
      <div className="orbs"><div className="orb orb1" /><div className="orb orb2" /><div className="orb orb3" /></div>
      <div className="grain" />

      {/* ── NAV ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 500,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 var(--space-container)', height: 'clamp(64px, 10vh, 80px)',
        background: 'rgba(10,10,11,0.72)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #06b6d4, #ec4899)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1rem', boxShadow: '0 0 16px rgba(6,182,212,0.4)',
          }}>📸</div>
          <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#F8FAFC', letterSpacing: '-0.02em' }}>memento</span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {profile?.role === 'admin' && (
            <Link href="/admin" style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '0.4rem 1rem', borderRadius: 100, minHeight: 40,
              background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)',
              color: '#f59e0b', fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.12em', textDecoration: 'none',
            }}>
              <Shield size={12} /> ADMIN
            </Link>
          )}
          <button
            onClick={() => supabase.auth.signOut().then(() => router.push('/'))}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '0.5rem 1.25rem', borderRadius: 100, minHeight: 40,
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
              color: '#94A3B8', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
            className="hover:bg-white/10 hover:text-white"
          >
            <LogOut size={14} /> <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </nav>

      {/* ── MAIN ── */}
      <div style={{ maxWidth: 1240, margin: '0 auto', padding: 'clamp(5rem, 12vh, 8rem) var(--space-container) 80px', position: 'relative', zIndex: 10 }}>

        {/* ── HERO ROW ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          style={{ marginBottom: '2.5rem' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
            <div style={{
              width: 52, height: 52, borderRadius: '50%',
              background: 'linear-gradient(135deg, #06b6d4, #ec4899)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.4rem', fontWeight: 800, color: '#fff',
              boxShadow: '0 0 24px rgba(6,182,212,0.3)',
              flexShrink: 0,
            }}>{initial}</div>
            <div>
              <h1 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 900, color: '#F8FAFC', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
                Welcome back, <span className="gradient-text">{firstName}</span>
              </h1>
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: 4 }}>{profile?.email || user?.email}</p>
            </div>
          </div>
        </motion.div>

        {/* ── STAT + PLAN GRID ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>

          {/* Stat: Events */}
          <StatCard icon={<BarChart2 size={18} />} value={events.length} label="Total Events" color="#06b6d4" delay={0} />

          {/* Stat: Photos */}
          <StatCard icon={<ImageIcon size={18} />} value={totalPhotos} label="Photos Collected" color="#ec4899" delay={0.08} />

          {/* Plan Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.16 }}
            className="gcard" style={{ padding: '1.5rem', position: 'relative' }}
          >
            <div className="gcard-border" />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                <div>
                  <span style={{ fontSize: '0.6rem', fontWeight: 800, letterSpacing: '0.14em', color: '#64748b', textTransform: 'uppercase' }}>Current Plan</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                    <span style={{ fontSize: '1.3rem' }}>{planInfo.icon}</span>
                    <span style={{ fontSize: '1.1rem', fontWeight: 800, color: planInfo.color }}>{planInfo.name}</span>
                  </div>
                </div>
                <span style={{
                  padding: '0.3rem 0.85rem', borderRadius: 100, fontSize: '0.6rem', fontWeight: 800,
                  letterSpacing: '0.12em', textTransform: 'uppercase',
                  background: 'rgba(34,197,94,0.1)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.2)',
                }}>Active</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: '1rem' }}>
                {planInfo.features.slice(0, 3).map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem', color: '#94A3B8' }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={planInfo.color} strokeWidth="3"><path d="M20 6L9 17l-5-5" /></svg>
                    {f}
                  </div>
                ))}
              </div>
              {currentPlan !== 'whitelabel' && (
                <Link href="/#pricing" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '0.45rem 1rem', borderRadius: 100,
                  background: planInfo.glow, color: planInfo.color,
                  border: `1px solid ${planInfo.color}30`,
                  fontSize: '0.72rem', fontWeight: 700, textDecoration: 'none',
                  transition: 'all 0.2s',
                }}>
                  Upgrade Plan <Sparkles size={11} />
                </Link>
              )}
            </div>
          </motion.div>
        </div>

        {/* ── EVENTS HEADER ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.28 }}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}
        >
          <div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#F8FAFC', letterSpacing: '-0.03em' }}>Your Events</h2>
            <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 4 }}>Manage your photo walls and galleries.</p>
          </div>
          <Link href="/create" className="btn-hero-primary" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0.7rem 1.5rem', fontSize: '0.85rem' }}>
            <Plus size={16} /> Create Event
          </Link>
        </motion.div>

        {/* ── EVENTS GRID ── */}
        {events.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.35 }}
            className="gcard"
            style={{ padding: '5rem 2rem', textAlign: 'center' }}
          >
            <div className="gcard-border" />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ fontSize: '3.5rem', marginBottom: '1.25rem' }}>🎈</div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#F8FAFC', marginBottom: '0.75rem' }}>No Events Yet</h3>
              <p style={{ color: '#64748b', fontSize: '0.9rem', maxWidth: 380, margin: '0 auto 2rem' }}>
                Create your first photo wall and start collecting memories in cinematic quality!
              </p>
              <Link href="/create" className="btn-hero-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <Plus size={18} /> Create Your First Wall
              </Link>
            </div>
          </motion.div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
            <AnimatePresence mode="popLayout">
              {events.map((event, i) => (
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
      </div>

      {/* ── DELETE MODAL ── */}
      <AnimatePresence>
        {deleteEvent && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 9999,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '1rem',
              background: 'rgba(0,0,0,0.7)',
              backdropFilter: 'blur(16px)',
            }}
            onClick={(e) => e.target === e.currentTarget && setDeleteEvent(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.93, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.93, y: 20 }}
              transition={{ type: 'spring', stiffness: 280, damping: 24 }}
              style={{
                background: 'rgba(12,12,16,0.95)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 28, padding: '2.25rem',
                maxWidth: 440, width: '100%',
                position: 'relative',
                boxShadow: '0 40px 80px rgba(0,0,0,0.8)',
              }}
            >
              {/* top accent bar */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, #ef4444, #f97316)' }} />

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{
                  width: 48, height: 48, borderRadius: '50%',
                  background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <Trash2 size={20} color="#ef4444" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#F8FAFC' }}>Delete Event</h3>
                  <p style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: 600 }}>This action cannot be undone.</p>
                </div>
              </div>

              <div style={{
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 16, padding: '1rem 1.25rem', marginBottom: '1.5rem',
              }}>
                <p style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: 6 }}>You are about to permanently delete:</p>
                <p style={{ fontWeight: 800, color: '#F8FAFC', fontSize: '0.95rem' }}>{deleteEvent.name}</p>
                <p style={{ fontSize: '0.72rem', color: '#475569', marginTop: 4 }}>{deleteEvent.photo_count || 0} photos will be erased</p>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#475569', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Type <span style={{ color: '#F8FAFC', fontWeight: 900 }}>{deleteEvent.name}</span> to confirm
                </label>
                <input
                  type="text"
                  value={deleteText}
                  onChange={(e) => setDeleteText(e.target.value)}
                  placeholder="Event name…"
                  style={{
                    width: '100%', padding: '0.75rem 1rem',
                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 14, color: '#F8FAFC', fontSize: '0.875rem',
                    outline: 'none', transition: 'border-color 0.2s',
                    fontFamily: 'inherit',
                  }}
                  onFocus={e => (e.target.style.borderColor = 'rgba(239,68,68,0.5)')}
                  onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  onClick={() => setDeleteEvent(null)}
                  style={{
                    flex: 1, padding: '0.75rem', borderRadius: 14, fontWeight: 700,
                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                    color: '#94A3B8', cursor: 'pointer', fontSize: '0.875rem', transition: 'all 0.2s',
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={executeDelete}
                  disabled={deleteText !== deleteEvent.name || isDeleting}
                  style={{
                    flex: 1, padding: '0.75rem', borderRadius: 14, fontWeight: 800,
                    background: deleteText === deleteEvent.name ? '#ef4444' : 'rgba(239,68,68,0.15)',
                    border: '1px solid rgba(239,68,68,0.3)',
                    color: deleteText === deleteEvent.name ? '#fff' : '#ef4444',
                    cursor: deleteText === deleteEvent.name ? 'pointer' : 'not-allowed',
                    fontSize: '0.875rem', transition: 'all 0.2s',
                    opacity: isDeleting ? 0.7 : 1,
                  }}
                >
                  {isDeleting ? 'Deleting…' : 'Delete Forever'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── STAT CARD ── */
function StatCard({ icon, value, label, color, delay }: { icon: React.ReactNode; value: number; label: string; color: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ y: -4, scale: 1.02 }}
      className="gcard cinematic-glow"
      style={{ padding: 'var(--space-md)', position: 'relative' }}
    >
      <div className="gcard-border" />
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
        <div style={{
          width: 56, height: 56, borderRadius: 18,
          background: `rgba(${color === '#06b6d4' ? '6,182,212' : '236,72,153'},0.1)`,
          border: `1px solid ${color}25`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color, flexShrink: 0,
        }}>{icon}</div>
        <div>
          <div style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 900, color: '#F8FAFC', lineHeight: 1, letterSpacing: '-0.04em' }}>{value}</div>
          <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700, marginTop: 6, textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</div>
        </div>
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
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5, delay: index * 0.07 }}
      whileHover={{ y: -8, scale: 1.01 }}
      className="gcard cinematic-glow"
      style={{ padding: 'var(--space-md)', position: 'relative', display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', height: '100%' }}
    >
      <div className="gcard-border" />
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', height: '100%' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ flex: 1, minWidth: 0, paddingRight: '0.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#F8FAFC', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', letterSpacing: '-0.02em' }}>
              {event.name}
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6, flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{dateStr}</span>
              <span style={{ color: '#1e293b', fontSize: '0.65rem' }}>•</span>
              <span style={{
                fontSize: '0.68rem', fontWeight: 800, color: '#06b6d4',
                background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.2)',
                padding: '0.2rem 0.6rem', borderRadius: 100,
              }}>
                📸 {event.photo_count || 0} photos
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
            <Link href={`/dashboard/edit/${event.id}`} style={{
              width: 44, height: 44, borderRadius: 14,
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#94a3b8', transition: 'all 0.2s', cursor: 'pointer',
            }} className="hover:bg-white/10 hover:text-white">
              <Settings size={18} />
            </Link>
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
          {[
            { href: `/wall/${event.slug}`, icon: <Layout size={16} />, label: 'Wall', color: '#06b6d4', bg: 'rgba(6,182,212,0.1)', border: 'rgba(6,182,212,0.2)' },
            { href: `/mobile/${event.slug}`, icon: <Camera size={16} />, label: 'Scan', color: '#ec4899', bg: 'rgba(236,72,153,0.1)', border: 'rgba(236,72,153,0.2)' },
            { href: `/moderate/${event.slug}`, icon: <Shield size={16} />, label: 'Mod', color: '#6366f1', bg: 'rgba(99,102,241,0.1)', border: 'rgba(99,102,241,0.2)' },
          ].map(({ href, icon, label, color, bg, border }) => (
            <Link key={label} href={href} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6,
              padding: '0.75rem 0.25rem', borderRadius: 16, minHeight: 64,
              background: bg, border: `1px solid ${border}`,
              color, fontSize: '0.72rem', fontWeight: 800,
              textDecoration: 'none', transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            }} className="hover:scale-[1.03] active:scale-95">
              {icon} <span style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
            </Link>
          ))}
        </div>

        {/* Link & Delete UI */}
        <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
           <button
             onClick={() => onCopy(event.slug)}
             style={{
               flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
               padding: '0 1rem', borderRadius: 16, minHeight: 48,
               background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
               cursor: 'pointer', transition: 'all 0.2s',
             }}
             className="hover:bg-white/5"
           >
             <span style={{ fontSize: '0.75rem', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '80%', textAlign: 'left', fontWeight: 600 }}>
               {copied === event.slug ? '✓ Successfully Copied' : 'memento.live/' + event.slug}
             </span>
             <Copy size={copied === event.slug ? 0 : 14} color="#64748b" />
           </button>
           
           <button
             onClick={() => onDelete(event)}
             style={{
               width: 48, height: 48, borderRadius: 16,
               background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)',
               display: 'flex', alignItems: 'center', justifyContent: 'center',
               color: '#ef4444', cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0
             }}
             className="hover:bg-red-500/10"
           >
             <Trash2 size={18} />
           </button>
        </div>
      </div>
    </motion.div>
  );
}