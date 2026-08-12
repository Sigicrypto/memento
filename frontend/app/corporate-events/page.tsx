"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { Building2, Share2, Shield, QrCode, Sparkles, BarChart, ArrowRight } from "lucide-react";
import { useAuthModal } from "@/context/AuthModalContext";

const ThemedNav = dynamic(() => import("@/components/ThemedNav"), { ssr: false });
const Footer = dynamic(() => import("@/components/sections/Footer"), { ssr: false });
const DemoModal = dynamic(() => import("@/components/DemoModal"), { ssr: false });

export default function CorporateEventsPage() {
  const { openAuth } = useAuthModal();
  const [isDemoOpen, setIsDemoOpen] = useState(false);

  return (
    <>
      <ThemedNav />
      <main className="min-h-screen bg-slate-950 text-white pt-28 pb-16">
        
        {/* HERO */}
        <section className="relative px-4 md:px-8 py-16 flex flex-col items-center text-center">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/10 blur-[130px] rounded-full pointer-events-none" />

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-extrabold tracking-wider uppercase mb-6">
            <Building2 size={14} className="text-blue-400" />
            Conferences, Launches & Exhibitions
          </span>

          <h1 className="text-4xl md:text-6xl font-black tracking-tight max-w-4xl leading-tight">
            Turn your attendees into <br />
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
              your content team.
            </span>
          </h1>

          <p className="text-slate-300 text-base md:text-xl max-w-2xl mt-6 font-medium leading-relaxed">
            Drive organic event engagement and collect powerful User-Generated Content (UGC) with a branded live photo wall.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 mt-8">
            <button
              onClick={() => openAuth("signup")}
              className="px-8 py-4 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-extrabold text-sm tracking-wide shadow-lg shadow-blue-500/30 hover:scale-105 transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Create Corporate Event</span>
              <ArrowRight size={18} />
            </button>
            <button
              onClick={() => setIsDemoOpen(true)}
              className="px-6 py-4 rounded-full bg-white/10 hover:bg-white/15 border border-white/20 text-white font-extrabold text-sm tracking-wide transition-all"
            >
              Try Live Demo
            </button>
          </div>
        </section>

        {/* CORPORATE FEATURES */}
        <section className="py-16 px-4 md:px-8 border-t border-white/5 max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-white">Enterprise Event Engagement</h2>
            <p className="text-slate-400 text-sm mt-2">Tailored for product launches, summits, and brand activations</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/10 text-center flex flex-col items-center">
              <Sparkles size={24} className="text-blue-400 mb-4" />
              <h3 className="text-white font-bold text-base mb-1">Branded Live Screen</h3>
              <p className="text-slate-400 text-xs leading-relaxed">Display corporate sponsor banners, conference logos, and custom event hashtags on main screens.</p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/10 text-center flex flex-col items-center">
              <QrCode size={24} className="text-cyan-400 mb-4" />
              <h3 className="text-white font-bold text-base mb-1">Instant QR Activation</h3>
              <p className="text-slate-400 text-xs leading-relaxed">Embed QR codes on attendee badges, booth screens, and presentation slides for seamless uploads.</p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/10 text-center flex flex-col items-center">
              <Share2 size={24} className="text-emerald-400 mb-4" />
              <h3 className="text-white font-bold text-base mb-1">UGC Rights & Collection</h3>
              <p className="text-slate-400 text-xs leading-relaxed">Collect high-res photo and video assets from attendees for post-event marketing and press releases.</p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/10 text-center flex flex-col items-center">
              <Shield size={24} className="text-amber-400 mb-4" />
              <h3 className="text-white font-bold text-base mb-1">Strict Moderation Controls</h3>
              <p className="text-slate-400 text-xs leading-relaxed">Real-time host moderation panel to ensure all content matches brand standards before broadcast.</p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/10 text-center flex flex-col items-center">
              <BarChart size={24} className="text-pink-400 mb-4" />
              <h3 className="text-white font-bold text-base mb-1">Engagement Analytics</h3>
              <p className="text-slate-400 text-xs leading-relaxed">Export post-event reports showing total uploads, peak photo hours, and engagement velocity.</p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/10 text-center flex flex-col items-center">
              <Building2 size={24} className="text-purple-400 mb-4" />
              <h3 className="text-white font-bold text-base mb-1">Multi-Stage Support</h3>
              <p className="text-slate-400 text-xs leading-relaxed">Run separate live walls for main stage keynote, break-out tracks, and expo floors.</p>
            </div>
          </div>
        </section>

      </main>
      <Footer />
      {isDemoOpen && <DemoModal isOpen={isDemoOpen} onClose={() => setIsDemoOpen(false)} />}
    </>
  );
}
