"use client";

import React from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { 
  Heart, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  Globe2, 
  Camera, 
  ArrowRight,
  CheckCircle2,
  Users
} from "lucide-react";
import { useAuthModal } from "@/context/AuthModalContext";

const ThemedNav = dynamic(() => import("@/components/ThemedNav"), { ssr: false });
const Footer = dynamic(() => import("@/components/sections/Footer"), { ssr: false });

export default function AboutPage() {
  const { openAuth } = useAuthModal();

  return (
    <>
      <ThemedNav />
      <main className="min-h-screen bg-bg text-text-primary pt-28 pb-20 flex flex-col items-center">
        {/* HERO */}
        <section className="w-full max-w-5xl mx-auto px-4 md:px-8 text-center pt-8 pb-16 animate-fade-in">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-mono font-bold uppercase tracking-wider mb-6">
            <Heart size={14} className="fill-accent text-accent" />
            Our Story & Mission
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight font-display text-text-primary leading-tight">
            Built for the Moments That Truly Matter
          </h1>
          <p className="text-text-secondary text-base md:text-xl max-w-2xl mx-auto mt-6 leading-relaxed">
            We believe the soul of any celebration isn't just in the staged photos — it lives in the candid laughter, unexpected dance moves, and joyful tears shared across the room.
          </p>
        </section>

        {/* ORIGIN STORY */}
        <section className="w-full max-w-5xl mx-auto px-4 md:px-8 py-12 text-center flex flex-col items-center">
          <div className="bg-surface border border-border rounded-3xl p-8 sm:p-12 shadow-card grid grid-cols-1 md:grid-cols-2 gap-10 items-center text-center w-full">
            <div className="flex flex-col items-center text-center">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-accent mx-auto">
                The Spark
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-text-primary mt-2 mb-4 leading-snug text-center">
                Why We Started Memento
              </h2>
              <div className="space-y-4 text-sm text-text-secondary leading-relaxed text-center">
                <p>
                  At every wedding, milestone birthday, and reunion, hundreds of people capture unforgettable perspectives on their phones. Yet the very next morning, those precious memories scatter into the void.
                </p>
                <p>
                  Group chats compress photos into blurry pixels. Shared cloud drives demand awkward email logins. And guests refuse to download single-use apps just to upload two photos.
                </p>
                <p className="font-semibold text-text-primary">
                  We built Memento on a simple radical premise: what if taking and sharing event photos required zero app downloads, zero logins, and appeared live on screen in seconds?
                </p>
              </div>
            </div>

            <div className="bg-bg-subtle border border-border rounded-2xl p-6 sm:p-8 space-y-5 flex flex-col items-center text-center">
              <h3 className="text-base font-bold text-text-primary text-center">The 3 Pillars of Memento</h3>

              <div className="flex flex-col items-center gap-2 text-center">
                <div className="w-9 h-9 rounded-lg bg-accent/10 text-accent flex items-center justify-center mx-auto">
                  <Zap size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-text-primary text-center">Zero Friction</h4>
                  <p className="text-xs text-text-secondary mt-0.5 text-center">
                    If an aunt or camera-shy grandparent cannot use it within 10 seconds, it's failed. No passwords, no forms.
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-center gap-2 text-center">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-text-primary text-center">Private by Default</h4>
                  <p className="text-xs text-text-secondary mt-0.5 text-center">
                    Your memories belong strictly to your event. No public indexing, zero ad tracking, and complete host deletion rights.
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-center gap-2 text-center">
                <div className="w-9 h-9 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center mx-auto">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-text-primary text-center">Live Connection</h4>
                  <p className="text-xs text-text-secondary mt-0.5 text-center">
                    Memories shouldn't wait weeks for a Dropbox folder. Seeing your snapshot light up the room projector creates instant party energy.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* METRICS & IMPACT */}
        <section className="w-full max-w-5xl mx-auto px-4 md:px-8 py-12">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-black text-text-primary">
              Trusted by Hosts & Planners Everywhere
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
              <span className="block text-3xl sm:text-4xl font-black text-accent font-mono">10,000+</span>
              <span className="text-xs sm:text-sm text-text-secondary font-medium mt-1 block">Events Hosted</span>
            </div>
            <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
              <span className="block text-3xl sm:text-4xl font-black text-accent font-mono">500,000+</span>
              <span className="text-xs sm:text-sm text-text-secondary font-medium mt-1 block">Photos Captured</span>
            </div>
            <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
              <span className="block text-3xl sm:text-4xl font-black text-accent font-mono">50+</span>
              <span className="text-xs sm:text-sm text-text-secondary font-medium mt-1 block">Countries</span>
            </div>
            <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
              <span className="block text-3xl sm:text-4xl font-black text-accent font-mono">4.9★</span>
              <span className="text-xs sm:text-sm text-text-secondary font-medium mt-1 block">Average Rating</span>
            </div>
          </div>
        </section>

        {/* CALL TO ACTION */}
        <section className="w-full max-w-5xl mx-auto px-4 md:px-8 py-12 text-center">
          <div className="bg-gradient-to-b from-bg-subtle to-surface border border-border rounded-3xl p-8 sm:p-12 shadow-card">
            <h2 className="text-2xl sm:text-4xl font-black text-text-primary">
              Be the Host Everyone Remembers
            </h2>
            <p className="text-text-secondary text-sm sm:text-base max-w-xl mx-auto mt-3">
              Give your upcoming celebration the living memory wall it deserves.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
              <button
                onClick={() => openAuth("signup")}
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-accent hover:bg-[#B8882F] text-white font-bold text-sm shadow-[0_4px_16px_rgba(200,150,62,0.3)] transition-all cursor-pointer"
              >
                Create Your Event Free
              </button>
              <Link
                href="/contact"
                className="w-full sm:w-auto px-6 py-4 rounded-full border border-border bg-surface hover:border-accent text-text-primary font-bold text-sm transition-all"
              >
                Contact via WhatsApp
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
