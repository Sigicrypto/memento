"use client";

import React from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { 
  Tv, 
  ShieldCheck, 
  Palette, 
  Layers, 
  QrCode, 
  Camera, 
  Download, 
  Music, 
  Sliders, 
  Sparkles, 
  ArrowRight,
  CheckCircle2,
  Lock,
  Zap,
  Globe
} from "lucide-react";
import { useAuthModal } from "@/context/AuthModalContext";

const ThemedNav = dynamic(() => import("@/components/ThemedNav"), { ssr: false });
const Footer = dynamic(() => import("@/components/sections/Footer"), { ssr: false });

export default function FeaturesPage() {
  const { openAuth } = useAuthModal();

  const corePillars = [
    {
      slug: "live",
      title: "Memento Live Wall",
      eyebrow: "Real-Time Display",
      desc: "Transform guest uploads into a living, real-time cinematic slideshow on any TV, projector, or LED wall.",
      icon: <Tv className="text-blue-600" size={28} />,
      points: [
        "Sub-second websocket real-time sync",
        "Curated background audio soundtracks",
        "Works on any smart TV or projector"
      ]
    },
    {
      slug: "moderation",
      title: "Host Moderation",
      eyebrow: "Control & Privacy",
      desc: "Approve or decline photos before they appear on the public screen from your smartphone with a single tap.",
      icon: <ShieldCheck className="text-emerald-600" size={28} />,
      points: [
        "Pre-screen uploads before live display",
        "PIN-protected gallery access",
        "Permanent host data deletion rights"
      ]
    },
    {
      slug: "branding",
      title: "Custom Branding",
      eyebrow: "Theme & Monogram",
      desc: "Match your event's theme with couple monograms, corporate sponsor banners, and custom color accents.",
      icon: <Palette className="text-accent" size={28} />,
      points: [
        "Couple name & wedding monogram overlay",
        "Corporate sponsor banner ads",
        "100% white-label agency subdomains"
      ]
    },
    {
      slug: "layouts",
      title: "Dynamic Layouts",
      eyebrow: "Visual Styles",
      desc: "Choose between animated floating Polaroid cards, dynamic masonry grids, and smooth Ken Burns slideshows.",
      icon: <Layers className="text-purple-600" size={28} />,
      points: [
        "Floating Polaroid cards with captions",
        "Dynamic multi-column masonry wall",
        "Full-screen spotlight reveal animations"
      ]
    }
  ];

  return (
    <>
      <ThemedNav />
      <main className="min-h-screen bg-bg text-text-primary pt-36 sm:pt-44 pb-24 md:pb-32 flex flex-col items-center">
        {/* HERO */}
        <section className="w-full max-w-5xl mx-auto px-4 md:px-8 text-center pt-4 pb-20 md:pb-24 animate-fade-in">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-mono font-bold uppercase tracking-wider mb-6">
            <Sparkles size={14} />
            Complete Feature Catalog
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight font-display text-text-primary leading-tight">
            Everything You Need for a <br className="hidden sm:inline" />
            <span className="text-accent">Live Photo Experience</span>
          </h1>
          <p className="text-text-secondary text-base md:text-xl max-w-2xl mx-auto mt-6 leading-relaxed">
            From instant QR uploads and host moderation to 4K venue projection and 1-click high-res ZIP archives.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
            <button
              onClick={() => openAuth("signup")}
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-accent hover:bg-[#B8882F] text-white font-bold text-sm sm:text-base shadow-[0_4px_16px_rgba(200,150,62,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Create Your Free Event</span>
              <ArrowRight size={18} />
            </button>
            <Link
              href="/contact"
              className="w-full sm:w-auto px-6 py-4 rounded-full border-2 border-border text-text-primary hover:border-accent hover:text-accent font-bold text-sm sm:text-base transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              Consult on WhatsApp
            </Link>
          </div>
        </section>

        {/* 4 CORE PILLARS DEEP-DIVE CARDS */}
        <section className="w-full max-w-6xl mx-auto px-4 md:px-8 py-16 md:py-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {corePillars.map((pillar) => (
              <div
                key={pillar.slug}
                className="bg-surface border border-border hover:border-border-hover rounded-3xl p-8 sm:p-10 shadow-card flex flex-col items-center text-center justify-between transition-all hover:shadow-card-hover"
              >
                <div className="flex flex-col items-center text-center w-full">
                  <div className="flex items-center justify-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-bg-subtle border border-border flex items-center justify-center">
                      {pillar.icon}
                    </div>
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-accent bg-accent/10 px-3 py-1 rounded-full border border-accent/20">
                      {pillar.eyebrow}
                    </span>
                  </div>

                  <h3 className="text-2xl font-black text-text-primary font-display mb-3 text-center">
                    {pillar.title}
                  </h3>

                  <p className="text-text-secondary text-sm sm:text-base leading-relaxed mb-6 text-center">
                    {pillar.desc}
                  </p>

                  <ul className="space-y-2.5 mb-8 flex flex-col items-center">
                    {pillar.points.map((pt, i) => (
                      <li key={i} className="flex items-center gap-2.5 text-xs sm:text-sm text-text-secondary text-center">
                        <CheckCircle2 size={16} className="text-accent shrink-0" />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  href={`/features/${pillar.slug}`}
                  className="inline-flex items-center justify-center gap-2 text-accent hover:text-[#B8882F] font-bold text-sm pt-4 border-t border-border group w-full text-center"
                >
                  <span>Explore {pillar.title} Deep-Dive</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* COMPREHENSIVE CAPABILITIES GRID */}
        <section className="w-full max-w-5xl mx-auto px-4 md:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-black text-text-primary font-display text-center">
              Complete Feature Comparison Checklist
            </h2>
            <p className="text-text-secondary text-sm mt-2 text-center">
              Every tool crafted to give event hosts peace of mind and guests pure joy.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-surface border border-border shadow-sm flex flex-col items-center text-center">
              <QrCode className="text-accent mb-3 mx-auto" size={24} />
              <h4 className="font-bold text-base text-text-primary mb-1 text-center">Printable QR Assets</h4>
              <p className="text-text-secondary text-xs leading-relaxed text-center">
                Download printable PDF table tent cards, welcome signage, and coasters tailored with your event URL.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-surface border border-border shadow-sm flex flex-col items-center text-center">
              <Camera className="text-purple-600 mb-3 mx-auto" size={24} />
              <h4 className="font-bold text-base text-text-primary mb-1 text-center">Browser Camera</h4>
              <p className="text-text-secondary text-xs leading-relaxed text-center">
                Zero app installs. Launches immediately in Safari, Chrome, and Samsung Internet with high-res capture.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-surface border border-border shadow-sm flex flex-col items-center text-center">
              <Tv className="text-blue-600 mb-3 mx-auto" size={24} />
              <h4 className="font-bold text-base text-text-primary mb-1 text-center">Projector Presentation Mode</h4>
              <p className="text-text-secondary text-xs leading-relaxed text-center">
                Plug in any laptop or TV via HDMI. Press F11 for an automated 4K live slideshow with zero chrome.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-surface border border-border shadow-sm flex flex-col items-center text-center">
              <Music className="text-pink-600 mb-3 mx-auto" size={24} />
              <h4 className="font-bold text-base text-text-primary mb-1 text-center">Curated Audio Tracks</h4>
              <p className="text-text-secondary text-xs leading-relaxed text-center">
                Built-in romantic acoustic, elegant piano, and upbeat party tracks to elevate live screen atmosphere.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-surface border border-border shadow-sm flex flex-col items-center text-center">
              <Download className="text-amber-600 mb-3 mx-auto" size={24} />
              <h4 className="font-bold text-base text-text-primary mb-1 text-center">Bulk 4K ZIP Download</h4>
              <p className="text-text-secondary text-xs leading-relaxed text-center">
                Download every photo and video in full original camera resolution the morning after your event.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-surface border border-border shadow-sm flex flex-col items-center text-center">
              <Globe className="text-emerald-600 mb-3 mx-auto" size={24} />
              <h4 className="font-bold text-base text-text-primary mb-1 text-center">Custom Domain Mapping</h4>
              <p className="text-text-secondary text-xs leading-relaxed text-center">
                Connect your agency or corporate domain (e.g. live.yourbrand.com) with 100% white-labeling.
              </p>
            </div>
          </div>
        </section>

        {/* BOTTOM CTA */}
        <section className="w-full max-w-5xl mx-auto px-4 md:px-8 py-16 md:py-24 text-center">
          <div className="bg-bg-subtle border border-border rounded-3xl p-8 sm:p-12 shadow-card">
            <h2 className="text-2xl sm:text-4xl font-black text-text-primary font-display">
              Ready to Upgrade Your Event Entertainment?
            </h2>
            <p className="text-text-secondary text-sm sm:text-base max-w-xl mx-auto mt-3">
              Set up your live photo wall in 30 seconds or chat with our team on WhatsApp.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
              <button
                onClick={() => openAuth("signup")}
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-accent hover:bg-[#B8882F] text-white font-bold text-sm shadow-[0_4px_16px_rgba(200,150,62,0.3)] transition-all cursor-pointer"
              >
                Create Your Free Event
              </button>
              <Link
                href="/contact"
                className="w-full sm:w-auto px-6 py-4 rounded-full border border-border bg-surface hover:border-accent text-text-primary font-bold text-sm transition-all"
              >
                Ask Questions on WhatsApp
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
