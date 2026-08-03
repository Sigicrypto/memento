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
import { Layout, Camera, Shield, Search, Download, Trash2, X, Play, Pause, Heart, Clock, ExternalLink, Sparkles, User, Settings, ArrowLeft, Maximize2, Music, QrCode, Upload } from 'lucide-react';
import CircularGallery from '@/components/CircularGallery';
import AnimatedLogo from '@/components/AnimatedLogo';
 
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
        className="relative max-w-2xl w-full group overflow-hidden rounded-[2rem] border border-border"
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
        className="absolute top-10 right-10 w-12 h-12 rounded-full bg-bg-subtle border border-border flex items-center justify-center text-text-muted hover:text-black dark:hover:text-text-primary transition-all hover:scale-110 active:scale-95"
      >
        <X size={20} />
      </motion.button>
    </motion.div>
  );
};
 
const Confetti = ({ trigger }: { trigger: boolean }) => {
  useEffect(() => {
    if (!trigger) return;
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      import('canvas-confetti').then(({ default: confetti }) => {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#6366f1', '#06b6d4', '#ec4899', '#f59e0b', '#10b981'],
          zIndex: 600
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#6366f1', '#06b6d4', '#ec4899', '#f59e0b', '#10b981'],
          zIndex: 600
        });
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, [trigger]);
 
  return null;
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
  const [showMobileQR, setShowMobileQR] = useState(false);
  const webcamRef = useRef<Webcam>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
 
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
 
  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  }, []);
 
  const startPolling = useCallback(() => {
    if (pollingIntervalRef.current) return;
    setRealtimeStatus('polling');
    pollingIntervalRef.current = setInterval(async () => {
      if (!eventId) return;
      const { data } = await supabase.rpc('get_photos_with_reactions', { event_uuid: eventId });
      if (data) setPhotos(data);
    }, 5000);
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
        if (status === 'SUBSCRIBED') {
          stopPolling();
        } else {
          startPolling();
        }
      });
    return () => {
      stopPolling();
      supabase.removeChannel(channel);
    };
  }, [eventId, startPolling, stopPolling]);
 
  useEffect(() => {
    if (viewMode === 'slideshow' && displayedPhotos.length > 0) {
      if (displayedPhotos[slideIndex]?.media_type === 'video') return;
      const timer = setTimeout(() => setSlideIndex(prev => (prev + 1) % displayedPhotos.length), 6000);
      return () => clearTimeout(timer);
    }
  }, [viewMode, slideIndex, displayedPhotos.length]);

  useEffect(() => {
    if (slideIndex >= displayedPhotos.length) {
      setSlideIndex(0);
    }
  }, [displayedPhotos.length, slideIndex]);
 
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
    return (
      <div className="fixed inset-0 z-[1000] overflow-hidden flex flex-col bg-[#050505]">
        <div className="grain opacity-50" />
        
        {/* Slideshow Header */}
        <div className="absolute top-0 left-0 right-0 p-8 md:p-10 flex justify-between items-center z-50 pointer-events-none">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white pointer-events-auto">
                <Layout size={24} />
             </div>
             <div>
                <p className="text-[10px] font-black uppercase tracking-[.3em] text-white/70">LIVE EXPERIENCE</p>
                <h1 className="text-2xl font-bold text-white">{eventName}</h1>
             </div>
          </div>
          {hasFeature(planTier, 'SLIDESHOW_MODE') && (
             <button onClick={() => setViewMode(prevViewMode)} className="px-6 py-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all font-bold text-xs text-white pointer-events-auto">
               EXIT SLIDESHOW
             </button>
          )}
        </div>
 
        {/* Gallery */}
        <div className="flex-grow relative w-full h-full">
           <CircularGallery 
              bend={3}
              textColor="#ffffff"
              borderRadius={0.05}
              fontUrl=""
              items={displayedPhotos.map(p => ({ 
                image: getPublicUrl(p.storage_path), 
                text: p.uploader_name || '' 
              }))}
           />
        </div>

        {/* Floating QR Code */}
        <div className="absolute bottom-10 right-10 z-50 pointer-events-auto hidden md:block">
            <div className="p-5 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 flex flex-col items-center gap-4 shadow-2xl">
               <div className="p-3 bg-white rounded-2xl">
                  <QRCodeSVG value={uploadUrl} size={120} />
               </div>
               <p className="text-[11px] font-black text-white tracking-widest uppercase">Scan to Upload</p>
            </div>
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
      <nav className="fixed top-0 left-0 right-0 z-[100] h-20 border-b border-white/10 bg-surface/60 backdrop-blur-2xl px-6 md:px-10 flex items-center justify-between">
          <div className="flex items-center gap-6">
            {hasFeature(planTier, 'BRANDING_REMOVAL') ? (
               brandLogoUrl ? <img src={brandLogoUrl} alt="Event Logo" className="h-8 object-contain" /> : <div className="text-xl font-black tracking-tighter text-white">memento</div>
            ) : (
               <Link href="/" className="flex items-center gap-2">
                 <AnimatedLogo width={110} height={28} />
               </Link>
            )}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-success/10 border border-success/20 text-[10px] font-bold uppercase tracking-widest text-success">
               <div className={`w-1.5 h-1.5 rounded-full ${realtimeStatus === 'SUBSCRIBED' ? 'bg-success shadow-[0_0_8px_rgba(34,197,94,0.8)] animate-pulse' : 'bg-amber-400'}`} />
               {realtimeStatus === 'SUBSCRIBED' ? 'Live Stream Active' : 'Polling Updates'}
            </div>
         </div>

         <div className="flex items-center gap-3">
            {hasFeature(planTier, 'SELFIE_MATCH') && (
              <button 
                onClick={() => setShowSelfieCam(true)} 
                className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-bold text-white transition-all"
              >
                <Search size={14} className="text-accent-cyan" />
                <span>Find My Photos</span>
              </button>
            )}

            {isAdmin && (
               <>
                 <Link href={`/moderate/${slug}`} className="hidden lg:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-[10px] font-bold uppercase tracking-wider text-red-400 hover:bg-red-500/20 transition-all">
                    <Shield size={13} /> Moderate
                 </Link>
                 <button onClick={handleDownloadZip} className="hidden lg:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-wider text-emerald-400 hover:bg-emerald-500/20 transition-all">
                    <Download size={13} /> Export ZIP
                 </button>
                 <Link href="/dashboard" className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-white hover:bg-white/10 transition-all">
                    <Settings size={13} /> Dashboard
                 </Link>
               </>
            )}

            <button onClick={() => setShowMobileQR(true)} className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-white">
               <QrCode size={18} />
            </button>

            <Link href={uploadUrl} target="_blank" className="btn btn-primary !py-2 !px-4 text-xs font-bold shadow-lg shadow-purple-500/20">Join Wall</Link>
         </div>
      </nav>

      <main className="relative z-10 pt-32 px-6 md:px-10 pb-36 max-w-[1600px] mx-auto w-full flex-grow">
         {/* Wall Hero */}
         <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
               <p className="text-accent-cyan text-[10px] font-black uppercase tracking-[.4em] mb-2">OFFICIAL PHOTO COLLECTION</p>
               <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white">{eventName}</h1>
            </div>
            
            <div className="flex items-center gap-3">
               <button 
                 onClick={() => setShowBestShots(!showBestShots)} 
                 className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all text-xs font-bold ${
                   showBestShots 
                     ? 'bg-purple-500/20 border-purple-500/30 text-purple-300 shadow-lg shadow-purple-500/10' 
                     : 'bg-white/5 border-white/10 text-text-muted hover:text-white hover:bg-white/10'
                 }`}
               >
                  <Sparkles size={14} className={showBestShots ? 'text-purple-300' : ''} /> 
                  <span>{showBestShots ? 'Curated Only' : 'Show Best Shots'}</span>
               </button>

               <AnimatePresence>
                  {matchedPhotoIds && (
                    <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="flex items-center gap-3">
                       <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full bg-accent-cyan/10 border border-accent-cyan/20 text-accent-cyan">Matched {matchedPhotoIds.length}</span>
                       <button onClick={() => setMatchedPhotoIds(null)} className="text-xs font-bold text-text-muted hover:text-white transition-colors">Clear ×</button>
                    </motion.div>
                  )}
               </AnimatePresence>
            </div>
         </div>

         {/* Main Grid */}
         <AnimatePresence mode="wait">
            {displayedPhotos.length === 0 ? (
               <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="py-32 text-center p-12 rounded-3xl border border-white/10 bg-surface/30 backdrop-blur-xl">
                  <div className="text-6xl mb-6 opacity-30">📸</div>
                  <h2 className="text-2xl font-bold mb-2 text-white">No Memories shared yet</h2>
                  <p className="text-text-secondary mb-8 text-sm max-w-md mx-auto">Be the first to share a moment. Join the wall and upload your favorite shots!</p>
                  <Link href={uploadUrl} target="_blank" className="btn btn-primary !py-3 !px-8 text-sm font-bold">Share First Memory</Link>
               </motion.div>
            ) : viewMode === 'grid' ? (
               <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
                  {displayedPhotos.map((p, i) => (
                    <motion.div key={p.id} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: (i % 8) * 0.05 }} className="group relative rounded-2xl overflow-hidden border border-white/10 bg-surface/40 backdrop-blur-xl break-inside-avoid shadow-card">
                       <img src={getPublicUrl(p.storage_path)} className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700" alt="" loading="lazy" />
                       <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all p-5 flex flex-col justify-end">
                          <div className="flex justify-between items-start">
                             <p className="text-[10px] font-black text-accent-cyan uppercase tracking-widest mb-1">BY {p.uploader_name}</p>
                             {hasFeature(planTier, 'LIVE_REACTIONS') && (
                                <button onClick={() => handleReaction(p.id)} className="hover:text-pink-500 hover:scale-110 transition-all flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/40 text-xs font-bold text-white backdrop-blur-md">
                                   <Heart size={14} className={p.reaction_count ? 'fill-pink-500 text-pink-500' : ''} /> {p.reaction_count || 0}
                                </button>
                             )}
                          </div>
                          {p.caption && <p className="text-xs text-slate-200 italic line-clamp-2">&quot;{p.caption}&quot;</p>}
                       </div>
                    </motion.div>
                  ))}
               </motion.div>
            ) : viewMode === 'polaroid' ? (
               <motion.div key="polaroid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-wrap gap-10 justify-center py-6">
                  {displayedPhotos.map((p, i) => (
                    <motion.div key={p.id} initial={{ opacity: 0, y: 40, rotate: (i % 6 - 3) * 2 }} whileInView={{ opacity: 1, y: 0, rotate: (i % 6 - 3) * 0.5 }} viewport={{ once: true }} whileHover={{ scale: 1.05, rotate: 0, zIndex: 50 }} transition={{ duration: 0.4 }} className="bg-surface/70 backdrop-blur-2xl p-4 border border-white/10 shadow-2xl rounded-3xl w-72 flex-shrink-0 relative group cursor-pointer flex flex-col">
                        {/* Tape */}
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-7 bg-white/10 backdrop-blur-xl rotate-[-3deg] border border-white/10 shadow-sm z-20" style={{ clipPath: 'polygon(2% 15%, 98% 5%, 95% 95%, 5% 90%)' }} />
                        
                        <div className="aspect-[4/5] w-full shrink-0 overflow-hidden bg-black/40 rounded-2xl relative border border-white/5">
                           {p.media_type === 'video' ? <video src={getPublicUrl(p.storage_path)} className="w-full h-full object-cover" muted playsInline /> : <Image src={getPublicUrl(p.storage_path)} className="object-cover" fill alt="" loading="lazy" />}
                           {/* Gloss overlay */}
                           <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/0 to-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                        </div>
                        
                        <div className="pt-4 pb-2 px-2 flex flex-col flex-grow justify-center">
                           {p.caption && <p className="text-white font-semibold text-sm text-center leading-tight mb-2 whitespace-pre-wrap">&quot;{p.caption}&quot;</p>}
                           <div className="flex justify-between items-center text-[9px] font-black text-text-muted uppercase tracking-[0.2em] opacity-70 group-hover:opacity-100 transition-opacity duration-300">
                             <span>{hasFeature(planTier, 'BRANDING_REMOVAL') ? '' : 'BY '} {p.uploader_name}</span>
                             {hasFeature(planTier, 'LIVE_REACTIONS') && (
                               <button onClick={() => handleReaction(p.id)} className="hover:text-pink-500 transition-colors flex items-center gap-1 px-2 py-0.5 bg-white/5 rounded-full text-white">
                                 <Heart size={12} className={p.reaction_count ? 'fill-pink-500 text-pink-500' : ''} /> {p.reaction_count || 0}
                               </button>
                             )}
                           </div>
                        </div>
                     </motion.div>
                  ))}
               </motion.div>
            ) : (
               <motion.div key="album" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-16">
                  {(() => {
                    const groups: Record<string, Photo[]> = {};
                    displayedPhotos.forEach(p => { const k = new Date(p.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }); groups[k] = groups[k] || []; groups[k].push(p); });
                    return Object.entries(groups).map(([label, gPhotos]) => (
                      <div key={label}>
                        <div className="flex items-center gap-6 mb-8">
                           <h3 className="text-xs font-bold text-accent-cyan tracking-[.3em] uppercase whitespace-nowrap">{label}</h3>
                           <div className="h-px w-full bg-white/10" />
                        </div>
                        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
                           {gPhotos.map((p) => (
                             <motion.div key={p.id} className="relative overflow-hidden rounded-2xl bg-surface/40 border border-white/10 break-inside-avoid group">
                                <img src={getPublicUrl(p.storage_path)} className="w-full h-auto object-cover group-hover:scale-105 transition-all duration-700" alt="" loading="lazy" />
                                <div className="absolute bottom-3 left-3 right-3 p-3 bg-black/60 backdrop-blur-md rounded-xl opacity-0 group-hover:opacity-100 transition-all">
                                   <p className="text-[9px] font-black text-accent-cyan tracking-widest uppercase">BY {p.uploader_name}</p>
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

      {/* Floating Bottom Dock (View Switcher + Music + Best Shots) */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] pointer-events-auto">
         <div className="flex items-center p-2 bg-black/70 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
            
            {/* View Mode Switches */}
            <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl">
               {(['polaroid', 'grid', 'album'] as ViewMode[]).map(m => (
                 <button 
                   key={m} 
                   onClick={() => setViewMode(m)} 
                   className={`px-3.5 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                     viewMode === m 
                       ? 'bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/30 shadow-inner' 
                       : 'text-text-muted hover:text-white hover:bg-white/5'
                   }`}
                 >
                    {m}
                 </button>
               ))}
               {hasFeature(planTier, 'SLIDESHOW_MODE') && (
                 <button 
                   onClick={() => { setPrevViewMode(viewMode); setViewMode('slideshow'); }}
                   className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-all ${
                     (viewMode as string) === 'slideshow'
                       ? 'bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/30 shadow-inner' 
                       : 'text-text-muted hover:text-white hover:bg-white/5'
                   }`}
                 >
                    <Maximize2 size={13} />
                    <span className="text-[10px] font-black uppercase tracking-wider hidden sm:inline">Slideshow</span>
                 </button>
               )}
            </div>

            {/* Music Controls */}
            {musicTrack && hasFeature(planTier, 'SLIDESHOW_MUSIC') && (
              <>
                <div className="w-px h-6 bg-white/10 mx-2" />
                <button 
                  onClick={() => {
                     setIsAudioPlaying(!isAudioPlaying);
                     if (audioRef.current) {
                        if (isAudioPlaying) audioRef.current.pause();
                        else audioRef.current.play();
                     }
                  }}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all text-xs font-bold ${
                    isAudioPlaying 
                      ? 'bg-white/10 text-white border border-white/20' 
                      : 'text-text-muted hover:text-white hover:bg-white/5'
                  }`}
                  title={isAudioPlaying ? 'Pause Music' : 'Play Music'}
                >
                  {isAudioPlaying ? <Pause size={14} /> : <Music size={14} />}
                </button>
              </>
            )}

            <div className="w-px h-6 bg-white/10 mx-2" />

            {/* Best Shots Toggle */}
            <button 
              onClick={() => setShowBestShots(!showBestShots)} 
              className={`p-2 rounded-xl transition-all ${
                showBestShots 
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' 
                  : 'text-text-muted hover:text-white hover:bg-white/5'
              }`}
              title="Show Only Best Shots"
            >
              <Sparkles size={16} />
            </button>
         </div>
      </div>

      {/* Bottom Left Floating Join QR Card */}
      <div className="fixed bottom-8 left-8 z-[90] hidden md:block">
        <div className="p-4 bg-surface/70 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-2xl flex flex-col items-center gap-2 text-center group hover:bg-surface/90 transition-all">
          <div className="p-2.5 bg-white rounded-xl shadow-md">
            <QRCodeSVG value={uploadUrl} size={110} />
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">Scan to Join</p>
        </div>
      </div>

      {/* WhatsApp Message Me with Hover QR Popover */}
      <div className="fixed bottom-8 right-8 z-[100] hidden lg:block group">
         {/* QR Code Popover on Hover */}
         <div className="absolute bottom-full right-0 mb-3 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
           <div className="p-4 bg-surface/90 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl flex flex-col items-center gap-2 text-center w-48">
             <div className="p-2.5 bg-white rounded-xl shadow-md">
               <QRCodeSVG value="https://wa.me/96896095692" size={130} />
             </div>
             <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mt-1">Scan to Chat</p>
             <p className="text-[11px] font-bold text-white">+968 9609 5692</p>
           </div>
         </div>

         <Link 
           href="https://wa.me/96896095692" 
           target="_blank" 
           className="p-3.5 bg-surface/80 hover:bg-surface border border-white/10 hover:border-success/40 transition-all duration-300 rounded-2xl backdrop-blur-2xl flex items-center gap-3 shadow-xl group/btn"
         >
            <div className="w-10 h-10 rounded-xl bg-success/15 border border-success/20 flex items-center justify-center text-success group-hover/btn:scale-110 transition-transform">
               <ExternalLink size={18} />
            </div>
            <div className="pr-2">
               <p className="text-[9px] font-black text-text-muted uppercase tracking-widest">NEED HELP?</p>
               <p className="text-xs font-extrabold text-white flex items-center gap-1">
                 <span>Chat on WhatsApp</span>
                 <QrCode size={12} className="text-success" />
               </p>
            </div>
         </Link>
      </div>
 
      {/* Mobile Upload & QR Floating CTA */}
      <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-[90] w-[90%] max-w-sm flex gap-3">
         <button onClick={() => setShowMobileQR(true)} className="flex-shrink-0 w-14 h-14 bg-bg-subtle border border-border shadow-xl rounded-2xl flex items-center justify-center text-text-primary hover:bg-border transition-all">
            <QrCode size={24} />
         </button>
         <Link href={uploadUrl} className="btn-premium flex-grow h-14 shadow-2xl flex items-center justify-center gap-3 text-sm rounded-2xl">
            <Upload size={18} /> Upload Photos
         </Link>
      </div>

      {/* Mobile QR Modal */}
      <AnimatePresence>
         {showMobileQR && (
           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[2000] bg-black/90 backdrop-blur-3xl flex items-center justify-center p-6">
              <div className="glass-panel w-full max-w-sm p-10 text-center relative flex flex-col items-center">
                 <button onClick={() => setShowMobileQR(false)} className="absolute top-4 right-4 text-text-muted hover:text-white transition-colors"><X size={24} /></button>
                 <div className="p-4 bg-white rounded-2xl shadow-2xl mb-6">
                    <QRCodeSVG value={uploadUrl} size={200} />
                 </div>
                 <h3 className="text-2xl font-bold mb-2 text-white">Scan to Join</h3>
                 <p className="text-text-secondary text-sm">Scan this QR code to upload memories directly to the wall.</p>
              </div>
           </motion.div>
         )}
      </AnimatePresence>
    </div>
  );
}
