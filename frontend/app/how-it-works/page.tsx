"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { 
  QrCode, 
  Camera, 
  Share2, 
  Tv, 
  ShieldCheck, 
  Download, 
  Sliders, 
  Sparkles, 
  ArrowRight,
  Smartphone,
  Laptop,
  CheckCircle2,
  HelpCircle
} from "lucide-react";
import { useAuthModal } from "@/context/AuthModalContext";

const ThemedNav = dynamic(() => import("@/components/ThemedNav"), { ssr: false });
const Footer = dynamic(() => import("@/components/sections/Footer"), { ssr: false });
const DemoModal = dynamic(() => import("@/components/DemoModal"), { ssr: false });

export default function HowItWorksPage() {
  const { openAuth } = useAuthModal();
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"guests" | "hosts">("guests");

  const guestSteps = [
    {
      num: "01",
      title: "Point Phone Camera at QR",
      desc: "No app download or app store search. Guests simply point their iPhone or Android camera at your custom table card or entrance poster.",
      badge: "Zero App Friction",
      icon: <QrCode className="w-6 h-6 text-accent" />
    },
    {
      num: "02",
      title: "Browser Camera Opens Instantly",
      desc: "Memento launches in Safari, Chrome, or Samsung Internet. Guests can capture new candid shots or pick favorites from their camera roll.",
      badge: "No Sign-Up Required",
      icon: <Camera className="w-6 h-6 text-purple-600" />
    },
    {
      num: "03",
      title: "Add Note & Tap Share",
      desc: "Guests can add an optional caption or warm wishes. Photos are optimized and compressed directly on the phone for lightning upload.",
      badge: "Sub-Second Upload",
      icon: <Share2 className="w-6 h-6 text-emerald-600" />
    },
    {
      num: "04",
      title: "See It Live on Venue Screens",
      desc: "Uploaded photos appear on the big screen within 2 seconds, celebrating everyone's perspective in real time.",
      badge: "Real-Time Magic",
      icon: <Tv className="w-6 h-6 text-blue-600" />
    }
  ];

  const hostSteps = [
    {
      num: "01",
      title: "Create Event in 30 Seconds",
      desc: "Pick your custom event URL (e.g. memento.events/PriyaRahul), set your dates, and customize colors to match your theme.",
      badge: "Instant Setup",
      icon: <Sparkles className="w-6 h-6 text-accent" />
    },
    {
      num: "02",
      title: "Print Elegant Signage Assets",
      desc: "Download pre-formatted PDF table cards, welcome signs, and tent cards with your event QR code ready to print at home or print shop.",
      badge: "Print-Ready Suite",
      icon: <Download className="w-6 h-6 text-purple-600" />
    },
    {
      num: "03",
      title: "Connect TV or Projector",
      desc: "Open your private Live Wall URL on any laptop or TV connected via HDMI or AirPlay. Hit full-screen and watch the gallery auto-play.",
      badge: "Works on Any Screen",
      icon: <Tv className="w-6 h-6 text-blue-600" />
    },
    {
      num: "04",
      title: "Moderate & Keep Forever",
      desc: "Approve or decline photos before they appear on screen. After the event, download the full high-res ZIP archive in one click.",
      badge: "Total Host Control",
      icon: <ShieldCheck className="w-6 h-6 text-emerald-600" />
    }
  ];

  return (
    <>
      <ThemedNav />
      <main className="min-h-screen bg-bg text-text-primary pt-28 pb-20 flex flex-col items-center">
        {/* HERO */}
        <section className="w-full max-w-5xl mx-auto px-4 md:px-8 text-center pt-8 pb-16 animate-fade-in">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-mono font-bold uppercase tracking-wider mb-6">
            The Memento Experience
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight font-display text-text-primary leading-tight">
            From QR Code to Live Gallery in Seconds
          </h1>
          <p className="text-text-secondary text-base md:text-xl max-w-2xl mx-auto mt-6 leading-relaxed">
            Zero app downloads. Zero account signups. Whether you are hosting 50 guests or 1,500 attendees, Memento brings everyone together effortlessly.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
            <button
              onClick={() => openAuth("signup")}
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-accent hover:bg-[#B8882F] text-white font-bold text-sm sm:text-base shadow-[0_4px_16px_rgba(200,150,62,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Create Your Free Event</span>
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

        {/* INTERACTIVE DUAL WORKFLOW SELECTOR */}
        <section className="w-full max-w-6xl mx-auto px-4 md:px-8 py-12">
          {/* Tabs */}
          <div className="flex justify-center mb-12 w-full px-2">
            <div className="flex flex-col sm:flex-row w-full sm:w-auto p-1.5 rounded-2xl sm:rounded-full bg-bg-subtle border border-border gap-1.5 sm:gap-1">
              <button
                onClick={() => setActiveTab("guests")}
                className={`w-full sm:w-auto px-5 sm:px-8 py-2.5 rounded-xl sm:rounded-full text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === "guests"
                    ? "bg-accent text-white shadow-sm"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                <Smartphone size={16} />
                <span>Guest Experience (15 Seconds)</span>
              </button>
              <button
                onClick={() => setActiveTab("hosts")}
                className={`w-full sm:w-auto px-5 sm:px-8 py-2.5 rounded-xl sm:rounded-full text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === "hosts"
                    ? "bg-accent text-white shadow-sm"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                <Laptop size={16} />
                <span>Host Experience & Control</span>
              </button>
            </div>
          </div>

          {/* Steps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {(activeTab === "guests" ? guestSteps : hostSteps).map((step) => (
              <div
                key={step.num}
                className="bg-surface border border-border hover:border-border-hover rounded-2xl p-6 sm:p-7 shadow-card transition-all flex flex-col items-center text-center justify-between"
              >
                <div className="flex flex-col items-center text-center w-full">
                  <div className="flex items-center justify-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-bg-subtle border border-border flex items-center justify-center">
                      {step.icon}
                    </div>
                    <span className="text-3xl font-mono font-black text-border">
                      {step.num}
                    </span>
                  </div>

                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-accent/10 text-accent text-[11px] font-bold uppercase tracking-wider mb-2 mx-auto">
                    {step.badge}
                  </span>

                  <h3 className="text-lg font-bold text-text-primary mb-2.5 leading-snug text-center">
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

        {/* VENUE AV & SETUP GUIDE */}
        <section className="w-full max-w-5xl mx-auto px-4 md:px-8 py-16">
          <div className="bg-bg-subtle border border-border rounded-3xl p-8 sm:p-12">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-accent">
                Venue AV Hardware
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-text-primary mt-2">
                How Does It Connect at the Venue?
              </h2>
              <p className="text-text-secondary text-sm mt-3 leading-relaxed">
                You don't need expensive equipment or special technicians. Memento Live works with the displays your venue already has.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center mx-auto mb-4 font-bold">
                  1
                </div>
                <h3 className="font-bold text-sm text-text-primary mb-1.5">Projector or LED Wall</h3>
                <p className="text-text-secondary text-xs leading-relaxed">
                  Plug any laptop into the projector via HDMI cable. Open Chrome and press F11 for 4K presentation mode.
                </p>
              </div>

              <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center mx-auto mb-4 font-bold">
                  2
                </div>
                <h3 className="font-bold text-sm text-text-primary mb-1.5">Smart TV Screen</h3>
                <p className="text-text-secondary text-xs leading-relaxed">
                  Open the built-in browser on your venue Samsung, LG, or Android TV and navigate to your Live Wall URL.
                </p>
              </div>

              <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto mb-4 font-bold">
                  3
                </div>
                <h3 className="font-bold text-sm text-text-primary mb-1.5">AirPlay or Chromecast</h3>
                <p className="text-text-secondary text-xs leading-relaxed">
                  Cast wirelessly from any iPad, iPhone, or MacBook directly to the venue display system with zero cords.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* BOTTOM CTA */}
        <section className="w-full max-w-5xl mx-auto px-4 md:px-8 py-12 text-center">
          <div className="bg-gradient-to-r from-accent/15 via-purple-500/10 to-accent/15 border border-accent/20 rounded-3xl p-8 sm:p-12">
            <h2 className="text-2xl sm:text-4xl font-black text-text-primary">
              Ready to Give Your Guests an Unforgettable Experience?
            </h2>
            <p className="text-text-secondary text-sm sm:text-base max-w-xl mx-auto mt-3">
              Set up your event in under a minute. No credit card required to start.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
              <button
                onClick={() => openAuth("signup")}
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-accent hover:bg-[#B8882F] text-white font-bold text-sm shadow-[0_4px_16px_rgba(200,150,62,0.3)] transition-all cursor-pointer"
              >
                Create Your Free Event Now
              </button>
              <Link
                href="/contact"
                className="w-full sm:w-auto px-6 py-4 rounded-full border border-border bg-surface hover:border-accent text-text-primary font-bold text-sm transition-all"
              >
                Talk to Us on WhatsApp
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
