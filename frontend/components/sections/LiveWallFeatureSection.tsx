"use client";

import React from "react";
import { Tv, ShieldCheck, Palette, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function LiveWallFeatureSection() {
  const features = [
    {
      icon: <Tv className="w-5 h-5 text-primary" />,
      bg: "bg-primary/10 border border-primary/20",
      title: "Works on Any Screen",
      desc: "Smart TVs, projectors, HDMI setups, or laptops — if it has a browser, it works.",
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-primary" />,
      bg: "bg-primary/10 border border-primary/20",
      title: "Safety-First Moderation",
      desc: "Review guest photos in real time before they hit the screen, or enable 1-tap Auto-Approve.",
    },
    {
      icon: <Palette className="w-5 h-5 text-accent" />,
      bg: "bg-accent/10 border border-accent/20",
      title: "Studio & Couple Co-Branding",
      desc: "Couple monogram, studio watermark, custom colors, and sponsor overlays.",
    },
  ];

  return (
    <section className="w-full py-20 md:py-28 px-4 md:px-8 bg-bg border-b border-border flex flex-col items-center justify-center text-center">
      <div className="max-w-6xl w-full mx-auto flex flex-col items-center text-center">
        
        {/* Centered Header */}
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-wider uppercase mb-4 mx-auto">
          <Tv size={13} />
          FLAGSHIP LIVE EXPERIENCE
        </span>
        <h2 className="text-3xl md:text-5xl font-black text-text-primary tracking-tight font-display mb-4 max-w-3xl mx-auto">
          Memento Live — Your Event's Real-Time Photo Wall
        </h2>
        <p className="text-text-secondary text-base md:text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
          Display guest photos on any venue screen the moment they're captured. The ultimate interactive centerpiece for weddings, receptions, and corporate galas.
        </p>

        {/* Center TV Display Mockup (Context 2: Dim-Venue #1C1917) */}
        <div className="w-full max-w-4xl mx-auto mb-14">
          <div className="bg-neutral-800 rounded-2xl border-4 border-neutral-300 p-1.5 sm:p-2 shadow-2xl overflow-hidden">
            {/* TV Screen Top Bezel */}
            <div className="h-9 bg-[#292524] flex items-center px-3 justify-between rounded-t-xl border-b border-neutral-700">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></div>
                <span className="text-xs font-bold text-white tracking-widest uppercase">MEMENTO LIVE</span>
              </div>
              <div className="text-xs text-neutral-300 font-medium">Priya & Arjun's Sangeet</div>
              <div className="text-[11px] text-accent font-bold hidden sm:block">184 Photos · Live</div>
            </div>
            
            {/* Live Wall Canvas (Context 2: Dim-Venue #1C1917) */}
            <div className="p-3.5 grid grid-cols-3 gap-2.5 aspect-video bg-[#1C1917] relative">
              {/* Photo 1: Just Landed (Amber Pulse) */}
              <div className="relative bg-gradient-to-br from-amber-200 via-rose-200 to-pink-200 rounded-lg shadow-md border-2 border-accent overflow-hidden p-2 flex flex-col justify-between">
                <span className="self-end px-1.5 py-0.5 rounded bg-accent text-white font-bold text-[8px] flex items-center gap-1 shadow">
                  <span className="w-1 h-1 rounded-full bg-white animate-ping" />
                  New
                </span>
                <span className="text-[9px] font-bold text-neutral-900 bg-white/90 px-1 py-0.5 rounded self-start">Aunt Seema</span>
              </div>

              {/* Photo 2: Large Center Tile */}
              <div className="relative bg-gradient-to-bl from-sky-200 via-indigo-200 to-purple-200 rounded-lg shadow-md row-span-2 overflow-hidden p-2 flex flex-col justify-end">
                <span className="text-[9px] font-bold text-neutral-900 bg-white/90 px-1.5 py-0.5 rounded self-start">First Dance ✨</span>
              </div>

              {/* Photo 3: Pinned with Coral Tag */}
              <div className="relative bg-gradient-to-tr from-emerald-200 via-teal-200 to-green-200 rounded-lg shadow-md overflow-hidden p-2 flex flex-col justify-between">
                <span className="self-end px-1.5 py-0.5 rounded bg-[#FF7A59] text-white font-bold text-[8px] shadow">
                  ⭐ Pinned
                </span>
                <span className="text-[9px] font-bold text-neutral-900 bg-white/90 px-1 py-0.5 rounded self-start">Grandparents</span>
              </div>
              
              {/* Photo 4 */}
              <div className="bg-gradient-to-tl from-purple-200 to-pink-200 rounded-lg shadow-md overflow-hidden p-2 flex items-end">
                <span className="text-[8px] font-bold text-neutral-900 bg-white/90 px-1 py-0.5 rounded">Toast 🥂</span>
              </div>

              {/* Photo 5 */}
              <div className="bg-gradient-to-br from-orange-200 to-amber-200 rounded-lg shadow-md overflow-hidden p-2 flex items-end">
                <span className="text-[8px] font-bold text-neutral-900 bg-white/90 px-1 py-0.5 rounded">DJ Energy 💃</span>
              </div>
              
              {/* Photo 6 */}
              <div className="bg-gradient-to-bl from-cyan-200 to-blue-200 rounded-lg shadow-md overflow-hidden p-2 flex items-end">
                <span className="text-[8px] font-bold text-neutral-900 bg-white/90 px-1 py-0.5 rounded">Table 8 😂</span>
              </div>
              {/* Photo 7 */}
              <div className="bg-gradient-to-tr from-rose-200 to-pink-200 rounded-lg shadow-md overflow-hidden p-2 flex items-end">
                <span className="text-[8px] font-bold text-neutral-900 bg-white/90 px-1 py-0.5 rounded">Ring Ceremony</span>
              </div>
              {/* Photo 8 */}
              <div className="bg-gradient-to-tl from-teal-200 to-emerald-200 rounded-lg shadow-md overflow-hidden p-2 flex items-end">
                <span className="text-[8px] font-bold text-neutral-900 bg-white/90 px-1 py-0.5 rounded">Baraat 🎉</span>
              </div>

              {/* Lower-third Watermark Bar (Deep Teal) */}
              <div className="absolute bottom-1.5 left-3.5 right-3.5 py-1 px-2.5 rounded bg-black/75 backdrop-blur-sm border border-white/10 flex items-center justify-between text-[9px]">
                <span className="text-neutral-300">Scan table cards to add your photos live</span>
                <span className="text-[#0E6B6B] font-bold">Royal Moments Studio</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3 Feature Cards (Centered Grid) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mb-10 text-center">
          {features.map((feat) => (
            <div key={feat.title} className="flex flex-col items-center text-center p-6 rounded-2xl bg-surface border border-border shadow-card hover:shadow-card-hover transition-all h-full justify-start">
              <div className={`w-12 h-12 rounded-xl ${feat.bg} flex items-center justify-center mb-4 mx-auto shrink-0`}>
                {feat.icon}
              </div>
              <h3 className="font-bold text-text-primary text-base mb-2 text-center">{feat.title}</h3>
              <p className="text-text-secondary text-sm leading-relaxed text-center">{feat.desc}</p>
            </div>
          ))}
        </div>

        <Link
          href="/features/live"
          className="inline-flex items-center justify-center gap-2 text-primary font-bold hover:underline transition-all mx-auto text-base"
        >
          <span>Explore All Live Features</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}
