"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FAQItem {
  q: string;
  a: string;
}

const FAQS: FAQItem[] = [
  {
    q: "How do photographers make money with Memento?",
    a: "Studios purchase Memento on wholesale per-event pricing (₹999 / ₹1,999 / ₹3,499) and bundle it into their premium wedding packages for ₹3,000 to ₹8,000+. You deliver 10x more photos, delight couples with an interactive live wall, and create a high-margin add-on service with zero extra crew.",
  },
  {
    q: "Can I wirelessly connect my DSLR or mirrorless camera to the Live Wall?",
    a: "Yes! Dual-stream live ingestion allows your team's camera shots to appear on the live wall alongside guest uploads. You can stream directly via camera Wi-Fi/FTP, tethered watch-folder auto-import (Lightroom, Capture One), or the photographer upload portal. Read our step-by-step DSLR Guide for complete setup instructions.",
  },
  {
    q: "Can I white-label Memento with my own studio brand?",
    a: "Absolutely. With studio white-labeling, table QR cards, the live wall bottom bar, and the mobile browser camera uploader all prominently feature your studio's logo, colors, and name. Couples and guests see your brand, not ours.",
  },
  {
    q: "Do guests need to download an app or create an account?",
    a: "Zero apps, zero accounts. Guests simply point their iPhone or Android camera at your QR code, and our web uploader opens instantly in Safari, Chrome, or any mobile browser. No login or password required.",
  },
  {
    q: "How do photos appear live on a TV or venue projector?",
    a: "Open your private Live Wall link on any laptop, tablet, or smart TV connected to your venue screen or projector via HDMI, AirPlay, or Chromecast. Press F11 for full-screen and photos auto-sync in under 2 seconds.",
  },
  {
    q: "Can incoming photos be moderated before showing on screen?",
    a: "Yes! The live host moderation console lets you or your designated second shooter approve or reject photos before they hit the big screen. You can also turn on 1-tap auto-approve if you prefer fully hands-off operation.",
  },
  {
    q: "What happens if an event exceeds the guest count limit?",
    a: "We never interrupt a live wedding. If guest attendance crosses your plan tier, guests can still snap and upload seamlessly with our 10% grace buffer. You can upgrade tiers anytime from your dashboard by paying only the price difference.",
  },
  {
    q: "How do I deliver photos to the couple after the event?",
    a: "You can download all high-resolution photos and video clips in a single 1-click 4K ZIP file directly from your studio dashboard to include in your client delivery package or online drive.",
  },
  {
    q: "Can I manage multiple client events from one studio dashboard?",
    a: "Yes! The studio dashboard lets you create, brand, and monitor multiple weddings simultaneously, assign PIN codes to second shooters for each event, and track upload stats across all your bookings.",
  },
  {
    q: "Are event photos private and secure?",
    a: "Yes. Only guests with your unique event QR code or event URL can upload and view photos. You can lock or archive the event gallery anytime, and hosts have permanent one-click data deletion rights.",
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
