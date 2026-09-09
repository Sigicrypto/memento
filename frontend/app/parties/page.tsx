"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { 
  PartyPopper, 
  QrCode, 
  Tv, 
  Music, 
  Sparkles, 
  Download, 
  ArrowRight,
  Smile,
  ShieldCheck,
  Flame
} from "lucide-react";
import { useAuthModal } from "@/context/AuthModalContext";

const ThemedNav = dynamic(() => import("@/components/ThemedNav"), { ssr: false });
const Footer = dynamic(() => import("@/components/sections/Footer"), { ssr: false });
const DemoModal = dynamic(() => import("@/components/DemoModal"), { ssr: false });

export default function PartiesPage() {
  const { openAuth } = useAuthModal();
  const [isDemoOpen, setIsDemoOpen] = useState(false);

  const occasions = [
    {
      title: "Milestone Birthdays",
      tag: "18th · 21st · 30th · 50th",
      desc: "Turn table shots, toasts, and cake-cutting surprises into an unforgettable live projection wall."
    },
    {
      title: "Anniversary Celebrations",
      tag: "Silver · Golden · Platinum",
      desc: "Gather decades of family love across generations with zero tech confusion for older relatives."
    },
    {
      title: "Family Reunions",
      tag: "Cousins · Clan · Relatives",
      desc: "Connect every branch of the family tree into one shared high-resolution digital memory vault."
    },
    {
      title: "Graduation & Farewell Bashes",
      tag: "School · College · Uni",
      desc: "Capture the late-night energy, spontaneous dance moves, and heartfelt group hugs forever."
    }
  ];

  return (
    <>
      <ThemedNav />
      <main className="min-h-screen bg-bg text-text-primary pt-28 pb-20 flex flex-col items-center">
        {/* HERO */}
        <section className="w-full max-w-5xl mx-auto px-4 md:px-8 text-center pt-8 pb-16 animate-fade-in">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-700 text-xs font-mono font-bold uppercase tracking-wider mb-6">
            <PartyPopper size={14} className="text-amber-600" />
            Birthdays & Party Celebrations
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight font-display text-text-primary leading-tight">
            Turn Every Guest's Phone <br className="hidden sm:inline" />
            <span className="text-accent">Into Your Party Camera</span>
          </h1>
          <p className="text-text-secondary text-base md:text-xl max-w-2xl mx-auto mt-6 leading-relaxed">
            From the first toast to the last dance-floor move, let everyone at your party contribute to a real-time living photo wall. No apps, no logins, 100% fun.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
            <button
              onClick={() => openAuth("signup")}
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-accent hover:bg-[#B8882F] text-white font-bold text-sm sm:text-base shadow-[0_4px_16px_rgba(200,150,62,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Create Party Event</span>
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

        {/* OCCASIONS GRID */}
        <section className="w-full max-w-5xl mx-auto px-4 md:px-8 py-12 text-center flex flex-col items-center">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-black text-text-primary text-center">
              Made for Every Kind of Bash
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            {occasions.map((occ) => (
              <div
                key={occ.title}
                className="bg-surface border border-border rounded-2xl p-6 sm:p-8 shadow-card hover:border-border-hover transition-all flex flex-col items-center text-center"
              >
                <span className="text-xs font-mono font-bold text-accent uppercase tracking-wider block mb-2 text-center">
                  {occ.tag}
                </span>
                <h3 className="text-xl font-bold text-text-primary mb-2 text-center">
                  {occ.title}
                </h3>
                <p className="text-text-secondary text-sm leading-relaxed text-center">
                  {occ.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* PARTY FEATURES */}
        <section className="w-full max-w-5xl mx-auto px-4 md:px-8 py-12 text-center flex flex-col items-center">
          <div className="bg-bg-subtle border border-border rounded-3xl p-8 sm:p-12 w-full flex flex-col items-center">
            <div className="text-center max-w-xl mx-auto mb-10">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-accent">
                Party Essentials
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-text-primary mt-2 text-center">
                Why Party Hosts Love Memento
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
              <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm flex flex-col items-center text-center">
                <QrCode className="text-accent mb-3 mx-auto" size={24} />
                <h4 className="font-bold text-sm text-text-primary mb-1 text-center">QR Table Cards & Coasters</h4>
                <p className="text-text-secondary text-xs leading-relaxed text-center">
                  Drop printed cards on dinner tables and the bar. Guests just point their phone camera and they're in.
                </p>
              </div>

              <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm flex flex-col items-center text-center">
                <Tv className="text-purple-600 mb-3 mx-auto" size={24} />
                <h4 className="font-bold text-sm text-text-primary mb-1 text-center">Live TV Slideshow</h4>
                <p className="text-text-secondary text-xs leading-relaxed text-center">
                  Beam photos onto the living room smart TV or club projector as floating Polaroid cards or grids.
                </p>
              </div>

              <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm flex flex-col items-center text-center">
                <Music className="text-pink-600 mb-3 mx-auto" size={24} />
                <h4 className="font-bold text-sm text-text-primary mb-1 text-center">Background Party Soundtrack</h4>
                <p className="text-text-secondary text-xs leading-relaxed text-center">
                  Pair your slideshow transitions with curated upbeat audio tracks for energetic party atmosphere.
                </p>
              </div>

              <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm flex flex-col items-center text-center">
                <ShieldCheck className="text-emerald-600 mb-3 mx-auto" size={24} />
                <h4 className="font-bold text-sm text-text-primary mb-1 text-center">Optional Host Moderation</h4>
                <p className="text-text-secondary text-xs leading-relaxed text-center">
                  Keep things family-friendly by tapping approve from your phone before photos hit the big screen.
                </p>
              </div>

              <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm flex flex-col items-center text-center">
                <Sparkles className="text-blue-600 mb-3 mx-auto" size={24} />
                <h4 className="font-bold text-sm text-text-primary mb-1 text-center">WhatsApp Fast Joining</h4>
                <p className="text-text-secondary text-xs leading-relaxed text-center">
                  Text your event code to our WhatsApp bot to auto-launch the camera session without scanning codes.
                </p>
              </div>

              <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm flex flex-col items-center text-center">
                <Download className="text-amber-600 mb-3 mx-auto" size={24} />
                <h4 className="font-bold text-sm text-text-primary mb-1 text-center">Full Morning-After Download</h4>
                <p className="text-text-secondary text-xs leading-relaxed text-center">
                  Wake up the next morning and download every single 4K photo in a single ZIP file with zero compression.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* BOTTOM CTA */}
        <section className="w-full max-w-5xl mx-auto px-4 md:px-8 py-12 text-center">
          <div className="bg-gradient-to-r from-amber-500/10 via-accent/15 to-purple-500/10 border border-accent/25 rounded-3xl p-8 sm:p-12">
            <h2 className="text-2xl sm:text-4xl font-black text-text-primary">
              Ready to Host an Epic Party?
            </h2>
            <p className="text-text-secondary text-sm sm:text-base max-w-xl mx-auto mt-3">
              Set up your party wall in seconds. Start with our free tier or get in touch for custom venue setups.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
              <button
                onClick={() => openAuth("signup")}
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-accent hover:bg-[#B8882F] text-white font-bold text-sm shadow-[0_4px_16px_rgba(200,150,62,0.3)] transition-all cursor-pointer"
              >
                Create Your Party Event Free
              </button>
              <Link
                href="/contact"
                className="w-full sm:w-auto px-6 py-4 rounded-full border border-border bg-surface hover:border-accent text-text-primary font-bold text-sm transition-all"
              >
                Inquire on WhatsApp
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
