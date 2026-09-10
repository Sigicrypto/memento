"use client";

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Hero from '@/components/sections/Hero';
import Steps from '@/components/sections/Steps';
import CelebrationsSection from '@/components/sections/CelebrationsSection';
import PricingSection from '@/components/sections/PricingSection';
import PhotographerBanner from '@/components/sections/PhotographerBanner';
import TrustBadgesStrip from '@/components/sections/TrustBadgesStrip';
import Footer from '@/components/sections/Footer';
import { ArrowRight } from 'lucide-react';
import { useAuthModal } from '@/context/AuthModalContext';

const ThemedNav = dynamic(() => import('@/components/ThemedNav'), { ssr: false });
const DemoModal = dynamic(() => import('@/components/DemoModal'), { ssr: false });

export default function LandingPage() {
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const [showStickyCta, setShowStickyCta] = useState(false);
  const [stickyDismissed, setStickyDismissed] = useState(false);
  const { openAuth } = useAuthModal();

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get('demo') === 'true') {
      setIsDemoOpen(true);
    }
  }, []);

  // Show sticky CTA on mobile after scrolling past hero
  useEffect(() => {
    if (stickyDismissed) return;

    const handleScroll = () => {
      setShowStickyCta(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [stickyDismissed]);

  return (
    <>
      <ThemedNav />
      <main className="min-h-screen bg-white text-slate-900 relative overflow-hidden flex flex-col items-stretch">
        
        {/* 1. Hero: Every Guest. Every Moment. Live. */}
        <Hero setIsDemoOpen={setIsDemoOpen} />

        {/* 2. How It Works: Just 3 simple steps */}
        <Steps />

        {/* 3. Made for Every Celebration: 6 event category cards */}
        <CelebrationsSection />

        {/* 4. Simple & Transparent Pricing: Starter, Pro (Popular), Premium */}
        <PricingSection />

        {/* 5. For Photographers: Add More Value. Earn More. */}
        <PhotographerBanner />

        {/* 6. Trust Badges Strip: 4 value props */}
        <TrustBadgesStrip />

        {/* 7. Footer: Links, socials & Made in India */}
        <Footer />
      </main>

      {/* Interactive Live Wall Demo Modal */}
      {isDemoOpen && (
        <DemoModal isOpen={isDemoOpen} onClose={() => setIsDemoOpen(false)} />
      )}

      {/* Sticky Mobile CTA */}
      {showStickyCta && !stickyDismissed && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 py-3 px-4 z-50 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] md:hidden flex items-center gap-2">
          <button
            onClick={() => openAuth("signup")}
            className="flex-1 py-3 rounded-full bg-gradient-to-r from-amber-400 to-[#E5A93C] text-slate-950 font-bold text-sm shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Get Started</span>
            <ArrowRight size={16} />
          </button>
          <button
            onClick={() => {
              setStickyDismissed(true);
              setShowStickyCta(false);
            }}
            className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>
      )}
    </>
  );
}
