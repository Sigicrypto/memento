"use client";

import React from "react";
import { Tv, Users, Radio, Zap, Smartphone, QrCode, CheckCircle, ShieldCheck, Play } from "lucide-react";

interface LiveWallGalleryProps {
  onOpenDemo?: () => void;
}

export default function LiveWallGallery({ onOpenDemo }: LiveWallGalleryProps) {
  const showcaseItems = [
    {
      title: "Grand Banquet Projector Wall",
      event: "Ananya & Rohan's Wedding Reception",
      image: "/mockup-assets/hero-scene.jpg",
      badge: "Projector Mode (1080p / 4K)",
      description: "Over 450 guests watched their table selfies stream live onto the 200-inch venue projector throughout the evening.",
      tag1: { label: "200-inch Projector", icon: Tv },
      tag2: { label: "450+ Guests", icon: Users },
    },
    {
      title: "Cocktail Bar LED Display",
      event: "Pre-Wedding Sangeet & Cocktail Night",
      image: "/landing-hero/photo2.jpg",
      badge: "Real-Time Sync (<2s)",
      description: "High-energy dance floor moments and toasts broadcast instantly behind the DJ booth.",
      tag1: { label: "DJ Booth Sync", icon: Radio },
      tag2: { label: "High-Energy Mode", icon: Zap },
    },
    {
      title: "Table QR Cards in Action",
      event: "Intimate Outdoor Reception",
      image: "/landing-hero/photo1.jpg",
      badge: "Zero App Friction",
      description: "Custom printed acrylic table stands allowed elderly family members and friends to snap photos without logging in.",
      tag1: { label: "Zero Login", icon: Smartphone },
      tag2: { label: "Acrylic Stand Print-Ready", icon: QrCode },
    },
    {
      title: "Live Host Moderation",
      event: "Corporate Gala & Awards Night",
      image: "/mockup-assets/corporate.jpg",
      badge: "Moderation Console",
      description: "Host tablet previewed incoming uploads with 1-tap approval before displaying on main stage LED screens.",
      tag1: { label: "1-Tap Approval", icon: CheckCircle },
      tag2: { label: "Moderation Console", icon: ShieldCheck },
    },
  ];

  return (
    <section id="live-wall" className="w-full py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-slate-50/70 border-b border-slate-100 flex flex-col items-center justify-center">
      <div className="max-w-7xl w-full mx-auto flex flex-col items-center text-center">
        
        {/* Section Heading */}
        <div className="flex items-center justify-center gap-3 md:gap-4 mb-2">
          <div className="w-8 sm:w-16 h-px bg-amber-400" />
          <h2 className="font-serif text-3xl sm:text-4xl md:text-4xl font-bold text-[#0A2540] tracking-tight">
            See the Live Wall in Action
          </h2>
          <div className="w-8 sm:w-16 h-px bg-amber-400" />
        </div>

        <p className="text-slate-500 text-sm sm:text-base mb-6 max-w-2xl">
          Real venue screens, ballroom projector setups, and genuine guest reactions. No specialized hardware required.
        </p>

        {/* Live Indicator Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-12 shadow-sm">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Real-Time Cloud Projection · Works on Any HDMI / Smart TV</span>
        </div>

        {/* Showcase Grid */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 text-left mb-12 max-w-5xl mx-auto">
          {showcaseItems.map((item, idx) => {
            const Tag1Icon = item.tag1.icon;
            const Tag2Icon = item.tag2.icon;

            return (
              <div
                key={idx}
                className="group bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between h-full"
              >
                {/* Image Container with Live Overlay */}
                <div className="relative aspect-[16/10] overflow-hidden bg-slate-900">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent pointer-events-none" />

                  {/* Top Badge */}
                  <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-amber-300 text-xs font-semibold border border-white/10 flex items-center gap-1.5">
                    <Zap size={13} className="text-amber-400" />
                    <span>{item.badge}</span>
                  </div>

                  {/* Bottom Event Tag */}
                  <div className="absolute bottom-3 left-4 right-4">
                    <span className="text-xs text-amber-300 font-medium tracking-wide">
                      {item.event}
                    </span>
                    <h3 className="text-white font-bold text-lg leading-snug">
                      {item.title}
                    </h3>
                  </div>
                </div>

                {/* Text Description */}
                <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-4">
                    {item.description}
                  </p>

                  {/* Unique Feature-Specific Tags */}
                  <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100 flex-wrap gap-2">
                    <span className="flex items-center gap-1.5 text-slate-700 font-semibold bg-slate-100/80 px-2.5 py-1 rounded-lg">
                      <Tag1Icon size={14} className="text-amber-600 shrink-0" />
                      <span>{item.tag1.label}</span>
                    </span>
                    <span className="flex items-center gap-1.5 text-slate-700 font-semibold bg-slate-100/80 px-2.5 py-1 rounded-lg">
                      <Tag2Icon size={14} className="text-amber-600 shrink-0" />
                      <span>{item.tag2.label}</span>
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Live Wall Interactive Action Callout */}
        {onOpenDemo && (
          <div className="w-full max-w-xl mx-auto p-4 sm:p-5 rounded-2xl bg-[#0A2540] text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
            <div className="text-center sm:text-left">
              <h4 className="font-bold text-sm sm:text-base text-white">
                Want to test the Live Wall right now?
              </h4>
              <p className="text-blue-200 text-xs">
                Launch our interactive simulator on your screen in 1 click.
              </p>
            </div>
            <button
              onClick={onOpenDemo}
              className="px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-400 to-[#E5A93C] hover:from-amber-500 hover:to-[#D9932B] text-slate-950 font-bold text-xs sm:text-sm shadow active:scale-95 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap"
            >
              <Play size={14} className="fill-slate-950" />
              <span>Launch Live Wall Simulator</span>
            </button>
          </div>
        )}

      </div>
    </section>
  );
}