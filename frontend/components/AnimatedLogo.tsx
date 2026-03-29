"use client";

import { useRef, useState } from 'react';

interface AnimatedLogoProps {
  className?: string;
  width?: number | string;
  height?: number | string;
}

export default function AnimatedLogo({ 
  className = "", 
  width = 180, 
  height = 60 
}: AnimatedLogoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleMouseEnter = () => {
    setIsPlaying(true);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
    }
  };

  const handleMouseLeave = () => {
    setIsPlaying(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  return (
    <div 
      className={`relative inline-flex items-center justify-center overflow-hidden transition-all duration-300 hover:scale-105 ${className}`}
      style={{ 
        width: width, 
        height: height,
        background: 'transparent',
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Static PNG Logo */}
      <img 
        src="/CC logo.png" 
        alt="Logo"
        className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-300 ${isPlaying ? 'opacity-0' : 'opacity-100'}`}
      />

      {/* Animated Video Logo */}
      <video
        ref={videoRef}
        src="/CC logo.mp4"
        muted
        playsInline
        className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-300 ${isPlaying ? 'opacity-100' : 'opacity-0'}`}
      />
    </div>
  );
}
