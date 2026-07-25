"use client";
 
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Globe, Palette, Lock, Star, Sparkles, Settings, Save, Image as ImageIcon, AlertTriangle } from 'lucide-react';
import AnimatedLogo from '@/components/AnimatedLogo';
 
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-border border-t-primary rounded-full animate-spin" />
      </div>
    );
  }
 
  const isWhiteLabel = planType === 'WHITE_LABEL';
  const isPremiumPlus = ['PREMIUM', 'WHITE_LABEL'].includes(planType);
  const isStandardPlus = ['STANDARD', 'PREMIUM', 'WHITE_LABEL'].includes(planType);
 
  return (
    <div className="min-h-screen flex flex-col bg-bg-subtle relative">
      <div className="grain" />
      <div className="orbs"><div className="orb orb-primary" /><div className="orb orb-secondary" /></div>
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-[64px] bg-bg/90 backdrop-blur-md border-b border-border flex items-center">
        <div className="container w-full flex items-center justify-between">
          <div className="flex items-center gap-4">
             <Link href="/dashboard" className="flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors font-medium text-sm">
                <ArrowLeft size={16} /> Dashboard
             </Link>
             <div className="h-6 w-px bg-border hidden md:block" />
             <Link href="/" className="hidden md:block">
               <AnimatedLogo width={120} height={32} />
             </Link>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-bg-subtle border border-border text-xs font-medium text-text-primary">
             <Settings size={14} /> Event Settings
          </div>
        </div>
      </nav>
 
      <main className="flex-grow pt-24 pb-24 max-w-2xl mx-auto w-full">
         <div className="mb-8">
            <h1 className="h2-text mb-2 text-text-primary">Edit Event</h1>
            <p className="text-text-secondary text-sm">Customize your wall experience and branding.</p>
         </div>
 
         <form onSubmit={handleUpdate} className="space-y-6">
            <div className="card space-y-6 bg-bg">
               <div className="flex items-center gap-2 text-text-primary font-semibold border-b border-border pb-4 mb-4">
                  <Star size={18} /> Base Identity
               </div>
 
               <div className="input-group">
                  <label className="label">Event Name</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="My Grand Celebration" className="input" />
               </div>

               <div className="input-group">
                  <div className="flex items-center justify-between">
                     <label className="label">Custom Slug (URL)</label>
                     {!isStandardPlus && <UpgradeBadge href={`/pricing?eventId=${id}`} label="Upgrade" />}
                  </div>
                  <div className="flex">
                     <span className="inline-flex items-center px-3 border border-r-0 border-border bg-bg-subtle text-text-muted text-sm rounded-l-md font-mono">/wall/</span>
                     <input type="text" value={slug} disabled={!isStandardPlus} onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))} placeholder="your-event" className="input rounded-l-none" />
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
 
            <div className="card space-y-6 bg-bg">
               <div className="flex items-center gap-2 text-text-primary font-semibold border-b border-border pb-4 mb-4">
                  <Palette size={18} /> Experience & Style
               </div>
 
               <div className="grid md:grid-cols-2 gap-6">
                  <div className="input-group">
                     <div className="flex items-center justify-between">
                        <label className="label">Wall Theme</label>
                        {!isStandardPlus && <UpgradeBadge href={`/pricing?eventId=${id}`} label="Upgrade" />}
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
                        {!isPremiumPlus && <UpgradeBadge href={`/pricing?eventId=${id}`} label="Upgrade" />}
                     </div>
                     <select value={musicTrack} onChange={e => setMusicTrack(e.target.value)} disabled={!isPremiumPlus} className="input">
                        <option value="none">No Music</option>
                        <option value="lofi">Lofi Chill</option>
                        <option value="acoustic">Acoustic Sunset</option>
                        <option value="upbeat">Upbeat Party</option>
                     </select>
                  </div>
               </div>
            </div>
 
            {/* White Label Section */}
            <div className="card space-y-6 bg-bg">
               <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
                  <div className="flex items-center gap-2 text-text-primary font-semibold">
                     <Globe size={18} /> White Label & Branding
                  </div>
                  {!isWhiteLabel && <UpgradeBadge href={`/pricing?eventId=${id}`} label="Upgrade to Partner" />}
               </div>
 
               <div className="grid gap-6">
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
            </div>
 
            {error && (
              <div className="p-3 rounded-md bg-error/10 border border-error/20 flex items-center gap-2 text-error text-sm font-medium">
                 <AlertTriangle size={16} /> {error}
              </div>
            )}
 
            <div className="pt-4 flex gap-4">
               <button type="submit" disabled={saving} className="btn btn-primary flex-1 btn-lg">
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-border border-t-bg rounded-full animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      <span>Save Changes</span>
                    </>
                  )}
               </button>
               <Link href="/dashboard" className="btn btn-secondary btn-lg">
                 Cancel
               </Link>
            </div>
         </form>
      </main>
    </div>
  );
}
 
function UpgradeBadge({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-bg-subtle border border-border text-text-secondary hover:text-text-primary transition-colors">
      <Sparkles size={10} /> {label}
    </Link>
  );
}