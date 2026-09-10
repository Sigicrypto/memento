"use client";

import React from "react";
import Link from "next/link";

export default function CelebrationsSection() {
  const celebrations = [
    {
      name: "Weddings",
      image: "/mockup-assets/wedding.jpg",
      href: "/weddings",
    },
    {
      name: "Birthdays",
      image: "/mockup-assets/birthday.jpg",
      href: "/parties",
    },
    {
      name: "Corporate Events",
      image: "/mockup-assets/corporate.jpg",
      href: "/corporate-events",
    },
    {
      name: "College Events",
      image: "/mockup-assets/college.jpg",
      href: "/conferences",
    },
    {
      name: "Parties",
      image: "/mockup-assets/party.jpg",
      href: "/parties",
    },
    {
      name: "Festivals",
      image: "/mockup-assets/festival.jpg",
      href: "/parties",
    },
  ];

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

        <p className="text-slate-500 text-sm sm:text-base mb-12">
          From intimate gatherings to grand events.
        </p>

        {/* 6 Category Image Cards Grid */}
        <div className="w-full grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-5">
          {celebrations.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="group relative rounded-2xl overflow-hidden aspect-[4/3] bg-slate-900 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex items-end justify-center p-3 sm:p-4"
            >
              {/* Background Image */}
              <img
                src={item.image}
                alt={item.name}
                className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500"
              />

              {/* Dark Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />

              {/* Centered White Pill Badge */}
              <div className="relative z-10 px-3 sm:px-4 py-1.5 rounded-full bg-white/95 backdrop-blur-sm text-[#0A2540] font-bold text-xs sm:text-sm shadow-md whitespace-nowrap transition-transform duration-200 group-hover:scale-105">
                {item.name}
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}
