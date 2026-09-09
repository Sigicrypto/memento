"use client";

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Hero from '@/components/sections/Hero';
import SocialProofBar from '@/components/sections/SocialProofBar';
import InteractiveHeroDemo from '@/components/sections/InteractiveHeroDemo';
import Steps from '@/components/sections/Steps';
import EmotionalValueSection from '@/components/sections/EmotionalValueSection';
import LiveWallFeatureSection from '@/components/sections/LiveWallFeatureSection';
import PostEventReliveSection from '@/components/sections/PostEventReliveSection';
import TrustSecuritySection from '@/components/sections/TrustSecuritySection';
import FAQSection from '@/components/sections/FAQSection';
import { ArrowRight } from 'lucide-react';
import { useAuthModal } from '@/context/AuthModalContext';

const ThemedNav = dynamic(() => import('@/components/ThemedNav'), { ssr: false });
const WhatsAppBotSection = dynamic(() => import('@/components/sections/WhatsAppBotSection'), { ssr: false });
const EnterpriseSection = dynamic(() => import('@/components/sections/EnterpriseSection'), { ssr: false });
const PricingSection = dynamic(() => import('@/components/sections/PricingSection'), { ssr: false });
const Footer = dynamic(() => import('@/components/sections/Footer'), { ssr: false });
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

  // Show sticky CTA after scrolling past the hero
  useEffect(() => {
    if (stickyDismissed) return;

    const handleScroll = () => {
      setShowStickyCta(window.scrollY > 500);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [stickyDismissed]);

  return (
    <>
      <ThemedNav />
      <div className="min-h-screen bg-bg text-text-primary relative overflow-hidden flex flex-col items-stretch">
        {/* Hero: Primary value proposition */}
        <Hero setIsDemoOpen={setIsDemoOpen} />

        {/* Social proof: immediate credibility */}
        <SocialProofBar />

        {/* Interactive demo: show the product in action */}
        <InteractiveHeroDemo onOpenDemoModal={() => setIsDemoOpen(true)} />

        {/* How it works: reduce uncertainty */}
        <Steps />

        {/* Emotional value: why guests' photos matter */}
        <EmotionalValueSection />

        {/* Flagship feature: Memento Live */}
        <LiveWallFeatureSection />

        {/* Post-event: value extends beyond the day */}
        <PostEventReliveSection />

        {/* WhatsApp integration */}
        <WhatsAppBotSection />

        {/* Enterprise/Pro features teaser */}
        <EnterpriseSection />

        {/* Pricing preview */}
        <PricingSection />

        {/* Privacy & trust: address security concerns */}
        <TrustSecuritySection />

        {/* FAQ: answer remaining questions */}
        <FAQSection />

        {/* Final CTA: Photographer & Studio Onboarding */}
        <section className="w-full py-24 md:py-32 px-4 md:px-8 bg-gradient-to-b from-amber-50/50 to-bg flex flex-col items-center text-center border-b border-border">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-bold tracking-wider uppercase mb-4 mx-auto">
            FOUNDING STUDIOS COHORT
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-text-primary tracking-tight max-w-3xl font-display">
            Ready to Add Live Photo Sharing to Your Next Wedding?
          </h2>
          <p className="text-text-secondary text-base md:text-lg mt-4 max-w-2xl leading-relaxed">
            Join our founding studio cohort. Offer your couples 360° guest coverage and live venue projection under your own studio brand — with simple wholesale per-event pricing.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8 mx-auto w-full max-w-md sm:max-w-none">
            <button
              onClick={() => openAuth("signup")}
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-accent hover:bg-[#D9932B] text-white font-bold text-base shadow-[0_2px_8px_rgba(242,169,59,0.3)] hover:shadow-[0_4px_16px_rgba(242,169,59,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <span>Add Memento to Your Studio</span>
              <ArrowRight size={18} />
            </button>
            <a
              href="https://wa.me/919866161775?text=Hi%2C%20I%27m%20a%20wedding%20photographer%2Fstudio%20owner%20interested%20in%20adding%20Memento%20to%20my%20packages."
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-surface border-2 border-border text-text-primary hover:border-accent hover:text-accent font-semibold text-base transition-all flex items-center justify-center gap-2.5 cursor-pointer"
            >
              Talk Directly with Founder (WhatsApp)
            </a>
          </div>
        </section>

        {/* Footer */}
        <Footer />
      </div>

      {/* Demo modal */}
      {isDemoOpen && <DemoModal isOpen={isDemoOpen} onClose={() => setIsDemoOpen(false)} />}

      {/* Sticky mobile CTA */}
      {showStickyCta && !stickyDismissed && (
        <div className="fixed bottom-0 left-0 right-0 bg-surface/95 backdrop-blur-md border-t border-border py-3 px-4 z-50 shadow-[0_-4px_12px_rgba(0,0,0,0.08)] md:hidden flex items-center gap-2">
          <button
            onClick={() => openAuth("signup")}
            className="flex-1 py-3 rounded-full bg-accent text-white font-bold text-sm shadow-[0_2px_8px_rgba(200,150,62,0.3)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Add Memento to Your Studio</span>
            <ArrowRight size={16} />
          </button>
          <button
            onClick={() => {
              setStickyDismissed(true);
              setShowStickyCta(false);
            }}
            className="w-10 h-10 flex items-center justify-center text-text-muted hover:text-text-primary transition-colors cursor-pointer"
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>
      )}
    </>
  );
}
