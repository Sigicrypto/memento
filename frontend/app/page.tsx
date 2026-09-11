"use client";

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Hero from '@/components/sections/Hero';
import ProductDemoSection from '@/components/sections/ProductDemoSection';
import FoundingStudioSection from '@/components/sections/FoundingStudioSection';
import Steps from '@/components/sections/Steps';
import GuestPhotoShowcase from '@/components/sections/GuestPhotoShowcase';
import CelebrationsSection from '@/components/sections/CelebrationsSection';
import StudioAdvantageSection from '@/components/sections/StudioAdvantageSection';
import LiveWallFeatureSection from '@/components/sections/LiveWallFeatureSection';
import PostEventReliveSection from '@/components/sections/PostEventReliveSection';
import TrustSecuritySection from '@/components/sections/TrustSecuritySection';
import PricingSection from '@/components/sections/PricingSection';
import TestimonialsSection from '@/components/sections/TestimonialsSection';
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
      <ThemedNav onOpenDemo={() => setIsDemoOpen(true)} />
      
      <main className="min-h-screen bg-white text-slate-900 relative overflow-hidden flex flex-col items-stretch">
        
        {/* 1. Hero: Add a Live Photo Wall to Every Wedding You Shoot (Parallax Images + Reveal) */}
        <Hero setIsDemoOpen={setIsDemoOpen} />

        {/* 2. Interactive Live Product Demonstration (Scan -> Capture -> Share -> Experience) */}
        <ProductDemoSection onOpenDemo={() => setIsDemoOpen(true)} />

        {/* 3. Founding Studio Program (Magic UI Bento Grid: 0 Apps, <2s Sync, DSLR, White-Label) */}
        <FoundingStudioSection />

        {/* 4. How It Works: 4 Clean Editorial Steps */}
        <Steps />

        {/* 5. Guest Photo Showcase: Aceternity Apple Cards Carousel with Real Photographs */}
        <GuestPhotoShowcase />

        {/* 6. Made for Every Celebration: Category Selector Cards & Spotlight */}
        <CelebrationsSection />

        {/* 7. The Studio Advantage: Parallax Grid (You Capture Masterpieces, Guests Capture Everything Else) */}
        <StudioAdvantageSection />

        {/* 8. Memento Live: Luxury Venue Screen Display + Magic UI Photo Marquee */}
        <LiveWallFeatureSection onOpenDemo={() => setIsDemoOpen(true)} />

        {/* 9. After the Event: Bento Grid (1-Click 4K ZIP, Timeline, Private Link, Slideshow) */}
        <PostEventReliveSection />

        {/* 10. Privacy & Control: Clean Trustworthy Cards with Subtle Glowing Borders */}
        <TrustSecuritySection />

        {/* 11. Transparent Pricing: Starter, Pro, Premium */}
        <PricingSection />

        {/* 12. Verified Social Proof: Loved by Photographers & Couples */}
        <TestimonialsSection />

        {/* 13. Frequently Asked Questions: Smooth Accessible Accordion with Verified Answers */}
        <FAQSection />

        {/* 14. Cinematic Final CTA: Wedding Photography Backdrop + Moving Border Studio CTA */}
        <FinalCtaSection />

        {/* 15. Center-Aligned Luxury Footer: All Links, Socials & Legal */}
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
            <span>Create Your Event</span>
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
