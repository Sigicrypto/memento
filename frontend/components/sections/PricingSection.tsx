"use client";

import React from "react";
import { Check, MessageSquare, ArrowRight, TrendingUp, Sparkles, Layers, DollarSign } from "lucide-react";
import { useAuthModal } from "@/context/AuthModalContext";

export default function PricingSection() {
  const { openAuth } = useAuthModal();

  const packagingSteps = [
    {
      step: "01",
      title: "Your Memento Cost",
      value: "From ₹999 / event",
      desc: "Instant activation. No subscriptions, pay per wedding.",
      icon: DollarSign,
      color: "text-blue-600 bg-blue-50 border-blue-200",
    },
    {
      step: "02",
      title: "Add to Your Package",
      value: "Branded Experience",
      desc: "White-label live wall + custom QR cards with your logo.",
      icon: Layers,
      color: "text-amber-600 bg-amber-50 border-amber-200",
    },
    {
      step: "03",
      title: "Sell as Premium Add-On",
      value: "Charge ₹10,000–₹15,000",
      desc: "Couples happily pay for real-time guest participation.",
      icon: Sparkles,
      color: "text-purple-600 bg-purple-50 border-purple-200",
    },
    {
      step: "04",
      title: "Studio Net Profit",
      value: "Keep 80%+ Margin",
      desc: "High-margin new revenue with zero extra crew needed.",
      icon: TrendingUp,
      color: "text-emerald-600 bg-emerald-50 border-emerald-200",
    },
  ];

  const tiers = [
    {
      name: "Starter",
      price: "₹999",
      period: "per event",
      isPopular: false,
      ctaLabel: "Add Memento to Your Studio",
      ctaSubtext: "Instant activation · No sales call required",
      isSelfServe: true,
      features: [
        "Up to 500 photos",
        "Live photo wall",
        "Private gallery (30 days)",
        "Instant QR table card generation",
      ],
      buttonStyle: "bg-[#0A2540] hover:bg-[#0D355C] text-white",
    },
    {
      name: "Pro",
      price: "₹1,999",
      period: "per event",
      isPopular: true,
      ctaLabel: "Add Memento to Your Studio",
      ctaSubtext: "⭐ Most Popular for Weddings · Customize branding on the spot",
      isSelfServe: true,
      features: [
        "Up to 2,000 photos",
        "Live photo wall",
        "Private gallery (1 year)",
        "Custom studio branding & monograms",
        "Priority live sync bandwidth",
      ],
      buttonStyle: "bg-gradient-to-r from-amber-400 to-[#E5A93C] hover:from-amber-500 hover:to-[#D9932B] text-slate-950 shadow-md",
    },
    {
      name: "Premium",
      price: "₹3,499",
      period: "per event",
      isPopular: false,
      ctaLabel: "Talk to Concierge — White-Label",
      ctaSubtext: "Dedicated white-label onboarding on WhatsApp",
      isSelfServe: false,
      whatsappUrl: "https://wa.me/919866161775?text=Hi%2C%20I%27m%20interested%20in%20the%20Premium%20White-Label%20plan%20for%20MyMemento.",
      features: [
        "Unlimited photos",
        "Live photo wall (Full HD/4K)",
        "Private gallery (lifetime)",
        "100% white-label agency mode",
        "VIP dedicated WhatsApp concierge",
      ],
      buttonStyle: "bg-[#0A2540] hover:bg-[#0D355C] text-white",
    },
  ];

  return (
    <section id="pricing" className="w-full py-20 md:py-28 px-4 sm:px-6 lg:px-12 bg-[#FAFAF8] border-b border-slate-100 flex flex-col items-center justify-center">
      <div className="max-w-6xl w-full mx-auto flex flex-col items-center text-center">
        
        {/* Section Eyebrow & Heading */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-700 text-xs font-bold tracking-[0.15em] uppercase mb-4">
          <TrendingUp size={13} className="text-amber-600" />
          <span>REVENUE OPPORTUNITY &amp; PRICING</span>
        </div>

        <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[#0A2540] tracking-tight leading-tight mb-4">
          Turn Guest Photos Into a New Revenue Stream
        </h2>

        <p className="text-slate-600 text-sm sm:text-base md:text-lg leading-relaxed max-w-2xl mx-auto font-normal mb-12">
          Package Memento as an exclusive live interactive add-on for your upcoming weddings. Zero upfront commitments, pay only when you have an event.
        </p>

        {/* Visual Packaging Model Flowchart */}
        <div className="w-full max-w-5xl mb-16 bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="text-xs font-mono font-bold uppercase tracking-widest text-amber-600 mb-2">
            THE STUDIO PACKAGING BLUEPRINT
          </div>
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#0A2540] mb-6">
            How Photographers Monetize Memento
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch relative">
            {packagingSteps.map((s, idx) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.step}
                  className="bg-[#F8FAFC] border border-slate-200/80 rounded-2xl p-5 text-left flex flex-col justify-between relative group hover:border-amber-400/40 transition-colors"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-mono font-black text-slate-400">
                        {s.step}
                      </span>
                      <div className={`w-8 h-8 rounded-xl border flex items-center justify-center ${s.color}`}>
                        <Icon size={16} />
                      </div>
                    </div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                      {s.title}
                    </h4>
                    <div className="text-base sm:text-lg font-bold text-[#0A2540] mb-2 leading-tight">
                      {s.value}
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed border-t border-slate-200/60 pt-3">
                    {s.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* 60-Second Instant Setup Explainer */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm font-semibold mb-12 shadow-sm">
          <span className="text-amber-600">⚡ Instant 60-Second Activation:</span>
          <span>Your event is live immediately upon purchase. Custom QR code &amp; screen link generated on the spot.</span>
        </div>

        {/* 3 Pricing Cards */}
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-y-12 sm:gap-y-14 md:gap-y-8 gap-x-6 lg:gap-x-8 items-stretch max-w-5xl mx-auto pt-4 pb-2">
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

              {/* CTA Action Area with Standardized Language */}
              <div className="pt-2">
                {tier.isSelfServe ? (
                  <button
                    onClick={() => openAuth("signup")}
                    className={`w-full py-3.5 px-4 rounded-full font-bold text-xs sm:text-sm tracking-wide transition-all duration-200 active:scale-95 cursor-pointer flex items-center justify-center gap-2 ${tier.buttonStyle}`}
                  >
                    <span>{tier.ctaLabel}</span>
                    <ArrowRight size={15} />
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

        {/* Studio Wholesale Bundle Callout */}
        <div className="w-full max-w-4xl mt-16 p-6 sm:p-8 rounded-3xl bg-[#0A2540] text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl border border-white/10 text-center md:text-left">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-1 block">
              SEASON VOLUME DISCOUNT
            </span>
            <h4 className="font-serif text-xl sm:text-2xl font-bold text-white mb-1">
              Photographing 5+ weddings this season?
            </h4>
            <p className="text-blue-200 text-xs sm:text-sm max-w-xl">
              Get 15% off multi-event packages, custom studio onboarding, and dedicated weekend support on WhatsApp.
            </p>
          </div>

          <a
            href="https://wa.me/919866161775?text=Hi%2C%20I%20shoot%205%2B%20weddings%20a%20season%20and%20want%20to%20know%20about%20studio%20bundle%20pricing."
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3.5 rounded-full bg-gradient-to-r from-amber-400 to-[#E5A93C] hover:from-amber-500 hover:to-[#D9932B] text-slate-950 font-bold text-xs sm:text-sm shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 shrink-0 whitespace-nowrap"
          >
            <MessageSquare size={16} />
            <span>Inquire for Studio Wholesale</span>
          </a>
        </div>

      </div>
    </section>
  );
}