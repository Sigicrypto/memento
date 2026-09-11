"use client";

import React from "react";
import { ArrowRight, MessageSquare, Sparkles, CheckCircle2 } from "lucide-react";
import { useAuthModal } from "@/context/AuthModalContext";

export default function FinalCtaSection() {
  const { openAuth } = useAuthModal();

  return (
    <section className="relative w-full py-24 sm:py-32 px-4 sm:px-6 lg:px-12 bg-[#040C1A] text-white overflow-hidden flex flex-col items-center justify-center">
      {/* Cinematic Photography Background */}
      <div className="absolute inset-0 select-none pointer-events-none">
        <img
          src="/mockup-assets/hero-full.jpg"
          alt="Wedding celebration reception live wall background"
          className="w-full h-full object-cover object-center opacity-25 filter blur-[2px]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#040C1A] via-[#040C1A]/80 to-[#040C1A]" />
        <div className="absolute inset-0 bg-radial from-transparent to-[#040C1A]" />
      </div>

      <div className="max-w-4xl mx-auto w-full relative z-10 flex flex-col items-center text-center">
        
        {/* Eyebrow Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/15 text-amber-300 text-xs font-bold tracking-[0.15em] uppercase mb-6 backdrop-blur-sm">
          <Sparkles size={13} className="text-amber-400" />
          <span>TAKE YOUR STUDIO EXPERIENCE TO THE NEXT LEVEL</span>
        </div>

        {/* Headline */}
        <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-[1.12] mb-6">
          Ready to Add Live Photo Sharing to Your Next Wedding?
        </h2>

        {/* Subtitle */}
        <p className="text-slate-300 text-base sm:text-lg md:text-xl leading-relaxed max-w-2xl mb-10 font-normal">
          Delight couples and guests with real-time venue projections while archiving hundreds of unscripted memories in full 4K resolution.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto mb-12">
          {/* Primary CTA with Subtle Moving / Gold Accent Border */}
          <button
            onClick={() => openAuth("signup")}
            className="group relative w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-amber-400 to-[#E5A93C] hover:from-amber-500 hover:to-[#D9932B] text-slate-950 font-bold text-sm sm:text-base tracking-wide shadow-xl hover:shadow-amber-500/25 active:scale-95 transition-all flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <span>Add Memento to Your Studio</span>
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Secondary CTA: WhatsApp to Founder */}
          <a
            href="https://wa.me/919866161775?text=Hi%2C%20I%27m%20ready%20to%20add%20MyMemento%20to%20my%20studio%20for%20upcoming%20weddings."
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-7 py-4 rounded-full border border-white/25 hover:border-white hover:bg-white/10 text-white font-semibold text-sm sm:text-base active:scale-95 transition-all flex items-center justify-center gap-2.5 backdrop-blur-sm cursor-pointer"
          >
            <MessageSquare size={18} className="text-emerald-400" />
            <span>Talk Directly with Founder</span>
          </a>
        </div>

        {/* Trust Points Strip */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-400 font-medium">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 size={14} className="text-amber-400" /> 60-Second Setup
          </span>
          <span className="text-slate-600 select-none">•</span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 size={14} className="text-amber-400" /> 0 App Installs for Guests
          </span>
          <span className="text-slate-600 select-none">•</span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 size={14} className="text-amber-400" /> 100% Private &amp; Secure
          </span>
          <span className="text-slate-600 select-none">•</span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 size={14} className="text-amber-400" /> Works on Any Venue Screen
          </span>
        </div>

      </div>
    </section>
  );
}
