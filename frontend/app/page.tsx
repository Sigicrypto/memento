"use client";

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Hero from '@/components/sections/Hero';
import ProductDemoSection from '@/components/sections/ProductDemoSection';
import StudioAdvantageSection from '@/components/sections/StudioAdvantageSection';
import FoundingStudioSection from '@/components/sections/FoundingStudioSection';
import Steps from '@/components/sections/Steps';
import LiveWallFeatureSection from '@/components/sections/LiveWallFeatureSection';
import PricingSection from '@/components/sections/PricingSection';
import GuestPhotoShowcase from '@/components/sections/GuestPhotoShowcase';
import TestimonialsSection from '@/components/sections/TestimonialsSection';
import PostEventReliveSection from '@/components/sections/PostEventReliveSection';
import TrustSecuritySection from '@/components/sections/TrustSecuritySection';
import FAQSection from '@/components/sections/FAQSection';
import FinalCtaSection from '@/components/sections/FinalCtaSection';
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
      {/* 1. Navigation */}
      <ThemedNav onOpenDemo={() => setIsDemoOpen(true)} />
      
      <main className="min-h-screen bg-white text-slate-900 relative overflow-hidden flex flex-col items-stretch">
        
        {/* 2. Hero: Add a Live Photo Wall to Every Wedding You Shoot */}
        <Hero setIsDemoOpen={setIsDemoOpen} />

        {/* 3. Interactive Product Experience / Live Demo (Scan -> Capture -> Share -> Live) */}
        <ProductDemoSection onOpenDemo={() => setIsDemoOpen(true)} />

        {/* 4. Core Positioning: Your Camera Captures the Masterpieces. Your Guests Capture Everything Else. */}
        <StudioAdvantageSection />

        {/* 5. Benefits for Photographers: More Memories, Better Experience, New Revenue, Your Brand */}
        <FoundingStudioSection />

        {/* 6. How It Works: 4 Clean Editorial Steps (Scan -> Capture -> Share -> Experience) */}
        <Steps />

        {/* 7. Memento Live: Luxury Venue Screen Display + Magic UI Photo Marquee */}
        <LiveWallFeatureSection onOpenDemo={() => setIsDemoOpen(true)} />

        {/* 8. Revenue Opportunity & Packaging Model (Flowchart + Starter / Pro / Premium Tiers) */}
        <PricingSection />

        {/* 9. Guest Photo Showcase: Apple Cards Carousel with Real Photographs */}
        <GuestPhotoShowcase />

        {/* 10. Real Photographer Proof: Loved by Photographers with Verification Badges */}
        <TestimonialsSection />

        {/* 11. After-Event Archive: The Wedding Ends. The Memories Don't. (1-Click 4K ZIP, Timeline) */}
        <PostEventReliveSection />

        {/* 12. Privacy & Control: Private. Moderated. Yours. */}
        <TrustSecuritySection />

        {/* 13. Photographer FAQ: 10 Concise Questions with Live Concierge Support */}
        <FAQSection />

        {/* 14. Final Emotional CTA: Give Every Guest a Camera. Give Every Moment a Place to Live. */}
        <FinalCtaSection onOpenDemo={() => setIsDemoOpen(true)} />

        {/* 15. Center-Aligned Luxury Footer: Navigation, Socials, and Legal Links */}
        <Footer />
      </main>

      {/* Interactive Live Wall Demo Modal */}
      {isDemoOpen && (
        <DemoModal isOpen={isDemoOpen} onClose={() => setIsDemoOpen(false)} />
      )}

      {/* Sticky Mobile CTA */}
      {showStickyCta && !stickyDismissed && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-amber-300/40 py-3 px-4 z-50 shadow-[0_-4px_24px_rgba(245,158,11,0.18)] md:hidden flex items-center gap-2">
          <button
            onClick={() => openAuth("signup")}
            className="flex-1 py-3 rounded-full bg-gradient-to-r from-amber-400 to-[#E5A93C] text-slate-950 font-bold text-sm shadow-[0_2px_12px_rgba(245,158,11,0.25)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Add Memento to Your Studio</span>
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
