"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { 
  Heart, 
  QrCode, 
  Camera, 
  Tv, 
  Palette, 
  ShieldCheck, 
  Download, 
  Music, 
  ArrowRight,
  MessageSquare
} from "lucide-react";
import { useAuthModal } from "@/context/AuthModalContext";

const ThemedNav = dynamic(() => import("@/components/ThemedNav"), { ssr: false });
const Footer = dynamic(() => import("@/components/sections/Footer"), { ssr: false });
const DemoModal = dynamic(() => import("@/components/DemoModal"), { ssr: false });

export default function WeddingsPage() {
  const { openAuth } = useAuthModal();
  const [isDemoOpen, setIsDemoOpen] = useState(false);

  const weddingSteps = [
    {
      num: "01",
      title: "Wedding QR Cards",
      desc: "Place elegant custom printable QR cards on dinner tables, cocktail bars, and welcome signs.",
      icon: <QrCode className="text-accent" size={24} />
    },
    {
      num: "02",
      title: "Guest Candids",
      desc: "Guests point their phone cameras and snap candid moments straight in browser. No apps, no accounts.",
      icon: <Camera className="text-primary" size={24} />
    },
    {
      num: "03",
      title: "Reception Live Wall",
      desc: "Photos appear on the banquet screen or projector in real time, creating an interactive party experience.",
      icon: <Tv className="text-accent" size={24} />
    },
    {
      num: "04",
      title: "Full 4K Archive",
      desc: "Wake up the next morning and download every single guest photo and video clip in full original resolution.",
      icon: <Download className="text-primary" size={24} />
    }
  ];

  const weddingFeatures = [
    {
      icon: <ShieldCheck className="text-primary mb-3 mx-auto" size={24} />,
      title: "Host Moderation",
      desc: "Approve or decline photos before they display on the big screen from your phone with a single tap."
    },
    {
      icon: <Palette className="text-accent mb-3 mx-auto" size={24} />,
      title: "Couple Branding & Colors",
      desc: "Display your couple monogram, hashtag, and wedding palette across both the mobile camera and live wall."
    },
    {
      icon: <Music className="text-primary mb-3 mx-auto" size={24} />,
      title: "Acoustic & Piano Soundtrack",
      desc: "Pair slideshow transitions with curated romantic background tracks for cinematic atmosphere."
    },
    {
      icon: <Heart className="text-accent mb-3 mx-auto" size={24} />,
      title: "Private & Safe",
      desc: "Only guests with your specific table QR code can view or upload to your private wedding vault."
    }
  ];

  return (
    <>
      <ThemedNav />
      <main className="min-h-screen bg-bg text-text-primary pt-36 sm:pt-44 pb-24 md:pb-32 flex flex-col items-center">
        {/* HERO */}
        <section className="w-full max-w-5xl mx-auto px-4 md:px-8 text-center pt-4 pb-20 md:pb-24 animate-fade-in">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-pink-500/10 border border-pink-500/25 text-pink-700 text-xs font-mono font-bold uppercase tracking-wider mb-6">
            <Heart size={14} className="fill-pink-600 text-pink-600" />
            Weddings & Sangeet Celebrations
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight font-display text-text-primary leading-tight text-center">
            Your photographer can't be everywhere. <br className="hidden sm:inline" />
            <span className="text-accent">Your guests can.</span>
          </h1>
          <p className="text-text-secondary text-base md:text-xl max-w-2xl mx-auto mt-6 leading-relaxed text-center">
            Capture every joyful tear, unscripted laugh, and late-night dance move from every table. Zero app downloads, zero logins, just pure wedding magic.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
            <button
              onClick={() => openAuth("signup")}
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-accent hover:bg-[#B8882F] text-white font-bold text-sm sm:text-base shadow-[0_4px_16px_rgba(200,150,62,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Create Your Wedding Memento</span>
              <ArrowRight size={18} />
            </button>
            <button
              onClick={() => setIsDemoOpen(true)}
              className="w-full sm:w-auto px-8 py-4 rounded-full border-2 border-border text-text-primary hover:border-accent hover:text-accent font-bold text-sm sm:text-base transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              See Live Demo
            </button>
          </div>
        </section>

        {/* 4-STEP WEDDING FLOW */}
        <section className="w-full max-w-6xl mx-auto px-4 md:px-8 py-16 md:py-24 text-center flex flex-col items-center">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-black text-text-primary text-center">
              How Wedding Memento Works
            </h2>
            <p className="text-text-secondary text-sm mt-2 text-center">
              Flawless 4-step experience for couples, planners, and guests.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
            {weddingSteps.map((step) => (
              <div
                key={step.num}
                className="bg-surface border border-border rounded-2xl p-6 sm:p-7 shadow-card flex flex-col items-center text-center justify-between h-full"
              >
                <div className="flex flex-col items-center text-center w-full">
                  <div className="w-12 h-12 rounded-xl bg-bg-subtle border border-border flex items-center justify-center mx-auto mb-4">
                    {step.icon}
                  </div>
                  <span className="text-xs font-mono font-bold text-accent uppercase tracking-wider block mb-1 text-center">
                    Step {step.num}
                  </span>
                  <h3 className="text-base font-bold text-text-primary mb-2 text-center">
                    {step.title}
                  </h3>
                  <p className="text-text-secondary text-xs sm:text-sm leading-relaxed text-center">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* PEACE OF MIND FEATURES */}
        <section className="w-full max-w-5xl mx-auto px-4 md:px-8 py-16 md:py-24">
          <div className="bg-bg-subtle border border-border rounded-3xl p-8 sm:p-12">
            <div className="text-center max-w-xl mx-auto mb-10">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-accent">
                Wedding Day Controls
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-text-primary mt-2">
                Designed for Complete Peace of Mind
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {weddingFeatures.map((feat) => (
                <div
                  key={feat.title}
                  className="bg-surface border border-border rounded-2xl p-6 shadow-sm text-center flex flex-col items-center justify-start h-full"
                >
                  {feat.icon}
                  <h4 className="font-bold text-sm text-text-primary mb-1.5">{feat.title}</h4>
                  <p className="text-text-secondary text-xs leading-relaxed">{feat.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* BOTTOM CTA */}
        <section className="w-full max-w-5xl mx-auto px-4 md:px-8 py-16 md:py-24 text-center">
          <div className="bg-gradient-to-r from-pink-500/10 via-accent/15 to-rose-500/10 border border-accent/25 rounded-3xl p-8 sm:p-12">
            <h2 className="text-2xl sm:text-4xl font-black text-text-primary">
              Ready to Collect Every Wedding Memory?
            </h2>
            <p className="text-text-secondary text-sm sm:text-base max-w-xl mx-auto mt-3">
              Set up your wedding gallery in minutes or reach our team for custom printing & venue AV assistance.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
              <button
                onClick={() => openAuth("signup")}
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-accent hover:bg-[#B8882F] text-white font-bold text-sm shadow-[0_4px_16px_rgba(200,150,62,0.3)] transition-all cursor-pointer"
              >
                Create Wedding Event Free
              </button>
              <Link
                href="/contact"
                className="w-full sm:w-auto px-6 py-4 rounded-full border border-border bg-surface hover:border-accent text-text-primary font-bold text-sm transition-all flex items-center justify-center gap-2"
              >
                <MessageSquare size={16} />
                <span>Talk to Wedding Concierge</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {isDemoOpen && <DemoModal isOpen={isDemoOpen} onClose={() => setIsDemoOpen(false)} />}
      <Footer />
    </>
  );
}
