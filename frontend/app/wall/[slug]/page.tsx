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
      const colors = ['#f59e0b', '#fb923c', '#f472b6', '#a78bfa', '#fcd34d', '#f97316'];
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
    <div className="fixed inset-0 pointer-events-none z-50 dark">
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
      <div className="nm-page flex items-center justify-center px-4">
        <div className="nm-card max-w-md text-center p-10">
          <div className="nm-circle w-20 h-20 mx-auto mb-6 text-4xl">😢</div>
          <h1 className="text-2xl font-bold mb-3" style={{color:'#e2e8f0'}}>Wall Not Found</h1>
          <p className="mb-6" style={{color:'#7f849c'}}>This event doesn't exist or has been removed.</p>
          <Link href="/" className="nm-btn nm-btn-accent px-6 py-3 font-bold">🏠 Go Home</Link>
        </div>
      </div>
    );
  }

  // ── SLIDESHOW MODE (fullscreen) ────────────────────────
  if (viewMode === 'slideshow') {
    const current = photos[slideIndex];
    return (
      <div className="fixed inset-0 z-50 flex flex-col" style={{background:'#14182a'}}>
        <div className="flex items-center justify-between px-6 py-4">
          <h1 className="font-bold text-lg" style={{color:'#e2e8f0'}}>{eventName}</h1>
          <div className="flex gap-3 items-center">
            <span className="nm-badge">{slideIndex + 1} / {photos.length}</span>
            <button onClick={() => { setViewMode('polaroid'); if (slideshowTimer.current) clearInterval(slideshowTimer.current); }}
              className="nm-btn px-3 py-1 text-sm" style={{color:'#7f849c'}}>✕ Exit</button>
          </div>
        </div>

        {current && (
          <div className="flex-1 relative flex items-center justify-center px-16 overflow-hidden">
            <img key={current.id} src={getPublicUrl(current.storage_path)} alt=""
              className="max-h-full max-w-full object-contain rounded-xl"
              style={{animation:'fadeIn 0.5s ease', boxShadow:'0 20px 60px #14182a'}} />
            {(current.caption || current.uploader_name) && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center nm-card px-6 py-3">
                {current.caption && <p className="text-sm italic mb-1" style={{color:'#e2e8f0'}}>&#34;{current.caption}&#34;</p>}
                <p className="text-xs" style={{color:'#7f849c'}}>— {current.uploader_name}</p>
              </div>
            )}
          </div>
        )}

        <button onClick={prevSlide} className="nm-circle w-12 h-12 absolute left-4 top-1/2 -translate-y-1/2 text-2xl" style={{color:'#f59e0b'}}>‹</button>
        <button onClick={nextSlide} className="nm-circle w-12 h-12 absolute right-4 top-1/2 -translate-y-1/2 text-2xl" style={{color:'#f59e0b'}}>›</button>

        <div className="flex gap-2 px-6 py-3 overflow-x-auto">
          {photos.map((p, i) => (
            <button key={p.id} onClick={() => setSlideIndex(i)}
              className={`flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden transition ${i === slideIndex ? 'ring-2 ring-[#f59e0b]' : 'opacity-50'}`}>
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
    <div className="nm-page px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="nm-card p-6 mb-8">
          <div className="nm-badge mb-4">Live Wall Experience</div>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-4xl sm:text-5xl font-bold mb-4 leading-tight" style={{color:'#e2e8f0'}}>
                {eventName || 'Loading…'}
              </h1>
              <div className="flex flex-wrap items-center gap-3">
                <div className="nm-badge flex items-center gap-2">
                  📸 {photos.length} photo{photos.length !== 1 ? 's' : ''}
                  <span className={`w-2 h-2 rounded-full ${
                    realtimeStatus === 'SUBSCRIBED' ? 'bg-green-400 animate-pulse' :
                    realtimeStatus === 'polling' ? 'bg-yellow-400 animate-pulse' :
                    'bg-red-400'}`} />
                  <span style={{color:'#7f849c'}}>
                    {realtimeStatus === 'SUBSCRIBED' ? '⚡ Live' : realtimeStatus === 'polling' ? '🔄 Polling' : '🟡 Connecting'}
                  </span>
                </div>
                <button onClick={() => window.location.reload()} className="nm-btn px-3 py-1.5 text-xs" style={{color:'#7f849c'}}>🔄 Refresh</button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="flex rounded-xl overflow-hidden nm-inset p-1">
                {(['polaroid', 'grid', 'slideshow'] as ViewMode[]).map((mode) => (
                  <button key={mode} onClick={() => { setViewMode(mode); if (mode === 'slideshow') setSlideIndex(0); }}
                    className="px-3 py-2 text-xs font-medium rounded-lg transition"
                    style={{
                      background: viewMode === mode ? 'linear-gradient(135deg,#f59e0b,#f472b6)' : 'transparent',
                      color: viewMode === mode ? '#1e2235' : '#7f849c'
                    }}>
                    {mode === 'polaroid' ? '📷 Polaroid' : mode === 'grid' ? '🔲 Grid' : '▶ Slideshow'}
                  </button>
                ))}
              </div>
              <button onClick={() => setModerationMode(!moderationMode)}
                className="nm-btn px-3 py-2 text-xs font-semibold"
                style={{color: moderationMode ? '#f59e0b' : '#7f849c'}}>
                {moderationMode ? '🛡️ Moderation ON' : '👁️ Auto-Show'}
              </button>
              <button onClick={() => setShowQR(!showQR)} className="nm-btn px-3 py-2 text-xs" style={{color:'#7f849c'}}>
                {showQR ? 'Hide QR' : '📱 QR'}
              </button>
              <Link href={`/upload/${slug}`} className="nm-btn nm-btn-accent px-4 py-2 text-xs font-bold">📸 Upload</Link>
              <Link href={`/mobile/${slug}`} className="nm-btn px-4 py-2 text-xs font-bold" style={{color:'#f472b6'}}>📱 My Photos</Link>
            </div>
          </div>
        </div>

      {/* QR Popover */}
      {showQR && (
        <div className="nm-card max-w-sm mx-auto text-center mb-8 p-8">
          <h3 className="text-lg font-semibold mb-4" style={{color:'#e2e8f0'}}>Share This Wall</h3>
          <div className="nm-inset p-6 rounded-2xl inline-block mx-auto mb-4">
            <QRCodeSVG value={uploadUrl} size={180} bgColor="#1e2235" fgColor="#e2e8f0" />
          </div>
          <p className="text-xs break-all mb-4 font-mono" style={{color:'#7f849c'}}>{uploadUrl}</p>
          
          {/* Enhanced Sharing Options */}
          <div className="space-y-3">
            <button onClick={() => navigator.clipboard.writeText(uploadUrl)} className="nm-btn w-full py-2.5 text-sm" style={{color:'#f59e0b'}}>
              📋 Copy Link
            </button>
            <div className="flex gap-2">
              <button onClick={() => {
                const printWindow = window.open('', '_blank');
                if (printWindow) {
                  printWindow.document.write(`<html><head><title>${eventName}</title><style>body{font-family:Arial,sans-serif;text-align:center;padding:40px}h1{color:#333;margin-bottom:30px}.url{font-family:monospace;background:#f5f5f5;padding:10px;border-radius:5px;margin:20px auto;max-width:400px}@media print{body{padding:20px}}</style></head><body><h1>${eventName}</h1><h2>Scan to Upload Photos</h2><div class="url">${uploadUrl}</div><script>window.onload=()=>window.print();<\/script></body></html>`);
                  printWindow.document.close();
                }
              }} className="nm-btn flex-1 text-xs py-2" style={{color:'#4ade80'}}>📄 Print</button>
              <button onClick={() => {
                if (navigator.share) { navigator.share({ title: eventName, text: `Upload photos to ${eventName}`, url: uploadUrl }); }
                else { navigator.clipboard.writeText(uploadUrl); }
              }} className="nm-btn flex-1 text-xs py-2" style={{color:'#60a5fa'}}>📤 Share</button>
            </div>
          </div>
          <button onClick={() => setShowQR(false)} className="nm-btn mt-4 text-xs px-4 py-1.5" style={{color:'#7f849c'}}>✕ Close</button>
        </div>
      )}

      {/* Empty State */}
      {photos.length === 0 ? (
        <div className="text-center py-20">
          <div className="nm-card max-w-lg mx-auto p-12">
            <div className="nm-circle w-32 h-32 mx-auto mb-8 text-6xl">📷</div>
            <h2 className="text-3xl font-bold mb-4" style={{color:'#e2e8f0'}}>No Photos Yet</h2>
            <p className="text-sm mb-10 leading-relaxed" style={{color:'#7f849c'}}>
              Share the QR code and photos will appear here in real time!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button onClick={() => setShowQR(true)} className="nm-btn nm-btn-accent px-8 py-3 font-bold">📱 Show QR Code</button>
              <Link href={`/upload/${slug}`} className="nm-btn px-8 py-3 font-bold" style={{color:'#7f849c'}}>📸 Upload First Photo</Link>
            </div>
          </div>
        </div>
      ) : viewMode === 'polaroid' ? (
        // ── POLAROID ──
        <div className="p-4">
          <div className="flex flex-wrap justify-center gap-8">
            {photos.map((photo, index) => (
              <div key={photo.id} className="nm-card p-5 pb-7 w-72 group flex flex-col"
                style={{transform:`rotate(${(index % 5 - 2) * 3}deg)`,transition:'transform 0.3s'}
                }>
                <div className="aspect-square overflow-hidden rounded-xl mb-4 nm-inset">
                  <img src={getPublicUrl(photo.storage_path)} alt={`By ${photo.uploader_name}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                </div>
                <div className="text-center flex-1">
                  {photo.caption && <p className="text-sm italic mb-2" style={{color:'#e2e8f0'}}>&#34;{photo.caption}&#34;</p>}
                  <p className="text-xs font-medium" style={{color:'#7f849c'}}>📷 {photo.uploader_name}</p>
                </div>
                <div className="mt-4 flex justify-center">
                  <button onClick={() => downloadPhoto(photo)}
                    className="nm-btn text-xs px-3 py-1.5 opacity-0 group-hover:opacity-100 transition" style={{color:'#f59e0b'}}>⬇ Download</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        // ── MASONRY GRID ──
        <div className="columns-2 sm:columns-3 lg:columns-4 xl:columns-5 gap-4 space-y-4 p-4">
          {photos.map((photo, index) => (
            <div key={photo.id}
              className={`nm-card break-inside-avoid overflow-hidden group relative ${
                newPhotoId === photo.id ? 'ring-2 ring-[#f59e0b]' : ''
              }`}
              style={{animation:`fadeInUp 0.6s ease-out ${index * 0.1}s both`}}
            >
              <div className="overflow-hidden rounded-[14px]">
                <img src={getPublicUrl(photo.storage_path)} alt={`By ${photo.uploader_name}`}
                  className="w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-[#14182a]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-4 rounded-[18px]">
                {photo.caption && <p className="text-xs italic mb-2" style={{color:'#e2e8f0'}}>&#34;{photo.caption}&#34;</p>}
                <div className="flex justify-between items-center">
                  <p className="text-xs font-semibold" style={{color:'#e2e8f0'}}>{photo.uploader_name}</p>
                  <button onClick={() => downloadPhoto(photo)} className="nm-circle w-7 h-7 text-xs" style={{color:'#f59e0b'}}>⬇</button>
                </div>
              </div>
              {newPhotoId === photo.id && (
                <div className="absolute top-2 right-2 nm-badge text-xs animate-bounce" style={{color:'#f59e0b'}}>NEW!</div>
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
