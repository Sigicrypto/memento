"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

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
  {
    q: "Is there a limit to how many guests can scan and contribute?",
    a: "There is no limit on guest headcount. Whether you host 30 guests at an intimate dinner or 1,500 attendees at a festival, everyone can scan and contribute at the same time.",
  },
  {
    q: "How long are photos stored, and can I delete them completely?",
    a: "Your event memories are securely preserved based on your plan tier (up to 30 or 90 days). You can download everything in high resolution as a ZIP file anytime, and hosts have permanent one-click data deletion rights.",
  },
  {
    q: "Can guests participate via WhatsApp?",
    a: "Yes! In addition to scanning QR codes, guests can text your event hashtag to our dedicated WhatsApp bot to instantly receive a deep-linked camera session with zero signups.",
  },
  {
    q: "How does the venue projector or TV connect to Memento Live?",
    a: "Simply open your private Live Wall link on any laptop or TV connected via HDMI, AirPlay, or Chromecast. Press F11 for full-screen and let the live slideshow run automatically.",
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="w-full py-20 md:py-28 px-4 md:px-8 bg-bg border-b border-border flex flex-col items-center justify-center text-center">
      <div className="max-w-3xl w-full mx-auto flex flex-col items-center text-center">
        
        <span className="px-3.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-wider uppercase mb-4 mx-auto">
          FAQ
        </span>

        <h2 className="text-3xl md:text-5xl font-black text-text-primary tracking-tight text-center mb-10 max-w-2xl mx-auto">
          Everything You Need to Know
        </h2>

        <div className="w-full text-center">
          {FAQS.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={faq.q}
                className="border-b border-border transition-all"
              >
                <button
                  onClick={() => toggle(index)}
                  className="w-full py-5 flex items-center justify-center text-center text-text-primary font-bold text-base md:text-lg hover:text-accent transition-colors relative px-10 cursor-pointer"
                >
                  <span className="text-center mx-auto">{faq.q}</span>
                  <ChevronDown
                    size={20}
                    className={`text-text-secondary shrink-0 transition-transform duration-300 absolute right-2 sm:right-4 ${
                      isOpen ? "rotate-180 text-accent" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="pb-5 text-text-secondary text-base leading-relaxed text-center max-w-2xl mx-auto">
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
