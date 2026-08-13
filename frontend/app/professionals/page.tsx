"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { Briefcase, Shield, Layers, Users, BarChart3, Palette, Globe, Check, ArrowRight } from "lucide-react";
import { useAuthModal } from "@/context/AuthModalContext";

const ThemedNav = dynamic(() => import("@/components/ThemedNav"), { ssr: false });
const Footer = dynamic(() => import("@/components/sections/Footer"), { ssr: false });
const PartnerProgramModal = dynamic(() => import("@/components/PartnerProgramModal"), { ssr: false });

export default function ProfessionalsPage() {
  const { openAuth } = useAuthModal();
  const [isPartnerOpen, setIsPartnerOpen] = useState(false);

  return (
    <>
      <ThemedNav />
      <main className="min-h-screen w-full flex flex-col items-center overflow-x-hidden bg-slate-950 text-white pt-28 pb-16">
        
        {/* HERO */}
        <section className="relative w-full max-w-7xl px-4 md:px-8 py-16 flex flex-col items-center text-center">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-500/10 blur-[130px] rounded-full pointer-events-none" />

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-extrabold tracking-wider uppercase mb-6">
            <Briefcase size={14} className="text-purple-400" />
            For Photographers, Planners & Agencies
          </span>

          <h1 className="text-4xl md:text-6xl font-black tracking-tight max-w-4xl leading-tight">
            Give Every Client a <br />
            <span className="bg-gradient-to-r from-purple-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
              White-Label Memento.
            </span>
          </h1>

          <p className="text-slate-300 text-base md:text-xl max-w-2xl mt-6 font-medium leading-relaxed">
            Give your clients a premium guest-photo experience while keeping everything under your own agency brand.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 mt-8">
            <button
              onClick={() => openAuth("signup")}
              className="px-8 py-4 rounded-full bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-extrabold text-sm tracking-wide shadow-lg shadow-purple-500/30 hover:scale-105 transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Become a Memento Partner</span>
              <ArrowRight size={18} />
            </button>
            <button
              onClick={() => setIsPartnerOpen(true)}
              className="px-6 py-4 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-extrabold text-sm tracking-wide transition-all"
            >
              Learn 10% Reseller Program
            </button>
          </div>
        </section>

        {/* PROFESSIONAL CAPABILITIES */}
        <section className="w-full max-w-6xl py-16 px-4 md:px-8 border-t border-white/5">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-white">Built for Event Businesses</h2>
            <p className="text-slate-400 text-sm mt-2">Manage multiple client events effortlessly</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/10 text-center flex flex-col items-center">
              <Layers size={24} className="text-purple-400 mb-4" />
              <h3 className="text-white font-bold text-base mb-1">Multi-Event Dashboard</h3>
              <p className="text-slate-400 text-xs leading-relaxed">Launch and monitor dozens of events simultaneously from a single unified portal.</p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/10 text-center flex flex-col items-center">
              <Palette size={24} className="text-cyan-400 mb-4" />
              <h3 className="text-white font-bold text-base mb-1">Full White-Labeling</h3>
              <p className="text-slate-400 text-xs leading-relaxed">Remove all Memento logos. Display your agency name and custom brand styling.</p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/10 text-center flex flex-col items-center">
              <Globe size={24} className="text-emerald-400 mb-4" />
              <h3 className="text-white font-bold text-base mb-1">Custom Domain Connection</h3>
              <p className="text-slate-400 text-xs leading-relaxed">Serve client galleries under your custom subdomain (e.g. live.youragency.com).</p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/10 text-center flex flex-col items-center">
              <Users size={24} className="text-amber-400 mb-4" />
              <h3 className="text-white font-bold text-base mb-1">Client Management</h3>
              <p className="text-slate-400 text-xs leading-relaxed">Grant clients view-only or moderator permissions to their specific event dashboard.</p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/10 text-center flex flex-col items-center">
              <BarChart3 size={24} className="text-pink-400 mb-4" />
              <h3 className="text-white font-bold text-base mb-1">Event Analytics</h3>
              <p className="text-slate-400 text-xs leading-relaxed">Track upload velocity, guest engagement metrics, and download reports for your clients.</p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/10 text-center flex flex-col items-center">
              <Shield size={24} className="text-blue-400 mb-4" />
              <h3 className="text-white font-bold text-base mb-1">Priority Support</h3>
              <p className="text-slate-400 text-xs leading-relaxed">Dedicated 24/7 channel and concierge setup assistance for live event activations.</p>
            </div>
          </div>
        </section>

      </main>
      <Footer />
      <PartnerProgramModal isOpen={isPartnerOpen} onClose={() => setIsPartnerOpen(false)} />
    </>
  );
}

