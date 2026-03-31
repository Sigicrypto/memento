"use client";

import React from 'react';

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
  return (
    <div 
      className={`relative inline-flex items-center justify-center overflow-hidden ${className}`}
      style={{ 
        width: width, 
        height: height,
        background: 'transparent',
      }}
    >
      {/* Static PNG Logo */}
      <img 
        src="/CC logo.png" 
        alt="Logo"
        className="absolute inset-0 w-full h-full object-contain"
      />
    </div>
  );
}
