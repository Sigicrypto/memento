"use client";

import React, { useEffect, useState, useRef } from 'react';
import { QRCode } from 'react-qrcode-logo';
import { X, Maximize2, Minimize2, Image as ImageIcon, Grid, Play, Pause, Heart, Music, SkipForward, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import {
  clearDemoData,
  DemoMedia,
  getDemoPhotosKey,
  getDemoTimeLeft,
  getOrCreateDemoExpiry,
  getOrCreateDemoId,
  readDemoPhotos,
  writeDemoPhotos,
} from '@/lib/demoWall';
import AnimatedLogo from '@/components/AnimatedLogo';
import CircularGallery from '@/components/CircularGallery';
import FloatingParticles from '@/components/FloatingParticles';

type ViewMode = 'grid' | 'polaroid' | 'slideshow';

function isViewMode(value: string): value is ViewMode {
  return value === 'grid' || value === 'polaroid' || value === 'slideshow';
}

function mergeDemoMedia(items: DemoMedia[], incoming: DemoMedia) {
  return [incoming, ...items.filter((item) => item.id !== incoming.id && item.url !== incoming.url)];
}

const INITIAL_SAMPLE_PHOTOS: DemoMedia[] = [
  { id: 'sample-1', url: '/sample-photos/wedding-day.jpg', type: 'image', caption: 'Pure magic under the golden lights ✨', uploader: 'Priya & Rohan', createdAt: Date.now() - 60000 * 5 },
  { id: 'sample-2', url: '/sample-photos/corporate-event.jpg', type: 'image', caption: 'Keynote opening at Tech Summit 2026 🚀', uploader: 'Alex M.', createdAt: Date.now() - 60000 * 12 },
  { id: 'sample-3', url: '/sample-photos/birthday-party.jpg', type: 'image', caption: '25th Birthday Bash! Unforgettable night 🎉', uploader: 'Sara & Crew', createdAt: Date.now() - 60000 * 25 },
  { id: 'sample-4', url: '/sample-photos/family-reunion.jpg', type: 'image', caption: 'Annual Leadership Gala Excellence Award 🏆', uploader: 'Marcus Vance', createdAt: Date.now() - 60000 * 40 },
  { id: 'sample-5', url: '/sample-photos/graduation-day.jpg', type: 'image', caption: 'Class of 2026! We did it! 🎓', uploader: 'David & Friends', createdAt: Date.now() - 60000 * 60 },
  { id: 'sample-6', url: '/sample-photos/music-festival.jpg', type: 'image', caption: 'Main stage laser show at Sunset Beats 🎶', uploader: 'Maya Lin', createdAt: Date.now() - 60000 * 90 },
];

export default function DemoModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [viewMode, setViewMode] = useState<ViewMode>('slideshow');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [demoId, setDemoId] = useState<string>('');
  const [photos, setPhotos] = useState<DemoMedia[]>([]);
  const [timeLeft, setTimeLeft] = useState(300);
  const [isConnected, setIsConnected] = useState(false);
  const [uploadUrl, setUploadUrl] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [demoReactions, setDemoReactions] = useState<Record<string, number>>({});
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const fsDotRef = useRef<HTMLDivElement>(null);
  const fsOuterRef = useRef<HTMLDivElement>(null);
  
  const TRACKS = ['/music/piano.mp3', '/music/pleasant.mp3', '/music/acoustic.mp3', '/music/upbeat.mp3'];

  useEffect(() => {
    if (!isOpen) return;
    
    const newDemoId = getOrCreateDemoId(new URLSearchParams(window.location.search).get('id'));
    const expiryAt = getOrCreateDemoExpiry(newDemoId);
    
    const syncCountdown = () => {
      const remainingSeconds = Math.ceil(getDemoTimeLeft(newDemoId) / 1000);
      setTimeLeft(remainingSeconds);
      if (remainingSeconds <= 0) {
        clearDemoData(newDemoId);
        if (isOpen) {
           onClose();
        }
      }
    };

    setDemoId(newDemoId);
    let existing = readDemoPhotos(newDemoId);
    if (existing.length === 0) {
      writeDemoPhotos(newDemoId, INITIAL_SAMPLE_PHOTOS);
      existing = INITIAL_SAMPLE_PHOTOS;
    }
    setPhotos(existing);
    setTimeLeft(Math.max(0, Math.ceil((expiryAt - Date.now()) / 1000)));
    syncCountdown();
    
    const timerInterval = setInterval(syncCountdown, 1000);
    return () => clearInterval(timerInterval);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!demoId || !isOpen) return;

    const syncFromStorage = () => setPhotos(readDemoPhotos(demoId));
    syncFromStorage();

    const handleStorage = (event: StorageEvent) => {
      if (!event.key || event.key === getDemoPhotosKey(demoId)) {
        syncFromStorage();
      }
    };

    window.addEventListener('storage', handleStorage);

    const addPhoto = (newPhoto: DemoMedia) => {
      setPhotos(prev => {
        const updatedPhotos = mergeDemoMedia(prev, newPhoto);
        writeDemoPhotos(demoId, updatedPhotos);
        return updatedPhotos;
      });
    };

    let lastPollTime = new Date().toISOString();
    const pollDb = async () => {
      try {
        const { data, error } = await supabase
          .from('demo_uploads')
          .select('*')
          .eq('demo_id', demoId)
          .order('created_at', { ascending: false })
          .limit(50);
        
        if (error) {
          console.warn('[DemoModal] DB poll error:', error);
          setIsConnected(false);
          return;
        }
        
        if (!data) return;
        
        const dbPhotos: DemoMedia[] = data.map((row: any) => ({
          id: row.id,
          url: row.url,
          type: row.type === 'video' ? 'video' as const : 'image' as const,
          caption: row.caption || '',
          uploader: row.uploader || 'Demo Guest',
          createdAt: new Date(row.created_at).getTime(),
        }));
        
        if (dbPhotos.length > 0) {
          setPhotos(prev => {
            const existingUrls = new Set(prev.map(p => p.url));
            const newOnes = dbPhotos.filter(p => !existingUrls.has(p.url));
            if (newOnes.length === 0) return prev;
            const merged = [...newOnes, ...prev];
            writeDemoPhotos(demoId, merged);
            return merged;
          });
        }
      } catch (err) {
        console.warn('[DemoModal] DB poll exception:', err);
      }
    };
    
    // Initial fetch + periodic polling
    pollDb();
    const pollInterval = setInterval(pollDb, 3000);

    // ── Realtime: postgres_changes (instant, but may silently fail) ──
    const dbChannel = supabase
      .channel(`demo-db-${demoId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'demo_uploads', filter: `demo_id=eq.${demoId}` },
        (payload) => {
          const row = payload.new as { id: string; url: string; type: string; caption: string; uploader: string; created_at: string };
          if (!row.url || !row.type) return;

          addPhoto({
            id: row.id,
            url: row.url,
            type: row.type === 'video' ? 'video' : 'image',
            caption: row.caption || '',
            uploader: row.uploader || 'Demo Guest',
            createdAt: new Date(row.created_at).getTime(),
          });
        }
      )
      .subscribe((status) => {
        console.log('[DemoModal] DB channel status:', status);
        setIsConnected(status === 'SUBSCRIBED');
      });

    // ── Realtime: broadcast (instant, peer-to-peer) ──
    const bcastChannel = supabase.channel(`demo-${demoId}`);
    bcastChannel.on('broadcast', { event: 'NEW_UPLOAD' }, (payload) => {
      console.log('[DemoModal] Broadcast received:', payload);
      const data = payload.payload as Partial<DemoMedia>;
      if (!data.url || !data.type) return;
      addPhoto({
        id: String(data.id || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`),
        url: data.url,
        type: data.type === 'video' ? 'video' : 'image',
        caption: data.caption || '',
        uploader: data.uploader || 'Demo Guest',
        createdAt: typeof data.createdAt === 'number' ? data.createdAt : Date.now(),
      });
    });
    bcastChannel.subscribe((status) => {
      console.log('[DemoModal] Broadcast channel status:', status);
    });

    return () => {
      clearInterval(pollInterval);
      window.removeEventListener('storage', handleStorage);
      supabase.removeChannel(dbChannel);
      supabase.removeChannel(bcastChannel);
    };
  }, [demoId, isOpen]);

  useEffect(() => {
    if (audioRef.current) {
      if (isAudioPlaying) {
        audioRef.current.play().catch(() => {
          // Browser autoplay policy might block this
          setIsAudioPlaying(false);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [currentTrack, isAudioPlaying]);

  useEffect(() => {
    if (photos.length > 0 && currentSlide >= photos.length) {
      setCurrentSlide(0);
    }
  }, [currentSlide, photos.length]);

  useEffect(() => {
    if (viewMode === 'slideshow' && isPlaying && photos.length > 1 && isOpen) {
      const current = photos[currentSlide];
      if (current?.type === 'video') return;

      const timer = setTimeout(() => {
        setCurrentSlide((prev) => (prev + 1) % photos.length);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [viewMode, isPlaying, currentSlide, photos.length, isOpen]);

  useEffect(() => {
    if (demoId) {
      setUploadUrl(`${window.location.origin}/demo/upload?id=${demoId}`);
    }
  }, [demoId]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isFullscreen) onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose, isFullscreen]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      modalRef.current?.requestFullscreen().catch((err: Error) => {
      });
    } else {
      document.exitFullscreen();
    }
  };

  const handleReaction = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setDemoReactions(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  useEffect(() => {
    if (!isFullscreen || !modalRef.current) return;
    let outerX = 0, outerY = 0;
    let raf: number;
    let mx = 0, my = 0;

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      if (fsDotRef.current) {
        fsDotRef.current.style.left = `${mx}px`;
        fsDotRef.current.style.top = `${my}px`;
        fsDotRef.current.style.opacity = '1';
      }
    };

    const loop = () => {
      outerX += (mx - outerX) * 0.12;
      outerY += (my - outerY) * 0.12;
      if (fsOuterRef.current) {
        fsOuterRef.current.style.left = `${outerX}px`;
        fsOuterRef.current.style.top = `${outerY}px`;
        fsOuterRef.current.style.opacity = '1';
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const el = modalRef.current;
    el.addEventListener('mousemove', onMove);
    return () => {
      el.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(raf);
      if (fsDotRef.current) fsDotRef.current.style.opacity = '0';
      if (fsOuterRef.current) fsOuterRef.current.style.opacity = '0';
    };
  }, [isFullscreen]);

  if (!isOpen) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="fixed inset-0 z-[10000]">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/95 backdrop-blur-md"
        onClick={onClose}
      />
      
      <div className={`absolute ${isFullscreen ? 'inset-0' : 'inset-4 sm:inset-8 rounded-[2.5rem] border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.8)] bg-surface'} overflow-hidden`} ref={modalRef}>
        {isFullscreen && (
          <>
            <div ref={fsOuterRef} className="fixed pointer-events-none z-[99999] w-10 h-10 -translate-x-1/2 -translate-y-1/2 border-2 border-primary/30 rounded-full transition-opacity duration-300" />
            <div ref={fsDotRef} className="fixed pointer-events-none z-[100000] w-2 h-2 -translate-x-1/2 -translate-y-1/2 bg-primary rounded-full shadow-[0_0_15px_var(--primary)] transition-opacity duration-300" />
          </>
        )}
        <audio ref={audioRef} loop src={TRACKS[currentTrack]} />

        {/* Landing Page Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 bg-bg lp">
           <div className="grain" />
           <div className="orbs">
             <div className="orb orb-primary" />
             <div className="orb orb-secondary" />
           </div>
           <FloatingParticles className="opacity-60" />
        </div>
        
        {/* TOP FLOATING HEADER - ULTRA MINIMAL */}
        


        <div className="absolute top-8 left-8 right-8 flex items-start justify-between z-50 pointer-events-none">
           <div className="flex items-center gap-8 pointer-events-auto">
              <AnimatedLogo width={120} height={32} />
              <div className="hidden sm:flex items-center gap-4 pl-8 border-l border-white/5">
                  <div className="flex items-center gap-3">
                    <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)] animate-pulse' : 'bg-red-500'}`} />
                    <span className="text-[9px] font-medium tracking-[0.2em] text-white/50">{isConnected ? 'LIVE' : 'RECONNECTING'}</span>
                  </div>
                  <div className="w-1 h-1 rounded-full bg-white/10" />
                  <div>
                    <span className="text-[9px] font-medium tracking-[0.2em] text-white/50">{minutes}:{seconds < 10 ? `0${seconds}` : seconds} REMAINING</span>
                  </div>
                  <div className="w-1 h-1 rounded-full bg-white/10" />
                  <div>
                    <span className="text-[9px] font-medium tracking-[0.2em] text-white/50">SESSION: {demoId}</span>
                  </div>
              </div>
           </div>
        </div>
        
        {/* BOTTOM LEFT QR - DOT MATRIX */}
        <div className="absolute bottom-8 left-8 z-50 pointer-events-auto hidden md:flex flex-col items-center group">
           <div className="p-5 bg-white/5 backdrop-blur-3xl rounded-[2rem] border border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.5)] transition-all duration-700 hover:bg-white/10 hover:border-white/20 hover:-translate-y-2">
             <div className="mb-4 text-center">
                <span className="text-[10px] font-medium tracking-[0.3em] text-white/60 uppercase">Join Wall</span>
             </div>
             <div className="bg-white/10 p-4 rounded-2xl">
               {uploadUrl ? (
                 <QRCode
                   value={uploadUrl}
                   size={140}
                   bgColor="transparent"
                   fgColor="#ffffff"
                   qrStyle="dots"
                   eyeRadius={12}
                 />
               ) : (
                 <div className="w-[140px] h-[140px] border border-white/10 rounded-2xl animate-pulse" />
               )}
             </div>
           </div>
         </div>



         {/* BOTTOM RIGHT - ADD PHOTOS BUTTON */}
         <div className="absolute bottom-8 right-8 z-50 pointer-events-auto">
            <a 
              href={uploadUrl} 
              target="_blank" 
              rel="noreferrer" 
              className="inline-flex items-center justify-center bg-gradient-to-r from-amber-500 to-pink-500 hover:from-amber-400 hover:to-pink-400 text-white rounded-full transition-all shadow-[0_15px_30px_rgba(245,158,11,0.4)] hover:shadow-[0_20px_40px_rgba(245,158,11,0.6)] font-black uppercase tracking-widest text-[10px] hover:-translate-y-1 whitespace-nowrap"
              style={{ padding: '6px 16px' }}
            >
              Add Photos
            </a>
         </div>

         {/* BOTTOM FLOATING DOCK - PREMIUM GLASS */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 pointer-events-auto">
           <div className="flex items-center p-2 bg-black/40 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-[0_30px_60px_rgba(0,0,0,0.6)]">
              
              {/* Music Controls */}
              <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl">
                 <button onClick={() => {
                   setIsAudioPlaying(!isAudioPlaying);
                   if (audioRef.current) {
                     if (isAudioPlaying) audioRef.current.pause();
                     else audioRef.current.play();
                   }
                 }} className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-300 ${isAudioPlaying ? 'bg-white/10 text-white shadow-inner' : 'text-white/40 hover:text-white/90 hover:bg-white/5'}`}>
                   {isAudioPlaying ? <Pause size={16} /> : <Music size={16} />}
                   <span className="text-[10px] uppercase font-bold tracking-widest">{isAudioPlaying ? 'Playing' : 'Music'}</span>
                 </button>
                 
                 {isAudioPlaying && (
                   <button onClick={() => setCurrentTrack((prev) => (prev + 1) % TRACKS.length)} className="px-3 py-2.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-all">
                     <SkipForward size={16} />
                   </button>
                 )}
              </div>

              <div className="w-px h-8 bg-white/10 mx-3" />

              {/* View Controls */}
              <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl">
                <button onClick={() => setViewMode('polaroid')} className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-300 ${viewMode === 'polaroid' ? 'bg-white/10 text-white shadow-inner' : 'text-white/40 hover:text-white/90 hover:bg-white/5'}`}>
                  <ImageIcon size={16} />
                  <span className="text-[10px] uppercase font-bold tracking-widest hidden sm:inline">Polaroid</span>
                </button>
                <button onClick={() => { setViewMode('slideshow'); setCurrentSlide(0); setIsPlaying(true); }} className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-300 ${viewMode === 'slideshow' ? 'bg-white/10 text-white shadow-inner' : 'text-white/40 hover:text-white/90 hover:bg-white/5'}`}>
                  <Play size={16} />
                  <span className="text-[10px] uppercase font-bold tracking-widest hidden sm:inline">Slideshow</span>
                </button>
              </div>

              <div className="w-px h-8 bg-white/10 mx-3" />

              {/* Window Controls */}
              <div className="flex items-center gap-1 p-1">
                <button onClick={toggleFullscreen} className="p-3 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-all">
                  {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                </button>
                <button onClick={onClose} className="p-3 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-400/10 transition-all">
                  <X size={18} />
                </button>
              </div>
           </div>
        </div>

        {/* MAIN CANVAS */}
        <div className="absolute inset-0 overflow-y-auto custom-scrollbar z-10 pt-32 pb-32 px-8">
           {photos.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center px-4">
                 <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-8 border border-white/10 shadow-2xl">
                   <ImageIcon size={40} className="text-white/40" />
                 </div>
                 <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Waiting for first photo...</h2>
                 <p className="text-white/60 max-w-sm text-sm md:text-lg mb-8">Scan the corner QR code or click below to upload a photo and watch it appear instantly.</p>
                 <a href={uploadUrl} target="_blank" rel="noreferrer" className="px-8 py-4 bg-white text-black rounded-full font-bold uppercase tracking-widest text-xs hover:bg-white/90 transition-colors shadow-[0_0_40px_rgba(255,255,255,0.3)]">
                    Upload Photo
                 </a>
              </div>
           ) : (
              <>
                {viewMode === 'polaroid' && (
                  <div className="flex flex-wrap justify-center gap-12 py-10 max-w-[2000px] mx-auto">
                     {photos.map((photo, i) => (
                       <motion.div 
                         key={photo.id} 
                         initial={{ opacity: 0, scale: 0.8 }}
                         animate={{ opacity: 1, scale: 1, rotate: (i % 7) * 4 - 12 }}
                         transition={{ delay: i * 0.1, type: 'spring' }}
                         whileHover={{ scale: 1.1, rotate: 0, zIndex: 50, transition: { type: "spring", stiffness: 300, damping: 20 } }}
                         className="bg-white/5 backdrop-blur-3xl p-4 border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.6)] hover:shadow-[0_40px_80px_rgba(0,0,0,0.8)] rounded-3xl w-72 flex-shrink-0 relative group cursor-pointer flex flex-col"
                       >
                          {/* Tape */}
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-8 bg-white/10 backdrop-blur-xl rotate-[-3deg] border border-white/10 shadow-sm z-20" style={{ clipPath: 'polygon(2% 15%, 98% 5%, 95% 95%, 5% 90%)' }} />
                          
                          <div className="aspect-[4/5] w-full shrink-0 overflow-hidden bg-black/20 rounded-2xl shadow-inner relative border border-white/5">
                            {photo.type === 'video' ? (
                              <video src={photo.url} className="w-full h-full object-cover" autoPlay muted loop playsInline preload="metadata" />
                            ) : (
                              <img src={photo.url} className="w-full h-full object-cover" alt="Upload" loading="lazy" />
                            )}
                            {/* Gloss overlay */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/0 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                          </div>
                          
                          <div className="pt-5 pb-2 px-2 flex flex-col flex-grow justify-center">
                             {photo.caption && <p className="text-white/90 font-medium text-lg text-center leading-tight drop-shadow-md mb-3 whitespace-pre-wrap">{photo.caption}</p>}
                             <div className="flex justify-center items-center gap-4 text-[9px] font-black text-white/40 uppercase tracking-[0.2em] opacity-50 group-hover:opacity-100 transition-opacity duration-300">
                               <span>BY {photo.uploader}</span>
                               <button onClick={(e) => handleReaction(photo.id, e)} className="hover:text-pink-400 transition-colors flex items-center gap-1.5 px-2 py-1 bg-white/5 rounded-full">
                                 <Heart size={12} className={demoReactions[photo.id] ? 'fill-pink-400 text-pink-400' : ''} /> {demoReactions[photo.id] || 0}
                               </button>
                             </div>
                          </div>
                       </motion.div>
                     ))}
                  </div>
                )}

                {viewMode === 'slideshow' && (
                  <div className="h-full flex items-center justify-center min-h-[600px] relative group">
                     {/* LEFT ARROW */}
                     <button 
                       onClick={(e) => { e.stopPropagation(); setCurrentSlide((prev) => (prev - 1 + photos.length) % photos.length); setIsPlaying(false); }} 
                       className="absolute left-8 z-50 p-4 rounded-full bg-black/40 text-white/50 hover:text-white hover:bg-black/80 backdrop-blur-md transition-all shadow-xl border border-white/10 opacity-0 group-hover:opacity-100"
                     >
                        <ChevronLeft size={32} />
                     </button>
                     
                     <AnimatePresence mode="wait">
                       <motion.div 
                         key={photos[currentSlide]?.id}
                         initial={{ opacity: 0, scale: 1.1 }}
                         animate={{ opacity: 1, scale: 1 }}
                         exit={{ opacity: 0, scale: 0.95 }}
                         transition={{ duration: 0.8 }}
                         className="relative w-full h-full max-h-[700px] flex items-center justify-center rounded-[3rem] overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.6)] border border-white/10 bg-black/40 backdrop-blur-md"
                       >
                          {photos[currentSlide]?.type === 'video' ? (
                             <video src={photos[currentSlide]?.url} className="w-full h-full object-contain" autoPlay muted onEnded={() => setCurrentSlide((prev) => (prev + 1) % photos.length)} playsInline preload="metadata" />
                          ) : (
                             <img src={photos[currentSlide]?.url} className="w-full h-full object-contain" alt="Upload" />
                          )}
                          <div className="absolute bottom-10 left-10 p-8 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 max-w-md">
                             <h3 className="text-2xl font-bold text-white mb-2">{photos[currentSlide]?.caption}</h3>
                             <p className="text-pink-400 font-bold tracking-widest text-xs uppercase">by {photos[currentSlide]?.uploader}</p>
                          </div>
                       </motion.div>
                     </AnimatePresence>

                     {/* RIGHT ARROW */}
                     <button 
                       onClick={(e) => { e.stopPropagation(); setCurrentSlide((prev) => (prev + 1) % photos.length); setIsPlaying(false); }} 
                       className="absolute right-8 z-50 p-4 rounded-full bg-black/40 text-white/50 hover:text-white hover:bg-black/80 backdrop-blur-md transition-all shadow-xl border border-white/10 opacity-0 group-hover:opacity-100"
                     >
                        <ChevronRight size={32} />
                     </button>
                  </div>
                )}
              </>
           )}
        </div>
      </div>
    </div>
  );
}
