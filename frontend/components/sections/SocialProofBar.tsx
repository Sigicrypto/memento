"use client";

import React from "react";
import { Smartphone, Zap, Camera, Palette, MessageSquare } from "lucide-react";

export default function SocialProofBar() {
  const highlights = [
    {
      value: "0 Apps",
      label: "For Guests to Install",
      sublabel: "100% browser-based QR flow",
      icon: Smartphone,
    },
    {
      value: "< 2s",
      label: "Venue Screen Sync",
      sublabel: "Real-time photo wall projection",
      icon: Zap,
    },
    {
      value: "DSLR Sync",
      label: "Dual-Stream Live Ingestion",
      sublabel: "Pro camera selects + guest candids",
      icon: Camera,
    },
    {
      value: "100%",
      label: "Studio White-Labeled",
      sublabel: "Your brand, logo & monogram",
      icon: Palette,
    },
  ];

  return (
    <section className="w-full py-12 md:py-16 px-4 md:px-8 bg-surface border-y border-border flex flex-col items-center justify-center">
      <div className="max-w-6xl w-full mx-auto flex flex-col items-center text-center">
        {/* Founding Studio Program Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-bold tracking-wider uppercase mb-4 mx-auto">
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          FOUNDING STUDIO PROGRAM · NOW ONBOARDING
        </div>

        <h3 className="text-2xl sm:text-3xl font-display font-bold text-text-primary mb-3 text-center max-w-2xl">
          Be One of the First Studios Offering Live Photo Walls
        </h3>
        <p className="text-text-secondary text-sm sm:text-base max-w-2xl mx-auto mb-8 leading-relaxed text-center">
          We are currently onboarding an exclusive cohort of wedding photographers and studios for the upcoming wedding season. Get direct 1-on-1 founder onboarding, wholesale per-event pricing, and custom studio branding.
        </p>

        {/* 4 Authentic Feature Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-5xl mb-8">
          {highlights.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="flex flex-col items-center text-center p-4 rounded-xl bg-bg-subtle/70 border border-border/80"
              >
                <div className="w-9 h-9 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-accent mb-2">
                  <Icon size={18} />
                </div>
                <div className="text-xl sm:text-2xl md:text-3xl font-bold font-display text-accent">
                  {item.value}
                </div>
                <div className="text-text-primary font-semibold text-xs sm:text-sm mt-1">
                  {item.label}
                </div>
                <div className="text-text-secondary text-[11px] sm:text-xs mt-0.5">
                  {item.sublabel}
                </div>
              </div>
            );
          })}
        </div>

        {/* WhatsApp Founder CTA Button */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href="https://wa.me/919866161775?text=Hi%2C%20I%27m%20a%20wedding%20photographer%2Fstudio%20owner%20interested%20in%20joining%20the%20Founding%20Studio%20Program."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-all shadow-sm hover:scale-[1.02] active:scale-[0.98]"
          >
            <MessageSquare size={16} />
            <span>Talk Directly with Our Founder on WhatsApp</span>
          </a>
          <span className="text-text-muted text-xs">
            Direct founder line · No automated chatbots
          </span>
        </div>
      </div>
    </section>
  );
}
