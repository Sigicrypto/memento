"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { 
  Building2, 
  Share2, 
  ShieldCheck, 
  QrCode, 
  Sparkles, 
  BarChart3, 
  ArrowRight,
  Sliders,
  Download,
  MessageSquare
} from "lucide-react";
import { useAuthModal } from "@/context/AuthModalContext";

const ThemedNav = dynamic(() => import("@/components/ThemedNav"), { ssr: false });
const Footer = dynamic(() => import("@/components/sections/Footer"), { ssr: false });
const DemoModal = dynamic(() => import("@/components/DemoModal"), { ssr: false });

export default function CorporateEventsPage() {
  const { openAuth } = useAuthModal();
  const [isDemoOpen, setIsDemoOpen] = useState(false);

  const capabilities = [
    {
      icon: <QrCode className="text-accent" size={24} />,
      title: "Badge & Presentation QR",
      desc: "Flash QR codes on speaker slides, attendee lanyards, and digital signage to drive instant audience participation."
    },
    {
      icon: <Sliders className="text-blue-600" size={24} />,
      title: "Sponsor Logos & Co-Branding",
      desc: "Integrate official corporate logos, title sponsor branding, and conference hashtags directly into the live display."
    },
    {
      icon: <ShieldCheck className="text-emerald-600" size={24} />,
      title: "Strict Host Moderation",
      desc: "Prevent accidental or inappropriate uploads with a dedicated real-time host approval queue before screen projection."
    },
    {
      icon: <BarChart3 className="text-purple-600" size={24} />,
      title: "Audience Engagement Metrics",
      desc: "Track total uploads, active contributing attendees, peak sharing hours, and live screen impressions."
    },
    {
      icon: <Share2 className="text-pink-600" size={24} />,
      title: "UGC Rights & Brand Assets",
      desc: "Collect high-impact authentic attendee photos and video reels ready for social media PR, recap reels, and newsletters."
    },
    {
      icon: <Download className="text-amber-600" size={24} />,
      title: "Instant 4K Cloud Download",
      desc: "Download all high-resolution event media in a structured ZIP archive directly after the event wraps up."
    }
  ];

  return (
    <>
      <ThemedNav />
      <main className="min-h-screen bg-bg text-text-primary pt-28 pb-20 flex flex-col items-center">
        {/* HERO */}
        <section className="w-full max-w-5xl mx-auto px-4 md:px-8 text-center pt-8 pb-16 animate-fade-in">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-700 text-xs font-mono font-bold uppercase tracking-wider mb-6">
            <Building2 size={14} className="text-blue-600" />
            Corporate Galas, Conferences & Launches
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight font-display text-text-primary leading-tight">
            Turn your attendees into <br className="hidden sm:inline" />
            <span className="text-accent">your content team.</span>
          </h1>
          <p className="text-text-secondary text-base md:text-xl max-w-2xl mx-auto mt-6 leading-relaxed">
            Drive organic event engagement and collect powerful User-Generated Content (UGC) with a branded, moderated live photo wall.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
            <button
              onClick={() => openAuth("signup")}
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-accent hover:bg-[#B8882F] text-white font-bold text-sm sm:text-base shadow-[0_4px_16px_rgba(200,150,62,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Create Corporate Event</span>
              <ArrowRight size={18} />
            </button>
            <button
              onClick={() => setIsDemoOpen(true)}
              className="w-full sm:w-auto px-8 py-4 rounded-full border-2 border-border text-text-primary hover:border-accent hover:text-accent font-bold text-sm sm:text-base transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              Try Live Demo
            </button>
          </div>
        </section>

        {/* CAPABILITIES GRID */}
        <section className="w-full max-w-6xl mx-auto px-4 md:px-8 py-12 text-center flex flex-col items-center">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-black text-text-primary text-center">
              Enterprise-Grade Capabilities
            </h2>
            <p className="text-text-secondary text-sm mt-2 text-center">
              Designed for professional brand standards and seamless AV execution.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
            {capabilities.map((item) => (
              <div
                key={item.title}
                className="bg-surface border border-border rounded-2xl p-6 sm:p-7 shadow-card hover:border-border-hover transition-all flex flex-col items-center text-center justify-between"
              >
                <div className="flex flex-col items-center text-center w-full">
                  <div className="w-12 h-12 rounded-xl bg-bg-subtle border border-border flex items-center justify-center mb-4 mx-auto">
                    {item.icon}
                  </div>
                  <h3 className="text-base font-bold text-text-primary mb-2 text-center">
                    {item.title}
                  </h3>
                  <p className="text-text-secondary text-xs sm:text-sm leading-relaxed text-center">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* BOTTOM B2B CONSULTATION CTA */}
        <section className="w-full max-w-5xl mx-auto px-4 md:px-8 py-12 text-center">
          <div className="bg-gradient-to-r from-blue-500/10 via-accent/15 to-emerald-500/10 border border-accent/25 rounded-3xl p-8 sm:p-12">
            <h2 className="text-2xl sm:text-4xl font-black text-text-primary">
              Planning an Executive Gala or Annual Meet?
            </h2>
            <p className="text-text-secondary text-sm sm:text-base max-w-xl mx-auto mt-3">
              We provide dedicated rehearsal support, vendor invoice generation, and custom SLA agreements.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
              <Link
                href="/contact"
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-accent hover:bg-[#B8882F] text-white font-bold text-sm shadow-[0_4px_16px_rgba(200,150,62,0.3)] transition-all flex items-center justify-center gap-2"
              >
                <MessageSquare size={16} />
                <span>Talk to Corporate Solutions</span>
              </Link>
              <button
                onClick={() => openAuth("signup")}
                className="w-full sm:w-auto px-6 py-4 rounded-full border border-border bg-surface hover:border-accent text-text-primary font-bold text-sm transition-all"
              >
                Start Free Trial Event
              </button>
            </div>
          </div>
        </section>
      </main>

      {isDemoOpen && <DemoModal isOpen={isDemoOpen} onClose={() => setIsDemoOpen(false)} />}
      <Footer />
    </>
  );
}
