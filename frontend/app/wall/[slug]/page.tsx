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
      --bg: #0a0a0e;
      --surface: rgba(13, 17, 23, 0.45);
      --border: rgba(255, 255, 255, 0.08);
      --amber: #fbbf24;
      --rose: #f472b6;
      --gold: #fcd34d;
      --text1: #ffffff;
      --text2: #94a3b8;
      --radius: 20px;
      --nm-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
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
      font-size: clamp(2.5rem, 6vw, 4.5rem);
      letter-spacing: -0.04em;
      line-height: 1.1;
      color: #ffffff;
      text-shadow: 0 10px 30px rgba(255, 255, 255, 0.1);
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
    <div className="aurora-bg absolute inset-0" />
    <div className="grain fixed inset-0 opacity-[0.03]" />
    <div className="orbs fixed inset-0">
      <div className="orb orb1" />
      <div className="orb orb2" />
      <div className="orb orb3" />
    </div>
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
        filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.5))',
        opacity: 0.8, pointerEvents: 'none'
      }}>
        <img
          src="/CC logo.png"
          alt="Memento"
          style={{ height: 16, width: 'auto', display: 'block', objectFit: 'contain' }}
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
    <div className="wall-page min-h-screen relative">
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

      {/* ── Header ── */}
      <header className="fixed top-0 left-0 right-0 z-[100] px-6 py-4 md:px-12 md:py-6 flex items-center justify-between border-b border-white/[0.05] bg-black/40 backdrop-blur-xl">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <img src="/CC logo.png" alt="Memento" className="h-8 md:h-10 w-auto" />
        </Link>
        <div className="flex items-center gap-4">
          <StatusBadge />
          {isAdmin && (
            <Link href="/admin" className="btn-outline hidden md:flex text-[10px] tracking-widest font-black uppercase py-2">
              Dashboard
            </Link>
          )}
        </div>
      </header>

      <main className="relative z-10 pt-32 pb-40 px-6 md:px-12 max-w-[1700px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 mb-20">
          <div className="flex-1">
            <h1 className="wall-heading mb-6 drop-shadow-[0_10px_30px_rgba(255,255,255,0.1)]">{eventName}</h1>
            <div className="flex flex-wrap items-center gap-4">
              <Link href={uploadUrl} target="_blank" className="btn-glow text-sm px-8 py-3.5">
                Join Memory Wall ✦
              </Link>
              <button onClick={handleSelfieSearch} className="btn-outline text-sm px-8 py-3.5 font-black uppercase tracking-widest bg-white/5">
                Find My Photos 👤
              </button>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 md:justify-end">
            <div className="bg-white/5 border border-white/10 p-1.5 rounded-2xl flex items-center gap-1 backdrop-blur-2xl">
              {(['grid', 'polaroid', 'album'] as ViewMode[]).map(m => (
                <button
                  key={m}
                  onClick={() => setViewMode(m)}
                  className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === m ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                >
                  {m}
                </button>
              ))}
            </div>
            
            <button
              onClick={() => { setPrevViewMode(viewMode); setViewMode('slideshow'); }}
              className="bg-white/5 border border-white/10 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-300 hover:text-white hover:bg-white/10 transition-all backdrop-blur-2xl flex items-center gap-2"
            >
              <span className="text-lg">📽️</span> Slideshow
            </button>
            
            {isAdmin && (
              <Link
                href={`/moderate/${slug}`}
                className="bg-amber-500/10 border border-amber-500/20 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-amber-500 hover:bg-amber-500/20 transition-all backdrop-blur-2xl flex items-center gap-2"
              >
                <span className="text-lg">🛡️</span> Moderate
              </Link>
            )}
          </div>
        </div>

        {/* Search Feedback / Best Shots Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-6 mb-12">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowBestShots(!showBestShots)}
              className={`px-6 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 border ${showBestShots ? 'bg-amber-500 text-black border-amber-600 shadow-lg shadow-amber-500/20' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'}`}
            >
              {showBestShots ? '🌟 Best Shots Filter Active' : '🏆 Filter Best Shots'}
            </button>
          </div>
          
          {matchedPhotoIds && (
            <div className="flex items-center gap-4 animate-fadeIn">
              <span className="text-xs font-bold text-amber-500 uppercase tracking-widest px-5 py-2.5 rounded-full bg-amber-500/10 border border-amber-500/20 backdrop-blur-md">✨ Found {matchedPhotoIds.length} Photos for You</span>
              <button 
                onClick={() => setMatchedPhotoIds(null)}
                className="text-[10px] font-black uppercase text-slate-500 hover:text-white transition-colors"
              >
                Show All ×
              </button>
              <button 
                onClick={handleDownloadZip}
                className="btn-glow text-[10px] px-6 py-2.5 shadow-amber-500/20"
              >
                Download My Collection 📥
              </button>
            </div>
          )}
        </div>

        {/* ── VIEWS ── */}
        <AnimatePresence mode="wait">
          {displayedPhotos.length === 0 ? (
            <motion.div 
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="gcard cinematic-glow p-24 text-center"
            >
              <div className="gcard-border" />
              <div className="gcard-inner">
                <div className="text-8xl mb-8 opacity-40">✨</div>
                <h2 className="text-3xl font-black mb-4 text-white">Your Wall Awaits</h2>
                <p className="text-slate-400 mb-0 max-w-lg mx-auto leading-relaxed">Waiting for the first magical moment to be shared. The memories you capture here will last a lifetime.</p>
              </div>
            </motion.div>

          ) : viewMode === 'polaroid' ? (
            /* ── POLAROID ── */
            <motion.div 
              key="polaroid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-wrap gap-12 justify-center"
            >
              {displayedPhotos.map((p, i) => (
                <motion.div 
                  key={p.id} 
                  initial={{ opacity: 0, y: 40, rotate: (i % 6 - 3) * 5 }}
                  animate={{ opacity: 1, y: 0, rotate: (i % 6 - 3) * 2 }}
                  whileHover={{ scale: 1.05, rotate: 0, zIndex: 50 }}
                  transition={{ duration: 0.6, delay: (i % 20) * 0.05 }}
                  className="bg-white p-3 pb-16 shadow-2xl relative cursor-pointer"
                  style={{ borderRadius: '2px' }}
                >
                  <div className="w-[280px] h-[280px] overflow-hidden bg-slate-900 border border-black/5">
                    {p.media_type === 'video'
                      ? <video src={getPublicUrl(p.storage_path)} className="w-full h-full object-cover" muted playsInline />
                      : <img src={getPublicUrl(p.storage_path)} className="w-full h-full object-cover" alt="" loading="lazy" />}
                  </div>
                  <div className="absolute inset-x-0 bottom-0 p-4 text-center">
                    {p.caption && (
                      <p className="text-black text-sm font-medium italic truncate mb-1 px-4">&quot;{p.caption}&quot;</p>
                    )}
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Shared by <span className="text-amber-600">{p.uploader_name}</span>
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
              className="space-y-24"
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
                    <div className="flex items-center gap-6 mb-10">
                      <h3 className="text-lg font-black text-slate-500 tracking-[0.2em] uppercase whitespace-nowrap">
                        {label}
                      </h3>
                      <div className="h-px w-full bg-white/10" />
                    </div>
                    <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-8">
                      {gPhotos.map((p, i) => (
                        <motion.div 
                          key={p.id} 
                          initial={{ opacity: 0, scale: 0.95 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.5, delay: (i % 10) * 0.1 }}
                          className="gcard p-0 cinematic-glow break-inside-avoid mb-8 overflow-hidden group border-none shadow-none"
                        >
                          <div className="gcard-border" />
                          <div className="relative z-10 w-full h-full">
                            <img src={getPublicUrl(p.storage_path)} className="w-full h-auto block group-hover:scale-105 transition-transform duration-700" alt="" />
                            <div className="absolute inset-x-0 bottom-0 p-4 bg-black/60 backdrop-blur-md border-t border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Shared by <span className="text-amber-500">{p.uploader_name}</span></p>
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
              className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 2xl:columns-5 gap-8"
            >
              {displayedPhotos.map((p, i) => (
                <motion.div 
                  key={p.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: (i % 20) * 0.05 }}
                  className="gcard p-0 cinematic-glow break-inside-avoid mb-8 overflow-hidden group relative border-none shadow-none"
                >
                  <div className="gcard-border" />
                  <div className="relative z-10 w-full h-full">
                    <img
                      src={getPublicUrl(p.storage_path)}
                      className="w-full block transition-transform duration-700 group-hover:scale-110"
                      alt=""
                      loading="lazy"
                    />
                    <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Shared by <span className="text-amber-500">{p.uploader_name}</span></p>
                    </div>
                  </div>
                  {planTier !== 'WHITE_LABEL' && <Watermark />}
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Confetti trigger={confettiTrigger} />
      
      {showSelfieCam && (
        <div className="fixed inset-0 z-[1000] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-6">
          <div className="gcard cinematic-glow max-w-xl w-full p-8 text-center">
            <div className="gcard-border" />
            <div className="gcard-inner">
              <h2 className="text-2xl font-black mb-2">Find My Photos</h2>
              <p className="text-slate-400 text-sm mb-8">Smile! Our AI will find every photo you're in.</p>
              
              <div className="aspect-square w-full max-w-[400px] mx-auto overflow-hidden rounded-full border-4 border-amber-500/30 mb-8 relative">
                 <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 border-8 border-transparent border-t-amber-500/50 animate-spin" style={{ animationDuration: '3s' }} />
              </div>
              
              <div className="flex gap-4">
                <button 
                  onClick={() => setShowSelfieCam(false)}
                  className="flex-1 py-4 text-xs font-black uppercase tracking-widest text-slate-500 bg-white/5 rounded-2xl hover:bg-white/10 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={captureSelfieAndSearch}
                  disabled={isSearching}
                  className="flex-1 py-4 text-xs font-black uppercase tracking-widest bg-amber-500 text-black rounded-2xl shadow-lg shadow-amber-500/20 hover:scale-105 transition-all disabled:opacity-50"
                >
                  {isSearching ? 'Searching...' : 'Scan My Face ✦'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}