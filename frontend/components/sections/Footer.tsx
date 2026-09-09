"use client";

import React from 'react';
import Link from 'next/link';
import AnimatedLogo from '@/components/AnimatedLogo';

const FacebookIcon = ({ size = 20, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
  </svg>
);

const InstagramIcon = ({ size = 20, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

export default function Footer() {
  return (
    <footer className="w-full py-16 px-4 md:px-8 bg-bg-subtle border-t border-border text-text-primary flex flex-col items-center text-center">
      <div className="w-full max-w-6xl mx-auto flex flex-col items-center text-center">
        {/* Top part: 4 Columns */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 text-center">
          
          {/* Column 1 (Brand) */}
          <div className="flex flex-col items-center text-center gap-4">
            <div className="flex items-center justify-center gap-2">
              <AnimatedLogo width={32} height={32} />
              <span className="text-xl font-bold tracking-tight text-text-primary">Memento</span>
            </div>
            <p className="text-text-secondary text-sm mt-1 leading-relaxed max-w-xs">
              Every Guest. Every Moment. One Living Memory.
            </p>
            <p className="text-text-muted text-xs max-w-xs">
              Professional live photo wall and QR collection software for wedding photographers and event creators.
            </p>
          </div>

          {/* Column 2 (Product) */}
          <div className="flex flex-col items-center text-center gap-3">
            <h3 className="text-text-primary font-bold text-sm tracking-wide mb-1">Product</h3>
            <Link href="/how-it-works" className="text-text-secondary hover:text-primary transition-colors text-sm">How It Works</Link>
            <Link href="/features" className="text-text-secondary hover:text-primary transition-colors text-sm">Features Suite</Link>
            <Link href="/features/live" className="text-text-secondary hover:text-primary transition-colors text-sm">Memento Live Wall</Link>
            <Link href="/pricing" className="text-text-secondary hover:text-primary transition-colors text-sm">Pricing (Per-Event)</Link>
            <Link href="/demo" className="text-text-secondary hover:text-primary transition-colors text-sm">Live Wall Demo</Link>
          </div>

          {/* Column 3 (Use Cases) */}
          <div className="flex flex-col items-center text-center gap-3">
            <h3 className="text-text-primary font-bold text-sm tracking-wide mb-1">Use Cases</h3>
            <Link href="/weddings" className="text-text-secondary hover:text-primary transition-colors text-sm">Weddings & Sangeet</Link>
            <Link href="/parties" className="text-text-secondary hover:text-primary transition-colors text-sm">Birthday Parties & Bashes</Link>
            <Link href="/corporate-events" className="text-text-secondary hover:text-primary transition-colors text-sm">Corporate Galas</Link>
            <Link href="/conferences" className="text-text-secondary hover:text-primary transition-colors text-sm">Conferences & Expos</Link>
          </div>

          {/* Column 4 (For Studios & Company) */}
          <div className="flex flex-col items-center text-center gap-3">
            <h3 className="text-text-primary font-bold text-sm tracking-wide mb-1">For Photographers</h3>
            <Link href="/photographers" className="text-primary font-semibold hover:underline transition-colors text-sm">Studio White-Label</Link>
            <Link href="/photographers/dslr-guide" className="text-text-secondary hover:text-primary transition-colors text-sm">DSLR Wireless Sync Guide</Link>
            <Link href="/studio" className="text-text-secondary hover:text-primary transition-colors text-sm">Studio Portal Console</Link>
            <Link href="/about" className="text-text-secondary hover:text-primary transition-colors text-sm">About Us</Link>
            <Link href="/contact" className="text-text-secondary hover:text-primary transition-colors text-sm">Contact Support</Link>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="w-full border-t border-border mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-6 text-center">
          <div className="text-text-muted text-sm text-center">
            © 2026 Memento. All rights reserved.
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6">
            <Link href="/privacy" className="text-text-secondary hover:text-primary transition-colors text-sm">Privacy Policy</Link>
            <Link href="/terms" className="text-text-secondary hover:text-primary transition-colors text-sm">Terms of Service</Link>
            <Link href="/cookies" className="text-text-secondary hover:text-primary transition-colors text-sm">Cookies</Link>
          </div>

          <div className="flex items-center justify-center gap-4">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-text-muted hover:text-primary transition-colors" aria-label="Instagram">
              <InstagramIcon size={20} />
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-text-muted hover:text-primary transition-colors" aria-label="Facebook">
              <FacebookIcon size={20} />
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}
