"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Camera, Layout, Shield, Copy, ExternalLink, Trash2, Settings } from 'lucide-react';
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
  const { user, profile, isPaid, isApproved, loading: authLoading } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState('');

  useEffect(() => {
    if (authLoading) return;
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
  }, [user, authLoading, router]);

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

  if (authLoading || loading) {
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
    <div className="lp" style={{ minHeight: '100vh', paddingBottom: '4rem' }}>
      <div className="orbs"><div className="orb orb1" /><div className="orb orb2" /><div className="orb orb3" /></div>
      <div className="grain" />

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '120px 1.5rem 0' }}>

        {/* Welcome + Plan Card */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>

          {/* Welcome */}
          <div className="gcard" style={{ padding: '2rem' }}>
            <div className="gcard-border" />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, #fbbf24, #f472b6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1.2rem', fontWeight: 700 }}>
                  {(profile?.full_name || 'U').charAt(0).toUpperCase()}
                </div>
                <div>
                  <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text1)' }}>
                    Welcome back, {(profile?.full_name || 'there').split(' ')[0]}!
                  </h1>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text2)' }}>{profile?.email || user?.email}</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <div style={{ textAlign: 'center', padding: '0.75rem 1.5rem', borderRadius: '12px', background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.12)' }}>
                  <span style={{ display: 'block', fontSize: '1.5rem', fontWeight: 700, color: '#f59e0b' }}>{events.length}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text2)' }}>Events</span>
                </div>
                <div style={{ textAlign: 'center', padding: '0.75rem 1.5rem', borderRadius: '12px', background: 'rgba(244,114,182,0.06)', border: '1px solid rgba(244,114,182,0.12)' }}>
                  <span style={{ display: 'block', fontSize: '1.5rem', fontWeight: 700, color: '#f472b6' }}>{events.reduce((sum, e) => sum + (e.photo_count || 0), 0)}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text2)' }}>Photos</span>
                </div>
              </div>
            </div>
          </div>

          {/* Plan Card */}
          <div className="gcard" style={{ padding: '2rem' }}>
            <div className="gcard-border" />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text3)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Current Plan</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                    <span style={{ fontSize: '1.5rem' }}>{planInfo.emoji}</span>
                    <span style={{ fontSize: '1.3rem', fontWeight: 700, color: planInfo.color }}>{planInfo.name}</span>
                  </div>
                </div>
                <span style={{ padding: '0.3rem 0.8rem', borderRadius: '100px', fontSize: '0.7rem', fontWeight: 600, background: 'rgba(34,197,94,0.1)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.2)' }}>
                  Active
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {planInfo.features.slice(0, 4).map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: 'var(--text2)' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={planInfo.color} strokeWidth="2.5"><path d="M20 6L9 17l-5-5" /></svg>
                    {f}
                  </div>
                ))}
              </div>
              {currentPlan !== 'whitelabel' && (
                <Link href="/#pricing" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '1rem', padding: '0.5rem 1rem', borderRadius: '10px', background: `${planInfo.color}12`, color: planInfo.color, fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none', border: `1px solid ${planInfo.color}25` }}>
                  Upgrade Plan
                  <ExternalLink size={12} />
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Events Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text1)' }}>Your Events</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text2)' }}>Manage your photo walls and sharing</p>
          </div>
          <Link href="/create" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '0.7rem 1.25rem', borderRadius: '14px', background: 'linear-gradient(135deg, #fbbf24, #f472b6)', color: '#0a0600', fontWeight: 700, fontSize: '0.88rem', textDecoration: 'none', boxShadow: '0 4px 16px rgba(244,114,182,0.25)', transition: 'transform 0.2s' }}>
            <Plus size={16} /> Create Event
          </Link>
        </div>

        {/* Events Grid */}
        {events.length === 0 ? (
          <div className="gcard" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
            <div className="gcard-border" />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>🎈</span>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text1)', marginBottom: '0.5rem' }}>No Events Yet</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text2)', marginBottom: '1.5rem' }}>Create your first photo wall and start collecting moments!</p>
              <Link href="/create" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '0.75rem 1.5rem', borderRadius: '14px', background: 'linear-gradient(135deg, #fbbf24, #f472b6)', color: '#0a0600', fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none' }}>
                <Plus size={16} /> Create Your First Wall
              </Link>
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.25rem' }}>
            {events.map((event) => (
              <div key={event.id} className="gcard" style={{ padding: '1.5rem', transition: 'transform 0.3s' }}>
                <div className="gcard-border" />
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text1)', marginBottom: '0.25rem' }}>{event.name}</h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text2)' }}>
                        <span>{new Date(event.created_at).toLocaleDateString()}</span>
                        <span>•</span>
                        <span style={{ color: '#f59e0b', fontWeight: 600 }}>📸 {event.photo_count || 0}</span>
                      </div>
                    </div>
                    <button onClick={() => handleDelete(event.id)} style={{ width: 32, height: 32, borderRadius: 10, border: '1px solid rgba(200,210,230,0.4)', background: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text3)' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>

                  {/* Action buttons */}
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                    <Link href={`/wall/${event.slug}`} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '0.55rem', borderRadius: '10px', background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)', color: '#f59e0b', fontSize: '0.78rem', fontWeight: 600, textDecoration: 'none' }}>
                      <Layout size={13} /> Wall
                    </Link>
                    <Link href={`/upload/${event.slug}`} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '0.55rem', borderRadius: '10px', background: 'rgba(244,114,182,0.06)', border: '1px solid rgba(244,114,182,0.15)', color: '#f472b6', fontSize: '0.78rem', fontWeight: 600, textDecoration: 'none' }}>
                      <Camera size={13} /> Upload
                    </Link>
                    <Link href={`/moderate/${event.slug}`} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '0.55rem', borderRadius: '10px', background: 'rgba(168,85,247,0.06)', border: '1px solid rgba(168,85,247,0.15)', color: '#a855f7', fontSize: '0.78rem', fontWeight: 600, textDecoration: 'none' }}>
                      <Shield size={13} /> Mod
                    </Link>
                  </div>

                  {/* Copy link */}
                  <button onClick={() => copyUrl(event.slug)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.6rem 0.85rem', borderRadius: '10px', background: 'rgba(241,245,249,0.5)', border: '1px solid rgba(200,210,230,0.3)', cursor: 'pointer', fontSize: '0.75rem', color: 'var(--text2)' }}>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {typeof window !== 'undefined' ? `${window.location.origin}/upload/${event.slug}` : `/upload/${event.slug}`}
                    </span>
                    <span style={{ flexShrink: 0, marginLeft: '0.5rem', color: copied === event.slug ? '#22c55e' : 'var(--text3)' }}>
                      {copied === event.slug ? '✓ Copied' : <Copy size={13} />}
                    </span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
