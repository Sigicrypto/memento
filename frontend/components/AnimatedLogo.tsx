"use client";

import React from 'react';

interface AnimatedLogoProps {
  className?: string;
  width?: number | string;
  height?: number | string;
}

export default function AnimatedLogo({ 
  className = "", 
  width, 
  height = 40 
}: AnimatedLogoProps) {
  return (
    <div 
      className={`inline-flex items-center gap-2.5 shrink-0 select-none ${className}`}
      style={{ height: height }}
    >
      <img 
        src="/memento-camera-logo.png" 
        alt="MyMemento Logo"
        className="h-full w-auto object-contain drop-shadow-sm"
      />
      <div className="flex flex-col text-left">
        <span className="font-serif font-black text-base sm:text-lg tracking-tight leading-none text-current">
          MyMemento
        </span>
        <span className="text-[7.5px] font-bold tracking-[0.16em] uppercase text-amber-500 leading-tight mt-0.5">
          YOUR MOMENTS LIVE FOREVER
        </span>
      </div>
    </div>
  );
}
