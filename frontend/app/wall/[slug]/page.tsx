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
  media_type?: 'image' | 'video';
  reaction_count?: number;
  approved?: boolean;
  is_best_shot?: boolean;
  watermark_url?: string;
}

type ViewMode = 'grid' | 'polaroid' | 'slideshow';

export default function WallPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [eventName, setEventName] = useState('');
  const [theme, setTheme] = useState({ primary: '#f59e0b', secondary: '#f472b6' });
  const [brand, setBrand] = useState<{ logoUrl: string | null, colors: { primary: string, secondary: string } | null }>({ logoUrl: null, colors: null });
  const [eventExpired, setEventExpired] = useState(false);
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
  const [showBestShots, setShowBestShots] = useState(false);
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
      
      let query = supabase.rpc('get_photos_with_reactions', { event_uuid: eventId });
      if (moderationMode) {
        query = query.eq('approved', true);
      }
      const { data, error } = await query;
      
      if (error) {
        console.error('❌ Polling error:', error);
        return;
      }
      
      if (data && data.length > 0) {
        console.log(`📸 Polling found ${data.length} photos`);
        
        setPhotos(prev => {
          const currentPhotoIds = new Set(prev.map(p => p.id));
          const newPhotos = data.filter((photo: Photo) => !currentPhotoIds.has(photo.id));

          if (newPhotos.length > 0) {
            console.log(`✨ Adding ${newPhotos.length} new photos to wall`);
            
            if (!moderationMode) {
              setNewPhotoId(newPhotos[0].id);
              setConfettiTrigger(true);
              setTimeout(() => setConfettiTrigger(false), 100);
            }
          }

          // Also update reaction counts for existing photos
          const updatedPhotos = prev.map(oldPhoto => {
            const newData = data.find((p: Photo) => p.id === oldPhoto.id);
            return newData ? { ...oldPhoto, reaction_count: newData.reaction_count } : oldPhoto;
          });
          
          return [...newPhotos, ...updatedPhotos].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 100);
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
        .select('id, name, theme_primary_color, theme_secondary_color, expires_at, enable_safety_filter, owner_id')
        .eq('slug', slug)
        .single();

      if (error || !data) { setNotFound(true); return; }
      setEventName(data.name);
      setEventId(data.id);
      if (data.theme_primary_color && data.theme_secondary_color) {
        setTheme({ primary: data.theme_primary_color, secondary: data.theme_secondary_color });
      }
      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        setEventExpired(true);
      }
      if (data.enable_safety_filter) {
        setModerationMode(true);
      }

      // Fetch owner's branding
      const { data: ownerData } = await supabase.auth.admin.getUserById(data.owner_id);
      const owner = ownerData.user;
      if (owner?.user_metadata?.plan_tier === 'white_label') {
        setBrand({
          logoUrl: owner.user_metadata.brand_logo_url || null,
          colors: owner.user_metadata.brand_colors || null,
        });
      }
    };
    fetchEvent();
  }, [slug]);

  // Fetch photos + realtime
  useEffect(() => {
    if (!eventId) return;

    const fetchPhotos = async () => {
      let query = supabase.rpc('get_photos_with_reactions', { event_uuid: eventId });
      if (moderationMode) {
        query = query.eq('approved', true);
      }
      const { data, error } = await query;

      if (error) {
        console.error('Error fetching photos with reactions:', error);
      } else if (data) {
        setPhotos(data as Photo[]);
      }
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


  const displayedPhotos = showBestShots ? photos.filter(p => p.is_best_shot) : photos;

  // Slideshow auto-advance
  useEffect(() => {
    if (viewMode === 'slideshow' && displayedPhotos.length > 1) {
      slideshowTimer.current = setInterval(() => {
        setSlideIndex((i) => (i + 1) % displayedPhotos.length);
      }, 5000);
    }
    return () => {
      if (slideshowTimer.current) clearInterval(slideshowTimer.current);
    };
  }, [viewMode, displayedPhotos.length]);

  const nextSlide = useCallback(() => setSlideIndex((i) => (i + 1) % displayedPhotos.length), [displayedPhotos.length]);
  const prevSlide = useCallback(() => setSlideIndex((i) => (i - 1 + displayedPhotos.length) % displayedPhotos.length), [displayedPhotos.length]);

  const handleLike = async (photoId: string) => {
    const guestId = localStorage.getItem('memento_guest_id') || `guest_${Date.now()}`;
    localStorage.setItem('memento_guest_id', guestId);

    // Optimistically update UI
    setPhotos(prevPhotos => 
      prevPhotos.map(p => 
        p.id === photoId ? { ...p, reaction_count: (p.reaction_count || 0) + 1 } : p
      )
    );

    const { error } = await supabase.from('reactions').insert({ 
      photo_id: photoId, 
      guest_id: guestId 
    });

    if (error) {
      console.error('Error liking photo:', error);
      // Revert optimistic update on error
      setPhotos(prevPhotos => 
        prevPhotos.map(p => 
          p.id === photoId ? { ...p, reaction_count: (p.reaction_count || 0) - 1 } : p
        )
      );
    }
  };

  const handleDownloadPdf = async () => {
    const { default: jsPDF } = await import('jspdf');
    const { default: html2canvas } = await import('html2canvas');

    const pdf = new jsPDF('p', 'mm', 'a4');
    const photoElements = Array.from(document.querySelectorAll('.photo-for-pdf'));

    if (photoElements.length === 0) {
      alert('No photos to create a PDF.');
      return;
    }

    for (let i = 0; i < photoElements.length; i++) {
      const element = photoElements[i] as HTMLElement;
      const canvas = await html2canvas(element);
      const imgData = canvas.toDataURL('image/png');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      if (i > 0) {
        pdf.addPage();
      }
      pdf.addImage(imgData, 'PNG', 10, 10, pdfWidth - 20, pdfHeight - 20);
    }

    pdf.save(`${slug}-photobook.pdf`);
  };

  const getPublicUrl = (path: string) => {
    const { data } = supabase.storage.from('photos').getPublicUrl(path);
    return data.publicUrl;
  };

  const downloadPhoto = async (photo: Photo) => {
    const guestId = localStorage.getItem('memento_guest_id') || `guest_${Date.now()}`;
    localStorage.setItem('memento_guest_id', guestId);

    await supabase.from('downloads').insert({ 
      photo_id: photo.id, 
      guest_id: guestId 
    });

    const url = getPublicUrl(photo.storage_path);
    const res = await fetch(url);
    const blob = await res.blob();
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `memento-${photo.uploader_name}-${photo.id.slice(0, 6)}.jpg`;
    link.click();
  };

  const uploadUrl = typeof window !== 'undefined'
    ? `${window.location.protocol}//${window.location.host}/mobile/${slug}`
    : '';

  if (eventExpired) {
    return (
      <div className="nm-page flex items-center justify-center px-4">
        <div className="nm-card max-w-md text-center p-10">
          <div className="nm-circle w-20 h-20 mx-auto mb-6 text-4xl">🕒</div>
          <h1 className="text-2xl font-bold mb-3" style={{color:'#e2e8f0'}}>This event has expired</h1>
          <p className="mb-6" style={{color:'#7f849c'}}>The photo wall for this event is no longer available.</p>
          <Link href="/" className="nm-btn nm-btn-accent px-6 py-3 font-bold">🏠 Go Home</Link>
        </div>
      </div>
    );
  }

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
    const current = displayedPhotos[slideIndex];
    return (
      <div className="fixed inset-0 z-50 flex flex-col" style={{background:'#14182a'}}>
        <div className="flex items-center justify-between px-6 py-4">
          <h1 className="font-bold text-lg" style={{color:'#e2e8f0'}}>{eventName}</h1>
          <div className="flex gap-3 items-center">
            <span className="nm-badge">{slideIndex + 1} / {displayedPhotos.length}</span>
            <button onClick={() => { setViewMode('polaroid'); if (slideshowTimer.current) clearInterval(slideshowTimer.current); }}
              className="nm-btn px-3 py-1 text-sm" style={{color:'#7f849c'}}>✕ Exit</button>
          </div>
        </div>

        {current && (
          <div className="flex-1 relative flex items-center justify-center px-16 overflow-hidden">
            {current.media_type === 'video' ? (
              <video key={current.id} src={getPublicUrl(current.storage_path)} controls autoPlay loop playsInline className="max-h-full max-w-full object-contain rounded-xl" style={{animation:'fadeIn 0.5s ease', boxShadow:'0 20px 60px #14182a'}} />
            ) : (
              <img key={current.id} src={getPublicUrl(current.storage_path)} alt="" className="max-h-full max-w-full object-contain rounded-xl" style={{animation:'fadeIn 0.5s ease', boxShadow:'0 20px 60px #14182a'}} />
            )}
            {(current.caption || current.uploader_name) && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center nm-card px-6 py-3">
                {current.caption && <p className="text-sm italic mb-1" style={{color:'#e2e8f0'}}>&#34;{current.caption}&#34;</p>}
                <p className="text-xs" style={{color:'#7f849c'}}>— {current.uploader_name}</p>
              </div>
            )}
          </div>
        )}

        <button onClick={prevSlide} className="nm-circle w-12 h-12 absolute left-4 top-1/2 -translate-y-1/2 text-2xl" style={{color: 'var(--theme-primary)'}}>‹</button>
        <button onClick={nextSlide} className="nm-circle w-12 h-12 absolute right-4 top-1/2 -translate-y-1/2 text-2xl" style={{color: 'var(--theme-primary)'}}>›</button>

        <div className="flex gap-2 px-6 py-3 overflow-x-auto">
          {displayedPhotos.map((p, i) => (
            <button key={p.id} onClick={() => setSlideIndex(i)}
              className={`flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden transition ${i === slideIndex ? 'ring-2 ring-[#f59e0b]' : 'opacity-50'}`}>
              {p.media_type === 'video' ? (
                <video src={getPublicUrl(p.storage_path)} className="w-full h-full object-cover" muted playsInline />
              ) : (
                <img src={getPublicUrl(p.storage_path)} alt="" className="w-full h-full object-cover" />
              )}
            </button>
          ))}
        </div>

        <style>{`@keyframes fadeIn { from { opacity: 0; transform: scale(0.97); } to { opacity: 1; transform: scale(1); } }`}</style>
      </div>
    );
  }

  // ── NORMAL VIEWS ───────────────────────────────────────────────
  return (
    <div className="nm-page px-4 sm:px-6 lg:px-8 py-8" style={{
      '--theme-primary': brand.colors?.primary || theme.primary,
      '--theme-secondary': brand.colors?.secondary || theme.secondary
    } as React.CSSProperties}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="nm-card p-6 mb-8">
          {brand.logoUrl ? <img src={brand.logoUrl} alt="Brand Logo" className="h-12 mb-4" /> : <div className="nm-badge mb-4">Live Wall Experience</div>}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-4xl sm:text-5xl font-bold mb-4 leading-tight" style={{color:'#e2e8f0'}}>
                {eventName || 'Loading…'}
              </h1>
              <div className="flex flex-wrap items-center gap-3">
                <div className="nm-badge flex items-center gap-2">
                  📸 {displayedPhotos.length} photo{displayedPhotos.length !== 1 ? 's' : ''}
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
                      background: viewMode === mode ? `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})` : 'transparent',
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
                            <Link href={`/mobile/${slug}`} className="nm-btn px-4 py-2 text-xs font-bold" style={{color: 'var(--theme-secondary)'}}>📱 My Photos</Link>
              <Link href={`/wall/${slug}/tv`} className="nm-btn px-4 py-2 text-xs font-bold" style={{color:'#818cf8'}}>📺 TV Mode</Link>
              <button onClick={handleDownloadPdf} className="nm-btn px-4 py-2 text-xs font-bold" style={{color:'#a78bfa'}}>📘 Download PDF</button>
              <button onClick={() => setShowBestShots(!showBestShots)} className="nm-btn px-4 py-2 text-xs font-bold" style={{color: showBestShots ? 'var(--theme-primary)' : '#7f849c'}}>{showBestShots ? '🏆 Best Shots' : 'All Photos'}</button>
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
            <button onClick={() => navigator.clipboard.writeText(uploadUrl)} className="nm-btn w-full py-2.5 text-sm" style={{color: 'var(--theme-primary)'}}>
              📋 Copy Link
            </button>
            <div className="flex gap-2">
              <button onClick={() => {
                const printWindow = window.open('', '_blank');
                if (printWindow) {
                  printWindow.document.write(`<html><head><title>${eventName}</title><style>body{font-family:Arial,sans-serif;text-align:center;padding:40px}h1{color:#333;margin-bottom:30px}.url{font-family:monospace;background:#f5f5f5;padding:10px;border-radius:5px;margin:20px auto;max-width:400px}@media print{body{padding:20px}}</style></head><body><h1>${eventName}</h1><h2>Scan to Upload Photos</h2><div class="url">${uploadUrl}</div><script>window.onload=()=>window.print();</script></body></html>`);
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
      {displayedPhotos.length === 0 ? (
        <div className="text-center py-20">
          <div className="nm-card max-w-lg mx-auto p-12">
            <div className="nm-circle w-32 h-32 mx-auto mb-8 text-6xl">📷</div>
            <h2 className="text-3xl font-bold mb-4" style={{color:'#e2e8f0'}}>No Photos Yet</h2>
            <p className="text-sm mb-10 leading-relaxed" style={{color:'#7f849c'}}>
              Share the QR code and photos will appear here in real time!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button onClick={() => setShowQR(true)} className="nm-btn nm-btn-accent px-8 py-3 font-bold">📱 Show QR Code</button>
              <Link href={`/mobile/${slug}`} className="nm-btn px-8 py-3 font-bold" style={{color:'#7f849c'}}>📸 Upload First Photo</Link>
            </div>
          </div>
        </div>
      ) : viewMode === 'polaroid' ? (
        // ── POLAROID ──
        <div className="p-4">
          <div className="flex flex-wrap justify-center gap-8">
            {displayedPhotos.map((photo, index) => (
              <div key={photo.id} className="nm-card p-5 pb-7 w-72 group flex flex-col photo-for-pdf"
                style={{transform:`rotate(${(index % 5 - 2) * 3}deg)`,transition:'transform 0.3s'}
                }>
                <div className="aspect-square overflow-hidden rounded-xl mb-4 nm-inset relative">
                  {photo.media_type === 'video' ? (
                    <video src={getPublicUrl(photo.storage_path)} className="w-full h-full object-cover" controls playsInline loop muted />
                  ) : (
                    <img src={getPublicUrl(photo.storage_path)} alt={`By ${photo.uploader_name}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                  )}
                  {photo.watermark_url && <img src={photo.watermark_url} alt="Watermark" className="absolute bottom-2 right-2 w-1/4 h-auto opacity-50 pointer-events-none" />}
                </div>
                <div className="text-center flex-1">
                  {photo.caption && <p className="text-sm italic mb-2" style={{color:'#e2e8f0'}}>&#34;{photo.caption}&#34;</p>}
                  <p className="text-xs font-medium" style={{color:'#7f849c'}}>📷 {photo.uploader_name}</p>
                </div>
                <div className="mt-4 flex justify-between items-center">
                  <button onClick={() => handleLike(photo.id)}
                    className="nm-btn text-xs px-3 py-1.5 flex items-center gap-1.5" style={{color: 'var(--theme-secondary)'}}>
                    ❤️ <span className="font-bold">{photo.reaction_count || 0}</span>
                  </button>
                  <button onClick={() => downloadPhoto(photo)}
                    className="nm-btn text-xs px-3 py-1.5 opacity-0 group-hover:opacity-100 transition" style={{color: 'var(--theme-primary)'}}>⬇ Download</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        // ── MASONRY GRID ──
        <div className="columns-2 sm:columns-3 lg:columns-4 xl:columns-5 gap-4 space-y-4 p-4">
          {displayedPhotos.map((photo, index) => (
            <div key={photo.id}
              className={`nm-card break-inside-avoid overflow-hidden group relative photo-for-pdf ${
                newPhotoId === photo.id ? 'ring-2 ring-[#f59e0b]' : ''
              }`}
              style={{animation:`fadeInUp 0.6s ease-out ${index * 0.1}s both`}}
            >
              <div className="overflow-hidden rounded-[14px] relative">
                {photo.media_type === 'video' ? (
                  <video src={getPublicUrl(photo.storage_path)} className="w-full object-cover" controls playsInline loop muted />
                ) : (
                  <img src={getPublicUrl(photo.storage_path)} alt={`By ${photo.uploader_name}`} className="w-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw" />
                )}
                {photos[0]?.watermark_url && <img src={photos[0].watermark_url} alt="Watermark" className="absolute bottom-2 right-2 w-1/4 h-auto opacity-50 pointer-events-none" />}
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-[#14182a]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-4 rounded-[18px]">
                {photo.caption && <p className="text-xs italic mb-2" style={{color:'#e2e8f0'}}>&#34;{photo.caption}&#34;</p>}
                <div className="flex justify-between items-center">
                  <p className="text-xs font-semibold" style={{color:'#e2e8f0'}}>{photo.uploader_name}</p>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleLike(photo.id)} className="nm-btn text-xs px-2 py-1 flex items-center gap-1" style={{color: 'var(--theme-secondary)'}}>❤️ {photo.reaction_count || 0}</button>
                    <button onClick={() => downloadPhoto(photo)} className="nm-circle w-7 h-7 text-xs" style={{color: 'var(--theme-primary)'}}>⬇</button>
                  </div>
                </div>
              </div>
              {newPhotoId === photo.id && (
                <div className="absolute top-2 right-2 nm-badge text-xs animate-bounce" style={{color: 'var(--theme-primary)'}}>NEW!</div>
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
