"use client";

import React, { useRef } from "react";
import { Play, ArrowRight, Smartphone, Zap, Lock, Camera, Sparkles } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useAuthModal } from "@/context/AuthModalContext";

interface HeroProps {
  setIsDemoOpen: (val: boolean) => void;
}

export default function Hero({ setIsDemoOpen }: HeroProps) {
  const { openAuth } = useAuthModal();
  const containerRef = useRef<HTMLDivElement>(null);

  // Parallax scroll effects (desktop only)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const yCenter = useTransform(scrollYProgress, [0, 1], [0, 40]);
  const yUpper = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const yLower = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0.2]);

  const words = "Add a Live Photo Wall to Every Wedding You Shoot.".split(" ");

  return (
    <section
      ref={containerRef}
      className="relative w-full overflow-hidden bg-[#040C1A] text-white pt-24 sm:pt-32 pb-16 sm:pb-24 px-4 sm:px-8 lg:px-14 border-b border-slate-800/60"
    >
      {/* Subtle Luxury Ambient Background Gradients */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none opacity-40" />

      <div className="max-w-7xl mx-auto w-full relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
        {/* Left Column: Editorial Headline, Supporting Copy, and CTAs (Fully Centered) */}
        <div className="lg:col-span-6 flex flex-col items-center text-center mx-auto">
          
          {/* Eyebrow Pill Badge */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/15 text-amber-300 text-xs font-bold tracking-[0.15em] uppercase mb-6 backdrop-blur-sm mx-auto"
          >
            <Sparkles size={13} className="text-amber-400" />
            <span>Live Wedding &amp; Event Photo Sharing</span>
          </motion.div>

          {/* Headline H1 with Word-by-Word Reveal */}
          <h1 className="font-serif text-3xl sm:text-5xl lg:text-[54px] font-bold leading-[1.12] tracking-tight text-white mb-6 text-center mx-auto">
            {words.map((word, idx) => (
              <motion.span
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.08 + idx * 0.035 }}
                className={`inline-block mr-2.5 ${
                  word.includes("Live") || word.includes("Photo") || word.includes("Wall")
                    ? "text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-200 to-amber-400 font-extrabold"
                    : ""
                }`}
              >
                {word}
              </motion.span>
            ))}
          </h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="text-slate-300 text-sm sm:text-base lg:text-lg leading-relaxed max-w-xl mb-8 font-normal mx-auto text-center"
          >
            Give your couples every candid moment your camera crew can&apos;t capture. Guests scan your branded QR code, share their photos, and watch them appear live on the venue screen.
            <span className="block mt-2 text-slate-400 text-xs sm:text-sm font-medium">
              Zero apps for guests to download · Zero logins · 100% private.
            </span>
          </motion.p>

          {/* CTAs Row — Try Live Demo (Primary) & Add to Studio (Secondary) */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.45 }}
            className="flex flex-wrap items-center justify-center gap-3.5 mb-5 w-full sm:w-auto"
          >
            <button
              onClick={() => setIsDemoOpen(true)}
              className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-gradient-to-r from-amber-400 to-[#E5A93C] hover:from-amber-500 hover:to-[#D9932B] text-slate-950 font-bold text-sm sm:text-base shadow-lg hover:shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <Play size={16} className="fill-slate-950 text-slate-950" />
              <span>Try the Live Demo</span>
            </button>

            <button
              onClick={() => openAuth("signup")}
              className="w-full sm:w-auto px-7 py-3.5 rounded-full border border-white/30 hover:border-white hover:bg-white/10 text-white font-semibold text-sm sm:text-base active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer backdrop-blur-sm"
            >
              <span>Add Memento to Your Studio</span>
              <ArrowRight size={16} />
            </button>
          </motion.div>

          {/* Secondary Studio Partner Link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.55 }}
            className="mb-8 flex items-center justify-center gap-2 text-xs sm:text-sm text-slate-400"
          >
            <Camera size={15} className="text-amber-400 shrink-0" />
            <span>Are you a photographer or studio?</span>
            <a
              href="/photographers"
              className="text-amber-400 hover:text-amber-300 font-semibold underline underline-offset-4 decoration-amber-400/50 hover:decoration-amber-300 transition-colors"
            >
              Explore Studio Benefits &rarr;
            </a>
          </motion.div>

          {/* 4 Feature Badges (Centered) */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.65 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-5 pt-6 border-t border-white/10 w-full text-center"
          >
            <div className="flex flex-col items-center text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Smartphone size={16} className="text-amber-400 shrink-0" />
                <span className="text-xs font-semibold text-white">0 App Installs</span>
              </div>
              <span className="text-[11px] text-slate-400 leading-tight">Instant browser camera</span>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Zap size={16} className="text-amber-400 shrink-0" />
                <span className="text-xs font-semibold text-white">&lt; 2s Screen Sync</span>
              </div>
              <span className="text-[11px] text-slate-400 leading-tight">Real-time venue stream</span>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Camera size={16} className="text-amber-400 shrink-0" />
                <span className="text-xs font-semibold text-white">DSLR + Candids</span>
              </div>
              <span className="text-[11px] text-slate-400 leading-tight">Pro camera ingestion</span>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Lock size={16} className="text-amber-400 shrink-0" />
                <span className="text-xs font-semibold text-white">100% Private QR</span>
              </div>
              <span className="text-[11px] text-slate-400 leading-tight">Never indexed on web</span>
            </div>
          </motion.div>
        </div>

        {/* Right Column: Parallax Cinematic Photography Experience */}
        <div className="lg:col-span-6 relative w-full flex items-center justify-center">
          
          {/* Desktop Parallax Multi-Card Composition */}
          <motion.div
            style={{ opacity }}
            className="hidden sm:block relative w-full h-[520px] max-w-lg mx-auto"
          >
            {/* Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/20 via-blue-500/15 to-purple-500/10 rounded-3xl filter blur-2xl pointer-events-none" />

            {/* Card 1 (Center / Main): First Dance Reception Venue Screen */}
            <motion.div
              style={{ y: yCenter }}
              className="absolute left-6 top-8 w-[82%] aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border border-white/20 z-20 bg-slate-900 group"
            >
              <img
                src="/landing-hero/photo1.jpg"
                alt="Wedding couple first dance displayed live on venue screen"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              
              {/* Live Ticker Bar */}
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-full bg-red-500/90 text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow">
                  <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                  LIVE DEMO — SAMPLE EVENT
                </span>
                <span className="text-[11px] text-white/90 font-medium bg-black/50 backdrop-blur-sm px-2.5 py-1 rounded-full border border-white/10">
                  Priya &amp; Rohan
                </span>
              </div>

              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white">
                <span className="font-semibold text-white/95">First Dance under the fairy lights ✨</span>
                <span className="text-amber-300 font-mono text-[11px]">Just now</span>
              </div>
            </motion.div>

            {/* Card 2 (Floating Top Right): Joyful Couple Emotion */}
            <motion.div
              style={{ y: yUpper }}
              className="absolute right-0 top-0 w-[48%] aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border-2 border-amber-400/40 z-30 bg-slate-950"
            >
              <img
                src="/landing-hero/photo2.jpg"
                alt="Joyful laughter candid moment"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <div className="absolute bottom-2 left-2.5 text-[10px] font-semibold text-amber-300 flex items-center gap-1">
                <span>✨ Guest Snapshot</span>
                <span className="text-white/60">· 4s ago</span>
              </div>
            </motion.div>

            {/* Card 3 (Floating Bottom Left): Dance Floor Energy */}
            <motion.div
              style={{ y: yLower }}
              className="absolute left-0 bottom-4 w-[52%] aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border border-white/20 z-30 bg-slate-950"
            >
              <img
                src="/landing-hero/photo7.jpg"
                alt="Late night dance floor guest candids"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-[10px] text-white font-medium">
                <span className="truncate">Dance floor celebration 💃</span>
                <span className="text-amber-300 shrink-0 font-mono">Table 6</span>
              </div>
            </motion.div>

            {/* Floating Live Badge */}
            <div className="absolute -bottom-2 right-6 z-40 px-3.5 py-1.5 rounded-full bg-slate-900/95 border border-amber-400/40 text-white text-xs font-bold shadow-xl flex items-center gap-2 backdrop-blur-md">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>184 Photos Uploaded Live</span>
            </div>
          </motion.div>

          {/* Mobile Layered Photographic Cascade View (Smooth, Zero Lag) */}
          <div className="sm:hidden w-full flex flex-col items-center relative pt-2 pb-1">
            {/* Ambient Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/15 via-blue-500/10 to-transparent rounded-3xl filter blur-xl pointer-events-none" />

            {/* Cascade Layer 1: Venue Screen Main Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border border-white/20 relative bg-slate-900 z-10"
            >
              <img
                src="/landing-hero/photo1.jpg"
                alt="Wedding couple live on venue screen"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              
              <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
                <span className="px-2 py-0.5 rounded-full bg-red-500 text-white text-[9px] font-bold uppercase tracking-wider flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                  LIVE DEMO — SAMPLE EVENT
                </span>
                <span className="text-[10px] text-white/90 font-medium bg-black/60 px-2 py-0.5 rounded-full">
                  Priya &amp; Rohan
                </span>
              </div>

              <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-xs text-white">
                <span className="font-semibold text-xs truncate mr-2">First Dance under fairy lights ✨</span>
                <span className="text-amber-300 font-mono text-[10px] shrink-0">Live</span>
              </div>
            </motion.div>

            {/* Cascade Layer 2: Overlapping Floating Guest Candid Snap (Staggered Entry) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.35 }}
              className="-mt-12 ml-auto mr-2 w-7/12 aspect-[4/3] rounded-xl overflow-hidden shadow-2xl border-2 border-amber-400/50 bg-slate-950 relative z-20"
            >
              <img
                src="/landing-hero/photo2.jpg"
                alt="Joyful altar candid moment"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
              <div className="absolute bottom-1.5 left-2 right-2 flex items-center justify-between text-[9px] font-semibold text-amber-300">
                <span>✨ Guest Snap</span>
                <span className="text-white/70 font-mono">4s ago</span>
              </div>
            </motion.div>

            {/* Cascade Layer 3: Interactive Live Status & Demo Link */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.5 }}
              className="mt-3 flex items-center justify-between w-full px-1 text-[11px] text-slate-300 relative z-30"
            >
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>184 Photos · &lt; 2s Sync</span>
              </span>
              <button
                onClick={() => setIsDemoOpen(true)}
                className="text-amber-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Launch Demo</span> &rarr;
              </button>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
