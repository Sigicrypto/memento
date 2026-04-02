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
const FontLoader = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,400&family=DM+Sans:wght@300;400;500;700&display=swap');
    
    :root {
      --font-display: 'Cormorant Garamond', serif;
      --font-sans: 'DM Sans', sans-serif;
      --surface: #0a0c10;
      --card: rgba(255, 255, 255, 0.03);
      --border: rgba(255, 255, 255, 0.08);
      --text1: #ffffff;
      --text2: rgba(255, 255, 255, 0.6);
    }

    .wall-page {
      min-height: 100vh;
      background: radial-gradient(circle at 0% 0%, #1a1c2e 0%, #0a0c10 50%);
      color: var(--text1);
      font-family: var(--font-sans);
      overflow-x: hidden;
    }

    .glass-card {
      background: var(--card);
      backdrop-filter: blur(12px);
      border: 1px solid var(--border);
      border-radius: 24px;
      transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .photo-card {
      animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
    }

    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .status-dot {
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0% { transform: scale(0.95); opacity: 0.5; }
      50% { transform: scale(1.05); opacity: 1; }
      100% { transform: scale(0.95); opacity: 0.5; }
    }

    .shimmer-box {
      background: linear-gradient(90deg, rgba(255,255,255,0.02) 25%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.02) 75%);
      background-size: 200% 100%;
      animation: shimmer 2s infinite linear;
    }

    @keyframes shimmer {
      from { background-position: 200% 0; }
      to { background-position: -200% 0; }
    }

    /* Polaroids */
    .polaroid-card {
      background: #ffffff;
      padding: 12px 12px 48px 12px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
      border-radius: 4px;
      transition: transform 0.3s ease;
    }
    .polaroid-card:hover {
      transform: rotate(0deg) scale(1.02) !important;
      z-index: 10;
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

const SkeletonCard = ({ h = 220 }: { h?: number }) => (
  <div className="shimmer-box" style={{ height: h, borderRadius: 18 }} />
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
      <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:11, background:'rgba(255,255,255,0.05)', padding:'4px 10px', borderRadius:20, border:'1px solid rgba(255,255,255,0.1)' }}>
        <div className="status-dot" style={{ width:6, height:6, borderRadius:'50%', background: isLive ? '#4ade80' : '#fbbf24' }} />
        <span style={{ color: isLive ? '#4ade80' : '#fbbf24', fontWeight:500 }}>{isLive ? 'Live' : 'Polling'}</span>
      </div>
    );
  };

  const Watermark = () => (
    <div style={{ position:'absolute', bottom:10, right:10, background:'rgba(0,0,0,0.4)', backdropFilter:'blur(4px)', padding:'3px 8px', borderRadius:6, fontSize:9, fontWeight:700, color:'rgba(255,255,255,0.6)', textTransform:'uppercase', letterSpacing:'0.15em', border:'1px solid rgba(255,255,255,0.1)' }}>
      Memento
    </div>
  );

  // -- Render States --

  if (loading) return (
    <div className="wall-page flex items-center justify-center">
      <FontLoader />
      <div className="text-center">
        <div style={{ width:48, height:48, border:'3px solid rgba(255,255,255,0.1)', borderTopColor:themeP, borderRadius:'50%', animation:'spin 1s linear infinite', marginBottom:16 }} />
        <p style={{ fontSize:14, opacity:0.6 }}>Entering the Wall…</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );

  if (notFound || eventExpired) return (
    <div className="wall-page flex items-center justify-center p-6 text-center">
      <FontLoader />
      <div className="glass-card p-12 max-w-md">
        <div style={{ fontSize:48, marginBottom:20 }}>{notFound ? '😢' : '🕒'}</div>
        <h1 style={{ fontFamily:'var(--font-display)', fontSize:32, marginBottom:12 }}>{notFound ? 'Wall Not Found' : 'Event Expired'}</h1>
        <p style={{ opacity:0.6, marginBottom:32 }}>{notFound ? "This event doesn't exist or has been removed." : "The photo wall for this event is no longer available."}</p>
        <Link href="/" style={{ background:themeP, color:'#000', padding:'12px 32px', borderRadius:12, fontWeight:700, textDecoration:'none' }}>Go Home</Link>
      </div>
    </div>
  );

  if (viewMode === 'slideshow') {
    const current = displayedPhotos[slideIndex];
    return (
      <div className="wall-page fixed inset-0 flex flex-col z-50">
        <FontLoader />
        <div style={{ padding:'16px 24px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <h1 style={{ fontFamily:'var(--font-display)', fontSize:24 }}>{eventName}</h1>
          <button onClick={() => setViewMode('polaroid')} style={{ background:'rgba(255,255,255,0.1)', border:'none', color:'#fff', padding:'8px 16px', borderRadius:10 }}>✕ Exit</button>
        </div>
        <div style={{ flex:1, position:'relative', display:'flex', alignItems:'center', justifyContent:'center', padding:40 }}>
          {current && (
            <div className="photo-card" key={current.id} style={{ height:'100%', width:'100%', display:'flex', alignItems:'center', justifyContent:'center' }}>
              {current.media_type === 'video' 
                ? <video src={getPublicUrl(current.storage_path)} style={{ maxHeight:'100%', maxWidth:'100%', borderRadius:20 }} autoPlay loop muted />
                : <img src={getPublicUrl(current.storage_path)} style={{ maxHeight:'100%', maxWidth:'100%', borderRadius:20, boxShadow:'0 20px 80px rgba(0,0,0,0.8)' }} alt="" />}
              {planTier !== 'WHITE_LABEL' && <Watermark />}
            </div>
          )}
          <button onClick={prevSlide} style={{ position:'absolute', left:20, background:'none', border:'none', color:'#fff', fontSize:48 }}>‹</button>
          <button onClick={nextSlide} style={{ position:'absolute', right:20, background:'none', border:'none', color:'#fff', fontSize:48 }}>›</button>
        </div>
      </div>
    );
  }

  return (
    <div className="wall-page" style={{ padding:'24px 20px 80px' }}>
      <FontLoader />
      {musicTrack && isAudioPlaying && <audio ref={audioRef} autoPlay loop src={`/music/${musicTrack}.mp3`} />}
      
      <div style={{ maxWidth:1400, margin:'0 auto' }}>
        {/* Header */}
        <div className="glass-card" style={{ padding:32, marginBottom:32, display:'flex', flexWrap:'wrap', gap:24, justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <h1 style={{ fontFamily:'var(--font-display)', fontSize:48, marginBottom:8 }}>{eventName}</h1>
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <StatusBadge />
              <span style={{ fontSize:12, opacity:0.5 }}>📸 {displayedPhotos.length} photos</span>
            </div>
          </div>
          
          <div style={{ display:'flex', flexWrap:'wrap', gap:10 }}>
            <div style={{ background:'rgba(255,255,255,0.05)', padding:4, borderRadius:14, display:'flex', gap:4 }}>
              {(['polaroid','grid','album','slideshow'] as ViewMode[]).map(m => (
                <button key={m} onClick={() => setViewMode(m)} style={{
                  padding:'8px 12px', borderRadius:10, border:'none', fontSize:12, fontWeight:600, transition:'0.2s',
                  background: viewMode === m ? themeP : 'transparent',
                  color: viewMode === m ? '#000' : 'rgba(255,255,255,0.6)'
                }}>{m.charAt(0).toUpperCase() + m.slice(1)}</button>
              ))}
            </div>
            <button onClick={() => setShowQR(!showQR)} style={{ padding:'0 16px', borderRadius:12, border:`1px solid ${themeP}`, background:'none', color:themeP, fontSize:12, fontWeight:700 }}>QR Code</button>
            <button onClick={handleDownloadZip} style={{ padding:'0 16px', borderRadius:12, background:themeP, border:'none', color:'#000', fontSize:12, fontWeight:700 }}>Download ZIP</button>
          </div>
        </div>

        {showQR && (
          <div className="glass-card" style={{ maxWidth:400, margin:'0 auto 40px', padding:40, textAlign:'center', display:'flex', flexDirection:'column', alignItems:'center' }}>
            <h3 style={{ marginBottom:20 }}>Scan to Upload</h3>
            <div style={{ padding:20, background:'#fff', borderRadius:16, marginBottom:20 }}>
              <QRCodeSVG value={uploadUrl} size={180} />
            </div>
            <p style={{ fontSize:12, opacity:0.5, wordBreak:'break-all' }}>{uploadUrl}</p>
          </div>
        )}

        {/* View Transitions */}
        {displayedPhotos.length === 0 ? (
          <div className="glass-card" style={{ padding:80, textAlign:'center' }}>
            <div style={{ fontSize:64, marginBottom:24 }}>📷</div>
            <h2 style={{ fontSize:32, marginBottom:16 }}>No Photos Yet</h2>
            <p style={{ opacity:0.5, marginBottom:32 }}>Share the QR code to start the memories!</p>
            <button onClick={() => setShowQR(true)} style={{ background:themeP, color:'#000', padding:'12px 32px', borderRadius:12, fontWeight:700, border:'none' }}>Show QR Code</button>
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
                  {p.caption && <p style={{ fontSize:13, fontStyle:'italic', marginBottom:4 }}>"{p.caption}"</p>}
                  <p style={{ fontSize:11, fontWeight:600 }}>By {p.uploader_name}</p>
                </div>
                {planTier !== 'WHITE_LABEL' && <Watermark />}
              </div>
            ))}
          </div>
        ) : viewMode === 'album' ? (
           <div style={{ display:'flex', flexDirection:'column', gap:60 }}>
             {(() => {
               const groups: { [k: string]: Photo[] } = {};
               displayedPhotos.forEach(p => {
                 const label = new Date(p.created_at).toLocaleDateString();
                 groups[label] = groups[label] || [];
                 groups[label].push(p);
               });
               return Object.entries(groups).map(([label, gPhotos]) => (
                 <div key={label}>
                   <h3 style={{ fontSize:24, marginBottom:20, opacity:0.8 }}>{label}</h3>
                   <div style={{ columns:'2 280px', gap:20 }}>
                     {gPhotos.map(p => (
                       <div key={p.id} className="photo-card" style={{ breakInside:'avoid', marginBottom:20, borderRadius:16, overflow:'hidden', position:'relative' }}>
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
          <div style={{ columns:'2 280px', gap:20 }}>
            {displayedPhotos.map(p => (
              <div key={p.id} className="photo-card" style={{ breakInside:'avoid', marginBottom:20, borderRadius:16, overflow:'hidden', position:'relative' }}>
                <img src={getPublicUrl(p.storage_path)} style={{ width:'100%', display:'block' }} alt="" />
                <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(0,0,0,0.6), transparent)', display:'flex', flexDirection:'column', justifyContent:'flex-end', padding:16, opacity:0, transition:'0.3s' }} className="hover-info">
                   <p style={{ fontSize:12, fontWeight:600 }}>{p.uploader_name}</p>
                </div>
                {planTier !== 'WHITE_LABEL' && <Watermark />}
                <style>{`.photo-card:hover .hover-info { opacity: 1; }`}</style>
              </div>
            ))}
          </div>
        )}
      </div>

      <Confetti trigger={confettiTrigger} />
    </div>
  );
}