"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { 
  Tv, 
  Zap, 
  Music, 
  Wifi, 
  ArrowLeft, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Layers, 
  CheckCircle2 
} from "lucide-react";
import { useAuthModal } from "@/context/AuthModalContext";

const ThemedNav = dynamic(() => import("@/components/ThemedNav"), { ssr: false });
const Footer = dynamic(() => import("@/components/sections/Footer"), { ssr: false });
const DemoModal = dynamic(() => import("@/components/DemoModal"), { ssr: false });

export default function LiveFeaturePage() {
  const { openAuth } = useAuthModal();
  const [isDemoOpen, setIsDemoOpen] = useState(false);

  return (
    <>
      <ThemedNav />
      <main className="min-h-screen bg-bg text-text-primary pt-36 sm:pt-44 pb-24 md:pb-32 flex flex-col items-center">
        {/* HEADER */}
        <section className="w-full max-w-5xl mx-auto px-4 md:px-8 pt-4 pb-16 md:pb-20 text-center animate-fade-in">
          <div className="mb-6 flex justify-center">
            <Link
              href="/features"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-secondary hover:text-accent transition-colors"
            >
              <ArrowLeft size={14} /> Back to Feature Catalog
            </Link>
          </div>

          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-700 text-xs font-mono font-bold uppercase tracking-wider mb-6">
            <Tv size={14} className="text-blue-600" />
            Flagship Display Technology
          </span>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight font-display text-text-primary leading-tight">
            Memento Live Wall: Sub-Second <br className="hidden sm:inline" />
            <span className="text-accent">Photo Display for Any Screen</span>
          </h1>

          <p className="text-text-secondary text-base md:text-xl max-w-2xl mx-auto mt-6 leading-relaxed">
            Turn venue projectors, LED walls, and smart TVs into an interactive, real-time photo show as guests upload from their phones.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
            <button
              onClick={() => setIsDemoOpen(true)}
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-accent hover:bg-[#B8882F] text-white font-bold text-sm sm:text-base shadow-[0_4px_16px_rgba(200,150,62,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Test Interactive Live Wall</span>
              <ArrowRight size={18} />
            </button>
            <button
              onClick={() => openAuth("signup")}
              className="w-full sm:w-auto px-6 py-4 rounded-full border border-border bg-surface hover:border-accent text-text-primary font-bold text-sm sm:text-base transition-all"
            >
              Create Free Event
            </button>
          </div>
        </section>

        {/* 4 CORE ADVANTAGES */}
        <section className="w-full max-w-5xl mx-auto px-4 md:px-8 py-16 md:py-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-surface border border-border rounded-2xl p-7 shadow-card flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center mb-4 mx-auto">
                <Zap size={24} />
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-2 text-center">Sub-Second Real-Time Sync</h3>
              <p className="text-text-secondary text-sm leading-relaxed text-center">
                Powered by Supabase realtime websockets. When a guest taps upload on their phone, the image processes in under 2 seconds and animates onto the screen seamlessly.
              </p>
            </div>

            <div className="bg-surface border border-border rounded-2xl p-7 shadow-card flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center mb-4 mx-auto">
                <Tv size={24} />
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-2 text-center">Works on Any Display Hardware</h3>
              <p className="text-text-secondary text-sm leading-relaxed text-center">
                Compatible with any web-enabled device: HDMI laptop connected to venue projectors, smart TVs with built-in browsers, and wireless AirPlay or Chromecast streaming.
              </p>
            </div>

            <div className="bg-surface border border-border rounded-2xl p-7 shadow-card flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-xl bg-pink-500/10 text-pink-600 flex items-center justify-center mb-4 mx-auto">
                <Music size={24} />
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-2 text-center">Curated Background Soundtracks</h3>
              <p className="text-text-secondary text-sm leading-relaxed text-center">
                Choose from acoustic guitar, elegant romantic piano, and upbeat festival party tracks. Music loops seamlessly with slideshow transitions.
              </p>
            </div>

            <div className="bg-surface border border-border rounded-2xl p-7 shadow-card flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-4 mx-auto">
                <Wifi size={24} />
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-2 text-center">Venue Wi-Fi Resilient</h3>
              <p className="text-text-secondary text-sm leading-relaxed text-center">
                Built-in exponential backoff and client-side image cache ensures that spotty banquet Wi-Fi never interrupts your live presentation wall.
              </p>
            </div>
          </div>
        </section>

        {/* RELATED FEATURES */}
        <section className="w-full max-w-5xl mx-auto px-4 md:px-8 py-16 md:py-24 border-t border-border mt-16 text-center flex flex-col items-center">
          <h3 className="text-xl font-bold text-text-primary font-display mb-6 text-center">
            Explore More Capabilities
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
            <Link
              href="/features/moderation"
              className="p-6 rounded-2xl bg-surface border border-border hover:border-accent transition-all shadow-sm group flex flex-col items-center text-center"
            >
              <ShieldCheck className="text-emerald-600 mb-2 mx-auto" size={24} />
              <h4 className="font-bold text-base text-text-primary group-hover:text-accent mb-1 text-center">Host Moderation</h4>
              <p className="text-text-secondary text-xs leading-relaxed text-center">Pre-approve guest photos before they display on the big screen.</p>
            </Link>

            <Link
              href="/features/branding"
              className="p-6 rounded-2xl bg-surface border border-border hover:border-accent transition-all shadow-sm group flex flex-col items-center text-center"
            >
              <Sparkles className="text-accent mb-2 mx-auto" size={24} />
              <h4 className="font-bold text-base text-text-primary group-hover:text-accent mb-1 text-center">Custom Branding</h4>
              <p className="text-text-secondary text-xs leading-relaxed text-center">Couple monograms, corporate sponsors, and white-label domains.</p>
            </Link>

            <Link
              href="/features/layouts"
              className="p-6 rounded-2xl bg-surface border border-border hover:border-accent transition-all shadow-sm group flex flex-col items-center text-center"
            >
              <Layers className="text-purple-600 mb-2 mx-auto" size={24} />
              <h4 className="font-bold text-base text-text-primary group-hover:text-accent mb-1 text-center">Display Layouts</h4>
              <p className="text-text-secondary text-xs leading-relaxed text-center">Polaroids, masonry walls, and cinematic slideshow styles.</p>
            </Link>
          </div>
        </section>
      </main>

      {isDemoOpen && <DemoModal isOpen={isDemoOpen} onClose={() => setIsDemoOpen(false)} />}
      <Footer />
    </>
  );
}
