"use client";

import React from "react";
import { Check, MessageSquare } from "lucide-react";
import { useAuthModal } from "@/context/AuthModalContext";

export default function PricingSection() {
  const { openAuth } = useAuthModal();

  const tiers = [
    {
      name: "Starter",
      price: "₹999",
      period: "per event",
      isPopular: false,
      ctaLabel: "Set Up in 60s →",
      ctaSubtext: "Instant activation · No sales call required",
      isSelfServe: true,
      features: [
        "Up to 500 photos",
        "Live photo wall",
        "Private gallery (30 days)",
      ],
      buttonStyle: "bg-[#0A2540] hover:bg-[#0D355C] text-white",
    },
    {
      name: "Pro",
      price: "₹1,999",
      period: "per event",
      isPopular: true,
      ctaLabel: "Start in 60s — Instant Setup →",
      ctaSubtext: "Instant activation · Customize branding on the spot",
      isSelfServe: true,
      features: [
        "Up to 2,000 photos",
        "Live photo wall",
        "Private gallery (1 year)",
        "Custom branding",
      ],
      buttonStyle: "bg-gradient-to-r from-amber-400 to-[#E5A93C] hover:from-amber-500 hover:to-[#D9932B] text-slate-950 shadow-md",
    },
    {
      name: "Premium",
      price: "₹3,499",
      period: "per event",
      isPopular: false,
      ctaLabel: "Talk to Concierge — White-Label →",
      ctaSubtext: "Dedicated white-label onboarding on WhatsApp",
      isSelfServe: false,
      whatsappUrl: "https://wa.me/919866161775?text=Hi%2C%20I%27m%20interested%20in%20the%20Premium%20White-Label%20plan%20for%20MyMemento.",
      features: [
        "Unlimited photos",
        "Live photo wall (HD)",
        "Private gallery (lifetime)",
        "White-label options",
      ],
      buttonStyle: "bg-[#0A2540] hover:bg-[#0D355C] text-white",
    },
  ];

  return (
    <section id="pricing" className="w-full py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-white border-b border-slate-100 flex flex-col items-center justify-center">
      <div className="max-w-6xl w-full mx-auto flex flex-col items-center text-center">
        
        {/* Heading with decorative flanking rules */}
        <div className="flex items-center justify-center gap-3 md:gap-4 mb-2">
          <div className="w-8 sm:w-16 h-px bg-amber-400" />
          <h2 className="font-serif text-3xl sm:text-4xl md:text-4xl font-bold text-[#0A2540] tracking-tight">
            Simple &amp; Transparent Pricing
          </h2>
          <div className="w-8 sm:w-16 h-px bg-amber-400" />
        </div>

        <p className="text-slate-500 text-sm sm:text-base mb-4">
          Pay only when you have an event. No hidden charges.
        </p>

        {/* 60-Second Instant Setup Explainer */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm font-semibold mb-12 shadow-sm">
          <span className="text-amber-600">⚡ Instant 60-Second Setup:</span>
          <span>Your event is live immediately upon purchase. Custom QR code &amp; screen link generated on the spot.</span>
        </div>

        {/* 3 Pricing Cards */}
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch max-w-5xl mx-auto pt-2">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`relative rounded-3xl p-7 sm:p-8 flex flex-col justify-between transition-all duration-300 h-full ${
                tier.isPopular
                  ? "bg-[#0B2545] text-white shadow-2xl border-2 border-amber-400/50 md:-translate-y-3"
                  : "bg-white text-slate-800 border border-slate-200 shadow-sm hover:shadow-md"
              }`}
            >
              {/* Most Popular Badge */}
              {tier.isPopular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-amber-400 to-[#E5A93C] text-slate-950 text-xs font-bold uppercase tracking-wider shadow-sm whitespace-nowrap">
                  ⭐ Most Popular for Weddings
                </div>
              )}

              {/* Card Header */}
              <div className="text-center mb-5 pt-2">
                <h3 className={`text-lg font-bold mb-2 ${tier.isPopular ? "text-white" : "text-slate-800"}`}>
                  {tier.name}
                </h3>
                <div className="flex items-baseline justify-center gap-1.5">
                  <span className={`text-4xl sm:text-5xl font-extrabold tracking-tight font-sans ${tier.isPopular ? "text-white" : "text-[#0A2540]"}`}>
                    {tier.price}
                  </span>
                </div>
                <div className={`text-xs mt-1 font-medium ${tier.isPopular ? "text-blue-200" : "text-slate-500"}`}>
                  {tier.period}
                </div>
              </div>

              {/* Visual Feature Preview Box for Pro and Premium */}
              {tier.name === "Pro" && (
                <div className="mb-4 p-2.5 rounded-xl bg-white/10 border border-amber-400/30 text-left text-xs">
                  <div className="text-amber-300 font-bold mb-1 flex items-center justify-between">
                    <span>✨ Custom Branding Preview:</span>
                    <span className="text-[10px] bg-amber-400/20 text-amber-300 px-1.5 py-0.5 rounded">Included</span>
                  </div>
                  <div className="text-blue-100 text-[11px] leading-relaxed">
                    Couple Monogram (&ldquo;A &amp; R&rdquo;), custom wedding color theme, and customized live wall bottom bar.
                  </div>
                </div>
              )}

              {tier.name === "Premium" && (
                <div className="mb-4 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-left text-xs">
                  <div className="text-[#0A2540] font-bold mb-1 flex items-center justify-between">
                    <span>🏢 White-Label Preview:</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">Pro Studio</span>
                  </div>
                  <div className="text-slate-600 text-[11px] leading-relaxed">
                    100% your studio logo and brand. Zero MyMemento mentions. Clients see only YOUR studio brand.
                  </div>
                </div>
              )}

              {/* Features List */}
              <ul className="space-y-3.5 my-4 text-left flex-1 border-t border-b py-5 border-slate-200/20">
                {tier.features.map((feat) => (
                  <li key={feat} className="flex items-center gap-3 text-xs sm:text-sm">
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                        tier.isPopular
                          ? "bg-blue-500/20 text-amber-300"
                          : "bg-blue-50 text-[#0D3B66]"
                      }`}
                    >
                      <Check size={13} className="stroke-[3]" />
                    </div>
                    <span className={tier.isPopular ? "text-slate-100" : "text-slate-700"}>
                      {feat}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA Action Area with Transparent Next-Step Label */}
              <div className="pt-2">
                {tier.isSelfServe ? (
                  <button
                    onClick={() => openAuth("signup")}
                    className={`w-full py-3.5 px-4 rounded-full font-bold text-xs sm:text-sm tracking-wide transition-all duration-200 active:scale-95 cursor-pointer flex items-center justify-center gap-2 ${tier.buttonStyle}`}
                  >
                    <span>{tier.ctaLabel}</span>
                  </button>
                ) : (
                  <a
                    href={tier.whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-full py-3.5 px-4 rounded-full font-bold text-xs sm:text-sm tracking-wide transition-all duration-200 active:scale-95 cursor-pointer flex items-center justify-center gap-2 ${tier.buttonStyle}`}
                  >
                    <MessageSquare size={16} className="shrink-0" />
                    <span>{tier.ctaLabel}</span>
                  </a>
                )}
                <p className={`text-[11px] mt-2 font-medium ${tier.isPopular ? "text-amber-200/80" : "text-slate-500"}`}>
                  {tier.ctaSubtext}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}