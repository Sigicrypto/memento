"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { Heart, QrCode, Camera, Tv, Sparkles, ShieldCheck, Download, ArrowRight } from "lucide-react";
import { useAuthModal } from "@/context/AuthModalContext";

const ThemedNav = dynamic(() => import("@/components/ThemedNav"), { ssr: false });
const Footer = dynamic(() => import("@/components/sections/Footer"), { ssr: false });
const DemoModal = dynamic(() => import("@/components/DemoModal"), { ssr: false });

export default function WeddingsPage() {
  const { openAuth } = useAuthModal();
  const [isDemoOpen, setIsDemoOpen] = useState(false);

  return (
    <>
      <ThemedNav />
      <main className="min-h-screen w-full flex flex-col items-center overflow-x-hidden bg-slate-950 text-white pt-28 pb-16">
        
        {/* HERO */}
        <section className="relative w-full max-w-7xl px-4 md:px-8 py-16 flex flex-col items-center text-center">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-pink-500/10 blur-[130px] rounded-full pointer-events-none" />

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-400 text-xs font-extrabold tracking-wider uppercase mb-6">
            <Heart size={14} className="fill-pink-400 text-pink-400" />
            Weddings & Celebrations
          </span>

          <h1 className="text-4xl md:text-6xl font-black tracking-tight max-w-4xl leading-tight">
            Your photographer can't be everywhere. <br />
            <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-amber-300 bg-clip-text text-transparent">
              Your guests can.
            </span>
          </h1>

          <p className="text-slate-300 text-base md:text-xl max-w-2xl mt-6 font-medium leading-relaxed">
            Bring every guest's perspective into one beautiful wedding memory. No app downloads, no account setup, just pure magic.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 mt-8">
            <button
              onClick={() => openAuth("signup")}
              className="px-8 py-4 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white font-extrabold text-sm tracking-wide shadow-lg shadow-pink-500/30 hover:scale-105 transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Create Your Wedding Memento</span>
              <ArrowRight size={18} />
            </button>
            <button
              onClick={() => setIsDemoOpen(true)}
              className="px-6 py-4 rounded-full bg-white/10 hover:bg-white/15 border border-white/20 text-white font-extrabold text-sm tracking-wide transition-all"
            >
              See Live Demo
            </button>
          </div>
        </section>

        {/* WEDDING FLOW */}
        <section className="py-16 px-4 md:px-8 border-t border-white/5 w-full flex justify-center">
          <div className="w-full max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-white">How Wedding Memento Works</h2>
            <p className="text-slate-400 text-sm mt-2">Simple 4-step setup for your big day</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/10 text-center flex flex-col items-center">
              <QrCode size={24} className="text-pink-400 mb-4" />
              <h3 className="text-white font-bold text-base mb-1">1. Wedding QR</h3>
              <p className="text-slate-400 text-xs leading-relaxed">Place elegant printable QR cards on guest tables and welcome boards.</p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/10 text-center flex flex-col items-center">
              <Camera size={24} className="text-cyan-400 mb-4" />
              <h3 className="text-white font-bold text-base mb-1">2. Guest Uploads</h3>
              <p className="text-slate-400 text-xs leading-relaxed">Guests scan and upload photos directly from their phone camera with zero apps.</p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/10 text-center flex flex-col items-center">
              <Tv size={24} className="text-purple-400 mb-4" />
              <h3 className="text-white font-bold text-base mb-1">3. Live Wall</h3>
              <p className="text-slate-400 text-xs leading-relaxed">Display photos live on venue screens or TV screens during reception.</p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/10 text-center flex flex-col items-center">
              <Download size={24} className="text-amber-400 mb-4" />
              <h3 className="text-white font-bold text-base mb-1">4. Full Digital Album</h3>
              <p className="text-slate-400 text-xs leading-relaxed">Download every single photo and video clip in full original resolution after the wedding.</p>
            </div>
          </div>
          </div>
        </section>

        {/* FEATURES FOR WEDDINGS */}
        <section className="py-16 px-4 md:px-8 border-t border-white/5 bg-slate-900/40 w-full flex flex-col items-center">
          <div className="w-full max-w-5xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-extrabold text-white">Designed for Peace of Mind</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-slate-900 border border-white/10 text-center flex flex-col items-center">
                <ShieldCheck className="text-emerald-400 mb-3" size={24} />
                <h4 className="text-white font-bold text-sm mb-1">Optional Host Moderation</h4>
                <p className="text-slate-400 text-xs">Approve photos before they display on screen so everything stays appropriate.</p>
              </div>
              <div className="p-6 rounded-2xl bg-slate-900 border border-white/10 text-center flex flex-col items-center">
                <Sparkles className="text-purple-400 mb-3" size={24} />
                <h4 className="text-white font-bold text-sm mb-1">Custom Couple Branding</h4>
                <p className="text-slate-400 text-xs">Customize the live wall background, colors, and add your wedding couple logo.</p>
              </div>
              <div className="p-6 rounded-2xl bg-slate-900 border border-white/10 text-center flex flex-col items-center">
                <Heart className="text-pink-400 mb-3" size={24} />
                <h4 className="text-white font-bold text-sm mb-1">Private & Secure Vault</h4>
                <p className="text-slate-400 text-xs">Password-protect your wedding gallery so only invited family and guests can access it.</p>
              </div>
            </div>
          </div>
        </section>

      </main>
      <Footer />
      {isDemoOpen && <DemoModal isOpen={isDemoOpen} onClose={() => setIsDemoOpen(false)} />}
    </>
  );
}

