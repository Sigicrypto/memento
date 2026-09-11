"use client";

import React from "react";
import { ShieldCheck, Lock, KeyRound, Shield, CheckCircle2 } from "lucide-react";

export default function TrustSecuritySection() {
  const trustPoints = [
    {
      icon: Lock,
      title: "Private by Default",
      headline: "Never Indexed Online",
      description: "Galleries cannot be found on search engines or public directories. Only guests with your unique QR code or direct invite link have access.",
    },
    {
      icon: ShieldCheck,
      title: "Host Moderation",
      headline: "Complete Screen Control",
      description: "Enable live review to approve photos before they appear on venue screens, or switch to seamless auto-approval whenever you choose.",
    },
    {
      icon: KeyRound,
      title: "Encrypted Storage",
      headline: "Bank-Grade Cloud Security",
      description: "All photo uploads and streams are protected with TLS/SSL encryption in transit and AES-256 cloud encryption at rest.",
    },
    {
      icon: Shield,
      title: "Your Data, Your Rules",
      headline: "1-Click Permanent Deletion",
      description: "Download your master archive and delete any photo or entire event permanently with 1 tap. We never sell data or train AI on your photos.",
    },
  ];

  return (
    <section className="w-full py-20 md:py-28 px-4 sm:px-6 lg:px-12 bg-[#F8FAFC] border-b border-slate-200/80 flex flex-col items-center justify-center">
      <div className="max-w-7xl mx-auto w-full flex flex-col items-center">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-200/80 text-slate-700 text-xs font-bold tracking-[0.15em] uppercase mb-4">
            <Lock size={13} className="text-amber-600" />
            <span>SECURITY, PRIVACY &amp; OWNERSHIP</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[#0A2540] tracking-tight leading-tight mb-4">
            Your Memories Belong to You. Period.
          </h2>

          <p className="text-slate-600 text-sm sm:text-base md:text-lg leading-relaxed max-w-2xl mx-auto font-normal">
            Built from the ground up for high-profile weddings and private family gatherings where trust, discretion, and data privacy are non-negotiable.
          </p>
        </div>

        {/* 4 Trust Cards Grid with Subtle Restrained Borders */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl mx-auto">
          {trustPoints.map((point) => {
            const Icon = point.icon;
            return (
              <div
                key={point.title}
                className="p-7 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md hover:border-amber-400/40 transition-all flex flex-col justify-between text-left group"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-[#EEF5FB] border border-blue-100 flex items-center justify-center text-[#0A2540] mb-5 group-hover:bg-[#0A2540] group-hover:text-amber-400 transition-colors">
                    <Icon size={22} className="stroke-[2.2]" />
                  </div>

                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-600 mb-1 block">
                    {point.title}
                  </span>

                  <h3 className="text-lg font-bold text-[#0A2540] mb-2 leading-snug">
                    {point.headline}
                  </h3>

                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-4">
                    {point.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                  <CheckCircle2 size={14} />
                  <span>Guaranteed by design</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
