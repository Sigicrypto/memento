"use client";

import React from "react";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Play, Shield, Smartphone } from "lucide-react";
import { useAuthModal } from "@/context/AuthModalContext";

interface HeroProps {
  setIsDemoOpen: (val: boolean) => void;
}

export default function Hero({ setIsDemoOpen }: HeroProps) {
  const { openAuth } = useAuthModal();

  return (
    <section className="relative overflow-hidden w-full flex flex-col items-center pt-28 sm:pt-36 pb-16 md:pb-24 px-4 md:px-8 bg-slate-950 text-white">
      {/* Ambient background glows */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(750px,90vw)] h-[min(750px,90vw)] bg-gradient-to-tr from-cyan-500/20 via-purple-500/20 to-amber-500/10 blur-[140px] rounded-full pointer-events-none" />

      <div className="max-w-7xl w-full mx-auto flex flex-col items-center text-center relative z-10">
        
        {/* Category Pill */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs sm:text-sm font-extrabold tracking-wider uppercase mb-6 shadow-[0_0_20px_rgba(6,182,212,0.15)]"
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>The Live Memory Experience for Events</span>
        </motion.div>

        {/* Hero Headline - Expanded Horizontal Width */}
        <motion.h1
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-4xl sm:text-6xl md:text-7xl font-black leading-[1.1] tracking-tight text-white w-full max-w-6xl"
        >
          Every Guest. Every Moment. <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-amber-400 bg-clip-text text-transparent">
            One Living Memory.
          </span>
        </motion.h1>

        {/* Supporting Copy */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-slate-300 max-w-2xl text-base sm:text-lg md:text-xl font-medium mt-6 leading-relaxed"
        >
          Let everyone at your event capture the moments you couldn't. No app. No login. Just scan, capture and share.
        </motion.p>

        {/* CTA Buttons & Trust Tagline Container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="flex flex-col items-center justify-center gap-10 sm:gap-14 mt-10 w-full"
        >
          {/* CTA Buttons Row */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
            <button
              onClick={() => openAuth("signup")}
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-extrabold text-sm sm:text-base tracking-wide shadow-[0_0_30px_rgba(6,182,212,0.4)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <span>Create Your Event</span>
              <ArrowRight size={18} />
            </button>

            <button
              onClick={() => setIsDemoOpen(true)}
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-white/10 hover:bg-white/15 border border-white/20 text-white font-extrabold text-sm sm:text-base tracking-wide hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <Play size={16} className="fill-white text-white" />
              <span>Try Live Demo</span>
            </button>
          </div>

          {/* Trust Tagline Backdrop Pill */}
          <div className="flex items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-slate-300 font-mono px-6 py-3 rounded-full bg-slate-900/90 border border-white/15 backdrop-blur-md shadow-2xl">
            <span className="flex items-center gap-1.5">
              <Smartphone size={14} className="text-cyan-400" /> No app required
            </span>
            <span className="text-slate-600">·</span>
            <span className="flex items-center gap-1.5">
              <Shield size={14} className="text-emerald-400" /> Private
            </span>
            <span className="text-slate-600">·</span>
            <span>Works on any phone</span>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
