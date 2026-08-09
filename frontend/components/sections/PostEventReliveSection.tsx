"use client";

import React from "react";
import { motion } from "framer-motion";
import { Download, Sparkles, FolderArchive, Calendar, Heart, Shield, Share2 } from "lucide-react";

export default function PostEventReliveSection() {
  const highlights = [
    {
      icon: <FolderArchive className="w-5 h-5 text-amber-400" />,
      title: "One-Click Full ZIP Download",
      description: "Download every photo and 4K video clip in full original resolution at any time.",
    },
    {
      icon: <Calendar className="w-5 h-5 text-cyan-400" />,
      title: "Interactive Timeline & Albums",
      description: "Browse memories chronologically from pre-ceremony prep to late-night sendoff.",
    },
    {
      icon: <Sparkles className="w-5 h-5 text-purple-400" />,
      title: "Future AI Highlights Ready",
      description: "Architecture built for automated best-shot selection, face discovery, and highlight reels.",
    },
    {
      icon: <Share2 className="w-5 h-5 text-emerald-400" />,
      title: "Private Family Sharing Link",
      description: "Share the digital album with guests so everyone can relive and download their favorites.",
    },
  ];

  return (
    <section className="w-full py-20 px-4 md:px-8 relative bg-slate-950 border-b border-white/5 flex flex-col items-center justify-center">
      <div className="max-w-6xl w-full mx-auto flex flex-col items-center text-center">
        
        <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-extrabold tracking-wider uppercase mb-4">
          Post-Event Experience
        </span>

        <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight max-w-3xl">
          Then Keep It <span className="text-amber-400">Forever</span>
        </h2>

        <p className="text-slate-300 text-sm md:text-base max-w-2xl mt-4 font-medium">
          One event. Every perspective. One beautiful digital memory archive ready whenever you want to look back.
        </p>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full mt-12 text-center">
          {highlights.map((item) => (
            <div
              key={item.title}
              className="p-6 rounded-2xl bg-slate-900/60 border border-white/10 hover:border-amber-400/30 transition-all shadow-xl flex flex-col items-center text-center"
            >
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                {item.icon}
              </div>
              <h3 className="text-white font-extrabold text-base mb-2">{item.title}</h3>
              <p className="text-slate-400 text-xs leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
