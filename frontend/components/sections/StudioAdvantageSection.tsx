"use client";

import React, { useRef } from "react";
import { Smile, HeartHandshake, Clapperboard, Sparkles } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";

export default function StudioAdvantageSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  // Subtle multi-speed parallax offsets for the 3 columns on desktop
  const y1 = useTransform(scrollYProgress, [0, 1], [-20, 20]);
  const y2 = useTransform(scrollYProgress, [0, 1], [30, -30]);
  const y3 = useTransform(scrollYProgress, [0, 1], [-15, 25]);

  return (
    <section
      id="studio-advantage"
      ref={containerRef}
      className="w-full py-20 md:py-28 px-4 sm:px-6 lg:px-12 bg-white border-b border-slate-200/80 flex flex-col items-center justify-center overflow-hidden"
    >
      <div className="max-w-7xl w-full mx-auto flex flex-col items-center">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-700 text-xs font-bold tracking-[0.15em] uppercase mb-4">
            <Sparkles size={13} className="text-amber-500" />
            <span>THE STUDIO ADVANTAGE</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[#0A2540] tracking-tight leading-tight mb-4">
            You Capture the Masterpieces.<br />
            <span className="text-amber-600">Your Guests Capture Every Other Angle.</span>
          </h2>

          <p className="text-slate-600 text-sm sm:text-base md:text-lg leading-relaxed max-w-2xl mx-auto font-normal">
            Give your couples 360° wedding coverage no single photography crew can achieve alone — without hiring second shooters or renting extra gear.
          </p>
        </div>

        {/* Aceternity Parallax Photography Grid (3 Columns Desktop, 1 Column Mobile) */}
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-y-10 sm:gap-y-12 md:gap-y-8 gap-x-6 lg:gap-x-8 max-w-6xl mx-auto items-start">
          
          {/* Column 1: Candid Moments */}
          <motion.div style={{ y: y1 }} className="flex flex-col gap-6 sm:gap-8">
            {/* Photo 1 */}
            <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-md border border-slate-200 group relative">
              <img
                src="/landing-hero/photo3.jpg"
                alt="Table laughter candids"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <span className="absolute bottom-3 left-4 text-xs font-semibold text-white">
                Table 4 laughter · 9:15 PM
              </span>
            </div>

            {/* Concept Card 1 */}
            <div className="p-7 rounded-3xl bg-[#F8FAFC] border border-slate-200/90 shadow-sm flex flex-col items-start text-left">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 mb-4">
                <Smile size={24} className="stroke-[2.2]" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600 mb-1">
                UNSCRIPTED CANDIDS
              </span>
              <h3 className="text-xl font-bold text-[#0A2540] mb-2">
                Candid Moments
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Spontaneous table banter, hilarious inside jokes, and raw reactions from corners of the hall where your team cannot be standing at once.
              </p>
            </div>

            {/* Photo 2 */}
            <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-md border border-slate-200 group relative">
              <img
                src="/landing-hero/photo11.jpg"
                alt="Champagne tower cheers"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <span className="absolute bottom-3 left-4 text-xs font-semibold text-white">
                Cocktail lawn toast · 7:30 PM
              </span>
            </div>
          </motion.div>

          {/* Column 2: Family & Guests */}
          <motion.div style={{ y: y2 }} className="flex flex-col gap-6 sm:gap-8">
            {/* Concept Card 2 */}
            <div className="p-7 rounded-3xl bg-[#EEF5FB] border border-blue-100 shadow-sm flex flex-col items-start text-left">
              <div className="w-12 h-12 rounded-2xl bg-blue-600/10 border border-blue-200 flex items-center justify-center text-[#0A2540] mb-4">
                <HeartHandshake size={24} className="stroke-[2.2]" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-700 mb-1">
                360° PERSPECTIVE
              </span>
              <h3 className="text-xl font-bold text-[#0A2540] mb-2">
                Family &amp; Guests
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Grandparents smiling from the front row, childhood friends catching up, and proud siblings wiped out from dancing.
              </p>
            </div>

            {/* Photo 3 */}
            <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-md border border-slate-200 group relative">
              <img
                src="/landing-hero/photo2.jpg"
                alt="Emotional reactions"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <span className="absolute bottom-3 left-4 text-xs font-semibold text-white">
                Joyful altar tears · Ceremony
              </span>
            </div>

            {/* Photo 4 */}
            <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-md border border-slate-200 group relative">
              <img
                src="/landing-hero/photo7.jpg"
                alt="Dance floor magic"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <span className="absolute bottom-3 left-4 text-xs font-semibold text-white">
                Midnight celebration · Sangeet
              </span>
            </div>
          </motion.div>

          {/* Column 3: Behind the Scenes */}
          <motion.div style={{ y: y3 }} className="flex flex-col gap-6 sm:gap-8">
            {/* Photo 5 */}
            <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-md border border-slate-200 group relative">
              <img
                src="/landing-hero/photo6.jpg"
                alt="Getting ready prep"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <span className="absolute bottom-3 left-4 text-xs font-semibold text-white">
                Bridal suite laughter · 11:00 AM
              </span>
            </div>

            {/* Concept Card 3 */}
            <div className="p-7 rounded-3xl bg-[#F8FAFC] border border-slate-200/90 shadow-sm flex flex-col items-start text-left">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 mb-4">
                <Clapperboard size={24} className="stroke-[2.2]" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600 mb-1">
                ALL-DAY ENERGY
              </span>
              <h3 className="text-xl font-bold text-[#0A2540] mb-2">
                Behind the Scenes
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Getting-ready chaos, shoe theft games, quiet hallway chats, and the moments before the curtain opens.
              </p>
            </div>

            {/* Photo 6 */}
            <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-md border border-slate-200 group relative">
              <img
                src="/landing-hero/photo4.jpg"
                alt="Grand entrance"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <span className="absolute bottom-3 left-4 text-xs font-semibold text-white">
                Grand stage reveal · Reception
              </span>
            </div>
          </motion.div>

        </div>

      </div>
    </section>
  );
}
