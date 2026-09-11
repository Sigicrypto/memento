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
      q: "Are the photos private? Who can see them?",
      a: "Yes, 100% private. Galleries are private by default and can only be accessed by guests who scan your unique event QR code or visit your private event link. They are never indexed on Google, never made public, and never shared with third parties or advertisers. As the host, you have full moderation control, gallery locking capabilities, and permanent 1-click data deletion rights at any time.",
    },
    {
      q: "What happens if there's poor Wi-Fi or cellular signal at the venue?",
      a: "MyMemento features built-in intelligent offline queueing. When guests capture photos in areas with spotty reception (like banquet basements, remote outdoor lawns, or thick stone walls), their browser securely queues the uploads locally on their phone. As soon as their device detects even a brief cellular or Wi-Fi signal, photos automatically sync to the cloud and stream to the venue screen without guests having to re-upload.",
    },
    {
      q: "How long does setup take, and what do I need to bring or print?",
      a: "Online setup takes under 60 seconds. Once your event is created, download print-ready PDF/PNG table cards and entrance posters with your custom QR code directly from your dashboard. For the venue, you only need any screen with an internet browser — a Smart TV, or a laptop connected to a projector/LED screen via HDMI, AirPlay, or Chromecast. Simply open your private Live Wall URL, press full screen, and you're live.",
    },
    {
      q: "What's the refund or cancellation policy if our event is rescheduled?",
      a: "We offer complete date flexibility. If your wedding, party, or conference is rescheduled, you can adjust your event date anytime in your dashboard with zero penalties or re-booking fees. If your event is cancelled before the event date, simply contact our WhatsApp concierge support team for a full, prompt refund.",
    },
    {
      q: "How exactly does custom branding / white-labeling get applied?",
      a: "On the Pro plan, you can set your couple monogram (e.g., 'Ananya & Rohan'), select your theme colors, and customize the live wall ticker bar and table cards. On our Premium tier for studios and agencies, full white-labeling allows you to upload your photography studio logo and hex brand colors, removing all MyMemento references so couples and guests interact exclusively with your brand.",
    },
    {
      q: "What happens to photos after the gallery retention period ends?",
      a: "All photos and video clips remain safely stored in your high-speed cloud archive for the full duration of your plan (30 days on Starter, 1 year on Pro, and extended/lifetime on Premium). Before any expiration, you receive automatic reminders via email and WhatsApp with a direct 1-click download link for your full-resolution master 4K ZIP. We never purge memories without notifying you first.",
    },
    {
      q: "Can guests download their own photos, or only the host?",
      a: "Both! Guests can easily save high-resolution copies of their own photos and candid shots taken by others directly from their mobile browser gallery. As the host or studio, you have exclusive access to download the master 1-click full-resolution 4K ZIP archive containing every single photo and video captured throughout the celebration.",
    },
    {
      q: "What devices and browsers are supported for guests and venue screens?",
      a: "For guests: Works on any modern smartphone (iPhone, Android, Samsung, Pixel) using standard browsers (Safari, Chrome, Samsung Internet, Edge, Firefox) with zero app download or account creation required. For the venue screen: Any device with a web browser — Smart TVs, MacBooks, Windows laptops, Chromebooks, Apple TV, Chromecast, or HDMI projector setups.",
    },
    {
      q: "Can incoming photos be moderated before they appear on the live screen?",
      a: "Yes. In your host console, you can enable live moderation so photos require 1-tap approval by you, your event coordinator, or a second shooter before projecting onto the venue screen. If you prefer a completely hands-off experience, you can switch on auto-approval anytime with a single tap.",
    },
  ];

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="w-full py-20 md:py-28 px-4 sm:px-6 lg:px-12 bg-white border-b border-slate-200/80 flex flex-col items-center justify-center">
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
        <div className="w-full space-y-3.5 mb-14">
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