"use client";

import React from "react";
import { Check } from "lucide-react";
import { useAuthModal } from "@/context/AuthModalContext";

export default function PricingSection() {
  const { openAuth } = useAuthModal();

  const tiers = [
    {
      name: "Starter",
      price: "₹999",
      period: "per event",
      isPopular: false,
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

        <p className="text-slate-500 text-sm sm:text-base mb-14">
          Pay only when you have an event. No hidden charges.
        </p>

        {/* 3 Pricing Cards */}
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-8 items-stretch max-w-5xl mx-auto">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`relative rounded-3xl p-7 sm:p-8 flex flex-col justify-between transition-all duration-300 ${
                tier.isPopular
                  ? "bg-[#0B2545] text-white shadow-2xl border-2 border-amber-400/40 md:-translate-y-3"
                  : "bg-white text-slate-800 border border-slate-200 shadow-sm hover:shadow-md"
              }`}
            >
              {/* Most Popular Badge */}
              {tier.isPopular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-amber-400 to-[#E5A93C] text-slate-950 text-xs font-bold uppercase tracking-wider shadow-sm">
                  Most Popular
                </div>
              )}

              {/* Card Header */}
              <div className="text-center mb-6 pt-2">
                <h3 className={`text-lg font-bold mb-3 ${tier.isPopular ? "text-white" : "text-slate-800"}`}>
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

              {/* Features List */}
              <ul className="space-y-3.5 my-6 text-left flex-1 border-t border-b py-6 border-slate-100/15">
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

              {/* CTA Button */}
              <button
                onClick={() => openAuth("signup")}
                className={`w-full py-3.5 rounded-full font-bold text-sm tracking-wide transition-all duration-200 active:scale-95 cursor-pointer ${tier.buttonStyle}`}
              >
                Get Started
              </button>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
