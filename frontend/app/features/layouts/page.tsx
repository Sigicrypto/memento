"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { 
  Layers, 
  Tv, 
  Sparkles, 
  Grid, 
  Maximize2, 
  ArrowLeft, 
  ArrowRight, 
  ShieldCheck, 
  Palette 
} from "lucide-react";
import { useAuthModal } from "@/context/AuthModalContext";

const ThemedNav = dynamic(() => import("@/components/ThemedNav"), { ssr: false });
const Footer = dynamic(() => import("@/components/sections/Footer"), { ssr: false });
const DemoModal = dynamic(() => import("@/components/DemoModal"), { ssr: false });

export default function LayoutsFeaturePage() {
  const { openAuth } = useAuthModal();
  const [isDemoOpen, setIsDemoOpen] = useState(false);

  return (
    <>
      <ThemedNav />
      <main className="min-h-screen bg-bg text-text-primary pt-28 pb-20 flex flex-col items-center">
        {/* HEADER */}
        <section className="w-full max-w-5xl mx-auto px-4 md:px-8 pt-8 pb-12 text-center animate-fade-in">
          <div className="mb-6 flex justify-center">
            <Link
              href="/features"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-secondary hover:text-accent transition-colors"
            >
              <ArrowLeft size={14} /> Back to Feature Catalog
            </Link>
          </div>

          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/25 text-purple-700 text-xs font-mono font-bold uppercase tracking-wider mb-6">
            <Layers size={14} className="text-purple-600" />
            Presentation Modes & Animations
          </span>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight font-display text-text-primary leading-tight">
            Display Layouts: Dynamic Visuals <br className="hidden sm:inline" />
            <span className="text-accent">for Any Venue Screen</span>
          </h1>

          <p className="text-text-secondary text-base md:text-xl max-w-2xl mx-auto mt-6 leading-relaxed">
            Choose between animated floating Polaroid cards, dynamic multi-column masonry grids, and smooth Ken Burns slideshows.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
            <button
              onClick={() => setIsDemoOpen(true)}
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-accent hover:bg-[#B8882F] text-white font-bold text-sm sm:text-base shadow-[0_4px_16px_rgba(200,150,62,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Test Layouts in Demo</span>
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

        {/* 4 CORE LAYOUTS */}
        <section className="w-full max-w-5xl mx-auto px-4 md:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-surface border border-border rounded-2xl p-7 shadow-card flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center mb-4 mx-auto">
                <Layers size={24} />
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-2 text-center">Floating Polaroid Cards</h3>
              <p className="text-text-secondary text-sm leading-relaxed text-center">
                Nostalgic retro charm. Photos float onto the screen styled as Polaroid prints with drop shadows, organic rotation angles, and guest captions.
              </p>
            </div>

            <div className="bg-surface border border-border rounded-2xl p-7 shadow-card flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center mb-4 mx-auto">
                <Grid size={24} />
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-2 text-center">Dynamic Masonry Wall</h3>
              <p className="text-text-secondary text-sm leading-relaxed text-center">
                Dense, high-energy photo mosaic. Intelligently calculates aspect ratios across portrait, landscape, and square uploads with smooth reflow animations.
              </p>
            </div>

            <div className="bg-surface border border-border rounded-2xl p-7 shadow-card flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-xl bg-accent/10 text-accent flex items-center justify-center mb-4 mx-auto">
                <Sparkles size={24} />
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-2 text-center">Cinematic Ken Burns Slideshow</h3>
              <p className="text-text-secondary text-sm leading-relaxed text-center">
                Smooth cinematic pan-and-zoom transitions. Ideal for wedding dinner banquets, black-tie galas, and romantic couple spotlight sessions.
              </p>
            </div>

            <div className="bg-surface border border-border rounded-2xl p-7 shadow-card flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-4 mx-auto">
                <Maximize2 size={24} />
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-2 text-center">Full-Screen Spotlight Mode</h3>
              <p className="text-text-secondary text-sm leading-relaxed text-center">
                Whenever a new photo arrives, it flashes full-screen for 5 seconds with uploader name before smoothly sliding into the ongoing live gallery stream.
              </p>
            </div>
          </div>
        </section>

        {/* RELATED FEATURES */}
        <section className="w-full max-w-5xl mx-auto px-4 md:px-8 py-12 border-t border-border mt-12 text-center flex flex-col items-center">
          <h3 className="text-xl font-bold text-text-primary font-display mb-6 text-center">
            Explore More Capabilities
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
            <Link
              href="/features/live"
              className="p-6 rounded-2xl bg-surface border border-border hover:border-accent transition-all shadow-sm group flex flex-col items-center text-center"
            >
              <Tv className="text-blue-600 mb-2 mx-auto" size={24} />
              <h4 className="font-bold text-base text-text-primary group-hover:text-accent mb-1 text-center">Memento Live Wall</h4>
              <p className="text-text-secondary text-xs leading-relaxed text-center">Sub-second photo streaming on any venue screen.</p>
            </Link>

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
              <Palette className="text-accent mb-2 mx-auto" size={24} />
              <h4 className="font-bold text-base text-text-primary group-hover:text-accent mb-1 text-center">Custom Branding</h4>
              <p className="text-text-secondary text-xs leading-relaxed text-center">Couple monograms, corporate sponsors, and white-label domains.</p>
            </Link>
          </div>
        </section>
      </main>

      {isDemoOpen && <DemoModal isOpen={isDemoOpen} onClose={() => setIsDemoOpen(false)} />}
      <Footer />
    </>
  );
}
