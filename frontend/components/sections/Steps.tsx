"use client";

import React from "react";
import { QrCode, Camera, Upload, Tv, CheckCircle2, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function Steps() {
  const steps = [
    {
      number: "01",
      title: "SCAN",
      headline: "Point & Open",
      description: "Guests aim their smartphone camera at table cards or entrance banners. The gallery opens in their browser instantly.",
      icon: QrCode,
      tag: "No App Install",
    },
    {
      number: "02",
      title: "CAPTURE",
      headline: "Snap Unscripted Moments",
      description: "A fast, intuitive in-browser camera opens. Guests snap authentic candids from their table and dance floor.",
      icon: Camera,
      tag: "Zero Logins",
    },
    {
      number: "03",
      title: "SHARE",
      headline: "Sub-2s Cloud Ingestion",
      description: "One tap uploads each photo with smart offline queueing in case of spotty reception in venue basements.",
      icon: Upload,
      tag: "Offline Queueing",
    },
    {
      number: "04",
      title: "EXPERIENCE",
      headline: "Live on the Venue Screen",
      description: "Photos project live onto venue TVs, projectors, or LED stages within 2 seconds. The room erupts in excitement.",
      icon: Tv,
      tag: "1080p & 4K",
    },
  ];

  return (
    <section id="how-it-works" className="w-full py-20 md:py-28 px-4 sm:px-6 lg:px-12 bg-[#F8FAFC] border-b border-slate-200/80 flex flex-col items-center justify-center">
      <div className="max-w-7xl w-full mx-auto flex flex-col items-center">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-3.5 py-1 rounded-full bg-slate-200/80 text-slate-700 text-xs font-bold tracking-[0.15em] uppercase mb-4">
            HOW MEMENTO WORKS
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[#0A2540] tracking-tight leading-tight mb-4">
            Four Steps. Zero Friction for Guests.
          </h2>
          <p className="text-slate-600 text-sm sm:text-base md:text-lg leading-relaxed max-w-2xl mx-auto font-normal">
            Designed for 80-year-old grandparents and tech-savvy teens alike. If a guest can scan a restaurant menu, they can use Memento.
          </p>
        </div>

        {/* 4 Steps Grid (Desktop Horizontal Flow, Mobile Vertical Stack with Generous Gap) */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-y-8 sm:gap-y-10 lg:gap-y-8 gap-x-6 sm:gap-x-8 max-w-6xl mx-auto relative">
          
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 flex flex-col items-center text-center justify-between shadow-sm hover:shadow-md transition-shadow relative group h-full"
              >
                {/* Header with Step Number & Tag */}
                <div className="flex items-center justify-between w-full mb-6">
                  <span className="text-3xl sm:text-4xl font-serif font-black text-[#0A2540]/25 group-hover:text-amber-500/40 transition-colors">
                    {step.number}
                  </span>
                  <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200/60">
                    {step.tag}
                  </span>
                </div>

                {/* Icon & Title */}
                <div className="flex flex-col items-center text-center flex-1">
                  <div className="w-14 h-14 rounded-2xl bg-[#EEF5FB] border border-blue-100 flex items-center justify-center text-[#0A2540] mb-5 mx-auto group-hover:bg-[#0A2540] group-hover:text-amber-400 transition-colors shadow-sm">
                    <Icon size={24} className="stroke-[2.2]" />
                  </div>

                  <div className="text-xs font-mono font-bold tracking-widest text-amber-600 uppercase mb-1.5">
                    STEP {step.number} · {step.title}
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold text-[#0A2540] mb-2.5 leading-snug">
                    {step.headline}
                  </h3>

                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-6">
                    {step.description}
                  </p>
                </div>

                {/* Bottom Status */}
                <div className="w-full pt-4 border-t border-slate-100 flex items-center justify-center gap-1.5 text-xs font-medium text-emerald-700">
                  <CheckCircle2 size={14} />
                  <span>Instant browser execution</span>
                </div>
              </motion.div>
            );
          })}

        </div>

      </div>
    </section>
  );
}
