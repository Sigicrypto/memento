"use client";

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

const BackgroundDecoration = () => {
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 100 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  useEffect(() => {
    setIsClient(true);
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX - window.innerWidth / 2);
      mouseY.set(e.clientY - window.innerHeight / 2);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  const x1 = useTransform(smoothX, [-1000, 1000], [-40, 40]);
  const y1 = useTransform(smoothY, [-1000, 1000], [-40, 40]);
  
  const x2 = useTransform(smoothX, [-1000, 1000], [50, -50]);
  const y2 = useTransform(smoothY, [-1000, 1000], [50, -50]);

  const x3 = useTransform(smoothX, [-1000, 1000], [-60, 60]);
  const y3 = useTransform(smoothY, [-1000, 1000], [60, -60]);

  if (pathname?.startsWith('/wall/') || pathname?.startsWith('/mobile/')) return null;

  return (
    <div style={{ 
      position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none',
      background: '#fafcfe' 
    }}>
      {/* Animated Orbs Wrapped for Parallax */}
      {isClient && (
        <>
          <motion.div style={{ x: x1, y: y1, position: 'absolute', inset: 0 }}>
            <motion.div
              animate={{ x: [0, 100, 0], y: [0, 50, 0], scale: [1, 1.2, 1] }}
              transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
              style={{ 
                position: 'absolute', top: '-15%', left: '-10%', width: '70%', height: '70%', 
                background: 'radial-gradient(circle, rgba(245,158,11,0.25) 0%, transparent 70%)', 
                filter: 'blur(100px)' 
              }}
            />
          </motion.div>
          
          <motion.div style={{ x: x2, y: y2, position: 'absolute', inset: 0 }}>
            <motion.div
              animate={{ x: [0, -80, 0], y: [0, 100, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 2 }}
              style={{ 
                position: 'absolute', bottom: '-20%', right: '-15%', width: '80%', height: '80%', 
                background: 'radial-gradient(circle, rgba(225,29,72,0.2) 0%, transparent 70%)', 
                filter: 'blur(120px)' 
              }}
            />
          </motion.div>
          
          <motion.div style={{ x: x3, y: y3, position: 'absolute', inset: 0 }}>
            <motion.div
              animate={{ x: [0, 50, 0], y: [0, -70, 0], scale: [1, 1.3, 1] }}
              transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 5 }}
              style={{ 
                position: 'absolute', top: '25%', right: '5%', width: '45%', height: '45%', 
                background: 'radial-gradient(circle, rgba(124,58,237,0.23) 0%, transparent 70%)', 
                filter: 'blur(80px)' 
              }}
            />
            {/* New Cyan Orb for extra vibrancy */}
            <motion.div
              animate={{ x: [0, -120, 0], y: [0, -50, 0], scale: [0.8, 1.2, 0.8] }}
              transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 8 }}
              style={{ 
                position: 'absolute', bottom: '10%', left: '10%', width: '40%', height: '40%', 
                background: 'radial-gradient(circle, rgba(6,182,212,0.2) 0%, transparent 70%)', 
                filter: 'blur(90px)' 
              }}
            />
          </motion.div>
        </>
      )}

      {/* Subtle Glass Bottom Fog */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '30%',
        background: 'linear-gradient(to top, rgba(255,255,255,0.7), transparent)',
        backdropFilter: 'blur(20px)'
      }} />
    </div>
  );
};

export default BackgroundDecoration;
