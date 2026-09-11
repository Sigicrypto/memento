"use client";

import React from "react";
import { ShieldCheck, Users, Heart, Headphones } from "lucide-react";

export default function TrustBadgesStrip() {
  const badges = [
    {
      icon: Users,
      title: "500+ Events Powered",
      desc: "Weddings & galas worldwide.",
    },
    {
      icon: ShieldCheck,
      title: "150,000+ Photos Shared",
      desc: "Full 4K resolution & encrypted.",
    },
    {
      icon: Heart,
      title: "100% In-Browser",
      desc: "Zero app download for guests.",
    },
    {
      icon: Headphones,
      title: "Direct WhatsApp Support",
      desc: "Real-time event day concierge.",
    },
  ];

  return (
    <section className="w-full py-8 md:py-10 px-4 sm:px-6 lg:px-12 bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto w-full grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 items-center justify-between">
        {badges.map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={index}
              className="flex items-center gap-3.5 text-left"
            >
              <div className="text-[#0A2540] shrink-0">
                <Icon size={24} className={item.title.includes("Special") ? "fill-[#0A2540]" : "stroke-[2.2]"} />
              </div>
              <div className="flex flex-col">
                <h4 className="font-bold text-[#0A2540] text-xs sm:text-sm tracking-tight leading-tight">
                  {item.title}
                </h4>
                <p className="text-slate-500 text-[11px] sm:text-xs mt-0.5 leading-snug">
                  {item.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
