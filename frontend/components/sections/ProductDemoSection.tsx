"use client";

import React, { useState, useEffect } from "react";
import { QrCode, Camera, Upload, Tv, Sparkles, Play, CheckCircle2, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";

interface ProductDemoSectionProps {
  onOpenDemo?: () => void;
}

interface StepItem {
  id: "scan" | "capture" | "share" | "experience";
  number: string;
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
}

const STEPS: StepItem[] = [
  {
    id: "scan",
    number: "01",
    badge: "Instant Access",
    title: "SCAN · Guest Scans Table QR",
    subtitle: "Zero apps to download · Zero logins required",
    description: "Guests point their normal phone camera at your studio-branded table card or entrance banner. The private event gallery opens immediately in Safari or Chrome.",
    icon: QrCode,
  },
  {
    id: "capture",
    number: "02",
    badge: "In-Browser Camera",
    title: "CAPTURE · Guest Takes a Photo",
    subtitle: "No accounts · High resolution · Fun & intuitive",
    description: "A fast, intuitive in-browser camera opens. Guests snap authentic candid moments throughout the celebration — unscripted table laughter and dance-floor magic.",
    icon: Camera,
  },
  {
    id: "share",
    number: "03",
    badge: "Sub-2s Sync",
    title: "SHARE · Photo Uploads Instantly",
    subtitle: "Automatic compression · Offline queueing built-in",
    description: "One tap uploads each memory securely. Even if venue reception drops in thick stone basements, smart offline queueing resyncs the moment signal returns.",
    icon: Upload,
  },
  {
    id: "experience",
    number: "04",
    badge: "Live Projection",
    title: "LIVE · Streams to Venue Screen",
    subtitle: "Smart TVs, projectors & LED walls · Live moderation",
    description: "Photos project onto venue screens in under 2 seconds. Guests cheer as their selfies appear, creating contagious energy across the entire wedding.",
    icon: Tv,
  },
];

export default function ProductDemoSection({ onOpenDemo }: ProductDemoSectionProps) {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-advance through the 4 steps unless user manually pauses/selects
  useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = setInterval(() => {
      setActiveStepIndex((prev) => (prev + 1) % STEPS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [isAutoPlaying]);

  const activeStep = STEPS[activeStepIndex];

  return (
    <section
      id="demo"
      className="w-full py-20 md:py-28 px-4 sm:px-6 lg:px-12 bg-[#061224] text-white relative overflow-hidden border-b border-slate-800"
    >
      {/* Background Ambience */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-amber-500/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto w-full relative z-10 flex flex-col items-center">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-amber-300 text-xs font-bold tracking-[0.15em] uppercase mb-4">
            <Sparkles size={13} className="text-amber-400" />
            <span>SEE MEMENTO IN ACTION</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight mb-4">
            From a Guest&apos;s Phone to the Big Screen in Seconds
          </h2>
          <p className="text-slate-300 text-sm sm:text-base md:text-lg leading-relaxed font-normal">
            Watch how Memento turns wedding guests into real-time contributors without requiring an app download.
          </p>
        </div>

        {/* Sticky Product Demo Container */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center bg-[#091830]/90 border border-white/10 rounded-3xl p-6 sm:p-8 md:p-10 shadow-2xl backdrop-blur-md">
          
          {/* Left Column: 4 Interactive Step Selector Cards */}
          <div className="lg:col-span-5 flex flex-col gap-3 w-full">
            <div className="text-xs font-mono uppercase tracking-widest text-slate-400 mb-2 flex items-center justify-between">
              <span>Interactive Workflow</span>
              <button
                onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                className="text-[11px] text-amber-400 hover:text-amber-300 font-bold transition-colors cursor-pointer"
              >
                {isAutoPlaying ? "⏸ Pause Auto-Play" : "▶ Resume Auto-Play"}
              </button>
            </div>

            {STEPS.map((step, idx) => {
              const isActive = idx === activeStepIndex;
              const Icon = step.icon;

              return (
                <button
                  key={step.id}
                  onClick={() => {
                    setActiveStepIndex(idx);
                    setIsAutoPlaying(false);
                  }}
                  className={`group relative text-left p-4 sm:p-5 rounded-2xl transition-all duration-300 cursor-pointer border ${
                    isActive
                      ? "bg-white/10 border-amber-400/80 shadow-lg shadow-amber-500/10"
                      : "bg-white/[0.03] border-white/5 hover:bg-white/[0.06] hover:border-white/15 opacity-80 hover:opacity-100"
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        isActive
                          ? "bg-amber-400 text-slate-950 font-bold"
                          : "bg-white/10 text-slate-300 group-hover:text-white"
                      }`}
                    >
                      <Icon size={18} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[11px] font-mono font-bold ${isActive ? "text-amber-300" : "text-slate-400"}`}>
                          {step.number}
                        </span>
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/10 text-slate-300 font-medium">
                          {step.badge}
                        </span>
                      </div>

                      <h3 className="font-bold text-white text-sm sm:text-base leading-snug mb-1">
                        {step.title}
                      </h3>

                      {isActive && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="text-slate-300 text-xs sm:text-sm leading-relaxed mt-2 pt-2 border-t border-white/10"
                        >
                          {step.description}
                        </motion.p>
                      )}
                    </div>
                  </div>

                  {/* Active Progress Line */}
                  {isActive && isAutoPlaying && (
                    <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 4.5, ease: "linear" }}
                        className="h-full bg-amber-400"
                      />
                    </div>
                  )}
                </button>
              );
            })}

            {/* Launch Full Demo Modal CTA */}
            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
              <button
                onClick={onOpenDemo}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-[#E5A93C] hover:from-amber-500 hover:to-[#D9932B] text-slate-950 font-bold text-xs sm:text-sm tracking-wide shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Play size={14} className="fill-slate-950" />
                <span>Launch Interactive Demo Screen</span>
              </button>
            </div>
          </div>

          {/* Right Column: Visual Stage (Phone + Big Screen Transition) */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center w-full min-h-[440px] relative">
            <AnimatePresence mode="wait">
              {/* STATE 1: SCAN */}
              {activeStep.id === "scan" && (
                <motion.div
                  key="scan-view"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.35 }}
                  className="w-full max-w-md bg-[#040C1A] border border-white/15 rounded-2xl p-6 shadow-2xl flex flex-col items-center text-center"
                >
                  <div className="w-12 h-12 rounded-2xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-amber-400 mb-4">
                    <QrCode size={26} />
                  </div>
                  <h4 className="text-white font-bold text-lg mb-1">Point &amp; Scan</h4>
                  <p className="text-slate-400 text-xs mb-6 max-w-xs">
                    No app installation. Camera scans custom branded table card.
                  </p>

                  <div className="p-4 bg-white rounded-2xl border-4 border-amber-400/50 shadow-2xl relative">
                    <QRCodeSVG value="https://mymementoapp.com/demo" size={140} />
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#0A2540] text-amber-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-amber-400/40">
                      Priya &amp; Rohan
                    </div>
                  </div>

                  <div className="mt-6 flex items-center gap-2 text-xs text-amber-300 font-mono bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>Instant camera browser opening...</span>
                  </div>
                </motion.div>
              )}

              {/* STATE 2: CAPTURE */}
              {activeStep.id === "capture" && (
                <motion.div
                  key="capture-view"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.35 }}
                  className="w-full max-w-md aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border-2 border-amber-400/40 relative bg-black flex flex-col justify-between p-4"
                >
                  <img
                    src="/landing-hero/photo2.jpg"
                    alt="Phone camera viewfinder"
                    className="absolute inset-0 w-full h-full object-cover opacity-90"
                  />
                  <div className="absolute inset-0 border-2 border-dashed border-amber-400/60 m-3 rounded-xl pointer-events-none" />

                  {/* Top phone bar */}
                  <div className="relative z-10 flex items-center justify-between text-[11px] text-white bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full">
                    <span className="font-semibold">Priya &amp; Rohan&apos;s Wedding</span>
                    <span className="text-amber-300 font-mono">In-Browser Cam</span>
                  </div>

                  {/* Bottom capture trigger */}
                  <div className="relative z-10 flex items-center justify-between text-xs text-white bg-black/70 backdrop-blur-md p-2.5 rounded-xl">
                    <span className="text-slate-300 text-[11px]">Table 4 candid snapshot</span>
                    <div className="w-10 h-10 rounded-full border-2 border-white bg-gradient-to-tr from-amber-400 to-[#E5A93C] flex items-center justify-center text-slate-950 shadow-lg">
                      <Camera size={18} />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STATE 3: SHARE */}
              {activeStep.id === "share" && (
                <motion.div
                  key="share-view"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.35 }}
                  className="w-full max-w-md bg-[#040C1A] border border-white/15 rounded-2xl p-6 shadow-2xl flex flex-col items-center text-center"
                >
                  <div className="w-14 h-14 rounded-full bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300 mb-4 animate-bounce">
                    <Upload size={24} />
                  </div>
                  <h4 className="text-white font-bold text-lg mb-1">Compressing &amp; Syncing</h4>
                  <p className="text-slate-400 text-xs mb-6">
                    Uploading in full resolution with offline queueing support.
                  </p>

                  <div className="w-full bg-white/10 h-2.5 rounded-full overflow-hidden mb-3">
                    <motion.div
                      initial={{ width: "10%" }}
                      animate={{ width: "95%" }}
                      transition={{ duration: 1.8, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-amber-400 to-emerald-400"
                    />
                  </div>
                  <span className="text-xs text-emerald-400 font-mono font-bold flex items-center gap-1.5">
                    <CheckCircle2 size={14} /> Sub-2 second cloud ingestion
                  </span>
                </motion.div>
              )}

              {/* STATE 4: EXPERIENCE */}
              {activeStep.id === "experience" && (
                <motion.div
                  key="experience-view"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.35 }}
                  className="w-full max-w-lg aspect-[16/10] rounded-2xl overflow-hidden shadow-2xl border-4 border-slate-700 relative bg-[#0A1628] flex flex-col justify-between"
                >
                  {/* TV Screen Top Bezel */}
                  <div className="h-8 bg-[#040C1A] flex items-center justify-between px-3 border-b border-white/10 z-20">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                      <span className="text-[10px] font-bold tracking-widest text-white uppercase">LIVE DEMO — SAMPLE EVENT</span>
                    </div>
                    <span className="text-[10px] text-amber-300 font-mono">1080p / 4K Screen Feed</span>
                  </div>

                  {/* Photo Stream Preview */}
                  <div className="p-3 grid grid-cols-3 gap-2 flex-1 relative bg-slate-950/80">
                    <div className="relative rounded-lg overflow-hidden border border-amber-400/80 ring-2 ring-amber-400/40 shadow-lg">
                      <img src="/landing-hero/photo1.jpg" alt="First dance" className="w-full h-full object-cover" />
                      <span className="absolute top-1 right-1 text-[8px] bg-red-500 px-1 py-0.5 rounded text-white font-bold">
                        Just Landed
                      </span>
                    </div>
                    <div className="relative rounded-lg overflow-hidden border border-white/10">
                      <img src="/landing-hero/photo2.jpg" alt="Laughter" className="w-full h-full object-cover" />
                    </div>
                    <div className="relative rounded-lg overflow-hidden border border-white/10">
                      <img src="/landing-hero/photo3.jpg" alt="Table selfie" className="w-full h-full object-cover" />
                    </div>
                    <div className="relative rounded-lg overflow-hidden border border-white/10">
                      <img src="/landing-hero/photo5.jpg" alt="Party" className="w-full h-full object-cover" />
                    </div>
                    <div className="relative rounded-lg overflow-hidden border border-white/10">
                      <img src="/landing-hero/photo7.jpg" alt="Dance floor" className="w-full h-full object-cover" />
                    </div>
                    <div className="relative rounded-lg overflow-hidden border border-white/10">
                      <img src="/landing-hero/photo8.jpg" alt="Celebration" className="w-full h-full object-cover" />
                    </div>
                  </div>

                  {/* Bottom screen ticker */}
                  <div className="h-7 bg-black/80 backdrop-blur-md px-3 flex items-center justify-between text-[10px] text-slate-300 border-t border-white/10 z-20">
                    <span className="truncate">Scan table card to appear live • 184 photos uploaded</span>
                    <span className="text-amber-400 font-bold shrink-0">Priya &amp; Rohan</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

        {/* Prominent Live Working Demo Launcher Button */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 text-center">
          <button
            onClick={onOpenDemo}
            className="px-8 py-4 rounded-full bg-gradient-to-r from-amber-400 to-[#E5A93C] hover:from-amber-500 hover:to-[#D9932B] text-slate-950 font-bold text-sm sm:text-base shadow-xl hover:shadow-amber-500/25 active:scale-95 transition-all flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <Play size={18} className="fill-slate-950 text-slate-950" />
            <span>Launch Interactive Live Demo (Sample Event)</span>
          </button>
          <span className="text-xs text-slate-400 font-medium">
            Test the guest QR scanner &amp; live wall display in your browser
          </span>
        </div>

      </div>
    </section>
  );
}
