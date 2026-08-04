"use client";
 
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import Image from 'next/image';
import { QRCode } from 'react-qrcode-logo';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import Webcam from 'react-webcam';
import { extractFaceDescriptorRobust, MATCH_THRESHOLD } from '@/lib/faceEngine';
import { useAuth } from '@/hooks/useAuth';
import { hasFeature } from '@/lib/permissions';
import { Layout, Camera, Shield, Search, Download, Trash2, X, Play, Pause, Heart, Clock, ExternalLink, Sparkles, User, Settings, ArrowLeft, Maximize2, Music, QrCode, Upload, ChevronLeft, ChevronRight } from 'lucide-react';
import CircularGallery from '@/components/CircularGallery';
import AnimatedLogo from '@/components/AnimatedLogo';
import { RippleButton } from '@/registry/magicui/ripple-button';
import { ShimmerButton } from '@/registry/magicui/shimmer-button';

 
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
          ? <video key={photo.id} src={getPublicUrl(photo.storage_path)} className="w-full relative z-10 block object-contain max-h-[60vh] mx-auto" autoPlay loop muted />
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
 
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute top-10 right-10"
      >
        <RippleButton
          rippleColor="#ADD8E6"
          onClick={() => { setExiting(true); setTimeout(onDone, 800); }}
          className="!w-12 !h-12 !p-0 rounded-full bg-bg-subtle border border-border flex items-center justify-center text-text-muted hover:text-black dark:hover:text-text-primary transition-all hover:scale-110 active:scale-95"
        >
          <X size={20} />
        </RippleButton>
      </motion.div>

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
  const [showMusicMenu, setShowMusicMenu] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);
  const [isSlideshowAuto, setIsSlideshowAuto] = useState(true);
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

  // ── Automatic Slideshow Timer ────────────────────────────────
  useEffect(() => {
    if (viewMode !== 'slideshow' || displayedPhotos.length === 0 || !isSlideshowAuto) return;
    const interval = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % displayedPhotos.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [viewMode, displayedPhotos.length, isSlideshowAuto]);
 
  const getPublicUrl = useCallback((path: string) => {
    const { data } = supabase.storage.from('photos').getPublicUrl(path);
    return data.publicUrl;
  }, []);
 
  useEffect(() => {
    const fetchEventAndPhotos = async () => {
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('slug', slug)
        .single();
 
      if (eventError || !eventData) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      if (eventData.expires_at && new Date(eventData.expires_at) < new Date()) {
        setEventExpired(true);
        setLoading(false);
        return;
      }
 
      setEventId(eventData.id);
      setEventName(eventData.name);
      setOwnerId(eventData.owner_id);
      setPlanTier(eventData.plan_type || 'STARTER');
      setBrandLogoUrl(eventData.brand_logo_url || null);
      setMusicTrack(eventData.music_track || null);
 
      if (user && user.id === eventData.owner_id) {
        setIsAdmin(true);
      }

      const { data: initialPhotos } = await supabase
        .from('photos')
        .select('*')
        .eq('event_id', eventData.id)
        .eq('approved', true)
        .order('created_at', { ascending: false });
 
      if (initialPhotos) {
        setPhotos(initialPhotos);
      }
      setLoading(false);
    };
 
    fetchEventAndPhotos();
  }, [slug, user]);
 
  useEffect(() => {
    if (!eventId) return;

    const channelName = `wall-${eventId}-${Math.random().toString(36).substring(7)}`;
    const channel = supabase.channel(channelName);
 
    channel
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'photos', filter: `event_id=eq.${eventId}` },
        async (payload) => {
          const newPhoto = payload.new as Photo;
          if (newPhoto.approved) {
            setPhotos(prev => [newPhoto, ...prev]);
            setRevealPhoto(newPhoto);
            setConfettiTrigger(true);
            setTimeout(() => setConfettiTrigger(false), 3500);
          }
        }
      )
      .subscribe((status) => {
        setRealtimeStatus(status);
        if (status === 'TIMED_OUT' || status === 'CHANNEL_ERROR') {
          if (!pollingIntervalRef.current) {
            pollingIntervalRef.current = setInterval(async () => {
              const { data: latest } = await supabase
                .from('photos').select('*').eq('event_id', eventId).eq('approved', true).order('created_at', { ascending: false });
              if (latest) setPhotos(latest);
            }, 4000);
          }
        } else if (status === 'SUBSCRIBED') {
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
        }
      });
 
    return () => {
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
      supabase.removeChannel(channel);
    };
  }, [eventId]);

  const captureSelfieAndSearch = async () => {
    if (!webcamRef.current) return;
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;

    setIsSearching(true);
    try {
      const img = new window.Image();
      img.src = imageSrc;
      await new Promise(r => { img.onload = r; });
      const userDescriptor = await extractFaceDescriptorRobust(img);
      if (!userDescriptor) {
        alert('Could not detect a clear face in the selfie. Please try again with better lighting!');
        setIsSearching(false);
        return;
      }

      const matchedIds: string[] = [];
      for (const p of photos) {
        if (p.face_descriptor && Array.isArray(p.face_descriptor)) {
          let distSum = 0;
          for (let i = 0; i < 128; i++) {
            const diff = userDescriptor[i] - p.face_descriptor[i];
            distSum += diff * diff;
          }
          const distance = Math.sqrt(distSum);
          if (distance < MATCH_THRESHOLD) {
            matchedIds.push(p.id);
          }
        }
      }

      setMatchedPhotoIds(matchedIds);
      setShowSelfieCam(false);
      if (matchedIds.length === 0) {
        alert("We couldn't find any matching photos of you on this wall yet!");
      }
    } catch (err) {
      console.error(err);
      alert('Facial recognition error. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleDownloadZip = async () => {
    if (!isAdmin) return;
    const zip = new JSZip();
    const folder = zip.folder(`${slug}-photos`);
    for (const p of photos) {
      try { const blob = await (await fetch(getPublicUrl(p.storage_path))).blob(); folder?.file(`${p.uploader_name}-${p.id.slice(0, 4)}.jpg`, blob); }
      catch (e) { console.error(e); }
    }
    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, `${slug}-memento.zip`);
  };

  const handleReaction = async (photoId: string) => {
    if (!hasFeature(planTier, 'LIVE_REACTIONS')) return;
    setPhotos(prev => prev.map(p => p.id === photoId ? { ...p, reaction_count: (p.reaction_count || 0) + 1 } : p));
    const guestId = localStorage.getItem('memento_guest_id') || Math.random().toString(36).substring(2);
    localStorage.setItem('memento_guest_id', guestId);
    await supabase.from('reactions').insert({ photo_id: photoId, guest_id: guestId });
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-bg relative overflow-hidden">
      <div className="w-10 h-10 border-2 border-white/10 border-t-accent-cyan rounded-full animate-spin relative z-10" />
    </div>
  );
 
  if (notFound || eventExpired) return (
    <div className="min-h-screen flex items-center justify-center p-6 text-center bg-bg relative overflow-hidden">
      <div className="grain" />
      <div className="orbs"><div className="orb orb-primary" /><div className="orb orb-secondary" /></div>
      <div className="p-10 rounded-3xl border border-white/10 bg-surface/70 backdrop-blur-2xl max-w-md relative z-10 shadow-2xl">
        <div className="text-6xl mb-4">{notFound ? '✨' : '📅'}</div>
        <h1 className="text-2xl font-bold mb-2 text-white">{notFound ? 'Wall Not Found' : 'Event Concluded'}</h1>
        <p className="text-text-secondary mb-6 text-sm">{notFound ? "This memory lane hasn't been created yet." : "This photo wall has reached its destination."}</p>
        <Link href="/">
          <RippleButton rippleColor="#ADD8E6" className="btn btn-primary !py-3 !px-8 text-sm font-bold">
            Go Home
          </RippleButton>
        </Link>

      </div>
    </div>
  );

  // ── AUTOMATIC SLIDESHOW MODE ──────────────────────────────────
  if (viewMode === 'slideshow') {
    const currentPhoto = displayedPhotos[slideIndex % (displayedPhotos.length || 1)];
    return (
      <div className="fixed inset-0 z-[1000] overflow-hidden flex flex-col bg-[#050505] select-none">
        <div className="grain opacity-50" />
        <div className="orbs">
          <div className="orb orb-primary opacity-30" />
          <div className="orb orb-secondary opacity-30" />
        </div>
        
        {/* Slideshow Top Header */}
        <div className="absolute top-0 left-0 right-0 p-6 md:p-8 flex justify-between items-center z-50 pointer-events-none">
          <div className="flex items-center gap-4 pointer-events-auto">
             <div className="w-10 h-10 rounded-xl bg-surface/60 backdrop-blur-2xl border border-white/10 flex items-center justify-center text-accent-cyan shadow-lg">
                <Layout size={20} />
             </div>
             <div>
                <p className="text-[9px] font-black uppercase tracking-[.3em] text-accent-cyan">LIVE EXPERIENCE</p>
                <h1 className="text-xl md:text-2xl font-black text-white">{eventName}</h1>
             </div>
          </div>

          <div className="flex items-center gap-3 pointer-events-auto">
             <RippleButton 
               rippleColor="#ADD8E6"
               onClick={() => setIsSlideshowAuto(!isSlideshowAuto)}
               className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-bold transition-all ${
                 isSlideshowAuto ? 'bg-accent-cyan/20 text-accent-cyan border-accent-cyan/30' : 'bg-white/5 text-text-muted border-white/10'
               }`}
             >
               {isSlideshowAuto ? <Pause size={14} /> : <Play size={14} />}
               <span>{isSlideshowAuto ? 'Auto Playing' : 'Paused'}</span>
             </RippleButton>

             <RippleButton 
               rippleColor="#ADD8E6"
               onClick={() => setViewMode(prevViewMode)} 
               className="px-4 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all font-bold text-xs text-white flex items-center gap-2"
             >
               <X size={14} />
               <span>Exit Slideshow</span>
             </RippleButton>
          </div>

        </div>

        {/* Main Photo Display */}
        <div className="flex-grow relative w-full h-full flex items-center justify-center p-6 md:p-12">
          {displayedPhotos.length > 0 && currentPhoto ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPhoto.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="relative max-w-5xl w-full max-h-[75vh] h-full flex items-center justify-center"
              >
                <div className="relative w-full h-full rounded-3xl overflow-hidden border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.8)] bg-black/40 flex items-center justify-center">
                  {currentPhoto.media_type === 'video' ? (
                    <video 
                      key={currentPhoto.id}
                      src={getPublicUrl(currentPhoto.storage_path)} 
                      className="w-full h-full object-contain max-h-[72vh]" 
                      autoPlay 
                      loop 
                      muted 
                    />
                  ) : (
                    <img 
                      src={getPublicUrl(currentPhoto.storage_path)} 
                      alt="" 
                      className="w-full h-full object-contain max-h-[72vh]"
                    />
                  )}

                  {/* Caption & Uploader Banner */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent backdrop-blur-sm flex items-end justify-between gap-4" style={{ padding: '24px' }}>
                    <div>
                      {currentPhoto.caption && (
                        <p className="text-lg md:text-xl font-medium text-white italic mb-1">
                          &quot;{currentPhoto.caption}&quot;
                        </p>
                      )}
                      <p className="text-xs font-black uppercase tracking-widest text-accent-cyan">
                        SHARED BY {currentPhoto.uploader_name}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-mono text-text-muted">
                        {slideIndex + 1} / {displayedPhotos.length}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          ) : (
            <div className="text-center text-text-muted text-sm">No photos uploaded yet</div>
          )}
        </div>

        {/* Floating Manual Controls (Next/Prev) */}
        {displayedPhotos.length > 1 && (
          <>
            <RippleButton 
              rippleColor="#ADD8E6"
              onClick={() => setSlideIndex(prev => (prev - 1 + displayedPhotos.length) % displayedPhotos.length)}
              className="!p-3.5 rounded-full bg-black/60 hover:bg-black/80 border border-white/10 text-white backdrop-blur-xl transition-all hover:scale-110 active:scale-95 z-50 absolute left-6 top-1/2 -translate-y-1/2"
              title="Previous Photo"
            >
              <ChevronLeft size={24} />
            </RippleButton>
            <RippleButton 
              rippleColor="#ADD8E6"
              onClick={() => setSlideIndex(prev => (prev + 1) % displayedPhotos.length)}
              className="!p-3.5 rounded-full bg-black/60 hover:bg-black/80 border border-white/10 text-white backdrop-blur-xl transition-all hover:scale-110 active:scale-95 z-50 absolute right-6 top-1/2 -translate-y-1/2"
              title="Next Photo"
            >
              <ChevronRight size={24} />
            </RippleButton>
          </>
        )}


        {/* Bottom Left Join Barcode (TV Modern Dot Matrix) */}
        <div className="absolute bottom-8 left-8 z-50 hidden md:block">
          <div className="p-4 bg-surface/70 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-2xl flex flex-col items-center gap-2 text-center">
            <div className="p-2.5 bg-white/10 rounded-xl border border-white/10">
              <QRCode value={uploadUrl} size={120} bgColor="transparent" fgColor="#ffffff" qrStyle="dots" eyeRadius={10} />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">Scan to Join Wall</p>
          </div>
        </div>

        {/* Bottom Right WhatsApp Barcode (TV Modern Dot Matrix) */}
        <div className="absolute bottom-8 right-8 z-50 hidden lg:block">
          <Link href="https://wa.me/96896095692" target="_blank" className="p-4 bg-surface/70 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-2xl flex flex-col items-center gap-2 text-center group hover:bg-surface/90 transition-all">
            <div className="p-2.5 bg-white/10 rounded-xl border border-white/10">
              <QRCode value="https://wa.me/96896095692" size={120} bgColor="transparent" fgColor="#ffffff" qrStyle="dots" eyeRadius={10} />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-success flex items-center gap-1">
              <span>WhatsApp Help</span>
              <QrCode size={10} />
            </p>
          </Link>
        </div>
      </div>
    );
  }

  // ── MAIN WALL VIEW ──────────────────────────────────────────
  return (
    <div className="min-h-screen relative overflow-x-hidden flex flex-col bg-bg">
      <div className="grain" />
      <div className="orbs"><div className="orb orb-primary opacity-40" /><div className="orb orb-secondary opacity-40" /></div>
 
      {musicTrack && isAudioPlaying && <audio ref={audioRef} autoPlay loop src={`/music/${musicTrack}.mp3`} />}
 
      {revealPhoto && <NewPhotoReveal photo={revealPhoto} getPublicUrl={getPublicUrl} onDone={() => setRevealPhoto(null)} />}
 
      {/* Top Header */}
      <nav className="fixed top-0 left-0 right-0 z-[100] h-20 border-b border-white/10 bg-surface/60 backdrop-blur-2xl px-6 md:px-12 flex items-center justify-between">
          <div className="flex items-center gap-6">
            {hasFeature(planTier, 'BRANDING_REMOVAL') ? (
               brandLogoUrl ? (
                 <img src={brandLogoUrl} alt="Event Logo" className="h-8 md:h-10 object-contain" />
               ) : (
                 <Link href="/" className="flex items-center gap-2">
                   <img src="/CC logo.png" alt="Memento Logo" className="h-8 md:h-10 object-contain" />
                 </Link>
               )
            ) : (
               <Link href="/" className="flex items-center gap-2">
                 <img src="/CC logo.png" alt="Memento Logo" className="h-8 md:h-10 object-contain" />
               </Link>
            )}
            <div 
               style={{ paddingLeft: '28px', paddingRight: '28px', paddingTop: '8px', paddingBottom: '8px' }}
               className="hidden sm:flex items-center gap-3 rounded-full bg-success/10 border border-success/20 text-xs md:text-sm font-extrabold uppercase tracking-widest text-success shadow-sm"
            >
               <div className={`w-2.5 h-2.5 rounded-full ${realtimeStatus === 'SUBSCRIBED' ? 'bg-success shadow-[0_0_10px_rgba(34,197,94,0.9)] animate-pulse' : 'bg-amber-400'}`} />
               {realtimeStatus === 'SUBSCRIBED' ? 'Live Stream Active' : 'Polling Updates'}
            </div>
         </div>

         <div className="flex items-center gap-2.5 md:gap-3">
            {hasFeature(planTier, 'SELFIE_MATCH') && (
              <ShimmerButton 
                shimmerColor="#00E5FF"
                background="#0f172a"
                onClick={() => setShowSelfieCam(true)} 
                paddingX={24}
                paddingY={8}
                className="hidden md:flex items-center gap-2 text-xs font-bold text-white border border-cyan-500/30 rounded-full shadow-lg shrink-0"
              >
                <Search size={14} className="text-accent-cyan shrink-0" />
                <span className="tracking-wide whitespace-nowrap">Find My Photos</span>
              </ShimmerButton>
            )}

            <Link href={`/moderate/${slug}`} className="hidden lg:block shrink-0">
              <ShimmerButton 
                shimmerColor="#FF5470" 
                background="#1a0b0e"
                paddingX={24}
                paddingY={8}
                className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-400 border border-red-500/30 shadow-lg rounded-full shrink-0"
              >
                <Shield size={14} className="shrink-0" /> <span className="whitespace-nowrap">Moderate</span>
              </ShimmerButton>
            </Link>

            <ShimmerButton 
              shimmerColor="#4ADE80" 
              background="#081c10"
              onClick={handleDownloadZip} 
              paddingX={24}
              paddingY={8}
              className="hidden lg:flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400 border border-emerald-500/30 shadow-lg rounded-full shrink-0"
            >
               <Download size={14} className="shrink-0" /> <span className="whitespace-nowrap">Export ZIP</span>
            </ShimmerButton>

            <Link href="/dashboard" className="hidden sm:block shrink-0">
              <ShimmerButton 
                shimmerColor="#ffffff" 
                background="#11131f"
                paddingX={24}
                paddingY={8}
                className="flex items-center gap-2 text-xs font-bold text-white border border-white/20 shadow-lg rounded-full shrink-0"
              >
                 <Settings size={14} className="shrink-0" /> <span className="whitespace-nowrap">Dashboard</span>
              </ShimmerButton>
            </Link>

            <ShimmerButton 
              shimmerColor="#ffffff" 
              onClick={() => setShowMobileQR(true)} 
              paddingX={0}
              paddingY={0}
              className="md:hidden flex items-center justify-center !w-10 !h-10 rounded-full text-white shadow-2xl shrink-0"
            >
               <QrCode size={18} />
            </ShimmerButton>

            <Link href={uploadUrl} target="_blank" className="shrink-0">
              <ShimmerButton 
                shimmerColor="#ffffff" 
                background="#ffffff"
                paddingX={28}
                paddingY={10}
                className="text-xs font-extrabold text-black tracking-wider uppercase shadow-xl rounded-full hover:bg-white transition-all shrink-0"
              >
                <span className="text-black font-extrabold text-xs tracking-wider uppercase whitespace-nowrap">JOIN WALL</span>
              </ShimmerButton>
            </Link>
         </div>












      </nav>

      <main className="relative z-10 pt-32 px-6 sm:px-12 md:px-24 lg:px-40 xl:px-48 pb-64 md:pb-80 max-w-[1800px] mx-auto w-full flex-grow">
         {/* Wall Hero */}
         <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
               <p className="text-accent-cyan text-xs font-black uppercase tracking-[.4em] mb-2">OFFICIAL PHOTO COLLECTION</p>
               <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white">{eventName}</h1>
            </div>
            
            <div className="flex items-center gap-3.5">
               <RippleButton 
                 rippleColor="#ADD8E6"
                 onClick={() => setShowBestShots(!showBestShots)} 
                 paddingX={20}
                 paddingY={12}
                 className={`flex items-center gap-2.5 rounded-2xl border transition-all text-xs font-bold ${
                   showBestShots 
                     ? 'bg-purple-500/20 border-purple-500/30 text-purple-300 shadow-lg shadow-purple-500/10' 
                     : 'bg-white/5 border-white/10 text-text-muted hover:text-white hover:bg-white/10'
                 }`}
               >
                  <Sparkles size={15} className={showBestShots ? 'text-purple-300' : ''} /> 
                  <span>{showBestShots ? 'Curated Only' : 'Show Best Shots'}</span>
               </RippleButton>

               <AnimatePresence>
                  {matchedPhotoIds && (
                    <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="flex items-center gap-3">
                       <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full bg-accent-cyan/10 border border-accent-cyan/20 text-accent-cyan">Matched {matchedPhotoIds.length}</span>
                       <RippleButton rippleColor="#ADD8E6" onClick={() => setMatchedPhotoIds(null)} paddingX={4} paddingY={4} className="text-xs font-bold text-text-muted hover:text-white transition-colors bg-transparent border-0">Clear ×</RippleButton>
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
                  <Link href={uploadUrl} target="_blank">
                    <RippleButton rippleColor="#ADD8E6" paddingX={32} paddingY={12} className="btn btn-primary text-sm font-bold">
                      Share First Memory
                    </RippleButton>
                  </Link>
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
                                <RippleButton 
                                  rippleColor="#FF69B4" 
                                  onClick={() => handleReaction(p.id)} 
                                  paddingX={10}
                                  paddingY={4}
                                  className="hover:text-pink-500 hover:scale-110 transition-all flex items-center gap-1 rounded-full bg-black/40 text-xs font-bold text-white backdrop-blur-md border-0"
                                >
                                   <Heart size={14} className={p.reaction_count ? 'fill-pink-500 text-pink-500' : ''} /> {p.reaction_count || 0}
                                </RippleButton>
                             )}
                          </div>
                          {p.caption && <p className="text-xs text-slate-200 italic line-clamp-2">&quot;{p.caption}&quot;</p>}
                       </div>
                    </motion.div>
                  ))}
               </motion.div>
            ) : viewMode === 'polaroid' ? (
               <motion.div key="polaroid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ paddingTop: '96px' }} className="flex flex-wrap gap-10 md:gap-14 justify-center pb-20 px-4 md:px-8">
                  {displayedPhotos.map((p, i) => (
                    <motion.div 
                      key={p.id} 
                      initial={{ opacity: 0, y: 40, rotate: (i % 6 - 3) * 2.5 }} 
                      whileInView={{ opacity: 1, y: 0, rotate: (i % 6 - 3) * 1 }} 
                      viewport={{ once: true }} 
                      whileHover={{ scale: 1.06, rotate: 0, zIndex: 50 }} 
                      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }} 
                      className="bg-[#fafafa] text-slate-900 border border-white/60 shadow-[0_20px_50px_rgba(0,0,0,0.4)] rounded-2xl w-72 flex-shrink-0 relative group cursor-pointer flex flex-col mx-3 my-4"
                      style={{ padding: '16px' }}
                    >
                        {/* Authentic Masking Tape */}
                        <div 
                          className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-28 h-8 bg-amber-100/70 border border-amber-200/50 backdrop-blur-sm rotate-[-2deg] shadow-sm z-20 opacity-90" 
                          style={{ clipPath: 'polygon(2% 15%, 98% 5%, 95% 95%, 5% 90%)' }} 
                        />
                        
                        {/* Photo Container */}
                        <div className="aspect-[4/5] w-full shrink-0 overflow-hidden bg-slate-900 rounded-xl relative border border-slate-200/60 shadow-inner">
                           {p.media_type === 'video' ? (
                             <video src={getPublicUrl(p.storage_path)} className="w-full h-full object-cover" muted playsInline />
                           ) : (
                             <Image src={getPublicUrl(p.storage_path)} className="object-cover" fill alt="" loading="lazy" />
                           )}
                           {/* Subtle Gloss Overlay */}
                           <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/0 to-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                        </div>
                        
                        {/* Polaroid Bottom Paper Caption Area */}
                        <div className="flex flex-col flex-grow justify-center text-center" style={{ padding: '16px 4px 8px 4px' }}>
                           {p.caption ? (
                             <p className="text-slate-800 font-medium text-sm leading-tight mb-2 whitespace-pre-wrap font-sans">
                               &quot;{p.caption}&quot;
                             </p>
                           ) : (
                             <p className="text-slate-400 italic text-xs mb-2">Memory #{i + 1}</p>
                           )}
                           <div className="flex justify-between items-center text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em]">
                             <span>BY {p.uploader_name}</span>
                             {hasFeature(planTier, 'LIVE_REACTIONS') && (
                               <RippleButton 
                                 rippleColor="#FF69B4"
                                 onClick={(e) => { e.stopPropagation(); handleReaction(p.id); }} 
                                 paddingX={8}
                                 paddingY={2}
                                 className="hover:text-pink-600 transition-colors flex items-center gap-1 bg-slate-200/70 hover:bg-slate-200 rounded-full text-slate-700 border-0"
                               >
                                 <Heart size={12} className={p.reaction_count ? 'fill-pink-500 text-pink-500' : ''} /> 
                                 <span>{p.reaction_count || 0}</span>
                               </RippleButton>
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
         <div className="flex items-center p-3 bg-black/80 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.9)] gap-2">
            
            {/* View Mode Switches */}
            <div className="flex items-center gap-1.5 bg-white/5 p-1.5 rounded-xl">
               {(['polaroid', 'grid', 'album'] as ViewMode[]).map(m => (
                 <RippleButton 
                   key={m} 
                   rippleColor="#ADD8E6"
                   onClick={() => setViewMode(m)} 
                   className={`!px-5 !py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all border-0 ${
                     viewMode === m 
                       ? 'bg-accent-cyan/25 text-accent-cyan border border-accent-cyan/40 shadow-inner' 
                       : 'bg-transparent text-text-muted hover:text-white hover:bg-white/5'
                   }`}
                 >
                    {m}
                 </RippleButton>
               ))}
               {hasFeature(planTier, 'SLIDESHOW_MODE') && (
                 <RippleButton 
                   rippleColor="#ADD8E6"
                   onClick={() => { setPrevViewMode(viewMode); setViewMode('slideshow'); }}
                   className={`flex items-center gap-2 !px-5 !py-2.5 rounded-xl transition-all border-0 ${
                     (viewMode as string) === 'slideshow'
                       ? 'bg-accent-cyan/25 text-accent-cyan border border-accent-cyan/40 shadow-inner' 
                       : 'bg-transparent text-text-muted hover:text-white hover:bg-white/5'
                   }`}
                 >
                    <Maximize2 size={15} />
                    <span className="text-xs font-extrabold uppercase tracking-wider hidden sm:inline">Slideshow</span>
                 </RippleButton>
               )}
            </div>

            {/* Music Controls & Track Selector */}
            {hasFeature(planTier, 'SLIDESHOW_MUSIC') && (
              <div className="relative">
                <div className="flex items-center gap-1">
                  <div className="w-px h-7 bg-white/10 mx-1" />
                  <RippleButton 
                    rippleColor="#ADD8E6"
                    onClick={() => {
                      if (!musicTrack || musicTrack === 'none') {
                        setMusicTrack('upbeat');
                        setIsAudioPlaying(true);
                      } else {
                        setIsAudioPlaying(!isAudioPlaying);
                        if (audioRef.current) {
                          if (isAudioPlaying) audioRef.current.pause();
                          else audioRef.current.play();
                        }
                      }
                    }}
                    className={`flex items-center gap-2 !px-3.5 !py-2.5 rounded-xl transition-all text-xs font-bold border-0 ${
                      isAudioPlaying && musicTrack && musicTrack !== 'none'
                        ? 'bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/30 shadow-inner' 
                        : 'bg-transparent text-text-muted hover:text-white hover:bg-white/5'
                    }`}
                    title={isAudioPlaying ? 'Pause Music' : 'Play Music'}
                  >
                    {isAudioPlaying && musicTrack && musicTrack !== 'none' ? (
                      <Pause size={15} className="animate-pulse" />
                    ) : (
                      <Music size={15} />
                    )}
                  </RippleButton>

                  <RippleButton 
                    rippleColor="#ADD8E6"
                    onClick={() => setShowMusicMenu(!showMusicMenu)}
                    className="!p-2 rounded-xl text-text-muted hover:text-white hover:bg-white/5 transition-all text-xs bg-transparent border-0"
                    title="Select Background Music Track"
                  >
                    <Settings size={14} />
                  </RippleButton>
                </div>

                {/* Music Track Selection Popover */}
                <AnimatePresence>
                  {showMusicMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 p-3 bg-black/90 backdrop-blur-3xl border border-white/15 rounded-2xl w-64 shadow-[0_20px_50px_rgba(0,0,0,0.9)] z-[200] flex flex-col gap-2"
                    >
                      <div className="flex items-center justify-between px-2 pt-1 pb-2 border-b border-white/10">
                        <p className="text-[10px] font-black uppercase tracking-widest text-accent-cyan flex items-center gap-1.5">
                          <Music size={12} /> Choose Sound Track
                        </p>
                        <RippleButton rippleColor="#ADD8E6" onClick={() => setShowMusicMenu(false)} className="text-text-muted hover:text-white text-xs bg-transparent border-0 !p-1">
                          <X size={14} />
                        </RippleButton>
                      </div>

                      <div className="space-y-1 pt-1">
                        {[
                          { id: 'upbeat', name: 'Upbeat Celebration', emoji: '🎉' },
                          { id: 'acoustic', name: 'Acoustic Vibes', emoji: '🎸' },
                          { id: 'piano', name: 'Gentle Piano', emoji: '🎹' },
                          { id: 'pleasant', name: 'Pleasant Ambient', emoji: '✨' },
                          { id: 'none', name: 'Mute Sound', emoji: '🔇' },
                        ].map((track) => (
                          <RippleButton
                            key={track.id}
                            rippleColor="#ADD8E6"
                            onClick={async () => {
                              if (track.id === 'none') {
                                setIsAudioPlaying(false);
                                setMusicTrack('none');
                                if (audioRef.current) audioRef.current.pause();
                              } else {
                                setMusicTrack(track.id);
                                setIsAudioPlaying(true);
                                if (audioRef.current) {
                                  audioRef.current.src = `/music/${track.id}.mp3`;
                                  audioRef.current.play().catch(console.error);
                                }
                              }
                              setShowMusicMenu(false);
                              if (isAdmin && eventId) {
                                await supabase.from('events').update({ music_track: track.id }).eq('id', eventId);
                              }
                            }}
                            className={`w-full flex items-center justify-between !px-3 !py-2 rounded-xl text-xs font-bold transition-all border-0 ${
                              musicTrack === track.id
                                ? 'bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/30'
                                : 'bg-transparent text-text-muted hover:text-white hover:bg-white/5'
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              <span>{track.emoji}</span>
                              <span>{track.name}</span>
                            </span>
                            {musicTrack === track.id && <span className="text-[10px] uppercase font-mono tracking-widest text-accent-cyan">Active</span>}
                          </RippleButton>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            <div className="w-px h-7 bg-white/10 mx-1" />

            {/* Best Shots Toggle */}
            <RippleButton 
              rippleColor="#ADD8E6"
              onClick={() => setShowBestShots(!showBestShots)} 
              className={`!p-3 rounded-xl transition-all border-0 ${
                showBestShots 
                  ? 'bg-purple-500/25 text-purple-300 border border-purple-500/40' 
                  : 'bg-transparent text-text-muted hover:text-white hover:bg-white/5'
              }`}
              title="Show Only Best Shots"
            >
              <Sparkles size={18} />
            </RippleButton>

         </div>
      </div>

      {/* Bottom Left Floating Join Barcode (TV Modern Dot Matrix) */}
      <div className="fixed bottom-8 left-8 z-[90] hidden md:block">
        <div className="p-4 bg-surface/80 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-2xl flex flex-col items-center gap-2.5 text-center group hover:bg-surface/95 transition-all">
          <div className="p-3 bg-white/10 rounded-xl border border-white/10">
            <QRCode value={uploadUrl} size={120} bgColor="transparent" fgColor="#ffffff" qrStyle="dots" eyeRadius={10} />
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">Scan to Join</p>
        </div>
      </div>

      {/* Bottom Right WhatsApp Barcode (TV Modern Dot Matrix) */}
      <div className="fixed bottom-8 right-8 z-[90] hidden lg:block">
        <Link href="https://wa.me/96896095692" target="_blank" className="p-4 bg-surface/80 backdrop-blur-2xl rounded-2xl border border-white/10 hover:border-success/30 shadow-2xl flex flex-col items-center gap-2.5 text-center group hover:bg-surface/95 transition-all">
          <div className="p-3 bg-white/10 rounded-xl border border-white/10">
            <QRCode value="https://wa.me/96896095692" size={120} bgColor="transparent" fgColor="#ffffff" qrStyle="dots" eyeRadius={10} />
          </div>
          <div className="flex flex-col items-center">
            <p className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-0.5">NEED HELP?</p>
            <p className="text-xs font-extrabold text-white flex items-center gap-1.5">
              <span className="text-success">WhatsApp</span>
              <span className="text-text-muted">• +968 9609 5692</span>
            </p>
          </div>
        </Link>
      </div>

      {/* Selfie Modal */}
      <AnimatePresence>
         {showSelfieCam && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[1000] bg-black/90 backdrop-blur-3xl flex items-center justify-center p-6">
               <div className="p-8 rounded-3xl border border-white/10 bg-surface/90 backdrop-blur-2xl max-w-xl w-full text-center relative shadow-2xl">
                  <RippleButton rippleColor="#ADD8E6" onClick={() => setShowSelfieCam(false)} className="absolute top-6 right-6 text-text-muted hover:text-white transition-colors bg-transparent border-0 !p-1">
                    <X size={24} />
                  </RippleButton>
                  <div className="w-16 h-16 rounded-2xl bg-accent-cyan/10 border border-accent-cyan/20 flex items-center justify-center text-accent-cyan mx-auto mb-6"><User size={32} /></div>
                  <h2 className="text-3xl font-bold mb-2 text-white">Find My Photos</h2>
                  <p className="text-text-secondary mb-8 text-sm">Our AI will scan the entire wall and find every moment you&apos;re in. Private and instant.</p>
                  
                  <div className="aspect-square w-full max-w-[300px] mx-auto overflow-hidden rounded-full border-4 border-accent-cyan/30 mb-8 relative">
                     <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg" className="w-full h-full object-cover" mirrored />
                     <div className="absolute inset-0 border-8 border-transparent border-t-accent-cyan animate-spin" style={{ animationDuration: '3s' }} />
                  </div>
                  
                  <RippleButton 
                    rippleColor="#ADD8E6"
                    onClick={captureSelfieAndSearch} 
                    disabled={isSearching} 
                    className="btn btn-primary w-full !py-4 flex items-center justify-center gap-3 text-sm font-bold"
                  >
                     {isSearching ? <div className="w-5 h-5 border-2 border-white/20 border-t-accent-cyan rounded-full animate-spin" /> : <Camera size={20} />}
                     {isSearching ? 'Scanning Memories...' : 'Start Facial Match'}
                  </RippleButton>
               </div>
            </motion.div>
         )}
      </AnimatePresence>

      <Confetti trigger={confettiTrigger} />

      {/* Mobile Upload & QR Floating CTA */}
      <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-[90] w-[90%] max-w-sm flex gap-3">
         <RippleButton rippleColor="#ADD8E6" onClick={() => setShowMobileQR(true)} className="flex-shrink-0 !w-14 !h-14 bg-surface/80 border border-white/10 shadow-xl rounded-2xl flex items-center justify-center text-white !p-0">
            <QrCode size={24} />
         </RippleButton>
         <Link href={uploadUrl} target="_blank" className="flex-grow">
            <RippleButton rippleColor="#ADD8E6" className="btn btn-primary w-full !h-14 shadow-2xl flex items-center justify-center gap-3 text-sm rounded-2xl font-bold">
               <Upload size={18} /> Upload Photos
            </RippleButton>
         </Link>
      </div>

      {/* Mobile QR Modal */}
      <AnimatePresence>
         {showMobileQR && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[2000] bg-black/90 backdrop-blur-3xl flex items-center justify-center p-6">
               <div className="p-8 rounded-3xl border border-white/10 bg-surface/90 backdrop-blur-2xl w-full max-w-sm text-center relative flex flex-col items-center shadow-2xl">
                  <RippleButton rippleColor="#ADD8E6" onClick={() => setShowMobileQR(false)} className="absolute top-4 right-4 text-text-muted hover:text-white transition-colors bg-transparent border-0 !p-1">
                     <X size={24} />
                  </RippleButton>
                  <div className="p-4 bg-white/10 rounded-2xl shadow-2xl mb-6 border border-white/10">
                     <QRCode value={uploadUrl} size={180} bgColor="transparent" fgColor="#ffffff" qrStyle="dots" eyeRadius={10} />
                  </div>
                  <h3 className="text-2xl font-bold mb-2 text-white">Scan to Join</h3>
                  <p className="text-text-secondary text-xs">Scan this QR code to upload memories directly to the wall.</p>
               </div>
            </motion.div>
         )}
      </AnimatePresence>

    </div>
  );
}
