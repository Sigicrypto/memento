"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { 
  Building, 
  QrCode, 
  Tv, 
  ShieldCheck, 
  Sliders, 
  BarChart3, 
  Download, 
  ArrowRight,
  Sparkles,
  Layers,
  MessageSquare
} from "lucide-react";
import { useAuthModal } from "@/context/AuthModalContext";

const ThemedNav = dynamic(() => import("@/components/ThemedNav"), { ssr: false });
const Footer = dynamic(() => import("@/components/sections/Footer"), { ssr: false });
const DemoModal = dynamic(() => import("@/components/DemoModal"), { ssr: false });

export default function ConferencesPage() {
  const { openAuth } = useAuthModal();
  const [isDemoOpen, setIsDemoOpen] = useState(false);

  const pillars = [
    {
      icon: <Layers className="text-blue-600" size={24} />,
      title: "Multi-Stage & Multi-Screen Support",
      desc: "Deploy distinct live walls across keynote auditoriums, breakout seminar rooms, and expo networking lounges."
    },
    {
      icon: <QrCode className="text-accent" size={24} />,
      title: "Attendee Badge & Lanyard QR Activation",
      desc: "Embed event QR codes on delegate badges, lanyards, and event schedules for zero-barrier capture."
    },
    {
      icon: <Sliders className="text-purple-600" size={24} />,
      title: "Sponsor Overlays & Custom Hashtags",
      desc: "Showcase title sponsor logos, booth numbers, and social hashtags directly on the real-time presentation display."
    },
    {
      icon: <ShieldCheck className="text-emerald-600" size={24} />,
      title: "Enterprise Moderation & GDPR Peace of Mind",
      desc: "Full pre-screening controls for event organizers to verify and approve images before public display."
    },
    {
      icon: <BarChart3 className="text-amber-600" size={24} />,
      title: "Instant UGC Asset Library",
      desc: "Gather authentic behind-the-scenes speaker shots and booth interaction photos for post-conference PR and marketing."
    },
    {
      icon: <Download className="text-pink-600" size={24} />,
      title: "One-Click High-Res Archive",
      desc: "Export thousands of attendee uploads in full original 4K resolution as organized ZIP archives."
    }
  ];

  return (
    <>
      <ThemedNav />
      <main className="min-h-screen bg-bg text-text-primary pt-36 sm:pt-44 pb-24 md:pb-32 flex flex-col items-center">
        {/* HERO */}
        <section className="w-full max-w-5xl mx-auto px-4 md:px-8 text-center pt-4 pb-20 md:pb-24 animate-fade-in">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-700 text-xs font-mono font-bold uppercase tracking-wider mb-6">
            <Building size={14} className="text-blue-600" />
            Conferences, Summits & Expos
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight font-display text-text-primary leading-tight">
            Real-Time Attendee Photo Walls <br className="hidden sm:inline" />
            <span className="text-accent">for Conferences & Expos</span>
          </h1>
          <p className="text-text-secondary text-base md:text-xl max-w-2xl mx-auto mt-6 leading-relaxed">
            Turn your delegates into an active content engine. Broadcast live speaker highlights, booth interactions, and networking candids across your venue screens with zero app friction.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
            <Link
              href="/contact"
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-accent hover:bg-[#B8882F] text-white font-bold text-sm sm:text-base shadow-[0_4px_16px_rgba(200,150,62,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Schedule Conference Setup Call</span>
              <ArrowRight size={18} />
            </Link>
            <button
              onClick={() => setIsDemoOpen(true)}
              className="w-full sm:w-auto px-8 py-4 rounded-full border-2 border-border text-text-primary hover:border-accent hover:text-accent font-bold text-sm sm:text-base transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              Explore Live Demo
            </button>
          </div>
        </section>

        {/* PILLARS GRID */}
        <section className="w-full max-w-5xl mx-auto px-4 md:px-8 py-16 md:py-24 text-center flex flex-col items-center">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-black text-text-primary text-center">
              Built for Conference Scale & Reliability
            </h2>
            <p className="text-text-secondary text-sm mt-2 text-center">
              Tested at 1,000+ delegate summits with sub-second real-time sync.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
            {pillars.map((item) => (
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

        {/* ENTERPRISE CALLOUT */}
        <section className="w-full max-w-5xl mx-auto px-4 md:px-8 py-16 md:py-24 text-center">
          <div className="bg-bg-subtle border border-border rounded-3xl p-8 sm:p-12 shadow-sm">
            <h2 className="text-2xl sm:text-3xl font-black text-text-primary">
              Organizing an Upcoming Summit or Exhibition?
            </h2>
            <p className="text-text-secondary text-sm sm:text-base max-w-xl mx-auto mt-3">
              We offer bespoke white-label domain deployment, AV technical rehearsal support, and invoice billing.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
              <Link
                href="/contact"
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-accent hover:bg-[#B8882F] text-white font-bold text-sm shadow-[0_4px_16px_rgba(200,150,62,0.3)] transition-all flex items-center justify-center gap-2"
              >
                <MessageSquare size={16} />
                <span>Talk to Us on WhatsApp</span>
              </Link>
              <button
                onClick={() => openAuth("signup")}
                className="w-full sm:w-auto px-6 py-4 rounded-full border border-border bg-surface hover:border-accent text-text-primary font-bold text-sm transition-all"
              >
                Create Self-Serve Event
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
