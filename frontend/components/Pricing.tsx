"use client";

import { useState, useEffect } from "react";
import { GUEST_TIERS } from "@/lib/plans";
import { Check, Users, MessageSquare, ChevronDown, Camera, ArrowRight } from "lucide-react";

interface PricingProps {
  isEmbedded?: boolean;
  eventId?: string;
}

export default function Pricing({ isEmbedded = false, eventId }: PricingProps) {
  const [currency, setCurrency] = useState<"inr" | "usd">("usd");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz === "Asia/Calcutta" || tz === "Asia/Kolkata") {
        setCurrency("inr");
      }
    } catch (e) {
      // fallback to usd
    }
  }, []);

  const formatPrice = (price: { inr: number; usd: number }) => {
    if (currency === "inr") {
      return `₹${price.inr}`;
    }
    return `$${price.usd}`;
  };

  const getWhatsAppLink = (tierName: string, price: { inr: number; usd: number }) => {
    const formattedPrice = formatPrice(price);
    const message = `Hi, I'm interested in the ${tierName} (${formattedPrice}) for my event.`;
    return `https://wa.me/919866161775?text=${encodeURIComponent(message)}`;
  };

  const faqs = [
    {
      q: "Why not a monthly subscription?",
      a: "You only pay when you have an event. No recurring charges.",
    },
    {
      q: "What happens if I exceed my guest limit?",
      a: "Guests can still upload. You'll see an upgrade banner in your dashboard.",
    },
    {
      q: "Can I upgrade mid-event?",
      a: "Yes, you can upgrade instantly and only pay the difference.",
    },
  ];

  return (
    <div className={`w-full ${isEmbedded ? "py-20 md:py-24" : "py-24"} bg-bg flex flex-col items-center justify-center text-center`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col items-center text-center">
        {/* Centered Pricing Header */}
        <div className="text-center mb-14 max-w-3xl mx-auto flex flex-col items-center">
          <span className="inline-block px-3.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-wider uppercase mb-4 mx-auto">
            TRANSPARENT PRICING
          </span>
          <h2 className="text-3xl md:text-5xl font-display font-bold text-text-primary mb-4 tracking-tight text-center">
            Simple, Per-Event Pricing
          </h2>
          <p className="text-base md:text-lg text-text-secondary max-w-2xl mx-auto mb-8 text-center leading-relaxed">
            Pay once per event. No recurring subscriptions. All pro features included at every tier.
          </p>
          
          <div className="inline-flex items-center p-1 bg-bg-subtle rounded-full border border-border shadow-sm mx-auto">
            <button
              onClick={() => setCurrency("inr")}
              className={`px-6 py-2 rounded-full text-sm font-semibold transition-all cursor-pointer ${
                currency === "inr"
                  ? "bg-surface text-text-primary shadow-sm"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              INR (₹)
            </button>
            <button
              onClick={() => setCurrency("usd")}
              className={`px-6 py-2 rounded-full text-sm font-semibold transition-all cursor-pointer ${
                currency === "usd"
                  ? "bg-surface text-text-primary shadow-sm"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              USD ($)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl w-full mx-auto mb-16 pt-4">
          {GUEST_TIERS.map((tier) => (
            <div
              key={tier.id}
              className={`relative bg-surface rounded-2xl p-8 border shadow-card hover:shadow-card-hover transition-all flex flex-col items-center text-center ${
                tier.highlight
                  ? "border-accent border-2 ring-2 ring-accent/15 lg:-translate-y-1 z-10"
                  : "border-border"
              }`}
            >
              {tier.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-20">
                  <span className="bg-accent text-white text-[10px] font-bold px-3.5 py-1 rounded-full uppercase tracking-wider shadow-sm whitespace-nowrap">
                    {tier.badge}
                  </span>
                </div>
              )}

              <div className="mb-6 flex flex-col items-center text-center w-full">
                <h3 className="text-2xl font-display font-bold text-text-primary mb-2 text-center">
                  {tier.name}
                </h3>
                <div className="flex items-center justify-center text-text-secondary mb-4 mx-auto">
                  <Users className="w-4 h-4 mr-2 text-accent" />
                  <span className="text-sm font-medium">{tier.guestRange}</span>
                </div>
                <div className="flex items-baseline justify-center mb-2 mx-auto">
                  <span className="text-4xl font-extrabold text-text-primary tracking-tight font-display">
                    {formatPrice(tier.price)}
                  </span>
                  <span className="text-text-muted ml-2 text-sm">/event</span>
                </div>
                <p className="text-sm text-text-secondary text-center">{tier.tagline}</p>
              </div>

              <div className="border-t border-border mb-6 w-full"></div>

              <ul className="space-y-3.5 mb-8 flex-1 text-left w-full">
                {tier.features.map((feature, i) => (
                  <li key={i} className="flex items-start">
                    <Check className="w-4 h-4 text-green-600 shrink-0 mr-3 mt-0.5" />
                    <span className="text-sm text-text-secondary">{feature}</span>
                  </li>
                ))}
              </ul>

              <a
                href={getWhatsAppLink(tier.name, tier.price)}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm text-center transition-all flex justify-center items-center cursor-pointer ${
                  tier.highlight
                    ? "bg-accent text-white hover:bg-[#D9932B] shadow-sm hover:shadow"
                    : "bg-bg-subtle text-text-primary hover:bg-border/60 border border-border"
                }`}
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Select Tier (WhatsApp)
              </a>
            </div>
          ))}
        </div>

        <div className="max-w-3xl mx-auto mb-20 bg-surface border border-border rounded-2xl p-8 border-l-4 border-l-accent shadow-card">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h4 className="text-xl font-display font-bold text-text-primary flex items-center mb-2">
                <Camera className="w-6 h-6 mr-3 text-accent" />
                Photographing 5+ weddings this season?
              </h4>
              <p className="text-text-secondary">
                Save 15% with a studio bundle. Contact us on WhatsApp.
              </p>
            </div>
            <a
              href="https://wa.me/919866161775?text=Hi,%20I'm%20interested%20in%20a%20studio%20bundle%20for%20multiple%20events."
              target="_blank"
              rel="noopener noreferrer"
              className="whitespace-nowrap px-6 py-3 bg-surface border-2 border-accent text-accent font-medium rounded-xl hover:bg-accent hover:text-surface transition-colors flex items-center"
            >
              Contact on WhatsApp
              <ArrowRight className="w-4 h-4 ml-2" />
            </a>
          </div>
        </div>

        <div className="max-w-5xl mx-auto mb-20">
          <h2 className="text-3xl font-display font-bold text-center text-text-primary mb-10">
            Compare Event Tiers
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr>
                  <th className="p-4 border-b border-border bg-surface text-text-primary font-medium rounded-tl-xl">Features</th>
                  <th className="p-4 border-b border-border bg-surface text-text-primary font-medium text-center">Small</th>
                  <th className="p-4 border-b border-border bg-surface text-text-primary font-medium text-center border-l border-r border-accent/20 bg-accent/5">Medium</th>
                  <th className="p-4 border-b border-border bg-surface text-text-primary font-medium text-center rounded-tr-xl">Large</th>
                </tr>
              </thead>
              <tbody className="bg-surface">
                {[
                  { name: "Guest Limit", s: "Up to 100 Guests", m: "Up to 300 Guests", l: "300 to 1,000+ Guests" },
                  { name: "Photos & Videos", s: true, m: true, l: true },
                  { name: "Live Wall", s: true, m: true, l: true },
                  { name: "Moderation", s: true, m: true, l: true },
                  { name: "Custom Branding", s: true, m: true, l: true },
                  { name: "White-Label", s: true, m: true, l: true },
                  { name: "Cloud Storage", s: "30 Days Archive", m: "60 Days Archive", l: "90 Days Extended" },
                ].map((row, i) => (
                  <tr key={i} className="border-b border-border last:border-0 hover:bg-bg-subtle transition-colors">
                    <td className="p-4 text-text-secondary font-medium">{row.name}</td>
                    <td className="p-4 text-center">
                      {typeof row.s === "boolean" ? <Check className="w-5 h-5 mx-auto text-accent" /> : <span className="text-text-secondary">{row.s}</span>}
                    </td>
                    <td className="p-4 text-center border-l border-r border-accent/20 bg-accent/5">
                      {typeof row.m === "boolean" ? <Check className="w-5 h-5 mx-auto text-accent" /> : <span className="text-text-secondary">{row.m}</span>}
                    </td>
                    <td className="p-4 text-center">
                      {typeof row.l === "boolean" ? <Check className="w-5 h-5 mx-auto text-accent" /> : <span className="text-text-secondary">{row.l}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="max-w-3xl mx-auto w-full text-center">
          <h2 className="text-3xl font-display font-bold text-center text-text-primary mb-10 mx-auto">
            Why Per-Event?
          </h2>
          <div className="space-y-4 w-full">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-surface border border-border rounded-xl overflow-hidden shadow-sm text-center">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full text-center px-8 py-4 flex items-center justify-center relative focus:outline-none cursor-pointer"
                >
                  <span className="font-bold text-text-primary text-center mx-auto">{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-text-muted transition-transform absolute right-4 sm:right-6 ${
                      openFaq === i ? "rotate-180 text-accent" : ""
                    }`}
                  />
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-4 text-text-secondary text-center max-w-2xl mx-auto leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
