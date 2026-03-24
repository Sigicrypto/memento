"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';

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

  // Slideshow state
  const [slideIndex, setSlideIndex] = useState(0);
  const slideshowTimer = useRef<ReturnType<typeof setInterval> | null>(null);

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
      .channel(`photos-${eventId}`)
      // Remove filter for safety, filter on client side instead to be bulletproof
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'photos'
      }, (payload) => {
        const newPhoto = payload.new as Photo;
        if (newPhoto.event_id === eventId) {
          setPhotos((prev) => {
            if (prev.some(p => p.id === newPhoto.id)) return prev;
            return [...prev, newPhoto];
         });
        }
      })
      .on('postgres_changes', {
        event: 'DELETE', schema: 'public', table: 'photos'
      }, (payload) => {
        const oldPhoto = payload.old as Photo;
        setPhotos((prev) => prev.filter((p) => p.id !== oldPhoto.id));
      })
      .subscribe((status) => {
        setRealtimeStatus(status);
        console.log(`Realtime debug status [${eventId}]:`, status);
      });

    return () => { supabase.removeChannel(channel); };
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
                      <span className={`w-2.5 h-2.5 rounded-full ${realtimeStatus === 'SUBSCRIBED' ? 'bg-green-400 animate-pulse' : 'bg-yellow-400'}`} title={`Realtime: ${realtimeStatus}`} />
                    </div>

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
                  <button onClick={() => setShowQR(!showQR)} className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-5 py-3 rounded-xl text-sm font-medium transition border border-white/20">
                    {showQR ? 'Hide QR' : '📱 QR Code'}
                  </button>
                  <Link href={`/upload/${slug}`} className="bg-white text-purple-700 hover:bg-gray-100 px-6 py-3 rounded-xl text-sm font-bold transition shadow-lg">
                    📸 Upload Photos
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

      {/* QR Popover */}
      {showQR && (
        <div className="card max-w-sm mx-auto text-center mb-8 border-2 border-purple-200 dark:border-purple-800">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-xl inline-block mx-auto mb-4 shadow-lg">
            <QRCodeSVG value={uploadUrl} size={200} />
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 break-all mb-4 font-mono">{uploadUrl}</p>
          <button onClick={() => navigator.clipboard.writeText(uploadUrl)} className="btn-secondary w-full text-sm">
            📋 Copy Link
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
        <div className="flex flex-wrap justify-center gap-10 p-8">
          {photos.map((photo, index) => (
            <div 
              key={photo.id} 
              className="bg-white dark:bg-gray-900 p-5 pb-7 rounded-xl shadow-2xl w-80 transform hover:scale-105 transition-all duration-300 border border-gray-200 dark:border-gray-700 flex flex-col group hover:shadow-3xl"
              style={{
                transform: `rotate(${(index % 3 - 1) * 2}deg)`,
                animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`
              }}
            >
              <div className="aspect-square overflow-hidden rounded-xl bg-gray-50 dark:bg-gray-950 mb-5 group-hover:scale-105 transition-transform duration-300">
                <img 
                  src={getPublicUrl(photo.storage_path)} 
                  alt={`By ${photo.uploader_name}`}
                  className="w-full h-full object-cover" 
                  loading="lazy" 
                />
              </div>
              <div className="text-center flex-1">
                {photo.caption && (
                  <p className="text-gray-800 dark:text-gray-200 text-sm italic mb-3 font-medium">"{photo.caption}"</p>
                )}
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">By {photo.uploader_name}</p>
              </div>
              <button
                onClick={() => downloadPhoto(photo)}
                className="mt-5 text-sm text-purple-600 dark:text-purple-400 opacity-0 group-hover:opacity-100 transition hover:underline font-medium"
              >
                ⬇ Download
              </button>
            </div>
          ))}
        </div>
      ) : (
        // ── MASONRY GRID ──
        <div className="columns-2 sm:columns-3 lg:columns-4 xl:columns-5 gap-8 space-y-8 p-8">
          {photos.map((photo, index) => (
            <div 
              key={photo.id} 
              className="break-inside-avoid rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 group relative hover:shadow-2xl transition-all duration-300"
              style={{ animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both` }}
            >
              <img 
                src={getPublicUrl(photo.storage_path)} 
                alt={`By ${photo.uploader_name}`}
                className="w-full object-cover group-hover:scale-105 transition-transform duration-300" 
                loading="lazy" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-5">
                {photo.caption && <p className="text-white text-sm italic mb-3 font-medium">"{photo.caption}"</p>}
                <div className="flex justify-between items-center">
                  <p className="text-white text-sm font-semibold">{photo.uploader_name}</p>
                  <button 
                    onClick={() => downloadPhoto(photo)} 
                    className="text-white text-sm bg-white/20 hover:bg-white/30 backdrop-blur-sm px-3 py-1.5 rounded-lg transition-all duration-200 hover:scale-105"
                  >
                    ⬇
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
    </div>
  );
}
