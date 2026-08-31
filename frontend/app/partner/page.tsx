"use client";

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Award,
  Copy,
  Check,
  MessageCircle,
  QrCode,
  Download,
  Wallet,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  Globe,
  Zap,
  HelpCircle,
  ArrowRight,
  UserCheck,
  RefreshCw,
  IndianRupee,
  Share2,
  ChevronDown,
  Gift,
  Flame,
  CheckCircle,
  Building,
  Heart,
  PartyPopper,
  Lock,
  Smartphone,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { usePartnerId } from '@/hooks/usePartnerId';
import { BackgroundBeams } from '@/components/BackgroundBeams';

const ThemedNav = dynamic(() => import('@/components/ThemedNav'), { ssr: false });
const Footer = dynamic(() => import('@/components/sections/Footer'), { ssr: false });

const WHATSAPP_NUMBER = '919866161775';

const FAQS = [
  {
    q: "Is there a fixed monthly salary for this partner role?",
    a: "No. This is a 100% freelance commission role with a flat 10% cash bonus on every closed booking (₹300 to ₹800+ per deal). You have unlimited earning potential with zero minimum quotas and complete flexibility to work whenever and wherever you want.",
  },
  {
    q: "Where do I get my partner code and link?",
    a: "Your unique Partner ID (e.g. MEM-XXXX) and 1-Click Referral Link are already generated right at the top of this page. You don't have to wait for manual approval or interview screening to start sharing.",
  },
  {
    q: "How does referral tracking work when I share my link?",
    a: "When a potential client opens your link or scans your QR code, a 30-day tracking cookie and localStorage token automatically lock your Partner ID to their session. When they create an account, their profile is permanently tagged with your code in our database.",
  },
  {
    q: "When and how do I receive my 10% commission payout?",
    a: "Payouts are transferred directly to your registered UPI ID (Google Pay, PhonePe, Paytm, or BHIM) within 24 hours of the client's booking confirmation.",
  },
  {
    q: "Who are the best potential clients to reach out to?",
    a: "Couples planning upcoming weddings, birthday hosts, corporate HR/event managers, wedding planners, event DJs, photographers, banquet hall managers, and resort venues across India.",
  },
];

export default function PartnerPage() {
  const { partnerId, partnerLink, copyPartnerId, copyPartnerLink, copied, copiedLink, whatsappShareUrl } = usePartnerId();
  
  const [activeTab, setActiveTab] = useState<'link' | 'qr' | 'payout'>('link');
  const [selectedPlanPrice, setSelectedPlanPrice] = useState<number>(2999);
  const [dealsCount, setDealsCount] = useState<number>(8);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [copiedPitchId, setCopiedPitchId] = useState<string | null>(null);
  const [activePitchTab, setActivePitchTab] = useState<'wedding' | 'corporate' | 'planner'>('wedding');
  
  // Registration Form State
  const [fullName, setFullName] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [upiId, setUpiId] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load existing profile from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && partnerId) {
      const savedProfile = localStorage.getItem(`memento_promoter_${partnerId}`);
      if (savedProfile) {
        try {
          const parsed = JSON.parse(savedProfile);
          setFullName(parsed.fullName || '');
          setWhatsappNumber(parsed.whatsappNumber || '');
          setUpiId(parsed.upiId || '');
          setIsSaved(true);
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, [partnerId]);

  const commissionPerDeal = Math.round(selectedPlanPrice * 0.1);
  const totalEstimatedEarnings = commissionPerDeal * dealsCount;
  const sixMonthsEarnings = totalEstimatedEarnings * 6;

  const handleRegisterPromoter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !whatsappNumber || !upiId) return;

    setIsSubmitting(true);
    const profile = {
      partnerId,
      fullName,
      whatsappNumber,
      upiId,
      registeredAt: new Date().toISOString(),
    };

    localStorage.setItem(`memento_promoter_${partnerId}`, JSON.stringify(profile));

    try {
      await fetch('/api/promoters/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });
    } catch (err) {
      console.log('Local save completed:', err);
    }

    setIsSubmitting(false);
    setIsSaved(true);
  };

  const handleCopyPitch = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPitchId(id);
    setTimeout(() => setCopiedPitchId(null), 3000);
  };

  const weddingPitch = `Hi! 👋 Congrats on your upcoming celebration! 🥂

I wanted to share a super cool live photo feature for your event:

📸 Instead of waiting weeks for photos, your guests scan a simple QR code at their table, snap photos on their phones, and watch them appear live on the big screen!

✨ Highlights:
• Zero app downloads required for guests (just scan & snap).
• Live animated photo slideshow on your venue TV / LED screen.
• Full digital photo album download with all guest memories next morning.

Check out the live interactive demo here:
👉 ${partnerLink}`;

  const corporatePitch = `Hi! 👋 If you're looking for an easy way to elevate guest engagement for your upcoming event, check out Memento's Live QR Photo Wall:

🔥 What it does:
• Guests scan a table QR code to upload photos & video wishes instantly.
• Displays a live, animated photo feed on LED walls / TV screens during the event.
• Real-time host moderation panel (filter/approve photos before they go live).
• Full branded ZIP photo download for your client after the event.

You can test a free live demo and set up an event in 2 minutes:
👉 ${partnerLink}`;

  const plannerPitch = `Hi! 👋 Partnering with event planners across India:

Introduce Memento Live QR Photo Wall to your clients as an add-on service!
• Give clients instant guest photo sharing on LED screens.
• Full white-label branding with your agency name.
• Zero hardware required — works on any smart TV or projector.

Test the live interactive wall here:
👉 ${partnerLink}`;

  const partnerDeskWhatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    `Hi Memento Partner Desk! 👋 I am registered with Partner ID ${partnerId} (${fullName || 'Promoter'}). UPI ID: ${upiId || 'Not set'}. I want to connect regarding event client referrals!`
  )}`;

  return (
    <>
      <BackgroundBeams />
      <ThemedNav />

      <main className="min-h-screen bg-slate-950/90 text-white pt-28 pb-36 px-4 sm:px-6 lg:px-8 selection:bg-emerald-500/30 overflow-x-hidden flex flex-col items-center relative z-10 space-y-24 sm:space-y-32">
        
        {/* ══════════════════════════════════════════════════════════════
            1. HERO SECTION (SPLIT SCREEN LUXURY DESIGN)
        ══════════════════════════════════════════════════════════════ */}
        <section className="w-full max-w-7xl pt-4 sm:pt-10 pb-8 sm:pb-12 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Hero Headline & Fast Actions (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col items-start text-left space-y-7">
            
            {/* Status Pill Badge */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black uppercase tracking-widest shadow-inner shadow-emerald-500/20"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Pan-India Event Partner Program • 100% Commission</span>
            </motion.div>

            {/* Monumental Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl sm:text-6xl lg:text-[64px] font-black tracking-tight leading-[1.08] text-white"
            >
              Turn Your Event & Wedding Network Into{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
                Instant UPI Cash.
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-base sm:text-lg text-slate-300 max-w-2xl font-normal leading-relaxed"
            >
              Work part-time from anywhere in India. Recommend Memento’s Live QR Photo Wall to wedding couples, party hosts, corporate planners, and venues. 
              Earn a flat <strong className="text-white font-bold">10% cash referral bonus</strong> per closed deal, sent straight to your UPI within 24 hours.
            </motion.p>

            {/* 3 Core Highlight Badges */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full pt-1"
            >
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-emerald-500/30 backdrop-blur-xl flex items-center gap-3.5 shadow-lg">
                <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 shrink-0">
                  <TrendingUp size={18} />
                </div>
                <div>
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Commission</div>
                  <div className="text-xs font-black text-emerald-300 mt-0.5">10% Flat / Deal</div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/80 border border-amber-500/30 backdrop-blur-xl flex items-center gap-3.5 shadow-lg">
                <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 shrink-0">
                  <Zap size={18} />
                </div>
                <div>
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Payout Speed</div>
                  <div className="text-xs font-black text-amber-300 mt-0.5">Within 24 Hours</div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/80 border border-cyan-500/30 backdrop-blur-xl flex items-center gap-3.5 shadow-lg">
                <div className="p-2.5 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 shrink-0">
                  <Globe size={18} />
                </div>
                <div>
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Location</div>
                  <div className="text-xs font-black text-cyan-300 mt-0.5">Whole India</div>
                </div>
              </div>
            </motion.div>

            {/* Quick Hero CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto pt-2"
            >
              <button
                onClick={copyPartnerLink}
                className="w-full sm:w-auto py-4 px-8 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-xl shadow-emerald-500/25 transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                {copiedLink ? <Check size={18} className="text-slate-950 stroke-[3]" /> : <Copy size={18} />}
                <span>{copiedLink ? '1-Click Link Copied!' : 'Copy My 1-Click Referral Link'}</span>
              </button>

              <a
                href={whatsappShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto py-4 px-7 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-white/15 text-white font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                <MessageCircle size={17} className="text-emerald-400" />
                <span>Share on WhatsApp</span>
              </a>
            </motion.div>

          </div>

          {/* Right Column: Interactive Digital Ambassador Pass Mockup (5 Cols) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-5 relative"
          >
            <div className="relative rounded-3xl p-7 sm:p-9 bg-gradient-to-br from-slate-900/95 via-slate-900/90 to-slate-950 border-2 border-emerald-500/40 backdrop-blur-2xl shadow-[0_0_70px_rgba(16,185,129,0.22)] overflow-hidden space-y-7">
              
              {/* Subtle metallic sheen line */}
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-400 to-transparent" />
              <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

              {/* Pass Header */}
              <div className="flex items-center justify-between pb-5 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <Award size={18} />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">MEMENTO AMBASSADOR PASS</span>
                    <span className="text-xs font-bold text-white mt-0.5 block">Pan-India Sales Partner</span>
                  </div>
                </div>

                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/40 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  10% Active
                </span>
              </div>

              {/* Partner ID Feature Display */}
              <div className="p-5 rounded-2xl bg-slate-950/85 border border-emerald-500/30 space-y-2 shadow-inner">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase text-slate-400">YOUR PARTNER ID</span>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    Lifetime Tracking
                  </span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-2xl sm:text-3xl font-mono font-black text-emerald-400 tracking-wider">
                    {partnerId}
                  </span>
                  <button
                    onClick={copyPartnerId}
                    className="p-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 transition-all cursor-pointer active:scale-95"
                    title="Copy Partner ID"
                  >
                    {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                  </button>
                </div>
              </div>

              {/* Live QR Card Preview */}
              <div className="flex items-center gap-4 p-5 rounded-2xl bg-slate-950/60 border border-white/10">
                <div className="w-20 h-20 bg-[#070a10] p-1.5 rounded-xl border border-emerald-500/40 shrink-0 flex items-center justify-center">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(partnerLink)}&color=10b981&bcolor=070a10`}
                    alt="Referral QR"
                    className="w-full h-full object-contain rounded-lg"
                  />
                </div>
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-white block">Digital Referral QR Card</span>
                  <p className="text-[11px] text-slate-400 leading-snug">Clients scan this code with any phone camera to join under your account.</p>
                  <a
                    href={`https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=${encodeURIComponent(partnerLink)}&color=10b981&bcolor=070a10`}
                    download={`Memento-Partner-QR-${partnerId}.png`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1 pt-1"
                  >
                    <Download size={12} /> Download HD QR Poster
                  </a>
                </div>
              </div>

              {/* Status Note */}
              <p className="text-[10px] text-center text-slate-400 pt-1">
                No sign-up required. Your partner link is generated and live on this device.
              </p>
            </div>
          </motion.div>

        </section>

        {/* ══════════════════════════════════════════════════════════════
            2. AMBASSADOR COMMAND SUITE (BENTO HUB TABS)
        ══════════════════════════════════════════════════════════════ */}
        <section className="w-full max-w-4xl" id="tools">
          <div className="bg-slate-900/90 border-2 border-emerald-500/30 rounded-3xl p-7 sm:p-10 backdrop-blur-2xl shadow-[0_0_80px_rgba(16,185,129,0.12)] relative overflow-hidden space-y-7">
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 block mb-1">
                  AMBASSADOR TOOLKIT
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-white">Partner Control Dashboard</h2>
              </div>

              <div className="flex items-center gap-1.5 p-1 bg-slate-950/80 border border-white/10 rounded-2xl self-stretch sm:self-auto">
                <button
                  onClick={() => setActiveTab('link')}
                  className={`flex-1 sm:flex-initial py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'link'
                      ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  1-Click Link
                </button>
                <button
                  onClick={() => setActiveTab('qr')}
                  className={`flex-1 sm:flex-initial py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'qr'
                      ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  QR Poster
                </button>
                <button
                  onClick={() => setActiveTab('payout')}
                  className={`flex-1 sm:flex-initial py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'payout'
                      ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {isSaved ? 'UPI Active ✓' : 'Register UPI'}
                </button>
              </div>
            </div>

            {/* TAB 1: 1-Click Link */}
            {activeTab === 'link' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div className="p-6 rounded-2xl bg-slate-950/90 border border-emerald-500/30 space-y-4 shadow-inner">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">YOUR 1-CLICK REFERRAL LINK</span>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      ID: {partnerId}
                    </span>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-900 border border-white/10 text-xs sm:text-sm font-mono font-bold text-emerald-300 break-all select-all">
                    {partnerLink}
                  </div>
                  <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                    <button
                      onClick={copyPartnerLink}
                      className="w-full sm:flex-1 py-3.5 px-5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                    >
                      {copiedLink ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                      <span>{copiedLink ? 'Link Copied to Clipboard!' : 'Copy Referral Link'}</span>
                    </button>
                    <a
                      href={whatsappShareUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:flex-1 py-3.5 px-5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-black transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer active:scale-95"
                    >
                      <MessageCircle size={16} className="fill-slate-950" />
                      <span>Share on WhatsApp</span>
                    </a>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 2: QR Poster */}
            {activeTab === 'qr' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-6 py-3">
                <div className="w-52 h-52 mx-auto bg-[#070a10] p-3.5 rounded-2xl border-2 border-emerald-500/40 shadow-[0_0_40px_rgba(16,185,129,0.25)] flex items-center justify-center">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(partnerLink)}&color=10b981&bcolor=070a10`}
                    alt={`Referral QR Code for ${partnerId}`}
                    className="w-full h-full object-contain rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <p className="text-xs font-bold text-white">Scan to Claim 10% Referral Tracking</p>
                  <p className="text-[11px] font-mono text-emerald-300 font-bold">{partnerLink}</p>
                </div>
                <div className="pt-2">
                  <a
                    href={`https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=${encodeURIComponent(partnerLink)}&color=10b981&bcolor=070a10`}
                    download={`Memento-Partner-QR-${partnerId}.png`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 py-3.5 px-7 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black shadow-lg shadow-emerald-500/20 transition-all"
                  >
                    <Download size={15} className="stroke-[3]" />
                    <span>Download Branded QR Poster (PNG)</span>
                  </a>
                </div>
              </motion.div>
            )}

            {/* TAB 3: UPI Registration */}
            {activeTab === 'payout' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <form onSubmit={handleRegisterPromoter} className="space-y-5 bg-slate-950/80 p-6 sm:p-8 rounded-2xl border border-white/10">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-2 uppercase tracking-wider">Full Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Rahul Sharma"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full py-3 px-4 rounded-xl bg-slate-900 border border-white/15 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-400"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-2 uppercase tracking-wider">WhatsApp Number</label>
                      <input
                        type="tel"
                        required
                        placeholder="e.g. +91 98765 43210"
                        value={whatsappNumber}
                        onChange={(e) => setWhatsappNumber(e.target.value)}
                        className="w-full py-3 px-4 rounded-xl bg-slate-900 border border-white/15 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-400"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-2 uppercase tracking-wider">UPI ID (GPay / PhonePe / Paytm / BHIM)</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. rahul@upi or 9876543210@ybl"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className="w-full py-3 px-4 rounded-xl bg-slate-900 border border-white/15 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-400"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 cursor-pointer mt-2"
                  >
                    {isSubmitting ? <RefreshCw size={15} className="animate-spin" /> : <ShieldCheck size={16} />}
                    <span>{isSaved ? 'Update Payout Details' : 'Save & Verify UPI Profile'}</span>
                  </button>
                  {isSaved && (
                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2.5 text-emerald-300 text-xs mt-3">
                      <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
                      <span>Active! Commission for code <strong className="text-white font-mono">{partnerId}</strong> will be sent to <strong className="text-white">{upiId}</strong>.</span>
                    </div>
                  )}
                </form>
              </motion.div>
            )}

          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════
            3. INTERACTIVE 10% EARNINGS SIMULATOR
        ══════════════════════════════════════════════════════════════ */}
        <section className="w-full max-w-5xl" id="calculator">
          <div className="bg-slate-900/80 border border-white/10 rounded-3xl p-7 sm:p-12 backdrop-blur-xl shadow-2xl space-y-10">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-7 border-b border-white/10">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 block mb-1">
                  EARNINGS SIMULATOR
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2.5">
                  <IndianRupee className="w-6 h-6 text-emerald-400" />
                  <span>Interactive 10% Income Calculator</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">Select a plan and move the slider to see your earning potential.</p>
              </div>

              <span className="px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-black font-mono self-start sm:self-auto">
                Flat 10% / Closed Deal
              </span>
            </div>

            {/* Plan Tier Selector */}
            <div className="space-y-4">
              <label className="text-xs font-bold text-slate-300 block">Select Average Event Plan Package:</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { id: 'event', label: 'Event Plan', price: 999, commission: 100, desc: 'Birthday / Private Party (1,000 photos)' },
                  { id: 'premium', label: 'Premium Plan (Most Popular)', price: 2999, commission: 300, desc: 'Weddings & Galas (5,000 photos + AI Wall)' },
                  { id: 'professional', label: 'Pro Agency Plan', price: 7999, commission: 800, desc: 'Multi-Event Wedding Planners & Agencies' },
                ].map((pkg) => {
                  const isSel = selectedPlanPrice === pkg.price;
                  return (
                    <button
                      key={pkg.id}
                      type="button"
                      onClick={() => setSelectedPlanPrice(pkg.price)}
                      className={`p-5 rounded-2xl border text-left transition-all cursor-pointer ${
                        isSel
                          ? 'bg-emerald-500/15 border-emerald-400 text-white shadow-lg shadow-emerald-500/10 scale-[1.02]'
                          : 'bg-slate-950/60 border-white/10 text-slate-400 hover:border-white/20'
                      }`}
                    >
                      <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-300">{pkg.label}</div>
                      <div className="text-xl font-mono font-black text-emerald-400 mt-1.5">₹{pkg.price}</div>
                      <div className="text-[10px] text-slate-400 mt-1">{pkg.desc}</div>
                      <div className="mt-4 pt-3.5 border-t border-white/10 flex justify-between items-center text-xs">
                        <span className="text-slate-400">10% Cut per Deal:</span>
                        <span className="font-mono font-black text-emerald-300">₹{pkg.commission}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Slider for Number of Deals */}
            <div className="space-y-5 bg-slate-950/80 p-6 sm:p-8 rounded-2xl border border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300">Estimated Bookings / Month:</span>
                <span className="text-base font-mono font-black text-cyan-400 bg-cyan-500/10 px-4 py-1.5 rounded-xl border border-cyan-500/30">
                  {dealsCount} Closed Deals
                </span>
              </div>

              <input
                type="range"
                min="1"
                max="30"
                value={dealsCount}
                onChange={(e) => setDealsCount(Number(e.target.value))}
                className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
              />

              <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                <span>1 Deal</span>
                <span>10 Deals</span>
                <span>20 Deals</span>
                <span>30 Deals</span>
              </div>
            </div>

            {/* Total Result Bar */}
            <div className="p-7 sm:p-9 rounded-2xl bg-gradient-to-r from-emerald-950/90 via-slate-950 to-teal-950/90 border border-emerald-500/40 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
              <div>
                <span className="text-[10px] text-emerald-400 font-black uppercase tracking-widest block">
                  PROJECTED MONTHLY PAYOUT
                </span>
                <div className="text-3xl sm:text-4xl font-mono font-black text-emerald-300 mt-1">
                  ₹{totalEstimatedEarnings.toLocaleString()}
                  <span className="text-xs font-sans text-slate-400 font-normal ml-2">direct to your UPI</span>
                </div>
                <span className="text-xs text-slate-400 block mt-1.5">
                  6-Month Potential: <strong className="text-white font-mono">₹{sixMonthsEarnings.toLocaleString()}</strong>
                </span>
              </div>

              <div className="text-xs text-slate-300 text-center sm:text-right space-y-1">
                <span className="block text-slate-400">⚡ Transferred within 24h of each deal</span>
                <span className="font-bold text-white block">Zero deduction · 100% net earnings</span>
              </div>
            </div>

          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════
            4. PROMOTER SALES TOOLKIT (TABBED READY-MADE PITCHES)
        ══════════════════════════════════════════════════════════════ */}
        <section className="w-full max-w-5xl" id="pitch-kit">
          <div className="text-center mb-12">
            <span className="text-[11px] font-black uppercase tracking-widest text-cyan-400 block mb-1">
              PROMOTER SALES TOOLKIT
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">Ready-to-Send Client Pitch Scripts</h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-1.5 max-w-xl mx-auto">
              Select your audience, copy the script with 1 click, and forward it on WhatsApp. Your personal referral link is automatically included!
            </p>
          </div>

          <div className="bg-slate-900/80 border border-white/10 rounded-3xl p-7 sm:p-10 backdrop-blur-xl shadow-xl space-y-7">
            
            {/* Pitch Target Selector Tabs */}
            <div className="flex items-center gap-2.5 p-1.5 bg-slate-950/80 border border-white/10 rounded-2xl overflow-x-auto">
              <button
                onClick={() => setActivePitchTab('wedding')}
                className={`flex-1 min-w-[160px] py-3.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activePitchTab === 'wedding'
                    ? 'bg-pink-600 text-white font-black shadow-lg shadow-pink-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Heart size={14} className={activePitchTab === 'wedding' ? 'fill-white' : ''} />
                <span>Wedding Couples & Parties</span>
              </button>

              <button
                onClick={() => setActivePitchTab('corporate')}
                className={`flex-1 min-w-[160px] py-3.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activePitchTab === 'corporate'
                    ? 'bg-cyan-600 text-white font-black shadow-lg shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Building size={14} />
                <span>Corporate Events & Galas</span>
              </button>

              <button
                onClick={() => setActivePitchTab('planner')}
                className={`flex-1 min-w-[160px] py-3.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activePitchTab === 'planner'
                    ? 'bg-purple-600 text-white font-black shadow-lg shadow-purple-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Award size={14} />
                <span>Planners, DJs & Venues</span>
              </button>
            </div>

            {/* Pitch Text Area & Copy Button */}
            <div className="space-y-5">
              <div className="p-6 rounded-2xl bg-slate-950 border border-white/10 text-xs sm:text-sm text-slate-200 font-sans whitespace-pre-line leading-relaxed select-all">
                {activePitchTab === 'wedding' && weddingPitch}
                {activePitchTab === 'corporate' && corporatePitch}
                {activePitchTab === 'planner' && plannerPitch}
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3.5 pt-1">
                <button
                  onClick={() => {
                    const textToCopy = activePitchTab === 'wedding' ? weddingPitch : activePitchTab === 'corporate' ? corporatePitch : plannerPitch;
                    handleCopyPitch(activePitchTab, textToCopy);
                  }}
                  className="w-full sm:flex-1 py-4 px-6 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer active:scale-95"
                >
                  {copiedPitchId === activePitchTab ? <Check size={18} /> : <Copy size={18} />}
                  <span>{copiedPitchId === activePitchTab ? 'Script Copied with Your Link!' : 'Copy Script with My Personal Link'}</span>
                </button>

                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                    activePitchTab === 'wedding' ? weddingPitch : activePitchTab === 'corporate' ? corporatePitch : plannerPitch
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto py-4 px-6 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2"
                >
                  <MessageCircle size={16} className="text-emerald-400" />
                  <span>Open WhatsApp Directly</span>
                </a>
              </div>
            </div>

          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════
            5. HOW IT WORKS (4-STEP TIMELINE)
        ══════════════════════════════════════════════════════════════ */}
        <section className="w-full max-w-5xl">
          <div className="text-center mb-12">
            <span className="text-[11px] font-black uppercase tracking-widest text-emerald-400 block mb-1">
              ZERO CONFUSION PROCESS
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">How You Earn in 4 Simple Steps</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-7 rounded-3xl bg-slate-900/60 border border-white/10 backdrop-blur-xl flex flex-col items-start text-left">
              <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 text-emerald-400 font-black text-sm flex items-center justify-center mb-5 border border-emerald-500/30">
                01
              </div>
              <h3 className="text-sm font-bold text-white mb-2">Get Your Link</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Your unique Partner ID (<strong className="text-emerald-400 font-mono">{partnerId}</strong>) is ready instantly. No interview wait time.
              </p>
            </div>

            <div className="p-7 rounded-3xl bg-slate-900/60 border border-white/10 backdrop-blur-xl flex flex-col items-start text-left">
              <div className="w-11 h-11 rounded-2xl bg-cyan-500/20 text-cyan-400 font-black text-sm flex items-center justify-center mb-5 border border-cyan-500/30">
                02
              </div>
              <h3 className="text-sm font-bold text-white mb-2">Share with Hosts</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Share your link with couples getting married, event planners, birthday hosts, or venues across India.
              </p>
            </div>

            <div className="p-7 rounded-3xl bg-slate-900/60 border border-white/10 backdrop-blur-xl flex flex-col items-start text-left">
              <div className="w-11 h-11 rounded-2xl bg-purple-500/20 text-purple-400 font-black text-sm flex items-center justify-center mb-5 border border-purple-500/30">
                03
              </div>
              <h3 className="text-sm font-bold text-white mb-2">Auto-Linked Profile</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                When they click your link, our system permanently binds their event account to your partner code in the database.
              </p>
            </div>

            <div className="p-7 rounded-3xl bg-slate-900/60 border border-white/10 backdrop-blur-xl flex flex-col items-start text-left">
              <div className="w-11 h-11 rounded-2xl bg-amber-500/20 text-amber-400 font-black text-sm flex items-center justify-center mb-5 border border-amber-500/30">
                04
              </div>
              <h3 className="text-sm font-bold text-white mb-2">24h Direct UPI Payout</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Once the host books, your 10% cash bonus is transferred straight to your registered UPI ID within 24 hours.
              </p>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════
            6. FREQUENTLY ASKED QUESTIONS (ACCORDION)
        ══════════════════════════════════════════════════════════════ */}
        <section className="w-full max-w-4xl" id="faq">
          <div className="text-center mb-12">
            <span className="text-[11px] font-black uppercase tracking-widest text-emerald-400 block mb-1">
              GOT QUESTIONS?
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">Partner Program FAQ</h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-1.5">Clear facts for all part-time promoters and sales affiliates</p>
          </div>

          <div className="space-y-4 sm:space-y-5">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="rounded-2xl bg-slate-900/70 border border-white/10 overflow-hidden transition-all shadow-md">
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-6 text-left flex items-center justify-between gap-4 font-bold text-sm text-white hover:text-emerald-300 transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      size={18}
                      className={`text-slate-400 transition-transform duration-300 shrink-0 ${isOpen ? 'rotate-180 text-emerald-400' : ''}`}
                    />
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="px-6 pb-6 text-xs text-slate-400 leading-relaxed border-t border-white/5 pt-4">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════
            7. VIP WHATSAPP PARTNER DESK CTA
        ══════════════════════════════════════════════════════════════ */}
        <section className="w-full max-w-4xl text-center">
          <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-teal-950/80 border-2 border-emerald-500/40 rounded-3xl p-8 sm:p-14 space-y-7 shadow-[0_0_70px_rgba(16,185,129,0.18)] relative overflow-hidden">
            
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-wider">
              <MessageCircle size={14} className="fill-emerald-400 text-slate-950" />
              <span>Dedicated Partner Desk Hotline</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">Need Help Closing a Client Deal?</h2>
            
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
              Connect directly with our Memento Partner Desk on WhatsApp. We can help you with live event demos, custom quotations, and client queries.
            </p>

            <div className="pt-2">
              <a
                href={partnerDeskWhatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2.5 py-4 px-9 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/25 transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                <MessageCircle size={18} className="fill-slate-950" />
                <span>Chat with Partner Desk on WhatsApp (+91 9866161775)</span>
                <ArrowRight size={16} />
              </a>
            </div>

            <p className="text-[10px] text-slate-400 pt-1">
              Your Partner ID <strong className="text-emerald-400 font-mono">{partnerId}</strong> will be pre-filled automatically.
            </p>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
