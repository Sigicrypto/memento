"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

export default function EditEventPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

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
    if (authLoading) return;
    if (!user) { router.push('/auth'); return; }

    const fetchEvent = async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        router.push('/dashboard');
        return;
      }

      if (data.owner_id !== user.id) {
        router.push('/dashboard');
        return;
      }

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
  }, [id, user, authLoading, router]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    // Update event
    const { error: updateError } = await supabase
      .from('events')
      .update({
        name,
        slug,
        password: password || null,
        theme,
        music_track: musicTrack !== 'none' ? musicTrack : null,
        custom_domain: planType === 'WHITE_LABEL' ? customDomain : null,
        brand_logo_url: planType === 'WHITE_LABEL' ? logoUrl : null,
      })
      .eq('id', id);

    if (updateError) {
      setError(updateError.message);
      setSaving(false);
      return;
    }

    router.push('/dashboard');
  };

  if (authLoading || loading) {
    return (
      <div className="nm-page flex items-center justify-center">
        <div className="nm-circle w-14 h-14">
          <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{borderColor:'#252c46',borderTopColor:'#f59e0b'}} />
        </div>
      </div>
    );
  }

  const isWhiteLabel = planType === 'WHITE_LABEL';
  const isPremiumPlus = ['PREMIUM', 'WHITE_LABEL'].includes(planType);
  const isStandardPlus = ['STANDARD', 'PREMIUM', 'WHITE_LABEL'].includes(planType);

  return (
    <div className="nm-page flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="nm-card p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold" style={{color:'var(--text1)'}}>Edit Event</h1>
            <button onClick={() => router.back()} className="nm-circle w-9 h-9 text-sm" style={{color:'var(--text2)'}}>✕</button>
          </div>

          <form onSubmit={handleUpdate} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold mb-2" style={{color:'var(--text2)'}}>Event Name</label>
              <input type="text" className="nm-input" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold" style={{color:'var(--text2)'}}>Custom Slug (URL)</label>
                {!isStandardPlus && (
                  <Link href={`/pricing?eventId=${id}`} className="text-[9px] px-2 py-0.5 bg-amber-500/10 text-amber-500 rounded-full border border-amber-500/20 hover:bg-amber-500/20 transition-colors font-bold">
                    ✨ Upgrade to Standard
                  </Link>
                )}
              </div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs pointer-events-none" style={{color:'#4a4f6a'}}>/wall/</span>
                <input type="text" className={`nm-input !pl-14 ${!isStandardPlus ? 'opacity-50' : ''}`} 
                  value={slug}
                  disabled={!isStandardPlus}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))} 
                  placeholder={!isStandardPlus ? 'Standard required' : ''}
                  required />
              </div>
              {slugError && <p className="text-[10px] mt-1" style={{color:'#f87171'}}>{slugError}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold mb-2" style={{color:'var(--text2)'}}>Password</label>
              <input type="password" className="nm-input" value={password}
                onChange={(e) => setPassword(e.target.value)} placeholder="Leave blank for public access" />
            </div>

            {/* White Label Section (Visible but Locked) */}
            <div className="pt-4 border-t border-slate-200/20 space-y-5">
              <div>
                <label className="block text-xs font-semibold mb-2 flex items-center justify-between">
                   <span style={{color: isWhiteLabel ? '#f59e0b' : 'var(--text2)'}}>⭐ Custom Domain (White Label)</span>
                   {!isWhiteLabel && (
                     <Link href={`/pricing?eventId=${id}`} className="text-[9px] px-2 py-0.5 bg-purple-500/10 text-purple-400 rounded-full border border-purple-500/20 hover:bg-purple-500/20 transition-colors font-bold">
                       🌐 Upgrade to Partner
                     </Link>
                   )}
                </label>
                <input type="text" className={`nm-input ${!isWhiteLabel ? 'opacity-50' : ''}`} 
                  value={customDomain} 
                  disabled={!isWhiteLabel}
                  onChange={(e) => setCustomDomain(e.target.value)} placeholder="e.g. photos.wedding.com" />
                {isWhiteLabel && <p className="text-[10px] mt-1" style={{color:'var(--text2)'}}>Point your A record to memento.events IP.</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold mb-2 flex items-center justify-between">
                   <span style={{color: isWhiteLabel ? '#f59e0b' : 'var(--text2)'}}>⭐ Brand Logo URL</span>
                </label>
                <input type="text" className={`nm-input ${!isWhiteLabel ? 'opacity-50' : ''}`} 
                  value={logoUrl} 
                  disabled={!isWhiteLabel}
                  onChange={(e) => setLogoUrl(e.target.value)} placeholder="https://... logo.png" />
              </div>
            </div>

            {/* Premium / Standard Features */}
            <div className="pt-4 border-t border-slate-200/20">
              <label className="block text-xs font-semibold mb-2 flex items-center justify-between" style={{color:'var(--text2)'}}>
                <span className="flex items-center gap-2">Wall Theme</span>
                {!isStandardPlus && (
                  <Link href={`/pricing?eventId=${id}`} className="text-[9px] px-2 py-0.5 bg-amber-500/10 text-amber-500 rounded-full border border-amber-500/20 hover:bg-amber-500/20 transition-colors">
                    ✨ Upgrade to Unlock
                  </Link>
                )}
              </label>
              <select 
                className="nm-input w-full" 
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                disabled={!isStandardPlus}
              >
                <option value="light">Classic Light</option>
                <option value="dark">Cinematic Dark</option>
                <option value="dreamy">Dreamy Glassmorphism</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-2 flex items-center justify-between" style={{color:'var(--text2)'}}>
                <span className="flex items-center gap-2">Slideshow Music</span>
                {!isPremiumPlus && (
                  <Link href={`/pricing?eventId=${id}`} className="text-[9px] px-2 py-0.5 bg-purple-500/10 text-purple-400 rounded-full border border-purple-500/20 hover:bg-purple-500/20 transition-colors">
                    💎 Upgrade to Unlock
                  </Link>
                )}
              </label>
              <select 
                className="nm-input w-full" 
                value={musicTrack}
                onChange={(e) => setMusicTrack(e.target.value)}
                disabled={!isPremiumPlus}
              >
                <option value="none">No Music</option>
                <option value="lofi">Lofi Chill (Free default)</option>
                <option value="acoustic">Acoustic Sunset</option>
                <option value="upbeat">Upbeat Party</option>
              </select>
            </div>

            {error && (
              <div className="nm-inset p-3 flex items-center gap-2 text-sm" style={{color:'#f87171'}}>
                <span>⚠️</span> {error}
              </div>
            )}

            <button type="submit" className="nm-btn nm-btn-accent w-full py-3 font-bold" disabled={saving}>
              {saving ? 'Saving changes…' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
