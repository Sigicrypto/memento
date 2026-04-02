"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

// ── Components ──────────────────────────────────────────────

/**
 * Dreamy Typography & Global Styles
 */
/**
 * Dreamy Typography & Global Styles matching Landing Page
 */
const FontLoader = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@300;400;500;600;700&display=swap');
    
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
  `}</style>
);



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

const BackgroundDecoration = () => (
  <>
    <div className="grain" />
    <div className="orbs">
      <div className="orb orb1" />
      <div className="orb orb2" />
    </div>
    <div className="floating-shapes">
      <div className="shape" style={{ top: '15%', left: '10%', fontSize: '2rem' }}>✦</div>
      <div className="shape" style={{ top: '45%', right: '15%', fontSize: '1.5rem', animationDelay: '-5s' }}>✧</div>
      <div className="shape" style={{ bottom: '20%', left: '15%', fontSize: '2.5rem', animationDelay: '-10s' }}>✻</div>
      <div className="shape" style={{ top: '75%', right: '25%', fontSize: '1.2rem', animationDelay: '-15s' }}>✦</div>
    </div>
  </>
);

const SkeletonCard = ({ h = 220 }: { h?: number }) => (
  <div className="glass-card animate-pulse" style={{ height: h, background: 'rgba(255,255,255,0.1)' }} />
);

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
  const [showQR, setShowQR] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('polaroid');
  const [prevViewMode, setPrevViewMode] = useState<ViewMode>('polaroid');
  const [realtimeStatus, setRealtimeStatus] = useState<string>('connecting');
  const [moderationMode, setModerationMode] = useState(false);
  const [confettiTrigger, setConfettiTrigger] = useState(false);
  const [showBestShots, setShowBestShots] = useState(false);
  const [newPhotoId, setNewPhotoId] = useState<string | null>(null);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [musicTrack, setMusicTrack] = useState<string | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [slideIndex, setSlideIndex] = useState(0);

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

      // Fetch branding
      try {
        const { data: profile } = await supabase.from('profiles').select('plan, role').eq('id', data.owner_id).single();
        if (data.plan_type === 'WHITE_LABEL' || profile?.plan === 'whitelabel') {
           // Branding usually comes from user metadata, but profiles can store logoUrl now if synced
           setBrand({ logoUrl: null, colors: null });
        }
      } catch {}
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
            setNewPhotoId(newPhoto.id);
            setConfettiTrigger(true);
            setTimeout(() => setConfettiTrigger(false), 100);
          }
        }
      )
      .subscribe((status) => {
        setRealtimeStatus(status);
        if (status !== 'SUBSCRIBED') startPolling();
      });

    return () => { supabase.removeChannel(channel); };
  }, [eventId, moderationMode, startPolling]);

  // Slideshow
  useEffect(() => {
    if (viewMode === 'slideshow' && photos.length > 0) {
      const timer = setInterval(() => setSlideIndex(i => (i + 1) % photos.length), 5000);
      return () => clearInterval(timer);
    }
  }, [viewMode, photos.length]);

  // Handle ESC key to exit slideshow
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
    if (!['STANDARD','PREMIUM','WHITE_LABEL'].includes(planTier)) {
      alert('✨ Bulk ZIP Download is a Standard feature! Upgrade to unlock.'); return;
    }
    if (!photos.length) return;
    const zip = new JSZip();
    const folder = zip.folder(`${slug}-memento`);
    for (const p of photos) {
      const blob = await (await fetch(getPublicUrl(p.storage_path))).blob();
      folder?.file(`${p.uploader_name}-${p.id.slice(0,4)}.jpg`, blob);
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
      <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:12, background:'var(--surface)', padding:'6px 14px', borderRadius:100, border:'1px solid var(--border)', boxShadow:'0 2px 8px rgba(30,41,59,0.05)', fontWeight:600 }}>
        <div className="status-dot" style={{ width:8, height:8, borderRadius:'50%', background: isLive ? '#4ade80' : 'var(--amber)' }} />
        <span style={{ color: isLive ? '#166534' : '#92400e' }}>{isLive ? 'LIVE' : 'POLLING'}</span>
      </div>
    );
  };

  const Watermark = () => (
    <div style={{ position:'absolute', bottom:12, right:12, background:'rgba(255,255,255,0.8)', backdropFilter:'blur(8px)', padding:'4px 10px', borderRadius:8, fontSize:10, fontWeight:800, color:'var(--text1)', textTransform:'uppercase', letterSpacing:'0.15em', border:'1px solid var(--border)', boxShadow:'0 4px 12px rgba(0,0,0,0.1)' }}>
      Memento
    </div>
  );

  // -- Render States --

  if (loading) return (
    <div className="wall-page flex items-center justify-center">
      <FontLoader />
      <BackgroundDecoration />
      <div className="text-center relative z-10">
        <div style={{ width:48, height:48, border:'4px solid var(--surface)', borderTopColor:'var(--amber)', borderRadius:'50%', animation:'spin 1s linear infinite', marginBottom:16, margin:'0 auto' }} />
        <p style={{ fontSize:16, fontWeight:500, color:'var(--text2)' }}>Entering the Wall…</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );

  if (notFound || eventExpired) return (
    <div className="wall-page flex items-center justify-center p-6 text-center">
      <FontLoader />
      <BackgroundDecoration />
      <div className="glass-card p-12 max-w-md relative z-10">
        <div style={{ fontSize:64, marginBottom:20 }}>{notFound ? '✨' : '📅'}</div>
        <h1 style={{ fontSize:32, fontWeight:700, marginBottom:16, color:'var(--text1)' }}>{notFound ? 'Wall Not Found' : 'Event Concluded'}</h1>
        <p style={{ color:'var(--text2)', marginBottom:32, fontSize:16 }}>{notFound ? "This memory lane hasn't been created yet." : "The photo wall for this event has reached its destination."}</p>
        <Link href="/" className="btn-glow inline-block px-10 py-4 rounded-2xl font-bold uppercase tracking-wider text-sm">Go Home</Link>
      </div>
    </div>
  );

  if (viewMode === 'slideshow') {
    const current = displayedPhotos[slideIndex];
    return (
      <div className="wall-page fixed inset-0 flex flex-col z-50">
        <FontLoader />
        <BackgroundDecoration />
        <div className="relative z-10" style={{ padding:'24px 40px', display:'flex', justifyContent:'space-between', alignItems:'center', background:'rgba(255,255,255,0.4)', backdropFilter:'blur(12px)', borderBottom:'1px solid var(--border)' }}>
          <h1 style={{ fontSize:28, fontWeight:800, color:'var(--text1)', letterSpacing:'-0.03em' }}>{eventName}</h1>
          <button onClick={() => setViewMode('polaroid')} className="btn-outline px-6 py-2 rounded-xl font-bold text-sm">✕ EXIT</button>
        </div>
        <div className="relative z-10" style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:40 }}>
          {current && (
            <div className="slideshow-photo" key={current.id} style={{ height:'85%', width:'100%', display:'flex', alignItems:'center', justifyContent:'center' }}>
              {current.media_type === 'video' 
                ? <video src={getPublicUrl(current.storage_path)} style={{ maxHeight:'100%', maxWidth:'100%', borderRadius:32, boxShadow:'0 40px 100px rgba(0,0,0,0.15)', objectFit:'contain' }} autoPlay loop muted />
                : <img src={getPublicUrl(current.storage_path)} style={{ maxHeight:'100%', maxWidth:'100%', borderRadius:32, boxShadow:'0 40px 100px rgba(30,41,59,0.15)', objectFit:'contain' }} alt="" />}
              {planTier !== 'WHITE_LABEL' && <Watermark />}
            </div>
          )}
          <button onClick={prevSlide} className="btn-outline" style={{ position:'absolute', left:40, width:64, height:64, borderRadius:'50%', fontSize:32, display:'flex', alignItems:'center', justifyContent:'center' }}>‹</button>
          <button onClick={nextSlide} className="btn-outline" style={{ position:'absolute', right:40, width:64, height:64, borderRadius:'50%', fontSize:32, display:'flex', alignItems:'center', justifyContent:'center' }}>›</button>
        </div>
      </div>
    );
  }

  return (
    <div className="wall-page">
      <FontLoader />
      <BackgroundDecoration />
      
      {musicTrack && isAudioPlaying && <audio ref={audioRef} autoPlay loop src={`/music/${musicTrack}.mp3`} />}
      
      <div className="wall-container" style={{ maxWidth:1440, margin:'0 auto' }}>
        {/* SIDEBAR */}
        <aside className="wall-sidebar">
          <div className="glass-card qr-container">
            <h3 style={{ fontSize:18, fontWeight:800, marginBottom:8, color:'var(--text1)' }}>Join the Wall</h3>
            <p style={{ fontSize:13, color:'var(--text2)', marginBottom:24 }}>Scan to share your memories</p>
            <div className="qr-box">
              <QRCodeSVG value={uploadUrl} size={200} />
            </div>
            <p style={{ fontSize:11, color:'var(--text2)', wordBreak:'break-all', marginTop:16, opacity:0.6 }}>{uploadUrl}</p>
          </div>

          <div className="glass-card" style={{ padding:24, display:'flex', flexDirection:'column', gap:16 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span style={{ fontSize:14, fontWeight:700, color:'var(--text2)' }}>STATUS</span>
              <StatusBadge />
            </div>
            <div style={{ height:1, background:'var(--border)', opacity:0.3 }} />
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span style={{ fontSize:14, fontWeight:700, color:'var(--text2)' }}>PHOTOS</span>
              <span style={{ fontSize:16, fontWeight:800, color:'var(--text1)' }}>{displayedPhotos.length}</span>
            </div>
          </div>

          <button onClick={handleDownloadZip} className="btn-glow w-full py-4 rounded-2xl font-bold tracking-wider text-sm flex items-center justify-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            DOWNLOAD ZIP
          </button>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="wall-main">
          <header className="action-bar">
            <h1 style={{ fontSize:'clamp(2.5rem, 5vw, 4.5rem)', fontWeight:900, color:'var(--text1)', letterSpacing:'-0.04em', lineHeight:1.1 }}>{eventName}</h1>
            
            <div style={{ display:'flex', flexWrap:'wrap', gap:12, alignItems:'center' }}>
              <div style={{ background:'rgba(255,255,255,0.5)', padding:6, borderRadius:18, display:'flex', gap:6, border:'1px solid var(--border)', backdropFilter:'blur(12px)' }}>
                {(['polaroid','grid','album','slideshow'] as ViewMode[]).map(m => (
                  <button key={m} onClick={() => {
                    if (m === 'slideshow') setPrevViewMode(viewMode);
                    setViewMode(m);
                  }} style={{
                    padding:'10px 18px', borderRadius:12, border:'none', fontSize:12, fontWeight:800, transition:'0.3s',
                    background: viewMode === m ? 'linear-gradient(135deg, var(--amber), var(--rose))' : 'transparent',
                    color: viewMode === m ? '#fff' : 'var(--text2)',
                    boxShadow: viewMode === m ? '0 4px 12px rgba(244,114,182,0.3)' : 'none',
                    letterSpacing:'0.03em'
                  }}>{m.toUpperCase()}</button>
                ))}
              </div>
            </div>
          </header>

          {/* View Transitions */}
          {displayedPhotos.length === 0 ? (
            <div className="glass-card" style={{ padding:100, textAlign:'center' }}>
              <div style={{ fontSize:100, marginBottom:32, opacity:0.8 }}>✨</div>
              <h2 style={{ fontSize:36, fontWeight:800, marginBottom:16, color:'var(--text1)' }}>Your Wall Awaits</h2>
              <p style={{ color:'var(--text2)', marginBottom:40, fontSize:18, maxWidth:500, margin:'0 auto 40px' }}>Waiting for the first magical moment to be shared. The memories you capture here will last a lifetime.</p>
            </div>
          ) : viewMode === 'polaroid' ? (
            <div style={{ display:'flex', flexWrap:'wrap', gap:40, justifyContent:'center' }}>
              {displayedPhotos.map((p, i) => (
                <div key={p.id} className="polaroid-card" style={{ transform:`rotate(${(i % 6 - 3) * 2}deg)` }}>
                  <div style={{ width:260, height:260, overflow:'hidden', marginBottom:12 }}>
                    {p.media_type === 'video'
                      ? <video src={getPublicUrl(p.storage_path)} style={{ width:'100%', height:'100%', objectFit:'cover' }} muted playsInline />
                      : <img src={getPublicUrl(p.storage_path)} style={{ width:'100%', height:'100%', objectFit:'cover' }} alt="" />}
                  </div>
                  <div style={{ color:'#333', textAlign:'center', width:260 }}>
                    {p.caption && <p style={{ fontSize:13, fontStyle:'italic', marginBottom:4, fontWeight:500 }}>"{p.caption}"</p>}
                    <p style={{ fontSize:11, fontWeight:700, color:'#666', textTransform:'uppercase', letterSpacing:'0.05em' }}>BY {p.uploader_name}</p>
                  </div>
                  {planTier !== 'WHITE_LABEL' && <Watermark />}
                </div>
              ))}
            </div>
          ) : viewMode === 'album' ? (
             <div style={{ display:'flex', flexDirection:'column', gap:80 }}>
               {(() => {
                 const groups: { [k: string]: Photo[] } = {};
                 displayedPhotos.forEach(p => {
                   const label = new Date(p.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
                   groups[label] = groups[label] || [];
                   groups[label].push(p);
                 });
                 return Object.entries(groups).map(([label, gPhotos]) => (
                   <div key={label}>
                     <h3 style={{ fontSize:20, fontWeight:800, marginBottom:32, color:'var(--text2)', letterSpacing:'0.1em', textTransform:'uppercase' }}>{label}</h3>
                     <div style={{ columns:'3 300px', gap:32 }}>
                       {gPhotos.map(p => (
                         <div key={p.id} className="photo-card glass-card" style={{ breakInside:'avoid', marginBottom:32, borderRadius:24, overflow:'hidden', position:'relative', border:'none', padding:0 }}>
                           <img src={getPublicUrl(p.storage_path)} style={{ width:'100%', display:'block' }} alt="" />
                           {planTier !== 'WHITE_LABEL' && <Watermark />}
                         </div>
                       ))}
                     </div>
                   </div>
                 ));
               })()}
             </div>
          ) : (
            <div style={{ columns:'3 300px', gap:32 }}>
              {displayedPhotos.map(p => (
                <div key={p.id} className="photo-card glass-card" style={{ breakInside:'avoid', marginBottom:32, borderRadius:24, overflow:'hidden', position:'relative', border:'none', padding:0 }}>
                  <img src={getPublicUrl(p.storage_path)} style={{ width:'100%', display:'block', transition:'0.5s' }} className="wall-img" alt="" />
                  <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(0,0,0,0.6), transparent)', display:'flex', flexDirection:'column', justifyContent:'flex-end', padding:24, opacity:0, transition:'0.3s' }} className="hover-info">
                     <p style={{ fontSize:14, fontWeight:700, color:'#fff' }}>{p.uploader_name}</p>
                     {p.caption && <p style={{ fontSize:12, color:'rgba(255,255,255,0.8)', marginTop:4 }}>{p.caption}</p>}
                  </div>
                  {planTier !== 'WHITE_LABEL' && <Watermark />}
                  <style>{`
                    .photo-card:hover .hover-info { opacity: 1; }
                    .photo-card:hover .wall-img { transform: scale(1.05); }
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