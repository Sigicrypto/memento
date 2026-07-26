"use client";

import React, { useEffect, useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Maximize2, Minimize2, Image as ImageIcon, Grid, Play, Pause, Heart, Music } from 'lucide-react';
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
import '../app/auth-dialog.css';

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
  const [demoReactions, setDemoReactions] = useState<Record<string, number>>({});
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const fsDotRef = useRef<HTMLDivElement>(null);
  const fsOuterRef = useRef<HTMLDivElement>(null);

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
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className={`glass-panel w-full max-w-7xl h-full max-h-[900px] flex flex-col relative ${isFullscreen ? 'fixed inset-0 max-w-none max-h-none rounded-none' : ''}`} ref={modalRef}>
        {isFullscreen && (
          <>
            <div ref={fsOuterRef} className="fixed pointer-events-none z-[99999] w-10 h-10 -translate-x-1/2 -translate-y-1/2 border-2 border-primary/30 rounded-full transition-opacity duration-300" />
            <div ref={fsDotRef} className="fixed pointer-events-none z-[100000] w-2 h-2 -translate-x-1/2 -translate-y-1/2 bg-primary rounded-full shadow-[0_0_15px_var(--primary)] transition-opacity duration-300" />
          </>
        )}
        {isAudioPlaying && <audio ref={audioRef} autoPlay loop src="/music/lofi.mp3" />}
        
        <div className="h-20 flex items-center justify-between px-6 border-b border-black/20 dark:border-black/10 dark:border-white/5 bg-white/5">
           <div className="flex items-center gap-6">
              <AnimatedLogo width={140} height={40} />
              <div className="hidden sm:flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-border">
                    <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-secondary' : 'bg-red-500'} ${isConnected ? 'animate-pulse' : ''}`} />
                    <span className="text-[10px] font-bold tracking-widest text-text-secondary">{isConnected ? 'LIVE CONNECTION' : 'RECONNECTING...'}</span>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-white/5 border border-border">
                    <span className="text-[10px] font-bold tracking-widest text-text-secondary">{minutes}:{seconds < 10 ? `0${seconds}` : seconds} LEFT</span>
                  </div>
              </div>
           </div>
           
           <div className="flex items-center gap-4">
              <button onClick={() => {
                setIsAudioPlaying(!isAudioPlaying);
                if (audioRef.current) {
                  if (isAudioPlaying) audioRef.current.pause();
                  else audioRef.current.play();
                }
              }} className={`p-2 rounded-lg transition-all ${isAudioPlaying ? 'bg-primary text-white shadow-lg' : 'text-text-muted hover:text-text-primary'}`}>
                {isAudioPlaying ? <Pause size={18} /> : <Music size={18} />}
              </button>
              <div className="flex bg-white/5 p-1 rounded-xl">
                <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-primary text-white shadow-lg' : 'text-text-muted hover:text-text-primary'}`}>
                  <Grid size={18} />
                </button>
                <button onClick={() => setViewMode('polaroid')} className={`p-2 rounded-lg transition-all ${viewMode === 'polaroid' ? 'bg-primary text-white shadow-lg' : 'text-text-muted hover:text-text-primary'}`}>
                  <ImageIcon size={18} />
                </button>
                <button onClick={() => { setViewMode('slideshow'); setCurrentSlide(0); setIsPlaying(true); }} className={`p-2 rounded-lg transition-all ${viewMode === 'slideshow' ? 'bg-primary text-white shadow-lg' : 'text-text-muted hover:text-text-primary'}`}>
                  <Play size={18} />
                </button>
              </div>

              <div className="w-px h-6 bg-white/10" />

              <button onClick={toggleFullscreen} className="p-2 text-text-muted hover:text-text-primary transition-all">
                {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
              </button>
              <button onClick={onClose} className="p-2 text-text-muted hover:text-red-500 transition-all">
                <X size={24} />
              </button>
           </div>
        </div>

        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-black/20 dark:border-black/10 dark:border-white/5 p-8 flex flex-col items-center bg-white/20">
               <div className="text-center mb-8">
                  <h3 className="text-xl font-bold text-text-primary mb-2">Join the Wall</h3>
                  <p className="text-sm text-text-secondary">Scan to upload photos and see them live</p>
               </div>

               <div className="p-4 bg-white rounded-2xl shadow-2xl">
                 {uploadUrl ? <QRCodeSVG value={uploadUrl} size={160} level="H" /> : <div className="w-40 h-40 bg-zinc-100 animate-pulse rounded-lg" />}
               </div>

               <div className="mt-auto hidden md:block pt-8">
                 <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                   <p className="text-xs text-text-secondary leading-relaxed">
                     This is a demo wall. Photos uploaded here will be automatically cleared after the timer expires.
                   </p>
                 </div>
               </div>
            </div>

            <div className="flex-1 overflow-y-auto bg-black/20 p-6 md:p-10 custom-scrollbar">
               {photos.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center">
                     <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
                       <ImageIcon size={32} className="text-text-muted" />
                     </div>
                     <h2 className="text-2xl font-bold text-text-primary mb-2">Waiting for first photo...</h2>
                     <p className="text-text-secondary max-w-sm">Use the QR code to upload something beautiful and watch it appear here instantly.</p>
                  </div>
               ) : (
                  <>
                    {viewMode === 'grid' && (
                      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                         {photos.map((photo, i) => (
                           <motion.div 
                             key={photo.id} 
                             initial={{ opacity: 0, y: 20 }}
                             animate={{ opacity: 1, y: 0 }}
                             transition={{ delay: i * 0.05 }}
                             className="group relative aspect-[4/5] rounded-3xl overflow-hidden border border-black/20 dark:border-black/10 dark:border-white/5 hover:border-black/20 dark:border-black/10 dark:border-white/20 transition-all shadow-lg"
                           >
                              {photo.type === 'video' ? (
                                <video src={photo.url} className="w-full h-full object-cover" autoPlay muted loop playsInline preload="metadata" />
                              ) : (
                                <img src={photo.url} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="Upload" loading="lazy" />
                              )}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end">
                                 <p className="text-white text-sm font-medium line-clamp-1">{photo.caption}</p>
                                 <div className="flex justify-between items-center mt-1">
                                   <p className="text-white/60 text-[10px] uppercase font-bold tracking-wider">by {photo.uploader}</p>
                                   <button onClick={(e) => handleReaction(photo.id, e)} className="text-white/60 hover:text-pink-500 transition-colors flex items-center gap-1 text-[10px] font-bold">
                                     <Heart size={14} className={demoReactions[photo.id] ? 'fill-pink-500 text-pink-500' : ''} /> {demoReactions[photo.id] || 0}
                                   </button>
                                 </div>
                              </div>
                           </motion.div>
                         ))}
                      </div>
                    )}

                    {viewMode === 'polaroid' && (
                      <div className="flex flex-wrap justify-center gap-10 py-10">
                         {photos.map((photo, i) => (
                           <motion.div 
                             key={photo.id} 
                             initial={{ opacity: 0, scale: 0.8 }}
                             animate={{ opacity: 1, scale: 1, rotate: (i % 5) * 4 - 8 }}
                             transition={{ delay: i * 0.1, type: 'spring' }}
                             whileHover={{ scale: 1.05, rotate: 0, zIndex: 50 }}
                             className="bg-white p-4 pb-12 shadow-2xl w-64 flex-shrink-0 relative group"
                           >
                              <div className="aspect-[4/5] overflow-hidden bg-zinc-100 mb-4 rounded-sm relative">
                                {photo.type === 'video' ? (
                                  <video src={photo.url} className="w-full h-full object-cover" autoPlay muted loop playsInline preload="metadata" />
                                ) : (
                                  <img src={photo.url} className="w-full h-full object-cover" alt="Upload" loading="lazy" />
                                )}
                              </div>
                              <p className="text-zinc-800 font-medium text-sm text-center font-handwriting line-clamp-2">{photo.caption}</p>
                              <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-4 text-[10px] font-bold text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="uppercase tracking-wider mt-0.5">BY {photo.uploader}</span>
                                <button onClick={(e) => handleReaction(photo.id, e)} className="hover:text-pink-500 transition-colors flex items-center gap-1">
                                  <Heart size={12} className={demoReactions[photo.id] ? 'fill-pink-500 text-pink-500' : ''} /> {demoReactions[photo.id] || 0}
                                </button>
                              </div>
                           </motion.div>
                         ))}
                      </div>
                    )}

                    {viewMode === 'slideshow' && (
                       <div className="h-full flex items-center justify-center relative">
                          <div className="absolute inset-0 bg-primary/5 blur-[100px] rounded-full" />
                          <AnimatePresence mode="wait">
                            <motion.div 
                              key={photos[currentSlide]?.id}
                              initial={{ opacity: 0, scale: 1.05 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              transition={{ duration: 0.8 }}
                              className="relative w-full h-full max-h-[70vh] flex items-center justify-center rounded-[2.5rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.4)] border border-border bg-black/5"
                            >
                              {photos[currentSlide]?.type === 'video' ? (
                                 <video src={photos[currentSlide]?.url} className="w-full h-full object-contain" autoPlay muted onEnded={() => setCurrentSlide((prev) => (prev + 1) % photos.length)} playsInline preload="metadata" />
                              ) : (
                                 <img src={photos[currentSlide]?.url} className="w-full h-full object-contain" alt="Upload" />
                              )}
                              <div className="absolute bottom-10 left-10 p-8 rounded-3xl bg-black/40 backdrop-blur-xl border border-border max-w-md">
                                 <h3 className="text-3xl font-bold text-white mb-3">{photos[currentSlide]?.caption}</h3>
                                 <div className="flex items-center gap-6">
                                   <p className="text-primary font-black tracking-widest text-xs uppercase">by {photos[currentSlide]?.uploader}</p>
                                   <button onClick={(e) => photos[currentSlide] && handleReaction(photos[currentSlide].id, e)} className="text-white/80 hover:text-pink-500 transition-colors flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-white/10 border border-white/20">
                                     <Heart size={14} className={photos[currentSlide] && demoReactions[photos[currentSlide].id] ? 'fill-pink-500 text-pink-500' : ''} /> {photos[currentSlide] ? (demoReactions[photos[currentSlide].id] || 0) : 0}
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
    </div>
  );
}
