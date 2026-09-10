"use client";

import React from "react";
import { Play, Smartphone, UserCheck, Zap, Lock } from "lucide-react";
import Image from "next/image";

interface HeroProps {
  setIsDemoOpen: (val: boolean) => void;
}

export default function Hero({ setIsDemoOpen }: HeroProps) {
  const trustFeatures = [
    {
      icon: Smartphone,
      line1: "No App",
      line2: "Required",
    },
    {
      icon: UserCheck,
      line1: "No Login",
      line2: "Needed",
    },
    {
      icon: Zap,
      line1: "Works on",
      line2: "Any Phone",
    },
    {
      icon: Lock,
      line1: "100% Private",
      line2: "& Secure",
    },
  ];

  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-b from-[#030F22] via-[#061B37] to-[#0A2540] text-white pt-28 sm:pt-36 pb-16 md:pb-24 px-4 sm:px-6 lg:px-10">
      {/* Warm Ambient Glow Effects */}
      <div className="absolute top-1/4 left-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center relative z-10">
        
        {/* Left Column: Headline, Copy & CTAs */}
        <div className="lg:col-span-7 flex flex-col items-start text-left">
          
          {/* Eyebrow */}
          <div className="text-amber-400 font-bold text-xs sm:text-sm tracking-[0.2em] uppercase mb-4">
            TURN MOMENTS INTO MEMORIES
          </div>

          {/* Headline H1 (Serif font matching mockup) */}
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-[64px] font-bold leading-[1.08] tracking-tight text-white mb-6">
            Every Guest.<br />
            Every Moment.<br />
            <span className="relative inline-flex items-center text-amber-400">
              Live.
              {/* Decorative Underline flourish */}
              <svg
                className="absolute -bottom-2.5 left-0 w-full h-3 text-amber-400/90"
                viewBox="0 0 120 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2 9C35 3 85 3 118 9"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
              {/* Floating Heart */}
              <span className="ml-3 text-2xl sm:text-3xl font-light text-amber-300 transform -rotate-12 select-none">
                ♡
              </span>
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-slate-200 text-sm sm:text-base md:text-[17px] leading-relaxed max-w-xl mb-8 font-normal">
            Guests scan a QR code, capture and share their photos from their phones. Watch them appear live on the big screen and keep them forever in a private gallery.
          </p>

          {/* CTA Buttons Row */}
          <div className="flex flex-wrap items-center gap-4 mb-10 w-full sm:w-auto">
            <button
              onClick={() => setIsDemoOpen(true)}
              className="px-7 py-3.5 rounded-full bg-gradient-to-r from-amber-400 to-[#E5A93C] hover:from-amber-500 hover:to-[#D9932B] text-slate-950 font-bold text-sm sm:text-base shadow-lg hover:shadow-amber-500/20 active:scale-95 transition-all flex items-center gap-2.5 cursor-pointer"
            >
              <Play size={16} className="fill-slate-950 text-slate-950" />
              <span>Try Live Demo</span>
            </button>

            <a
              href="#how-it-works"
              className="px-7 py-3.5 rounded-full border border-white/60 hover:border-white hover:bg-white/10 text-white font-semibold text-sm sm:text-base active:scale-95 transition-all cursor-pointer"
            >
              How It Works
            </a>
          </div>

          {/* 4 Trust Strip Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 pt-6 border-t border-white/10 w-full max-w-xl">
            {trustFeatures.map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={index} className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-amber-400">
                    <Icon size={16} />
                  </div>
                  <div className="text-[11px] sm:text-xs leading-tight font-medium text-slate-300">
                    <div>{item.line1}</div>
                    <div className="text-white font-semibold">{item.line2}</div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* Right Column: Visual of Reception Couple + Live Photo Wall TV + Table QR */}
        <div className="lg:col-span-5 flex items-center justify-center relative">
          <div className="relative w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-white/15 bg-[#071E3D] group">
            
            {/* Mockup Scene Image */}
            <div className="relative aspect-[4/3] sm:aspect-[1.35] w-full overflow-hidden">
              <img
                src="/mockup-assets/hero-scene.jpg"
                alt="Live photo sharing on venue screen at wedding reception"
                className="w-full h-full object-cover object-center transform group-hover:scale-[1.02] transition-transform duration-500"
              />
              {/* Subtle Gradient vignette */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
            </div>

            {/* Floating script callout over image */}
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-white/90 pointer-events-none">
              <span className="font-serif italic text-amber-200/90 text-sm drop-shadow-sm">
                Moments Bring People Together ♡
              </span>
              <span className="bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-mono border border-white/20">
                Live Reception Wall
              </span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
