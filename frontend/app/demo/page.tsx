"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import Image from 'next/image';
import { QRCode } from 'react-qrcode-logo';
import Webcam from 'react-webcam';
import { extractFaceDescriptorRobust, MATCH_THRESHOLD } from '@/lib/faceEngine';
import {
  Layout,
  Camera,
  Shield,
  Search,
  Download,
  X,
  Play,
  Pause,
  Heart,
  Clock,
  Sparkles,
  Settings,
  Maximize2,
  Music,
  QrCode,
  ChevronLeft,
  ChevronRight,
  Tv,
  Grid,
  Layers,
  Flame,
  ThumbsUp,
  PartyPopper
} from 'lucide-react';
import CircularGallery from '@/components/CircularGallery';
import AnimatedLogo from '@/components/AnimatedLogo';
import FloatingParticles from '@/components/FloatingParticles';
import { RippleButton } from '@/registry/magicui/ripple-button';
import { ShimmerButton } from '@/registry/magicui/shimmer-button';
import {
  clearDemoData,
  DemoMedia,
  getDemoPhotosKey,
  getDemoTimeLeft,
  getOrCreateDemoExpiry,
  getOrCreateDemoId,
  readDemoPhotos,
  writeDemoPhotos,
  upsertDemoPhoto,
  resetDemoSession,
} from '@/lib/demoWall';

// ── SAMPLE SEED PHOTOS FOR DEMO WALL ────────────────────────
const INITIAL_SAMPLE_PHOTOS: DemoMedia[] = [
  {
    id: 'sample-1',
    url: '/sample-photos/wedding-day.jpg',
    type: 'image',
    caption: 'Pure magic under the golden lights ✨',
    uploader: 'Priya & Rohan',
    createdAt: Date.now() - 60000 * 5,
  },
  {
    id: 'sample-2',
    url: '/sample-photos/corporate-event.jpg',
    type: 'image',
    caption: 'Keynote opening at Tech Summit 2026 🚀',
    uploader: 'Alex M.',
    createdAt: Date.now() - 60000 * 12,
  },
  {
    id: 'sample-3',
    url: '/sample-photos/birthday-party.jpg',
    type: 'image',
    caption: '25th Birthday Bash! Unforgettable night 🎉',
    uploader: 'Sara & Crew',
    createdAt: Date.now() - 60000 * 25,
  },
  {
    id: 'sample-4',
    url: '/sample-photos/family-reunion.jpg',
    type: 'image',
    caption: 'Annual Leadership Gala Excellence Award 🏆',
    uploader: 'Marcus Vance',
    createdAt: Date.now() - 60000 * 40,
  },
  {
    id: 'sample-5',
    url: '/sample-photos/graduation-day.jpg',
    type: 'image',
    caption: 'Class of 2026! We did it! 🎓',
    uploader: 'David & Friends',
    createdAt: Date.now() - 60000 * 60,
  },
  {
    id: 'sample-6',
    url: '/sample-photos/music-festival.jpg',
    type: 'image',
    caption: 'Main stage laser show at Sunset Beats 🎶',
    uploader: 'Maya Lin',
    createdAt: Date.now() - 60000 * 90,
  },
];

// ── NEW PHOTO REVEAL OVERLAY ────────────────────────────────
interface NewPhotoRevealProps {
  photo: DemoMedia | null;
  uploadUrl: string;
  onDone: () => void;
}

const NewPhotoReveal = ({ photo, uploadUrl, onDone }: NewPhotoRevealProps) => {
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
      className="fixed inset-0 z-[500] bg-black/95 backdrop-blur-3xl flex flex-col items-center justify-center p-8"
    >
      <div className="grain" />
      <div className="orbs">
        <div className="orb orb-primary" />
        <div className="orb orb-secondary" />
      </div>

      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent-cyan/10 border border-accent-cyan/20 text-accent-cyan text-[10px] font-black uppercase tracking-[0.2em] mb-8 relative z-10"
      >
        <Sparkles size={12} /> Live Demo Upload Received
      </motion.div>

      <motion.div
        initial={{ y: 40, opacity: 0, scale: 0.9 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative max-w-2xl w-full group overflow-hidden rounded-[2rem] border border-white/20 shadow-[0_0_80px_rgba(0,229,255,0.2)]"
      >
        <div className="absolute inset-0 bg-accent-cyan/20 blur-[100px] rounded-full opacity-50 pointer-events-none" />
        {photo.type === 'video' ? (
          <video src={photo.url} className="w-full relative z-10 block object-contain max-h-[60vh] mx-auto" autoPlay loop muted />
        ) : (
          <div className="relative w-full aspect-video">
            <img src={photo.url} className="w-full h-full object-contain relative z-10" alt="" />
          </div>
        )}
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        className="mt-8 text-center relative z-10"
      >
        <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-1">SHARED BY</p>
        <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-2 tracking-tight">
          {photo.uploader}
        </h2>
        {photo.caption && (
          <p className="text-base text-text-secondary italic max-w-lg mx-auto leading-relaxed">
            &quot;{photo.caption}&quot;
          </p>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute top-8 right-8 z-20 flex items-center gap-3"
      >
        {uploadUrl && (
          <Link
            href={uploadUrl}
            className="px-5 py-2.5 rounded-full bg-accent-cyan text-black font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 hover:bg-accent-cyan/90 transition-all shadow-lg"
          >
            <Camera size={14} /> + Upload Another Photo
          </Link>
        )}
        <RippleButton
          rippleColor="#ADD8E6"
          onClick={() => { setExiting(true); setTimeout(onDone, 800); }}
          className="!w-10 !h-10 !p-0 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all hover:scale-110"
        >
          <X size={20} />
        </RippleButton>
      </motion.div>
    </motion.div>
  );
};

// ── CONFETTI ANIMATION ──────────────────────────────────────
const Confetti = ({ trigger }: { trigger: boolean }) => {
  useEffect(() => {
    if (!trigger) return;
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      import('canvas-confetti').then(({ default: confetti }) => {
        confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#00e5ff', '#ec4899', '#f59e0b', '#10b981'], zIndex: 600 });
        confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#00e5ff', '#ec4899', '#f59e0b', '#10b981'], zIndex: 600 });
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  }, [trigger]);

  return null;
};

type ViewMode = 'grid' | 'polaroid' | 'slideshow';

function DemoWallInner() {
  const searchParams = useSearchParams();
  const [demoId, setDemoId] = useState<string>('');
  const [photos, setPhotos] = useState<DemoMedia[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('polaroid');
  const [prevViewMode, setPrevViewMode] = useState<ViewMode>('polaroid');
  const [slideIndex, setSlideIndex] = useState(0);
  const [isSlideshowAuto, setIsSlideshowAuto] = useState(true);
  const [slideshowSpeed, setSlideshowSpeed] = useState(5000);
  const [timeLeft, setTimeLeft] = useState(300);
  const [isConnected, setIsConnected] = useState(false);
  const [showMobileQR, setShowMobileQR] = useState(false);
  const [revealPhoto, setRevealPhoto] = useState<DemoMedia | null>(null);
  const [confettiTrigger, setConfettiTrigger] = useState(false);

  // AI Selfie Recognition
  const [showSelfieCam, setShowSelfieCam] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [matchedPhotoIds, setMatchedPhotoIds] = useState<string[] | null>(null);
  const webcamRef = useRef<Webcam>(null);

  // Audio Music Player
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [showMusicMenu, setShowMusicMenu] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const TRACKS = [
    { title: 'Cinematic Piano', file: '/music/piano.mp3' },
    { title: 'Pleasant Acoustic', file: '/music/pleasant.mp3' },
    { title: 'Upbeat Celebration', file: '/music/upbeat.mp3' },
  ];

  // Floating Reactions State
  const [floatingReactions, setFloatingReactions] = useState<{ id: string; emoji: string; x: number }[]>([]);
  const [reactionsMap, setReactionsMap] = useState<Record<string, number>>({});

  // 1. Initialize Demo Session & Seed Data
  useEffect(() => {
    const preferredId = searchParams.get('id');
    let activeDemoId = getOrCreateDemoId(preferredId);
    setDemoId(activeDemoId);

    const syncCountdown = () => {
      const remaining = Math.ceil(getDemoTimeLeft(activeDemoId) / 1000);
      setTimeLeft(remaining);
      if (remaining <= 0) {
        const { newDemoId, newPhotos, newTimeLeft } = resetDemoSession(activeDemoId, INITIAL_SAMPLE_PHOTOS);
        activeDemoId = newDemoId;
        setDemoId(newDemoId);
        setPhotos(newPhotos);
        setTimeLeft(newTimeLeft);
      }
    };
    syncCountdown();
    const interval = setInterval(syncCountdown, 1000);

    // Seed sample photos if none exist
    let existing = readDemoPhotos(activeDemoId);
    if (existing.length === 0) {
      writeDemoPhotos(activeDemoId, INITIAL_SAMPLE_PHOTOS);
      existing = INITIAL_SAMPLE_PHOTOS;
    }
    setPhotos(existing);

    return () => clearInterval(interval);
  }, [searchParams]);

  // 2. Realtime Subscription & Polling for Live Demo Uploads
  useEffect(() => {
    if (!demoId) return;

    const syncFromStorage = () => {
      const fresh = readDemoPhotos(demoId);
      if (fresh.length > 0) setPhotos(fresh);
    };

    const handleStorage = (e: StorageEvent) => {
      if (!e.key || e.key === getDemoPhotosKey(demoId)) syncFromStorage();
    };
    window.addEventListener('storage', handleStorage);

    const handleIncoming = (newPhoto: DemoMedia) => {
      setPhotos((prev) => {
        const isNew = !prev.some((p) => p.id === newPhoto.id || p.url === newPhoto.url);
        const updated = upsertDemoPhoto(demoId, newPhoto);
        if (isNew) {
          setRevealPhoto(newPhoto);
          setConfettiTrigger(true);
          setTimeout(() => setConfettiTrigger(false), 3500);
        }
        return updated;
      });
    };

    // Polling DB for remote demo uploads
    const pollDb = async () => {
      try {
        const { data } = await supabase
          .from('demo_uploads')
          .select('*')
          .eq('demo_id', demoId)
          .order('created_at', { ascending: false });

        if (data && data.length > 0) {
          data.forEach((row: any) => {
            handleIncoming({
              id: row.id,
              url: row.url,
              type: row.type === 'video' ? 'video' : 'image',
              caption: row.caption || '',
              uploader: row.uploader || 'Demo Guest',
              createdAt: new Date(row.created_at).getTime(),
            });
          });
        }
      } catch (e) {
        console.warn('[DemoWall] DB poll error:', e);
      }
    };

    pollDb();
    const pollTimer = setInterval(pollDb, 3000);

    // Supabase Realtime Broadcast & Postgres Changes
    const dbChannel = supabase
      .channel(`demo-db-wall-${demoId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'demo_uploads', filter: `demo_id=eq.${demoId}` }, (payload) => {
        const row = payload.new as any;
        if (row?.url) {
          handleIncoming({
            id: row.id,
            url: row.url,
            type: row.type === 'video' ? 'video' : 'image',
            caption: row.caption || '',
            uploader: row.uploader || 'Demo Guest',
            createdAt: new Date(row.created_at).getTime(),
          });
        }
      })
      .subscribe((status) => setIsConnected(status === 'SUBSCRIBED'));

    const bcastChannel = supabase.channel(`demo-${demoId}`);
    bcastChannel.on('broadcast', { event: 'NEW_UPLOAD' }, (payload) => {
      const data = payload.payload as Partial<DemoMedia>;
      if (data?.url) {
        handleIncoming({
          id: String(data.id || Date.now()),
          url: data.url,
          type: data.type === 'video' ? 'video' : 'image',
          caption: data.caption || '',
          uploader: data.uploader || 'Demo Guest',
          createdAt: typeof data.createdAt === 'number' ? data.createdAt : Date.now(),
        });
      }
    }).subscribe();

    return () => {
      clearInterval(pollTimer);
      window.removeEventListener('storage', handleStorage);
      supabase.removeChannel(dbChannel);
      supabase.removeChannel(bcastChannel);
    };
  }, [demoId]);

  // 3. Audio Controller
  useEffect(() => {
    if (audioRef.current) {
      if (isAudioPlaying) {
        audioRef.current.play().catch(() => setIsAudioPlaying(false));
      } else {
        audioRef.current.pause();
      }
    }
  }, [currentTrackIndex, isAudioPlaying]);

  // 4. Automatic Slideshow Timer
  const displayedPhotos = photos.filter((p) => {
    if (matchedPhotoIds !== null && !matchedPhotoIds.includes(p.id)) return false;
    return true;
  });

  useEffect(() => {
    if (viewMode !== 'slideshow' || displayedPhotos.length === 0 || !isSlideshowAuto) return;
    const interval = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % displayedPhotos.length);
    }, slideshowSpeed);
    return () => clearInterval(interval);
  }, [viewMode, displayedPhotos.length, isSlideshowAuto, slideshowSpeed]);

  // 5. AI Selfie Search Handler
  const captureSelfieAndSearch = async () => {
    if (!webcamRef.current) return;
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;

    setIsSearching(true);
    try {
      const img = new window.Image();
      img.src = imageSrc;
      await new Promise((r) => { img.onload = r; });
      const userDescriptor = await extractFaceDescriptorRobust(img);

      if (!userDescriptor) {
        alert('Could not detect a clear face in the selfie. Please try again with good lighting!');
        setIsSearching(false);
        return;
      }

      // Filter demo photos
      const matches = photos.filter(() => Math.random() > 0.3).map((p) => p.id);
      setMatchedPhotoIds(matches.length > 0 ? matches : [photos[0]?.id || '']);
      setShowSelfieCam(false);
    } catch (err) {
      console.error(err);
      alert('Facial recognition simulation error. Please try again!');
    } finally {
      setIsSearching(false);
    }
  };

  // 6. Interactive Floating Reactions
  const triggerReaction = (emoji: string, photoId?: string) => {
    if (photoId) {
      setReactionsMap((prev) => ({ ...prev, [photoId]: (prev[photoId] || 0) + 1 }));
    }
    const newReact = { id: `${Date.now()}-${Math.random()}`, emoji, x: Math.random() * 80 + 10 };
    setFloatingReactions((prev) => [...prev, newReact]);
    setTimeout(() => {
      setFloatingReactions((prev) => prev.filter((r) => r.id !== newReact.id));
    }, 2500);
  };

  const uploadUrl = typeof window !== 'undefined' ? `${window.location.origin}/demo/upload?id=${demoId}` : '';

  // Always render audio tag so music continues across view modes
  const audioNode = <audio ref={audioRef} loop src={TRACKS[currentTrackIndex].file} />;

  // ── SLIDESHOW VIEW ──────────────────────────────────────────
  if (viewMode === 'slideshow') {
    const currentPhoto = displayedPhotos[slideIndex % (displayedPhotos.length || 1)];
    return (
      <div className="fixed inset-0 z-[1000] overflow-hidden flex flex-col bg-[#050505] select-none">
        {audioNode}
        <div className="grain opacity-50" />
        <div className="orbs">
          <div className="orb orb-primary opacity-30" />
          <div className="orb orb-secondary opacity-30" />
        </div>

        {/* Floating Reactions overlay */}
        <div className="fixed inset-0 pointer-events-none z-[1200] overflow-hidden">
          {floatingReactions.map((r) => (
            <motion.div
              key={r.id}
              initial={{ y: '100vh', opacity: 1, scale: 0.8 }}
              animate={{ y: '-20vh', opacity: 0, scale: 1.5 }}
              transition={{ duration: 2.5, ease: 'easeOut' }}
              style={{ left: `${r.x}%` }}
              className="absolute text-4xl"
            >
              {r.emoji}
            </motion.div>
          ))}
        </div>

        {/* Header Bar - Mobile First Responsive Redesign */}
        <div className="absolute top-0 left-0 right-0 p-3 sm:p-6 md:p-8 flex justify-between items-center z-50 gap-2">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1 max-w-[55%] sm:max-w-none">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-surface/80 backdrop-blur-2xl border border-white/10 flex items-center justify-center text-accent-cyan shadow-lg shrink-0">
              <Layout size={16} className="sm:hidden" />
              <Layout size={20} className="hidden sm:block" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-wider text-accent-cyan truncate">LIVE DEMO</span>
                <span className="hidden sm:inline-flex text-[8px] sm:text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">Auto Sync Active</span>
              </div>
              <h1 className="text-xs sm:text-lg md:text-2xl font-black text-white truncate max-w-[130px] sm:max-w-none">Interactive Photo Wall</h1>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2.5 md:gap-3 shrink-0">
            {/* Music Toggle */}
            <RippleButton
              rippleColor="#ADD8E6"
              onClick={() => setIsAudioPlaying(!isAudioPlaying)}
              className={`!p-2 sm:!p-2.5 sm:px-3 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 ${
                isAudioPlaying ? 'bg-accent-cyan/20 text-accent-cyan border-accent-cyan/30' : 'bg-white/5 text-text-muted border-white/10'
              }`}
              title="Toggle Music"
            >
              <Music size={14} className={isAudioPlaying ? 'animate-spin text-accent-cyan' : ''} />
              <span className="hidden sm:inline">{isAudioPlaying ? 'Music On' : 'Music Off'}</span>
            </RippleButton>

            {/* Direct Upload Button */}
            {uploadUrl && (
              <Link
                href={uploadUrl}
                className="px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-accent-cyan text-black font-extrabold text-[11px] sm:text-xs uppercase tracking-wider hover:bg-accent-cyan/90 transition-all shadow-lg flex items-center gap-1 shrink-0"
              >
                <Camera size={13} />
                <span className="sm:hidden">+ Upload</span>
                <span className="hidden sm:inline">+ Upload Photo</span>
              </Link>
            )}

            <div className="hidden md:flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl p-1">
              {[3000, 5000, 8000].map((speed) => (
                <button
                  key={speed}
                  onClick={() => setSlideshowSpeed(speed)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                    slideshowSpeed === speed ? 'bg-accent-cyan text-black' : 'text-text-muted hover:text-white'
                  }`}
                >
                  {speed / 1000}s
                </button>
              ))}
            </div>

            <RippleButton
              rippleColor="#ADD8E6"
              onClick={() => setIsSlideshowAuto(!isSlideshowAuto)}
              className={`!p-2 sm:!p-2.5 sm:px-4 sm:py-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 ${
                isSlideshowAuto ? 'bg-accent-cyan/20 text-accent-cyan border-accent-cyan/30' : 'bg-white/5 text-text-muted border-white/10'
              }`}
              title={isSlideshowAuto ? 'Pause Slideshow' : 'Play Slideshow'}
            >
              {isSlideshowAuto ? <Pause size={14} /> : <Play size={14} />}
              <span className="hidden sm:inline">{isSlideshowAuto ? 'Auto Playing' : 'Paused'}</span>
            </RippleButton>

            <RippleButton
              rippleColor="#ADD8E6"
              onClick={() => setViewMode(prevViewMode)}
              className="!p-2 sm:!p-2.5 sm:px-4 sm:py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all font-bold text-xs text-white flex items-center gap-1.5"
              title="Exit Slideshow"
            >
              <X size={14} />
              <span className="hidden sm:inline">Exit</span>
            </RippleButton>
          </div>
        </div>

        {/* Main Media Container */}
        <div className="flex-grow relative w-full h-full flex items-center justify-center p-3 pt-16 pb-16 sm:p-6 sm:pt-24 sm:pb-24 md:p-12">
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
                  {currentPhoto.type === 'video' ? (
                    <video src={currentPhoto.url} className="w-full h-full object-contain max-h-[72vh]" autoPlay loop muted />
                  ) : (
                    <img src={currentPhoto.url} alt="" className="w-full h-full object-contain max-h-[72vh]" />
                  )}

                  {/* Reaction Overlay Bar */}
                  <div className="absolute bottom-4 right-4 z-30 flex items-center gap-2 bg-black/60 backdrop-blur-md p-2 rounded-full border border-white/10">
                    {['❤️', '🔥', '👏', '🎉'].map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => triggerReaction(emoji, currentPhoto.id)}
                        className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 hover:scale-125 transition-all flex items-center justify-center text-lg"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>

                  {/* Caption & Uploader Banner */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-6 backdrop-blur-sm flex items-end justify-between gap-4">
                    <div>
                      {currentPhoto.caption && (
                        <p className="text-lg md:text-xl font-medium text-white italic mb-1">
                          &quot;{currentPhoto.caption}&quot;
                        </p>
                      )}
                      <p className="text-xs font-black uppercase tracking-widest text-accent-cyan">
                        SHARED BY {currentPhoto.uploader}
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
            <div className="text-center text-text-muted text-sm">No photos uploaded to demo yet</div>
          )}
        </div>

        {/* Floating Controls */}
        {displayedPhotos.length > 1 && (
          <>
            <RippleButton
              rippleColor="#ADD8E6"
              onClick={() => setSlideIndex((prev) => (prev - 1 + displayedPhotos.length) % displayedPhotos.length)}
              className="!p-3.5 rounded-full bg-black/60 hover:bg-black/80 border border-white/10 text-white backdrop-blur-xl transition-all hover:scale-110 z-50 absolute left-6 top-1/2 -translate-y-1/2"
            >
              <ChevronLeft size={24} />
            </RippleButton>
            <RippleButton
              rippleColor="#ADD8E6"
              onClick={() => setSlideIndex((prev) => (prev + 1) % displayedPhotos.length)}
              className="!p-3.5 rounded-full bg-black/60 hover:bg-black/80 border border-white/10 text-white backdrop-blur-xl transition-all hover:scale-110 z-50 absolute right-6 top-1/2 -translate-y-1/2"
            >
              <ChevronRight size={24} />
            </RippleButton>
          </>
        )}
      </div>
    );
  }

  // ── MAIN WALL VIEW ──────────────────────────────────────────
  return (
    <div className="min-h-screen relative overflow-x-hidden flex flex-col bg-[#07080b] text-white">
      <div className="grain" />
      <div className="orbs">
        <div className="orb orb-primary opacity-40" />
        <div className="orb orb-secondary opacity-40" />
      </div>

      <FloatingParticles className="opacity-40" />
      <Confetti trigger={confettiTrigger} />

      {/* Floating Reactions Container */}
      <div className="fixed inset-0 pointer-events-none z-[1200] overflow-hidden">
        {floatingReactions.map((r) => (
          <motion.div
            key={r.id}
            initial={{ y: '100vh', opacity: 1, scale: 0.8 }}
            animate={{ y: '-20vh', opacity: 0, scale: 1.5 }}
            transition={{ duration: 2.5, ease: 'easeOut' }}
            style={{ left: `${r.x}%` }}
            className="absolute text-4xl"
          >
            {r.emoji}
          </motion.div>
        ))}
      </div>

      {revealPhoto && <NewPhotoReveal photo={revealPhoto} uploadUrl={uploadUrl} onDone={() => setRevealPhoto(null)} />}

      {audioNode}

      {/* Top Header Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-[100] h-20 border-b border-white/10 bg-[#0b0f19]/90 backdrop-blur-2xl px-6 md:px-12 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <AnimatedLogo width={140} height={32} />
          </Link>

          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-extrabold uppercase tracking-widest text-emerald-400">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)] animate-pulse" />
            LIVE DEMO STREAM
          </div>
        </div>

        <div className="flex items-center gap-2.5 md:gap-3">
          {/* Direct Upload Button */}
          {uploadUrl && (
            <Link
              href={uploadUrl}
              className="flex items-center gap-2 text-xs font-extrabold text-black bg-accent-cyan rounded-full px-4 py-2 shadow-xl hover:bg-accent-cyan/90 transition-all shrink-0"
            >
              <Camera size={14} className="text-black" />
              <span className="text-black font-extrabold text-xs tracking-wider uppercase whitespace-nowrap">+ UPLOAD PHOTO</span>
            </Link>
          )}

          {/* AI Selfie Match Button */}
          <ShimmerButton
            shimmerColor="#00E5FF"
            background="#0f172a"
            onClick={() => setShowSelfieCam(true)}
            paddingX={20}
            paddingY={8}
            className="hidden md:flex items-center gap-2 text-xs font-bold text-white border border-cyan-500/30 rounded-full shadow-lg shrink-0"
          >
            <Search size={14} className="text-accent-cyan shrink-0" />
            <span className="tracking-wide whitespace-nowrap">Find My Photos (AI)</span>
          </ShimmerButton>

          {/* Music Player Toggle */}
          <div className="relative">
            <RippleButton
              rippleColor="#ADD8E6"
              onClick={() => setShowMusicMenu(!showMusicMenu)}
              className="!p-2.5 rounded-full bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all"
              title="Background Music"
            >
              <Music size={16} className={isAudioPlaying ? 'text-accent-cyan animate-spin' : ''} />
            </RippleButton>

            {showMusicMenu && (
              <div className="absolute right-0 mt-3 w-56 rounded-2xl bg-[#0b0f19] border border-white/15 shadow-2xl p-3 z-50">
                <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 px-2">Background Music</p>
                <button
                  onClick={() => setIsAudioPlaying(!isAudioPlaying)}
                  className="w-full mb-2 flex items-center justify-between p-2.5 rounded-xl bg-white/10 text-xs font-bold text-white hover:bg-white/15 transition-all"
                >
                  <span>{isAudioPlaying ? 'Pause Music' : 'Play Music'}</span>
                  {isAudioPlaying ? <Pause size={14} /> : <Play size={14} />}
                </button>
                <div className="space-y-1">
                  {TRACKS.map((track, idx) => (
                    <button
                      key={track.title}
                      onClick={() => {
                        setCurrentTrackIndex(idx);
                        setIsAudioPlaying(true);
                        setShowMusicMenu(false);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        currentTrackIndex === idx ? 'bg-accent-cyan/20 text-accent-cyan' : 'text-text-secondary hover:text-white'
                      }`}
                    >
                      {track.title}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* QR Code Upload Button */}
          <ShimmerButton
            shimmerColor="#ffffff"
            onClick={() => setShowMobileQR(true)}
            paddingX={18}
            paddingY={8}
            className="hidden sm:flex items-center gap-2 text-xs font-extrabold text-black bg-white rounded-full shadow-xl shrink-0"
          >
            <QrCode size={14} className="text-black" />
            <span className="text-black font-extrabold text-xs tracking-wider uppercase whitespace-nowrap">SCAN QR</span>
          </ShimmerButton>
        </div>
      </nav>

      {/* Main Wall Body */}
      <main className="relative z-10 pt-28 px-6 sm:px-12 md:px-20 max-w-[1700px] mx-auto w-full flex-grow pb-32">
        {/* Wall Title & Toolbar */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <p className="text-accent-cyan text-xs font-black uppercase tracking-[.4em] mb-1">INTERACTIVE EVENT WALL DEMO</p>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
              Live Memory Lane
              <span className="text-xs font-mono px-3 py-1 rounded-full bg-white/10 text-white/70 border border-white/10 font-normal">
                Session: {demoId}
              </span>
            </h1>
          </div>

          {/* View Mode Selector Tabs */}
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 p-1.5 rounded-2xl">
            <button
              onClick={() => { setPrevViewMode(viewMode); setViewMode('polaroid'); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                viewMode === 'polaroid' ? 'bg-accent-cyan text-black shadow-lg' : 'text-text-muted hover:text-white'
              }`}
            >
              <Layers size={14} /> 3D Carousel
            </button>
            <button
              onClick={() => { setPrevViewMode(viewMode); setViewMode('slideshow'); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                (viewMode as string) === 'slideshow' ? 'bg-accent-cyan text-black shadow-lg' : 'text-text-muted hover:text-white'
              }`}
            >
              <Play size={14} /> Slideshow
            </button>
            <button
              onClick={() => { setPrevViewMode(viewMode); setViewMode('grid'); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                viewMode === 'grid' ? 'bg-accent-cyan text-black shadow-lg' : 'text-text-muted hover:text-white'
              }`}
            >
              <Grid size={14} /> Masonry Grid
            </button>
          </div>
        </div>

        {/* View Mode Content Render */}
        <AnimatePresence mode="wait">
          {viewMode === 'polaroid' ? (
            <motion.div key="polaroid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ paddingTop: '24px' }} className="flex flex-wrap gap-10 md:gap-14 justify-center pb-20 px-4 md:px-8">
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
                    {p.type === 'video' ? (
                      <video src={p.url} className="w-full h-full object-cover" muted playsInline />
                    ) : (
                      <img src={p.url} className="w-full h-full object-cover" alt="" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/0 to-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                  </div>

                  {/* Polaroid Caption Area */}
                  <div className="flex flex-col flex-grow justify-center text-center" style={{ padding: '16px 4px 8px 4px' }}>
                    {p.caption ? (
                      <p className="text-slate-800 font-medium text-sm leading-tight mb-2 whitespace-pre-wrap font-sans">
                        &quot;{p.caption}&quot;
                      </p>
                    ) : (
                      <p className="text-slate-400 italic text-xs mb-2">Demo Memory #{i + 1}</p>
                    )}
                    <div className="flex justify-between items-center text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em]">
                      <span>BY {p.uploader}</span>
                      <button
                        onClick={(e) => { e.stopPropagation(); triggerReaction('❤️', p.id); }}
                        className="hover:text-pink-600 transition-colors flex items-center gap-1 bg-slate-200/70 hover:bg-slate-200 rounded-full px-2 py-0.5 text-slate-700 border-0"
                      >
                        <Heart size={12} className="fill-pink-500 text-pink-500" />
                        <span>{reactionsMap[p.id] || 0}</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
              {displayedPhotos.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: (i % 8) * 0.05 }}
                  className="group relative rounded-2xl overflow-hidden border border-white/10 bg-surface/40 backdrop-blur-xl break-inside-avoid shadow-2xl"
                >
                  {p.type === 'video' ? (
                    <video src={p.url} className="w-full h-auto object-cover" autoPlay loop muted />
                  ) : (
                    <img src={p.url} className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700" alt="" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all p-5 flex flex-col justify-end">
                    <div className="flex justify-between items-start">
                      <p className="text-[10px] font-black text-accent-cyan uppercase tracking-widest mb-1">BY {p.uploader}</p>
                      <button
                        onClick={() => triggerReaction('❤️', p.id)}
                        className="hover:scale-125 transition-all flex items-center gap-1 rounded-full bg-black/40 px-3 py-1 text-xs font-bold text-white backdrop-blur-md border border-white/10"
                      >
                        <Heart size={14} className="fill-pink-500 text-pink-500" /> {reactionsMap[p.id] || 0}
                      </button>
                    </div>
                    {p.caption && <p className="text-sm font-medium text-white italic mt-1">&quot;{p.caption}&quot;</p>}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Floating Bottom Right WhatsApp Barcode Card */}
      <div className="fixed bottom-8 right-8 z-[90] hidden lg:block">
        <Link
          href="https://wa.me/919866161775"
          target="_blank"
          className="p-4 bg-[#0b0f19]/90 backdrop-blur-2xl rounded-2xl border border-white/15 hover:border-emerald-500/40 shadow-2xl flex flex-col items-center gap-2 text-center group transition-all"
        >
          <div className="p-3 bg-white/10 rounded-xl border border-white/10">
            <QRCode value="https://wa.me/919866161775" size={120} bgColor="transparent" fgColor="#ffffff" qrStyle="dots" eyeRadius={10} />
          </div>
          <div className="flex flex-col items-center">
            <p className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-0.5">DEMO HELP & PRICING</p>
            <p className="text-xs font-extrabold text-white flex items-center gap-1.5">
              <span className="text-emerald-400">WhatsApp</span>
              <span className="text-text-muted">• +91 9866161775</span>
            </p>
          </div>
        </Link>
      </div>

      {/* Floating Mobile QR Upload Modal */}
      <AnimatePresence>
        {showMobileQR && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[600] bg-black/80 backdrop-blur-md flex items-center justify-center p-6"
          >
            <div className="bg-[#0b0f19] border border-white/15 rounded-3xl p-8 max-w-sm w-full text-center relative shadow-2xl">
              <button
                onClick={() => setShowMobileQR(false)}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
              >
                <X size={18} />
              </button>
              <h3 className="text-xl font-extrabold text-white mb-2">Upload to Demo Wall</h3>
              <p className="text-xs text-text-secondary mb-6">Scan with your phone camera to upload live photos or videos instantly.</p>
              <div className="p-4 bg-white rounded-2xl inline-block mb-6">
                <QRCode value={uploadUrl} size={180} bgColor="#ffffff" fgColor="#000000" qrStyle="dots" eyeRadius={10} />
              </div>
              <Link
                href={uploadUrl}
                target="_blank"
                className="block w-full py-3 rounded-xl bg-accent-cyan text-black font-extrabold text-xs uppercase tracking-wider hover:bg-accent-cyan/90 transition-all"
              >
                Open Mobile Upload Screen
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Selfie Cam Scanner Modal */}
      <AnimatePresence>
        {showSelfieCam && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[600] bg-black/85 backdrop-blur-md flex items-center justify-center p-6"
          >
            <div className="bg-[#0b0f19] border border-cyan-500/30 rounded-3xl p-8 max-w-md w-full text-center relative shadow-2xl">
              <button
                onClick={() => setShowSelfieCam(false)}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
              >
                <X size={18} />
              </button>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-cyan/10 text-accent-cyan text-[10px] font-black uppercase tracking-widest mb-4">
                <Search size={12} /> AI Face Search Demo
              </div>
              <h3 className="text-xl font-extrabold text-white mb-2">Find Your Photos</h3>
              <p className="text-xs text-text-secondary mb-6">Take a quick selfie to test AI facial recognition searching through all event photos.</p>

              <div className="relative aspect-square w-full rounded-2xl overflow-hidden border border-cyan-500/30 mb-6 bg-black">
                <Webcam ref={webcamRef} screenshotFormat="image/jpeg" className="w-full h-full object-cover" />
              </div>

              <RippleButton
                rippleColor="#ADD8E6"
                onClick={captureSelfieAndSearch}
                disabled={isSearching}
                className="w-full py-3.5 rounded-xl bg-accent-cyan text-black font-extrabold text-xs uppercase tracking-wider shadow-lg disabled:opacity-50"
              >
                {isSearching ? 'Analyzing Face Features...' : 'Scan Selfie & Filter'}
              </RippleButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Sticky Upload FAB Button for 1-Tap Photo Upload */}
      {uploadUrl && (
        <div className="fixed bottom-6 left-6 z-[110]">
          <Link
            href={uploadUrl}
            className="flex items-center gap-2.5 px-5 py-3.5 rounded-full bg-accent-cyan text-black font-extrabold text-xs uppercase tracking-wider shadow-[0_10px_30px_rgba(0,229,255,0.4)] hover:scale-105 active:scale-95 transition-all border border-cyan-300/40"
          >
            <Camera size={18} />
            <span>+ Upload Photo</span>
          </Link>
        </div>
      )}
    </div>
  );
}

export default function DemoPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#07080b]">
        <div className="w-10 h-10 border-2 border-white/10 border-t-accent-cyan rounded-full animate-spin" />
      </div>
    }>
      <DemoWallInner />
    </Suspense>
  );
}
