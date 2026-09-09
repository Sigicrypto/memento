"use client";

import React from 'react';
import { Camera, ShieldCheck, Palette, KeyRound, ArrowRight, Check } from 'lucide-react';
import Link from 'next/link';

export default function EnterpriseSection() {
  return (
    <section className="py-20 md:py-24 px-4 md:px-8 bg-bg-subtle border-t border-border relative overflow-hidden w-full flex flex-col items-center justify-center text-center">
      <div className="w-full max-w-6xl relative z-10 mx-auto flex flex-col items-center text-center">
        
        {/* Centered Header */}
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-wider uppercase mb-4 mx-auto">
          <Camera size={14} />
          For Wedding Studios & Agencies
        </span>
        <h2 className="text-3xl md:text-5xl font-black text-text-primary leading-tight mb-4 font-display max-w-3xl mx-auto">
          Built for <span className="text-primary">Professional Studios</span>
        </h2>
        <p className="text-text-secondary text-base md:text-lg mb-12 leading-relaxed max-w-2xl mx-auto">
          Scale your wedding photography business with our studio-grade white-label platform. Deliver premium, moderated live experiences to your couples under your own studio brand.
        </p>

        {/* 3 Pro Features in Centered Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-12 text-center">
          <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-surface border border-border shadow-card hover:shadow-card-hover transition-all">
            <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-4 mx-auto shrink-0">
              <Palette size={22} />
            </div>
            <h3 className="text-text-primary font-bold text-lg mb-2 text-center">100% Studio White-Labeling</h3>
            <p className="text-text-secondary text-sm leading-relaxed text-center">
              Replace Memento branding with your studio logo, colors, and dedicated subdomain. Couples and guests see only your brand.
            </p>
          </div>

          <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-surface border border-border shadow-card hover:shadow-card-hover transition-all">
            <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-accent mb-4 mx-auto shrink-0">
              <ShieldCheck size={22} />
            </div>
            <h3 className="text-text-primary font-bold text-lg mb-2 text-center">Safety-First Moderation</h3>
            <p className="text-text-secondary text-sm leading-relaxed text-center">
              Default-on review queue prevents inappropriate screen content. Swipe right to approve in under 2 seconds, or enable 1-tap Auto-Approve.
            </p>
          </div>

          <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-surface border border-border shadow-card hover:shadow-card-hover transition-all">
            <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-4 mx-auto shrink-0">
              <KeyRound size={22} />
            </div>
            <h3 className="text-text-primary font-bold text-lg mb-2 text-center">Team PIN & 4K Delivery</h3>
            <p className="text-text-secondary text-sm leading-relaxed text-center">
              Generate 4-digit Event PINs for 2nd shooters to moderate or tether without extra paid accounts. Download full-res 4K ZIPs in 1 click.
            </p>
          </div>
        </div>

        {/* Studio Console Mockup Centered */}
        <div className="w-full max-w-3xl mx-auto relative mb-10">
          <div className="absolute -inset-4 bg-gradient-to-tr from-primary/10 via-accent/5 to-transparent blur-3xl rounded-full opacity-60"></div>
          
          <div className="relative bg-surface border border-border rounded-2xl p-6 shadow-card overflow-hidden text-left">
            <div className="flex items-center justify-between pb-5 border-b border-border mb-6 flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black">
                  RM
                </div>
                <div>
                  <div className="text-text-primary font-bold text-sm">Royal Moments Studio</div>
                  <div className="text-text-muted text-xs font-mono">live.royalmoments.com</div>
                </div>
              </div>
              <div className="px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-bold border border-green-200 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                Live Event Active
              </div>
            </div>

            <div className="space-y-3.5">
              <div className="p-4 rounded-xl bg-bg-subtle border border-border flex items-center gap-4">
                <div className="w-14 h-11 rounded-lg bg-gradient-to-br from-amber-200 to-rose-200 flex-shrink-0 shadow-inner" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-text-primary truncate">Table 4 Toast 🥂</p>
                  <p className="text-[11px] text-text-muted">by Vikram R. · 4s ago</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold flex items-center gap-1">
                    <Check size={12} /> Approved
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-bg-subtle border border-border flex items-center gap-4">
                <div className="w-14 h-11 rounded-lg bg-gradient-to-bl from-sky-200 to-indigo-200 flex-shrink-0 shadow-inner" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-text-primary truncate">Bride & Groom First Dance ✨</p>
                  <p className="text-[11px] text-text-muted">by Priya S. · 12s ago</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-accent/15 text-accent text-xs font-bold">
                    ⭐ Pinned
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-bg-subtle border border-border flex items-center gap-4">
                <div className="w-14 h-11 rounded-lg bg-gradient-to-tr from-emerald-200 to-teal-200 flex-shrink-0 shadow-inner" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-text-primary truncate">Stage Fireworks 🎉</p>
                  <p className="text-[11px] text-text-muted">by Second Shooter (Tethered)</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">
                    4K DSLR Sync
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-border flex items-center justify-between text-xs text-text-secondary">
              <span className="font-medium">184 / 300 Guests Active</span>
              <span className="text-primary font-bold">Medium Tier (Safe Buffer)</span>
            </div>
          </div>
        </div>

        {/* Centered CTA */}
        <Link
          href="/photographers"
          className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-primary hover:opacity-90 text-white font-bold text-sm sm:text-base transition-all shadow-sm hover:scale-105 active:scale-95 mx-auto"
        >
          <span>Explore Studio Solutions</span>
          <ArrowRight size={18} />
        </Link>
      </div>
    </section>
  );
}
