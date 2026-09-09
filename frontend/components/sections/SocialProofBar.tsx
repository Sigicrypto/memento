"use client";

import React from "react";
import { Smartphone, Zap, Sparkles, ShieldCheck } from "lucide-react";

export default function SocialProofBar() {
  const highlights = [
    {
      value: "0",
      label: "Apps to Download",
      sublabel: "100% browser-based QR flow",
      icon: Smartphone,
    },
    {
      value: "< 2s",
      label: "Live Screen Sync",
      sublabel: "Instant photo wall projection",
      icon: Zap,
    },
    {
      value: "100%",
      label: "Original Quality",
      sublabel: "Full resolution, no compression",
      icon: Sparkles,
    },
    {
      value: "Private",
      label: "Host Controlled",
      sublabel: "Safe & private by default",
      icon: ShieldCheck,
    },
  ];

  return (
    <section className="w-full py-10 px-4 md:px-8 bg-surface border-y border-border flex flex-col items-center justify-center">
      <div className="max-w-6xl w-full mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {highlights.map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={index} className="flex flex-col items-center text-center">
                <div className="w-9 h-9 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-accent mb-2">
                  <Icon size={18} />
                </div>
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold font-display text-accent">
                  {item.value}
                </div>
                <div className="text-text-primary font-semibold text-sm mt-1">
                  {item.label}
                </div>
                <div className="text-text-secondary text-xs mt-0.5 hidden sm:block">
                  {item.sublabel}
                </div>
              </div>
            );
          })}
        </div>
        <p className="text-text-muted text-xs sm:text-sm mt-6 text-center">
          A fresh, frictionless live camera experience crafted for modern events.
        </p>
      </div>
    </section>
  );
}
