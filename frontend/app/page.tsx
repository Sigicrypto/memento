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
const PartnerSection = dynamic(() => import('@/components/sections/PartnerSection'), { ssr: false });
const Footer = dynamic(() => import('@/components/sections/Footer'), { ssr: false });



import DemoModal from '@/components/DemoModal';
import FloatingParticles from '@/components/FloatingParticles';

export default function LandingPage() {

  const { user, isLoading, signOut } = useAuth();

  const { openAuth: openGlobalAuth } = useAuthModal();

  const router = useRouter();

  const [scrolled, setScrolled] = useState(false);



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



    // Set region cookie for checkout page
    document.cookie = `livewall_region=IN; path=/; max-age=86400`;



    return () => { window.removeEventListener('scroll', onScroll); obs.disconnect(); };

  }, []);



  const Free = "0";

  const Starter = "2,499";

  const Pro = "4,999";

  const Premium = "7,499";

  const WhiteLabel = "9,999";

  const PhotoBookPrice = "1,000";

  const ExtraStoragePrice = "500";

  const SocialFeedPrice = "1,000";

  const Sym = "₹";



  return (
    <>
    <div className="min-h-screen bg-bg relative lp overflow-hidden">
      <div className="grain" />
      <div className="orbs">
        <div className="orb orb-primary" />
        <div className="orb orb-secondary" />
      </div>
      <FloatingParticles className="opacity-60" />
      
      <div className="flex flex-col relative z-10 w-full items-stretch">
        <Hero setIsDemoOpen={setIsDemoOpen} />
        <Stats />
        <WhyChoose />
        <Features />
        <Steps />
        <Gallery />
        <Testimonials />
        <PricingSection />
        <PartnerSection />
        <Footer />
      </div>
    </div>
    {isDemoOpen && <DemoModal isOpen={isDemoOpen} onClose={() => setIsDemoOpen(false)} />}
    </>
  );
}
