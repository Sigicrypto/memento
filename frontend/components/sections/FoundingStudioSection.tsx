"use client";

import React from "react";
import { Smartphone, Zap, Camera, Palette, MessageSquare, ShieldCheck, Check, Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function FoundingStudioSection() {
  return (
    <section id="studio-program" className="w-full py-20 md:py-28 px-4 sm:px-6 lg:px-12 bg-white border-b border-slate-100 flex flex-col items-center justify-center">
      <div className="max-w-7xl w-full mx-auto flex flex-col items-center">
        
        {/* Section Eyebrow & Title */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-700 text-xs font-bold tracking-[0.15em] uppercase mb-4">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span>FOUNDING STUDIO PROGRAM · NOW ONBOARDING</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[#0A2540] tracking-tight leading-tight mb-4">
            Be One of the First Studios Offering Live Photo Walls
          </h2>

          <p className="text-slate-600 text-sm sm:text-base md:text-lg leading-relaxed max-w-2xl mx-auto font-normal">
            We are onboarding an exclusive cohort of wedding photographers and studios for the upcoming wedding season. Get direct 1-on-1 founder onboarding, wholesale per-event pricing, and white-label studio branding.
          </p>
        </div>

        {/* Magic UI Bento Grid */}
        <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-y-8 sm:gap-y-10 md:gap-y-8 gap-x-6 sm:gap-x-8 max-w-6xl mx-auto mb-12 sm:mb-16">
          
          {/* Bento Card 1: 0 App Downloads (Span 7) */}
          <div className="md:col-span-7 bg-[#F8FAFC] border border-slate-200/90 rounded-3xl p-7 sm:p-8 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-[#0A2540] mb-5 shadow-sm">
                <Smartphone size={24} className="stroke-[2.2]" />
              </div>
              <div className="inline-block text-xs font-bold uppercase tracking-wider text-amber-600 mb-1">
                Zero Friction for Guests
              </div>
              <h3 className="text-2xl font-bold text-[#0A2540] mb-3">
                0 App Downloads for Guests
              </h3>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-md">
                100% browser-based QR flow. Guests simply point their iPhone or Android camera at your table cards. An in-browser camera opens instantly with zero downloads, zero logins, and zero friction.
              </p>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-200/70 flex items-center gap-4 text-xs font-semibold text-slate-700">
              <span className="flex items-center gap-1.5 text-emerald-700">
                <Check size={16} /> Works on Safari &amp; Chrome
              </span>
              <span className="flex items-center gap-1.5 text-emerald-700">
                <Check size={16} /> No account creation
              </span>
            </div>
          </div>

          {/* Bento Card 2: < 2s Screen Sync (Span 5) */}
          <div className="md:col-span-5 bg-gradient-to-br from-[#0A2540] to-[#051324] text-white border border-slate-800 rounded-3xl p-7 sm:p-8 flex flex-col justify-between shadow-lg relative overflow-hidden">
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-amber-400 mb-5 shadow-inner">
                <Zap size={24} className="stroke-[2.2]" />
              </div>
              <div className="inline-block text-xs font-bold uppercase tracking-wider text-amber-400 mb-1">
                Real-Time Streaming
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">
                &lt; 2s Venue Screen Sync
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                Ultra-fast real-time photo wall projection with built-in auto-slideshow, customizable display modes, and host moderation console.
              </p>
            </div>

            <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-amber-300 font-mono">
              <span>Smart TV · HDMI · Projector</span>
              <span className="font-bold">1080p &amp; 4K</span>
            </div>
          </div>

          {/* Bento Card 3: DSLR Sync (Span 5) */}
          <div className="md:col-span-5 bg-[#F8FAFC] border border-slate-200/90 rounded-3xl p-7 sm:p-8 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-[#0A2540] mb-5 shadow-sm">
                <Camera size={24} className="stroke-[2.2]" />
              </div>
              <div className="inline-block text-xs font-bold uppercase tracking-wider text-amber-600 mb-1">
                Dual-Stream Ingestion
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-[#0A2540] mb-3">
                DSLR &amp; Pro Camera Sync
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Stream your professional camera selects right onto the venue screen alongside guest phone candids for a high-impact presentation.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200/70 text-xs font-semibold text-slate-600 flex items-center gap-2">
              <Sparkles size={14} className="text-amber-500" />
              <span>Pro photographer workflow ready</span>
            </div>
          </div>

          {/* Bento Card 4: White-Label Studio Branding (Span 7) */}
          <div className="md:col-span-7 bg-[#EEF5FB] border border-blue-100 rounded-3xl p-7 sm:p-8 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-white border border-blue-200/80 flex items-center justify-center text-[#0A2540] mb-5 shadow-sm">
                <Palette size={24} className="stroke-[2.2]" />
              </div>
              <div className="inline-block text-xs font-bold uppercase tracking-wider text-blue-700 mb-1">
                Agency Mode
              </div>
              <h3 className="text-2xl font-bold text-[#0A2540] mb-3">
                100% White-Label Studio Branding
              </h3>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-lg">
                Your photography logo, custom hex colors, and couple monogram on every screen, QR card, and gallery. Couples and guests interact exclusively with YOUR studio brand.
              </p>
            </div>

            <div className="mt-8 pt-4 border-t border-blue-200/60 flex items-center gap-6 text-xs font-semibold text-slate-700">
              <span className="flex items-center gap-1.5 text-blue-900">
                <Check size={16} className="text-blue-700" /> Zero MyMemento mentions
              </span>
              <span className="flex items-center gap-1.5 text-blue-900">
                <Check size={16} className="text-blue-700" /> Custom table card PDFs
              </span>
            </div>
          </div>

        </div>

        {/* Founding Studio Callout Box with Direct Founder Line */}
        <div className="w-full max-w-6xl bg-gradient-to-r from-amber-50 via-white to-amber-50 border border-amber-200/80 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col text-center md:text-left">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700 mb-1">
              SEASON 2026 ONBOARDING
            </span>
            <h4 className="text-xl sm:text-2xl font-bold text-[#0A2540]">
              Direct Founder Onboarding &amp; Wholesale Pricing
            </h4>
            <p className="text-slate-600 text-xs sm:text-sm mt-1 max-w-xl">
              Photographers shooting 5+ weddings get direct VIP founder onboarding, WhatsApp weekend support during live events, and wholesale volume pricing.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <a
              href="https://wa.me/919866161775?text=Hi%2C%20I%27m%20a%20wedding%20photographer%2Fstudio%20owner%20interested%20in%20joining%20the%20Founding%20Studio%20Program."
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 whitespace-nowrap"
            >
              <MessageSquare size={16} />
              <span>Talk Directly with Founder on WhatsApp</span>
            </a>
            <Link
              href="/photographers"
              className="px-5 py-3 rounded-full border border-slate-300 hover:bg-white text-slate-700 font-semibold text-xs transition-colors"
            >
              Learn More
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}
