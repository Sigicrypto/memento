"use client";

import React from "react";
import { Tv, ShieldCheck, Palette, Sparkles, Play, ArrowRight, Radio } from "lucide-react";

interface LiveWallFeatureSectionProps {
  onOpenDemo?: () => void;
}

export default function LiveWallFeatureSection({ onOpenDemo }: LiveWallFeatureSectionProps) {
  const marqueePhotos = [
    { url: "/landing-hero/photo1.jpg", caption: "First dance magic" },
    { url: "/landing-hero/photo2.jpg", caption: "Altar joy" },
    { url: "/landing-hero/photo3.jpg", caption: "Table 4 laughter" },
    { url: "/landing-hero/photo5.jpg", caption: "Family toast" },
    { url: "/landing-hero/photo7.jpg", caption: "Midnight dancing" },
    { url: "/landing-hero/photo8.jpg", caption: "Grand entrance" },
    { url: "/landing-hero/photo9.jpg", caption: "Rooftop sunset" },
    { url: "/landing-hero/photo11.jpg", caption: "Champagne tower" },
  ];

  return (
    <section id="live-wall" className="w-full py-20 md:py-28 px-4 sm:px-6 lg:px-12 bg-[#050E1D] text-white relative overflow-hidden border-b border-slate-800">
      {/* Background Lighting */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-blue-600/10 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto w-full relative z-10 flex flex-col items-center">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-amber-300 text-xs font-bold tracking-[0.15em] uppercase mb-4">
            <Radio size={14} className="text-red-400 animate-pulse" />
            <span>FLAGSHIP VENUE EXPERIENCE</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight mb-4">
            Memento Live — Your Event&apos;s Real-Time Photo Wall
          </h2>

          <p className="text-amber-300/90 text-xs sm:text-sm font-semibold uppercase tracking-wider mb-2">
            This is what guests actually see on the venue screen
          </p>

          <p className="text-slate-300 text-sm sm:text-base md:text-lg leading-relaxed max-w-2xl mx-auto font-normal">
            Display guest photos on any screen the moment they&apos;re captured. The ultimate interactive centerpiece for weddings, sangeets, and corporate galas.
          </p>
        </div>

        {/* Large Venue Screen Simulator Presentation */}
        <div className="w-full max-w-5xl mx-auto mb-16">
          <div className="bg-[#141E30] rounded-3xl border-4 sm:border-8 border-slate-800 p-2 sm:p-3 shadow-2xl overflow-hidden relative group">
            
            {/* TV Screen Top Bezel */}
            <div className="h-11 bg-[#0A1322] flex items-center justify-between px-4 rounded-t-2xl border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                <span className="text-xs font-black tracking-widest text-white uppercase">MEMENTO LIVE</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-300 font-medium hidden sm:inline">Priya &amp; Rohan&apos;s Wedding</span>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30 font-semibold tracking-wider">
                  LIVE DEMO — SAMPLE EVENT
                </span>
              </div>
              <div className="text-xs text-amber-300 font-mono hidden sm:flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>184 Photos · Live Ingestion</span>
              </div>
            </div>

            {/* Live Wall Screen Matrix */}
            <div className="p-3 sm:p-5 grid grid-cols-2 md:grid-cols-4 gap-3 bg-[#030914] relative aspect-[16/9] min-h-[300px] sm:min-h-[420px]">
              
              {/* Photo 1 (Featured Just Landed with Amber Glow) */}
              <div className="relative rounded-2xl overflow-hidden border-2 border-amber-400 shadow-xl col-span-2 row-span-2 group/card">
                <img
                  src="/landing-hero/photo1.jpg"
                  alt="Live screen feature photo"
                  className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-red-500 text-white font-bold text-xs flex items-center gap-1.5 shadow">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                  Just Landed
                </span>
                
                <div className="absolute bottom-3 left-3 right-3 text-left">
                  <p className="text-white text-sm sm:text-base font-bold">First dance under fairy lights ✨</p>
                  <p className="text-amber-300 text-xs font-mono">Captured by Table 2 · 2s ago</p>
                </div>
              </div>

              {/* Photo 2 */}
              <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-md">
                <img src="/landing-hero/photo2.jpg" alt="Altar joy" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <span className="absolute bottom-2 left-2 text-[10px] text-white font-medium">Ceremony Tears</span>
              </div>

              {/* Photo 3 */}
              <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-md">
                <img src="/landing-hero/photo3.jpg" alt="Table candids" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <span className="absolute bottom-2 left-2 text-[10px] text-white font-medium">Table 4 Laughs</span>
              </div>

              {/* Photo 4 */}
              <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-md">
                <img src="/landing-hero/photo7.jpg" alt="Dance floor" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <span className="absolute bottom-2 left-2 text-[10px] text-white font-medium">Dance Floor 💃</span>
              </div>

              {/* Photo 5 */}
              <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-md">
                <img src="/landing-hero/photo8.jpg" alt="Baraat" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <span className="absolute bottom-2 left-2 text-[10px] text-white font-medium">Baraat Energy</span>
              </div>

              {/* Bottom Watermark Overlay Bar */}
              <div className="absolute bottom-2 left-4 right-4 py-1.5 px-4 rounded-xl bg-black/80 backdrop-blur-md border border-white/10 flex items-center justify-between text-xs z-10">
                <span className="text-slate-300">Scan QR on your table card to share your photos live</span>
                <span className="text-amber-400 font-bold">Royal Moments Studio</span>
              </div>
            </div>

            {/* Simulator Overlay Trigger */}
            <div className="p-4 bg-[#0A1322] flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-white/10">
              <span className="text-xs text-slate-300">
                Works on Smart TVs, HDMI monitors, projectors, or LED walls — if it has a web browser, it runs.
              </span>
              <button
                onClick={onOpenDemo}
                className="px-5 py-2 rounded-full bg-gradient-to-r from-amber-400 to-[#E5A93C] hover:from-amber-500 hover:to-[#D9932B] text-slate-950 font-bold text-xs tracking-wide shadow transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <Play size={13} className="fill-slate-950" />
                <span>Launch Fullscreen Live Wall Simulator</span>
              </button>
            </div>

          </div>
        </div>

        {/* Magic UI Subtle Photo Stream Marquee */}
        <div className="w-full max-w-6xl mx-auto overflow-hidden relative mb-16 py-3">
          <div className="flex gap-4 animate-marquee hover:[animation-play-state:paused] w-max">
            {[...marqueePhotos, ...marqueePhotos].map((photo, i) => (
              <div
                key={i}
                className="w-40 sm:w-48 aspect-[4/3] rounded-2xl overflow-hidden border border-white/10 shadow-lg shrink-0 relative group"
              >
                <img src={photo.url} alt={photo.caption} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <span className="absolute bottom-2 left-2 text-[10px] font-medium text-white truncate max-w-[90%]">
                  {photo.caption}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 3 Live Wall Feature Columns */}
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-y-8 md:gap-y-6 gap-x-6 sm:gap-x-8 max-w-5xl mx-auto text-center">
          <div className="p-7 sm:p-8 rounded-3xl bg-white/[0.03] border border-white/10 shadow-sm flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-5 mx-auto">
              <Tv size={24} />
            </div>
            <h3 className="font-bold text-lg text-white mb-2">Works on Any Screen</h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              Smart TVs, projectors, laptops, or stage LED panels. Simply open your private Live Wall URL in any browser and press full-screen.
            </p>
          </div>

          <div className="p-7 sm:p-8 rounded-3xl bg-white/[0.03] border border-white/10 shadow-sm flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-5 mx-auto">
              <ShieldCheck size={24} />
            </div>
            <h3 className="font-bold text-lg text-white mb-2">Safety-First Moderation</h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              Review and approve photos with a single tap in your host console before they reach the screen, or enable 1-tap Auto-Approve anytime.
            </p>
          </div>

          <div className="p-7 sm:p-8 rounded-3xl bg-white/[0.03] border border-white/10 shadow-sm flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-5 mx-auto">
              <Palette size={24} />
            </div>
            <h3 className="font-bold text-lg text-white mb-2">Custom Studio Co-Branding</h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              Display couple monograms, studio watermarks, custom hex colors, and sponsor logos on the lower-third ticker bar.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
