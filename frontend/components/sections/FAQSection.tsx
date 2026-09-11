"use client";

import React, { useState } from "react";
import { ChevronDown, HelpCircle, MessageCircle } from "lucide-react";

interface FAQItem {
  q: string;
  a: string;
}

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs: FAQItem[] = [
    {
      q: "Are the photos private? Who can see them?",
      a: "Yes, 100% private. Galleries are private by default and can only be accessed by guests who scan your unique event QR code or visit your private event link. They are never indexed on Google, never made public, and never shared with third parties. As the host, you have full moderation control and one-click permanent deletion rights at any time.",
    },
    {
      q: "What happens after the event? How long are photos stored, and can I download them all?",
      a: "All photos and video clips are safely preserved in your secure high-speed cloud gallery (30 days on Starter, 1 year on Pro, and extended/lifetime on Premium). At any time during or after your event, you can download the entire full-resolution archive in a single 1-click 4K ZIP file directly from your host dashboard.",
    },
    {
      q: "Can I customize the branding (couples' names, colors, our studio logo)?",
      a: "Yes! On our Pro plan, you can customize the couple monogram (e.g., 'Ananya & Rohan'), wedding date, color palette, and live wall footer bar. For photography studios on our Premium plan, full white-labeling is available — replacing all MyMemento branding with your own studio logo, custom domain, and colors so your clients see only your studio brand.",
    },
    {
      q: "What if the venue has poor cell reception? Does it work offline?",
      a: "MyMemento features built-in offline queueing. When guests snap photos in spots with weak or intermittent reception (like banquet basements or remote lawns), their browser securely queues the photos locally on their device. As soon as their phone reconnects to 4G/5G or venue Wi-Fi, the photos automatically sync and upload to the live wall without guests having to do anything.",
    },
    {
      q: "What is your refund or cancellation policy if our event is rescheduled?",
      a: "We offer complete date flexibility. If your wedding or party date changes, you can reschedule your event date in your dashboard with zero penalty or fees. If an event is cancelled prior to your event date, simply message our WhatsApp concierge support team for a full hassle-free refund.",
    },
    {
      q: "Do guests need to download an app or sign in?",
      a: "Zero app downloads and zero accounts. Guests simply point their iPhone or Android camera at your QR code, and our web uploader opens immediately in Safari, Chrome, or any mobile browser. No login, password, or profile creation is ever required.",
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
          Everything you need to know about privacy, setup, venue displays, and event policies.
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
                    ? "bg-white border-[#0A2540]/20 shadow-md ring-1 ring-[#0A2540]/5"
                    : "bg-white/80 border-slate-200/80 hover:border-slate-300 hover:bg-white"
                }`}
              >
                <button
                  onClick={() => toggle(idx)}
                  className="w-full px-6 py-5 flex items-center justify-between gap-4 text-left cursor-pointer select-none"
                  aria-expanded={isOpen}
                >
                  <span className="font-bold text-[#0A2540] text-base sm:text-lg leading-snug">
                    {item.q}
                  </span>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-200 ${
                      isOpen
                        ? "bg-[#0A2540] text-white rotate-180"
                        : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                    }`}
                  >
                    <ChevronDown size={18} />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 pt-1 text-slate-600 text-sm sm:text-base leading-relaxed border-t border-slate-100/60">
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
            <span>Still have questions about your specific venue?</span>
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