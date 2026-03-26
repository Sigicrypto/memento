"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import './landing.css';

// Demo photos with different themes
const demoPhotos = [
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
  const [viewMode, setViewMode] = useState<'grid' | 'polaroid' | 'slideshow'>('grid');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [photoCount, setPhotoCount] = useState(demoPhotos.length);

  // Simulate live photo uploads
  useEffect(() => {
    const interval = setInterval(() => {
      setPhotoCount(prev => prev + 1);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  // Slideshow auto-play
  useEffect(() => {
    if (viewMode === 'slideshow' && isPlaying) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % demoPhotos.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [viewMode, isPlaying]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Header */}
      <div className="relative z-10 px-6 py-8">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 text-white/80 hover:text-white transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Back to Memento
          </Link>
          
          <div className="flex items-center gap-6">
            <div className="text-white/70 text-sm">
              <span className="font-semibold text-amber-400">{photoCount}+</span> photos • Live Demo
            </div>
            <Link href="/create" className="px-4 py-2 bg-gradient-to-r from-amber-500 to-rose-500 text-white font-semibold rounded-full hover:from-amber-600 hover:to-rose-600 transition-all">
              Create Your Wall
            </Link>
          </div>
        </div>
      </div>

      {/* Demo Content */}
      <div className="relative z-10 px-6 pb-12">
        <div className="max-w-7xl mx-auto">
          {/* Event Info */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Memento Live Demo</h1>
            <p className="text-white/70 mb-4">Experience a live photo wall in action</p>
            <div className="flex justify-center gap-2">
              <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs rounded-full flex items-center gap-1">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                LIVE
              </span>
              <span className="px-3 py-1 bg-amber-500/20 text-amber-400 text-xs rounded-full">
                Demo Event
              </span>
            </div>
          </div>

          {/* View Mode Controls */}
          <div className="flex justify-center gap-2 mb-8">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-2 rounded-lg transition-all ${
                viewMode === 'grid'
                  ? 'bg-white/20 text-white'
                  : 'bg-white/10 text-white/60 hover:bg-white/15'
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('polaroid')}
              className={`px-4 py-2 rounded-lg transition-all ${
                viewMode === 'polaroid'
                  ? 'bg-white/20 text-white'
                  : 'bg-white/10 text-white/60 hover:bg-white/15'
              }`}
            >
              Polaroid
            </button>
            <button
              onClick={() => setViewMode('slideshow')}
              className={`px-4 py-2 rounded-lg transition-all ${
                viewMode === 'slideshow'
                  ? 'bg-white/20 text-white'
                  : 'bg-white/10 text-white/60 hover:bg-white/15'
              }`}
            >
              Slideshow
            </button>
          </div>

          {/* Photo Display */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {demoPhotos.map((photo) => (
                <div
                  key={photo.id}
                  className="group relative aspect-square bg-white/10 backdrop-blur-md rounded-xl overflow-hidden border border-white/20 hover:bg-white/15 transition-all hover:scale-105"
                  style={{ animationDelay: `${photo.delay}s` }}
                >
                  <div className="flex flex-col items-center justify-center h-full p-4">
                    <span className="text-4xl mb-2">{photo.emoji}</span>
                    <p className="text-white text-sm text-center">{photo.caption}</p>
                    <p className="text-white/60 text-xs mt-1">by {photo.uploader}</p>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>
          )}

          {viewMode === 'polaroid' && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {demoPhotos.map((photo, index) => (
                <div
                  key={photo.id}
                  className="relative group"
                  style={{
                    animation: `float 3s ease-in-out infinite`,
                    animationDelay: `${index * 0.5}s`
                  }}
                >
                  <div className="bg-white p-2 rounded-lg shadow-xl transform rotate-3 hover:rotate-0 transition-transform">
                    <div className="bg-gradient-to-br from-amber-100 to-rose-100 aspect-square rounded flex items-center justify-center mb-2">
                      <span className="text-5xl">{photo.emoji}</span>
                    </div>
                    <p className="text-gray-800 text-xs text-center font-medium">{photo.caption}</p>
                  </div>
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-gray-300 rounded-full" />
                </div>
              ))}
            </div>
          )}

          {viewMode === 'slideshow' && (
            <div className="max-w-4xl mx-auto">
              <div className="relative aspect-video bg-black rounded-xl overflow-hidden">
                <div className="flex items-center justify-center h-full">
                  <span className="text-8xl">{demoPhotos[currentSlide].emoji}</span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                  <h3 className="text-white text-xl font-semibold">{demoPhotos[currentSlide].caption}</h3>
                  <p className="text-white/70">by {demoPhotos[currentSlide].uploader}</p>
                </div>
                
                {/* Controls */}
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="absolute bottom-6 right-6 w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                >
                  {isPlaying ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <rect x="6" y="4" width="4" height="16" />
                      <rect x="14" y="4" width="4" height="16" />
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  )}
                </button>
              </div>
              
              {/* Slide indicators */}
              <div className="flex justify-center gap-2 mt-4">
                {demoPhotos.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentSlide ? 'bg-white' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Upload Simulation */}
          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/20 text-amber-400 rounded-lg">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
              </svg>
              <span className="text-sm">Simulating live uploads every 8 seconds...</span>
            </div>
          </div>
        </div>
      </div>

      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl" />
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
