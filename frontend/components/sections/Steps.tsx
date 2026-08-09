"use client";

import React from "react";
import { QrCode, Camera, Share2, Tv } from "lucide-react";

export default function Steps() {
  const steps = [
    {
      step: "01",
      title: "SCAN",
      icon: <QrCode className="w-6 h-6 text-cyan-400" />,
      description: "Guests scan your event QR code placed on table cards or welcome signs.",
    },
    {
      step: "02",
      title: "CAPTURE",
      icon: <Camera className="w-6 h-6 text-purple-400" />,
      description: "Their phone instantly becomes the camera in their browser. No app download.",
    },
    {
      step: "03",
      title: "SHARE",
      icon: <Share2 className="w-6 h-6 text-amber-400" />,
      description: "Their photo goes straight to your event gallery in high resolution.",
    },
    {
      step: "04",
      title: "EXPERIENCE",
      icon: <Tv className="w-6 h-6 text-emerald-400" />,
      description: "Watch memories appear live on your venue projector or screen in real time.",
    },
  ];

  return (
    <section id="how-it-works" className="w-full py-20 px-4 md:px-8 relative bg-slate-950/70 border-b border-white/5 flex flex-col items-center justify-center">
      <div className="max-w-6xl w-full mx-auto flex flex-col items-center text-center">
        
        <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-extrabold tracking-wider uppercase mb-4">
          How It Works
        </span>

        <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight max-w-3xl">
          From QR Code to Memory in Seconds
        </h2>

        <p className="text-slate-300 text-sm md:text-base max-w-2xl mt-4 font-medium">
          Zero friction for your guests. No app setup, no password forms, no frustration.
        </p>

        {/* 4 Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full mt-12 text-center">
          {steps.map((item) => (
            <div
              key={item.step}
              className="p-6 rounded-2xl bg-slate-900/60 border border-white/10 hover:border-cyan-400/30 transition-all shadow-xl flex flex-col items-center text-center relative group overflow-hidden"
            >
              <span className="text-4xl font-black text-slate-800 group-hover:text-slate-700 transition-colors absolute top-4 right-4 pointer-events-none">
                {item.step}
              </span>

              <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-6">
                {item.icon}
              </div>

              <h3 className="text-white font-black text-lg mb-2 tracking-wider">
                {item.step} — {item.title}
              </h3>

              <p className="text-slate-400 text-xs leading-relaxed z-10">
                {item.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
