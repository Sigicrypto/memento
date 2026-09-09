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
      className={`relative inline-flex items-center justify-center overflow-hidden rounded-xl bg-[#141210] border border-[#292524] shadow-sm p-1.5 shrink-0 ${className}`}
      style={{ 
        width: width, 
        height: height,
      }}
    >
      {/* Static PNG Logo */}
      <img 
        src="/CC logo.png" 
        alt="Memento Logo"
        className="w-full h-full object-contain"
      />
    </div>
  );
}
