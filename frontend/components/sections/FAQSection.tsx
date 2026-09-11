"use client";

import React, { useState } from "react";
import { ChevronDown, HelpCircle, MessageCircle } from "lucide-react";

interface FAQItem {
  q: string;
  a: string;
}

export default function FAQSection() {
  // First item open by default for immediate preview
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
      q: "What happens to photos after the gallery retention period ends (30 days / 1 year / lifetime)?",
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
    <section id="faq" className="w-full py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-slate-50/50 border-b border-slate-100 flex flex-col items-center justify-center">
      <div className="max-w-4xl w-full mx-auto flex flex-col items-center text-center">
        
        {/* Section Heading */}
        <div className="flex items-center justify-center gap-3 md:gap-4 mb-2">
          <div className="w-8 sm:w-16 h-px bg-amber-400" />
          <h2 className="font-serif text-3xl sm:text-4xl md:text-4xl font-bold text-[#0A2540] tracking-tight">
            Frequently Asked Questions
          </h2>
          <div className="w-8 sm:w-16 h-px bg-amber-400" />
        </div>

        <p className="text-slate-500 text-sm sm:text-base mb-12 max-w-xl">
          Everything you need to know about privacy, venue displays, setup, and event policies.
        </p>

        {/* Accordion List */}
        <div className="w-full space-y-3.5 text-left mb-12">
          {faqs.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? "bg-white border-[#0A2540]/25 shadow-md ring-1 ring-[#0A2540]/5"
                    : "bg-white/80 border-slate-200/80 hover:border-slate-300 hover:bg-white"
                }`}
              >
                <button
                  onClick={() => toggle(idx)}
                  className="w-full px-5 sm:px-6 py-4 sm:py-5 flex items-center justify-between gap-4 text-left cursor-pointer select-none"
                  aria-expanded={isOpen}
                >
                  <span className="font-bold text-[#0A2540] text-sm sm:text-base md:text-lg leading-snug pr-2">
                    {item.q}
                  </span>
                  <div
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-200 ${
                      isOpen
                        ? "bg-[#0A2540] text-white rotate-180"
                        : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                    }`}
                  >
                    <ChevronDown size={16} />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-1 text-slate-600 text-xs sm:text-sm md:text-base leading-relaxed border-t border-slate-100/70">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Live Concierge Support Box */}
        <div className="inline-flex flex-col sm:flex-row items-center gap-3 sm:gap-6 px-6 py-4 rounded-2xl bg-white border border-slate-200 shadow-sm text-slate-700 text-xs sm:text-sm">
          <div className="flex items-center gap-2 font-medium">
            <HelpCircle size={18} className="text-amber-500 shrink-0" />
            <span>Still have questions about your venue or setup?</span>
          </div>
          <a
            href="https://wa.me/919866161775?text=Hi%2C%20I%20have%20a%20question%20about%20MyMemento%20for%20my%20event."
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-emerald-600 hover:text-emerald-700 font-bold hover:underline cursor-pointer"
          >
            <MessageCircle size={16} />
            <span>Chat on WhatsApp &rarr;</span>
          </a>
        </div>

      </div>
    </section>
  );
}