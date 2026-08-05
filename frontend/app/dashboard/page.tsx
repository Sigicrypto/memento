"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Camera, Layout, Shield, Copy, Trash2, Sparkles,
  BarChart2, Image as ImageIcon, Settings, ArrowRight,
  Search, CheckCircle, Zap, Star, Heart, Grid, List,
  ExternalLink, LogOut, Lock, Unlock
} from 'lucide-react';
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
  is_closed?: boolean;
  expires_at?: string | null;
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

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

  const toggleEventClosed = async (targetEvent: Event) => {
    const nextClosed = !targetEvent.is_closed;
    setEvents(prev => prev.map(e => e.id === targetEvent.id ? { ...e, is_closed: nextClosed } : e));
    await supabase.from('events').update({ is_closed: nextClosed }).eq('id', targetEvent.id);
  };

  if (isLoading || loading) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="w-10 h-10 border-2 border-border border-t-accent-cyan rounded-full animate-spin" />
      </div>
    );
  }

  const isEventClosedOrExpired = (e: Event) => {
    if (e.is_closed) return true;
    if (e.expires_at && new Date(e.expires_at) < new Date()) return true;
    return false;
  };

  const currentPlan = profile?.plan || 'starter';
  const planInfo = PLAN_INFO[currentPlan] || PLAN_INFO.starter;
  const totalPhotos = events.reduce((sum, e) => sum + (e.photo_count || 0), 0);
  const activeEventsCount = events.filter(e => !isEventClosedOrExpired(e)).length;
  const closedEventsCount = events.filter(e => isEventClosedOrExpired(e)).length;
  const firstName = (profile?.full_name || 'there').split(' ')[0];
  const initial = (profile?.full_name || 'U').charAt(0).toUpperCase();
  const filteredEvents = events.filter(e => e.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <>
      {/* ── TOP NAV BAR ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '40px',
          paddingBottom: '20px',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <Link href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
          <AnimatedLogo width={140} height={36} />
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <ThemeToggle />
          <button
            onClick={handleLogout}
            title="Log Out"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '10px',
              borderRadius: '12px',
              border: '1px solid var(--border)',
              background: 'var(--surface)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = 'var(--error)';
              e.currentTarget.style.borderColor = 'var(--error)';
              e.currentTarget.style.background = 'color-mix(in srgb, var(--error) 8%, transparent)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = 'var(--text-secondary)';
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.background = 'var(--surface)';
            }}
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>

      {/* ── WELCOME HEADER ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '24px',
          marginBottom: '40px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {/* Avatar */}
          <div style={{ position: 'relative' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #a855f7, #ec4899, var(--accent-cyan))',
                padding: '2px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  background: 'var(--bg)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  fontWeight: 900,
                  color: 'var(--text-primary)',
                }}
              >
                {initial}
              </div>
            </div>
            <span
              style={{
                position: 'absolute',
                bottom: '0',
                right: '0',
                width: '14px',
                height: '14px',
                background: 'var(--success)',
                border: '2px solid var(--bg)',
                borderRadius: '50%',
              }}
            />
          </div>

          <div>
            <h1
              style={{
                fontSize: 'clamp(1.25rem, 3vw, 1.75rem)',
                fontWeight: 800,
                lineHeight: 1.2,
                color: 'var(--text-primary)',
                letterSpacing: '-0.02em',
              }}
            >
              Welcome back, {firstName}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                {profile?.email || user?.email}
              </span>
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  padding: '2px 10px',
                  borderRadius: '999px',
                  background: 'color-mix(in srgb, var(--accent-cyan) 12%, transparent)',
                  border: '1px solid color-mix(in srgb, var(--accent-cyan) 25%, transparent)',
                  color: 'var(--accent-cyan)',
                  letterSpacing: '0.05em',
                }}
              >
                {planInfo.name} Plan
              </span>
              {isSuperAdmin && (
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background: 'rgba(168, 85, 247, 0.15)',
                    color: '#c084fc',
                    border: '1px solid rgba(168, 85, 247, 0.3)',
                  }}
                >
                  Super Admin
                </span>
              )}
            </div>
          </div>
        </div>

        <Link
          href="/create"
          className="btn btn-primary"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 24px',
            fontSize: '14px',
            fontWeight: 700,
            borderRadius: '14px',
            whiteSpace: 'nowrap',
          }}
        >
          <Plus size={18} />
          <span>Create New Wall</span>
        </Link>
      </motion.div>

      {/* ── KPI STATS ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px',
          marginBottom: '48px',
        }}
      >
        {/* Active Photo Walls */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{
            padding: '28px',
            borderRadius: '20px',
            border: '1px solid var(--border)',
            background: 'var(--surface)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-secondary)' }}>
              Active Photo Walls
            </span>
            <div style={{ padding: '10px', borderRadius: '12px', background: 'rgba(168, 85, 247, 0.1)', border: '1px solid rgba(168, 85, 247, 0.2)', color: '#a855f7' }}>
              <Layout size={18} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '8px' }}>
            <span style={{ fontSize: '40px', fontWeight: 900, letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>{activeEventsCount}</span>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              active ({closedEventsCount} closed)
            </span>
          </div>
          <div style={{ marginTop: '16px', height: '40px', display: 'flex', alignItems: 'flex-end', gap: '4px', opacity: 0.7 }}>
            {[35, 45, 30, 65, 80, 55, 90, 75, 100].map((h, i) => (
              <div key={i} style={{ flex: 1, height: `${h}%`, background: 'linear-gradient(to top, #a855f7, #22d3ee)', borderRadius: '3px 3px 0 0' }} />
            ))}
          </div>
        </motion.div>

        {/* Total Photos */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            padding: '28px',
            borderRadius: '20px',
            border: '1px solid var(--border)',
            background: 'var(--surface)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-secondary)' }}>
              Total Photos Collected
            </span>
            <div style={{ padding: '10px', borderRadius: '12px', background: 'color-mix(in srgb, var(--accent-cyan) 12%, transparent)', border: '1px solid color-mix(in srgb, var(--accent-cyan) 25%, transparent)', color: 'var(--accent-cyan)' }}>
              <ImageIcon size={18} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '8px' }}>
            <span style={{ fontSize: '40px', fontWeight: 900, letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>{totalPhotos}</span>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                padding: '3px 10px',
                borderRadius: '999px',
                background: 'color-mix(in srgb, var(--success) 12%, transparent)',
                border: '1px solid color-mix(in srgb, var(--success) 25%, transparent)',
                color: 'var(--success)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Sparkles size={10} /> Live Synced
            </span>
          </div>
          <div style={{ marginTop: '16px', height: '40px' }}>
            <svg viewBox="0 0 100 30" style={{ width: '100%', height: '100%', overflow: 'visible', opacity: 0.7 }}>
              <defs>
                <linearGradient id="photoGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--accent-cyan)" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="var(--accent-cyan)" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d="M0,30 L0,22 L15,25 L30,12 L45,18 L60,8 L75,15 L90,5 L100,10 L100,30 Z" fill="url(#photoGrad)" />
              <path d="M0,22 L15,25 L30,12 L45,18 L60,8 L75,15 L90,5 L100,10" fill="none" stroke="var(--accent-cyan)" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </motion.div>

        {/* Plan Tier */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{
            padding: '28px',
            borderRadius: '20px',
            border: '1px solid var(--border)',
            background: 'var(--surface)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-primary)' }}>
              <div style={{ padding: '8px', borderRadius: '10px', background: 'color-mix(in srgb, var(--accent-cyan) 12%, transparent)', border: '1px solid color-mix(in srgb, var(--accent-cyan) 25%, transparent)', color: 'var(--accent-cyan)' }}>
                {planInfo.icon}
              </div>
              <span style={{ fontSize: '16px', fontWeight: 700 }}>{planInfo.name} Tier</span>
            </div>
            <span
              style={{
                fontSize: '10px',
                fontWeight: 900,
                textTransform: 'uppercase',
                padding: '3px 10px',
                borderRadius: '999px',
                background: 'color-mix(in srgb, var(--success) 15%, transparent)',
                color: 'var(--success)',
                border: '1px solid color-mix(in srgb, var(--success) 30%, transparent)',
                letterSpacing: '0.1em',
              }}
            >
              Active
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', margin: '8px 0' }}>
            {planInfo.features.slice(0, 3).map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                <CheckCircle size={14} style={{ color: 'var(--accent-cyan)', flexShrink: 0 }} />
                <span>{f}</span>
              </div>
            ))}
          </div>
          {currentPlan !== 'whitelabel' && (
            <Link
              href="/#pricing"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '13px',
                fontWeight: 700,
                color: 'var(--accent-cyan)',
                marginTop: '16px',
                textDecoration: 'none',
              }}
            >
              <span>Upgrade Plan</span> <ArrowRight size={13} />
            </Link>
          )}
        </motion.div>
      </div>

      {/* ── EVENTS SECTION ── */}
      <section>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '28px',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
                Your Events
              </h2>
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  padding: '2px 12px',
                  borderRadius: '999px',
                  background: 'var(--border)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-hover)',
                }}
              >
                {filteredEvents.length}
              </span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Manage and monitor all your interactive photo walls.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {/* Search */}
            <div style={{ position: 'relative' }}>
              <Search size={15} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search events..."
                className="input"
                style={{
                  paddingLeft: '38px',
                  paddingRight: '16px',
                  paddingTop: '10px',
                  paddingBottom: '10px',
                  fontSize: '13px',
                  width: '240px',
                  borderRadius: '12px',
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                }}
              />
            </div>

            {/* View Toggle */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '4px',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
              }}
            >
              <button
                onClick={() => setViewMode('grid')}
                style={{
                  padding: '8px',
                  borderRadius: '8px',
                  border: viewMode === 'grid' ? '1px solid color-mix(in srgb, var(--accent-cyan) 30%, transparent)' : '1px solid transparent',
                  background: viewMode === 'grid' ? 'color-mix(in srgb, var(--accent-cyan) 15%, transparent)' : 'transparent',
                  color: viewMode === 'grid' ? 'var(--accent-cyan)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                }}
                title="Grid View"
              >
                <Grid size={16} />
              </button>
              <button
                onClick={() => setViewMode('table')}
                style={{
                  padding: '8px',
                  borderRadius: '8px',
                  border: viewMode === 'table' ? '1px solid color-mix(in srgb, var(--accent-cyan) 30%, transparent)' : '1px solid transparent',
                  background: viewMode === 'table' ? 'color-mix(in srgb, var(--accent-cyan) 15%, transparent)' : 'transparent',
                  color: viewMode === 'table' ? 'var(--accent-cyan)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                }}
                title="Table View"
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Events Content */}
        {events.length === 0 ? (
          <div
            style={{
              padding: '64px 32px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              border: '2px dashed var(--border)',
              background: 'var(--surface)',
              borderRadius: '24px',
            }}
          >
            <div style={{ width: '192px', height: '192px', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.9 }}>
              {emptyLottieData ? (
                <Lottie animationData={emptyLottieData} loop autoplay />
              ) : (
                <Camera size={48} style={{ color: 'var(--text-muted)', opacity: 0.5 }} />
              )}
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '12px', color: 'var(--text-primary)' }}>
              No active photo walls yet
            </h3>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', marginBottom: '32px', fontSize: '15px' }}>
              Create your first photo wall in seconds and start collecting guest memories instantly.
            </p>
            <Link href="/create" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '14px 32px' }}>
              <Plus size={18} /> <span>Launch your first wall</span>
            </Link>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div
            style={{
              padding: '64px 32px',
              textAlign: 'center',
              color: 'var(--text-muted)',
              fontSize: '15px',
              border: '2px dashed var(--border)',
              borderRadius: '24px',
              background: 'var(--surface)',
            }}
          >
            No events found matching &quot;{searchQuery}&quot;
          </div>
        ) : viewMode === 'grid' ? (
          /* ── GRID VIEW ── */
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '24px',
            }}
          >
            <AnimatePresence mode="popLayout">
              {filteredEvents.map((event, i) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.05 }}
                  style={{
                    padding: '28px',
                    borderRadius: '20px',
                    border: '1px solid var(--border)',
                    background: 'var(--surface)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                        <span
                          style={{
                            fontSize: '10px',
                            fontWeight: 900,
                            textTransform: 'uppercase',
                            letterSpacing: '0.06em',
                            padding: '4px 12px',
                            borderRadius: '999px',
                            background: 'color-mix(in srgb, var(--accent-cyan) 12%, transparent)',
                            border: '1px solid color-mix(in srgb, var(--accent-cyan) 25%, transparent)',
                            color: 'var(--accent-cyan)',
                          }}
                        >
                          {event.photo_count || 0} Photos
                        </span>
                        <span
                          style={{
                            fontSize: '10px',
                            fontWeight: 800,
                            textTransform: 'uppercase',
                            padding: '4px 10px',
                            borderRadius: '999px',
                            background: isEventClosedOrExpired(event) ? 'rgba(245, 158, 11, 0.15)' : 'color-mix(in srgb, var(--success) 12%, transparent)',
                            border: isEventClosedOrExpired(event) ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid color-mix(in srgb, var(--success) 25%, transparent)',
                            color: isEventClosedOrExpired(event) ? '#f59e0b' : 'var(--success)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          {isEventClosedOrExpired(event) ? <Lock size={10} /> : <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }} />}
                          {isEventClosedOrExpired(event) ? 'View-Only' : 'Active'}
                        </span>
                      </div>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }} suppressHydrationWarning>
                        {new Date(event.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
                      <Link href={`/wall/${event.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                        {event.name}
                      </Link>
                    </h3>
                  </div>

                  <div
                    style={{
                      paddingTop: '20px',
                      borderTop: '1px solid var(--border)',
                      marginTop: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '8px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <button
                        onClick={() => toggleEventClosed(event)}
                        className="p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-bg-subtle transition-colors"
                        title={isEventClosedOrExpired(event) ? "Reopen Uploads" : "Close Event (Make View-Only)"}
                      >
                        {isEventClosedOrExpired(event) ? <Unlock size={16} className="text-amber-500" /> : <Lock size={16} />}
                      </button>
                      <button
                        onClick={() => copyUrl(event.slug)}
                        className="p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-bg-subtle transition-colors"
                        title="Copy Upload Link"
                      >
                        {copied === event.slug ? <CheckCircle size={16} className="text-success" /> : <Copy size={16} />}
                      </button>
                      <Link
                        href={`/dashboard/${event.id}/analytics`}
                        className="p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-bg-subtle transition-colors"
                        title="Analytics"
                      >
                        <BarChart2 size={16} />
                      </Link>
                      <button
                        onClick={() => setEditingEventId(event.id)}
                        className="p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-bg-subtle transition-colors"
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
                      style={{
                        fontSize: '12px',
                        fontWeight: 700,
                        color: 'var(--accent-cyan)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        textDecoration: 'none',
                      }}
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
          <div style={{ borderRadius: '20px', border: '1px solid var(--border)', background: 'var(--surface)', overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto', width: '100%' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-subtle)' }}>
                    <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Event Name</th>
                    <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Status</th>
                    <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Created</th>
                    <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Photos</th>
                    <th style={{ padding: '16px 24px', textAlign: 'right', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence mode="popLayout">
                    {filteredEvents.map((event, i) => (
                      <motion.tr
                        key={event.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ delay: i * 0.05 }}
                        className="hover:bg-bg-subtle transition-colors"
                      >
                        <td style={{ padding: '20px 24px', fontWeight: 600, fontSize: '15px' }}>
                          <Link href={`/wall/${event.slug}`} style={{ textDecoration: 'none', color: 'var(--text-primary)' }}>{event.name}</Link>
                        </td>
                        <td style={{ padding: '16px 24px' }}>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '3px 10px',
                              borderRadius: '999px',
                              fontSize: '11px',
                              fontWeight: 800,
                              textTransform: 'uppercase',
                              background: isEventClosedOrExpired(event) ? 'rgba(245, 158, 11, 0.15)' : 'color-mix(in srgb, var(--success) 12%, transparent)',
                              border: isEventClosedOrExpired(event) ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid color-mix(in srgb, var(--success) 25%, transparent)',
                              color: isEventClosedOrExpired(event) ? '#f59e0b' : 'var(--success)',
                            }}
                          >
                            {isEventClosedOrExpired(event) ? <Lock size={10} /> : <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }} />}
                            {isEventClosedOrExpired(event) ? 'Closed (View-Only)' : 'Active'}
                          </span>
                        </td>
                        <td style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontSize: '14px' }} suppressHydrationWarning>
                          {new Date(event.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td style={{ padding: '16px 24px' }}>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: '4px 14px',
                              borderRadius: '999px',
                              fontSize: '12px',
                              fontWeight: 700,
                              background: 'color-mix(in srgb, var(--accent-cyan) 10%, transparent)',
                              border: '1px solid color-mix(in srgb, var(--accent-cyan) 20%, transparent)',
                              color: 'var(--accent-cyan)',
                            }}
                          >
                            {event.photo_count || 0}
                          </span>
                        </td>
                        <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                            <button
                              onClick={() => toggleEventClosed(event)}
                              className="p-2 text-text-muted hover:text-text-primary hover:bg-bg-subtle rounded-lg transition-colors"
                              title={isEventClosedOrExpired(event) ? "Reopen Uploads" : "Close Event (Make View-Only)"}
                            >
                              {isEventClosedOrExpired(event) ? <Unlock size={15} className="text-amber-500" /> : <Lock size={15} />}
                            </button>
                            <button onClick={() => copyUrl(event.slug)} className="p-2 text-text-muted hover:text-text-primary hover:bg-bg-subtle rounded-lg transition-colors" title="Copy Link">
                              {copied === event.slug ? <CheckCircle size={15} className="text-success" /> : <Copy size={15} />}
                            </button>
                            <Link href={`/dashboard/${event.id}/analytics`} className="p-2 text-text-muted hover:text-text-primary hover:bg-bg-subtle rounded-lg transition-colors" title="Analytics">
                              <BarChart2 size={15} />
                            </Link>
                            <button onClick={() => setEditingEventId(event.id)} className="p-2 text-text-muted hover:text-text-primary hover:bg-bg-subtle rounded-lg transition-colors" title="Settings">
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

      {/* ── DELETE MODAL ── */}
      <AnimatePresence>
        {deleteEvent && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 50,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px',
              background: 'rgba(0,0,0,0.7)',
              backdropFilter: 'blur(8px)',
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={{
                width: '100%',
                maxWidth: '400px',
                padding: '28px',
                borderRadius: '24px',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>Delete Event</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '6px' }}>
                    This action cannot be undone. All collected photos will be permanently erased.
                  </p>
                </div>

                <div style={{ padding: '14px', borderRadius: '16px', background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '4px' }}>Confirm deletion of:</p>
                  <p style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '14px' }}>{deleteEvent.name}</p>
                </div>

                <div className="input-group">
                  <label className="label" style={{ fontSize: '12px' }}>
                    Type <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{deleteEvent.name}</span> to confirm
                  </label>
                  <input
                    type="text"
                    value={deleteText}
                    onChange={(e) => setDeleteText(e.target.value)}
                    placeholder="Enter event name"
                    className="input w-full"
                    style={{ borderRadius: '12px' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button onClick={() => setDeleteEvent(null)} className="btn btn-secondary" style={{ flex: 1, borderRadius: '12px' }}>
                    Cancel
                  </button>
                  <button
                    onClick={executeDelete}
                    disabled={deleteText !== deleteEvent.name || isDeleting}
                    className="btn"
                    style={{
                      flex: 1,
                      borderRadius: '12px',
                      background: 'var(--error)',
                      color: 'white',
                      border: '1px solid var(--error)',
                      opacity: deleteText !== deleteEvent.name || isDeleting ? 0.5 : 1,
                      cursor: deleteText !== deleteEvent.name || isDeleting ? 'not-allowed' : 'pointer',
                    }}
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
    </>
  );
}
