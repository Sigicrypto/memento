"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Globe, Palette, Lock, Star, Sparkles, Save, Image as ImageIcon, AlertTriangle } from 'lucide-react';
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
    }).eq('id', eventId);

    if (updateError) {
      setError(updateError.message);
      setSaving(false);
      return;
    }
    
    setSaving(false);
    onSuccess(); // Trigger refresh
    onClose();
  };

  const isWhiteLabel = planType === 'WHITE_LABEL';
  const isPremiumPlus = ['PREMIUM', 'WHITE_LABEL'].includes(planType);
  const isStandardPlus = ['STANDARD', 'PREMIUM', 'WHITE_LABEL'].includes(planType);

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
            className="fixed inset-0 z-[60] bg-bg/80 backdrop-blur-sm"
          />
          
          {/* Slide-out Sheet (Drawer) */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 z-[70] w-full sm:w-[450px] bg-surface border-l border-border shadow-2xl flex flex-col"
          >
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div>
                <h2 className="text-xl font-bold text-text-primary">Event Settings</h2>
                <p className="text-sm text-text-secondary">Customize your wall experience.</p>
              </div>
              <button onClick={onClose} className="p-2 rounded-md hover:bg-bg-subtle text-text-muted hover:text-text-primary transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {loading ? (
                <div className="flex justify-center py-20">
                  <div className="w-8 h-8 border-2 border-border border-t-primary rounded-full animate-spin" />
                </div>
              ) : (
                <form id="event-settings-form" onSubmit={handleUpdate} className="space-y-8">
                  {/* Base Identity */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-text-primary font-semibold border-b border-border pb-2">
                      <Star size={16} /> Base Identity
                    </div>
                    
                    <div className="input-group">
                      <label className="label">Event Name</label>
                      <input type="text" value={name} onChange={e => setName(e.target.value)} required className="input" />
                    </div>

                    <div className="input-group">
                      <div className="flex items-center justify-between">
                        <label className="label">Custom Slug (URL)</label>
                        {!isStandardPlus && <UpgradeBadge href={`/pricing?eventId=${eventId}`} label="Upgrade" />}
                      </div>
                      <div className="flex">
                        <span className="inline-flex items-center px-3 border border-r-0 border-border bg-bg-subtle text-text-muted text-sm rounded-l-md font-mono">/wall/</span>
                        <input type="text" value={slug} disabled={!isStandardPlus} onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))} className="input rounded-l-none" />
                      </div>
                    </div>

                    <div className="input-group">
                      <label className="label">Privacy Password</label>
                      <div className="relative">
                        <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Leave blank for public access" className="input pl-9" />
                      </div>
                    </div>
                  </div>

                  {/* Experience & Style */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-text-primary font-semibold border-b border-border pb-2">
                      <Palette size={16} /> Experience & Style
                    </div>
                    
                    <div className="input-group">
                      <div className="flex items-center justify-between">
                        <label className="label">Wall Theme</label>
                        {!isStandardPlus && <UpgradeBadge href={`/pricing?eventId=${eventId}`} label="Upgrade" />}
                      </div>
                      <select value={theme} onChange={e => setTheme(e.target.value)} disabled={!isStandardPlus} className="input">
                        <option value="light">Classic Light</option>
                        <option value="dark">Cinematic Dark</option>
                        <option value="dreamy">Dreamy Glassmorphism</option>
                      </select>
                    </div>

                    <div className="input-group">
                      <div className="flex items-center justify-between">
                        <label className="label">Soundtrack</label>
                        {!isPremiumPlus && <UpgradeBadge href={`/pricing?eventId=${eventId}`} label="Upgrade" />}
                      </div>
                      <select value={musicTrack} onChange={e => setMusicTrack(e.target.value)} disabled={!isPremiumPlus} className="input">
                        <option value="none">No Music</option>
                        <option value="lofi">Lofi Chill</option>
                        <option value="acoustic">Acoustic Sunset</option>
                        <option value="upbeat">Upbeat Party</option>
                      </select>
                    </div>
                  </div>

                  {/* White Label */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-border pb-2">
                      <div className="flex items-center gap-2 text-text-primary font-semibold">
                        <Globe size={16} /> White Label & Branding
                      </div>
                      {!isWhiteLabel && <UpgradeBadge href={`/pricing?eventId=${eventId}`} label="Partner" />}
                    </div>
                    
                    <div className="input-group">
                      <label className="label">Custom Domain</label>
                      <input type="text" value={customDomain} disabled={!isWhiteLabel} onChange={e => setCustomDomain(e.target.value)} placeholder="gallery.yourevent.com" className="input" />
                    </div>
                    <div className="input-group">
                      <label className="label">Brand Logo URL</label>
                      <div className="relative">
                        <ImageIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                        <input type="text" value={logoUrl} disabled={!isWhiteLabel} onChange={e => setLogoUrl(e.target.value)} placeholder="https://domain.com/logo.png" className="input pl-9" />
                      </div>
                    </div>
                  </div>

                  {error && (
                    <div className="p-3 rounded-md bg-error/10 border border-error/20 flex items-center gap-2 text-error text-sm font-medium">
                      <AlertTriangle size={16} /> {error}
                    </div>
                  )}
                </form>
              )}
            </div>

            <div className="p-6 border-t border-border bg-bg-subtle flex gap-3">
              <button type="button" onClick={onClose} className="btn btn-secondary flex-1">
                Cancel
              </button>
              <button type="submit" form="event-settings-form" disabled={saving || loading} className="btn btn-primary flex-1">
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
    <Link href={href} className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-accent-cyan/10 border border-accent-cyan/20 text-accent-cyan hover:bg-accent-cyan/20 transition-colors">
      <Sparkles size={10} /> {label}
    </Link>
  );
}
