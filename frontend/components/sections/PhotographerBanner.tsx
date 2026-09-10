"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function PhotographerBanner() {
  return (
    <section className="w-full bg-gradient-to-r from-[#06203D] via-[#092E54] to-[#0A345E] text-white py-12 md:py-16 px-4 sm:px-6 lg:px-10 overflow-hidden relative border-b border-blue-950">
      
      {/* Ambient background glow */}
      <div className="absolute -top-24 right-1/4 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto w-full flex flex-col lg:flex-row items-center justify-between gap-8 relative z-10">
        
        {/* Left: Photographer Visual & Content */}
        <div className="flex flex-col sm:flex-row items-center gap-6 md:gap-8 text-center sm:text-left flex-1">
          
          {/* Photographer Image Thumbnail */}
          <div className="relative w-36 sm:w-44 md:w-52 aspect-[4/3] sm:aspect-square rounded-2xl overflow-hidden shadow-xl border border-white/15 bg-slate-900 shrink-0">
            <img
              src="/mockup-assets/photographer.jpg"
              alt="Professional photographer capturing wedding moments"
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
          </div>

          {/* Text Info */}
          <div className="flex flex-col">
            <span className="text-amber-400 font-bold text-xs sm:text-sm tracking-[0.2em] uppercase mb-2">
              FOR PHOTOGRAPHERS
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight leading-tight mb-2.5">
              Add More Value. Earn More.
            </h2>
            <p className="text-blue-100 text-xs sm:text-sm md:text-base leading-relaxed max-w-xl font-normal">
              Bundle MyMemento with your wedding packages and give your clients a unique, memorable experience — while increasing your revenue.
            </p>
          </div>

        </div>

        {/* Right: CTA Button */}
        <div className="shrink-0">
          <Link
            href="/photographers"
            className="px-7 py-3.5 sm:py-4 rounded-full bg-gradient-to-r from-amber-400 to-[#E5A93C] hover:from-amber-500 hover:to-[#D9932B] text-slate-950 font-bold text-xs sm:text-sm md:text-base tracking-wide shadow-xl hover:shadow-amber-500/20 active:scale-95 transition-all flex items-center gap-2 whitespace-nowrap"
          >
            <span>Become a Memento Partner</span>
            <ArrowRight size={16} />
          </Link>
        </div>

      </div>
    </section>
  );
}
