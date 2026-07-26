"use client";

import React, { useEffect, useRef } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';
import { Play, ArrowRight, ScanLine } from 'lucide-react';
import Corners from '@/components/Corners';
import { cn } from '@/lib/utils';

// Aceternity Background Beams (Minimalist Version)
const BackgroundBeams = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]">
      <div className="absolute inset-0 bg-[url('https://ui.aceternity.com/_next/static/media/grid.864c0920.svg')] opacity-[0.03] bg-center [mask-image:linear-gradient(to_bottom,white,transparent)]" />
      <div className="absolute w-full h-full">
        <motion.div
          animate={{
            transform: [
              "translateY(0px) translateX(0px)",
              "translateY(-20px) translateX(20px)",
              "translateY(0px) translateX(0px)",
            ],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute -top-1/2 left-1/2 w-[600px] h-[600px] bg-accent-cyan/10 blur-[100px] rounded-full pointer-events-none mix-blend-screen"
        />
        <motion.div
          animate={{
            transform: [
              "translateY(0px) translateX(0px)",
              "translateY(20px) translateX(-20px)",
              "translateY(0px) translateX(0px)",
            ],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute -top-1/2 right-1/4 w-[400px] h-[400px] bg-accent-indigo/10 blur-[80px] rounded-full pointer-events-none mix-blend-screen"
        />
      </div>
    </div>
  );
};

// Magic UI Shine Button
const ShineButton = ({ children, onClick, className }: any) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative overflow-hidden group inline-flex items-center justify-center px-8 py-3",
        "bg-white text-black rounded-lg font-medium tracking-tight transition-all",
        "hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] active:scale-[0.98]",
        className
      )}
    >
      <span className="relative z-10 flex items-center gap-2">{children}</span>
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover:animate-shimmer" />
    </button>
  );
};

interface HeroProps {
  setIsDemoOpen: (open: boolean) => void;
}

const Hero: React.FC<HeroProps> = ({ setIsDemoOpen }) => {
  return (
    <section className="relative overflow-hidden bg-bg" style={{ paddingTop: '160px', paddingBottom: '120px' }}>
      <BackgroundBeams />
      <div className="container relative z-10 flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-3xl"
        >
          <div className="hero-badge mb-6">Live &middot; QR Photo Capture</div>

          <h1 className="display-text mb-6">
            Collect Every Moment.
            <br />
            <span className="hero-title-accent text-gradient">Instantly. Effortlessly.</span>
          </h1>
          <p className="text-lg text-text-secondary mb-10 max-w-xl mx-auto leading-relaxed">
            The minimal QR-based photo sharing platform for modern events. No apps required, zero hassle. A premium experience for your guests.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
            <ShineButton onClick={() => setIsDemoOpen(true)}>
              <span>Watch Demo Wall</span>
              <Play size={16} className="fill-current" />
            </ShineButton>
            <button className="relative group inline-flex items-center justify-center px-8 py-3 font-medium text-text-secondary hover:text-text-primary transition-colors">
              How it works 
              <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
              <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-text-primary/20 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
            </button>
          </div>
        </motion.div>

        {/* Hero Visuals — Live Viewfinder Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="mt-20 relative w-full max-w-4xl mx-auto"
        >
          <div className="viewfinder card p-2 rounded-2xl overflow-hidden shadow-2xl bg-bg-subtle border border-border">
            <Corners />
            <div className="h-10 border-b border-border flex items-center px-4 gap-3 bg-surface">
              <div className="flex items-center gap-1.5 text-accent-cyan">
                <ScanLine size={13} strokeWidth={2} />
                <span className="live-pulse" />
              </div>
              <div className="mx-auto w-52 h-5 bg-bg-subtle border border-border rounded-md flex items-center justify-center">
                <span className="font-mono-ui text-[9px] text-text-muted tracking-wide">memento.live/demo</span>
              </div>
              <span className="font-mono-ui text-[9px] text-accent-cyan tracking-wider hidden sm:inline">REC</span>
            </div>
            <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4 bg-bg">
              {[
                { name: "Alex K.", color: "from-pink-500/20 via-rose-500/25 to-zinc-900/10", likes: 12 },
                { name: "Jessica M.", color: "from-blue-600/20 via-indigo-500/25 to-zinc-900/10", likes: 8 },
                { name: "Ryan T.", color: "from-amber-400/20 via-orange-500/25 to-zinc-900/10", likes: 15 },
                { name: "Emma W.", color: "from-emerald-400/20 via-teal-500/25 to-zinc-900/10", likes: 21 },
                { name: "Michael S.", color: "from-violet-500/20 via-purple-600/25 to-zinc-900/10", likes: 4 },
                { name: "Sarah L.", color: "from-fuchsia-500/20 via-pink-600/25 to-zinc-900/10", likes: 19 },
                { name: "David P.", color: "from-cyan-500/20 via-blue-500/25 to-zinc-900/10", likes: 11 },
                { name: "Chloe B.", color: "from-rose-400/20 via-orange-400/25 to-zinc-900/10", likes: 14 }
              ].map((card, i) => (
                <div key={i} className="viewfinder aspect-[4/5] bg-surface border border-border rounded-xl overflow-hidden relative group transition-all duration-300 hover:border-border-hover">
                   <Corners />
                   <div className={`w-full h-full bg-gradient-to-tr ${card.color} group-hover:scale-105 transition-transform duration-700`} />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-80" />
                   <div className="absolute bottom-2.5 left-2.5 right-2.5 flex justify-between items-center z-10">
                     <span className="text-[10px] font-medium text-white/90">{card.name}</span>
                     <span className="text-[10px] text-white/80 flex items-center gap-0.5 font-medium">♥ {card.likes}</span>
                   </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
