"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import Webcam from 'react-webcam';
import { extractFaceDescriptor } from '@/lib/faceEngine';
import { useAuth } from '@/hooks/useAuth';
import { hasFeature } from '@/lib/permissions';

// ── Components ──────────────────────────────────────────────

const FontLoader = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,700;0,900;1,700&display=swap');
    
    :root {
      --bg: #fafcfe;
      --surface: rgba(255, 255, 255, 0.45);
      --border: rgba(255, 255, 255, 0.6);
      --amber: #fbbf24;
      --rose: #f472b6;
      --gold: #fcd34d;
      --text1: #1e293b;
      --text2: #64748b;
      --radius: 24px;
      --nm-shadow: 0 8px 32px rgba(30, 41, 59, 0.05);
    }

    .wall-page {
      min-height: 100vh;
      background: var(--bg);
      color: var(--text1);
      font-family: 'Outfit', system-ui, sans-serif;
      position: relative;
      overflow-x: hidden;
      padding: 100px 64px 140px;
      z-index: 1;
    }
    @media (max-width: 1024px) {
      .wall-page { padding: 40px 20px 100px !important; }
    }

    /* ─── UI COMPONENTS ─── */
    .glass-card {
      background: rgba(255, 255, 255, 0.7);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.4);
      border-radius: var(--radius);
      box-shadow: 0 8px 32px rgba(31, 38, 135, 0.07);
    }

    .btn-hero-primary {
      background: linear-gradient(135deg, #f59e0b, #f472b6);
      color: #000;
      font-weight: 800;
      padding: 12px 28px;
      border-radius: 16px;
      display: inline-flex;
      align-items: center;
      gap: 10px;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      box-shadow: 0 10px 25px rgba(245, 158, 11, 0.2);
    }
    .btn-hero-primary:hover {
      transform: scale(1.05);
      box-shadow: 0 15px 35px rgba(245, 158, 11, 0.3);
    }

    .polaroid-card {
      background: #ffffff;
      padding: 12px 12px 60px 12px;
      box-shadow: 0 20px 50px rgba(0,0,0,0.1);
      border-radius: 4px;
      position: relative;
    }

    .wall-heading {
      font-family: 'Playfair Display', Georgia, serif;
      font-weight: 900;
      font-size: clamp(3rem, 8vw, 6rem);
      letter-spacing: -0.04em;
      line-height: 1;
      background: linear-gradient(135deg, #1e293b, #f59e0b, #f472b6);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      filter: drop-shadow(0 10px 30px rgba(245, 158, 11, 0.15));
    }

    /* ─── DREAMY BACKGROUND ─── */
    .grain {
      position: fixed; inset: 0; z-index: 1; opacity: 0.02;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
      pointer-events: none;
    }
  `}</style>
)

const DreamyBackground = ({ primary, secondary }: { primary: string; secondary: string }) => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
    <div className="aurora-bg absolute inset-0 opacity-50" />
    <div className="grain" />
    
    <motion.div 
      animate={{ x: [0, 100, 0], y: [0, -50, 0], scale: [1, 1.2, 1] }}
      transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
      className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] md:w-[800px] md:h-[800px] rounded-full opacity-30"
      style={{ background: `radial-gradient(circle, ${primary}, transparent 70%)`, filter: 'blur(100px)' }}
    />
    <motion.div 
      animate={{ x: [0, -80, 0], y: [0, 60, 0], scale: [1, 1.1, 1] }}
      transition={{ duration: 20, repeat: Infinity, ease: "linear", delay: 2 }}
      className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] md:w-[700px] md:h-[700px] rounded-full opacity-30"
      style={{ background: `radial-gradient(circle, ${secondary}, transparent 70%)`, filter: 'blur(100px)' }}
    />
    <motion.div 
      animate={{ x: [0, 60, 0], y: [0, -100, 0], scale: [0.8, 1.3, 0.8] }}
      transition={{ duration: 22, repeat: Infinity, ease: "linear", delay: 5 }}
      className="absolute top-[20%] right-[10%] w-[40vw] h-[40vw] md:w-[500px] md:h-[500px] rounded-full opacity-20"
      style={{ background: `radial-gradient(circle, #fcd34d, transparent 70%)`, filter: 'blur(80px)' }}
    />
    <motion.div 
      animate={{ x: [0, -120, 0], y: [0, 80, 0], scale: [0.9, 1.4, 0.9] }}
      transition={{ duration: 28, repeat: Infinity, ease: "linear", delay: 8 }}
      className="absolute bottom-[20%] left-[20%] w-[45vw] h-[45vw] md:w-[600px] md:h-[600px] rounded-full opacity-20"
      style={{ background: `radial-gradient(circle, #06b6d4, transparent 70%)`, filter: 'blur(90px)' }}
    />
  </div>
);

// ── NEW PHOTO REVEAL ────────────────────────────────────────

interface NewPhotoRevealProps {
  photo: Photo | null;
  uploadUrl: string;
  getPublicUrl: (path: string) => string;
  onDone: () => void;
}

const NewPhotoReveal = ({ photo, uploadUrl, getPublicUrl, onDone }: NewPhotoRevealProps) => {
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
      initial={{ opacity: 0, scale: 1.05 }}
      animate={{ opacity: exiting ? 0 : 1, scale: exiting ? 1.05 : 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="reveal-backdrop"
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'linear-gradient(135deg, rgba(0,0,0,0.95) 0%, rgba(15,10,30,0.98) 100%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: 32,
      }}
    >
      {/* "NEW MEMORY" badge */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="reveal-badge" 
        style={{
          marginBottom: 28,
          background: 'linear-gradient(135deg, #fbbf24, #f472b6)',
          borderRadius: 100,
          padding: '8px 28px',
          fontSize: 11,
          fontWeight: 900,
          color: '#fff',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          boxShadow: '0 4px 24px rgba(244,114,182,0.5)',
        }}
      >
        ✦ New Memory Just Arrived ✦
      </motion.div>

      {/* Photo */}
      <motion.div 
        initial={{ y: 40, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="reveal-img" 
        style={{ position: 'relative', maxWidth: 540, width: '100%' }}
      >
        <div style={{
          position: 'absolute', inset: -40,
          background: 'radial-gradient(ellipse, rgba(245,158,11,0.25) 0%, transparent 70%)',
          borderRadius: '50%', filter: 'blur(20px)',
        }} />
        {photo.media_type === 'video'
          ? <video src={getPublicUrl(photo.storage_path)} style={{ width: '100%', borderRadius: 24, boxShadow: '0 40px 100px rgba(0,0,0,0.8)', display: 'block', objectFit: 'contain', maxHeight: '55vh', position: 'relative', zIndex: 10 }} autoPlay loop muted />
          : <img src={getPublicUrl(photo.storage_path)} style={{ width: '100%', borderRadius: 24, boxShadow: '0 40px 100px rgba(0,0,0,0.8)', display: 'block', objectFit: 'contain', maxHeight: '55vh', position: 'relative', zIndex: 10 }} alt="" />
        }
      </motion.div>

      {/* Meta */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        className="reveal-meta" 
        style={{ marginTop: 32, textAlign: 'center' }}
      >
        <p style={{ fontSize: 11, fontWeight: 800, color: '#fbbf24', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 6, opacity: 0.85 }}>Shared by</p>
        <h2 style={{ fontSize: 36, fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', fontFamily: "'Playfair Display', serif", marginBottom: photo.caption ? 10 : 0 }}>
          {photo.uploader_name}
        </h2>
        {photo.caption && (
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.8)', fontStyle: 'italic', maxWidth: 420, lineHeight: 1.5 }}>
            "{photo.caption}"
          </p>
        )}
      </motion.div>

      {/* Skip */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        onClick={() => { setExiting(true); setTimeout(onDone, 800); }}
        style={{ position: 'absolute', top: 28, right: 28, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '8px 18px', borderRadius: 12, fontSize: 12, fontWeight: 700, cursor: 'pointer', letterSpacing: '0.06em' }}
      >
        SKIP ✕
      </motion.button>
    </motion.div>
  );
};

const Confetti = ({ trigger }: { trigger: boolean }) => {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; color: string; size: number }>>([]);
  useEffect(() => {
    if (!trigger) return;
    const palette = ['#f59e0b', '#fb923c', '#f472b6', '#a78bfa', '#fcd34d', '#34d399'];
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
    <div className="fixed inset-0 pointer-events-none z-50">
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


// ── Types ──────────────────────────────────────────────────

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

type ViewMode = 'grid' | 'polaroid' | 'slideshow' | 'album';

// ── Main Component ─────────────────────────────────────────

export default function WallPage() {
  const params = useParams();
  const slug = params.slug as string;

  // -- State --
  const [eventName, setEventName] = useState('');
  const [theme, setTheme] = useState({ primary: '#f59e0b', secondary: '#f472b6' });
  const [brand, setBrand] = useState<{ logoUrl: string | null; colors: { primary: string; secondary: string } | null }>({ logoUrl: null, colors: null });
  const [eventExpired, setEventExpired] = useState(false);
  const [eventId, setEventId] = useState<string | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [planTier, setPlanTier] = useState<string>('STARTER');
  const [isAdmin, setIsAdmin] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('polaroid');
  const [prevViewMode, setPrevViewMode] = useState<ViewMode>('polaroid');
  const [realtimeStatus, setRealtimeStatus] = useState<string>('connecting');
  const [moderationMode, setModerationMode] = useState(false);
  const [confettiTrigger, setConfettiTrigger] = useState(false);
  const [showBestShots, setShowBestShots] = useState(false);
  const [revealPhoto, setRevealPhoto] = useState<Photo | null>(null);
  const [matchedPhotoIds, setMatchedPhotoIds] = useState<string[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showSelfieCam, setShowSelfieCam] = useState(false);
  const webcamRef = useRef<Webcam>(null);
  const { user } = useAuth();
  const [ownerId, setOwnerId] = useState<string | null>(null);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [musicTrack, setMusicTrack] = useState<string | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [slideIndex, setSlideIndex] = useState(0);
  const viewModeRef = useRef<ViewMode>(viewMode);

  useEffect(() => {
    viewModeRef.current = viewMode;
  }, [viewMode]);

  // -- Callbacks --

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

  // -- Effects --

  useEffect(() => {
    const fetchEvent = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('events')
        .select('id, name, theme_primary_color, theme_secondary_color, expires_at, enable_safety_filter, owner_id, plan_type, music_track')
        .eq('slug', slug)
        .single();

      if (error) {
        if (error.code === 'PGRST116') setNotFound(true);
        else setErrorStatus(`Database Error: ${error.message}`);
        setLoading(false); return;
      }
      if (!data) { setNotFound(true); setLoading(false); return; }

      if (data) {
        setEventName(data.name);
        setEventId(data.id);
        const isOwner = user && user.id === data.owner_id;
        setOwnerId(data.owner_id);
        setIsAdmin(!!isOwner);
        const actualPlan = (data.plan_type || 'STARTER').toUpperCase();
        setPlanTier(actualPlan);
        
        if (data.theme_primary_color && data.theme_secondary_color)
          setTheme({ primary: data.theme_primary_color, secondary: data.theme_secondary_color });
      }
      if (data.expires_at && new Date(data.expires_at) < new Date()) setEventExpired(true);
      if (data.enable_safety_filter) setModerationMode(true);
      if (data.music_track && data.music_track !== 'none') setMusicTrack(data.music_track);

      try {
        const { data: profile } = await supabase.from('profiles').select('plan, role').eq('id', data.owner_id).single();
        if (data.plan_type === 'WHITE_LABEL') {
          setBrand({ logoUrl: null, colors: null });
        }
      } catch { }
      setLoading(false);
    };
    fetchEvent();
  }, [slug]);

  useEffect(() => {
    if (!eventId) return;
    const fetchPhotos = async () => {
      const { data } = await supabase.rpc('get_photos_with_reactions', { event_uuid: eventId });
      if (data) setPhotos(data);
    };
    fetchPhotos();

    const channel = supabase.channel(`wall-${eventId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'photos', filter: `event_id=eq.${eventId}` }, 
        (payload) => {
          const newPhoto = payload.new as Photo;
          const oldPhoto = payload.old as Photo;

          if (payload.eventType === 'INSERT') {
            // Only add and animate if already approved (Safety Filter OFF)
            if (newPhoto.approved) {
              setPhotos(prev => [newPhoto, ...prev]);
              setConfettiTrigger(true);
              setRevealPhoto(newPhoto);
              setTimeout(() => setConfettiTrigger(false), 3000);
            }
          } else if (payload.eventType === 'UPDATE') {
            // If it was just approved (Safety Filter ON -> Admin Approved)
            if (!oldPhoto?.approved && newPhoto.approved) {
              setPhotos(prev => [newPhoto, ...prev.filter(p => p.id !== newPhoto.id)]);
              setConfettiTrigger(true);
              setRevealPhoto(newPhoto);
              setTimeout(() => setConfettiTrigger(false), 3000);
            } 
            // If it was unapproved/hidden later
            else if (oldPhoto?.approved && !newPhoto.approved) {
              setPhotos(prev => prev.filter(p => p.id !== newPhoto.id));
            }
          } else if (payload.eventType === 'DELETE') {
            setPhotos(prev => prev.filter(p => p.id !== oldPhoto.id));
          }
        }
      )
      .subscribe((status) => {
        setRealtimeStatus(status);
        if (status !== 'SUBSCRIBED') startPolling();
      });

    return () => { supabase.removeChannel(channel); };
  }, [eventId, moderationMode, startPolling]);

  // Slideshow auto-advance
  useEffect(() => {
    if (viewMode === 'slideshow' && photos.length > 0) {
      const timer = setInterval(() => setSlideIndex(i => (i + 1) % photos.length), 5000);
      return () => clearInterval(timer);
    }
  }, [viewMode, photos.length]);

  // ESC to exit slideshow
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && viewMode === 'slideshow') {
        setViewMode(prevViewMode);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewMode, prevViewMode]);

  // -- Actions --

  const handleSelfieSearch = async () => {
    setShowSelfieCam(true);
  };

  const captureSelfieAndSearch = async () => {
    if (!webcamRef.current) return;
    const screenshot = webcamRef.current.getScreenshot();
    if (!screenshot) return;
    
    setIsSearching(true);
    setShowSelfieCam(false);
    
    try {
      // Convert base64 to Image element for AI processing
      const img = new Image();
      img.src = screenshot;
      await new Promise(resolve => img.onload = resolve);
      
      const descriptor = await extractFaceDescriptor(img);
      if (!descriptor) {
        alert("We couldn't see your face clearly. Please try again with better lighting!");
        return;
      }
      
      const { data, error } = await supabase.rpc('match_photo_faces', {
        query_embedding: Array.from(descriptor),
        match_threshold: 0.5,
        match_count: 50,
        target_event_id: eventId
      });
      
      if (error) throw error;
      
      const photoIds = data.map((d: any) => d.photo_id);
      setMatchedPhotoIds(photoIds);
      
      if (photoIds.length === 0) {
        alert("We couldn't find any photos of you yet—keep sharing!");
      } else {
        alert(`Found ${photoIds.length} photos of you!`);
      }
      
    } catch (err: any) {
      console.error("Match error:", err);
      alert("Error searching for photos. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  const downloadPhoto = async (photo: Photo) => {
    const res = await fetch(getPublicUrl(photo.storage_path));
    const blob = await res.blob();
    saveAs(blob, `memento-${photo.uploader_name}-${photo.id.slice(0, 4)}.jpg`);
  };

  const handleLike = async (photoId: string) => {
    const gid = localStorage.getItem('memento_guest_id') || `guest_${Date.now()}`;
    localStorage.setItem('memento_guest_id', gid);
    setPhotos(prev => prev.map(p => p.id === photoId ? { ...p, reaction_count: (p.reaction_count || 0) + 1 } : p));
    const { error } = await supabase.from('reactions').insert({ photo_id: photoId, guest_id: gid });
    if (error) setPhotos(prev => prev.map(p => p.id === photoId ? { ...p, reaction_count: (p.reaction_count || 0) - 1 } : p));
  };

  const handleDownloadZip = async () => {
    const isOwner = user && user.id === ownerId;
    const photosToDownload = isOwner 
      ? displayedPhotos 
      : displayedPhotos.filter(p => matchedPhotoIds?.includes(p.id));

    if (photosToDownload.length === 0) {
      if (isOwner) alert("No photos to download yet!");
      else alert("✨ Please use the 'Find My Photos' button to match your photos before downloading your collection.");
      return;
    }

    if (!isOwner) {
      const confirmDownload = confirm(`Ready to download your ${photosToDownload.length} matched photos?`);
      if (!confirmDownload) return;
    }

    alert(`Preparing ${isOwner ? 'Full Event' : 'your personal'} ZIP archive...`);
    const zip = new JSZip();
    const folder = zip.folder(`${slug}-memento`);
    
    // Process only the filtered photos
    for (const p of photosToDownload) {
      try {
        const blob = await (await fetch(getPublicUrl(p.storage_path))).blob();
        folder?.file(`${p.uploader_name}-${p.id.slice(0, 4)}.jpg`, blob);
      } catch (e) {
        console.error("Download failed for photo:", p.id, e);
      }
    }
    
    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, `${slug}-${isOwner ? 'master' : 'personal'}-memento.zip`);
  };

  const uploadUrl = typeof window !== 'undefined' ? `${window.location.origin}/mobile/${slug}` : '';
  const displayedPhotos = showBestShots ? photos.filter(p => p.is_best_shot) : photos;
  const themeP = brand.colors?.primary || theme.primary;
  const themeS = brand.colors?.secondary || theme.secondary;

  // -- Helper Components --

  const StatusBadge = () => {
    const isLive = realtimeStatus === 'SUBSCRIBED';
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, background: 'var(--surface)', padding: '6px 14px', borderRadius: 100, border: '1px solid var(--border)', boxShadow: '0 2px 8px rgba(30,41,59,0.05)', fontWeight: 600 }}>
        <div className="status-dot" style={{ width: 8, height: 8, borderRadius: '50%', background: isLive ? '#4ade80' : 'var(--amber)' }} />
        <span style={{ color: isLive ? '#166534' : '#92400e' }}>{isLive ? 'LIVE' : 'POLLING'}</span>
      </div>
    );
  };

  const Watermark = () => {
    // Branding Removal is strictly for WHITE_LABEL events
    if (hasFeature(planTier, 'BRANDING_REMOVAL')) return null;

    return (
      <div style={{
        position: 'absolute', bottom: 12, right: 12,
        display: 'flex', alignItems: 'center',
        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
        opacity: 0.6, pointerEvents: 'none'
      }}>
        <img
          src="/CC logo.png"
          alt="Memento"
          style={{ height: 14, width: 'auto', display: 'block', objectFit: 'contain' }}
        />
      </div>
    );
  };

  // -- Render States --

  if (loading) return (
    <div className="wall-page flex items-center justify-center">
      <div className="text-center relative z-10">
        <div style={{ width: 48, height: 48, border: '4px solid var(--surface)', borderTopColor: 'var(--amber)', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: 16, margin: '0 auto' }} />
        <p style={{ fontSize: 16, fontWeight: 500, color: 'var(--text2)' }}>Entering the Wall…</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );

  if (notFound || eventExpired) return (
    <div className="wall-page flex items-center justify-center p-6 text-center">
      <div className="glass-card p-12 max-w-md relative z-10">
        <div style={{ fontSize: 64, marginBottom: 20 }}>{notFound ? '✨' : '📅'}</div>
        <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 16, color: 'var(--text1)' }}>{notFound ? 'Wall Not Found' : 'Event Concluded'}</h1>
        <p style={{ color: 'var(--text2)', marginBottom: 32, fontSize: 16 }}>{notFound ? "This memory lane hasn't been created yet." : "The photo wall for this event has reached its destination."}</p>
        <Link href="/" className="btn-glow inline-block px-10 py-4 rounded-2xl font-bold uppercase tracking-wider text-sm">Go Home</Link>
      </div>
    </div>
  );

  if (viewMode === 'slideshow') {
    const current = displayedPhotos[slideIndex];
    return (
      <div className="wall-page fixed inset-0 z-[10000] h-screen w-screen overflow-hidden bg-transparent">
        <FontLoader />
        <DreamyBackground primary={themeP} secondary={themeS} />

        {/* Dynamic Cinematic Background */}
        {current && (
          <div style={{ 
            position: 'absolute', inset: 0, 
            backgroundImage: `url(${getPublicUrl(current.storage_path)})`,
            backgroundSize: 'cover', backgroundPosition: 'center',
            filter: 'blur(100px) brightness(1.1) saturate(1.2)',
            transition: 'background-image 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
            opacity: 0.3,
            zIndex: 0
          }} />
        )}

        {revealPhoto && (
          <NewPhotoReveal
            photo={revealPhoto}
            uploadUrl={uploadUrl}
            getPublicUrl={getPublicUrl}
            onDone={() => setRevealPhoto(null)}
          />
        )}

        {/* Header Overlay */}
        <div className="absolute top-0 left-0 right-0 z-50" style={{ padding: '24px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(to bottom, rgba(255,255,255,0.2), transparent)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{ fontSize: 9, fontWeight: 900, color: '#000', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Live Experience</span>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: '#000', letterSpacing: '-0.02em', fontFamily: "'Playfair Display', serif" }}>{eventName}</h1>
          </div>
          {isAdmin && (
            <button onClick={() => setViewMode(prevViewMode)} className="px-8 py-3 rounded-full font-bold text-[10px] bg-black/5 text-black border border-black/10 hover:bg-black/10 transition-all backdrop-filter blur-md uppercase tracking-widest">✕ EXIT SLIDESHOW</button>
          )}
        </div>

        {/* Main Content Area */}
        <div className="absolute inset-0 z-10 flex items-center justify-center overflow-hidden px-20">
          <AnimatePresence mode="wait">
            {current && (
              <motion.div 
                key={current.id}
                initial={{ opacity: 0, scale: 0.9, x: 20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 1.1, x: -20 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                className="w-full h-full flex items-center justify-center relative"
              >
                {/* Image/Video Layer */}
                <div 
                  className="w-full h-full flex items-center justify-center" 
                  style={{ 
                    paddingLeft: '460px',
                    paddingRight: '80px'
                  }}
                >
                  <motion.div
                    initial={{ y: 40, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                    className="relative group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/20 to-rose-500/20 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    {current.media_type === 'video' ? (
                      <video 
                        src={getPublicUrl(current.storage_path)} 
                        className="max-h-[85vh] max-w-full w-auto h-auto object-contain rounded-3xl shadow-[0_40px_120px_rgba(0,0,0,0.5)] relative z-10"
                        autoPlay loop muted 
                      />
                    ) : (
                      <img 
                        src={getPublicUrl(current.storage_path)} 
                        className="max-h-[85vh] max-w-full w-auto h-auto object-contain rounded-3xl shadow-[0_40px_120px_rgba(0,0,0,0.5)] relative z-10"
                        alt="" 
                      />
                    )}
                    {planTier !== 'WHITE_LABEL' && <Watermark />}
                  </motion.div>
                </div>

                {/* QR Side Panel (Left, Stacked) */}
                <motion.div 
                  initial={{ x: -100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                  className="slideshow-side-panel qr-side float-anim"
                >
                  <div className="bg-white p-3 rounded-2xl shadow-2xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-tr from-amber-50 to-rose-50 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <QRCodeSVG value={uploadUrl} size={130} bgColor="transparent" fgColor="#000" className="relative z-10" />
                  </div>
                  <p className="mt-6 text-black font-black text-[10px] uppercase tracking-[0.2em] opacity-80 leading-relaxed" style={{ maxWidth: 140 }}>
                    Scan to <span className="text-amber-600">Join the Memory Wall</span>
                  </p>
                </motion.div>

                {/* Metadata Side Panel (Left, Stacked) */}
                <motion.div 
                  initial={{ x: -100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.7, duration: 0.8 }}
                  className="slideshow-side-panel meta-side float-anim" 
                  style={{ animationDelay: '-1.5s' }}
                >
                  <div className="flex flex-col gap-6 text-left">
                    <div>
                      <span className="text-[10px] font-black text-amber-600 tracking-[0.2em] uppercase opacity-80">Moment Shared By</span>
                      <h2 className="text-4xl font-black text-slate-900 tracking-tight font-serif mt-2 leading-tight">
                        {current.uploader_name}
                      </h2>
                    </div>
                    
                    {current.caption && (
                      <div className="py-6 border-y border-slate-900/5">
                        <p className="text-xl text-slate-800 italic font-medium leading-relaxed opacity-90">
                          &quot;{current.caption}&quot;
                        </p>
                      </div>
                    )}

                    <div className="flex gap-3 mt-2">
                       <motion.div 
                        whileHover={{ scale: 1.05 }}
                        className="px-6 py-2.5 rounded-2xl bg-white/40 backdrop-blur-xl border border-white/50 text-slate-900 font-black text-[10px] tracking-widest uppercase shadow-sm"
                       >
                        {current.reaction_count || 0} ❤️
                      </motion.div>
                      <motion.div 
                        whileHover={{ scale: 1.05 }}
                        className="px-6 py-2.5 rounded-2xl bg-white/40 backdrop-blur-xl border border-white/50 text-slate-900 font-black text-[10px] tracking-widest uppercase shadow-sm"
                      >
                        {new Date(current.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <style>{`
          @keyframes fadeInScale {
            from { opacity: 0; transform: scale(0.96) translateY(20px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
          }
        `}</style>
      </div>
    );
  }

  // ── NORMAL PAGE ────────────────────────────────────────────
  return (
    <div className="wall-page">
      <FontLoader />
      <DreamyBackground primary={themeP} secondary={themeS} />

      {musicTrack && isAudioPlaying && hasFeature(planTier, 'SLIDESHOW_MUSIC') && (
        <audio ref={audioRef} autoPlay loop src={`/music/${musicTrack}.mp3`} />
      )}

      {/* ── NEW PHOTO REVEAL OVERLAY ── */}
      {revealPhoto && (
        <NewPhotoReveal
          photo={revealPhoto}
          uploadUrl={uploadUrl}
          getPublicUrl={getPublicUrl}
          onDone={() => setRevealPhoto(null)}
        />
      )}

      <div className="wall-container" style={{ maxWidth: 1440, margin: '0 auto' }}>
        {/* SIDEBAR */}
        <aside className="wall-sidebar">
          <div className="glass-card qr-container">
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8, color: 'var(--text1)' }}>Join the Wall</h3>
            <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 24 }}>Scan to share your memories</p>
            <div className="qr-box">
              <QRCodeSVG value={uploadUrl} size={200} />
            </div>
            {isAdmin && <p style={{ fontSize: 11, color: 'var(--text2)', wordBreak: 'break-all', marginTop: 16, opacity: 0.6 }}>{uploadUrl}</p>}
          </div>

          <div className="glass-card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text2)' }}>STATUS</span>
              <StatusBadge />
            </div>
            <div style={{ height: 1, background: 'var(--border)', opacity: 0.3 }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text2)' }}>PHOTOS</span>
              <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--text1)' }}>{displayedPhotos.length}</span>
            </div>
          </div>

          <div className="glass-card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <button 
              onClick={matchedPhotoIds ? () => setMatchedPhotoIds(null) : handleSelfieSearch}
              className={`w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                matchedPhotoIds 
                ? 'bg-slate-100 text-slate-500 hover:bg-slate-200' 
                : 'bg-amber-500/10 text-amber-600 border border-amber-500/20 hover:bg-amber-500/20'
              }`}
            >
              {isSearching ? 'SEARCHING...' : matchedPhotoIds ? '✕ CLEAR SEARCH' : '✨ FIND MY PHOTOS'}
            </button>
            <button 
              onClick={handleDownloadZip} 
              className="btn-glow w-full py-4 rounded-2xl font-bold tracking-wider text-sm flex items-center justify-center gap-2"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
              {user && user.id === ownerId ? 'DOWNLOAD MASTER ZIP' : 'DOWNLOAD MY PHOTOS'}
            </button>
            {matchedPhotoIds && (
               <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-widest">{matchedPhotoIds.length} photos found</p>
            )}
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="wall-main">
          {/* ── FIX 2: Center-aligned title header ── */}
          <header className="action-bar">
            <div style={{ textAlign: 'center', width: '100%' }}>
              <h1
                className="wall-heading"
                data-text={eventName}
              >
                {eventName}
              </h1>
              {/* Decorative underline — centered */}
              <div style={{
                margin: '12px auto 0',
                height: 3,
                width: 120,
                borderRadius: 100,
                background: 'linear-gradient(90deg, #fbbf24, #f472b6, transparent)',
                opacity: 0.8,
              }} />
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ background: 'rgba(255,255,255,0.5)', padding: 6, borderRadius: 18, display: 'flex', gap: 6, border: '1px solid var(--border)', backdropFilter: 'blur(12px)' }}>
                {(['polaroid', 'grid', 'album', 'slideshow'] as ViewMode[]).map(m => (
                  <button key={m} onClick={() => {
                    if (m === 'slideshow') setPrevViewMode(viewMode);
                    setViewMode(m);
                  }} style={{
                    padding: '10px 18px', borderRadius: 12, border: 'none', fontSize: 12, fontWeight: 800, transition: '0.3s',
                    background: viewMode === m ? 'linear-gradient(135deg, var(--amber), var(--rose))' : 'transparent',
                    color: viewMode === m ? '#fff' : 'var(--text2)',
                    boxShadow: viewMode === m ? '0 4px 12px rgba(244,114,182,0.3)' : 'none',
                    letterSpacing: '0.03em', cursor: 'pointer',
                  }}>{m.toUpperCase()}</button>
                ))}
              </div>
            </div>
          </header>

          {/* ── VIEWS ── */}
          <AnimatePresence mode="wait">
            {displayedPhotos.length === 0 ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                className="glass-card" 
                style={{ padding: 100, textAlign: 'center' }}
              >
                <div style={{ fontSize: 100, marginBottom: 32, opacity: 0.8 }}>✨</div>
                <h2 style={{ fontSize: 36, fontWeight: 800, marginBottom: 16, color: 'var(--text1)' }}>Your Wall Awaits</h2>
                <p style={{ color: 'var(--text2)', marginBottom: 40, fontSize: 18, maxWidth: 500, margin: '0 auto 40px' }}>Waiting for the first magical moment to be shared. The memories you capture here will last a lifetime.</p>
              </motion.div>

            ) : viewMode === 'polaroid' ? (
              /* ── POLAROID ── */
              <motion.div 
                key="polaroid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-wrap gap-10 justify-center"
              >
                {displayedPhotos.map((p, i) => (
                  <motion.div 
                    key={p.id} 
                    initial={{ opacity: 0, y: 40, rotate: (i % 6 - 3) * 5 }}
                    animate={{ opacity: 1, y: 0, rotate: (i % 6 - 3) * 2 }}
                    whileHover={{ scale: 1.05, rotate: 0, zIndex: 50 }}
                    transition={{ duration: 0.6, delay: i * 0.05 }}
                    className="polaroid-card group cursor-pointer"
                  >
                    <div className="w-[260px] h-[260px] overflow-hidden mb-4 rounded-sm bg-slate-50">
                      {p.media_type === 'video'
                        ? <video src={getPublicUrl(p.storage_path)} className="w-full h-full object-cover" muted playsInline />
                        : <img src={getPublicUrl(p.storage_path)} className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-500" alt="" />}
                    </div>
                    <div className="w-[260px] text-center px-2">
                      {p.caption && (
                        <p className="text-sm italic mb-2 font-medium text-slate-700 line-clamp-2 leading-relaxed">
                          &quot;{p.caption}&quot;
                        </p>
                      )}
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        BY <span className="text-amber-500">{p.uploader_name}</span>
                      </p>
                    </div>
                    {planTier !== 'WHITE_LABEL' && <Watermark />}
                  </motion.div>
                ))}
              </motion.div>

            ) : viewMode === 'album' ? (
              /* ── ALBUM ── */
              <motion.div 
                key="album"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col gap-20"
              >
                {(() => {
                  const groups: { [k: string]: Photo[] } = {};
                  displayedPhotos.forEach(p => {
                    const label = new Date(p.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
                    groups[label] = groups[label] || [];
                    groups[label].push(p);
                  });
                  return Object.entries(groups).map(([label, gPhotos]) => (
                    <div key={label}>
                      <h3 className="text-xl font-black mb-8 text-slate-400 tracking-widest uppercase flex items-center gap-4">
                        {label}
                        <div className="h-px flex-1 bg-slate-900/5" />
                      </h3>
                      <div className="columns-1 md:columns-2 lg:columns-3 gap-8">
                        {gPhotos.map((p, i) => (
                          <motion.div 
                            key={p.id} 
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                            whileHover={{ y: -5 }}
                            className="photo-card glass-card break-inside-avoid mb-8 rounded-3xl overflow-hidden relative border-none p-0 group"
                          >
                            <img src={getPublicUrl(p.storage_path)} className="w-full block group-hover:scale-105 transition-transform duration-700" alt="" />
                             <div className="album-meta p-4 bg-white/90 backdrop-blur-md">
                              <div className="flex justify-between items-start w-full">
                                <div>
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">by <span className="text-amber-500">{p.uploader_name}</span></p>
                                  {p.caption && <p className="text-xs text-slate-600 italic mt-1">&quot;{p.caption}&quot;</p>}
                                </div>
                                <button 
                                  onClick={(e) => { e.stopPropagation(); downloadPhoto(p); }} 
                                  className="p-2 text-slate-300 hover:text-amber-500 transition-colors bg-slate-50 rounded-lg"
                                >
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                                </button>
                              </div>
                            </div>
                            {planTier !== 'WHITE_LABEL' && <Watermark />}
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  ));
                })()}
              </motion.div>

            ) : (
              /* ── GRID ── */
              <motion.div 
                key="grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="columns-1 md:columns-2 lg:columns-3 gap-8"
              >
                {displayedPhotos.map((p, i) => (
                  <motion.div 
                    key={p.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.05 }}
                    whileHover={{ scale: 1.02 }}
                    className="photo-card glass-card break-inside-avoid mb-8 rounded-3xl overflow-hidden relative border-none p-0 group"
                  >
                    <div className="overflow-hidden">
                      <img
                        src={getPublicUrl(p.storage_path)}
                        className="w-full block transition-transform duration-700 group-hover:scale-110"
                        alt=""
                      />
                    </div>
                    <div className="grid-meta p-4 bg-white/90 backdrop-blur-md">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">BY <span className="text-amber-500">{p.uploader_name}</span></p>
                      {p.caption && <p className="text-xs text-slate-600 italic mt-1 line-clamp-2">&quot;{p.caption}&quot;</p>}
                    </div>
                    {planTier !== 'WHITE_LABEL' && <Watermark />}
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      <Confetti trigger={confettiTrigger} />
    </div>
  );
}