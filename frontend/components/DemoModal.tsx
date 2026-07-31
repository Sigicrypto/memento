"use client";

import React, { useEffect, useState, useRef } from 'react';
import { QRCode } from 'react-qrcode-logo';
import { X, Maximize2, Minimize2, Image as ImageIcon, Grid, Play, Pause, Heart, Music, SkipForward } from 'lucide-react';
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

type ViewMode = 'grid' | 'polaroid' | 'slideshow';

function isViewMode(value: string): value is ViewMode {
  return value === 'grid' || value === 'polaroid' || value === 'slideshow';
}

function mergeDemoMedia(items: DemoMedia[], incoming: DemoMedia) {
  return [incoming, ...items.filter((item) => item.id !== incoming.id && item.url !== incoming.url)];
}

export default function DemoModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
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
  
  const TRACKS = ['/music/lofi.mp3', '/music/acoustic.mp3', '/music/upbeat.mp3'];

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
    setPhotos(readDemoPhotos(newDemoId));
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
        setIsConnected(status === 'SUBSCRIBED');
      });

    const bcastChannel = supabase.channel(`demo-wall-${demoId}`);
    bcastChannel.on('broadcast', { event: 'NEW_UPLOAD' }, (payload) => {
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
    bcastChannel.subscribe();

    return () => {
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
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-8">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/95 backdrop-blur-md"
        onClick={onClose}
      />
      
      <div className={`w-full h-full flex flex-col relative overflow-hidden ${isFullscreen ? '' : 'rounded-[2.5rem] max-w-[100vw] max-h-[100vh] border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.8)] bg-surface'}`} ref={modalRef}>
        {isFullscreen && (
          <>
            <div ref={fsOuterRef} className="fixed pointer-events-none z-[99999] w-10 h-10 -translate-x-1/2 -translate-y-1/2 border-2 border-primary/30 rounded-full transition-opacity duration-300" />
            <div ref={fsDotRef} className="fixed pointer-events-none z-[100000] w-2 h-2 -translate-x-1/2 -translate-y-1/2 bg-primary rounded-full shadow-[0_0_15px_var(--primary)] transition-opacity duration-300" />
          </>
        )}
        <audio ref={audioRef} loop src={TRACKS[currentTrack]} />

        {/* ULTRA-MINIMAL ATMOSPHERIC BACKGROUND */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 bg-[#0a0a0a]">
           <div className="absolute top-1/4 left-1/4 w-[50%] h-[50%] bg-purple-900/20 blur-[200px] rounded-full animate-pulse duration-10000 mix-blend-screen" />
           <div className="absolute bottom-1/4 right-1/4 w-[40%] h-[40%] bg-blue-900/20 blur-[200px] rounded-full animate-pulse duration-7000 mix-blend-screen" />
           <div className="absolute inset-0 bg-[url('/noise.png')] opacity-30 mix-blend-overlay" />
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
                <button onClick={() => setViewMode('grid')} className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-300 ${viewMode === 'grid' ? 'bg-white/10 text-white shadow-inner' : 'text-white/40 hover:text-white/90 hover:bg-white/5'}`}>
                  <Grid size={16} />
                  <span className="text-[10px] uppercase font-bold tracking-widest hidden sm:inline">Grid</span>
                </button>
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
        <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10 pt-32 pb-32 px-8">
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
                {viewMode === 'grid' && (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 mx-auto max-w-[2000px]">
                     {photos.map((photo, i) => (
                       <motion.div 
                         key={photo.id} 
                         initial={{ opacity: 0, scale: 0.9, y: 20 }}
                         animate={{ opacity: 1, scale: 1, y: 0 }}
                         transition={{ delay: i * 0.05, type: 'spring' }}
                         className="group relative aspect-[4/5] rounded-2xl overflow-hidden border border-white/10 hover:border-white/30 transition-all shadow-[0_10px_30px_rgba(0,0,0,0.5)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.8)] hover:-translate-y-2 cursor-pointer bg-black/40"
                       >
                          {photo.type === 'video' ? (
                            <video src={photo.url} className="w-full h-full object-cover" autoPlay muted loop playsInline preload="metadata" />
                          ) : (
                            <img src={photo.url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Upload" loading="lazy" />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 p-6 flex flex-col justify-end">
                             <p className="text-white text-lg font-light tracking-wide line-clamp-2 mb-3 translate-y-6 group-hover:translate-y-0 transition-transform duration-500">{photo.caption}</p>
                             <div className="flex justify-between items-center translate-y-6 group-hover:translate-y-0 transition-transform duration-500 delay-75">
                               <p className="text-white/40 text-[9px] uppercase font-bold tracking-[0.2em]">by <span className="text-white/80">{photo.uploader}</span></p>
                               <button onClick={(e) => handleReaction(photo.id, e)} className="text-white/80 hover:text-pink-400 transition-colors flex items-center gap-1.5 text-[10px] font-bold bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-md">
                                 <Heart size={12} className={demoReactions[photo.id] ? 'fill-pink-400 text-pink-400' : ''} /> {demoReactions[photo.id] || 0}
                               </button>
                             </div>
                          </div>
                       </motion.div>
                     ))}
                  </div>
                )}

                {viewMode === 'polaroid' && (
                  <div className="flex flex-wrap justify-center gap-12 py-10 max-w-[2000px] mx-auto">
                     {photos.map((photo, i) => (
                       <motion.div 
                         key={photo.id} 
                         initial={{ opacity: 0, scale: 0.8 }}
                         animate={{ opacity: 1, scale: 1, rotate: (i % 7) * 4 - 12 }}
                         transition={{ delay: i * 0.1, type: 'spring' }}
                         whileHover={{ scale: 1.1, rotate: 0, zIndex: 50, transition: { type: "spring", stiffness: 300, damping: 20 } }}
                         className="bg-white/5 backdrop-blur-3xl p-4 pb-24 border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.6)] hover:shadow-[0_40px_80px_rgba(0,0,0,0.8)] rounded-3xl w-72 flex-shrink-0 relative group cursor-pointer"
                       >
                          {/* Tape */}
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-8 bg-white/10 backdrop-blur-xl rotate-[-3deg] border border-white/10 shadow-sm z-20" style={{ clipPath: 'polygon(2% 15%, 98% 5%, 95% 95%, 5% 90%)' }} />
                          
                          <div className="aspect-[4/5] overflow-hidden bg-black/20 rounded-2xl shadow-inner relative border border-white/5">
                            {photo.type === 'video' ? (
                              <video src={photo.url} className="w-full h-full object-cover" autoPlay muted loop playsInline preload="metadata" />
                            ) : (
                              <img src={photo.url} className="w-full h-full object-cover" alt="Upload" loading="lazy" />
                            )}
                            {/* Gloss overlay */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/0 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                          </div>
                          
                          <div className="absolute bottom-6 left-0 right-0 px-6">
                             <p className="text-white/90 font-medium text-lg text-center line-clamp-2 leading-tight drop-shadow-md mb-2">{photo.caption}</p>
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
                   <div className="h-full min-h-[600px] flex items-center justify-center relative">
                      <div className="absolute inset-0 bg-white/5 blur-[100px] rounded-full" />
                      <AnimatePresence mode="wait">
                        <motion.div 
                          key={photos[currentSlide]?.id}
                          initial={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
                          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                          exit={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
                          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                          className="relative w-full max-w-[80vw] h-[75vh] flex items-center justify-center rounded-[3rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.6)] border border-white/10 bg-black/20 backdrop-blur-md"
                        >
                          {photos[currentSlide]?.type === 'video' ? (
                             <video src={photos[currentSlide]?.url} className="w-full h-full object-contain" autoPlay muted onEnded={() => setCurrentSlide((prev) => (prev + 1) % photos.length)} playsInline preload="metadata" />
                          ) : (
                             <img src={photos[currentSlide]?.url} className="w-full h-full object-contain drop-shadow-2xl" alt="Upload" />
                          )}
                          <div className="absolute bottom-12 left-12 p-8 rounded-3xl bg-black/40 backdrop-blur-2xl border border-white/10 max-w-lg shadow-2xl">
                             <h3 className="text-5xl font-light text-white mb-6 leading-tight tracking-wide">{photos[currentSlide]?.caption}</h3>
                             <div className="flex items-center gap-8">
                               <p className="text-white/40 font-bold tracking-[0.2em] text-xs uppercase">by <span className="text-white/80">{photos[currentSlide]?.uploader}</span></p>
                               <button onClick={(e) => photos[currentSlide] && handleReaction(photos[currentSlide].id, e)} className="text-white hover:text-pink-400 transition-colors flex items-center gap-2 text-sm font-bold px-5 py-2.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 backdrop-blur-xl">
                                 <Heart size={16} className={photos[currentSlide] && demoReactions[photos[currentSlide].id] ? 'fill-pink-400 text-pink-400' : ''} /> {photos[currentSlide] ? (demoReactions[photos[currentSlide].id] || 0) : 0}
                               </button>
                             </div>
                          </div>
                       </motion.div>
                     </AnimatePresence>
                  </div>
                )}
              </>
           )}
        </div>
      </div>
    </div>
  );
}
