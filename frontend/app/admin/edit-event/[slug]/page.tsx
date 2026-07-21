"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import AnimatedLogo from '@/components/AnimatedLogo';

interface Event {
  id: string;
  name: string;
  slug: string;
  theme_primary_color: string | null;
  theme_secondary_color: string | null;
  enable_safety_filter: boolean;
  expires_at: string | null;
  enable_ai_album: boolean;
  enable_smart_privacy: boolean;
  watermark_url: string | null;
  google_drive_sync_enabled: boolean;
  plan_type: string;
  custom_domain: string | null;
  brand_logo_url: string | null;
}

export default function EditEventPage() {
  const { user, isLoading } = useAuth();
  const params = useParams();
  const slug = params.slug as string;
  const router = useRouter();

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [name, setName] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#f59e0b');
  const [secondaryColor, setSecondaryColor] = useState('#f472b6');
  const [enableSafetyFilter, setEnableSafetyFilter] = useState(false);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [enableAiAlbum, setEnableAiAlbum] = useState(false);
  const [enableSmartPrivacy, setEnableSmartPrivacy] = useState(false);
  const [watermarkFile, setWatermarkFile] = useState<File | null>(null);
  const [watermarkPreview, setWatermarkPreview] = useState<string | null>(null);
  const [googleDriveSync, setGoogleDriveSync] = useState(false);
  const [customDomain, setCustomDomain] = useState('');
  const [logoUrl, setLogoUrl] = useState('');

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.push('/system');
      return;
    }
    const isAdminUser = user.user_metadata?.role === 'admin' || user.email === 'sagarfalcon@gmail.com';
    if (!isAdminUser) {
      router.push('/system');
    } else {
      setIsAdmin(true);
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (!isAdmin || !slug) return;

    const fetchEvent = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error || !data) {
        console.error('Error fetching event');
        router.push('/admin');
      } else {
        setEvent(data);
        setName(data.name);
        setPrimaryColor(data.theme_primary_color || '#f59e0b');
        setSecondaryColor(data.theme_secondary_color || '#f472b6');
        setEnableSafetyFilter(data.enable_safety_filter || false);
        setExpiresAt(data.expires_at ? new Date(data.expires_at).toISOString().substring(0, 16) : null);
        setEnableAiAlbum(data.enable_ai_album || false);
        setEnableSmartPrivacy(data.enable_smart_privacy || false);
        setWatermarkPreview(data.watermark_url || null);
        setGoogleDriveSync(data.google_drive_sync_enabled || false);
        setCustomDomain(data.custom_domain || '');
        setLogoUrl(data.brand_logo_url || '');
      }
      setLoading(false);
    };

    fetchEvent();
  }, [isAdmin, slug, router]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event) return;

    let watermarkUrl = event.watermark_url;
    if (watermarkFile) {
      const filePath = `watermarks/${event.id}`;
      const { error: uploadError } = await supabase.storage.from('photos').upload(filePath, watermarkFile, { upsert: true });
      if (uploadError) {
        alert('Failed to upload watermark: ' + uploadError.message);
        return;
      }
      watermarkUrl = supabase.storage.from('photos').getPublicUrl(filePath).data.publicUrl;
    }

    const { error } = await supabase
      .from('events')
      .update({
        name,
        theme_primary_color: primaryColor,
        theme_secondary_color: secondaryColor,
        enable_safety_filter: enableSafetyFilter,
        expires_at: expiresAt,
        enable_ai_album: enableAiAlbum,
        enable_smart_privacy: enableSmartPrivacy,
        watermark_url: watermarkUrl,
        google_drive_sync_enabled: googleDriveSync,
        custom_domain: event.plan_type === 'WHITE_LABEL' ? customDomain : null,
        brand_logo_url: event.plan_type === 'WHITE_LABEL' ? logoUrl : null,
      })
      .eq('id', event.id);

    if (error) {
      alert('Failed to update event: ' + error.message);
    } else {
      alert('Event updated successfully!');
      router.push('/admin?tab=events');
    }
  };

  if (loading || isLoading || !isAdmin) {
    return (
      <div className="lp min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="lp min-h-screen text-white relative overflow-hidden flex flex-col pt-24 pb-12 px-4">
      <div className="aurora-bg fixed inset-0 z-0" />
      <div className="grain fixed inset-0 z-1 opacity-[0.04] pointer-events-none" />

      <div className="relative z-10 max-w-2xl w-full mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link href="/admin?tab=events" className="btn-outline">
            ← Back to Events
          </Link>
          <AnimatedLogo width={140} height={45} />
        </div>

        <div className="gcard cinematic-glow shadow-2xl">
          <div className="gcard-border" />
          <div className="gcard-inner p-8 lg:p-12">
            <h1 className="text-3xl font-black mb-8 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              Edit Event: {event?.name}
            </h1>
            
            <form onSubmit={handleUpdate} className="space-y-8">
              <div>
                <label className="block text-xs font-bold mb-3 uppercase tracking-widest text-slate-500">Event Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} 
                  className="w-full px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/40 transition-all" />
              </div>
              {/* Branding - White Label Only */}
              <div className={`p-6 rounded-2xl transition-all duration-300 ${event?.plan_type === 'WHITE_LABEL' ? 'bg-white/5 border border-white/10' : 'bg-white/[0.02] border border-dashed border-white/5 opacity-40 grayscale pointer-events-none'}`}>
                <div className="flex items-center justify-between mb-6">
                  <label className="text-xs font-black uppercase tracking-[0.2em] text-amber-500">🎨 Custom Branding</label>
                  {event?.plan_type !== 'WHITE_LABEL' && <span className="text-[10px] font-black uppercase tracking-widest bg-amber-500/10 text-amber-500 px-3 py-1 rounded-full border border-amber-500/20">Upgrade Required</span>}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-bold mb-3 uppercase tracking-widest text-slate-500">Primary Color</label>
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/10">
                      <input type="color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-none" disabled={event?.plan_type !== 'WHITE_LABEL'} />
                      <span className="text-xs font-mono font-bold tracking-widest">{primaryColor.toUpperCase()}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold mb-3 uppercase tracking-widest text-slate-500">Secondary Color</label>
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/10">
                      <input type="color" value={secondaryColor} onChange={e => setSecondaryColor(e.target.value)} className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-none" disabled={event?.plan_type !== 'WHITE_LABEL'} />
                      <span className="text-xs font-mono font-bold tracking-widest">{secondaryColor.toUpperCase()}</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
                  <div>
                    <label className="block text-[10px] font-bold mb-3 uppercase tracking-widest text-slate-500">Custom Domain</label>
                    <input type="text" value={customDomain} disabled={event?.plan_type !== 'WHITE_LABEL'} onChange={e => setCustomDomain(e.target.value)} placeholder="gallery.client.com" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none transition-all text-sm" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold mb-3 uppercase tracking-widest text-slate-500">Brand Logo URL</label>
                    <input type="text" value={logoUrl} disabled={event?.plan_type !== 'WHITE_LABEL'} onChange={e => setLogoUrl(e.target.value)} placeholder="https://domain.com/logo.png" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none transition-all text-sm" />
                  </div>
                </div>
              </div>

              <div className={`p-6 rounded-2xl transition-all duration-300 ${event?.plan_type === 'WHITE_LABEL' ? 'bg-white/5 border border-white/10' : 'bg-white/[0.02] border border-dashed border-white/5 opacity-40 grayscale pointer-events-none'}`}>
                <div className="flex items-center justify-between mb-6">
                  <label className="text-xs font-black uppercase tracking-[0.2em] text-rose-500">💧 Custom Watermark</label>
                  {event?.plan_type !== 'WHITE_LABEL' && <span className="text-[10px] font-black uppercase tracking-widest bg-rose-500/10 text-rose-500 px-3 py-1 rounded-full border border-rose-500/20">Locked</span>}
                </div>
                <input type="file" accept="image/png, image/jpeg" onChange={(e) => setWatermarkFile(e.target.files?.[0] || null)} className="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-amber-500/10 file:text-amber-500 hover:file:bg-amber-500/20 cursor-pointer transition-all" disabled={event?.plan_type !== 'WHITE_LABEL'} />
                {watermarkPreview && <img src={watermarkPreview} alt="Watermark preview" className="w-32 h-32 object-contain mt-6 mx-auto rounded-xl bg-black/40 p-4 border border-white/5 shadow-inner" />}
              </div>
              <div>
                <label className="flex items-center justify-between px-6 py-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/[0.08] transition-all cursor-pointer">
                  <div>
                    <span className="font-bold text-sm block mb-1">🛡️ Automatic Safety Filter</span>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Pro Edition Protection</p>
                  </div>
                  <div onClick={() => setEnableSafetyFilter(!enableSafetyFilter)} className={`w-14 h-7 rounded-full flex items-center transition-all duration-300 ${enableSafetyFilter ? 'bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.4)]' : 'bg-slate-700'}`}>
                    <span className={`w-5 h-5 bg-white rounded-full mx-1 transition-all duration-300 transform ${enableSafetyFilter ? 'translate-x-7' : 'translate-x-0'}`} />
                  </div>
                </label>
              </div>
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                <label className="block text-xs font-bold mb-3 uppercase tracking-[0.2em] text-cyan-400">📅 Wall Active Until</label>
                <input type="datetime-local" value={expiresAt || ''} onChange={e => setExpiresAt(e.target.value)} 
                  className="w-full px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-500/40 transition-all font-mono text-sm" />
                <p className="text-[10px] mt-4 text-slate-400 leading-relaxed font-medium">Determines when the live wall stops accepting new guest uploads. Photos are safely retained for your plan's full storage duration.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="flex items-center justify-between px-5 py-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/[0.08] transition-all cursor-pointer">
                  <span className="font-bold text-xs uppercase tracking-widest">🤖 AI Album</span>
                  <div onClick={() => setEnableAiAlbum(!enableAiAlbum)} className={`w-10 h-5 rounded-full flex items-center transition-all ${enableAiAlbum ? 'bg-emerald-500' : 'bg-slate-700'}`}>
                    <span className={`w-3.5 h-3.5 bg-white rounded-full mx-1 transition-all transform ${enableAiAlbum ? 'translate-x-4.5' : 'translate-x-0'}`} />
                  </div>
                </label>
                <label className="flex items-center justify-between px-5 py-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/[0.08] transition-all cursor-pointer">
                  <span className="font-bold text-xs uppercase tracking-widest">🔒 Privacy</span>
                  <div onClick={() => setEnableSmartPrivacy(!enableSmartPrivacy)} className={`w-10 h-5 rounded-full flex items-center transition-all ${enableSmartPrivacy ? 'bg-emerald-500' : 'bg-slate-700'}`}>
                    <span className={`w-3.5 h-3.5 bg-white rounded-full mx-1 transition-all transform ${enableSmartPrivacy ? 'translate-x-4.5' : 'translate-x-0'}`} />
                  </div>
                </label>
                <label className="flex items-center justify-between px-5 py-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/[0.08] transition-all cursor-pointer col-span-1 sm:col-span-2">
                  <span className="font-bold text-xs uppercase tracking-widest">☁️ Google Drive Sync</span>
                  <div onClick={() => setGoogleDriveSync(!googleDriveSync)} className={`w-10 h-5 rounded-full flex items-center transition-all ${googleDriveSync ? 'bg-indigo-500' : 'bg-slate-700'}`}>
                    <span className={`w-3.5 h-3.5 bg-white rounded-full mx-1 transition-all transform ${googleDriveSync ? 'translate-x-4.5' : 'translate-x-0'}`} />
                  </div>
                </label>
              </div>

              <div className="pt-6">
                <button type="submit" className="btn-glow w-full py-4 font-black uppercase tracking-[0.2em] shadow-amber-500/20">
                  Save Event Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
