"use client";



import React, { useEffect, useState, useRef } from 'react';

import { useRouter } from 'next/navigation';

import Link from 'next/link';

import { useAuth } from '@/hooks/useAuth';

import { QRCodeSVG } from 'qrcode.react';

import { X, Maximize2, Minimize2, Image as ImageIcon, Grid, Play, ArrowRight } from 'lucide-react';
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

import { useAuthModal } from '@/context/AuthModalContext';

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



    const dbChannel = supabase

      .channel(`demo-db-${demoId}`)

      .on(

        'postgres_changes',

        { event: 'INSERT', schema: 'public', table: 'demo_uploads', filter: `demo_id=eq.${demoId}` },

        (payload) => {



          const row = payload.new as { id: string; url: string; type: string; caption: string; uploader: string; created_at: string };

          if (!row.url || !row.type) {

            return;

          }



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



    const poll = async () => {



      const { data, error } = await supabase

        .from('demo_uploads')

        .select('*')

        .eq('demo_id', demoId)

        .order('created_at', { ascending: false })

        .limit(20);



      if (!data?.length) {

        return;

      }



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

      const current = photos[currentSlide];
      // If current item is a video, let the video element's onEnded handle the transition
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
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-8">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className={`glass-panel w-full max-w-7xl h-full max-h-[900px] flex flex-col relative ${isFullscreen ? 'fixed inset-0 max-w-none max-h-none rounded-none' : ''}`} ref={modalRef}>
        {/* Fullscreen custom cursor */}
        {isFullscreen && (
          <>
            <div ref={fsOuterRef} className="fixed pointer-events-none z-[99999] w-10 h-10 -translate-x-1/2 -translate-y-1/2 border-2 border-primary/30 rounded-full transition-opacity duration-300" />
            <div ref={fsDotRef} className="fixed pointer-events-none z-[100000] w-2 h-2 -translate-x-1/2 -translate-y-1/2 bg-primary rounded-full shadow-[0_0_15px_var(--primary)] transition-opacity duration-300" />
          </>
        )}
        
        {/* Header */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-white/5 bg-white/5">
           <div className="flex items-center gap-6">
              <AnimatedLogo width={140} height={40} />
              <div className="hidden sm:flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                    <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-secondary' : 'bg-red-500'} ${isConnected ? 'animate-pulse' : ''}`} />
                    <span className="text-[10px] font-bold tracking-widest text-text-secondary">{isConnected ? 'LIVE CONNECTION' : 'RECONNECTING...'}</span>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10">
                    <span className="text-[10px] font-bold tracking-widest text-text-secondary">{minutes}:{seconds < 10 ? `0${seconds}` : seconds} LEFT</span>
                  </div>
              </div>
           </div>
           
           <div className="flex items-center gap-4">
              <div className="flex bg-white/5 p-1 rounded-xl">
                <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-primary text-white shadow-lg' : 'text-text-muted hover:text-white'}`}>
                  <Grid size={18} />
                </button>
                <button onClick={() => setViewMode('polaroid')} className={`p-2 rounded-lg transition-all ${viewMode === 'polaroid' ? 'bg-primary text-white shadow-lg' : 'text-text-muted hover:text-white'}`}>
                  <ImageIcon size={18} />
                </button>
                <button onClick={() => { setViewMode('slideshow'); setCurrentSlide(0); setIsPlaying(true); }} className={`p-2 rounded-lg transition-all ${viewMode === 'slideshow' ? 'bg-primary text-white shadow-lg' : 'text-text-muted hover:text-white'}`}>
                  <Play size={18} />
                </button>
              </div>

              <div className="w-px h-6 bg-white/10" />

              <button onClick={toggleFullscreen} className="p-2 text-text-muted hover:text-white transition-all">
                {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
              </button>
              <button onClick={onClose} className="p-2 text-text-muted hover:text-red-500 transition-all">
                <X size={24} />
              </button>
           </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Sidebar / QR */}
            <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-white/5 p-8 flex flex-col items-center bg-white/20">
               <div className="text-center mb-8">
                  <h3 className="text-xl font-bold text-white mb-2">Join the Wall</h3>
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

            {/* Main Visual Area */}
            <div className="flex-1 overflow-y-auto bg-black/20 p-6 md:p-10 custom-scrollbar">
               {photos.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center">
                     <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
                       <ImageIcon size={32} className="text-text-muted" />
                     </div>
                     <h2 className="text-2xl font-bold text-white mb-2">Waiting for first photo...</h2>
                     <p className="text-text-secondary max-w-sm">Use the QR code to upload something beautiful and watch it appear here instantly.</p>
                  </div>
               ) : (
                  <>
                    {/* GRID VIEW */}
                    {viewMode === 'grid' && (
                      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                         {photos.map((photo, i) => (
                           <motion.div 
                             key={photo.id} 
                             initial={{ opacity: 0, y: 20 }}
                             animate={{ opacity: 1, y: 0 }}
                             transition={{ delay: i * 0.05 }}
                             className="group relative aspect-square rounded-2xl overflow-hidden border border-white/5 hover:border-white/20 transition-all"
                           >
                              {photo.type === 'video' ? (
                                <video src={photo.url} className="w-full h-full object-cover" autoPlay muted loop playsInline preload="metadata" />
                              ) : (
                                <img src={photo.url} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="Upload" loading="lazy" />
                              )}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end">
                                 <p className="text-white text-sm font-medium line-clamp-1">{photo.caption}</p>
                                 <p className="text-white/60 text-[10px] uppercase font-bold tracking-wider">by {photo.uploader}</p>
                              </div>
                           </motion.div>
                         ))}
                      </div>
                    )}

                    {/* POLAROID VIEW */}
                    {viewMode === 'polaroid' && (
                      <div className="flex flex-wrap justify-center gap-10 py-10">
                         {photos.map((photo, i) => (
                           <motion.div 
                             key={photo.id} 
                             initial={{ opacity: 0, scale: 0.8 }}
                             animate={{ opacity: 1, scale: 1, rotate: (i % 5) * 4 - 8 }}
                             transition={{ delay: i * 0.1, type: 'spring' }}
                             className="bg-white p-4 pb-12 shadow-2xl w-64 flex-shrink-0"
                           >
                              <div className="aspect-square overflow-hidden bg-zinc-100 mb-4">
                                {photo.type === 'video' ? (
                                  <video src={photo.url} className="w-full h-full object-cover" autoPlay muted loop playsInline preload="metadata" />
                                ) : (
                                  <img src={photo.url} className="w-full h-full object-cover" alt="Upload" loading="lazy" />
                                )}
                              </div>
                              <p className="text-zinc-800 font-medium text-sm text-center font-handwriting line-clamp-2">{photo.caption}</p>
                           </motion.div>
                         ))}
                      </div>
                    )}

                    {/* SLIDESHOW VIEW */}
                    {viewMode === 'slideshow' && (
                      <div className="h-full flex items-center justify-center">
                         <AnimatePresence mode="wait">
                           <motion.div 
                             key={photos[currentSlide]?.id}
                             initial={{ opacity: 0, scale: 1.1 }}
                             animate={{ opacity: 1, scale: 1 }}
                             exit={{ opacity: 0, scale: 0.95 }}
                             transition={{ duration: 0.8 }}
                             className="relative w-full h-full max-h-[600px] flex items-center justify-center rounded-3xl overflow-hidden shadow-2xl"
                           >
                              {photos[currentSlide]?.type === 'video' ? (
                                 <video src={photos[currentSlide]?.url} className="w-full h-full object-contain" autoPlay muted onEnded={() => setCurrentSlide((prev) => (prev + 1) % photos.length)} playsInline preload="metadata" />
                              ) : (
                                 <img src={photos[currentSlide]?.url} className="w-full h-full object-contain" alt="Upload" />
                              )}
                              <div className="absolute bottom-10 left-10 p-8 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 max-w-md">
                                 <h3 className="text-2xl font-bold text-white mb-2">{photos[currentSlide]?.caption}</h3>
                                 <p className="text-primary font-bold tracking-widest text-xs uppercase">by {photos[currentSlide]?.uploader}</p>
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
    <>
    <div className="lp aurora-bg">
      <div className="flex flex-col gap-16">
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
          onGetStarted={openAuth}
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



        {/* CTA */}
        <section className="py-24 px-6 relative overflow-hidden">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="glass-panel py-20 px-8 max-w-5xl mx-auto text-center relative overflow-hidden group"
          >
            {/* Ambient Background for CTA */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
            
            <div className="relative z-10">
              <h2 className="h1-text mb-6">
                Ready to collect every moment <span className="text-secondary italic">instantly?</span>
              </h2>
              <p className="text-xl text-text-secondary mb-10 max-w-xl mx-auto">
                Start with just {Sym}{Starter}. One-time payment. Zero hassle. Your memories deserve the best.
              </p>
              <button 
                onClick={() => openAuth('starter')} 
                className="btn-premium flex items-center gap-2 mx-auto"
              >
                <span>Get Started Now — {Sym}{Starter}</span>
                <ArrowRight size={20} />
              </button>
            </div>
          </motion.div>
        </section>
 
        {/* FOOTER */}
        <footer className="pt-24 pb-12 border-t border-white/5 bg-black/50 backdrop-blur-md">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
              <div className="md:col-span-2">
                <Link href="/" className="inline-block mb-6">
                  <AnimatedLogo width={160} height={50} />
                </Link>
                <p className="text-text-secondary max-w-xs leading-relaxed">
                  Leading QR-based photo sharing platform for weddings and celebrations worldwide. Collect every moment instantly.
                </p>
              </div>
 
              <div>
                <h4 className="text-white font-bold mb-6 tracking-tight">Product</h4>
                <div className="flex flex-col gap-4 text-sm">
                  <Link href="#features" className="text-text-muted hover:text-primary transition-colors">Features</Link>
                  <Link href="#pricing" className="text-text-muted hover:text-primary transition-colors">Pricing</Link>
                  <Link href="#how" className="text-text-muted hover:text-primary transition-colors">How it works</Link>
                </div>
              </div>
 
              <div>
                <h4 className="text-white font-bold mb-6 tracking-tight">Legal</h4>
                <div className="flex flex-col gap-4 text-sm">
                  <Link href="/privacy" className="text-text-muted hover:text-primary transition-colors">Privacy Policy</Link>
                  <Link href="/terms" className="text-text-muted hover:text-primary transition-colors">Terms of Service</Link>
                  <Link href="#" className="text-text-muted hover:text-primary transition-colors">Contact Support</Link>
                </div>
              </div>
            </div>
 
            <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
              <p className="text-text-muted text-xs font-medium uppercase tracking-widest">© 2026 Memento. Made with ♥ for every celebration.</p>
              <div className="flex gap-8">
                 <a href="#" className="text-text-muted hover:text-white transition-colors">
                   <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                     <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.979C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                   </svg>
                 </a>
                 <a href="#" className="text-text-muted hover:text-white transition-colors">
                   <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                     <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.84 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                   </svg>
                 </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
 
      <DemoModal isOpen={isDemoOpen} onClose={() => setIsDemoOpen(false)} />
    </>
  );
}