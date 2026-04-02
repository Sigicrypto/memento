"use client";

import React from 'react';

const BackgroundDecoration = () => (
  <div style={{ position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>
    <div style={{ 
      position: 'absolute', top: '-10%', left: '-10%', width: '50%', height: '50%', 
      background: 'radial-gradient(circle, rgba(245,158,11,0.08) 0%, transparent 70%)', 
      filter: 'blur(60px)' 
    }} />
    <div style={{ 
      position: 'absolute', bottom: '-10%', right: '-10%', width: '60%', height: '60%', 
      background: 'radial-gradient(circle, rgba(244,114,182,0.08) 0%, transparent 70%)', 
      filter: 'blur(80px)' 
    }} />
    <div style={{ 
      position: 'absolute', top: '20%', right: '10%', width: '30%', height: '30%', 
      background: 'radial-gradient(circle, rgba(167,139,250,0.05) 0%, transparent 70%)', 
      filter: 'blur(50px)' 
    }} />
  </div>
);

export default BackgroundDecoration;
