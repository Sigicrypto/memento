"use client";
 
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Globe, Music, Palette, Lock, Link2, Star, Sparkles, Settings, Save, ExternalLink, Image as ImageIcon, Check, AlertTriangle } from 'lucide-react';
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
      <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
        <div className="orbs"><div className="orb orb-primary" /><div className="orb orb-secondary" /></div>
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin relative z-10" />
      </div>
    );
  }
 
  const isWhiteLabel = planType === 'WHITE_LABEL';
  const isPremiumPlus = ['PREMIUM', 'WHITE_LABEL'].includes(planType);
  const isStandardPlus = ['STANDARD', 'PREMIUM', 'WHITE_LABEL'].includes(planType);
 
  return (
    <div className="min-h-screen bg-black text-white relative overflow-x-hidden flex flex-col">
      <div className="grain" />
      <div className="orbs"><div className="orb orb-primary" /><div className="orb orb-secondary" /></div>
 
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-[100] h-20 border-b border-white/5 bg-black/70 backdrop-blur-2xl px-6 md:px-12 flex items-center justify-between">
         <div className="flex items-center gap-6">
            <Link href="/dashboard" className="flex items-center gap-2 text-text-muted hover:text-white transition-all font-bold text-xs uppercase tracking-widest group">
               <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Dashboard
            </Link>
            <div className="h-6 w-px bg-white/10 hidden md:block" />
            <Link href="/" className="hidden md:block">
              <AnimatedLogo width={140} height={40} />
            </Link>
         </div>
         <div className="flex items-center gap-3 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[9px] font-black uppercase tracking-widest text-primary">
            <Settings size={12} /> Event Settings
         </div>
      </nav>
 
      <main className="relative z-10 pt-32 px-8 pb-32 max-w-2xl mx-auto w-full">
         <div className="text-center mb-12">
            <p className="text-primary text-[10px] font-black uppercase tracking-[.3em] mb-4">MEMENTO DASHBOARD</p>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Edit Your Event</h1>
            <p className="text-text-secondary">Customize your wall experience and branding.</p>
         </div>
 
         <form onSubmit={handleUpdate} className="space-y-8">
            <div className="glass-panel p-8 md:p-10 space-y-8">
               {/* Basic Settings */}
               <div className="space-y-6">
                  <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                        <Star size={16} />
                     </div>
                     <h2 className="text-sm font-black uppercase tracking-widest">Base Identity</h2>
                  </div>
 
                  <div className="grid gap-6">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1">Event Name</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="My Grand Celebration" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-primary transition-all text-sm" />
                     </div>
 
                     <div className="space-y-2">
                        <div className="flex items-center justify-between ml-1">
                           <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">Custom Slug (URL)</label>
                           {!isStandardPlus && <UpgradeBadge href={`/pricing?eventId=${id}`} label="Upgrade" color="#06b6d4" />}
                        </div>
                        <div className="relative">
                           <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted text-sm font-medium">/wall/</div>
                           <input type="text" value={slug} disabled={!isStandardPlus} onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))} placeholder="your-event" className={`w-full bg-white/5 border border-white/10 rounded-xl pl-16 pr-4 py-3.5 text-white focus:outline-none ${isStandardPlus ? 'focus:border-primary' : 'opacity-40 cursor-not-allowed'} transition-all text-sm`} />
                        </div>
                     </div>
 
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1">Privacy Password</label>
                        <div className="relative">
                           <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Leave blank for public access" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-primary transition-all text-sm" />
                           <Lock size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted" />
                        </div>
                     </div>
                  </div>
               </div>
 
               <div className="h-px bg-white/5" />
 
               {/* Experience Settings */}
               <div className="space-y-6">
                  <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-lg bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-500">
                        <Palette size={16} />
                     </div>
                     <h2 className="text-sm font-black uppercase tracking-widest">Experience & Style</h2>
                  </div>
 
                  <div className="grid md:grid-cols-2 gap-6">
                     <div className="space-y-2">
                        <div className="flex items-center justify-between ml-1">
                           <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">Wall Theme</label>
                           {!isStandardPlus && <UpgradeBadge href={`/pricing?eventId=${id}`} label="Upgrade" color="#06b6d4" />}
                        </div>
                        <select value={theme} onChange={e => setTheme(e.target.value)} disabled={!isStandardPlus} className={`w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none ${isStandardPlus ? 'focus:border-primary' : 'opacity-40 cursor-not-allowed'} transition-all text-sm appearance-none`}>
                           <option value="light">Classic Light</option>
                           <option value="dark">Cinematic Dark</option>
                           <option value="dreamy">Dreamy Glassmorphism</option>
                        </select>
                     </div>
 
                     <div className="space-y-2">
                        <div className="flex items-center justify-between ml-1">
                           <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">Soundtrack</label>
                           {!isPremiumPlus && <UpgradeBadge href={`/pricing?eventId=${id}`} label="Upgrade" color="#ec4899" />}
                        </div>
                        <select value={musicTrack} onChange={e => setMusicTrack(e.target.value)} disabled={!isPremiumPlus} className={`w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none ${isPremiumPlus ? 'focus:border-primary' : 'opacity-40 cursor-not-allowed'} transition-all text-sm appearance-none`}>
                           <option value="none">No Music</option>
                           <option value="lofi">Lofi Chill</option>
                           <option value="acoustic">Acoustic Sunset</option>
                           <option value="upbeat">Upbeat Party</option>
                        </select>
                     </div>
                  </div>
               </div>
 
               {/* White Label Section */}
               <div className="rounded-[2rem] border border-secondary/20 bg-secondary/5 p-8 space-y-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-10">
                     <Sparkles size={120} />
                  </div>
                  
                  <div className="flex items-center justify-between relative z-10">
                     <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary">
                           <Globe size={16} />
                        </div>
                        <h2 className="text-sm font-black uppercase tracking-widest text-secondary">White Label & Branding</h2>
                     </div>
                     {!isWhiteLabel && <UpgradeBadge href={`/pricing?eventId=${id}`} label="Upgrade to Partner" color="#6366f1" />}
                  </div>
 
                  <div className="grid gap-6 relative z-10">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1">Custom Domain</label>
                        <input type="text" value={customDomain} disabled={!isWhiteLabel} onChange={e => setCustomDomain(e.target.value)} placeholder="gallery.yourevent.com" className={`w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none ${isWhiteLabel ? 'focus:border-secondary' : 'opacity-40 cursor-not-allowed'} transition-all text-sm`} />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1">Brand Logo URL</label>
                        <div className="relative">
                           <input type="text" value={logoUrl} disabled={!isWhiteLabel} onChange={e => setLogoUrl(e.target.value)} placeholder="https://domain.com/logo.png" className={`w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none ${isWhiteLabel ? 'focus:border-secondary' : 'opacity-40 cursor-not-allowed'} transition-all text-sm`} />
                           <ImageIcon size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted" />
                        </div>
                     </div>
                  </div>
               </div>
 
               {error && (
                 <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold flex items-center gap-3">
                    <AlertTriangle size={16} /> {error}
                 </div>
               )}
 
               <button type="submit" disabled={saving} className="btn-premium w-full !py-5 flex items-center justify-center gap-3 disabled:opacity-50 group">
                  {saving ? (
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Save size={18} className="group-hover:scale-110 transition-transform" />
                      <span>Save Changes ✦</span>
                    </>
                  )}
               </button>
            </div>
         </form>
 
         <div className="mt-12 text-center">
            <Link href="/" className="text-[10px] font-black text-text-muted hover:text-white uppercase tracking-widest transition-colors flex items-center justify-center gap-2">
               <ArrowLeft size={12} /> Discard & Exit
            </Link>
         </div>
      </main>
    </div>
  );
}
 
function UpgradeBadge({ href, label, color }: { href: string; label: string; color: string }) {
  return (
    <Link href={href} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95" style={{ background: `${color}15`, border: `1px solid ${color}30`, color }}>
      <Sparkles size={10} /> {label}
    </Link>
  );
}