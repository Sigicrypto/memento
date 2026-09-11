"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { useAuthModal } from "@/context/AuthModalContext";

interface CelebrationItem {
  id: string;
  name: string;
  image: string;
  href: string;
  ctaText: string;
  headline: string;
  description: string;
  features: string[];
}

export default function CelebrationsSection() {
  const { openAuth } = useAuthModal();
  const [selectedId, setSelectedId] = useState<string>("weddings");

  const celebrations: CelebrationItem[] = [
    {
      id: "weddings",
      name: "Weddings",
      image: "/mockup-assets/wedding.jpg",
      href: "/weddings",
      ctaText: "Create Wedding Event",
      headline: "Capture Every Table's Laughter & Love",
      description:
        "Your official photographer catches the ceremony; MyMemento collects hundreds of candid selfies, dance-floor madness, and family tears streaming live to the reception hall screen.",
      features: ["Couple Monogram Branding", "Live Reception Projector Wall", "1-Click 4K Full-Res ZIP", "Table QR Card Generator"],
    },
    {
      id: "birthdays",
      name: "Birthdays",
      image: "/mockup-assets/birthday.jpg",
      href: "/parties",
      ctaText: "Create Birthday Event",
      headline: "Crowdsource Every Angle of the Party",
      description:
        "Guests snap cake-cuttings, toasts, and dance moves right from their phones. The birthday star gets an instant memory vault without chasing anyone for photos the next day.",
      features: ["Zero App Downloads", "Real-Time Photo Wall", "Private Guest Vault", "Instant WhatsApp Share"],
    },
    {
      id: "corporate",
      name: "Corporate Events",
      image: "/mockup-assets/corporate.jpg",
      href: "/corporate-events",
      ctaText: "Create Corporate Event",
      headline: "Amplify Engagement & Brand Sponsorships",
      description:
        "Boost conference participation with a branded live wall. Display sponsor logos, announce key moments, and give attendees an interactive stage presence.",
      features: ["Custom Sponsor Overlays", "Strict Host Moderation", "Branded Digital Gallery", "Multi-Screen Presentation"],
    },
    {
      id: "college",
      name: "College Events",
      image: "/mockup-assets/college.jpg",
      href: "/conferences",
      ctaText: "Create College Event",
      headline: "High-Energy Live Crowdsourcing for Fests",
      description:
        "From convocation to cultural night, students love seeing their selfies hit the auditorium LED wall instantly. Handles high concurrent uploads smoothly.",
      features: ["High-Concurrency Queue", "Selfie & Group Photo Filter", "Auto-Loop Slideshow", "Lifetime Student Memory Link"],
    },
    {
      id: "parties",
      name: "Parties",
      image: "/mockup-assets/party.jpg",
      href: "/parties",
      ctaText: "Create Party Event",
      headline: "The Ultimate Icebreaker for Any Night Out",
      description:
        "Keep the dance floor buzzing! As soon as guests scan the bar QR code, their photos flash on venue screens, encouraging everyone to capture the vibe.",
      features: ["Fast QR Onboarding", "Vibrant Live Feed", "Host Approval Toggle", "Mobile-Optimized Experience"],
    },
    {
      id: "festivals",
      name: "Festivals",
      image: "/mockup-assets/festival.jpg",
      href: "/parties",
      ctaText: "Create Festival Event",
      headline: "Community Memories on Grand Venue Screens",
      description:
        "Whether a cultural gala, holiday celebration, or music night, celebrate collective joy across massive screens with unified community photo sharing.",
      features: ["Massive Stage Projection", "Multi-Zone QR Posters", "Full Offline Resync Buffer", "All-In-One Archive"],
    },
  ];

  const activeItem = celebrations.find((c) => c.id === selectedId) || celebrations[0];

  return (
    <section id="celebrations" className="w-full py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-white border-b border-slate-100 flex flex-col items-center justify-center">
      <div className="max-w-7xl w-full mx-auto flex flex-col items-center text-center">
        
        {/* Section Heading with decorative gold rules */}
        <div className="flex items-center justify-center gap-3 md:gap-4 mb-2">
          <div className="w-8 sm:w-16 h-px bg-amber-400" />
          <h2 className="font-serif text-3xl sm:text-4xl md:text-4xl font-bold text-[#0A2540] tracking-tight">
            Made for Every Celebration
          </h2>
          <div className="w-8 sm:w-16 h-px bg-amber-400" />
        </div>

        <p className="text-slate-500 text-sm sm:text-base mb-10 max-w-xl">
          From intimate gatherings to grand events. Tap any celebration to see how MyMemento works.
        </p>

        {/* 6 Category Interactive Selector Cards */}
        <div className="w-full grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6 lg:gap-6 mb-12 sm:mb-16">
          {celebrations.map((item) => {
            const isSelected = item.id === selectedId;
            return (
              <button
                key={item.id}
                onClick={() => setSelectedId(item.id)}
                className={`group relative rounded-2xl overflow-hidden aspect-[4/3] bg-slate-900 shadow-sm transition-all duration-300 flex items-end justify-center p-3 cursor-pointer text-left ${
                  isSelected
                    ? "ring-4 ring-amber-400 scale-[1.03] shadow-lg"
                    : "hover:scale-102 hover:shadow-md opacity-85 hover:opacity-100"
                }`}
              >
                {/* Background Image */}
                <img
                  src={item.image}
                  alt={item.name}
                  className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500"
                />

                {/* Dark Gradient Overlay */}
                <div className={`absolute inset-0 transition-opacity duration-300 pointer-events-none ${
                  isSelected ? "bg-gradient-to-t from-black/80 via-black/30 to-transparent" : "bg-gradient-to-t from-black/70 via-black/20 to-transparent"
                }`} />

                {/* Pill Badge */}
                <div
                  className={`relative z-10 px-3 py-1.5 rounded-full font-bold text-xs sm:text-sm shadow-md whitespace-nowrap transition-all duration-200 ${
                    isSelected
                      ? "bg-amber-400 text-slate-950 font-extrabold"
                      : "bg-white/95 text-[#0A2540] group-hover:bg-white"
                  }`}
                >
                  {item.name}
                </div>
              </button>
            );
          })}
        </div>

        {/* Interactive Celebration Spotlight Detail Card */}
        <div className="w-full max-w-4xl mx-auto bg-gradient-to-br from-[#0A2540] to-[#041324] text-white rounded-3xl p-6 sm:p-8 md:p-10 shadow-xl border border-white/10 flex flex-col md:flex-row items-center gap-6 sm:gap-8 text-left transition-all duration-300">
          <div className="relative w-full md:w-5/12 aspect-[4/3] rounded-2xl overflow-hidden shadow-md shrink-0 border border-white/15">
            <img
              src={activeItem.image}
              alt={activeItem.name}
              className="w-full h-full object-cover"
            />
            {/* Non-redundant Feature Tag */}
            <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-amber-300 text-xs font-bold flex items-center gap-1.5 border border-white/10">
              <Sparkles size={13} />
              <span>Live Demonstration</span>
            </div>
          </div>

          <div className="w-full md:w-7/12 flex flex-col items-start">
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white mb-2 leading-tight">
              {activeItem.headline}
            </h3>
            <p className="text-slate-200 text-xs sm:text-sm leading-relaxed mb-6 font-normal">
              {activeItem.description}
            </p>

            {/* Highlights */}
            <div className="grid grid-cols-2 gap-2.5 w-full mb-6">
              {activeItem.features.map((feat) => (
                <div key={feat} className="flex items-center gap-2 text-xs text-blue-100">
                  <CheckCircle2 size={14} className="text-amber-400 shrink-0" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full">
              <button
                onClick={() => openAuth("signup")}
                className="px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-400 to-[#E5A93C] hover:from-amber-500 hover:to-[#D9932B] text-slate-950 font-bold text-xs sm:text-sm shadow-md active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>{activeItem.ctaText}</span>
                <ArrowRight size={14} />
              </button>

              <Link
                href={activeItem.href}
                className="text-xs sm:text-sm text-slate-300 hover:text-white font-semibold underline underline-offset-4 decoration-white/40 hover:decoration-white transition-colors"
              >
                Learn more &rarr;
              </Link>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}