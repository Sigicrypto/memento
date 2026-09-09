"use client";

import React from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { 
  Palette, 
  Heart, 
  Building2, 
  Globe, 
  Sliders, 
  ArrowLeft, 
  ArrowRight, 
  Tv, 
  ShieldCheck, 
  Layers 
} from "lucide-react";
import { useAuthModal } from "@/context/AuthModalContext";

const ThemedNav = dynamic(() => import("@/components/ThemedNav"), { ssr: false });
const Footer = dynamic(() => import("@/components/sections/Footer"), { ssr: false });

export default function BrandingFeaturePage() {
  const { openAuth } = useAuthModal();

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

          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-mono font-bold uppercase tracking-wider mb-6">
            <Palette size={14} />
            Visual Identity & Personalization
          </span>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight font-display text-text-primary leading-tight">
            Custom Branding: Your Event, <br className="hidden sm:inline" />
            <span className="text-accent">Your Aesthetic, Your Story</span>
          </h1>

          <p className="text-text-secondary text-base md:text-xl max-w-2xl mx-auto mt-6 leading-relaxed">
            From elegant wedding monograms to corporate sponsor banners and custom agency domain mapping.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
            <button
              onClick={() => openAuth("signup")}
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-accent hover:bg-[#B8882F] text-white font-bold text-sm sm:text-base shadow-[0_4px_16px_rgba(200,150,62,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Design Your Branded Event</span>
              <ArrowRight size={18} />
            </button>
            <Link
              href="/contact"
              className="w-full sm:w-auto px-6 py-4 rounded-full border border-border bg-surface hover:border-accent text-text-primary font-bold text-sm sm:text-base transition-all"
            >
              Consult on White-Labeling
            </Link>
          </div>
        </section>

        {/* 4 CORE ADVANTAGES */}
        <section className="w-full max-w-5xl mx-auto px-4 md:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-surface border border-border rounded-2xl p-7 shadow-card flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-xl bg-pink-500/10 text-pink-600 flex items-center justify-center mb-4 mx-auto">
                <Heart size={24} />
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-2 text-center">Couple Names & Monograms</h3>
              <p className="text-text-secondary text-sm leading-relaxed text-center">
                Add your names, wedding date, monogram crest, and custom hashtags directly onto the live display banner and guest upload header.
              </p>
            </div>

            <div className="bg-surface border border-border rounded-2xl p-7 shadow-card flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center mb-4 mx-auto">
                <Building2 size={24} />
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-2 text-center">Corporate Sponsor Overlays</h3>
              <p className="text-text-secondary text-sm leading-relaxed text-center">
                Seamlessly display title sponsor logos, booth numbers, and product promo banners around the presentation border for high-ROI event visibility.
              </p>
            </div>

            <div className="bg-surface border border-border rounded-2xl p-7 shadow-card flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-xl bg-accent/10 text-accent flex items-center justify-center mb-4 mx-auto">
                <Sliders size={24} />
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-2 text-center">Tailored Color Accents</h3>
              <p className="text-text-secondary text-sm leading-relaxed text-center">
                Match your wedding floral palette or brand style guide. Choose from curated gold, rose, emerald, midnight, and custom hex accents.
              </p>
            </div>

            <div className="bg-surface border border-border rounded-2xl p-7 shadow-card flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center mb-4 mx-auto">
                <Globe size={24} />
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-2 text-center">100% White-Label Domain</h3>
              <p className="text-text-secondary text-sm leading-relaxed text-center">
                For planners and agencies: map your own CNAME record (e.g. live.yourstudio.com). Remove all Memento branding so clients think you built it.
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
      <Footer />
    </>
  );
}
