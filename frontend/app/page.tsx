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

import Hero from '@/components/sections/Hero';
import Stats from '@/components/sections/Stats';
import WhyChoose from '@/components/sections/WhyChoose';
import Features from '@/components/sections/Features';
import Steps from '@/components/sections/Steps';
import Gallery from '@/components/sections/Gallery';
import Testimonials from '@/components/sections/Testimonials';
import PricingSection from '@/components/sections/PricingSection';



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

    <div className="lp aurora-bg pt-[calc(140px+env(safe-area-ins      <div className="flex flex-col gap-16">
        <Hero setIsDemoOpen={setIsDemoOpen} />
        <Stats />
        <WhyChoose />
        <Features />
        <Steps />
        <Gallery />
        <Testimonials />
        <PricingSection 
          showingINR={showingINR}
          showingOMR={showingOMR}
          setShowingINR={setShowingINR}
          setShowingOMR={setShowingOMR}
          currency={currency}
          Sym={Sym}
          plans={[
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
          ]}
        />
      </div>
(239,68,68,0.3)',
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