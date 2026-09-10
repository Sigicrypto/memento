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
    <section className="relative w-full overflow-hidden bg-[#030F22] text-white pt-10 sm:pt-14 pb-12 sm:pb-16 px-4 sm:px-8 lg:px-14">
      {/* Right Side Visual - Fills the right side seamlessly matching the mockup */}
      <div className="hidden lg:block absolute right-0 top-0 bottom-0 w-[55%] pointer-events-none select-none overflow-hidden">
        <img
          src="/mockup-assets/hero-scene.jpg"
          alt="Live photo sharing on venue screen at wedding reception"
          className="w-full h-full object-cover object-left"
        />
        {/* Smooth Left Gradient Fade so it blends into #030F22 */}
        <div className="absolute inset-y-0 left-0 w-36 bg-gradient-to-r from-[#030F22] to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#030F22] to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto w-full relative z-10 grid grid-cols-1 lg:grid-cols-12 items-center">
        
        {/* Left Column: Headline, Copy & CTAs */}
        <div className="lg:col-span-7 flex flex-col items-start text-left max-w-xl">
          
          {/* Eyebrow */}
          <div className="text-amber-400 font-bold text-xs sm:text-sm tracking-[0.2em] uppercase mb-4">
            TURN MOMENTS INTO MEMORIES
          </div>

          {/* Headline H1 (Serif font matching mockup) */}
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-[60px] font-bold leading-[1.08] tracking-tight text-white mb-6">
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
              <span className="ml-3 text-2xl sm:text-3xl font-light text-amber-300 select-none">
                ♡
              </span>
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-slate-200 text-sm sm:text-base leading-relaxed max-w-lg mb-8 font-normal">
            Guests scan a QR code, capture and share their photos from their phones. Watch them appear live on the big screen and keep them forever in a private gallery.
          </p>

          {/* CTA Buttons Row */}
          <div className="flex flex-wrap items-center gap-3.5 mb-10 w-full sm:w-auto">
            <button
              onClick={() => setIsDemoOpen(true)}
              className="px-6 sm:px-7 py-3 rounded-full bg-gradient-to-r from-amber-400 to-[#E5A93C] hover:from-amber-500 hover:to-[#D9932B] text-slate-950 font-bold text-sm sm:text-base shadow-md hover:shadow-amber-500/20 active:scale-95 transition-all flex items-center gap-2.5 cursor-pointer"
            >
              <Play size={15} className="fill-slate-950 text-slate-950" />
              <span>Try Live Demo</span>
            </button>

            <a
              href="#how-it-works"
              className="px-6 sm:px-7 py-3 rounded-full border border-white/60 hover:border-white hover:bg-white/10 text-white font-semibold text-sm sm:text-base active:scale-95 transition-all cursor-pointer"
            >
              How It Works
            </a>
          </div>

          {/* 4 Feature Badges (Matching mockup layout & order) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 pt-6 border-t border-white/10 w-full">
            {trustFeatures.map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={index} className="flex items-center gap-2.5">
                  <div className="text-amber-400 shrink-0">
                    <Icon size={18} />
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

        {/* Mobile-only view of the scene */}
        <div className="lg:hidden mt-8 w-full rounded-2xl overflow-hidden shadow-xl border border-white/10">
          <img
            src="/mockup-assets/hero-scene.jpg"
            alt="Live Photo Wall at Wedding Reception"
            className="w-full h-auto object-cover"
          />
        </div>

      </div>
    </section>
  );
}
