"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function PhotographerBanner() {
  return (
    <section className="w-full bg-[#072B57] text-white py-6 sm:py-8 px-4 sm:px-6 lg:px-12 overflow-hidden relative">
      <div className="max-w-7xl mx-auto w-full flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
        
        {/* Left: Photographer Visual & Content */}
        <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-6 text-center sm:text-left">
          {/* Clean photographer image with no cut-off text or borders */}
          <div className="shrink-0 flex items-center justify-center">
            <img
              src="/mockup-assets/photographer.jpg"
              alt="Professional photographer"
              className="h-24 sm:h-28 object-contain"
            />
          </div>

          {/* Text Content */}
          <div className="flex flex-col items-center sm:items-start">
            <span className="text-amber-400 font-bold text-[11px] sm:text-xs tracking-[0.2em] uppercase mb-1">
              FOR PHOTOGRAPHERS
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight leading-snug mb-1">
              Add More Value. Earn More.
            </h2>
            <p className="text-blue-100 text-xs sm:text-sm leading-relaxed max-w-xl font-normal">
              Bundle MyMemento with your wedding packages and give your clients a unique, memorable experience — while increasing your revenue.
            </p>
          </div>
        </div>

        {/* Right: CTA Button */}
        <div className="shrink-0">
          <Link
            href="/photographers"
            className="px-6 py-2.5 rounded-full bg-gradient-to-r from-amber-400 to-[#E5A93C] hover:from-amber-500 hover:to-[#D9932B] text-slate-950 font-bold text-xs sm:text-sm tracking-wide shadow-md hover:scale-105 active:scale-95 transition-all flex items-center gap-2 whitespace-nowrap"
          >
            <span>Become a MyMemento Partner</span>
            <ArrowRight size={15} />
          </Link>
        </div>

      </div>
    </section>
  );
}
