"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';

interface HeroProps {
  setIsDemoOpen: (open: boolean) => void;
}

const Hero: React.FC<HeroProps> = ({ setIsDemoOpen }) => {
  return (
    <section className="relative overflow-hidden min-h-[100vh] flex flex-col items-center justify-center pt-32 pb-20 px-4 sm:px-6 bg-[#050505]">
      
      {/* 3D Perspective Grid Background */}
      <div className="perspective-grid-container">
        <div className="perspective-grid"></div>
        {/* Radial gradient overlay to fade out the edges */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#050505_70%)] z-10 pointer-events-none"></div>
      </div>

      <div className="container relative z-20 mx-auto flex flex-col items-center text-center mt-8">
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-4xl mx-auto flex flex-col items-center"
        >
          <h1 className="text-5xl md:text-7xl lg:text-[80px] font-bold tracking-tight mb-6 leading-[1.1] text-white">
            The <span className="text-neon-pink">Live Photo</span> Wall<br/>
            for Your <span className="text-neon-pink">Event</span>
          </h1>
          <p className="text-lg md:text-xl text-white/60 mb-10 max-w-2xl font-medium">
            Turn your guest photos into a real-time digital gallery instantly. No apps required.
          </p>
        </motion.div>

        {/* Central 3D Scene */}
        <div className="relative w-full max-w-5xl h-[400px] md:h-[500px] mt-4 flex items-center justify-center perspective-[1200px]">
          
          {/* Center QR Code Box */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative z-30 animate-float-3d"
          >
            <div className="p-1 rounded-3xl bg-gradient-neon shadow-[0_0_50px_rgba(255,0,255,0.4)]">
              <div className="bg-[#050505] p-6 rounded-[22px] flex items-center justify-center">
                <QRCodeSVG 
                  value="https://memento.live/demo" 
                  size={160} 
                  fgColor="#ffffff" 
                  bgColor="transparent" 
                />
              </div>
            </div>
          </motion.div>

          {/* Floating Photo 1 (Top Left) */}
          <motion.img 
            initial={{ opacity: 0, x: -100, rotateY: 45 }}
            animate={{ opacity: 1, x: 0, rotateY: 35 }}
            transition={{ duration: 1, delay: 0.4 }}
            src="https://images.unsplash.com/photo-1511593358241-7eea1f3c84e5?auto=format&fit=crop&q=80&w=400"
            className="absolute top-4 md:top-12 left-4 md:left-[10%] w-[140px] md:w-[220px] rounded-xl shadow-[0_0_30px_rgba(100,50,255,0.3)] border border-white/10 opacity-80"
            style={{ transform: 'rotateY(35deg) rotateZ(-5deg)' }}
            alt="Event 1"
          />

          {/* Floating Photo 2 (Bottom Left) */}
          <motion.img 
            initial={{ opacity: 0, x: -100, rotateY: 45 }}
            animate={{ opacity: 1, x: 0, rotateY: 25 }}
            transition={{ duration: 1, delay: 0.6 }}
            src="https://images.unsplash.com/photo-1533174000288-4971b50fda7b?auto=format&fit=crop&q=80&w=400"
            className="absolute bottom-4 md:bottom-12 left-12 md:left-[18%] w-[160px] md:w-[260px] rounded-xl shadow-[0_0_30px_rgba(255,50,150,0.3)] border border-white/10 opacity-90 animate-float-3d"
            style={{ transform: 'rotateY(25deg) rotateZ(5deg)', animationDelay: '1s' }}
            alt="Event 2"
          />

          {/* Floating Photo 3 (Top Right) */}
          <motion.img 
            initial={{ opacity: 0, x: 100, rotateY: -45 }}
            animate={{ opacity: 1, x: 0, rotateY: -35 }}
            transition={{ duration: 1, delay: 0.5 }}
            src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=400"
            className="absolute top-10 md:top-20 right-4 md:right-[10%] w-[150px] md:w-[240px] rounded-xl shadow-[0_0_30px_rgba(50,150,255,0.3)] border border-white/10 opacity-85"
            style={{ transform: 'rotateY(-35deg) rotateZ(8deg)' }}
            alt="Event 3"
          />

          {/* Floating Photo 4 (Bottom Right) */}
          <motion.img 
            initial={{ opacity: 0, x: 100, rotateY: -45 }}
            animate={{ opacity: 1, x: 0, rotateY: -25 }}
            transition={{ duration: 1, delay: 0.7 }}
            src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=400"
            className="absolute bottom-10 md:bottom-20 right-12 md:right-[15%] w-[140px] md:w-[200px] rounded-xl shadow-[0_0_30px_rgba(255,100,255,0.3)] border border-white/10 opacity-80 animate-float-3d"
            style={{ transform: 'rotateY(-25deg) rotateZ(-4deg)', animationDelay: '2s' }}
            alt="Event 4"
          />
        </div>

        {/* Action Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8"
        >
          <button 
            onClick={() => setIsDemoOpen(true)}
            className="px-8 py-3 rounded-xl bg-gradient-neon text-white font-semibold text-lg shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-[0_0_30px_rgba(168,85,247,0.6)] hover:scale-105 transition-all"
          >
            Try Demo
          </button>
          <button 
            className="px-8 py-3 rounded-xl bg-transparent border border-white/20 text-white font-semibold text-lg hover:bg-white/10 transition-all"
          >
            Get Started
          </button>
        </motion.div>

      </div>

      {/* Trusted By Section */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
        className="relative z-20 mt-24 mb-8 flex flex-col items-center opacity-60"
      >
        <p className="text-xs text-white/50 mb-4 tracking-widest uppercase">Trusted By</p>
        <div className="flex flex-wrap justify-center gap-8 md:gap-16 items-center filter grayscale contrast-200">
          <div className="text-white font-bold text-xl flex items-center gap-2">
            <div className="w-6 h-6 rounded-full border-2 border-white border-t-transparent animate-spin-slow"></div> Event Partner
          </div>
          <div className="text-white font-bold text-xl flex items-center gap-2">
            <span className="text-2xl">▲</span> events
          </div>
          <div className="text-white font-bold text-xl flex items-center gap-2">
            <span className="text-2xl">❖</span> penter
          </div>
          <div className="text-white font-bold text-xl flex items-center gap-2">
            <span className="text-2xl">◎</span> Event Partner
          </div>
        </div>
      </motion.div>

    </section>
  );
};

export default Hero;
