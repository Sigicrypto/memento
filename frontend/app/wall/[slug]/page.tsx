"use client";
 
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import Image from 'next/image';
import { QRCodeSVG } from 'qrcode.react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import Webcam from 'react-webcam';
import { extractFaceDescriptorRobust, MATCH_THRESHOLD } from '@/lib/faceEngine';
import { useAuth } from '@/hooks/useAuth';
import { hasFeature } from '@/lib/permissions';
import { Layout, Camera, Shield, Search, Download, Trash2, X, Play, Pause, Heart, Clock, ExternalLink, Sparkles, User, Settings, ArrowLeft, Maximize2, Music } from 'lucide-react';
 
// ── NEW PHOTO REVEAL ────────────────────────────────────────
 
interface Photo {
  id: string;
  storage_path: string;
  uploader_name: string;
  created_at: string;
  caption?: string;
  event_id: string;
  media_type?: 'image' | 'video';
  reaction_count?: number;
  approved?: boolean;
  is_best_shot?: boolean;
  watermark_url?: string;
  face_descriptor?: number[];
}
 
interface NewPhotoRevealProps {
  photo: Photo | null;
  getPublicUrl: (path: string) => string;
  onDone: () => void;
}
 
const NewPhotoReveal = ({ photo, getPublicUrl, onDone }: NewPhotoRevealProps) => {
  const [exiting, setExiting] = useState(false);
 
  useEffect(() => {
    if (!photo) return;
    const timer = setTimeout(() => {
      setExiting(true);
      setTimeout(onDone, 800);
    }, 5500);
    return () => clearTimeout(timer);
  }, [photo, onDone]);
 
  if (!photo) return null;
 
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: exiting ? 0 : 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      className="fixed inset-0 z-[500] /95 backdrop-blur-3xl flex flex-col items-center justify-center p-8"
    >
      <div className="grain" />
      <div className="orbs"><div className="orb orb-primary" /><div className="orb orb-secondary" /></div>
 
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-10 relative z-10"
      >
        <Sparkles size={12} /> New Memory Just Arrived
      </motion.div>
 
      <motion.div
        initial={{ y: 40, opacity: 0, scale: 0.9 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative max-w-2xl w-full group overflow-hidden rounded-[2rem] border border-black/10 dark:border-black/20 dark:border-black/10 dark:border-white/10"
      >
        <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full opacity-50 pointer-events-none" />
        {photo.media_type === 'video'
          ? <video src={getPublicUrl(photo.storage_path)} className="w-full relative z-10 block object-contain max-h-[60vh] mx-auto" autoPlay loop muted />
          : <div className="relative w-full aspect-video"><Image src={getPublicUrl(photo.storage_path)} fill className="relative z-10 object-contain" alt="" priority /></div>
        }
      </motion.div>
 
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        className="mt-12 text-center relative z-10"
      >
        <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2">SHARED BY</p>
        <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
          {photo.uploader_name}
        </h2>
        {photo.caption && (
          <p className="text-xl text-text-secondary italic max-w-lg mx-auto leading-relaxed">
            &quot;{photo.caption}&quot;
          </p>
        )}
      </motion.div>
 
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        onClick={() => { setExiting(true); setTimeout(onDone, 800); }}
        className="absolute top-10 right-10 w-12 h-12 rounded-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-black/20 dark:border-black/10 dark:border-white/10 flex items-center justify-center text-text-muted hover:text-black dark:hover:text-black dark:text-white transition-all hover:scale-110 active:scale-95"
      >
        <X size={20} />
      </motion.button>
    </motion.div>
  );
};
 
const Confetti = ({ trigger }: { trigger: boolean }) => {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; color: string; size: number }>>([]);
  useEffect(() => {
    if (!trigger) return;
    const palette = ['#6366f1', '#06b6d4', '#ec4899', '#f59e0b', '#10b981'];
    setParticles(Array.from({ length: 50 }, (_, i) => ({
      id: Date.now() + i,
      x: Math.random() * 100,
      color: palette[Math.floor(Math.random() * palette.length)],
      size: Math.random() * 8 + 4,
    })));
    setTimeout(() => setParticles([]), 3000);
  }, [trigger]);
 
  if (!particles.length) return null;
  return (
    <div className="fixed inset-0 pointer-events-none z-[600]">
      {particles.map((p, i) => (
        <div key={p.id} style={{
          position: 'absolute', left: `${p.x}%`, top: '-20px',
          width: p.size, height: p.size,
          background: p.color, borderRadius: Math.random() > 0.5 ? '50%' : '2px',
          animation: `fall ${2.5 + Math.random()}s ease-out ${i * 0.02}s forwards`,
        }} />
      ))}
      <style>{`@keyframes fall { to { transform: translateY(110vh) rotate(360deg); opacity: 0; } }`}</style>
    </div>
  );
};
 
type ViewMode = 'grid' | 'polaroid' | 'slideshow' | 'album';
 
export default function WallPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { user } = useAuth();
 
  const [eventName, setEventName] = useState('');
  const [eventId, setEventId] = useState<string | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [planTier, setPlanTier] = useState<string>('STARTER');
  const [isAdmin, setIsAdmin] = useState(false);
  const [ownerId, setOwnerId] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [eventExpired, setEventExpired] = useState(false);
  const [loading, setLoading] = useState(true);
  const [brandLogoUrl, setBrandLogoUrl] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('polaroid');
  const [prevViewMode, setPrevViewMode] = useState<ViewMode>('polaroid');
  const [realtimeStatus, setRealtimeStatus] = useState<string>('connecting');
  const [confettiTrigger, setConfettiTrigger] = useState(false);
  const [showBestShots, setShowBestShots] = useState(false);
  const [revealPhoto, setRevealPhoto] = useState<Photo | null>(null);
  const [matchedPhotoIds, setMatchedPhotoIds] = useState<string[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showSelfieCam, setShowSelfieCam] = useState(false);
  const [musicTrack, setMusicTrack] = useState<string | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);
  const webcamRef = useRef<Webcam>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
 
  const uploadUrl = typeof window !== 'undefined' ? `${window.location.origin}/mobile/${slug}` : '';
  const displayedPhotos = (() => {
    let filtered = showBestShots ? photos.filter(p => p.is_best_shot) : photos;
    if (matchedPhotoIds !== null) {
      filtered = filtered.filter(p => matchedPhotoIds.includes(p.id));
    }
    return filtered;
  })();
 
  const getPublicUrl = useCallback((path: string) => {
    const { data } = supabase.storage.from('photos').getPublicUrl(path);
    return data.publicUrl;
  }, []);
 
  const startPolling = useCallback(() => {
    setRealtimeStatus('polling');
    const interval = setInterval(async () => {
      if (!eventId) return;
      const { data } = await supabase.rpc('get_photos_with_reactions', { event_uuid: eventId });
      if (data) setPhotos(data);
    }, 5000);
    return () => clearInterval(interval);
  }, [eventId]);
 
  useEffect(() => {
    const fetchEvent = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('events').select('*').eq('slug', slug).single();
      if (error || !data) { setNotFound(true); setLoading(false); return; }
      setEventName(data.name);
      setEventId(data.id);
      setOwnerId(data.owner_id);
      setIsAdmin(user?.id === data.owner_id);
      setPlanTier((data.plan_type || 'STARTER').toUpperCase());
      setBrandLogoUrl(data.brand_logo_url || null);
      if (data.expires_at && new Date(data.expires_at) < new Date()) setEventExpired(true);
      if (data.music_track && data.music_track !== 'none') setMusicTrack(data.music_track);
      setLoading(false);
    };
    fetchEvent();
  }, [slug, user]);
 
  useEffect(() => {
    if (!eventId) return;
    const fetchPhotos = async () => {
      const { data } = await supabase.rpc('get_photos_with_reactions', { event_uuid: eventId });
      if (data) setPhotos(data);
    };
    fetchPhotos();
 
    const channel = supabase.channel(`wall-${eventId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'photos', filter: `event_id=eq.${eventId}` }, (payload) => {
        const newPhoto = payload.new as Photo;
        const oldPhoto = payload.old as Photo;
        if (payload.eventType === 'INSERT' && newPhoto.approved) {
          setPhotos(p => [newPhoto, ...p]);
          setConfettiTrigger(true); setRevealPhoto(newPhoto);
          setTimeout(() => setConfettiTrigger(false), 3000);
        } else if (payload.eventType === 'UPDATE') {
          if (!oldPhoto?.approved && newPhoto.approved) {
            setPhotos(p => [newPhoto, ...p.filter(x => x.id !== newPhoto.id)]);
            setConfettiTrigger(true); setRevealPhoto(newPhoto);
            setTimeout(() => setConfettiTrigger(false), 3000);
          } else if (oldPhoto?.approved && !newPhoto.approved) {
            setPhotos(p => p.filter(x => x.id !== newPhoto.id));
          }
        } else if (payload.eventType === 'DELETE') {
          setPhotos(p => p.filter(x => x.id !== oldPhoto.id));
        }
      })
      .subscribe((status) => {
        setRealtimeStatus(status);
        if (status !== 'SUBSCRIBED') startPolling();
      });
    return () => { supabase.removeChannel(channel); };
  }, [eventId, startPolling]);
 
  useEffect(() => {
    if (viewMode === 'slideshow' && displayedPhotos.length > 0) {
      if (displayedPhotos[slideIndex]?.media_type === 'video') return;
      const timer = setTimeout(() => setSlideIndex(prev => (prev + 1) % displayedPhotos.length), 6000);
      return () => clearTimeout(timer);
    }
  }, [viewMode, slideIndex, displayedPhotos.length]);
 
  const captureSelfieAndSearch = async () => {
    if (!webcamRef.current) return;
    const screenshot = webcamRef.current.getScreenshot();
    if (!screenshot) return;
    setIsSearching(true);
    try {
      const img = new window.Image(); img.src = screenshot;
      await new Promise(r => img.onload = r);
      const descriptor = await extractFaceDescriptorRobust(img, 'ssd');
      if (!descriptor) { alert("Couldn't see your face clearly. Please try again!"); return; }
      const { data, error } = await supabase.rpc('match_photo_faces', {
        query_embedding: Array.from(descriptor), match_threshold: MATCH_THRESHOLD, match_count: 50, target_event_id: eventId
      });
      if (error) throw error;
      const ids = Array.from(new Set((data || []).map((d: any) => d.photo_id))) as string[];
      setMatchedPhotoIds(ids);
      setShowSelfieCam(false);
      if (ids.length === 0) alert("No matches found yet.");
    } catch (err) { alert("Search failed."); } finally { setIsSearching(false); }
  };
 
  const handleDownloadZip = async () => {
    const photosToDownload = isAdmin ? displayedPhotos : displayedPhotos.filter(p => matchedPhotoIds?.includes(p.id));
    if (photosToDownload.length === 0) { alert("No photos to download."); return; }
    const zip = new JSZip(); const folder = zip.folder(`${slug}-memento`);
    for (const p of photosToDownload) {
      try { const blob = await (await fetch(getPublicUrl(p.storage_path))).blob(); folder?.file(`${p.uploader_name}-${p.id.slice(0, 4)}.jpg`, blob); }
      catch (e) { console.error(e); }
    }
    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, `${slug}-memento.zip`);
  };

  const handleReaction = async (photoId: string) => {
    if (!hasFeature(planTier, 'LIVE_REACTIONS')) return;
    
    // Optimistic update
    setPhotos(prev => prev.map(p => p.id === photoId ? { ...p, reaction_count: (p.reaction_count || 0) + 1 } : p));
    
    // Insert into DB
    const guestId = localStorage.getItem('memento_guest_id') || Math.random().toString(36).substring(2);
    localStorage.setItem('memento_guest_id', guestId);
    
    await supabase.from('reactions').insert({
      photo_id: photoId,
      guest_id: guestId
    });
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <div className="orbs"><div className="orb orb-primary" /><div className="orb orb-secondary" /></div>
      <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin relative z-10" />
    </div>
  );
 
  if (notFound || eventExpired) return (
    <div className="min-h-screen flex items-center justify-center p-6 text-center relative overflow-hidden">
      <div className="orbs"><div className="orb orb-primary" /><div className="orb orb-secondary" /></div>
      <div className="glass-panel p-12 max-w-md relative z-10">
        <div className="text-6xl mb-6">{notFound ? '✨' : '📅'}</div>
        <h1 className="text-3xl font-bold mb-4">{notFound ? 'Wall Not Found' : 'Event Concluded'}</h1>
        <p className="text-text-secondary mb-8">{notFound ? "This memory lane hasn't been created yet." : "This photo wall has reached its destination."}</p>
        <Link href="/" className="btn-premium px-10 py-4 inline-block">Go Home</Link>
      </div>
    </div>
  );
 
  if (viewMode === 'slideshow') {
    const current = displayedPhotos[slideIndex];
    return (
      <div className="fixed inset-0 z-[1000] overflow-hidden flex flex-col">
        <div className="grain" />
        <div className="orbs"><div className="orb orb-primary opacity-20" /><div className="orb orb-secondary opacity-20" /></div>
        
        {/* Slideshow Header */}
        <div className="absolute top-0 left-0 right-0 p-10 flex justify-between items-center z-50 bg-gradient-to-b from-black/80 to-transparent">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <Layout size={24} />
             </div>
             <div>
                <p className="text-[10px] font-black uppercase tracking-[.3em] text-primary">LIVE EXPERIENCE</p>
                <h1 className="text-2xl font-bold">{eventName}</h1>
             </div>
          </div>
          {hasFeature(planTier, 'SLIDESHOW_MODE') && (
             <button onClick={() => setViewMode(prevViewMode)} className="px-6 py-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-black/20 dark:border-black/10 dark:border-white/10 hover:bg-black/10 dark:bg-white/10 transition-all font-bold text-xs">
               EXIT SLIDESHOW
             </button>
          )}
        </div>
 
        <div className="flex-grow relative flex items-center justify-center p-20">
          <AnimatePresence mode="wait">
            {current && (
              <motion.div key={current.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }} transition={{ duration: 1 }} className="relative z-10 w-full h-full flex items-center justify-center">
                <div className="absolute inset-0 bg-primary/10 blur-[150px] rounded-full opacity-30" />
                
                <div className="flex flex-col lg:flex-row gap-16 items-center w-full max-w-7xl">
                   {/* QR Section */}
                   <div className="hidden lg:flex flex-col items-center gap-6 glass-panel p-8 /40 border-black/5 dark:border-black/20 dark:border-black/10 dark:border-white/5 order-2 lg:order-1">
                      <div className="p-4 bg-white rounded-2xl shadow-2xl">
                         <QRCodeSVG value={uploadUrl} size={160} />
                      </div>
                      <div className="text-center">
                         <p className="text-[10px] font-black uppercase tracking-[.2em] mb-1">SCAN TO UPLOAD</p>
                         <p className="text-xs text-text-secondary italic">Join the Memory Wall</p>
                      </div>
                   </div>
 
                   {/* Media Content */}
                   <div className="flex-grow relative order-1 lg:order-2">
                     <div className="relative z-10 rounded-[2.5rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)] border border-black/10 dark:border-black/20 dark:border-black/10 dark:border-white/10">
                        {current.media_type === 'video'
                          ? <video src={getPublicUrl(current.storage_path)} className="max-h-[70vh] w-full block object-contain" autoPlay muted onEnded={() => setSlideIndex(p => (p + 1) % displayedPhotos.length)} />
                          : <div className="relative w-full aspect-video max-h-[70vh]"><Image src={getPublicUrl(current.storage_path)} fill className="object-contain" alt="" /></div>
                        }
                     </div>
 
                     {/* Info Overlay */}
                     <div className="mt-8 lg:mt-12 space-y-4">
                        <div className="flex items-center justify-between">
                           <div>
                              <p className="text-[10px] font-black uppercase tracking-[.2em] text-primary mb-1">MEMORABLE MOMENT BY</p>
                              <h2 className="text-5xl font-bold tracking-tight">{current.uploader_name}</h2>
                           </div>
                           <div className="flex gap-4">
                              {hasFeature(planTier, 'LIVE_REACTIONS') && (
                                 <div className="px-5 py-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-black/20 dark:border-black/10 dark:border-white/10 flex items-center gap-2 text-sm font-bold">
                                    <Heart size={16} className="text-pink-500 fill-pink-500" /> {current.reaction_count || 0}
                                 </div>
                              )}
                              <div className="px-5 py-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-black/20 dark:border-black/10 dark:border-white/10 flex items-center gap-2 text-sm font-bold">
                                 <Clock size={16} className="text-text-muted" /> {new Date(current.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                           </div>
                        </div>
                        {current.caption && (
                          <p className="text-2xl text-text-secondary italic leading-relaxed">&quot;{current.caption}&quot;</p>
                        )}
                     </div>
                   </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }
 
  return (
    <div className="min-h-screen relative overflow-x-hidden flex flex-col">
      <div className="grain" />
      <div className="orbs"><div className="orb orb-primary" /><div className="orb orb-secondary" /></div>
 
      {musicTrack && isAudioPlaying && <audio ref={audioRef} autoPlay loop src={`/music/${musicTrack}.mp3`} />}
 
      {revealPhoto && <NewPhotoReveal photo={revealPhoto} getPublicUrl={getPublicUrl} onDone={() => setRevealPhoto(null)} />}
 
      {/* Header */}
      <nav className="fixed top-0 left-0 right-0 z-[100] h-24 border-b border-black/5 dark:border-black/20 dark:border-black/10 dark:border-white/5 backdrop-blur-xl px-8 flex items-center justify-between">
         <div className="flex items-center gap-6">
            {(hasFeature(planTier, 'BRANDING_REMOVAL') && brandLogoUrl) ? (
               <img src={brandLogoUrl} alt="Event Logo" className="h-8 object-contain" />
            ) : (
               <Link href="/" className="text-2xl font-bold tracking-tighter">memento</Link>
            )}
            <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-black uppercase tracking-widest text-primary">
               <div className={`w-1.5 h-1.5 rounded-full ${realtimeStatus === 'SUBSCRIBED' ? 'bg-green-500' : 'bg-primary'} animate-pulse`} />
               {realtimeStatus === 'SUBSCRIBED' ? 'Live Stream Active' : 'Polling Updates'}
            </div>
         </div>
 
         <div className="flex items-center gap-4">
            {isAdmin ? (
               <Link href="/dashboard" className="hidden md:flex items-center gap-2 px-5 py-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-black/20 dark:border-black/10 dark:border-white/10 text-xs font-bold hover:bg-black/10 dark:bg-white/10 transition-all">
                  <Settings size={14} /> Dashboard
               </Link>
            ) : hasFeature(planTier, 'SLIDESHOW_MODE') ? (
               <button onClick={() => setViewMode('slideshow')} className="hidden md:flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary/10 border border-primary/20 text-xs font-bold text-primary hover:bg-primary/20 transition-all">
                  <Play size={14} /> Play Experience
               </button>
            ) : null}
            <Link href={uploadUrl} className="btn-premium px-6 py-2.5 text-xs">Join Wall</Link>
         </div>
      </nav>
 
      <main className="relative z-10 pt-40 px-8 pb-32 max-w-[1600px] mx-auto w-full flex-grow">
         {/* Wall Hero */}
         <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 mb-20">
            <div className="max-w-3xl">
               <p className="text-primary text-[10px] font-black uppercase tracking-[.4em] mb-4">THE OFFICIAL COLLECTION</p>
               <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 leading-[1.1]">{eventName}</h1>
               <div className="flex flex-wrap items-center gap-4">
                  {hasFeature(planTier, 'SELFIE_MATCH') && (
                     <button onClick={() => setShowSelfieCam(true)} className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-black/20 dark:border-black/10 dark:border-white/10 text-sm font-bold hover:bg-black/10 dark:bg-white/10 transition-all hover:scale-105 active:scale-95 group">
                        <Search size={18} className="text-primary group-hover:rotate-12 transition-transform" /> Find My Photos
                     </button>
                  )}
                  {hasFeature(planTier, 'SLIDESHOW_MODE') && (
                     <button onClick={() => { setPrevViewMode(viewMode); setViewMode('slideshow'); }} className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-secondary/10 border border-secondary/20 text-sm font-bold text-secondary hover:bg-secondary/20 transition-all hover:scale-105 active:scale-95 group">
                        <Maximize2 size={18} className="group-hover:scale-110 transition-transform" /> Slideshow Mode
                     </button>
                  )}
               </div>
            </div>
 
            <div className="flex flex-col items-end gap-6">
               <div className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-black/20 dark:border-black/10 dark:border-white/10 p-1.5 rounded-2xl flex items-center gap-1 backdrop-blur-3xl">
                  {(['grid', 'polaroid', 'album'] as ViewMode[]).map(m => (
                    <button key={m} onClick={() => setViewMode(m)} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === m ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'text-text-muted hover:text-white hover:bg-black/5 dark:bg-white/5'}`}>
                       {m}
                    </button>
                  ))}
               </div>
               
               {isAdmin && (
                  <div className="flex gap-3">
                     <Link href={`/moderate/${slug}`} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-500/20 transition-all">
                        <Shield size={14} /> Moderate Content
                     </Link>
                     <button onClick={handleDownloadZip} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-500/10 border border-green-500/20 text-[10px] font-black uppercase tracking-widest text-green-500 hover:bg-green-500/20 transition-all">
                        <Download size={14} /> Download ZIP
                     </button>
                  </div>
               )}
            </div>
         </div>
 
         {/* Filters */}
         <div className="flex items-center justify-between mb-12 border-b border-black/5 dark:border-black/20 dark:border-black/10 dark:border-white/5 pb-8">
            <button onClick={() => setShowBestShots(!showBestShots)} className={`flex items-center gap-3 px-6 py-3 rounded-2xl border transition-all font-bold text-xs ${showBestShots ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' : 'bg-black/5 dark:bg-white/5 border-black/10 dark:border-black/20 dark:border-black/10 dark:border-white/10 text-text-muted hover:border-black/20 dark:border-black/20 dark:border-black/10 dark:border-white/20'}`}>
               <Sparkles size={16} /> {showBestShots ? 'Curated Selection Active' : 'Show Only Best Shots'}
            </button>
 
            <AnimatePresence>
               {matchedPhotoIds && (
                 <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="flex items-center gap-4">
                    <span className="text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary">Matched {matchedPhotoIds.length} Photos</span>
                    <button onClick={() => setMatchedPhotoIds(null)} className="text-[10px] font-black text-text-muted hover:text-black dark:hover:text-black dark:text-white uppercase transition-colors">Clear Filter ×</button>
                 </motion.div>
               )}
            </AnimatePresence>
         </div>
 
         {/* Main Grid */}
         <AnimatePresence mode="wait">
            {displayedPhotos.length === 0 ? (
               <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="py-40 text-center glass-panel">
                  <div className="text-6xl mb-6 opacity-20">📸</div>
                  <h2 className="text-3xl font-bold mb-3">No Memories shared yet</h2>
                  <p className="text-text-secondary mb-10 max-w-md mx-auto">Be the first to share a moment. Join the wall and upload your favorite shots!</p>
                  <Link href={uploadUrl} className="btn-premium px-10 py-4">Share First Memory</Link>
               </motion.div>
            ) : viewMode === 'grid' ? (
               <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {displayedPhotos.map((p, i) => (
                    <motion.div key={p.id} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: (i % 8) * 0.05 }} className="group relative aspect-[4/5] rounded-3xl overflow-hidden border border-black/5 dark:border-black/20 dark:border-black/10 dark:border-white/5 bg-black/5 dark:bg-white/5">
                       <Image src={getPublicUrl(p.storage_path)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw" loading="lazy" />
                       <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all p-6 flex flex-col justify-end">
                          <div className="flex justify-between items-start">
                             <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">BY {p.uploader_name}</p>
                             {hasFeature(planTier, 'LIVE_REACTIONS') && (
                                <button onClick={() => handleReaction(p.id)} className="/60 hover:text-pink-500 hover:scale-110 transition-all flex items-center gap-1 /40 px-2 py-1 rounded-full text-xs font-bold">
                                   <Heart size={14} className={p.reaction_count ? 'fill-pink-500 text-pink-500' : ''} /> {p.reaction_count || 0}
                                </button>
                             )}
                          </div>
                          {p.caption && <p className="text-sm italic line-clamp-2">&quot;{p.caption}&quot;</p>}
                       </div>
                    </motion.div>
                  ))}
               </motion.div>
            ) : viewMode === 'polaroid' ? (
               <motion.div key="polaroid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-wrap gap-12 justify-center py-10">
                  {displayedPhotos.map((p, i) => (
                    <motion.div key={p.id} initial={{ opacity: 0, y: 40, rotate: (i % 6 - 3) * 2 }} whileInView={{ opacity: 1, y: 0, rotate: (i % 6 - 3) * 0.5 }} viewport={{ once: true }} whileHover={{ scale: 1.05, rotate: 0, zIndex: 50 }} transition={{ duration: 0.6 }} className="bg-white p-3 pb-16 shadow-2xl relative rounded-sm group">
                       <div className="w-[280px] h-[300px] overflow-hidden bg-slate-100 relative">
                          {p.media_type === 'video' ? <video src={getPublicUrl(p.storage_path)} className="w-full h-full object-cover" muted playsInline /> : <Image src={getPublicUrl(p.storage_path)} className="object-cover" fill alt="" loading="lazy" />}
                       </div>
                       <div className="absolute inset-x-0 bottom-0 p-4 text-center">
                          <p className="text-[10px] font-black text-slate-600 dark:text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-1 flex items-center justify-center gap-2">MEMENTO BY <span className="text-primary">{p.uploader_name}</span>
                             {hasFeature(planTier, 'LIVE_REACTIONS') && (
                                <button onClick={() => handleReaction(p.id)} className="text-slate-600 dark:text-slate-600 dark:text-slate-400 hover:text-pink-500 hover:scale-110 transition-all flex items-center gap-1 px-1">
                                   <Heart size={12} className={p.reaction_count ? 'fill-pink-500 text-pink-500' : ''} /> {p.reaction_count || 0}
                                </button>
                             )}
                          </p>
                          {p.caption && <p className="text-[11px] text-slate-900 font-medium italic truncate px-4">&quot;{p.caption}&quot;</p>}
                       </div>
                    </motion.div>
                  ))}
               </motion.div>
            ) : (
               <motion.div key="album" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-24">
                  {(() => {
                    const groups: Record<string, Photo[]> = {};
                    displayedPhotos.forEach(p => { const k = new Date(p.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }); groups[k] = groups[k] || []; groups[k].push(p); });
                    return Object.entries(groups).map(([label, gPhotos]) => (
                      <div key={label}>
                        <div className="flex items-center gap-6 mb-10">
                           <h3 className="text-xs font-black text-text-muted tracking-[.3em] uppercase whitespace-nowrap">{label}</h3>
                           <div className="h-px w-full bg-black/5 dark:bg-white/5" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                           {gPhotos.map((p, i) => (
                             <motion.div key={p.id} className="relative aspect-[3/4] overflow-hidden rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-black/20 dark:border-black/10 dark:border-white/10">
                                <Image src={getPublicUrl(p.storage_path)} className="object-cover group-hover:scale-105 transition-all" alt="" fill sizes="200px" loading="lazy" />
                                <div className="absolute bottom-4 left-4 right-4 p-3 /60 backdrop-blur-md rounded-xl opacity-0 group-hover:opacity-100 transition-all">
                                   <p className="text-[9px] font-black text-primary tracking-widest uppercase">BY {p.uploader_name}</p>
                                </div>
                             </motion.div>
                           ))}
                        </div>
                      </div>
                    ));
                  })()}
               </motion.div>
            )}
         </AnimatePresence>
      </main>
 
      {/* Selfie Modal */}
      <AnimatePresence>
         {showSelfieCam && (
           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[1000] /95 backdrop-blur-3xl flex items-center justify-center p-6">
              <div className="glass-panel max-w-xl w-full p-10 text-center relative">
                 <button onClick={() => setShowSelfieCam(false)} className="absolute top-6 right-6 text-text-muted hover:text-black dark:hover:text-black dark:text-white transition-colors"><X size={24} /></button>
                 <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mx-auto mb-6"><User size={32} /></div>
                 <h2 className="text-3xl font-bold mb-3">Find My Photos</h2>
                 <p className="text-text-secondary mb-10">Our AI will scan the entire wall and find every moment you&apos;re in. Private and instant.</p>
                 
                 <div className="aspect-square w-full max-w-[320px] mx-auto overflow-hidden rounded-full border-4 border-primary/20 mb-10 relative">
                    <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg" className="w-full h-full object-cover" mirrored />
                    <div className="absolute inset-0 border-8 border-transparent border-t-primary animate-spin" style={{ animationDuration: '3s' }} />
                 </div>
                 
                 <button onClick={captureSelfieAndSearch} disabled={isSearching} className="btn-premium w-full py-5 flex items-center justify-center gap-3">
                    {isSearching ? <div className="w-5 h-5 border-2 border-black/20 dark:border-black/20 dark:border-black/10 dark:border-white/20 border-t-white rounded-full animate-spin" /> : <Camera size={20} />}
                    {isSearching ? 'Scanning Memories...' : 'Start Facial Match'}
                 </button>
              </div>
           </motion.div>
         )}
      </AnimatePresence>
 
      <Confetti trigger={confettiTrigger} />

      {/* Music Control */}
      {musicTrack && hasFeature(planTier, 'SLIDESHOW_MUSIC') && (
        <div className="fixed bottom-8 left-8 z-[100]">
          <div className="p-4 glass-panel border-black/10 dark:border-black/20 dark:border-black/10 dark:border-white/10 flex items-center gap-4">
            <button 
              onClick={() => {
                 setIsAudioPlaying(!isAudioPlaying);
                 if (audioRef.current) {
                    if (isAudioPlaying) audioRef.current.pause();
                    else audioRef.current.play();
                 }
              }}
              className="w-12 h-12 rounded-xl bg-black/5 dark:bg-white/5 flex items-center justify-center hover:bg-black/10 dark:bg-white/10 transition-colors"
            >
              {isAudioPlaying ? <Pause size={20} /> : <Play size={20} className="ml-1" />}
            </button>
            <div>
               <p className="text-[9px] font-black text-primary uppercase tracking-[.2em] mb-0.5 flex items-center gap-1">
                  <Music size={10} /> {isAudioPlaying ? 'NOW PLAYING' : 'PAUSED'}
               </p>
               <p className="text-xs font-bold capitalize">{musicTrack.replace('-', ' ')}</p>
            </div>
          </div>
        </div>
      )}
 
      {/* WhatsApp Message Me */}
      <div className="fixed bottom-8 right-8 z-[100] hidden lg:block">
         <Link href="https://wa.me/96896095692" target="_blank" className="p-4 glass-panel border-black/10 dark:border-black/20 dark:border-black/10 dark:border-white/10 hover:border-primary/50 transition-all flex items-center gap-4 group">
            <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500 group-hover:scale-110 transition-transform">
               <ExternalLink size={20} />
            </div>
            <div className="pr-4">
               <p className="text-[9px] font-black text-primary uppercase tracking-[.2em] mb-0.5">NEED HELP?</p>
               <p className="text-xs font-bold ">Chat on WhatsApp</p>
            </div>
         </Link>
      </div>
    </div>
  );
}
