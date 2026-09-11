"use client";

import React, { useState } from "react";
import { ChevronDown, HelpCircle, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FAQItem {
  q: string;
  a: string;
}

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs: FAQItem[] = [
    {
      q: "Do guests need to download an app?",
      a: "No, absolutely zero downloads or app store visits are required. Guests point their standard smartphone camera (iPhone or Android) at your event QR code, and an in-browser camera opens instantly in Safari or Chrome. They don't even need to register or create an account.",
    },
    {
      q: "How does the QR code work at the venue?",
      a: "When you create your event in Memento, you instantly get high-resolution printable table card PDFs, entrance posters, and digital links. You can place the QR cards on dining tables, cocktail bars, or wedding favors. Guests simply point their camera and start sharing.",
    },
    {
      q: "Can I apply my own studio branding or white-label it?",
      a: "Yes! On the Pro plan, you can include custom couple monograms and theme colors. On our Premium tier, full white-label agency mode is enabled: your photography studio logo, custom colors, and watermark replace all Memento references across the live wall, QR cards, and digital gallery.",
    },
    {
      q: "Can guests see incoming photos immediately?",
      a: "Yes. In under 2 seconds, uploaded photos appear on both the live venue screen and the mobile live stream for guests browsing from their tables. The real-time projection creates an energetic, viral loop that encourages more guests to participate.",
    },
    {
      q: "Can I moderate photos before they hit the venue screen?",
      a: "Yes, 100%. In your host dashboard, you can turn on Live Moderation so photos require 1-tap approval before projecting onto the big screen. You or an assistant can approve or reject photos in real time. If you prefer a hands-off experience, you can switch on Auto-Approve anytime.",
    },
    {
      q: "Can I charge my clients for Memento as an add-on?",
      a: "Absolutely. Most studios package Memento as a 'Live Photo Wall & Guest Interactive Experience' add-on for ₹10,000–₹15,000 per wedding. Since your per-event cost is just ₹999 to ₹3,499, you retain an 80%+ profit margin with zero additional equipment or crew.",
    },
    {
      q: "How much does Memento cost per event?",
      a: "Pricing is transparent and per-event: Starter is ₹999 (up to 500 photos), Pro is ₹1,999 (up to 2,000 photos, custom branding), and Premium is ₹3,499 (unlimited photos, full white-labeling). There are zero monthly subscriptions or recurring fees—you only pay when you have an event.",
    },
    {
      q: "What happens if the venue has spotty Wi-Fi or cellular reception?",
      a: "Memento features built-in intelligent offline queueing. When guests snap photos in venue basements or remote lawns with weak signal, their browser securely queues the photos locally. As soon as the phone detects even a moment of reception, photos automatically upload to the cloud and venue wall without any re-upload needed.",
    },
    {
      q: "What happens after the event / how do we download photos?",
      a: "You have exclusive access to a 1-click master 4K ZIP download from your dashboard. It downloads all original full-resolution photos and videos without compression, making it effortless to include guest candids in your final studio client delivery.",
    },
    {
      q: "Can the couple and guests access the gallery later?",
      a: "Yes. You can share a private, password-protected gallery link with the couple and guests. They can browse the chronological timeline, relive the celebration, and download their favorite photos anytime throughout the gallery retention period.",
    },
  ];

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="w-full py-20 md:py-28 px-4 sm:px-6 lg:px-12 bg-[#FAFAF8] border-b border-slate-200/80 flex flex-col items-center justify-center">
      <div className="max-w-4xl w-full mx-auto flex flex-col items-center">
        
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="inline-block px-3.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold tracking-[0.15em] uppercase mb-4">
            FREQUENTLY ASKED QUESTIONS
          </span>

          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[#0A2540] tracking-tight leading-tight mb-4">
            Everything You Need to Know
          </h2>

          <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-normal">
            Clear answers about privacy, venue screen displays, setup, and studio policies.
          </p>
        </div>

        {/* Clean Accessible Accordion */}
        <div className="w-full space-y-4 sm:space-y-5 mb-16">
          {faqs.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? "bg-white border-[#0A2540]/30 shadow-md ring-1 ring-[#0A2540]/5"
                    : "bg-[#F8FAFC] border-slate-200 hover:border-slate-300 hover:bg-white"
                }`}
              >
                <button
                  onClick={() => toggle(idx)}
                  className="w-full px-5 sm:px-7 py-4 sm:py-5 flex items-center justify-between gap-4 text-left cursor-pointer select-none"
                  aria-expanded={isOpen}
                >
                  <span className="font-bold text-[#0A2540] text-sm sm:text-base md:text-lg leading-snug pr-2">
                    {item.q}
                  </span>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-200 ${
                      isOpen
                        ? "bg-[#0A2540] text-white rotate-180"
                        : "bg-slate-200/80 text-slate-600 hover:bg-slate-300"
                    }`}
                  >
                    <ChevronDown size={16} />
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                    >
                      <div className="px-5 sm:px-7 pb-5 sm:pb-6 pt-1 text-slate-600 text-xs sm:text-sm md:text-base leading-relaxed border-t border-slate-100">
                        {item.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Live Concierge Support Box */}
        <div className="w-full max-w-2xl bg-gradient-to-r from-amber-50 to-emerald-50 border border-slate-200/90 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
              <MessageCircle size={20} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Still have questions about your venue or setup?</h4>
              <p className="text-xs text-slate-600 mt-0.5">Chat directly with our founder on WhatsApp for fast answers.</p>
            </div>
          </div>

          <a
            href="https://wa.me/919866161775?text=Hi%2C%20I%20have%20a%20question%20about%20MyMemento%20for%20my%20event."
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm hover:scale-105 active:scale-95 whitespace-nowrap"
          >
            Chat on WhatsApp &rarr;
          </a>
        </div>

      </div>
    </section>
  );
}