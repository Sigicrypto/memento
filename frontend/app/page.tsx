"use client";



import React, { useEffect, useState, useRef } from 'react';

import { useRouter } from 'next/navigation';

import Link from 'next/link';

import { useAuth } from '@/hooks/useAuth';

import { QRCodeSVG } from 'qrcode.react';

import { X, Maximize2, Minimize2, Image as ImageIcon, Grid, Play, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { supabase } from '@/lib/supabase';

import {

  clearDemoData,

  DemoMedia,

  getDemoPhotosKey,

  getDemoTimeLeft,

  getOrCreateDemoExpiry,

  getOrCreateDemoId,

  readDemoPhotos,

  writeDemoPhotos,

} from '@/lib/demoWall';

import AnimatedLogo from '@/components/AnimatedLogo';

import { useAuthModal } from '@/context/AuthModalContext';

import './auth-dialog.css';

import Hero from '@/components/sections/Hero';
import Stats from '@/components/sections/Stats';
import WhyChoose from '@/components/sections/WhyChoose';
import Features from '@/components/sections/Features';
import Steps from '@/components/sections/Steps';
import dynamic from 'next/dynamic';
const Gallery = dynamic(() => import('@/components/sections/Gallery'), { ssr: false });
const Testimonials = dynamic(() => import('@/components/sections/Testimonials'), { ssr: false });
const PricingSection = dynamic(() => import('@/components/sections/PricingSection'), { ssr: false });



import DemoModal from '@/components/DemoModal';

export default function LandingPage() {

  const { user, isLoading, signOut } = useAuth();

  const { openAuth: openGlobalAuth } = useAuthModal();

  const router = useRouter();

  const [scrolled, setScrolled] = useState(false);

  const [currency, setCurrency] = useState({ showINR: false, showOMR: false });

  const [showingINR, setShowingINR] = useState(false);

  const [showingOMR, setShowingOMR] = useState(false);

  const [isDemoOpen, setIsDemoOpen] = useState(false);

  const [selectedPlan, setSelectedPlan] = useState<'starter' | 'standard' | 'premium' | 'whitelabel' | null>(null);

  

  const openAuth = (plan: 'starter' | 'standard' | 'premium' | 'whitelabel') => {

    setSelectedPlan(plan);

    openGlobalAuth('signup', plan);

  };



  const handleSignOut = async () => {

    await signOut();

  };



  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get('demo') === 'true') {
       setIsDemoOpen(true);
    }

    const onScroll = () => setScrolled(window.scrollY > 60);

    window.addEventListener('scroll', onScroll, { passive: true });



    const obs = new IntersectionObserver(entries => {

      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });

    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal').forEach(el => obs.observe(el));



    const cards = document.querySelectorAll('.gcard');

    cards.forEach(card => {

      const el = card as HTMLElement;

      el.addEventListener('mousemove', (e) => {

        const r = el.getBoundingClientRect();

        const x = e.clientX - r.left, y = e.clientY - r.top;

        el.style.setProperty('--mx', `${x}px`);

        el.style.setProperty('--my', `${y}px`);

      });

    });



    (async () => {

      let countryCode = 'GLOBAL';

      try {

        const res = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(4000) });

        countryCode = (await res.json()).country_code || 'GLOBAL';

      } catch {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
        if (tz.includes('Kolkata')) countryCode = 'IN';
        else if (tz.includes('Muscat')) countryCode = 'OM';
      }

      const isIndia = countryCode === 'IN';
      const isOman = countryCode === 'OM';

      // Set region cookie for checkout page
      document.cookie = `livewall_region=${isOman ? 'OM' : isIndia ? 'IN' : 'GLOBAL'}; path=/; max-age=86400`;

      setCurrency({ showINR: isIndia, showOMR: isOman });

      if (isIndia) setShowingINR(true);
      if (isOman) setShowingOMR(true);

    })();



    return () => { window.removeEventListener('scroll', onScroll); obs.disconnect(); };

  }, []);



  const Free = "0";

  const Starter = showingOMR ? "15" : showingINR ? "2,499" : "30";

  const Pro = showingOMR ? "29" : showingINR ? "4,999" : "60";

  const Premium = showingOMR ? "39" : showingINR ? "7,499" : "90";

  const WhiteLabel = showingOMR ? "59" : showingINR ? "9,999" : "120";

  const PhotoBookPrice = showingOMR ? "5" : showingINR ? "1,000" : "12";

  const ExtraStoragePrice = showingOMR ? "2" : showingINR ? "500" : "6";

  const SocialFeedPrice = showingOMR ? "5" : showingINR ? "1,000" : "12";

  const Sym = showingOMR ? "ر.ع. " : showingINR ? "₹" : "$";



  return (
    <>
    <div className="min-h-screen bg-bg relative">
      <div className="flex flex-col gap-16 relative z-10">
        <Hero setIsDemoOpen={setIsDemoOpen} />
        <Stats />
        <WhyChoose />
        <Features />
        <Steps />
        <Gallery />
        <Testimonials />
        <PricingSection />
      </div>
    </div>
    {isDemoOpen && <DemoModal isOpen={isDemoOpen} onClose={() => setIsDemoOpen(false)} />}
    </>
  );
}
