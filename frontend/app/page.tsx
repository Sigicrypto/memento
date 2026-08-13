"use client";

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Hero from '@/components/sections/Hero';
import InteractiveHeroDemo from '@/components/sections/InteractiveHeroDemo';
import Steps from '@/components/sections/Steps';
import EmotionalValueSection from '@/components/sections/EmotionalValueSection';
import LiveWallFeatureSection from '@/components/sections/LiveWallFeatureSection';
import PostEventReliveSection from '@/components/sections/PostEventReliveSection';
import TrustSecuritySection from '@/components/sections/TrustSecuritySection';
import FAQSection from '@/components/sections/FAQSection';

import { BackgroundBeams } from '@/components/BackgroundBeams';

const ThemedNav = dynamic(() => import('@/components/ThemedNav'), { ssr: false });
const EnterpriseSection = dynamic(() => import('@/components/sections/EnterpriseSection'), { ssr: false });
const WhatsAppBotSection = dynamic(() => import('@/components/sections/WhatsAppBotSection'), { ssr: false });
const PricingSection = dynamic(() => import('@/components/sections/PricingSection'), { ssr: false });
const Footer = dynamic(() => import('@/components/sections/Footer'), { ssr: false });
const DemoModal = dynamic(() => import('@/components/DemoModal'), { ssr: false });

export default function LandingPage() {
  const [isDemoOpen, setIsDemoOpen] = useState(false);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get('demo') === 'true') {
       setIsDemoOpen(true);
    }
  }, []);

  return (
    <>
      <BackgroundBeams />
      <ThemedNav />
      <div className="min-h-screen bg-slate-950/80 text-white relative overflow-hidden flex flex-col items-stretch z-10">
        <Hero setIsDemoOpen={setIsDemoOpen} />
        <InteractiveHeroDemo onOpenDemoModal={() => setIsDemoOpen(true)} />
        <Steps />
        <EmotionalValueSection />
        <LiveWallFeatureSection />
        <PostEventReliveSection />
        <WhatsAppBotSection />
        <EnterpriseSection />
        <PricingSection />
        <TrustSecuritySection />
        <FAQSection />
        <Footer />
      </div>

      {isDemoOpen && <DemoModal isOpen={isDemoOpen} onClose={() => setIsDemoOpen(false)} />}
    </>
  );
}
