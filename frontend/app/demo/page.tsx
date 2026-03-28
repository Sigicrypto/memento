"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { QRCodeSVG } from 'qrcode.react';

// Demo photos with different themes
const initialDemoPhotos = [
  { id: 1, emoji: '🎓', caption: 'Graduation Day', uploader: 'Alex Chen', delay: 0.1 },
  { id: 2, emoji: '🌸', caption: 'Spring Wedding', uploader: 'Sarah M.', delay: 0.3 },
  { id: 3, emoji: '🎂', caption: 'Birthday Surprise', uploader: 'Mike R.', delay: 0.5 },
  { id: 4, emoji: '🏖️', caption: 'Beach Party', uploader: 'Lisa K.', delay: 0.7 },
  { id: 5, emoji: '🎊', caption: 'New Year Eve', uploader: 'Tom H.', delay: 0.9 },
  { id: 6, emoji: '💐', caption: 'Anniversary', uploader: 'Emma L.', delay: 1.1 },
  { id: 7, emoji: '🥂', caption: 'Corporate Event', uploader: 'David P.', delay: 1.3 },
  { id: 8, emoji: '🎉', caption: 'Baby Shower', uploader: 'Rachel S.', delay: 1.5 },
  { id: 9, emoji: '✨', caption: 'Festival Fun', uploader: 'Chris M.', delay: 1.7 },
];

export default function DemoPage() {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<'grid' | 'polaroid' | 'slideshow'>('grid');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  
  const [demoId, setDemoId] = useState<string>('');
  const [photos, setPhotos] = useState<any[]>(initialDemoPhotos);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes

  // Initialize demo ID and timer
  useEffect(() => {
    const newDemoId = Date.now().toString(36) + Math.random().toString(36).substring(7);
    setDemoId(newDemoId);

    const timerInterval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          window.location.reload(); // Refresh when time is up
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerInterval);
  }, []);

  // Listen to live uploads
  useEffect(() => {
    if (!demoId) return;

    const channel = supabase.channel(`demo-${demoId}`);
    channel.on('broadcast', { event: 'NEW_UPLOAD' }, (payload) => {
      const data = payload.payload;
      setPhotos(prev => {
        const newPhoto = {
          id: data.id,
          url: data.url,
          type: data.type,
          caption: data.caption,
          uploader: data.uploader,
          delay: 0.1
        };
        return [newPhoto, ...prev];
      });
    }).subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [demoId]);

  // Slideshow auto-play
  useEffect(() => {
    if (viewMode === 'slideshow' && isPlaying) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % photos.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [viewMode, isPlaying, photos.length]);

  const uploadUrl = typeof window !== 'undefined' ? `${window.location.origin}/demo/upload?id=${demoId}` : '';
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="nm-page pb-12 min-h-screen">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-[#1e2235]/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl" style={{color: '#e2e8f0'}}>
              <span className="nm-circle w-10 h-10 text-lg">📷</span>
              <span>Memento</span>
            </Link>
            <div className="flex items-center gap-4">
              {user ? (
                <>
                  <Link href="/admin" className="nm-btn px-4 py-2 text-sm">Dashboard</Link>
                </>
              ) : (
                <>
                  <Link href="/auth" className="nm-btn px-4 py-2 text-sm">Sign In</Link>
                  <Link href="/pricing" className="nm-btn nm-btn-accent px-4 py-2 text-sm font-bold">Create a Wall</Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Demo Content */}
      <div className="px-4 pt-28">
        <div className="max-w-7xl mx-auto mb-8 px-4 flex flex-col items-center">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2 px-4" style={{color:'#e2e8f0'}}>Memento Live Demo</h1>
            <p className="text-sm mb-4" style={{color:'#7f849c'}}>Scan the QR code to post to this wall right now!</p>
            <div className="flex justify-center items-center gap-4 mb-6">
              <span className="nm-badge flex items-center gap-1.5" style={{color:'#4ade80'}}>
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>LIVE
              </span>
              <span className="nm-badge" style={{color:'#f472b6'}}>
                Demo resets in {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
              </span>
            </div>
            
            <div className="bg-white p-4 rounded-xl mx-auto shadow-[0_0_20px_rgba(245,158,11,0.2)] inline-block">
              {uploadUrl ? <QRCodeSVG value={uploadUrl} size={150} level="M" /> : <div style={{width:150,height:150}}/>}
            </div>
          </div>

          {/* View Mode Controls */}
          <div className="flex justify-center gap-2">
            {(['grid','polaroid','slideshow'] as const).map((mode) => (
              <button key={mode} onClick={() => setViewMode(mode)}
                className="nm-btn px-4 py-2 text-sm capitalize"
                style={{
                  color: viewMode === mode ? '#f59e0b' : '#7f849c',
                  boxShadow: viewMode === mode
                    ? 'inset 4px 4px 8px #14182a, inset -4px -4px 8px #252c46'
                    : '6px 6px 12px #14182a, -6px -6px 12px #252c46',
                }}>
                {mode}
              </button>
            ))}
          </div>
        </div>

        {/* Grid View */}
        {viewMode === 'grid' && (
          <div className="flex justify-center">
            <div className="max-w-6xl w-full">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 justify-items-center">
                {photos.map((photo) => (
                <div key={photo.id} className="nm-card group relative aspect-square overflow-hidden hover:scale-105 transition-transform w-full max-w-[240px]"
                  style={{animationDelay:`${photo.delay}s`}}>
                  <div className="flex flex-col items-center justify-center h-full p-2 relative z-10">
                    {photo.url ? (
                      photo.type === 'video' ? (
                        <video src={photo.url} className="w-full h-full object-cover absolute inset-0 z-0 opacity-40 group-hover:opacity-100 transition-opacity" autoPlay muted loop playsInline />
                      ) : (
                        <img src={photo.url} className="w-full h-full object-cover absolute inset-0 z-0 opacity-40 group-hover:opacity-100 transition-opacity" alt="Upload" />
                      )
                    ) : (
                      <span className="text-4xl mb-2 z-10">{photo.emoji}</span>
                    )}
                    <div className="z-10 bg-[#1e2235]/60 backdrop-blur-md p-2 rounded-lg mt-auto mb-2 text-center w-full">
                      <p className="text-sm font-medium truncate" style={{color:'#e2e8f0'}}>{photo.caption}</p>
                      <p className="text-xs mt-1 truncate" style={{color:'#7f849c'}}>by {photo.uploader}</p>
                    </div>
                  </div>
                </div>
              ))}
              </div>
            </div>
          </div>
        )}

        {/* Polaroid View */}
        {viewMode === 'polaroid' && (
          <div className="flex justify-center">
            <div className="max-w-6xl w-full">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 justify-items-center">
                {photos.map((photo, index) => (
                <div key={photo.id} className="relative w-full max-w-[240px]"
                  style={{animation:`float 3s ease-in-out infinite`, animationDelay:`${index * 0.5}s`}}>
                  <div className="nm-card p-3 transform rotate-3 hover:rotate-0 transition-transform">
                    <div className="nm-inset aspect-square rounded-xl flex items-center justify-center mb-2 overflow-hidden relative">
                      {photo.url ? (
                        photo.type === 'video' ? (
                          <video src={photo.url} className="w-full h-full object-cover" autoPlay muted loop playsInline />
                        ) : (
                          <img src={photo.url} className="w-full h-full object-cover" alt="Upload" />
                        )
                      ) : (
                         <span className="text-5xl">{photo.emoji}</span>
                      )}
                    </div>
                    <p className="text-xs text-center font-medium" style={{color:'#e2e8f0'}}>{photo.caption}</p>
                  </div>
                </div>
              ))}
              </div>
            </div>
          </div>
        )}

        {/* Slideshow View */}
        {viewMode === 'slideshow' && photos.length > 0 && (
          <div className="flex justify-center">
            <div className="max-w-4xl w-full">
              <div className="nm-card relative overflow-hidden" style={{aspectRatio:'16/9'}}>
                <div className="flex items-center justify-center h-full relative">
                  {photos[currentSlide].url ? (
                    photos[currentSlide].type === 'video' ? (
                      <video src={photos[currentSlide].url} className="w-full h-full object-contain absolute" autoPlay muted loop playsInline />
                    ) : (
                      <img src={photos[currentSlide].url} className="w-full h-full object-contain absolute" alt="Upload" />
                    )
                  ) : (
                     <span className="text-8xl">{photos[currentSlide].emoji}</span>
                  )}
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6 z-10" style={{background:'linear-gradient(to top, #14182a, transparent)'}}>
                  <h3 className="text-xl font-semibold drop-shadow-lg" style={{color:'#e2e8f0'}}>{photos[currentSlide].caption}</h3>
                  <p className="text-sm drop-shadow-md" style={{color:'#f59e0b'}}>by {photos[currentSlide].uploader}</p>
                </div>
                <button onClick={() => setIsPlaying(!isPlaying)}
                  className="nm-circle w-12 h-12 absolute bottom-6 right-6 z-20" style={{color:'#e2e8f0'}}>
                  {isPlaying
                    ? <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                    : <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>}
                </button>
              </div>
              <div className="flex justify-center gap-2 mt-4 flex-wrap px-4">
                {photos.map((_, index) => (
                  <button key={index} onClick={() => setCurrentSlide(index)}
                    className="w-2 h-2 rounded-full transition-all flex-shrink-0"
                    style={{background: index === currentSlide ? '#f59e0b' : '#252c46'}} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(3deg); }
          50% { transform: translateY(-10px) rotate(-2deg); }
        }
      `}</style>
    </div>
  );
}
