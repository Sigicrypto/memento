"use client";

import React from 'react';
import { Camera, Palette, LayoutDashboard, ArrowRight, Check, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function EnterpriseSection() {
  return (
    <section className="py-20 md:py-28 px-4 md:px-8 bg-bg-subtle border-b border-border relative overflow-hidden w-full flex flex-col items-center justify-center text-center">
      <div className="w-full max-w-6xl relative z-10 mx-auto flex flex-col items-center text-center">
        
        {/* Centered Header */}
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-wider uppercase mb-4 mx-auto">
          <Camera size={14} />
          PRO STUDIO FEATURES
        </span>
        <h2 className="text-3xl md:text-5xl font-black text-text-primary leading-tight mb-4 font-display max-w-3xl mx-auto">
          Built for <span className="text-primary">Wedding Photographers & Studios</span>
        </h2>
        <p className="text-text-secondary text-base md:text-lg mb-12 leading-relaxed max-w-2xl mx-auto">
          Add live photo walls to every wedding you shoot. Deliver premium experiences under your own studio brand, stream pro camera selects live, and manage all your clients from one place.
        </p>

        {/* 3 Pro Features in Centered Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-12 text-center">
          {/* Feature 1: Studio White-Labeling */}
          <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-surface border border-border shadow-card hover:shadow-card-hover transition-all">
            <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-4 mx-auto shrink-0">
              <Palette size={22} />
            </div>
            <h3 className="text-text-primary font-bold text-lg mb-2 text-center">100% Studio White-Labeling</h3>
            <p className="text-text-secondary text-sm leading-relaxed text-center mb-3">
              Your studio logo, brand colors, and monogram on printable table QR cards, the live wall banner, and the guest upload screen. Couples and guests see your brand, not ours.
            </p>
            <span className="text-xs font-semibold text-accent mt-auto">
              Your brand on every venue screen
            </span>
          </div>

          {/* Feature 2: DSLR & Mirrorless Live Sync */}
          <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-surface border border-accent/40 shadow-card hover:shadow-card-hover transition-all relative">
            <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent mb-4 mx-auto shrink-0">
              <Camera size={22} />
            </div>
            <h3 className="text-text-primary font-bold text-lg mb-2 text-center">DSLR & Mirrorless Dual-Stream</h3>
            <p className="text-text-secondary text-sm leading-relaxed text-center mb-3">
              Stream camera selects straight from tethered Lightroom, Capture One, or camera Wi-Fi/FTP directly to the venue screens alongside guest candids in real time.
            </p>
            <Link
              href="/photographers/dslr-guide"
              className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:underline mt-auto"
            >
              <span>Read Step-by-Step DSLR Guide</span>
              <ExternalLink size={12} />
            </Link>
          </div>

          {/* Feature 3: Multi-Event Dashboard */}
          <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-surface border border-border shadow-card hover:shadow-card-hover transition-all">
            <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-4 mx-auto shrink-0">
              <LayoutDashboard size={22} />
            </div>
            <h3 className="text-text-primary font-bold text-lg mb-2 text-center">Multi-Event Studio Dashboard</h3>
            <p className="text-text-secondary text-sm leading-relaxed text-center mb-3">
              Manage all client bookings from one command center. Assign 4-digit Event PINs for 2nd shooters, moderate live uploads, and download 1-click full-res 4K ZIP archives.
            </p>
            <span className="text-xs font-semibold text-primary mt-auto">
              1-Click 4K ZIP client delivery
            </span>
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
                  <p className="text-[11px] text-text-muted">by Vikram R. (Guest Phone) · 4s ago</p>
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
                  <p className="text-[11px] text-text-muted">by Priya S. (Guest Phone) · 12s ago</p>
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
                  <p className="text-xs font-bold text-text-primary truncate">Stage Fireworks & Grand Entry 🎉</p>
                  <p className="text-[11px] text-text-muted">by Lead Shooter (Sony A7 IV Tethered)</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">
                    4K DSLR Stream
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-border flex items-center justify-between text-xs text-text-secondary flex-wrap gap-2">
              <span className="font-medium">184 / 300 Guests Active</span>
              <span className="text-primary font-bold">Medium Event Tier · Studio White-Labeled</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mx-auto">
          <Link
            href="/photographers"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-primary hover:opacity-90 text-white font-bold text-sm sm:text-base transition-all shadow-sm hover:scale-105 active:scale-95"
          >
            <span>Explore Studio Solutions</span>
            <ArrowRight size={18} />
          </Link>
          <Link
            href="/photographers/dslr-guide"
            className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-full bg-surface border-2 border-border text-text-primary hover:border-accent hover:text-accent font-semibold text-sm sm:text-base transition-all"
          >
            <span>View Camera Setup Guide</span>
            <ExternalLink size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
