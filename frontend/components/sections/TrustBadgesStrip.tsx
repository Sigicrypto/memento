"use client";

import React from "react";
import { ShieldCheck, Users, Heart, Headphones } from "lucide-react";

export default function TrustBadgesStrip() {
  const badges = [
    {
      icon: ShieldCheck,
      title: "Secure & Encrypted",
      desc: "Your photos are safe with us.",
    },
    {
      icon: Users,
      title: "Trusted by Professionals",
      desc: "Used across India.",
    },
    {
      icon: Heart,
      title: "Made for Special Moments",
      desc: "Weddings, birthdays and more.",
    },
    {
      icon: Headphones,
      title: "Dedicated Support",
      desc: "We're here to help.",
    },
  ];

  return (
    <section className="w-full py-10 md:py-14 px-4 sm:px-6 lg:px-8 bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto w-full grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 items-center justify-center">
        {badges.map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={index}
              className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-3.5"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-[#0A2540] flex items-center justify-center shrink-0">
                <Icon size={20} className="fill-[#0A2540]/10 text-[#0A2540]" />
              </div>
              <div className="flex flex-col">
                <h4 className="font-bold text-[#0A2540] text-xs sm:text-sm tracking-tight">
                  {item.title}
                </h4>
                <p className="text-slate-500 text-[11px] sm:text-xs mt-0.5">
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
