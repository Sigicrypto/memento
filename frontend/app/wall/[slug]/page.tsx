"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

// ── Components ──────────────────────────────────────────────

const FontLoader = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,700;0,900;1,700&display=swap');
    
    :root {
      --bg: #faf9fd;
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
      font-family: 'Inter', system-ui, sans-serif;
      position: relative;
      overflow-x: hidden;
      padding: 80px 64px 140px;
    }
    @media (max-width: 1024px) {
      .wall-page { padding: 40px 20px 100px !important; }
    }

    /* ─── BACKGROUND ELEMENTS ─── */
    .grain {
      position: fixed;
      inset: -50%;
      width: 200%;
      height: 200%;
      pointer-events: none;
      z-index: 5;
      opacity: 0.03;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
      animation: grain 0.5s steps(1) infinite;
    }
    @keyframes grain {
      0% { transform: translate(0, 0); }
      25% { transform: translate(-2%, -3%); }
      50% { transform: translate(3%, 2%); }
      75% { transform: translate(-1%, 4%); }
    }

    .orbs {
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 1;
      overflow: hidden;
    }
    .orb {
      position: absolute;
      border-radius: 50%;
      filter: blur(100px);
      animation: orb-drift 18s ease-in-out infinite;
    }
    .orb1 {
      width: 600px; height: 600px;
      background: radial-gradient(circle, rgba(245, 158, 11, 0.15), transparent 70%);
      top: -15%; left: -10%;
    }
    .orb2 {
      width: 500px; height: 500px;
      background: radial-gradient(circle, rgba(244, 114, 182, 0.12), transparent 70%);
      top: 40%; right: -8%;
      animation-delay: -6s;
    }
    @keyframes orb-drift {
      0%, 100% { transform: translate(0, 0) scale(1); }
      33% { transform: translate(30px, -40px) scale(1.05); }
      66% { transform: translate(-20px, 25px) scale(0.95); }
    }

    .floating-shapes {
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 2;
    }
    .shape {
      position: absolute;
      opacity: 0.1;
      color: var(--amber);
      animation: float-slow 20s ease-in-out infinite alternate;
    }
    @keyframes float-slow {
      0% { transform: translateY(0) rotate(0deg); }
      100% { transform: translateY(-40px) rotate(90deg); }
    }

    /* ─── UI COMPONENTS ─── */
    .glass-card {
      background: var(--surface);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      box-shadow: var(--nm-shadow);
      transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .glass-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 48px rgba(30, 41, 59, 0.08);
    }

    .photo-card {
      animation: fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) both;
    }
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(30px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .slideshow-photo {
      animation: zoomIn 1.2s cubic-bezier(0.16, 1, 0.3, 1) both;
    }
    @keyframes zoomIn {
      from { opacity: 0; transform: scale(0.95); }
      to { opacity: 1; transform: scale(1); }
    }

    .btn-glow {
      background: linear-gradient(135deg, var(--amber), var(--rose));
      color: #fff;
      border: none;
      box-shadow: 0 4px 16px rgba(244, 114, 182, 0.3);
      transition: all 0.25s;
    }
    .btn-glow:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(244, 114, 182, 0.4);
    }

    .btn-outline {
      background: var(--surface);
      backdrop-filter: blur(12px);
      border: 1px solid var(--border);
      color: var(--text1);
      transition: all 0.25s;
    }
    .btn-outline:hover {
      background: rgba(255, 255, 255, 0.65);
      transform: translateY(-2px);
    }

    .polaroid-card {
      background: #ffffff;
      padding: 12px 12px 48px 12px;
      box-shadow: 0 15px 45px rgba(30, 41, 59, 0.12);
      border-radius: 8px;
      transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      position: relative;
    }
    .polaroid-card:hover {
      transform: rotate(0deg) scale(1.05) !important;
      z-index: 20;
      box-shadow: 0 25px 60px rgba(30, 41, 59, 0.2);
    }

    /* ─── LAYOUT STRUCTURE ─── */
    .wall-container {
      display: flex;
      gap: 48px;
      align-items: flex-start;
      position: relative;
      z-index: 10;
    }
    @media (max-width: 1100px) {
      .wall-container { flex-direction: column; gap: 32px; }
    }

    .wall-sidebar {
      width: 320px;
      position: sticky;
      top: 128px;
      display: flex;
      flex-direction: column;
      gap: 24px;
      flex-shrink: 0;
    }
    @media (max-width: 1100px) {
      .wall-sidebar { width: 100%; position: relative; top: 0; }
    }

    .wall-main {
      flex: 1;
      min-width: 0;
    }

    .action-bar {
      display: flex;
      flex-direction: column;
      gap: 24px;
      margin-bottom: 40px;
      /* ── FIX 2: center-align the title section ── */
      align-items: center;
      text-align: center;
    }

    .qr-container {
      text-align: center;
      padding: 32px 24px;
    }
    .qr-box {
      background: white;
      padding: 16px;
      border-radius: 20px;
      display: inline-block;
      box-shadow: 0 8px 32px rgba(0,0,0,0.05);
      margin-bottom: 16px;
    }

    .status-dot {
      animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0%, 100% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.2); opacity: 0.7; }
    }

    /* ─── AESTHETIC HEADING ─── */
    .wall-heading {
      font-family: 'Playfair Display', Georgia, serif;
      font-weight: 900;
      font-size: clamp(2.8rem, 6vw, 5.5rem);
      letter-spacing: -0.03em;
      line-height: 1.05;
      position: relative;
      display: inline-block;
      background: linear-gradient(135deg, #1e293b 0%, #f59e0b 40%, #f472b6 70%, #a78bfa 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      filter: drop-shadow(0 2px 24px rgba(245, 158, 11, 0.18));
    }
    .wall-heading::after {
      content: attr(data-text);
      position: absolute;
      left: 3px;
      top: 3px;
      background: linear-gradient(135deg, rgba(245,158,11,0.15), rgba(244,114,182,0.10));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      pointer-events: none;
      z-index: -1;
    }

    /* ─── GRID META STRIP ─── */
    /* FIX 1: grid meta is always visible, not just on hover */
    .grid-meta {
      padding: 14px 16px 14px;
      background: rgba(255, 255, 255, 0.92);
      backdrop-filter: blur(8px);
      border-top: 1px solid rgba(255, 255, 255, 0.6);
    }
    .grid-meta-name {
      font-size: 13px;
      font-weight: 700;
      color: var(--text1);
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }
    .grid-meta-caption {
      font-size: 12px;
      color: var(--text2);
      font-style: italic;
      line-height: 1.4;
      margin-top: 3px;
    }

    /* ─── NEW PHOTO REVEAL ─── */
    @keyframes reveal-backdrop {
      from { opacity: 0; }
      to   { opacity: 1; }
    }
    @keyframes reveal-image {
      from { opacity: 0; transform: scale(0.88) translateY(30px); filter: blur(12px); }
      to   { opacity: 1; transform: scale(1) translateY(0); filter: blur(0px); }
    }
    @keyframes reveal-badge {
      from { opacity: 0; transform: translateY(-20px) scale(0.85); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }
    @keyframes reveal-meta {
      from { opacity: 0; transform: translateY(24px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes reveal-out {
      from { opacity: 1; }
      to   { opacity: 0; }
    }
    .reveal-backdrop {
      animation: reveal-backdrop 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
    }
    .reveal-backdrop.exiting {
      animation: reveal-out 0.8s cubic-bezier(0.7, 0, 1, 1) both;
    }
    .reveal-img {
      animation: reveal-image 0.9s 0.2s cubic-bezier(0.16, 1, 0.3, 1) both;
    }
    .reveal-badge {
      animation: reveal-badge 0.7s 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
    }
    .reveal-meta {
      animation: reveal-meta 0.7s 0.85s cubic-bezier(0.16, 1, 0.3, 1) both;
    }

    /* ─── FIX 3: QR + URL side-by-side panel in slideshow ─── */
    .slideshow-join-panel {
      position: absolute;
      bottom: 28px;
      right: 28px;
      z-index: 40;
      animation: qr-appear 1s 1.5s cubic-bezier(0.16, 1, 0.3, 1) both;
      display: flex;
      align-items: center;
      gap: 16px;
      background: rgba(255,255,255,0.10);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255,255,255,0.2);
      border-radius: 20px;
      padding: 14px 20px 14px 14px;
      box-shadow: 0 8px 40px rgba(0,0,0,0.35);
    }
    @keyframes qr-appear {
      from { opacity: 0; transform: translateY(12px) scale(0.9); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }
    .slideshow-join-qr {
      flex-shrink: 0;
      background: rgba(255,255,255,0.95);
      padding: 10px;
      border-radius: 12px;
    }
    .slideshow-join-text {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .slideshow-join-label {
      font-size: 10px;
      font-weight: 900;
      color: rgba(255,255,255,0.6);
      letter-spacing: 0.16em;
      text-transform: uppercase;
    }
    .slideshow-join-title {
      font-size: 16px;
      font-weight: 800;
      color: #fff;
      letter-spacing: -0.01em;
      line-height: 1.2;
    }
    .slideshow-join-url {
      font-size: 12px;
      color: rgba(255,255,255,0.75);
      font-weight: 500;
      word-break: break-all;
      margin-top: 2px;
      max-width: 200px;
      line-height: 1.4;
    }

    /* ─── ALBUM META ─── */
    .album-meta {
      padding: 12px 16px;
      background: rgba(255,255,255,0.92);
      backdrop-filter: blur(8px);
      border-top: 1px solid rgba(255,255,255,0.5);
    }
    .album-meta-name {
      font-size: 12px;
      font-weight: 700;
      color: var(--text1);
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }
    .album-meta-caption {
      font-size: 12px;
      color: var(--text2);
      font-style: italic;
      margin-top: 2px;
      line-height: 1.4;
    }
  `}</style>
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
    <div
      className={`reveal-backdrop ${exiting ? 'exiting' : ''}`}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'linear-gradient(135deg, rgba(0,0,0,0.96) 0%, rgba(15,10,30,0.98) 100%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: 32,
      }}
    >
      {/* "NEW MEMORY" badge */}
      <div className="reveal-badge" style={{
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
      }}>
        ✦ New Memory Just Arrived ✦
      </div>

      {/* Photo */}
      <div className="reveal-img" style={{ position: 'relative', maxWidth: 540, width: '100%' }}>
        <div style={{
          position: 'absolute', inset: -40,
          background: 'radial-gradient(ellipse, rgba(245,158,11,0.25) 0%, transparent 70%)',
          borderRadius: '50%', filter: 'blur(20px)',
        }} />
        {photo.media_type === 'video'
          ? <video src={getPublicUrl(photo.storage_path)} style={{ width: '100%', borderRadius: 24, boxShadow: '0 40px 100px rgba(0,0,0,0.8)', display: 'block', objectFit: 'contain', maxHeight: '55vh' }} autoPlay loop muted />
          : <img src={getPublicUrl(photo.storage_path)} style={{ width: '100%', borderRadius: 24, boxShadow: '0 40px 100px rgba(0,0,0,0.8)', display: 'block', objectFit: 'contain', maxHeight: '55vh' }} alt="" />
        }
      </div>

      {/* Meta */}
      <div className="reveal-meta" style={{ marginTop: 32, textAlign: 'center' }}>
        <p style={{ fontSize: 11, fontWeight: 800, color: '#fbbf24', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 6, opacity: 0.85 }}>Shared by</p>
        <h2 style={{ fontSize: 36, fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', fontFamily: "'Playfair Display', serif", marginBottom: photo.caption ? 10 : 0 }}>
          {photo.uploader_name}
        </h2>
        {photo.caption && (
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.8)', fontStyle: 'italic', maxWidth: 420, lineHeight: 1.5 }}>
            "{photo.caption}"
          </p>
        )}
      </div>

      {/* Skip */}
      <button
        onClick={() => { setExiting(true); setTimeout(onDone, 800); }}
        style={{ position: 'absolute', top: 28, right: 28, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '8px 18px', borderRadius: 12, fontSize: 12, fontWeight: 700, cursor: 'pointer', letterSpacing: '0.06em' }}
      >
        SKIP ✕
      </button>

      <style>{`
        @keyframes particle-rise {
          0%   { transform: translateY(0) scale(1); opacity: 0.7; }
          100% { transform: translateY(-120px) scale(0); opacity: 0; }
        }
      `}</style>
    </div>
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
  const [notFound, setNotFound] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('polaroid');
  const [prevViewMode, setPrevViewMode] = useState<ViewMode>('polaroid');
  const [realtimeStatus, setRealtimeStatus] = useState<string>('connecting');
  const [moderationMode, setModerationMode] = useState(false);
  const [confettiTrigger, setConfettiTrigger] = useState(false);
  const [showBestShots, setShowBestShots] = useState(false);
  const [revealPhoto, setRevealPhoto] = useState<Photo | null>(null);
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

      setEventName(data.name);
      setEventId(data.id);
      setPlanTier(data.plan_type || 'STARTER');
      if (data.theme_primary_color && data.theme_secondary_color)
        setTheme({ primary: data.theme_primary_color, secondary: data.theme_secondary_color });
      if (data.expires_at && new Date(data.expires_at) < new Date()) setEventExpired(true);
      if (data.enable_safety_filter) setModerationMode(true);
      if (data.music_track && data.music_track !== 'none') setMusicTrack(data.music_track);

      try {
        const { data: profile } = await supabase.from('profiles').select('plan, role').eq('id', data.owner_id).single();
        if (data.plan_type === 'WHITE_LABEL' || profile?.plan === 'whitelabel') {
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
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'photos', filter: `event_id=eq.${eventId}` },
        (payload) => {
          const newPhoto = payload.new as Photo;
          setPhotos(prev => [newPhoto, ...prev]);
          if (!moderationMode) {
            setConfettiTrigger(true);
            setRevealPhoto(newPhoto);
            setTimeout(() => setConfettiTrigger(false), 3000);
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

  const nextSlide = () => setSlideIndex(i => (i + 1) % photos.length);
  const prevSlide = () => setSlideIndex(i => (i - 1 + photos.length) % photos.length);

  // -- Actions --

  const handleLike = async (photoId: string) => {
    const gid = localStorage.getItem('memento_guest_id') || `guest_${Date.now()}`;
    localStorage.setItem('memento_guest_id', gid);
    setPhotos(prev => prev.map(p => p.id === photoId ? { ...p, reaction_count: (p.reaction_count || 0) + 1 } : p));
    const { error } = await supabase.from('reactions').insert({ photo_id: photoId, guest_id: gid });
    if (error) setPhotos(prev => prev.map(p => p.id === photoId ? { ...p, reaction_count: (p.reaction_count || 0) - 1 } : p));
  };

  const downloadPhoto = async (photo: Photo) => {
    const res = await fetch(getPublicUrl(photo.storage_path));
    const blob = await res.blob();
    saveAs(blob, `memento-${photo.uploader_name}-${photo.id.slice(0, 4)}.jpg`);
  };

  const handleDownloadZip = async () => {
    if (!['STANDARD', 'PREMIUM', 'WHITE_LABEL'].includes(planTier)) {
      alert('✨ Bulk ZIP Download is a Standard feature! Upgrade to unlock.'); return;
    }
    if (!photos.length) return;
    const zip = new JSZip();
    const folder = zip.folder(`${slug}-memento`);
    for (const p of photos) {
      const blob = await (await fetch(getPublicUrl(p.storage_path))).blob();
      folder?.file(`${p.uploader_name}-${p.id.slice(0, 4)}.jpg`, blob);
    }
    saveAs(await zip.generateAsync({ type: 'blob' }), `${slug}-wall.zip`);
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

  const Watermark = () => (
    <div style={{
      position: 'absolute', bottom: 12, right: 12,
      display: 'flex', alignItems: 'center',
      filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.4))',
      opacity: 0.75, pointerEvents: 'none'
    }}>
      <img
        src="/CC logo.png"
        alt="Memento"
        style={{ height: 18, width: 'auto', display: 'block', objectFit: 'contain' }}
      />
    </div>
  );

  // -- Render States --

  if (loading) return (
    <div className="wall-page flex items-center justify-center">
      <FontLoader />
      <div className="text-center relative z-10">
        <div style={{ width: 48, height: 48, border: '4px solid var(--surface)', borderTopColor: 'var(--amber)', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: 16, margin: '0 auto' }} />
        <p style={{ fontSize: 16, fontWeight: 500, color: 'var(--text2)' }}>Entering the Wall…</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );

  if (notFound || eventExpired) return (
    <div className="wall-page flex items-center justify-center p-6 text-center">
      <FontLoader />
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
      <div className="wall-page fixed inset-0 flex flex-col z-[100] h-screen overflow-hidden bg-[#050505]">
      <FontLoader />

        {/* Dynamic Cinematic Background */}
        {current && (
          <div style={{ 
            position: 'absolute', inset: 0, 
            backgroundImage: `url(${getPublicUrl(current.storage_path)})`,
            backgroundSize: 'cover', backgroundPosition: 'center',
            filter: 'blur(60px) brightness(0.3) saturate(1.1)',
            transition: 'background-image 1s cubic-bezier(0.4, 0, 0.2, 1)',
            opacity: 0.6,
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
        <div className="relative z-20" style={{ padding: '24px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(to bottom, rgba(0,0,0,0.4), transparent)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: 10, fontWeight: 900, color: 'var(--amber)', letterSpacing: '0.2em', textTransform: 'uppercase', opacity: 0.8 }}>Live Experience</span>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', textShadow: '0 2px 10px rgba(0,0,0,0.3)', fontFamily: "'Playfair Display', serif" }}>{eventName}</h1>
          </div>
          <button onClick={() => setViewMode(prevViewMode)} className="btn-outline px-8 py-2.5 rounded-full font-bold text-xs bg-white/5 text-white/80 border-white/10 hover:bg-white/10 hover:text-white transition-all backdrop-filter blur-sm">✕ EXIT</button>
        </div>

        {/* Content Area */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-4 md:p-12 overflow-hidden">
          {current && (
            <div className="w-full h-full flex flex-col items-center justify-center max-w-7xl mx-auto" key={current.id}>
              {/* Image Container */}
              <div className="relative flex-1 w-full flex items-center justify-center min-h-0" style={{ perspective: 1000 }}>
                <div style={{ 
                  position: 'relative', height: '100%', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  animation: 'fadeInScale 0.8s cubic-bezier(0.16, 1, 0.3, 1) both'
                }}>
                  {current.media_type === 'video'
                    ? <video src={getPublicUrl(current.storage_path)} style={{ maxHeight: '100%', maxWidth: '100%', borderRadius: 12, boxShadow: '0 40px 100px rgba(0,0,0,0.7)', objectFit: 'contain', border: '1px solid rgba(255,255,255,0.08)' }} autoPlay loop muted />
                    : <img src={getPublicUrl(current.storage_path)} style={{ maxHeight: '100%', maxWidth: '100%', borderRadius: 12, boxShadow: '0 40px 100px rgba(0,0,0,0.7)', objectFit: 'contain', border: '1px solid rgba(255,255,255,0.08)' }} alt="" />}
                  {planTier !== 'WHITE_LABEL' && <Watermark />}
                </div>
              </div>

              {/* Metadata Footer — Reduced footprint to maximize photo size */}
              <div className="mt-4 glass-card" style={{ padding: '16px 36px', minWidth: 280, maxWidth: '85%', flexShrink: 0, background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(32px)', border: '1px solid rgba(255,255,255,0.08)', animation: 'fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both', textAlign: 'center', borderRadius: 28 }}>
                <p style={{ fontSize: 9, fontWeight: 800, color: 'var(--amber)', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 4, opacity: 0.8 }}>Shared by</p>
                <h2 style={{ fontSize: 20, fontWeight: 900, color: '#fff', marginBottom: 4, letterSpacing: '-0.01em', fontFamily: "'Playfair Display', serif" }}>{current.uploader_name}</h2>
                {current.caption && (
                  <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', fontStyle: 'italic', fontWeight: 400, lineHeight: 1.5, maxWidth: 600 }}>"{current.caption}"</p>
                )}
              </div>
            </div>
          )}

          {/* Nav Buttons */}
          <button onClick={prevSlide} className="btn-outline text-white/40 border-white/5 hover:bg-white/10 hover:text-white" style={{ position: 'absolute', left: 32, top: '50%', transform: 'translateY(-50%)', width: 64, height: 64, borderRadius: '50%', fontSize: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(16px)', zIndex: 30, transition: '0.3s' }}>‹</button>
          <button onClick={nextSlide} className="btn-outline text-white/40 border-white/5 hover:bg-white/10 hover:text-white" style={{ position: 'absolute', right: 32, top: '50%', transform: 'translateY(-50%)', width: 64, height: 64, borderRadius: '50%', fontSize: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(16px)', zIndex: 30, transition: '0.3s' }}>›</button>

          {/* Join Panel Refinement — Moved to bottom-left to avoid logo overlap */}
          <div className="slideshow-join-panel" style={{ 
            transform: 'scale(0.75)', transformOrigin: 'bottom left', 
            left: 32, right: 'auto', bottom: 32, 
            opacity: 0.85, background: 'rgba(255,255,255,0.06)', 
            backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.1)' 
          }}>
            <div className="slideshow-join-qr" style={{ background: 'rgba(255,255,255,0.95)', padding: 10, borderRadius: 14 }}>
              <QRCodeSVG value={uploadUrl} size={70} bgColor="#ffffff" fgColor="#000" />
            </div>
            <div className="slideshow-join-text">
              <span className="slideshow-join-label" style={{ color: 'var(--amber)', fontSize: 9 }}>Join & Share</span>
              <span className="slideshow-join-title" style={{ fontSize: 13, fontWeight: 900 }}>Capture the Moment</span>
              <span className="slideshow-join-url" style={{ fontSize: 11, opacity: 0.65 }}>{uploadUrl}</span>
            </div>
          </div>
        </div>
        
        <style>{`
          @keyframes fadeInScale {
            from { opacity: 0; transform: scale(0.96) translateY(10px); }
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

      {musicTrack && isAudioPlaying && <audio ref={audioRef} autoPlay loop src={`/music/${musicTrack}.mp3`} />}

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
            <p style={{ fontSize: 11, color: 'var(--text2)', wordBreak: 'break-all', marginTop: 16, opacity: 0.6 }}>{uploadUrl}</p>
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

          <button onClick={handleDownloadZip} className="btn-glow w-full py-4 rounded-2xl font-bold tracking-wider text-sm flex items-center justify-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
            DOWNLOAD ZIP
          </button>
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
          {displayedPhotos.length === 0 ? (
            <div className="glass-card" style={{ padding: 100, textAlign: 'center' }}>
              <div style={{ fontSize: 100, marginBottom: 32, opacity: 0.8 }}>✨</div>
              <h2 style={{ fontSize: 36, fontWeight: 800, marginBottom: 16, color: 'var(--text1)' }}>Your Wall Awaits</h2>
              <p style={{ color: 'var(--text2)', marginBottom: 40, fontSize: 18, maxWidth: 500, margin: '0 auto 40px' }}>Waiting for the first magical moment to be shared. The memories you capture here will last a lifetime.</p>
            </div>

          ) : viewMode === 'polaroid' ? (
            /* ── POLAROID ── */
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 40, justifyContent: 'center' }}>
              {displayedPhotos.map((p, i) => (
                <div key={p.id} className="polaroid-card" style={{ transform: `rotate(${(i % 6 - 3) * 2}deg)` }}>
                  <div style={{ width: 260, height: 260, overflow: 'hidden', marginBottom: 12 }}>
                    {p.media_type === 'video'
                      ? <video src={getPublicUrl(p.storage_path)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted playsInline />
                      : <img src={getPublicUrl(p.storage_path)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />}
                  </div>
                  {/* FIX 1: Always-visible name + caption */}
                  <div style={{ color: '#333', textAlign: 'center', width: 260, padding: '0 4px' }}>
                    {p.caption && (
                      <p style={{ fontSize: 13, fontStyle: 'italic', marginBottom: 6, fontWeight: 500, color: '#444', lineHeight: 1.4 }}>
                        "{p.caption}"
                      </p>
                    )}
                    <p style={{ fontSize: 11, fontWeight: 800, color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      BY {p.uploader_name}
                    </p>
                  </div>
                  {planTier !== 'WHITE_LABEL' && <Watermark />}
                </div>
              ))}
            </div>

          ) : viewMode === 'album' ? (
            /* ── ALBUM ── */
            <div style={{ display: 'flex', flexDirection: 'column', gap: 80 }}>
              {(() => {
                const groups: { [k: string]: Photo[] } = {};
                displayedPhotos.forEach(p => {
                  const label = new Date(p.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
                  groups[label] = groups[label] || [];
                  groups[label].push(p);
                });
                return Object.entries(groups).map(([label, gPhotos]) => (
                  <div key={label}>
                    <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 32, color: 'var(--text2)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{label}</h3>
                    <div style={{ columns: '3 300px', gap: 32 }}>
                      {gPhotos.map(p => (
                        <div key={p.id} className="photo-card glass-card" style={{ breakInside: 'avoid', marginBottom: 32, borderRadius: 24, overflow: 'hidden', position: 'relative', border: 'none', padding: 0 }}>
                          <img src={getPublicUrl(p.storage_path)} style={{ width: '100%', display: 'block' }} alt="" />
                          {/* FIX 1: Always-visible name + caption in album */}
                          <div className="album-meta">
                            <p className="album-meta-name">by {p.uploader_name}</p>
                            {p.caption && <p className="album-meta-caption">"{p.caption}"</p>}
                          </div>
                          {planTier !== 'WHITE_LABEL' && <Watermark />}
                        </div>
                      ))}
                    </div>
                  </div>
                ));
              })()}
            </div>

          ) : (
            /* ── GRID ── FIX 1: name + caption always visible below image (not overlay) */
            <div style={{ columns: '3 300px', gap: 32 }}>
              {displayedPhotos.map(p => (
                <div key={p.id} className="photo-card glass-card" style={{ breakInside: 'avoid', marginBottom: 32, borderRadius: 24, overflow: 'hidden', position: 'relative', border: 'none', padding: 0 }}>
                  <div style={{ overflow: 'hidden' }}>
                    <img
                      src={getPublicUrl(p.storage_path)}
                      style={{ width: '100%', display: 'block', transition: 'transform 0.5s' }}
                      className="wall-img"
                      alt=""
                    />
                  </div>
                  {/* Always-visible meta strip below the image */}
                  <div className="grid-meta">
                    <p className="grid-meta-name">{p.uploader_name}</p>
                    {p.caption && <p className="grid-meta-caption">"{p.caption}"</p>}
                  </div>
                  {planTier !== 'WHITE_LABEL' && <Watermark />}
                  <style>{`
                    .photo-card:hover .wall-img { transform: scale(1.04); }
                  `}</style>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      <Confetti trigger={confettiTrigger} />
    </div>
  );
}