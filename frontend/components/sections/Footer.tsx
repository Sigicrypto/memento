import React from "react";
import Link from "next/link";
import MyMementoLogo from "@/components/MyMementoLogo";

const InstagramIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const YoutubeIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="currentColor" />
  </svg>
);

const FacebookIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const LinkedinIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

export default function Footer() {
  const links = [
    { label: "Home", href: "/" },
    { label: "How It Works", href: "/#how-it-works" },
    { label: "Celebrations", href: "/#celebrations" },
    { label: "Live Wall", href: "/#live-wall" },
    { label: "Pricing", href: "/#pricing" },
    { label: "Testimonials", href: "/#testimonials" },
    { label: "FAQ", href: "/#faq" },
    { label: "For Photographers", href: "/photographers" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
    { label: "Contact", href: "/contact" },
  ];

  return (
    <footer className="w-full bg-white border-t border-slate-200/80 py-5 sm:py-6 px-4 sm:px-6 lg:px-12">
      <div className="max-w-7xl mx-auto w-full flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
        
        {/* Left: Brand Logo */}
        <div className="shrink-0">
          <Link href="/" className="inline-block">
            <MyMementoLogo />
          </Link>
        </div>

        {/* Center: Inline Links */}
        <div className="flex flex-wrap items-center justify-center gap-x-3 sm:gap-x-4 gap-y-2 text-xs sm:text-sm text-slate-600 font-medium">
          {links.map((item, idx) => (
            <React.Fragment key={item.label}>
              <Link
                href={item.href}
                className="hover:text-[#0A2540] transition-colors"
              >
                {item.label}
              </Link>
              {idx < links.length - 1 && (
                <span className="text-slate-300 select-none">|</span>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Right: Social Icons + Made in India */}
        <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0">
          <div className="flex items-center gap-3 text-slate-700">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center hover:text-[#0A2540] hover:border-slate-400 transition-colors"
              aria-label="Instagram"
            >
              <InstagramIcon size={15} />
            </a>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center hover:text-[#0A2540] hover:border-slate-400 transition-colors"
              aria-label="YouTube"
            >
              <YoutubeIcon size={15} />
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center hover:text-[#0A2540] hover:border-slate-400 transition-colors"
              aria-label="Facebook"
            >
              <FacebookIcon size={15} />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center hover:text-[#0A2540] hover:border-slate-400 transition-colors"
              aria-label="LinkedIn"
            >
              <LinkedinIcon size={15} />
            </a>
          </div>

          <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5 whitespace-nowrap pl-2 border-l border-slate-200 hidden sm:flex">
            Made with <span className="text-red-500">❤️</span> in India 🇮🇳
          </span>
        </div>

      </div>

      {/* Sub-footer copyright */}
      <div className="max-w-7xl mx-auto w-full pt-4 mt-4 border-t border-slate-100 flex items-center justify-center text-[11px] text-slate-400">
        &copy; {new Date().getFullYear()} MyMemento. All rights reserved. Live photo sharing for weddings, studios &amp; celebrations.
      </div>
    </footer>
  );
}
