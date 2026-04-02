"use client";

import React from 'react';
import { usePathname } from 'next/navigation';

const BackgroundDecoration = () => {
  const pathname = usePathname();
  
  if (pathname?.startsWith('/wall/') || pathname?.startsWith('/mobile/')) return null;
  
  return (
  <div style={{ 
    position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none',
    background: '#fafcfe' // Explicit light off-white to prevent "grey" look
  }}>
    {/* Amber Glow */}
    <div style={{ 
      position: 'absolute', top: '-15%', left: '-10%', width: '70%', height: '70%', 
      background: 'radial-gradient(circle, rgba(245,158,11,0.12) 0%, transparent 70%)', 
      filter: 'blur(100px)' 
    }} />
    
    {/* Rose Glow */}
    <div style={{ 
      position: 'absolute', bottom: '-20%', right: '-15%', width: '80%', height: '80%', 
      background: 'radial-gradient(circle, rgba(244,114,182,0.12) 0%, transparent 70%)', 
      filter: 'blur(120px)' 
    }} />
    
    {/* Lavender/Purple Glow */}
    <div style={{ 
      position: 'absolute', top: '25%', right: '5%', width: '45%', height: '45%', 
      background: 'radial-gradient(circle, rgba(167,139,250,0.08) 0%, transparent 70%)', 
      filter: 'blur(80px)' 
    }} />
    
    {/* Subtle Glass Bottom Fog */}
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0, height: '30%',
      background: 'linear-gradient(to top, rgba(255,255,255,0.4), transparent)',
      backdropFilter: 'blur(20px)'
    }} />
    </div>
  );
};

export default BackgroundDecoration;
