"use client";

import React, { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

interface FAQItem {
  q: string;
  a: string;
}

const FAQS: FAQItem[] = [
  {
    q: "Do guests need to download an app?",
    a: "No! Guests simply open their phone camera and scan your event QR code. Memento opens instantly in their browser.",
  },
  {
    q: "Do guests need to create an account or sign in?",
    a: "No login or sign up is required for guests. They scan, pick or take a photo, add an optional caption, and tap upload.",
  },
  {
    q: "Can guests upload video clips?",
    a: "Yes! On Event, Premium, and Professional plans, guests can upload short video clips alongside photos.",
  },
  {
    q: "Does Memento work on any smartphone?",
    a: "Yes. Memento works seamlessly across iPhone, Android, tablets, and any mobile web browser with camera access.",
  },
  {
    q: "How do photos appear live on a TV or venue screen?",
    a: "Open the Live Wall link on any laptop or smart TV connected to your venue screen or projector. Photos auto-sync in real time.",
  },
  {
    q: "Are my event photos private?",
    a: "Yes. Only guests with your unique QR code or event URL can upload and view photos. You can also lock your event gallery at any time.",
  },
  {
    q: "Can incoming photos be moderated before showing on screen?",
    a: "Yes! Host moderation allows you or a designated host to approve or decline guest photos before they appear on the live wall.",
  },
  {
    q: "Can I download all photos after the event?",
    a: "Yes. You can download all high-resolution photos and video clips in a single ZIP file from your dashboard.",
  },
  {
    q: "Can I customize the live wall with my own branding or couple logo?",
    a: "Yes! You can add custom event names, logos, colors, background music, and sponsor branding.",
  },
  {
    q: "Can I integrate professional DSLR / Mirrorless cameras with Memento?",
    a: "Yes! Professional photographers can stream high-res camera shots directly to the Live Wall alongside guest uploads via Camera Wi-Fi/FTP auto-upload, tethered Lightroom/Capture One folder auto-import, or bulk photographer portal uploads in your dashboard.",
  },
  {
    q: "Can photographers or event planners use Memento for multiple clients?",
    a: "Yes! The Professional plan gives agencies, planners, and photographers a multi-event dashboard with white-label capabilities.",
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="w-full py-20 px-4 md:px-8 relative bg-slate-950/90 border-b border-white/5 flex flex-col items-center justify-center">
      <div className="max-w-6xl w-full mx-auto flex flex-col items-center text-center">
        
        <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-extrabold tracking-wider uppercase mb-4">
          Frequently Asked Questions
        </span>

        <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight text-center mb-10">
          Everything You Need to Know
        </h2>

        <div className="max-w-4xl w-full mx-auto space-y-4">
          {FAQS.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={faq.q}
                className="rounded-2xl bg-slate-900/60 border border-white/10 overflow-hidden transition-all"
              >
                <button
                  onClick={() => toggle(index)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-white text-sm md:text-base hover:text-cyan-300 transition-colors"
                >
                  <span className="flex items-center gap-3">
                    <HelpCircle size={18} className="text-cyan-400 shrink-0" />
                    {faq.q}
                  </span>
                  <ChevronDown
                    size={18}
                    className={`text-slate-400 shrink-0 transition-transform duration-300 ${
                      isOpen ? "rotate-180 text-cyan-400" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-slate-300 text-xs md:text-sm leading-relaxed border-t border-white/5">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
