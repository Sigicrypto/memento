"use client";



import React, { useEffect, useState, useRef } from 'react';

import { useRouter } from 'next/navigation';

import Link from 'next/link';

import { useAuth } from '@/hooks/useAuth';

import { QRCodeSVG } from 'qrcode.react';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Maximize2, Minimize2, Image as ImageIcon, Grid, Play } from 'lucide-react';

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

import { useAuthModal } from '@/context/AuthModalContext';

import './landing.css';

import './auth-dialog.css';



type ViewMode = 'grid' | 'polaroid' | 'slideshow';



function isViewMode(value: string): value is ViewMode {

  return value === 'grid' || value === 'polaroid' || value === 'slideshow';

}



function mergeDemoMedia(items: DemoMedia[], incoming: DemoMedia) {

  return [incoming, ...items.filter((item) => item.id !== incoming.id && item.url !== incoming.url)];

}



function DemoModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {

  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  const [currentSlide, setCurrentSlide] = useState(0);

  const [isPlaying, setIsPlaying] = useState(true);

  const [demoId, setDemoId] = useState<string>('');

  const [photos, setPhotos] = useState<DemoMedia[]>([]);

  const [timeLeft, setTimeLeft] = useState(300);

  const [isConnected, setIsConnected] = useState(false);

  const [uploadUrl, setUploadUrl] = useState('');

  const [isFullscreen, setIsFullscreen] = useState(false);

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

           // Optional: Show a toast that demo expired

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



    // Primary: postgres_changes on demo_uploads (reliable cross-device)

    console.log('[DEMO WALL] Setting up postgres_changes for demo_id:', demoId);

    const dbChannel = supabase

      .channel(`demo-db-${demoId}`)

      .on(

        'postgres_changes',

        { event: 'INSERT', schema: 'public', table: 'demo_uploads', filter: `demo_id=eq.${demoId}` },

        (payload) => {

          console.log('[DEMO WALL] Received postgres_changes payload:', payload);

          const row = payload.new as { id: string; url: string; type: string; caption: string; uploader: string; created_at: string };

          if (!row.url || !row.type) {

            console.log('[DEMO WALL] Invalid payload - missing url or type');

            return;

          }

          console.log('[DEMO WALL] Adding photo to wall:', row);

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

        console.log('[DEMO WALL] postgres_changes subscription status:', status);

        setIsConnected(status === 'SUBSCRIBED');

      });



    // Fallback: broadcast (same-browser backup)

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



  // Polling fallback: re-fetch demo_uploads every 2s in case realtime is delayed

  useEffect(() => {

    if (!demoId || !isOpen) return;

    console.log('[DEMO WALL] Starting polling for demo_id:', demoId);

    const poll = async () => {

      console.log('[DEMO WALL] Polling demo_uploads for demo_id:', demoId);

      const { data, error } = await supabase

        .from('demo_uploads')

        .select('*')

        .eq('demo_id', demoId)

        .order('created_at', { ascending: false })

        .limit(20);

      console.log('[DEMO WALL] Poll result:', { data, error });

      if (!data?.length) {

        console.log('[DEMO WALL] No data found in poll');

        return;

      }

      console.log('[DEMO WALL] Found', data.length, 'rows in poll');

      setPhotos(prev => {

        let updated = [...prev];

        for (const row of data) {

          const incoming: DemoMedia = {

            id: row.id,

            url: row.url,

            type: row.type === 'video' ? 'video' : 'image',

            caption: row.caption || '',

            uploader: row.uploader || 'Demo Guest',

            createdAt: new Date(row.created_at).getTime(),

          };

          updated = mergeDemoMedia(updated, incoming);

        }

        writeDemoPhotos(demoId, updated);

        return updated;

      });

    };

    poll(); // immediate on mount

    const interval = setInterval(poll, 2000); // poll every 2s

    return () => clearInterval(interval);

  }, [demoId, isOpen]);



  useEffect(() => {

    if (photos.length > 0 && currentSlide >= photos.length) {

      setCurrentSlide(0);

    }

  }, [currentSlide, photos.length]);



  useEffect(() => {

    if (viewMode === 'slideshow' && isPlaying && photos.length > 1 && isOpen) {

      const interval = setInterval(() => {

        setCurrentSlide((prev) => (prev + 1) % photos.length);

      }, 4000);

      return () => clearInterval(interval);

    }

  }, [viewMode, isPlaying, photos.length, isOpen]);



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

        console.error(`Error attempting to enable fullscreen: ${err.message}`);

      });

    } else {

      document.exitFullscreen();

    }

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

    <div className="demo-modal-overlay">

      <div className={`demo-modal-container ${isFullscreen ? 'fullscreen' : ''}`} ref={modalRef}>

        {/* ── Fullscreen custom cursor (only active in fullscreen; position:fixed is relative to the FS viewport) ── */}

        {isFullscreen && (

          <>

            <div ref={fsOuterRef} style={{

              position: 'fixed', pointerEvents: 'none', zIndex: 99999,

              width: 40, height: 40, opacity: 0,

              transform: 'translate(-50%,-50%)',

              transition: 'opacity 0.3s',

              borderRadius: '50%',

              border: '2px solid rgba(245,158,11,0.55)',

              background: 'radial-gradient(circle,rgba(245,158,11,0.1),transparent 70%)',

              animation: 'cursor-ring-pulse 2s ease-in-out infinite',

            }} />

            <div ref={fsDotRef} style={{

              position: 'fixed', pointerEvents: 'none', zIndex: 100000,

              width: 10, height: 10, opacity: 0,

              transform: 'translate(-50%,-50%)',

              transition: 'opacity 0.3s',

              borderRadius: '50%',

              background: 'linear-gradient(135deg,#f59e0b,#f472b6,#fcd34d)',

              boxShadow: '0 0 20px rgba(245,158,11,0.8),0 0 40px rgba(244,114,182,0.6)',

              animation: 'cursor-pulse 2s ease-in-out infinite',

            }} />

          </>

        )}

        

        {/* Header */}

        <div className="demo-modal-header">

           <div className="flex items-center gap-4">

              <AnimatedLogo width={120} height={40} />

              <div className="demo-status-badges hidden sm:flex">

                  <span className="modal-badge live-badge">

                    <span className={`pulse-dot ${isConnected ? 'active' : ''}`} />

                    {isConnected ? 'LIVE' : 'CONNECTING...'}

                  </span>

                  <span className="modal-badge time-badge">

                    {minutes}:{seconds < 10 ? `0${seconds}` : seconds}

                  </span>

              </div>

           </div>

           

           <div className="flex items-center gap-2">

              <button onClick={() => setViewMode('grid')} className={`modal-icon-btn ${viewMode === 'grid' ? 'active' : ''}`} title="Grid View">

                <Grid size={18} />

              </button>

              <button onClick={() => setViewMode('polaroid')} className={`modal-icon-btn ${viewMode === 'polaroid' ? 'active' : ''}`} title="Polaroid View">

                <ImageIcon size={18} />

              </button>

              <button onClick={() => { setViewMode('slideshow'); setCurrentSlide(0); setIsPlaying(true); }} className={`modal-icon-btn ${viewMode === 'slideshow' ? 'active' : ''}`} title="Slideshow View">

                <Play size={18} />

              </button>

              <div className="w-px h-6 bg-white/20 mx-1 hidden sm:block"></div>

              <button onClick={toggleFullscreen} className="modal-icon-btn hidden sm:flex" title="Toggle Fullscreen">

                {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}

              </button>

              <button onClick={onClose} className="modal-icon-btn close-btn" title="Close Demo">

                <X size={20} />

              </button>

           </div>

        </div>



        {/* Content Body */}

        <div className="demo-modal-body">

            

            {/* Sidebar / QR */}

            <div className="demo-modal-sidebar">

               <div className="qr-container-glass">

                  <h3 className="text-lg font-black text-white mb-1">Scan to Upload</h3>
                  <p className="text-xs text-slate-400 mb-4">Point your camera to join the wall</p>

                  <div className="qr-box">

                    {uploadUrl ? <QRCodeSVG value={uploadUrl} size={140} level="M" /> : <div style={{width: 140, height: 140}}/>}

                  </div>

                  <div className="mt-4 text-center sm:hidden">

                    <div className="demo-status-badges flex-col items-center gap-2">

                        <span className="modal-badge live-badge text-xs">

                          <span className={`pulse-dot ${isConnected ? 'active' : ''}`} />

                          {isConnected ? 'LIVE' : 'CONNECTING...'}

                        </span>

                        <span className="modal-badge time-badge text-xs">

                          Resets in {minutes}:{seconds < 10 ? `0${seconds}` : seconds}

                        </span>

                    </div>

                  </div>

               </div>

            </div>



            {/* Main Visual Area */}

            <div className="demo-modal-main relative">

               

               {photos.length === 0 ? (

                  <div className="demo-empty-state">

                     <span className="text-5xl mb-4 block">📷</span>

                     <h2 className="text-2xl font-black text-white mb-2">The wall is empty!</h2>
                     <p className="text-slate-400">Scan the QR code to upload the first photo.</p>

                  </div>

               ) : (

                  <>

                    {/* GRID VIEW */}

                    {viewMode === 'grid' && (

                      <div className="demo-grid-view">

                         {photos.map((photo, i) => (

                           <div key={photo.id} className="demo-grid-item" style={{animationDelay: `${i * 0.05}s`}}>

                              {photo.type === 'video' ? (

                                <video src={photo.url} className="demo-media" autoPlay muted loop playsInline preload="metadata" />

                              ) : (

                                <img src={photo.url} className="demo-media" alt="Upload" loading="lazy" />

                              )}

                              <div className="demo-item-overlay">

                                 <p className="caption font-medium">{photo.caption}</p>

                                 <p className="uploader">by {photo.uploader}</p>

                              </div>

                           </div>

                         ))}

                      </div>

                    )}



                    {/* POLAROID VIEW */}

                    {viewMode === 'polaroid' && (

                      <div className="demo-polaroid-view" style={{ overflow: 'hidden', padding: '2rem' }}>

                         <div className="flex flex-wrap justify-center gap-8">

                             {photos.map((photo, i) => (

                               <div key={photo.id} className="polaroid-float-demo" style={{animationDelay: `${i * 0.5}s`, '--rot': `${(i % 5) * 4 - 8}deg`} as React.CSSProperties}>

                                  <div className="polaroid-img-wrapper">

                                    {photo.type === 'video' ? (

                                      <video src={photo.url} className="demo-media" autoPlay muted loop playsInline preload="metadata" />

                                    ) : (

                                      <img src={photo.url} className="demo-media" alt="Upload" loading="lazy" />

                                    )}

                                  </div>

                                  <p className="polaroid-caption">{photo.caption}</p>

                               </div>

                             ))}

                         </div>

                      </div>

                    )}



                    {/* SLIDESHOW VIEW */}

                    {viewMode === 'slideshow' && (

                      <div className="demo-slideshow-view">

                         {photos[currentSlide]?.type === 'video' ? (

                            <video key={photos[currentSlide]?.id || currentSlide} src={photos[currentSlide]?.url} className="demo-media-slide" autoPlay muted loop playsInline preload="metadata" />

                          ) : (

                            <img key={photos[currentSlide]?.id || currentSlide} src={photos[currentSlide]?.url} className="demo-media-slide" alt="Upload" />

                          )}

                          <div className="slide-overlay">

                             <h3 className="slide-caption">{photos[currentSlide]?.caption}</h3>

                             <p className="slide-uploader">by {photos[currentSlide]?.uploader}</p>

                          </div>

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

export default function LandingPage() {

  const { user, isLoading, signOut } = useAuth();

  const { openAuth: openGlobalAuth } = useAuthModal();

  const router = useRouter();

  const [scrolled, setScrolled] = useState(false);

  const [currency, setCurrency] = useState({ showINR: false, showOMR: false });

  const [showingINR, setShowingINR] = useState(false);

  const [showingOMR, setShowingOMR] = useState(false);

  const [isDemoOpen, setIsDemoOpen] = useState(false);

  const [selectedPlan, setSelectedPlan] = useState<'starter' | 'standard' | 'premium' | 'whitelabel' | null>(null);

  

  const openAuth = (plan: 'starter' | 'standard' | 'premium' | 'whitelabel') => {

    setSelectedPlan(plan);

    openGlobalAuth('signup', plan);

  };



  const handleSignOut = async () => {

    await signOut();

  };



  useEffect(() => {

    const onScroll = () => setScrolled(window.scrollY > 60);

    window.addEventListener('scroll', onScroll, { passive: true });



    const obs = new IntersectionObserver(entries => {

      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });

    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal').forEach(el => obs.observe(el));



    const cards = document.querySelectorAll('.gcard');

    cards.forEach(card => {

      const el = card as HTMLElement;

      el.addEventListener('mousemove', (e) => {

        const r = el.getBoundingClientRect();

        const x = e.clientX - r.left, y = e.clientY - r.top;

        el.style.setProperty('--mx', `${x}px`);

        el.style.setProperty('--my', `${y}px`);

      });

    });



    (async () => {

      let countryCode = 'GLOBAL';

      try {

        const res = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(4000) });

        countryCode = (await res.json()).country_code || 'GLOBAL';

      } catch {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
        if (tz.includes('Kolkata')) countryCode = 'IN';
        else if (tz.includes('Muscat')) countryCode = 'OM';
      }

      const isIndia = countryCode === 'IN';
      const isOman = countryCode === 'OM';

      // Set region cookie for checkout page
      document.cookie = `livewall_region=${isOman ? 'OM' : isIndia ? 'IN' : 'GLOBAL'}; path=/; max-age=86400`;

      setCurrency({ showINR: isIndia, showOMR: isOman });

      if (isIndia) setShowingINR(true);
      if (isOman) setShowingOMR(true);

    })();



    return () => { window.removeEventListener('scroll', onScroll); obs.disconnect(); };

  }, []);



  const Free = "0";

  const Starter = showingOMR ? "15" : showingINR ? "2,499" : "30";

  const Pro = showingOMR ? "29" : showingINR ? "4,999" : "60";

  const Premium = showingOMR ? "39" : showingINR ? "7,499" : "90";

  const WhiteLabel = showingOMR ? "59" : showingINR ? "9,999" : "120";

  const PhotoBookPrice = showingOMR ? "5" : showingINR ? "1,000" : "12";

  const ExtraStoragePrice = showingOMR ? "2" : showingINR ? "500" : "6";

  const SocialFeedPrice = showingOMR ? "5" : showingINR ? "1,000" : "12";

  const Sym = showingOMR ? "ر.ع. " : showingINR ? "₹" : "$";



  return (

    <div className="lp aurora-bg pt-[calc(140px+env(safe-area-inset-top))]">

      <div className="flex flex-col gap-16">












        {/* HERO */}
        <section className="hero pt-16 md:pt-20 py-16 overflow-hidden relative">
          <motion.div
            animate={{ rotate: 360, scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] md:w-[800px] md:h-[800px] rounded-full blur-[100px] pointer-events-none -z-10"
            style={{
              background: 'conic-gradient(from 0deg, rgba(6,182,212,0.4), rgba(236,72,153,0.4), rgba(99,102,241,0.4), rgba(6,182,212,0.4))'
            }}
          />
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, type: 'spring', stiffness: 100, damping: 15 }}
            className="relative z-10"
          >
            <h1 className="hero-h1 leading-tight md:leading-[1.1]">
              Collect Every Moment.
              <br />
              <span className="gradient-text-vibrant">Instantly. Effortlessly.</span>
            </h1>
          </motion.div>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2, type: 'spring', stiffness: 100, damping: 15 }}
            className="hero-p"
          >
            QR-based photo sharing for weddings, celebrations, and corporate events. One-time payment, zero hassle.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4, type: 'spring', stiffness: 100, damping: 15 }}
            className="hero-btns"
          >
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsDemoOpen(true)} 
              className="btn-hero-primary cinematic-glow"
            >
              <span>🎬 Watch Demo Wall</span>
            </motion.button>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.6, type: 'spring', stiffness: 100, damping: 15 }}
            className="hero-visual"
          >
            <div className="polaroid-float p-1" style={{ '--rot': '-8deg' } as React.CSSProperties}>
              <img src="/landing-hero/photo2.jpg" alt="Memory" />
            </div>
            <div className="polaroid-float p-2" style={{ '--rot': '12deg' } as React.CSSProperties}>
              <img src="/landing-hero/photo6.jpg" alt="Memory" />
            </div>
            <div className="polaroid-float p-3" style={{ '--rot': '-5deg' } as React.CSSProperties}>
              <img src="/landing-hero/photo12.jpg" alt="Memory" />
            </div>
            <div className="polaroid-float p-4" style={{ '--rot': '6deg' } as React.CSSProperties}>
              <img src="/landing-hero/photo4.jpg" alt="Memory" />
            </div>



            {/* Left phone — Upload view */}

            <div className="phone-mockup">

              <div className="phone-notch" />

              <div className="phone-screen">

                <div className="phone-header">

                  <span className="phone-title">Upload</span>

                  <span className="phone-live"><span className="pulse-dot" /> Live</span>

                </div>

                <div className="phone-grid">

                  {[

                    { src: '/landing-hero/photo1.jpg', alt: 'Guest photo 1' },

                    { src: '/landing-hero/photo2.jpg', alt: 'Guest photo 2' },

                    { src: '/landing-hero/photo3.jpg', alt: 'Guest photo 3' },

                    { src: '/landing-hero/photo4.jpg', alt: 'Guest photo 4' }

                  ].map((img, i) => (

                    <div key={i} className="phone-photo" style={{ background: `linear-gradient(135deg, rgba(245,158,11,${0.15 + i * 0.05}), rgba(244,114,182,${0.1 + i * 0.05}))`, animationDelay: `${0.8 + i * 0.2}s` }}>

                      <img src={img.src} alt={img.alt} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />

                    </div>

                  ))}

                </div>

                <div className="phone-upload-bar">

                  ⬆ Uploading...

                  <div className="upload-progress"><div className="upload-progress-bar" /></div>

                </div>

              </div>

            </div>



            {/* Center phone — Live Wall */}

            <div className="phone-mockup phone-c">

              <div className="phone-notch" />

              <div className="phone-screen">

                <div className="phone-header">

                  <span className="phone-title">Sarah&apos;s Wedding</span>

                  <span className="phone-live"><span className="pulse-dot" /> 24 Live</span>

                </div>

                <div className="phone-grid">

                  {[

                    { src: '/landing-hero/photo5.jpg', alt: 'Wedding photo 1' },

                    { src: '/landing-hero/photo6.jpg', alt: 'Wedding photo 2' },

                    { src: '/landing-hero/photo7.jpg', alt: 'Wedding photo 3' },

                    { src: '/landing-hero/photo8.jpg', alt: 'Wedding photo 4' },

                    { src: '/landing-hero/photo9.jpg', alt: 'Wedding photo 5' },

                    { src: '/landing-hero/photo10.jpg', alt: 'Wedding photo 6' }

                  ].map((img, i) => (

                    <div key={i} className="phone-photo" style={{ background: `linear-gradient(135deg, rgba(${200 + i * 10},${100 + i * 15},${50 + i * 20},0.3), rgba(244,114,182,0.15))`, animationDelay: `${0.5 + i * 0.15}s` }}>

                      <img src={img.src} alt={img.alt} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />

                    </div>

                  ))}

                </div>

              </div>

            </div>



            {/* Right phone — QR Scan */}

            <div className="phone-mockup phone-r">

              <div className="phone-notch" />

              <div className="phone-screen">

                <div className="phone-header">

                  <span className="phone-title">Join Wall</span>

                </div>

                <div className="phone-qr">QR</div>

                <p className="phone-scan-text">Scan to join the live wall</p>

                <div className="phone-grid" style={{ marginTop: '0.75rem' }}>

                  {[

                    { src: '/landing-hero/photo11.jpg', alt: 'Guest photo 1' },

                    { src: '/landing-hero/photo12.jpg', alt: 'Guest photo 2' }

                  ].map((img, i) => (

                    <div key={i} className="phone-photo" style={{ background: `linear-gradient(135deg, rgba(252,211,77,0.2), rgba(245,158,11,0.15))`, animationDelay: `${1.2 + i * 0.2}s` }}>

                      <img src={img.src} alt={img.alt} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />

                    </div>

                  ))}

                </div>

              </div>
            </div>
          </motion.div>
        </section>



        {/* STATS */}

        <section className="stats py-16">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="flex flex-wrap justify-center gap-8 md:gap-16"
          >
            {[
              { val: '∞', label: 'Photos per wall' },
              { val: '0s', label: 'App install time' },
              { val: '<3s', label: 'Upload speed' },
              { val: '0', label: 'Hidden fees' },
            ].map((s, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1, ease: 'backOut' }}
                className="stat group cursor-default"
              >
                <span className="stat-val group-hover:scale-110 transition-transform duration-300 inline-block">{s.val}</span>
                <span className="stat-lbl text-sm opacity-70 group-hover:opacity-100 transition-opacity">{s.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </section>



        {/* WHY CHOOSE MEMENTO */}
        <section id="why" className="sec py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, type: 'spring', stiffness: 100, damping: 15 }}
          >
            <span className="kicker">Why Choose Memento?</span>
            <h2 className="sec-h2">Capture what matters. <span className="gradient-text-vibrant">Instantly.</span></h2>
            <p className="sec-sub">Your guests take the photos, we collect them all in one place. No missed moments, no lost memories.</p>
          </motion.div>

          <div className="feat-grid">
            {[
              { icon: '🎉', title: 'Perfect for Weddings', desc: 'From the first look to the last dance, every guest becomes your personal photographer.', big: true },
              { icon: '🎂', title: 'Birthdays & Private Parties', desc: 'No more chasing friends for photos. Get them all at once in a beautiful live gallery.' },
              { icon: '🏢', title: 'Corporate Events', desc: 'Level up your branding. Show real-time interaction on any screen with full moderation.' },
              { icon: '👰', title: 'Anniversaries', desc: 'Celebrate the journey. Let every generation share their memories in one click.' },
              { icon: '🎈', title: 'Festivals', desc: 'Capture the scale and energy. Crowdsourced memories that look professional.' },
            ].map((f, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className={`gcard feat-card ${f.big ? 'feat-big' : ''} cinematic-glow`}
              >
                <div className="gcard-border" />
                <div className="gcard-inner">
                  <span className="feat-icon">{f.icon}</span>
                  <h3 className="feat-title">{f.title}</h3>
                  <p className="feat-desc">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

        </section>



        {/* FEATURES */}
        <section id="features" className="sec py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, type: 'spring', stiffness: 100, damping: 15 }}
          >
            <span className="kicker">Core Features</span>
            <h2 className="sec-h2">The Best Experience. <span className="gradient-text-vibrant">Built in.</span></h2>
          </motion.div>

          <motion.div 
            className="feat-grid"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
            }}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >

            {[

              { icon: '✨', title: 'Selfie-Safe Matching', desc: 'The ultimate privacy feature. Guests scan their face to instantly find and download only their photos—no manual searching required.', big: true },

              { icon: '📺', title: 'Live Slideshow', desc: 'Auto-plays on any screen. Cast to TV or projector for a stunning real-time display.' },

              { icon: '📷', title: 'Mirror Grid & Album', desc: 'Beautiful high-res photo gallery with automated albums and grid views.' },

              { icon: '🔒', title: 'Private Walls', desc: 'Password-protect your memory wall. Full moderation allows you to approve every shot before it goes live.' },

              { icon: '📱', title: 'Zero Friction', desc: 'No apps. No accounts. No logins. Just scan a QR and start sharing within 3 seconds.' },

              { icon: '🛡️', title: 'Safety & Moderation', desc: 'Control your event. Remove or approve photos with one tap to keep the energy positive.' },

            ].map((f, i) => (

              <motion.div 
                key={i} 
                className={`gcard feat-card ${f.big ? 'feat-big' : ''} cinematic-glow`}
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 15 } }
                }}
                whileHover={{ scale: 1.03, y: -5 }}
              >

                <div className="gcard-border" />

                <div className="gcard-inner">

                  <span className="feat-icon">{f.icon}</span>

                  <h3 className="feat-title">{f.title}</h3>

                  <p className="feat-desc">{f.desc}</p>

                </div>

              </motion.div>

            ))}

          </motion.div>

        </section>



        {/* HOW IT WORKS */}
        <section id="how" className="sec py-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, type: 'spring', stiffness: 100, damping: 15 }}
          >
            <span className="kicker">How it works</span>
            <h2 className="sec-h2">Three steps. <span className="gradient-text-vibrant">That&apos;s it.</span></h2>
            <p className="sec-sub">No downloads. No accounts. No friction.</p>
          </motion.div>

          <div className="steps">
            {[
              { num: '01', icon: '🎉', title: 'Create Your Event', desc: 'Name it and get a shareable QR code in under a minute.' },
              { num: '02', icon: '📲', title: 'Guests Scan & Share', desc: 'No app. No login. Just scan the QR and upload photos instantly.' },
              { num: '03', icon: '✨', title: 'Watch It Come Alive', desc: 'Every photo streams live into a beautiful gallery for everyone.' },
            ].map((s, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.2, ease: "easeOut" }}
                whileHover={{ scale: 1.05 }}
                className="gcard step-card cinematic-glow"
              >
                <div className="gcard-border" />
                <div className="gcard-inner">
                  <span className="step-num">{s.num}</span>
                  <span className="step-icon">{s.icon}</span>
                  <h3 className="step-title">{s.title}</h3>
                  <p className="step-desc">{s.desc}</p>
                </div>
              </motion.div>
            ))}
            <motion.div 
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, delay: 0.5, ease: "easeInOut" }}
              className="steps-line origin-left" 
            />
          </div>
        </section>



        {/* IMAGE GALLERY */}
        <section className="sec py-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, type: 'spring', stiffness: 100, damping: 15 }}
          >
            <span className="kicker">Gallery</span>
            <h2 className="sec-h2">Real <span className="gradient-text-vibrant">Event Walls</span></h2>
            <p className="sec-sub">See how people are using Memento to capture their special moments</p>
          </motion.div>

          <div className="gallery-grid">
            {[
              { title: 'Sarah & John Wedding', src: 'https://picsum.photos/400/300?random=1', count: '156 photos' },
              { title: 'Tech Conference 2024', src: 'https://picsum.photos/400/300?random=2', count: '289 photos' },
              { title: 'Birthday Celebration', src: 'https://picsum.photos/400/300?random=3', count: '87 photos' },
              { title: 'Corporate Gala', src: 'https://picsum.photos/400/300?random=4', count: '234 photos' },
              { title: 'Graduation Party', src: 'https://picsum.photos/400/300?random=5', count: '145 photos' },
              { title: 'Festival Weekend', src: 'https://picsum.photos/400/300?random=6', count: '512 photos' }
            ].map((item, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: i * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="gallery-item cinematic-glow"
              >
                <div className="gallery-img-wrapper">
                  <img src={item.src} alt={item.title} className="gallery-img" />
                  <div className="gallery-overlay">
                    <h3 className="gallery-title">{item.title}</h3>
                    <p className="gallery-count">{item.count}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>



        {/* TESTIMONIALS */}
        <section className="sec py-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, type: 'spring', stiffness: 100, damping: 15 }}
          >
            <span className="kicker">Testimonials</span>
            <h2 className="sec-h2">Loved by <span className="gradient-text-vibrant">Event Organizers</span></h2>
            <p className="sec-sub">See what people are saying about Memento</p>
          </motion.div>

          <div className="testimonial-grid">
            {[
              { quote: "We collected 500+ photos in just one evening! Memento made our wedding hassle-free.", author: "Rohan & Priya", role: "Happy Couple", event: "Mumbai Wedding • 524 photos", rating: 5 },
              { quote: "Our clients loved seeing the live photo wall at their corporate event. It was magical.", author: "Fatima Al Balushi", role: "Event Coordinator", event: "Muscat Corporate Gala • 320 photos", rating: 5 },
              { quote: "The simplest way to gather memories. No app, no friction, just pure joy in real-time.", author: "Sarah Jenkins", role: "Wedding Planner", event: "London Destination Wedding • 450 photos", rating: 5 }
            ].map((item, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                whileHover={{ y: -5 }}
                className="gcard testimonial-card cinematic-glow"
              >
                <div className="gcard-border" />
                <div className="gcard-inner">
                  <div className="flex gap-1 mb-3">
                    {[...Array(item.rating)].map((_, j) => <span key={j} className="text-amber-400">⭐</span>)}
                  </div>
                  <p className="text-slate-700 mb-6 text-base leading-relaxed italic">&quot;{item.quote}&quot;</p>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-rose-400 flex items-center justify-center text-white font-semibold text-lg shadow-md">
                      {item.author.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="text-slate-900 font-bold text-base">{item.author}</p>
                      <p className="text-slate-500 text-sm">{item.role}</p>
                    </div>
                  </div>
                  <p className="text-amber-500 text-xs mt-4 font-bold tracking-wider uppercase">{item.event}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Social Proof Bar */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.3 }}
            className="social-proof-bar cinematic-glow mt-20"
          >
            <div className="social-proof-item">
              <span className="text-3xl font-bold gradient-text-vibrant">10,000+</span>
              <span className="text-slate-600 text-sm font-medium block mt-1">Events Created</span>
            </div>
            <div className="social-proof-item">
              <span className="text-3xl font-bold gradient-text-vibrant">500K+</span>
              <span className="text-slate-600 text-sm font-medium block mt-1">Photos Shared</span>
            </div>
            <div className="social-proof-item">
              <span className="text-3xl font-bold gradient-text-vibrant">50+</span>
              <span className="text-slate-600 text-sm font-medium block mt-1">Countries</span>
            </div>
            <div className="social-proof-item">
              <span className="text-3xl font-bold gradient-text-vibrant">4.9★</span>
              <span className="text-slate-600 text-sm font-medium block mt-1">User Rating</span>
            </div>
          </motion.div>
        </section>



        {/* PRICING */}
        <section id="pricing" className="sec py-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, type: 'spring', stiffness: 100, damping: 15 }}
          >
            <span className="kicker">One-time Payment • Per Event</span>
            <h2 className="sec-h2">Pricing That <span className="gradient-text-vibrant">Grows With You</span></h2>
            <p className="sec-sub">Simple, transparent pricing. No subscriptions, zero surprises.</p>
          </motion.div>



          {/* Currency toggles */}
          {!showingINR && currency.showINR && (
            <button className="currency-toggle reveal" onClick={() => setShowingINR(!showingINR)}>
              Switch to ₹ INR
            </button>
          )}
          {!showingOMR && currency.showOMR && (
            <button className="currency-toggle reveal" onClick={() => setShowingOMR(!showingOMR)}>
              Switch to ر.ع. OMR
            </button>
          )}



          <motion.div 
            className="price-grid"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
            }}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >

            {[

              {

                name: 'Starter',

                price: Starter,

                emoji: '🟢',

                description: 'Perfect for small, basic events',

                stats: 'Up to 150 guests',

                features: [

                  '✓ Collect guest photos instantly',

                  '✓ Live photo wall',

                  '✓ Unlimited uploads',

                  '✓ Download all photos as ZIP',

                  '1 Month Storage'

                ],

                tagline: 'Simple, fast photo sharing for your event.',

                popular: false

              },

              {

                name: 'Standard',

                price: Pro,

                emoji: '🔵',

                description: 'For interactive and lively events',

                stats: 'Up to 300 guests',

                features: [

                  'Everything in Starter +',

                  '🎥 Auto album creation',

                  '🎨 Custom wall theme',

                  '📊 Simple analytics',

                  '📺 Slideshow TV Mode',

                  '❤️ Live reactions',

                  '3 Months Storage'

                ],

                tagline: 'Bring your event to life with interactive features.',

                popular: true,

                badge: '⭐ Most Popular',

                featured: true

              },

              {

                name: 'Premium',

                price: Premium,

                emoji: '🟣',

                description: 'For weddings & luxury experiences',

                stats: 'Unlimited guests',

                features: [

                  'Everything in Standard +',

                  '🎶 Music slideshow',

                  '⏳ Expiring galleries',

                  '🛡️ Priority support',

                  '🔒 Advanced privacy options',

                  '☁️ Google Drive sync',

                  '6 Months Storage'

                ],

                tagline: 'A premium, fully featured photo experience.',

                popular: false,

                badge: '🔥 Best Value',

                featured: false

              },

              {

                name: 'White Label',

                price: WhiteLabel,

                emoji: '🟡',

                description: 'For agencies & photographers',

                stats: 'Multi-event dashboard',

                features: [

                  'Everything in Premium +',

                  '🔥 Full branding removal',

                  '🌐 Custom domain (e.g. photos.you.com)',

                  '💰 Partner resell rights',

                  '📊 Client management',

                  '🚀 Training & Priority Setup'

                ],

                tagline: 'Launch your own branded platform.',

                popular: false

              }

            ].map((p, i) => (

              <motion.div 
                key={i} 
                className={`gcard price-card ${p.popular ? 'popular' : ''} ${(p as any).featured ? 'featured-plan' : ''} cinematic-glow`}
                variants={{
                  hidden: { opacity: 0, scale: 0.9, y: 30 },
                  visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 15 } }
                }}
                whileHover={{ scale: (p as any).featured ? 1.06 : 1.03, y: -5, boxShadow: '0 20px 40px rgba(245, 158, 11, 0.2)' }}
              >

                <div className="gcard-border" />

                <div className="gcard-inner">

                  {/* Badge row: Most Popular tag + Best Value badge */}
                  <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                    {p.popular && <span className="popular-tag">⭐ Most Popular</span>}
                    {(p as any).badge && !p.popular && (
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 12px',
                        borderRadius: 100,
                        fontSize: 11,
                        fontWeight: 800,
                        letterSpacing: '0.05em',
                        background: 'linear-gradient(135deg, rgba(239,68,68,0.15), rgba(245,158,11,0.15))',
                        border: '1px solid rgba(239,68,68,0.3)',
                        color: '#dc2626'
                      }}>{(p as any).badge}</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mb-2">

                    <span className="text-2xl">{p.emoji}</span>

                    <p className="price-name">{p.name}</p>

                  </div>

                  <p className="text-slate-600 text-sm mb-3">{p.description}</p>

                  <div className="price-amount">

                    <span className="price-sym">{Sym}</span>

                    <span className="price-val">{p.price}</span>

                  </div>

                  <span className="price-period text-sm">per event • one-time</span>

                  <button onClick={() => openAuth(p.name === 'White Label' ? 'whitelabel' : p.name === 'Premium' ? 'premium' : p.name === 'Standard' ? 'standard' : 'starter')} className={`price-btn ${p.popular ? 'filled' : ''}`}>

                    {p.name === 'White Label' ? 'Become a Partner' : p.name === 'Premium' ? 'Book Premium' : p.name === 'Standard' ? 'Get Started' : 'Start Now'}

                  </button>

                  <div className="price-divider" />

                  <div className="mb-4">

                    <span className="text-xs uppercase tracking-widest text-[#f59e0b] font-bold">{p.stats}</span>

                  </div>

                  <div className="space-y-2.5">

                    {p.features.map((f, j) => {

                      const isStorage = f.includes('Storage');

                      return (

                        <div key={j} className={`price-feat text-sm ${f.startsWith('Everything in') ? 'font-semibold text-amber-600 text-base' : ''}`}>

                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" /></svg>

                          <span className={isStorage ? 'text-amber-600 font-semibold' : ''}>{f}</span>

                        </div>

                      );

                    })}

                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-200">

                    <p className="text-sm text-slate-500 italic">💬 {p.tagline}</p>

                  </div>

                </div>

              </motion.div>

            ))}

          </motion.div>

        </section>



        {/* CTA */}
        <section className="py-24 px-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, type: 'spring', stiffness: 100, damping: 15 }}
            className="cta-sec cinematic-glow py-20 px-8 rounded-3xl overflow-hidden relative max-w-5xl mx-auto text-center"
          >
            <div className="cta-glow" />
            <h2 className="cta-h2 relative z-10">Ready to collect every moment<br /><span className="gradient-text-vibrant">instantly?</span></h2>
            <p className="cta-p relative z-10 mt-6 text-xl">Start with just {Sym}{Starter}. One-time payment. Zero hassle.</p>
            <motion.button 
              whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(245, 158, 11, 0.3)' }}
              whileTap={{ scale: 0.95 }}
              onClick={() => openAuth('starter')} 
              className="btn-hero-primary mt-10 relative z-10"
            >
              <span>Get Started Now — {Sym}{Starter}</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="ml-2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </motion.button>
          </motion.div>
        </section>



        {/* FOOTER */}

        <footer className="lp-footer py-8">

          <div className="footer-top">

            <div className="footer-brand">

              <Link href="/">
                <div className="mb-4">
                  <AnimatedLogo width={320} height={106} />
                </div>
              </Link>

            </div>

            <div className="footer-cols">

              <div className="footer-col">

                <h4>Product</h4>

                <Link href="#features">Features</Link>

                <Link href="#pricing">Pricing</Link>

                <Link href="#how">How it works</Link>

              </div>

              <div className="footer-col">

                <h4>Company</h4>

                <Link href="#">About</Link>

                <Link href="#">Blog</Link>

                <Link href="#">Contact</Link>

              </div>

              <div className="footer-col">

                <h4>Legal</h4>

                <Link href="/privacy">Privacy</Link>

                <Link href="/terms">Terms</Link>

              </div>

            </div>

          </div>

          <div className="footer-bottom">

            <p>© 2025 Memento. Made with ♥ for every celebration.</p>

          </div>

        </footer>

      </div>

      

      {/* Demo Modal */}

      <DemoModal isOpen={isDemoOpen} onClose={() => setIsDemoOpen(false)} />

    </div>

  );

}