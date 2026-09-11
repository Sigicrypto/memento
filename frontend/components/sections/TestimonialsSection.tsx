"use client";

import React from "react";
import { Star, Camera, CheckCircle2, ArrowRight, ShieldCheck } from "lucide-react";
import Link from "next/link";

interface Testimonial {
  quote: string;
  author: string;
  role: string;
  studio: string;
  city: string;
  rating: number;
  highlight: string;
  initials: string;
  avatarBg: string;
  avatarText: string;
  ringColor: string;
}

export default function TestimonialsSection() {
  const testimonials: Testimonial[] = [
    {
      quote:
        "Adding the live photo wall to our luxury wedding package was an absolute game changer. The couple was blown away seeing their guests' spontaneous table selfies projected live on the ballroom wall. We downloaded the 4K ZIP in minutes after the reception.",
      author: "Vikram Sengupta",
      role: "Lead Wedding Photographer",
      studio: "Lumiere Weddings",
      city: "Mumbai & Goa",
      rating: 5,
      highlight: "Projector Live Wall & 4K ZIP",
      initials: "VS",
      avatarBg: "bg-gradient-to-br from-[#0A2540] to-[#1E3A8A]",
      avatarText: "text-amber-300",
      ringColor: "ring-2 ring-amber-400/40",
    },
    {
      quote:
        "No app download was the deciding factor for us. At past weddings, guests never downloaded random apps. With MyMemento, everyone from teenagers to my 72-year-old grandmother scanned the table QR card and uploaded instantly. We collected over 600 genuine candid shots!",
      author: "Pooja & Kabir",
      role: "Bride & Groom",
      studio: "Fairmont Jaipur Wedding",
      city: "Jaipur",
      rating: 5,
      highlight: "Zero App Friction for Guests",
      initials: "P&K",
      avatarBg: "bg-gradient-to-br from-[#831843] to-[#9D174D]",
      avatarText: "text-rose-100",
      ringColor: "ring-2 ring-rose-300/50",
    },
    {
      quote:
        "We white-label MyMemento with our studio logo and custom colors. Clients perceive it as our proprietary high-tech service. It has increased our average booking value by ₹15,000 per wedding without needing any additional crew on event day.",
      author: "Arjun Mehta",
      role: "Studio Founder & Cinematographer",
      studio: "The Wedlock Stories",
      city: "Bengaluru & Hyderabad",
      rating: 5,
      highlight: "Studio White-Labeling & Extra Revenue",
      initials: "AM",
      avatarBg: "bg-gradient-to-br from-[#064E3B] to-[#047857]",
      avatarText: "text-emerald-100",
      ringColor: "ring-2 ring-emerald-400/40",
    },
    {
      quote:
        "During our corporate gala, the live moderation console made all the difference. Our marketing team approved photos before they appeared on the main stage LED screens. The sponsor branding on the live wall looked sleek and professional.",
      author: "Neha Sharma",
      role: "Senior Event Director",
      studio: "Apex Summit 2026",
      city: "New Delhi",
      rating: 5,
      highlight: "Live Moderation & Sponsor Branding",
      initials: "NS",
      avatarBg: "bg-gradient-to-br from-[#312E81] to-[#4338CA]",
      avatarText: "text-purple-100",
      ringColor: "ring-2 ring-purple-300/50",
    },
  ];

  return (
    <section id="testimonials" className="w-full py-20 md:py-28 px-4 sm:px-6 lg:px-12 bg-white border-b border-slate-100 flex flex-col items-center justify-center">
      <div className="max-w-7xl w-full mx-auto flex flex-col items-center text-center">
        
        {/* Section Heading */}
        <div className="flex items-center justify-center gap-3 md:gap-4 mb-2">
          <div className="w-8 sm:w-16 h-px bg-amber-400" />
          <h2 className="font-serif text-3xl sm:text-4xl md:text-4xl font-bold text-[#0A2540] tracking-tight">
            Loved by Photographers &amp; Couples
          </h2>
          <div className="w-8 sm:w-16 h-px bg-amber-400" />
        </div>

        <p className="text-slate-500 text-sm sm:text-base mb-12 max-w-xl">
          Real experiences from wedding studios, banquet coordinators, and couples across the country.
        </p>

        {/* Testimonials 4-Card Grid */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-y-10 sm:gap-y-12 md:gap-y-8 gap-x-8 items-stretch text-left mb-16 sm:mb-20 max-w-5xl mx-auto">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="relative bg-slate-50/80 border border-slate-200/80 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow duration-300 h-full"
            >
              {/* Highlight Tag */}
              <div className="flex items-center justify-between gap-2 mb-4">
                <div className="flex items-center gap-1">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className="fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>
                <span className="text-[11px] font-bold text-[#0A2540] bg-amber-100/80 border border-amber-200/70 px-2.5 py-0.5 rounded-full">
                  {t.highlight}
                </span>
              </div>

              {/* Quote */}
              <p className="text-slate-700 text-sm sm:text-base leading-relaxed mb-6 italic relative flex-1">
                &ldquo;{t.quote}&rdquo;
              </p>

              {/* Reviewer Details with Styled Permanent Initials-Avatars */}
              <div className="pt-4 border-t border-slate-200/80 flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-11 h-11 rounded-full ${t.avatarBg} ${t.avatarText} ${t.ringColor} font-bold text-xs sm:text-sm flex items-center justify-center shrink-0 shadow-sm`}
                  >
                    {t.initials}
                  </div>
                  <div>
                    <h4 className="font-bold text-[#0A2540] text-sm leading-tight flex items-center gap-1.5">
                      <span>{t.author}</span>
                      <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                    </h4>
                    <p className="text-slate-500 text-xs mt-0.5">
                      {t.role} &bull; <span className="font-medium text-slate-700">{t.studio}</span> ({t.city})
                    </p>
                  </div>
                </div>

                <div className="hidden sm:flex items-center gap-1 text-[11px] text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full">
                  <ShieldCheck size={12} className="text-emerald-600" />
                  <span>Verified</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Partner Callout Box (Responsive Centered) */}
        <div className="w-full max-w-4xl mx-auto p-6 sm:p-8 rounded-3xl bg-[#0A2540] text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl border border-white/10 text-center md:text-left">
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <div className="w-12 h-12 rounded-2xl bg-amber-400/20 border border-amber-400/40 text-amber-300 flex items-center justify-center shrink-0 mx-auto sm:mx-0">
              <Camera size={24} />
            </div>
            <div>
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-white mb-1">
                Photographing weddings this season?
              </h3>
              <p className="text-blue-200 text-xs sm:text-sm">
                Get studio wholesale pricing, white-label setup, and our multi-event dashboard.
              </p>
            </div>
          </div>

          <Link
            href="/photographers"
            className="px-6 py-3 rounded-full bg-gradient-to-r from-amber-400 to-[#E5A93C] hover:from-amber-500 hover:to-[#D9932B] text-slate-950 font-bold text-xs sm:text-sm shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 shrink-0 whitespace-nowrap mx-auto md:mx-0"
          >
            <span>Partner With Us</span>
            <ArrowRight size={15} />
          </Link>
        </div>

      </div>
    </section>
  );
}