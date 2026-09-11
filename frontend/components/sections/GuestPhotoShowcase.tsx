"use client";

import React, { useRef } from "react";
import { ChevronLeft, ChevronRight, Sparkles, Heart } from "lucide-react";
import { motion } from "framer-motion";

interface PhotoCard {
  id: string;
  category: string;
  title: string;
  caption: string;
  guestMeta: string;
  image: string;
}

const CARDS: PhotoCard[] = [
  {
    id: "card-1",
    category: "THE FIRST DANCE",
    title: "Pure Magic Under Fairy Lights",
    caption: "The venue lights dimmed and the room held its breath. Captured live from Table 2.",
    guestMeta: "Guest iPhone · 2s Live Wall Sync",
    image: "/landing-hero/photo1.jpg",
  },
  {
    id: "card-2",
    category: "EMOTIONS",
    title: "Tears of Joy Across the Aisle",
    caption: "Proud parents weeping happy tears — unscripted and completely authentic.",
    guestMeta: "Guest Android · Table 1 Front Row",
    image: "/landing-hero/photo2.jpg",
  },
  {
    id: "card-3",
    category: "TABLE CANDIDS",
    title: "Inside Jokes & 2 AM Laughter",
    caption: "College friends reuniting and laughing till their ribs hurt. No posers here.",
    guestMeta: "Cocktail Lawn · Spontaneous Snap",
    image: "/landing-hero/photo3.jpg",
  },
  {
    id: "card-4",
    category: "DANCE FLOOR",
    title: "Unstoppable Midnight Energy",
    caption: "The exact moment the beat dropped and everyone lost their minds.",
    guestMeta: "Dance Floor · 12:45 AM",
    image: "/landing-hero/photo7.jpg",
  },
  {
    id: "card-5",
    category: "GRAND ENTRANCE",
    title: "Dhol Beats & Euphoria",
    caption: "The groom arrives with high-octane energy and smoke effects.",
    guestMeta: "Baraat Procession · Live Streamed",
    image: "/landing-hero/photo8.jpg",
  },
  {
    id: "card-6",
    category: "SUNSET TOAST",
    title: "Champagne Under the Golden Hour",
    caption: "Clinking glasses as the sun dipped behind the palace horizon.",
    guestMeta: "Rooftop Terrace · Candid Select",
    image: "/landing-hero/photo9.jpg",
  },
];

export default function GuestPhotoShowcase() {
  const carouselRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -360, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 360, behavior: "smooth" });
    }
  };

  return (
    <section className="w-full py-20 md:py-28 bg-[#040C1A] text-white relative overflow-hidden border-b border-slate-800">
      {/* Ambience */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-12 flex flex-col items-center">
        
        {/* Header with Navigation Controls */}
        <div className="w-full flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-amber-300 text-xs font-bold tracking-[0.15em] uppercase mb-4">
              <Sparkles size={13} className="text-amber-400" />
              <span>ACTUAL GUEST PHOTOGRAPHS</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight">
              Memories You Can Never Stage.
            </h2>
            <p className="text-slate-300 text-sm sm:text-base mt-3 leading-relaxed">
              Photographers capture the timeless portraits. Memento unlocks the hundred other perspectives happening in every corner of the room.
            </p>
          </div>

          {/* Carousel Arrow Buttons */}
          <div className="hidden sm:flex items-center gap-3 shrink-0">
            <button
              onClick={scrollLeft}
              className="w-12 h-12 rounded-full border border-white/20 bg-white/5 hover:bg-white/15 text-white flex items-center justify-center transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95"
              aria-label="Scroll left"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={scrollRight}
              className="w-12 h-12 rounded-full border border-white/20 bg-white/5 hover:bg-white/15 text-white flex items-center justify-center transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95"
              aria-label="Scroll right"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Apple Cards Carousel Horizontal Scroll Container */}
        <div
          ref={carouselRef}
          className="w-full flex items-stretch gap-6 overflow-x-auto pb-8 pt-2 scroll-smooth no-scrollbar select-none"
          style={{ scrollSnapType: "x mandatory" }}
        >
          {CARDS.map((card, idx) => (
            <div
              key={card.id}
              style={{ scrollSnapAlign: "start" }}
              className="w-[280px] sm:w-[340px] md:w-[380px] shrink-0 aspect-[3/4] rounded-3xl overflow-hidden border border-white/15 shadow-2xl relative group bg-slate-900 flex flex-col justify-end p-6 sm:p-7 transition-transform duration-500 hover:scale-[1.02]"
            >
              {/* Card Photo */}
              <img
                src={card.image}
                alt={card.title}
                className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700 pointer-events-none"
              />

              {/* Gradient Scrim */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none" />

              {/* Top Category Tag */}
              <div className="absolute top-5 left-5 z-10">
                <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-amber-300 text-[10px] sm:text-xs font-bold uppercase tracking-wider shadow">
                  {card.category}
                </span>
              </div>

              {/* Card Bottom Content */}
              <div className="relative z-10 flex flex-col text-left">
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-white mb-2 leading-tight">
                  {card.title}
                </h3>
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-4 line-clamp-2">
                  {card.caption}
                </p>

                <div className="pt-3 border-t border-white/15 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>{card.guestMeta}</span>
                  <span className="text-amber-400 font-semibold flex items-center gap-1">
                    <Heart size={12} className="fill-amber-400" /> Live
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
