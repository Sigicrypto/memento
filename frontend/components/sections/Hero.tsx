"use client";

import React from "react";
import { ArrowRight, Play, Shield, Smartphone, Radio, Check, QrCode } from "lucide-react";
import { useAuthModal } from "@/context/AuthModalContext";

interface HeroProps {
  setIsDemoOpen: (val: boolean) => void;
}

export default function Hero({ setIsDemoOpen }: HeroProps) {
  const { openAuth } = useAuthModal();

  return (
    <section className="relative overflow-hidden w-full flex flex-col items-center text-center pt-32 sm:pt-40 pb-20 md:pb-28 px-4 md:px-8 bg-bg animate-fade-in">
      <div className="max-w-5xl w-full mx-auto flex flex-col items-center text-center">
        
        {/* Eyebrow pill */}
        <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-accent/10 text-accent text-xs sm:text-sm font-mono font-bold tracking-wider uppercase mb-6 mx-auto">
          QR-POWERED LIVE PHOTO SHARING
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-[1.1] tracking-tight text-text-primary font-display mb-6 max-w-4xl mx-auto">
          Turn Every Guest's Phone Into Your Event Camera
        </h1>

        {/* Subheadline */}
        <p className="text-text-secondary text-lg sm:text-xl font-medium leading-relaxed max-w-2xl mx-auto mb-10">
          Guests scan a QR code, capture moments in their browser, and every photo appears live on your venue screen — in seconds. No app. No login. Just memories.
        </p>

        {/* CTA buttons row */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto mb-10 mx-auto">
          <button
            onClick={() => openAuth("signup")}
            className="w-full sm:w-auto px-8 py-4 rounded-full bg-accent text-white font-bold text-sm sm:text-base tracking-wide hover:bg-[#D9932B] active:scale-95 transition-all shadow-[0_2px_8px_rgba(242,169,59,0.3)] hover:shadow-[0_4px_16px_rgba(242,169,59,0.4)] flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Create Your Free Event</span>
            <ArrowRight size={18} />
          </button>

          <button
            onClick={() => setIsDemoOpen(true)}
            className="w-full sm:w-auto px-8 py-4 rounded-full border-2 border-border text-text-primary font-bold text-sm sm:text-base tracking-wide hover:border-accent hover:text-accent active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play size={16} className="fill-current" />
            <span>Try Live Demo</span>
          </button>
        </div>

        {/* Trust strip */}
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs sm:text-sm text-text-secondary font-medium mx-auto mb-14">
          <span className="flex items-center gap-1.5">
            <Shield size={14} className="text-accent" /> Private & Secure
          </span>
          <span className="text-border hidden sm:inline">·</span>
          <span className="flex items-center gap-1.5">
            <Smartphone size={14} className="text-accent" /> No App Required
          </span>
          <span className="text-border hidden sm:inline">·</span>
          <span className="flex items-center gap-1.5">
            <Check size={14} className="text-accent" /> Works on Any Phone
          </span>
          <span className="text-border hidden sm:inline">·</span>
          <span className="flex items-center gap-1.5">
            <Radio size={14} className="text-accent" /> Real-Time Sync
          </span>
        </div>

        {/* Centerpiece: Sleek Device & Live Wall Composite */}
        <div className="w-full max-w-3xl mx-auto flex justify-center relative">
          {/* Ambient Glow */}
          <div className="absolute -inset-4 bg-gradient-to-tr from-accent/10 via-primary/5 to-transparent rounded-3xl filter blur-2xl opacity-70 pointer-events-none" />

          {/* Main TV Screen Frame */}
          <div className="relative w-full rounded-2xl bg-neutral-900 border border-neutral-800 shadow-2xl p-2.5 sm:p-3 text-white overflow-hidden transform hover:scale-[1.01] transition-transform duration-300">
            {/* TV Bezel Header */}
            <div className="flex items-center justify-between px-3 py-2 bg-neutral-950/80 rounded-t-xl border-b border-neutral-800/80 mb-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[11px] font-mono font-bold tracking-widest text-white uppercase">
                  MEMENTO LIVE
                </span>
              </div>
              <div className="text-[11px] text-neutral-400 font-medium">Priya & Arjun's Reception</div>
              <div className="text-[10px] text-accent font-bold px-2 py-0.5 rounded-full bg-accent/10 border border-accent/20">
                184 Guests Online
              </div>
            </div>

            {/* Photo Grid Preview */}
            <div className="grid grid-cols-3 gap-2 p-1.5 aspect-[16/10] bg-neutral-950 rounded-lg overflow-hidden">
              <div className="rounded-lg bg-gradient-to-br from-amber-200 via-rose-200 to-pink-300 shadow-inner flex items-end p-2 relative overflow-hidden group">
                <span className="text-[9px] font-bold text-neutral-900 bg-white/90 px-1.5 py-0.5 rounded">Aunt Neha</span>
              </div>
              <div className="rounded-lg bg-gradient-to-bl from-sky-200 via-indigo-200 to-purple-300 shadow-inner col-span-2 row-span-2 flex items-end p-3 relative overflow-hidden">
                <div className="absolute top-2 right-2 bg-green-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                  Just Shared (1s ago)
                </div>
                <span className="text-[10px] font-bold text-neutral-900 bg-white/95 px-2 py-0.5 rounded shadow-sm">
                  First Dance 💍
                </span>
              </div>
              <div className="rounded-lg bg-gradient-to-tr from-emerald-200 to-teal-300 shadow-inner flex items-end p-2">
                <span className="text-[9px] font-bold text-neutral-900 bg-white/90 px-1.5 py-0.5 rounded">Rahul & Co.</span>
              </div>
              <div className="rounded-lg bg-gradient-to-tl from-purple-200 to-rose-200 shadow-inner flex items-end p-2">
                <span className="text-[9px] font-bold text-neutral-900 bg-white/90 px-1.5 py-0.5 rounded">Cocktail Hour</span>
              </div>
              <div className="rounded-lg bg-gradient-to-br from-orange-200 to-amber-200 shadow-inner flex items-end p-2">
                <span className="text-[9px] font-bold text-neutral-900 bg-white/90 px-1.5 py-0.5 rounded">Cake Cut ✨</span>
              </div>
              <div className="rounded-lg bg-gradient-to-bl from-cyan-200 to-blue-200 shadow-inner flex items-end p-2">
                <span className="text-[9px] font-bold text-neutral-900 bg-white/90 px-1.5 py-0.5 rounded">Dance Floor 🎉</span>
              </div>
            </div>

            {/* Bottom Bar: Live Wall White-Label */}
            <div className="mt-2 py-1.5 px-3 rounded-lg bg-neutral-950 border border-neutral-800/80 flex items-center justify-between text-[10px]">
              <span className="text-neutral-400">Scan table QR codes to appear on screen</span>
              <span className="text-accent font-bold">Royal Moments Studio</span>
            </div>
          </div>

          {/* Overlapping Floating Phone Mockup */}
          <div className="absolute -bottom-6 -left-4 sm:-left-8 w-36 sm:w-44 rounded-2xl bg-white border-2 border-slate-200 shadow-2xl p-2 text-neutral-900 transform -rotate-3 hover:rotate-0 transition-transform">
            <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mb-2" />
            <div className="rounded-xl border border-dashed border-accent p-2 sm:p-3 text-center bg-amber-50/50">
              <QrCode className="w-8 h-8 sm:w-10 sm:h-10 mx-auto text-neutral-800 mb-1" />
              <p className="text-[8px] sm:text-[9px] font-bold text-neutral-800">Scan & Snap</p>
              <p className="text-[6px] sm:text-[7px] text-neutral-500">No app download</p>
            </div>
            <div className="mt-2 flex items-center justify-center gap-1 text-[7px] sm:text-[8px] font-bold text-green-600 bg-green-50 py-1 rounded-lg">
              <Check size={10} /> Photo Uploaded
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
