"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Globe, Music, Palette, Lock, Link2, Star, Sparkles } from 'lucide-react';
import '../../../../landing.css';

export default function EditEventPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { user, isLoading } = useAuth();

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [password, setPassword] = useState('');
  const [theme, setTheme] = useState('light');
  const [musicTrack, setMusicTrack] = useState('none');
  const [planType, setPlanType] = useState('STARTER');
  const [customDomain, setCustomDomain] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [slugError, setSlugError] = useState('');

  useEffect(() => {
    if (isLoading) return;
    if (!user) { router.push('/auth'); return; }

    const fetchEvent = async () => {
      const { data, error } = await supabase.from('events').select('*').eq('id', id).single();
      if (error || !data) { router.push('/dashboard'); return; }
      if (data.owner_id !== user.id) { router.push('/dashboard'); return; }

      setName(data.name);
      setSlug(data.slug);
      setPassword(data.password || '');
      setTheme(data.theme || 'light');
      setMusicTrack(data.music_track || 'none');
      setPlanType((data.plan_type || 'STARTER').toUpperCase());
      setCustomDomain(data.custom_domain || '');
      setLogoUrl(data.brand_logo_url || '');
      setLoading(false);
    };

    fetchEvent();
  }, [id, user, isLoading, router]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const { error: updateError } = await supabase.from('events').update({
      name, slug,
      password: password || null,
      theme,
      music_track: musicTrack !== 'none' ? musicTrack : null,
      custom_domain: planType === 'WHITE_LABEL' ? customDomain : null,
      brand_logo_url: planType === 'WHITE_LABEL' ? logoUrl : null,
    }).eq('id', id);

    if (updateError) { setError(updateError.message); setSaving(false); return; }
    router.push('/dashboard');
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

  const isWhiteLabel = planType === 'WHITE_LABEL';
  const isPremiumPlus = ['PREMIUM', 'WHITE_LABEL'].includes(planType);
  const isStandardPlus = ['STANDARD', 'PREMIUM', 'WHITE_LABEL'].includes(planType);

  return (
    <div className="lp min-h-screen relative overflow-hidden">
      <div className="orbs"><div className="orb orb1" /><div className="orb orb2" /><div className="orb orb3" /></div>
      <div className="grain" />

      {/* ── NAV ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 500,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 2.5rem', height: '64px',
        background: 'rgba(10,10,11,0.72)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
          <div style={{
            width: 32, height: 32, borderRadius: 10,
            background: 'linear-gradient(135deg, #06b6d4, #ec4899)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1rem', boxShadow: '0 0 16px rgba(6,182,212,0.4)',
          }}>📸</div>
          <span style={{ fontWeight: 800, fontSize: '1rem', color: '#F8FAFC', letterSpacing: '-0.02em' }}>memento</span>
        </Link>
        <button
          onClick={() => router.back()}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '0.4rem 1rem', borderRadius: 100,
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
            color: '#94A3B8', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
          }}
        >
          <ArrowLeft size={13} /> Back
        </button>
      </nav>

      {/* ── CONTENT ── */}
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '96px 24px 60px', position: 'relative', zIndex: 10 }}>
        <motion.div
          initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          style={{ width: '100%', maxWidth: 520 }}
        >
          {/* Page title */}
          <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '0.35rem 1rem', borderRadius: 100,
              background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.18)',
              color: '#06b6d4', fontSize: '0.7rem', fontWeight: 800,
              letterSpacing: '0.12em', textTransform: 'uppercase',
              marginBottom: '1rem',
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#06b6d4', display: 'inline-block' }} />
              Event Settings
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#F8FAFC', letterSpacing: '-0.04em', lineHeight: 1.1 }}>
              Edit <span className="gradient-text">Event</span>
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: 8 }}>Customise your photo wall settings below.</p>
          </div>

          {/* Card */}
          <div className="gcard" style={{ padding: '2.25rem', position: 'relative' }}>
            <div className="gcard-border" />

            <form onSubmit={handleUpdate} style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>

              {/* Event Name */}
              <FieldGroup label="Event Name" icon={<Star size={13} />}>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="My Amazing Event"
                  style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = 'rgba(6,182,212,0.4)')}
                  onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')}
                />
              </FieldGroup>

              {/* Slug */}
              <FieldGroup
                label="Custom Slug (URL)"
                icon={<Link2 size={13} />}
                badge={!isStandardPlus ? (
                  <UpgradeBadge href={`/pricing?eventId=${id}`} label="Upgrade to Standard" color="#06b6d4" />
                ) : undefined}
              >
                <div style={{ position: 'relative' }}>
                  <span style={{
                    position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)',
                    fontSize: '0.8rem', color: '#475569', pointerEvents: 'none', userSelect: 'none',
                  }}>/wall/</span>
                  <input
                    type="text"
                    value={slug}
                    disabled={!isStandardPlus}
                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    placeholder={!isStandardPlus ? 'Standard plan required' : 'your-event-slug'}
                    style={{ ...inputStyle, paddingLeft: '3.75rem', opacity: !isStandardPlus ? 0.45 : 1 }}
                    onFocus={e => { if (isStandardPlus) e.target.style.borderColor = 'rgba(6,182,212,0.4)'; }}
                    onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')}
                  />
                </div>
                {slugError && <p style={{ fontSize: '0.72rem', color: '#f87171', marginTop: 4 }}>{slugError}</p>}
              </FieldGroup>

              {/* Password */}
              <FieldGroup label="Password Protection" icon={<Lock size={13} />}>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Leave blank for public access"
                  style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = 'rgba(6,182,212,0.4)')}
                  onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')}
                />
              </FieldGroup>

              {/* Divider */}
              <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '0.25rem 0' }} />

              {/* Wall Theme */}
              <FieldGroup
                label="Wall Theme"
                icon={<Palette size={13} />}
                badge={!isStandardPlus ? (
                  <UpgradeBadge href={`/pricing?eventId=${id}`} label="Upgrade to Unlock" color="#06b6d4" />
                ) : undefined}
              >
                <select
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  disabled={!isStandardPlus}
                  style={{ ...inputStyle, opacity: !isStandardPlus ? 0.45 : 1, cursor: !isStandardPlus ? 'not-allowed' : 'pointer' }}
                >
                  <option value="light">Classic Light</option>
                  <option value="dark">Cinematic Dark</option>
                  <option value="dreamy">Dreamy Glassmorphism</option>
                </select>
              </FieldGroup>

              {/* Music */}
              <FieldGroup
                label="Slideshow Music"
                icon={<Music size={13} />}
                badge={!isPremiumPlus ? (
                  <UpgradeBadge href={`/pricing?eventId=${id}`} label="Upgrade to Unlock" color="#ec4899" />
                ) : undefined}
              >
                <select
                  value={musicTrack}
                  onChange={(e) => setMusicTrack(e.target.value)}
                  disabled={!isPremiumPlus}
                  style={{ ...inputStyle, opacity: !isPremiumPlus ? 0.45 : 1, cursor: !isPremiumPlus ? 'not-allowed' : 'pointer' }}
                >
                  <option value="none">No Music</option>
                  <option value="lofi">Lofi Chill</option>
                  <option value="acoustic">Acoustic Sunset</option>
                  <option value="upbeat">Upbeat Party</option>
                </select>
              </FieldGroup>

              {/* White Label Section */}
              <div style={{ background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.12)', borderRadius: 16, padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: '1.1rem' }}>
                  <span style={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#6366f1' }}>👑 White Label</span>
                  {!isWhiteLabel && (
                    <UpgradeBadge href={`/pricing?eventId=${id}`} label="Upgrade to Partner" color="#6366f1" />
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <FieldGroup label="Custom Domain" icon={<Globe size={13} />}>
                    <input
                      type="text"
                      value={customDomain}
                      disabled={!isWhiteLabel}
                      onChange={(e) => setCustomDomain(e.target.value)}
                      placeholder="photos.yourdomain.com"
                      style={{ ...inputStyle, opacity: !isWhiteLabel ? 0.4 : 1 }}
                      onFocus={e => { if (isWhiteLabel) e.target.style.borderColor = 'rgba(99,102,241,0.4)'; }}
                      onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')}
                    />
                    {isWhiteLabel && (
                      <p style={{ fontSize: '0.7rem', color: '#64748b', marginTop: 4 }}>Point your A record to memento.events IP.</p>
                    )}
                  </FieldGroup>

                  <FieldGroup label="Brand Logo URL">
                    <input
                      type="text"
                      value={logoUrl}
                      disabled={!isWhiteLabel}
                      onChange={(e) => setLogoUrl(e.target.value)}
                      placeholder="https://…/logo.png"
                      style={{ ...inputStyle, opacity: !isWhiteLabel ? 0.4 : 1 }}
                      onFocus={e => { if (isWhiteLabel) e.target.style.borderColor = 'rgba(99,102,241,0.4)'; }}
                      onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')}
                    />
                  </FieldGroup>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '0.75rem 1rem', borderRadius: 12,
                  background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                  color: '#f87171', fontSize: '0.8rem',
                }}>
                  ⚠️ {error}
                </div>
              )}

              {/* Submit */}
              <motion.button
                type="submit"
                disabled={saving}
                whileHover={{ scale: 1.015 }}
                whileTap={{ scale: 0.985 }}
                className="btn-hero-primary"
                style={{ width: '100%', padding: '0.9rem', fontSize: '0.9rem', fontWeight: 800, opacity: saving ? 0.7 : 1, cursor: saving ? 'wait' : 'pointer' }}
              >
                {saving ? (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                    Saving changes…
                  </span>
                ) : (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <Sparkles size={15} /> Save Changes
                  </span>
                )}
              </motion.button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

/* ── HELPERS ── */

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '0.75rem 1rem',
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 14, color: '#F8FAFC',
  fontSize: '0.875rem', outline: 'none',
  transition: 'border-color 0.2s',
  fontFamily: 'inherit',
  appearance: 'none',
  WebkitAppearance: 'none',
};

function FieldGroup({ label, icon, badge, children }: {
  label: string;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          {icon && <span style={{ color: '#475569' }}>{icon}</span>}
          {label}
        </label>
        {badge}
      </div>
      {children}
    </div>
  );
}

function UpgradeBadge({ href, label, color }: { href: string; label: string; color: string }) {
  return (
    <Link href={href} style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '0.2rem 0.65rem', borderRadius: 100,
      background: `${color}10`, color,
      border: `1px solid ${color}25`,
      fontSize: '0.62rem', fontWeight: 800,
      letterSpacing: '0.06em', textDecoration: 'none',
      transition: 'all 0.2s', whiteSpace: 'nowrap',
    }}>
      ✨ {label}
    </Link>
  );
}