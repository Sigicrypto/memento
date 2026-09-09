"use client";

import React from "react";
import Link from "next/link";
import { 
  Rocket, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  Smartphone, 
  Heart,
  CheckCircle2,
  Users,
  Clock
} from "lucide-react";
import { useAuthModal } from "@/context/AuthModalContext";
import ThemedNav from "@/components/ThemedNav";
import Footer from "@/components/sections/Footer";

export default function AboutPage() {
  const { openAuth } = useAuthModal();

  const startupPrinciples = [
    {
      value: "0",
      label: "Zero App Installs",
      sublabel: "Guests scan a QR code and their camera opens in the browser instantly.",
      icon: Smartphone,
    },
    {
      value: "< 2s",
      label: "Instant Live Sync",
      sublabel: "Photos stream live to venue TVs and projectors in under two seconds.",
      icon: Zap,
    },
    {
      value: "100%",
      label: "Original Resolution",
      sublabel: "Every snapshot is saved in full raw clarity — no chat app compression.",
      icon: Sparkles,
    },
    {
      value: "Private",
      label: "Host Moderation",
      sublabel: "You control who sees what. No public feeds, ads, or third-party sharing.",
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="min-h-screen bg-bg text-text-primary flex flex-col items-center w-full">
      <ThemedNav />
      <main className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-36 sm:pt-44 pb-28 md:pb-36 flex flex-col items-center text-center">
        {/* HERO */}
        <section className="w-full text-center pb-20 md:pb-24 flex flex-col items-center">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-mono font-bold uppercase tracking-wider mb-6 mx-auto">
            <Rocket size={14} className="text-accent" />
            An Early-Stage Event-Tech Startup
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight font-display text-text-primary leading-tight max-w-3xl mx-auto text-center">
            Reinventing How Events Capture Memories
          </h1>
          <p className="text-text-secondary text-base md:text-xl max-w-2xl mx-auto mt-6 leading-relaxed text-center">
            We are a modern, fast-moving startup building a frictionless alternative to clunky photo booth apps and messy group chats.
          </p>
        </section>

        {/* ORIGIN STORY */}
        <section className="w-full py-16 md:py-24 flex flex-col items-center text-center">
          <div className="bg-surface border border-border rounded-3xl p-8 sm:p-12 shadow-card grid grid-cols-1 md:grid-cols-2 gap-10 items-center text-center w-full">
            <div className="flex flex-col items-center text-center">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-accent mx-auto">
                The Founding Spark
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-text-primary mt-2 mb-4 leading-snug text-center font-display">
                Why We Started Memento
              </h2>
              <div className="space-y-4 text-sm text-text-secondary leading-relaxed text-center">
                <p>
                  At every wedding, birthday celebration, and corporate gala, guests take hundreds of brilliant, candid photos on their phones. But the morning after, those memories vanish into personal camera rolls.
                </p>
                <p>
                  Group chats compress pictures into low-res mush. Shared folders require awkward sign-ins. And nobody wants to download another one-time app just to share two party photos.
                </p>
                <p className="font-semibold text-text-primary">
                  We started Memento as a lean, agile startup to solve this with radical simplicity: zero app downloads, zero account requirements for guests, and an instant live wall on venue screens.
                </p>
              </div>
            </div>

            <div className="bg-bg-subtle border border-border rounded-2xl p-6 sm:p-8 space-y-6 flex flex-col items-center text-center">
              <h3 className="text-base font-bold text-text-primary text-center font-display">Our Core Pillars</h3>

              <div className="flex flex-col items-center gap-2 text-center">
                <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center mx-auto">
                  <Zap size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-text-primary text-center">Frictionless First</h4>
                  <p className="text-xs text-text-secondary mt-0.5 text-center">
                    Point camera, scan QR, snap photo. If anyone needs instructions, we consider it a bug.
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-center gap-2 text-center">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-text-primary text-center">Private by Design</h4>
                  <p className="text-xs text-text-secondary mt-0.5 text-center">
                    Your memories stay exclusively yours. No advertising trackers, no public social algorithms.
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-center gap-2 text-center">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center mx-auto">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-text-primary text-center">Instant Live Energy</h4>
                  <p className="text-xs text-text-secondary mt-0.5 text-center">
                    Watching your guest photos light up the venue projector in real time creates infectious party energy.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* STARTUP PRINCIPLES & PRODUCT GUARANTEES */}
        <section className="w-full py-16 md:py-24 flex flex-col items-center text-center">
          <div className="text-center mb-10 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-black text-text-primary font-display text-center">
              Our Startup Product Standards
            </h2>
            <p className="text-text-secondary text-sm mt-2 text-center">
              Engineered with modern web tech to deliver speed, privacy, and pure convenience.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 text-center w-full">
            {startupPrinciples.map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={index} className="bg-surface border border-border rounded-2xl p-6 shadow-card flex flex-col items-center text-center">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent mb-3 mx-auto">
                    <Icon size={20} />
                  </div>
                  <span className="block text-2xl sm:text-3xl font-black text-accent font-display text-center">
                    {item.value}
                  </span>
                  <span className="text-sm font-bold text-text-primary mt-1 block text-center">
                    {item.label}
                  </span>
                  <span className="text-xs text-text-secondary mt-1.5 block text-center leading-relaxed">
                    {item.sublabel}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* CALL TO ACTION */}
        <section className="w-full py-16 md:py-24 text-center flex flex-col items-center">
          <div className="bg-gradient-to-b from-bg-subtle to-surface border border-border rounded-3xl p-8 sm:p-12 shadow-card w-full max-w-3xl flex flex-col items-center text-center">
            <h2 className="text-2xl sm:text-4xl font-black text-text-primary font-display text-center">
              Ready for a Fresh Event Experience?
            </h2>
            <p className="text-text-secondary text-sm sm:text-base max-w-xl mx-auto mt-3 text-center">
              Set up your event in 60 seconds. No credit card required.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8 mx-auto w-full sm:w-auto">
              <button
                onClick={() => openAuth("signup")}
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-accent hover:bg-[#B8882F] text-white font-bold text-sm shadow-[0_4px_16px_rgba(200,150,62,0.3)] transition-all cursor-pointer text-center"
              >
                Create Your Free Event
              </button>
              <Link
                href="/contact"
                className="w-full sm:w-auto px-6 py-4 rounded-full border border-border bg-surface hover:border-accent text-text-primary font-bold text-sm transition-all text-center"
              >
                Talk to the Team
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
