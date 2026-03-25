"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';

// Confetti animation component
const Confetti = ({ trigger }: { trigger: boolean }) => {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; color: string }>>([]);

  useEffect(() => {
    if (trigger) {
      const colors = ['#f87171', '#fbbf24', '#34d399', '#60a5fa', '#a78bfa', '#f472b6'];
      const newParticles = Array.from({ length: 50 }, (_, i) => ({
        id: Date.now() + i,
        x: Math.random() * 100,
        y: -10,
        color: colors[Math.floor(Math.random() * colors.length)]
      }));
      setParticles(newParticles);
      
      setTimeout(() => setParticles([]), 3000);
    }
  }, [trigger]);

  if (particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute w-2 h-2 animate-bounce"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            backgroundColor: particle.color,
            animation: 'fall 3s ease-out forwards'
          }}
        />
      ))}
      <style jsx>{`
        @keyframes fall {
          to {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

interface Photo {
  id: string;
  storage_path: string;
  uploader_name: string;
  created_at: string;
  caption?: string;
  event_id: string;
}


type ViewMode = 'grid' | 'polaroid' | 'slideshow';

export default function WallPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [eventName, setEventName] = useState('');
  const [eventId, setEventId] = useState<string | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [notFound, setNotFound] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('polaroid');
  const [realtimeStatus, setRealtimeStatus] = useState<string>('connecting');
  const [usePolling, setUsePolling] = useState(false);
  const pollingInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const [moderationMode, setModerationMode] = useState(false);
  const [confettiTrigger, setConfettiTrigger] = useState(false);
  const [newPhotoId, setNewPhotoId] = useState<string | null>(null);

  // Slideshow state
  const [slideIndex, setSlideIndex] = useState(0);
  const slideshowTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fallback polling when WebSocket fails
  const startPolling = useCallback(() => {
    if (pollingInterval.current) return;
    
    setUsePolling(true);
    setRealtimeStatus('polling');
    console.log('🔄 Starting aggressive polling (2-second intervals)');
    
    pollingInterval.current = setInterval(async () => {
      if (!eventId) return;
      
      console.log('📡 Polling for new photos...');
      
      const { data, error } = await supabase
        .from('photos')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false })
        .limit(20); // Get latest 20 photos
      
      if (error) {
        console.error('❌ Polling error:', error);
        return;
      }
      
      if (data && data.length > 0) {
        console.log(`📸 Polling found ${data.length} photos`);
        
        setPhotos(prev => {
          const newPhotos = data.filter(photo => 
            !prev.some(p => p.id === photo.id)
          );
          
          if (newPhotos.length > 0) {
            console.log(`✨ Adding ${newPhotos.length} new photos to wall`);
            
            // Trigger confetti for new photos in polling mode too
            if (!moderationMode) {
              setNewPhotoId(newPhotos[0].id);
              setConfettiTrigger(true);
              setTimeout(() => setConfettiTrigger(false), 100);
            }
          }
          
          return [...newPhotos, ...prev].slice(0, 100);
        });
      }
    }, 2000); // Poll every 2 seconds (more aggressive)
  }, [eventId, moderationMode]);

  const stopPolling = useCallback(() => {
    if (pollingInterval.current) {
      clearInterval(pollingInterval.current);
      pollingInterval.current = null;
    }
    setUsePolling(false);
  }, []);

  // Fetch event info
  useEffect(() => {
    const fetchEvent = async () => {
      const { data, error } = await supabase
        .from('events')
        .select('id, name')
        .eq('slug', slug)
        .single();

      if (error || !data) { setNotFound(true); return; }
      setEventName(data.name);
      setEventId(data.id);
    };
    fetchEvent();
  }, [slug]);

  // Fetch photos + realtime
  useEffect(() => {
    if (!eventId) return;

    const fetchPhotos = async () => {
      const { data } = await supabase
        .from('photos')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: true });
      if (data) setPhotos(data);
    };
    fetchPhotos();

    const channel = supabase
      .channel(`wall-photos-${eventId}`)
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'photos'
        },
        (payload) => {
          console.log('New photo received:', payload.new);
          const newPhoto = payload.new as Photo;
          
          // Filter on client side to ensure we only get photos for this event
          if (newPhoto.event_id === eventId) {
            setPhotos((prev) => {
              // Check if photo already exists
              if (prev.some(p => p.id === newPhoto.id)) {
                console.log('Photo already exists, skipping');
                return prev;
              }
              console.log('Adding new photo to wall');
              return [...prev, newPhoto];
            });
            
            // Trigger confetti for new photos (only in non-moderation mode)
            if (!moderationMode) {
              setNewPhotoId(newPhoto.id);
              setConfettiTrigger(true);
              setTimeout(() => setConfettiTrigger(false), 100);
            }
          } else {
            console.log('Photo not for this event, ignoring');
          }
        }
      )
      .on('postgres_changes',
        { 
          event: 'DELETE', 
          schema: 'public', 
          table: 'photos'
        },
        (payload) => {
          console.log('Photo deleted:', payload.old);
          const oldPhoto = payload.old as Photo;
          
          // Filter on client side
          if (oldPhoto.event_id === eventId) {
            setPhotos((prev) => prev.filter((p) => p.id !== oldPhoto.id));
          }
        }
      )
      .subscribe((status) => {
        setRealtimeStatus(status);
        console.log(`Realtime subscription status [${eventId}]:`, status);
        
        if (status === 'SUBSCRIBED') {
          console.log('✅ Successfully subscribed to real-time updates');
          stopPolling(); // Stop polling if WebSocket works
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.error('❌ Realtime subscription failed, falling back to polling');
          startPolling(); // Start polling as fallback
        }
      });

    // Start polling as backup if WebSocket doesn't connect within 3 seconds
    const fallbackTimer = setTimeout(() => {
      if (realtimeStatus === 'connecting') {
        console.log('⚠️ WebSocket taking too long, starting polling immediately');
        startPolling();
      }
    }, 3000);

    return () => { 
    supabase.removeChannel(channel); 
    clearTimeout(fallbackTimer);
    stopPolling();
  };
  }, [eventId]);


  // Slideshow auto-advance
  useEffect(() => {
    if (viewMode === 'slideshow' && photos.length > 1) {
      slideshowTimer.current = setInterval(() => {
        setSlideIndex((i) => (i + 1) % photos.length);
      }, 5000);
    }
    return () => {
      if (slideshowTimer.current) clearInterval(slideshowTimer.current);
    };
  }, [viewMode, photos.length]);

  const getPublicUrl = (path: string) => {
    const { data } = supabase.storage.from('photos').getPublicUrl(path);
    return data.publicUrl;
  };

  const downloadPhoto = async (photo: Photo) => {
    const url = getPublicUrl(photo.storage_path);
    const res = await fetch(url);
    const blob = await res.blob();
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `memento-${photo.uploader_name}-${photo.id.slice(0, 6)}.jpg`;
    link.click();
  };

  const uploadUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/upload/${slug}` : '';

  const nextSlide = useCallback(() => setSlideIndex((i) => (i + 1) % photos.length), [photos.length]);
  const prevSlide = useCallback(() => setSlideIndex((i) => (i - 1 + photos.length) % photos.length), [photos.length]);

  if (notFound) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="card max-w-md text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-red-100 to-orange-100 dark:from-red-900/30 dark:to-orange-900/30 rounded-full flex items-center justify-center">
            <p className="text-4xl">😢</p>
          </div>
          <h1 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">Wall Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">This event doesn't exist or has been removed.</p>
          <Link href="/" className="btn-primary">
            🏠 Go Home
          </Link>
        </div>
      </div>
    );
  }

  // ── SLIDESHOW MODE (fullscreen) ────────────────────────
  if (viewMode === 'slideshow') {
    const current = photos[slideIndex];
    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-4">
          <h1 className="text-white font-bold text-lg">{eventName}</h1>
          <div className="flex gap-3">
            <span className="text-gray-300 text-sm">{slideIndex + 1} / {photos.length}</span>
            <button
              onClick={() => { setViewMode('polaroid'); if (slideshowTimer.current) clearInterval(slideshowTimer.current); }}
              className="text-white text-sm bg-white/10 hover:bg-white/20 px-3 py-1 rounded transition"
            >
              ✕ Exit
            </button>
          </div>
        </div>

        {/* Main photo */}
        {current && (
          <div className="flex-1 relative flex items-center justify-center px-16 overflow-hidden">
            <img
              key={current.id}
              src={getPublicUrl(current.storage_path)}
              alt=""
              className="max-h-full max-w-full object-contain rounded-xl shadow-2xl"
              style={{ animation: 'fadeIn 0.5s ease' }}
            />
            {/* Caption overlay */}
            {(current.caption || current.uploader_name) && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center">
                {current.caption && (
                  <p className="text-white text-xl italic mb-1">"{current.caption}"</p>
                )}
                <p className="text-gray-300 text-sm">— {current.uploader_name}</p>
              </div>
            )}
          </div>
        )}

        {/* Nav buttons */}
        <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/25 text-white w-12 h-12 rounded-full flex items-center justify-center text-2xl transition">
          ‹
        </button>
        <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/25 text-white w-12 h-12 rounded-full flex items-center justify-center text-2xl transition">
          ›
        </button>

        {/* Thumbnail strip */}
        <div className="flex gap-2 px-6 py-3 overflow-x-auto">
          {photos.map((p, i) => (
            <button key={p.id} onClick={() => setSlideIndex(i)}
              className={`flex-shrink-0 w-14 h-14 rounded overflow-hidden border-2 transition ${i === slideIndex ? 'border-white' : 'border-transparent opacity-50'}`}>
              <img src={getPublicUrl(p.storage_path)} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>

        <style>{`@keyframes fadeIn { from { opacity: 0; transform: scale(0.97); } to { opacity: 1; transform: scale(1); } }`}</style>
      </div>
    );
  }

  // ── NORMAL VIEWS ───────────────────────────────────────────────
  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header with Aurora Background */}
        <div className="relative mb-12">
          <div className="aurora-bg rounded-3xl p-8 text-white">
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-white/15 border border-white/20 mb-4">
                Live Wall Experience
              </div>
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
                <div className="flex-1">
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 drop-shadow-lg leading-tight">
                    {eventName || 'Loading…'}
                  </h1>
                  <div className="flex items-center gap-4">
                    <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full flex items-center gap-3">
                      <span className="text-base font-semibold">
                        📸 {photos.length} photo{photos.length !== 1 ? 's' : ''} shared
                      </span>
                      <span className={`w-2.5 h-2.5 rounded-full ${
                realtimeStatus === 'SUBSCRIBED' ? 'bg-green-400 animate-pulse' : 
                realtimeStatus === 'polling' ? 'bg-blue-400 animate-pulse' : 
                'bg-yellow-400'
              }`} title={`Connection: ${realtimeStatus}`} />
                      <span className="text-xs text-white/80 font-medium">
                        {realtimeStatus === 'SUBSCRIBED' ? '⚡ Live' : 
                         realtimeStatus === 'polling' ? '🔄 Polling (2s)' : 
                         '🟡 Connecting...'}
                      </span>
                    </div>
                    <button
                      onClick={() => window.location.reload()}
                      className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-3 rounded-full text-white text-sm font-medium transition border border-white/20"
                      title="Refresh wall"
                    >
                      🔄 Refresh
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3 lg:gap-4">
                  {/* View mode toggles */}
                  <div className="flex rounded-xl border border-white/20 overflow-hidden bg-white/10 backdrop-blur-sm">
                    {(['polaroid', 'grid', 'slideshow'] as ViewMode[]).map((mode) => (
                      <button
                        key={mode}
                        onClick={() => { setViewMode(mode); if (mode === 'slideshow') setSlideIndex(0); }}
                        className={`px-5 py-3 text-sm font-medium transition ${viewMode === mode ? 'bg-white text-purple-700' : 'text-white hover:bg-white/10'}`}
                      >
                        {mode === 'polaroid' ? '📷 Polaroid' : mode === 'grid' ? '🔲 Grid' : '▶ Slideshow'}
                      </button>
                    ))}
                  </div>
                  
                  {/* Moderation mode toggle */}
                  <button
                    onClick={() => setModerationMode(!moderationMode)}
                    className={`px-5 py-3 rounded-xl text-sm font-medium transition border ${
                      moderationMode 
                        ? 'bg-orange-500 text-white border-orange-400' 
                        : 'bg-white/20 text-white border-white/20 hover:bg-white/30'
                    }`}
                  >
                    {moderationMode ? '🛡️ Moderation ON' : '👁️ Auto-Show'}
                  </button>
                  
                  <button onClick={() => setShowQR(!showQR)} className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-5 py-3 rounded-xl text-sm font-medium transition border border-white/20">
                    {showQR ? 'Hide QR' : '📱 QR Code'}
                  </button>
                  <Link href={`/upload/${slug}`} className="bg-white text-purple-700 hover:bg-gray-100 px-6 py-3 rounded-xl text-sm font-bold transition shadow-lg">
                    📸 Upload Photos
                  </Link>
                  <Link href={`/mobile/${slug}`} className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl text-sm font-bold transition shadow-lg">
                    📱 My Photos
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

      {/* QR Popover */}
      {showQR && (
        <div className="card max-w-sm mx-auto text-center mb-8 border-2 border-purple-200 dark:border-purple-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Share This Wall</h3>
          <div className="bg-white dark:bg-gray-900 p-6 rounded-xl inline-block mx-auto mb-4 shadow-lg">
            <QRCodeSVG value={uploadUrl} size={200} />
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 break-all mb-4 font-mono">{uploadUrl}</p>
          
          {/* Enhanced Sharing Options */}
          <div className="space-y-3">
            <button onClick={() => navigator.clipboard.writeText(uploadUrl)} className="btn-secondary w-full text-sm">
              📋 Copy Link
            </button>
            
            <div className="flex gap-2">
              <button 
                onClick={() => {
                  // Simple print functionality
                  const printWindow = window.open('', '_blank');
                  if (printWindow) {
                    printWindow.document.write(`
                      <html>
                        <head>
                          <title>${eventName} - Upload Guide</title>
                          <style>
                            body { font-family: Arial, sans-serif; text-align: center; padding: 40px; }
                            h1 { color: #333; margin-bottom: 30px; }
                            .qr-code { margin: 30px auto; display: block; }
                            .url { font-family: monospace; background: #f5f5f5; padding: 10px; border-radius: 5px; margin: 20px auto; max-width: 400px; }
                            .instructions { margin: 30px auto; max-width: 400px; text-align: left; }
                            @media print { body { padding: 20px; } }
                          </style>
                        </head>
                        <body>
                          <h1>${eventName}</h1>
                          <h2>Scan to Upload Photos</h2>
                          <div class="url">${uploadUrl}</div>
                          <div class="instructions">
                            <h3>Instructions:</h3>
                            <ol>
                              <li>Open your phone camera</li>
                              <li>Point at the QR code</li>
                              <li>Tap the link that appears</li>
                              <li>Upload your photos!</li>
                            </ol>
                          </div>
                          <script>window.onload = () => window.print();</script>
                        </body>
                      </html>
                    `);
                    printWindow.document.close();
                  }
                }}
                className="flex-1 text-xs bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20 px-3 py-2 rounded-lg transition"
              >
                📄 Print Guide
              </button>
              
              <button 
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: eventName,
                      text: `Upload photos to ${eventName}`,
                      url: uploadUrl
                    });
                  } else {
                    navigator.clipboard.writeText(uploadUrl);
                    alert('Link copied to clipboard!');
                  }
                }}
                className="flex-1 text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 px-3 py-2 rounded-lg transition"
              >
                📤 Share
              </button>
            </div>
          </div>
          
          <button onClick={() => setShowQR(false)} className="text-xs text-gray-500 dark:text-gray-400 mt-4 hover:text-gray-700 dark:hover:text-gray-300">
            ✕ Close
          </button>
        </div>
      )}

      {/* Empty State */}
      {photos.length === 0 ? (
        <div className="text-center py-32">
          <div className="max-w-2xl mx-auto">
            <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-full flex items-center justify-center">
              <span className="text-6xl">📷</span>
            </div>
            <h2 className="text-4xl font-bold mb-6 text-gray-900 dark:text-white">No Photos Yet</h2>
            <p className="text-gray-600 dark:text-gray-400 text-xl mb-12 leading-relaxed">
              Share the QR code and photos will appear here in real time! Start capturing memories together.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <button onClick={() => setShowQR(true)} className="btn-primary px-8 py-4 text-lg">
                📱 Show QR Code
              </button>
              <Link href={`/upload/${slug}`} className="btn-secondary px-8 py-4 text-lg">
                📸 Upload First Photo
              </Link>
            </div>
          </div>
        </div>
      ) : viewMode === 'polaroid' ? (
        // ── POLAROID ──
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-950/30 to-gray-900 relative overflow-hidden">
          {/* Enhanced background */}
          <div className="fixed inset-0 bg-gradient-to-br from-purple-950/20 via-transparent to-cyan-950/10 pointer-events-none" />
          <div className="fixed inset-0 grid-pattern pointer-events-none opacity-20" />
          <div className="noise-overlay opacity-10" />
          
          {/* Ambient glows */}
          <div className="glow-orb w-[700px] h-[700px] bg-purple-600/12 top-[-300px] right-[-200px] blur-3xl" />
          <div className="glow-orb w-[600px] h-[600px] bg-cyan-600/10 bottom-[-200px] left-[-100px] blur-2xl" />
          <div className="glow-orb w-[400px] h-[400px] bg-pink-600/8 top-1/2 left-1/3 blur-xl" />
          
          <div className="relative z-10 p-8 pt-8">
            <div className="flex flex-wrap justify-center gap-12">
              {photos.map((photo, index) => (
                <div 
                  key={photo.id} 
                  className="bg-gray-900/60 backdrop-blur-xl p-6 pb-8 rounded-2xl shadow-2xl w-80 transform hover:scale-105 transition-all duration-500 border border-purple-500/20 flex flex-col group hover:shadow-3xl hover:border-purple-400/40"
                  style={{
                    transform: `rotate(${(index % 5 - 2) * 3}deg)`,
                    animation: `fadeInUp 0.8s ease-out ${index * 0.15}s both`
                  }}
                >
                  {/* Polaroid frame decoration */}
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-cyan-500/5 rounded-2xl pointer-events-none" />
                  
                  <div className="aspect-square overflow-hidden rounded-xl bg-gray-800/50 mb-6 group-hover:scale-105 transition-transform duration-500 border border-purple-500/10">
                    <img 
                      src={getPublicUrl(photo.storage_path)} 
                      alt={`By ${photo.uploader_name}`}
                      className="w-full h-full object-cover" 
                      loading="lazy" 
                    />
                  </div>
                  
                  <div className="text-center flex-1">
                    {photo.caption && (
                      <p className="text-gray-200 text-sm italic mb-3 font-medium text-shadow">"{photo.caption}"</p>
                    )}
                    <p className="text-gray-400 text-sm font-medium flex items-center justify-center gap-2">
                      <span className="text-purple-400">📷</span> {photo.uploader_name}
                    </p>
                  </div>
                  
                  <div className="mt-6 flex justify-center">
                    <button
                      onClick={() => downloadPhoto(photo)}
                      className="text-sm text-purple-300 opacity-0 group-hover:opacity-100 transition hover:text-purple-200 font-medium flex items-center gap-2"
                    >
                      <span>⬇</span> Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        // ── MASONRY GRID ──
        <div className="columns-2 sm:columns-3 lg:columns-4 xl:columns-5 gap-6 lg:gap-8 space-y-6 lg:space-y-8 p-6 lg:p-8">
          {photos.map((photo, index) => (
            <div 
              key={photo.id} 
              className={`break-inside-avoid rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 group relative hover:shadow-2xl transition-all duration-300 ${
                newPhotoId === photo.id ? 'ring-4 ring-purple-400 ring-opacity-60 animate-pulse' : ''
              }`}
              style={{ 
                animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`,
                animationDelay: newPhotoId === photo.id ? '0s' : `${index * 0.1}s`
              }}
            >
              <img 
                src={getPublicUrl(photo.storage_path)} 
                alt={`By ${photo.uploader_name}`}
                className="w-full object-cover group-hover:scale-105 transition-transform duration-500" 
                loading="lazy" 
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-5">
                {photo.caption && <p className="text-white text-sm italic mb-3 font-medium drop-shadow-lg">"{photo.caption}"</p>}
                <div className="flex justify-between items-center">
                  <p className="text-white text-sm font-semibold drop-shadow-lg">{photo.uploader_name}</p>
                  <button 
                    onClick={() => downloadPhoto(photo)} 
                    className="text-white text-sm bg-white/20 hover:bg-white/30 backdrop-blur-sm px-3 py-1.5 rounded-lg transition-all duration-200 hover:scale-105"
                  >
                    ⬇
                  </button>
                </div>
              </div>
              
              {/* New photo indicator */}
              {newPhotoId === photo.id && (
                <div className="absolute top-2 right-2 bg-purple-500 text-white text-xs px-2 py-1 rounded-full font-medium animate-bounce">
                  NEW!
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      </div>
      
      {/* Confetti Animation */}
      <Confetti trigger={confettiTrigger} />
    </div>
  );
}
