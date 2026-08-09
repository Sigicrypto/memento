"use client";

import React from 'react';
import { motion } from 'framer-motion';

export const BackgroundBeams = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* SVG Radial Dot Grid Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.15] pointer-events-none" 
        style={{
          backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.2) 1px, transparent 1px)`,
          backgroundSize: '32px 32px'
        }} 
      />

      {/* Line Grid Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.05] pointer-events-none" 
        style={{
          backgroundImage: `linear-gradient(to right, rgba(255, 255, 255, 0.15) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.15) 1px, transparent 1px)`,
          backgroundSize: '64px 64px'
        }} 
      />

      {/* Floating Cyan Ambient Glow */}
      <motion.div
        animate={{
          transform: [
            "translateY(0px) translateX(0px)",
            "translateY(-30px) translateX(30px)",
            "translateY(0px) translateX(0px)",
          ],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        className="absolute top-1/4 left-1/3 w-[650px] h-[650px] bg-cyan-500/10 blur-[140px] rounded-full pointer-events-none"
      />

      {/* Floating Purple Ambient Glow */}
      <motion.div
        animate={{
          transform: [
            "translateY(0px) translateX(0px)",
            "translateY(30px) translateX(-30px)",
            "translateY(0px) translateX(0px)",
          ],
        }}
        transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
        className="absolute top-1/2 right-1/4 w-[500px] h-[500px] bg-purple-500/10 blur-[130px] rounded-full pointer-events-none"
      />
    </div>
  );
};
