"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Globe, Palette, Lock, Star, Sparkles, Image as ImageIcon, AlertTriangle, CheckCircle, MessageCircle } from 'lucide-react';
import Link from 'next/link';

interface EventSettingsDrawerProps {
  eventId: string | null;
  onClose: () => void;
  onSuccess: () => void;
  user: any;
}

export default function EventSettingsDrawer({ eventId, onClose, onSuccess, user }: EventSettingsDrawerProps) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [password, setPassword] = useState('');
  const [theme, setTheme] = useState('light');
  const [musicTrack, setMusicTrack] = useState('none');
  const [planType, setPlanType] = useState('STARTER');
  const [customDomain, setCustomDomain] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [isClosed, setIsClosed] = useState(false);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!eventId || !user) return;
    const fetchEvent = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('events').select('*').eq('id', eventId).single();
      if (error || !data) { onClose(); return; }

      setName(data.name || '');
      setSlug(data.slug || '');
      setPassword(data.password || '');
      setTheme(data.theme || 'light');
      setMusicTrack(data.music_track || 'none');
      setPlanType((data.plan_type || 'STARTER').toUpperCase());
      setCustomDomain(data.custom_domain || '');
      setLogoUrl(data.brand_logo_url || '');
      setIsClosed(!!data.is_closed);
      setLoading(false);
    };
    fetchEvent();
  }, [eventId, user, onClose]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventId) return;
    setSaving(true);
    setError('');

    const { error: updateError } = await supabase.from('events').update({
      name, slug,
      password: password || null,
      theme,
      music_track: musicTrack !== 'none' ? musicTrack : null,
      custom_domain: planType === 'WHITE_LABEL' ? customDomain : null,
      brand_logo_url: planType === 'WHITE_LABEL' ? logoUrl : null,
      is_closed: isClosed,
    }).eq('id', eventId);

    if (updateError) {
      setError(updateError.message);
      setSaving(false);
      return;
    }

    setSaving(false);
    onSuccess();
    onClose();
  };

  const isWhiteLabel = planType === 'WHITE_LABEL';
  const isPremiumPlus = ['PREMIUM', 'WHITE_LABEL'].includes(planType);
  const isStandardPlus = ['STANDARD', 'PREMIUM', 'WHITE_LABEL'].includes(planType);

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '12px',
    border: '1px solid var(--border)',
    background: 'var(--surface)',
    color: 'var(--text-primary)',
    fontSize: '14px',
    fontWeight: 500,
    outline: 'none',
    transition: 'border-color 0.2s',
  };

  const disabledInputStyle: React.CSSProperties = {
    ...inputStyle,
    background: 'var(--bg-subtle)',
    color: 'var(--text-secondary)',
    cursor: 'not-allowed',
    opacity: 0.8,
  };

  return (
    <AnimatePresence>
      {eventId && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 60,
              background: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(4px)',
            }}
          />

          {/* Slide-out Sheet (Drawer) */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            style={{
              position: 'fixed',
              top: 0,
              bottom: 0,
              right: 0,
              zIndex: 70,
              width: '100%',
              maxWidth: '480px',
              background: 'var(--bg)',
              borderLeft: '1px solid var(--border)',
              boxShadow: '-10px 0 30px rgba(0, 0, 0, 0.3)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '24px 28px',
                borderBottom: '1px solid var(--border)',
                background: 'var(--surface)',
              }}
            >
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  Event Settings
                </h2>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px', margin: 0 }}>
                  Configure permissions, theme, and branding.
                </p>
              </div>
              <button
                onClick={onClose}
                style={{
                  padding: '8px',
                  borderRadius: '10px',
                  border: '1px solid var(--border)',
                  background: 'var(--bg)',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Content Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '28px' }}>
              {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
                  <div className="w-8 h-8 border-2 border-border border-t-accent-cyan rounded-full animate-spin" />
                </div>
              ) : (
                <form id="event-settings-form" onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                  
                  {/* ── SECTION 1: BASE IDENTITY ── */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        paddingBottom: '10px',
                        borderBottom: '1px solid var(--border)',
                        color: 'var(--text-primary)',
                        fontSize: '15px',
                        fontWeight: 700,
                      }}
                    >
                      <Star size={16} style={{ color: 'var(--accent-cyan)' }} />
                      <span>Base Identity</span>
                    </div>

                    {/* Event Name */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>
                        Event Name
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        required
                        style={inputStyle}
                        placeholder="e.g. Sarah & Alex's Wedding"
                      />
                    </div>

                    {/* Custom Slug */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <label style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>
                          Custom Slug (URL)
                        </label>
                        {!isStandardPlus && <UpgradeBadge href={`/#pricing?eventId=${eventId}`} label="Upgrade Plan" />}
                      </div>
                      <div style={{ display: 'flex' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            padding: '0 14px',
                            border: '1px solid var(--border)',
                            borderRight: 'none',
                            background: 'var(--bg-subtle)',
                            color: 'var(--text-muted)',
                            fontSize: '13px',
                            fontWeight: 600,
                            borderRadius: '12px 0 0 12px',
                            fontFamily: 'monospace',
                          }}
                        >
                          /wall/
                        </span>
                        <input
                          type="text"
                          value={slug}
                          disabled={!isStandardPlus}
                          onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                          style={{
                            ...(isStandardPlus ? inputStyle : disabledInputStyle),
                            borderRadius: '0 12px 12px 0',
                          }}
                        />
                      </div>
                    </div>

                    {/* Privacy Password */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>
                        Privacy Password
                      </label>
                      <div style={{ position: 'relative' }}>
                        <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                          type="password"
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          placeholder="Leave blank for public access"
                          style={{ ...inputStyle, paddingLeft: '40px' }}
                        />
                      </div>
                    </div>

                    {/* Event Status / Upload Mode */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '4px' }}>
                      <label style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>
                        Event Status (Upload Mode)
                      </label>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        {/* Active Button */}
                        <button
                          type="button"
                          onClick={() => setIsClosed(false)}
                          style={{
                            padding: '14px 16px',
                            borderRadius: '14px',
                            textAlign: 'left',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            border: !isClosed ? '2px solid var(--success)' : '1px solid var(--border)',
                            background: !isClosed ? 'color-mix(in srgb, var(--success) 12%, var(--surface))' : 'var(--surface)',
                            color: !isClosed ? 'var(--success)' : 'var(--text-primary)',
                          }}
                        >
                          <span style={{ fontSize: '13px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--success)' }} />
                            Active Wall
                          </span>
                          <span style={{ fontSize: '11px', color: !isClosed ? 'var(--text-primary)' : 'var(--text-secondary)', opacity: 0.9 }}>
                            Guest uploads open
                          </span>
                        </button>

                        {/* Closed Button */}
                        <button
                          type="button"
                          onClick={() => setIsClosed(true)}
                          style={{
                            padding: '14px 16px',
                            borderRadius: '14px',
                            textAlign: 'left',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            border: isClosed ? '2px solid #f59e0b' : '1px solid var(--border)',
                            background: isClosed ? 'rgba(245, 158, 11, 0.15)' : 'var(--surface)',
                            color: isClosed ? '#f59e0b' : 'var(--text-primary)',
                          }}
                        >
                          <span style={{ fontSize: '13px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Lock size={12} />
                            Closed (View-Only)
                          </span>
                          <span style={{ fontSize: '11px', color: isClosed ? 'var(--text-primary)' : 'var(--text-secondary)', opacity: 0.9 }}>
                            Uploads paused
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* ── SECTION 2: EXPERIENCE & STYLE ── */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        paddingBottom: '10px',
                        borderBottom: '1px solid var(--border)',
                        color: 'var(--text-primary)',
                        fontSize: '15px',
                        fontWeight: 700,
                      }}
                    >
                      <Palette size={16} style={{ color: 'var(--accent-cyan)' }} />
                      <span>Experience & Style</span>
                    </div>

                    {/* Wall Theme */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <label style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>
                          Wall Theme
                        </label>
                        {!isStandardPlus && <UpgradeBadge href={`/#pricing?eventId=${eventId}`} label="Upgrade Plan" />}
                      </div>
                      <select
                        value={theme}
                        onChange={e => setTheme(e.target.value)}
                        disabled={!isStandardPlus}
                        style={isStandardPlus ? inputStyle : disabledInputStyle}
                      >
                        <option value="light">Classic Light</option>
                        <option value="dark">Cinematic Dark</option>
                        <option value="dreamy">Dreamy Glassmorphism</option>
                      </select>
                    </div>

                    {/* Soundtrack */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <label style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>
                          Soundtrack
                        </label>
                        {!isPremiumPlus && <UpgradeBadge href={`/#pricing?eventId=${eventId}`} label="Upgrade Plan" />}
                      </div>
                      <select
                        value={musicTrack}
                        onChange={e => setMusicTrack(e.target.value)}
                        disabled={!isPremiumPlus}
                        style={isPremiumPlus ? inputStyle : disabledInputStyle}
                      >
                        <option value="none">No Music</option>
                        <option value="lofi">Lofi Chill</option>
                        <option value="acoustic">Acoustic Sunset</option>
                        <option value="upbeat">Upbeat Party</option>
                      </select>
                    </div>
                  </div>

                  {/* ── SECTION 3: WHITE LABEL & BRANDING ── */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingBottom: '10px',
                        borderBottom: '1px solid var(--border)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', fontSize: '15px', fontWeight: 700 }}>
                        <Globe size={16} style={{ color: 'var(--accent-cyan)' }} />
                        <span>White Label & Branding</span>
                      </div>
                      {!isWhiteLabel && <UpgradeBadge href={`/#pricing?eventId=${eventId}`} label="Partner Plan" />}
                    </div>

                    {/* Custom Domain */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>
                        Custom Domain
                      </label>
                      <input
                        type="text"
                        value={customDomain}
                        disabled={!isWhiteLabel}
                        onChange={e => setCustomDomain(e.target.value)}
                        placeholder="gallery.yourevent.com"
                        style={isWhiteLabel ? inputStyle : disabledInputStyle}
                      />
                    </div>

                    {/* Brand Logo URL */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>
                        Brand Logo URL
                      </label>
                      <div style={{ position: 'relative' }}>
                        <ImageIcon size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                          type="text"
                          value={logoUrl}
                          disabled={!isWhiteLabel}
                          onChange={e => setLogoUrl(e.target.value)}
                          placeholder="https://domain.com/logo.png"
                          style={{
                            ...(isWhiteLabel ? inputStyle : disabledInputStyle),
                            paddingLeft: '40px',
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* ── SECTION 4: WHATSAPP INTEGRATION ── */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingBottom: '10px',
                        borderBottom: '1px solid var(--border)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', fontSize: '15px', fontWeight: 700 }}>
                        <MessageCircle size={16} style={{ color: '#25D366' }} />
                        <span>WhatsApp Bot Integration</span>
                      </div>
                      {!isStandardPlus && <UpgradeBadge href={`/#pricing?eventId=${eventId}`} label="Upgrade Plan" />}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                        Enable QR-less entry for your guests. They can simply text your dedicated WhatsApp bot to instantly join the photo wall.
                      </p>
                      
                      {isStandardPlus ? (
                        <div style={{ padding: '16px', background: 'var(--bg-subtle)', borderRadius: '12px', border: '1px solid var(--border)', marginTop: '8px' }}>
                          <label style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
                            Guest Join Link
                          </label>
                          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                            <input 
                              type="text" 
                              readOnly 
                              value={`https://wa.me/15551234567?text=JOIN%20${slug || eventId}`}
                              style={{ 
                                flex: 1, 
                                cursor: 'copy', 
                                fontFamily: 'monospace',
                                background: 'var(--bg)',
                                border: '1px solid var(--border)',
                                color: 'var(--text-primary)',
                                padding: '10px 14px',
                                borderRadius: '8px',
                                fontSize: '14px',
                                width: '100%'
                              }} 
                              onClick={(e) => (e.target as HTMLInputElement).select()}
                            />
                          </div>
                          <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '10px' }}>
                            Share this link directly or embed it in digital invites.
                          </p>
                        </div>
                      ) : (
                        <button disabled style={disabledInputStyle}>
                          WhatsApp Bot requires EVENT plan or higher
                        </button>
                      )}
                    </div>
                  </div>

                  {error && (
                    <div
                      style={{
                        padding: '14px',
                        borderRadius: '12px',
                        background: 'color-mix(in srgb, var(--error) 15%, transparent)',
                        border: '1px solid color-mix(in srgb, var(--error) 30%, transparent)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        color: 'var(--error)',
                        fontSize: '13px',
                        fontWeight: 600,
                      }}
                    >
                      <AlertTriangle size={16} /> {error}
                    </div>
                  )}
                </form>
              )}
            </div>

            {/* Footer Buttons */}
            <div
              style={{
                padding: '20px 28px',
                borderTop: '1px solid var(--border)',
                background: 'var(--surface)',
                display: 'flex',
                gap: '12px',
              }}
            >
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary"
                style={{
                  flex: 1,
                  padding: '12px',
                  fontSize: '14px',
                  fontWeight: 700,
                  borderRadius: '12px',
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                form="event-settings-form"
                disabled={saving || loading}
                className="btn btn-primary"
                style={{
                  flex: 1,
                  padding: '12px',
                  fontSize: '14px',
                  fontWeight: 700,
                  borderRadius: '12px',
                }}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function UpgradeBadge({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '3px 10px',
        borderRadius: '999px',
        fontSize: '11px',
        fontWeight: 700,
        background: 'color-mix(in srgb, var(--accent-cyan) 12%, transparent)',
        border: '1px solid color-mix(in srgb, var(--accent-cyan) 25%, transparent)',
        color: 'var(--accent-cyan)',
        textDecoration: 'none',
      }}
    >
      <Sparkles size={10} /> {label}
    </Link>
  );
}
