"use client";

import React from "react";
import { motion } from "framer-motion";
import { Tv, ShieldCheck, Music, Sparkles, Sliders, Layers, Eye, RefreshCw, Check } from "lucide-react";

export default function LiveWallFeatureSection() {
  const features = [
    {
      icon: <Tv className="w-5 h-5 text-cyan-400" />,
      title: "Full-Screen TV & Projector Mode",
      desc: "Instant 4K presentation mode tailored for venue projectors, LED walls, and smart TVs.",
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />,
      title: "Real-Time Host Moderation",
      desc: "Approve or hide guest uploads before they render on screen with one click from your phone.",
    },
    {
      icon: <Music className="w-5 h-5 text-purple-400" />,
      title: "Cinematic Background Music",
      desc: "Pair slideshow transitions with curated high-fidelity soundtrack options for atmospheric flow.",
    },
    {
      icon: <Sliders className="w-5 h-5 text-amber-400" />,
      title: "Custom Event & Sponsor Branding",
      desc: "Display couple names, logos, hashtag banners, or corporate sponsor overlays on the live screen.",
    },
    {
      icon: <Layers className="w-5 h-5 text-pink-400" />,
      title: "Polaroid & Masonry Layouts",
      desc: "Choose between animated floating Polaroid cards, smooth slideshows, or dynamic grid layouts.",
    },
    {
      icon: <RefreshCw className="w-5 h-5 text-blue-400" />,
      title: "Instant Realtime Auto-Refresh",
      desc: "Sub-second sync between phone uploads and the venue screen via Supabase realtime sockets.",
    },
  ];

  return (
    <section className="w-full py-20 px-4 md:px-8 relative bg-slate-950/90 border-b border-white/5 flex flex-col items-center justify-center">
      <div className="max-w-6xl w-full mx-auto flex flex-col items-center text-center">
        
        <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-extrabold tracking-wider uppercase mb-4">
          Flagship Feature
        </span>

        <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight max-w-3xl">
          Make Your Event Come Alive with <span className="text-cyan-400">Memento Live</span>
        </h2>

        <p className="text-slate-300 text-sm md:text-base max-w-2xl mt-4 font-medium">
          Transform guest photos into a living, real-time cinematic show displayed on any venue screen or projector.
        </p>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full mt-12 text-center">
          {features.map((feat, idx) => (
            <div
              key={feat.title}
              className="p-6 rounded-2xl bg-slate-900/80 border border-white/10 hover:border-cyan-400/30 transition-all shadow-xl flex flex-col items-center text-center"
            >
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                {feat.icon}
              </div>
              <h3 className="text-white font-extrabold text-base mb-2">{feat.title}</h3>
              <p className="text-slate-400 text-xs leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
