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
  Sliders,
  Send,
  Building,
  Heart,
  PartyPopper,
} from 'lucide-react';
import { usePartnerId } from '@/hooks/usePartnerId';

const ThemedNav = dynamic(() => import('@/components/ThemedNav'), { ssr: false });
const Footer = dynamic(() => import('@/components/sections/Footer'), { ssr: false });

const WHATSAPP_NUMBER = '919866161775';

const FAQS = [
  {
    q: "Is there a fixed monthly salary for this role?",
    a: "No. This is a 100% flexible, freelance commission opportunity. You earn a flat 10% cash bonus on every closed booking (₹300 to ₹800+ per deal) with unlimited earning potential and zero minimum targets.",
  },
  {
    q: "Where do I get my partner code and link?",
    a: "Your unique Partner ID (e.g. MEM-XXXX) and 1-Click Referral Link are already generated at the top of this page. You don't have to wait for manual verification to start sharing.",
  },
  {
    q: "How does the tracking work when I share my link?",
    a: "When a potential client opens your link or scans your QR code, a 30-day tracking cookie and localStorage token lock your Partner ID to their session. When they create an account, their profile is permanently tagged with your code.",
  },
  {
    q: "When and how do I receive my 10% commission?",
    a: "Payouts are transferred directly to your registered UPI ID (Google Pay, PhonePe, Paytm, or BHIM) within 24 hours of the client's booking confirmation.",
  },
  {
    q: "Who are the best potential clients to reach out to?",
    a: "Couples planning upcoming weddings, birthday hosts, corporate HR/event managers, wedding planners, event DJs, photographers, and banquet hall managers across India.",
  },
];

export default function PartnerPage() {
  const { partnerId, partnerLink, copyPartnerId, copyPartnerLink, copied, copiedLink, whatsappShareUrl } = usePartnerId();
  
  const [activeTab, setActiveTab] = useState<'link' | 'qr' | 'payout'>('link');
  const [selectedPlanPrice, setSelectedPlanPrice] = useState<number>(2999);
  const [dealsCount, setDealsCount] = useState<number>(8);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [copiedPitchId, setCopiedPitchId] = useState<string | null>(null);
  
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

  const partnerDeskWhatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    `Hi Memento Partner Desk! 👋 I am registered with Partner ID ${partnerId} (${fullName || 'Promoter'}). UPI ID: ${upiId || 'Not set'}. I want to connect regarding event client referrals!`
  )}`;

  return (
    <>
      <ThemedNav />
      <main className="min-h-screen bg-[#05070d] text-white pt-24 pb-24 px-4 sm:px-6 lg:px-8 selection:bg-emerald-500/30 overflow-x-hidden flex flex-col items-center relative">
        
        {/* Background Visual Effects */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] bg-gradient-to-b from-emerald-500/10 via-teal-500/5 to-transparent blur-[140px] rounded-full" />
          <div className="absolute top-[30%] left-[10%] w-[450px] h-[450px] bg-cyan-500/8 blur-[120px] rounded-full" />
          <div className="absolute top-[60%] right-[10%] w-[500px] h-[500px] bg-purple-500/8 blur-[130px] rounded-full" />
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:32px_32px] opacity-40" />
        </div>

        {/* ══════════════════════ 1. HERO SECTION ══════════════════════ */}
        <section className="relative z-10 w-full max-w-5xl text-center pt-8 sm:pt-12 pb-12 flex flex-col items-center">
          
          {/* Top Pill */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black uppercase tracking-widest mb-6 shadow-inner shadow-emerald-500/20"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Pan-India Event Partner Program • 100% Commission</span>
          </motion.div>

          {/* Main Title */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.12] max-w-4xl"
          >
            Turn Your Event & Wedding Network Into{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
              10% Instant Cash Income.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-sm sm:text-base lg:text-lg text-slate-300 max-w-2xl mt-5 font-normal leading-relaxed"
          >
            Work part-time from anywhere in India. Recommend Memento’s Live QR Photo Wall to wedding couples, party hosts, corporate planners, and venues. 
            Receive <strong className="text-white font-bold">10% cash referral bonus</strong> on every booked event, credited directly to your UPI ID within 24 hours.
          </motion.p>

          {/* 3 Core Highlight Cards */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 w-full max-w-3xl mt-8 text-left"
          >
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-emerald-500/25 backdrop-blur-xl flex items-center gap-3.5 shadow-lg">
              <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 shrink-0">
                <TrendingUp size={20} />
              </div>
              <div>
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Commission Rate</div>
                <div className="text-sm font-black text-emerald-300">10% Flat / Closed Deal</div>
                <div className="text-[11px] text-slate-400">No Fixed Salary · Unlimited Upside</div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-amber-500/25 backdrop-blur-xl flex items-center gap-3.5 shadow-lg">
              <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 shrink-0">
                <Zap size={20} />
              </div>
              <div>
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Payout Speed</div>
                <div className="text-sm font-black text-amber-300">Within 24 Hours</div>
                <div className="text-[11px] text-slate-400">Instant UPI Direct Bank Transfer</div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-cyan-500/25 backdrop-blur-xl flex items-center gap-3.5 shadow-lg">
              <div className="p-2.5 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 shrink-0">
                <Globe size={20} />
              </div>
              <div>
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Location</div>
                <div className="text-sm font-black text-cyan-300">All India (Pan-India)</div>
                <div className="text-[11px] text-slate-400">Flexible Remote Freelance Hours</div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* ══════════════════════ 2. THE PARTNER COCKPIT CARD (HERO ELEMENT) ══════════════════════ */}
        <section className="relative z-10 w-full max-w-4xl mb-16">
          <div className="bg-slate-900/90 border-2 border-emerald-500/40 rounded-3xl p-6 sm:p-8 backdrop-blur-2xl shadow-[0_0_80px_rgba(16,185,129,0.16)] relative overflow-hidden">
            
            {/* Ambient Corner Orbs */}
            <div className="absolute -top-32 -right-32 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

            {/* Cockpit Top Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-white/10 relative z-10">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                    Live Partner Tracking Active
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white">Your Partner Command Center</h2>
                <p className="text-xs text-slate-400 mt-0.5">Start sharing immediately. All registrations via your link are auto-tracked.</p>
              </div>

              {/* Partner ID Display Badge */}
              <div className="flex items-center gap-2 bg-slate-950/90 px-4 py-2.5 rounded-2xl border border-emerald-500/40 shadow-inner">
                <span className="text-xs font-mono text-slate-400 uppercase font-bold">Partner Code:</span>
                <span className="text-base font-mono font-black text-emerald-400 tracking-wider">{partnerId}</span>
                <button
                  onClick={copyPartnerId}
                  className="ml-1 p-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 transition-all cursor-pointer"
                  title="Copy Partner ID"
                >
                  {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                </button>
              </div>
            </div>

            {/* 3 Nav Tabs */}
            <div className="flex items-center gap-2 p-1.5 bg-slate-950/80 border border-white/10 rounded-2xl mb-6 relative z-10">
              <button
                onClick={() => setActiveTab('link')}
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === 'link'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black shadow-lg shadow-emerald-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sparkles size={14} />
                <span>1-Click Link</span>
              </button>

              <button
                onClick={() => setActiveTab('qr')}
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === 'qr'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black shadow-lg shadow-emerald-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <QrCode size={14} />
                <span>Referral QR Poster</span>
              </button>

              <button
                onClick={() => setActiveTab('payout')}
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === 'payout'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black shadow-lg shadow-emerald-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Wallet size={14} />
                <span>{isSaved ? 'UPI Payout Active ✓' : 'Register UPI Profile'}</span>
              </button>
            </div>

            {/* TAB CONTENT 1: LINK & SHARE */}
            {activeTab === 'link' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-5 relative z-10"
              >
                <div className="bg-slate-950/90 border border-emerald-500/30 rounded-2xl p-4 sm:p-5 space-y-3 shadow-inner">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      YOUR UNIQUE 1-CLICK REFERRAL LINK
                    </label>
                    <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      30-Day Auto Tracking
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900 border border-white/10 text-xs sm:text-sm font-mono font-bold text-emerald-300 break-all select-all flex items-center justify-between gap-2">
                    <span>{partnerLink}</span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                    <button
                      onClick={copyPartnerLink}
                      className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                    >
                      {copiedLink ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                      <span>{copiedLink ? 'Referral Link Copied!' : 'Copy 1-Click Referral Link'}</span>
                    </button>

                    <a
                      href={whatsappShareUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-black transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer active:scale-95"
                    >
                      <MessageCircle size={16} className="fill-slate-950" />
                      <span>Share Directly on WhatsApp</span>
                    </a>
                  </div>
                </div>

                {/* Quick Instruction Banner */}
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-300 leading-relaxed">
                    <strong>How to use this link:</strong> Send this link to anyone hosting an event. When they click and sign up, their account is permanently attached to your Partner ID <strong className="text-emerald-400 font-mono">{partnerId}</strong>. When they purchase any plan, your 10% commission is queued for UPI transfer.
                  </p>
                </div>
              </motion.div>
            )}

            {/* TAB CONTENT 2: DIGITAL QR POSTER */}
            {activeTab === 'qr' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6 text-center relative z-10"
              >
                <div className="bg-slate-950/80 border border-emerald-500/30 rounded-2xl p-6 space-y-4">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                    <Award size={14} />
                    <span>Official Memento Partner QR Poster</span>
                  </div>

                  {/* QR Code Container */}
                  <div className="w-48 h-48 mx-auto bg-[#070a10] p-3 rounded-2xl border-2 border-emerald-500/40 shadow-[0_0_40px_rgba(16,185,129,0.25)] flex items-center justify-center">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(partnerLink)}&color=10b981&bcolor=070a10`}
                      alt={`Referral QR Code for ${partnerId}`}
                      className="w-full h-full object-contain rounded-xl"
                    />
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs font-bold text-white">Scan with Any Mobile Camera to Open Invite</p>
                    <p className="text-[11px] font-mono text-emerald-300 font-bold">{partnerLink}</p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                    <a
                      href={`https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=${encodeURIComponent(partnerLink)}&color=10b981&bcolor=070a10`}
                      download={`Memento-Partner-QR-${partnerId}.png`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                    >
                      <Download size={15} className="stroke-[3]" />
                      <span>Download Branded QR Poster (HD PNG)</span>
                    </a>

                    <a
                      href={whatsappShareUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-2"
                    >
                      <MessageCircle size={15} className="text-emerald-400" />
                      <span>Share QR on WhatsApp</span>
                    </a>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB CONTENT 3: UPI REGISTRATION */}
            {activeTab === 'payout' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative z-10"
              >
                <form onSubmit={handleRegisterPromoter} className="bg-slate-950/80 border border-white/10 rounded-2xl p-5 sm:p-6 space-y-4">
                  <div className="flex items-center gap-3 pb-3 border-b border-white/10">
                    <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400">
                      <UserCheck size={18} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">Verified Partner Payout Profile</h3>
                      <p className="text-[11px] text-slate-400">Register your UPI ID once to receive 10% commission payments automatically.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                        Full Name
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Rahul Sharma"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full py-2.5 px-3.5 rounded-xl bg-slate-900 border border-white/15 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-400 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                        WhatsApp Number
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="e.g. +91 98765 43210"
                        value={whatsappNumber}
                        onChange={(e) => setWhatsappNumber(e.target.value)}
                        className="w-full py-2.5 px-3.5 rounded-xl bg-slate-900 border border-white/15 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-400 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                      UPI ID (Google Pay / PhonePe / Paytm / Bank VPA)
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. rahul@upi or 9876543210@ybl"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className="w-full py-2.5 px-3.5 rounded-xl bg-slate-900 border border-white/15 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-400 transition-colors"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 cursor-pointer active:scale-95"
                  >
                    {isSubmitting ? <RefreshCw size={15} className="animate-spin" /> : <ShieldCheck size={16} />}
                    <span>{isSaved ? 'Update Payout Details' : 'Save & Verify Payout Profile'}</span>
                  </button>

                  {isSaved && (
                    <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2.5 text-emerald-300 text-xs font-medium">
                      <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
                      <span>Profile active! All bookings through code <strong className="text-white font-mono">{partnerId}</strong> will be paid to <strong className="text-white">{upiId}</strong>.</span>
                    </div>
                  )}
                </form>
              </motion.div>
            )}

          </div>
        </section>

        {/* ══════════════════════ 3. HOW IT WORKS (4-STEP TIMELINE) ══════════════════════ */}
        <section className="relative z-10 w-full max-w-5xl mb-20">
          <div className="text-center mb-10">
            <span className="text-[11px] font-black uppercase tracking-widest text-emerald-400 block mb-1">
              Zero Confusion Process
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">How You Earn in 4 Simple Steps</h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-xl mx-auto">
              From copying your link to receiving direct UPI bank transfers in 24 hours.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-white/10 backdrop-blur-xl flex flex-col items-start text-left relative overflow-hidden group hover:border-emerald-500/30 transition-all">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 font-black text-sm flex items-center justify-center mb-4 border border-emerald-500/30 group-hover:scale-110 transition-transform">
                01
              </div>
              <h3 className="text-sm font-bold text-white mb-1.5">Get Your Link</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Your unique Partner ID (<strong className="text-emerald-400 font-mono">{partnerId}</strong>) is ready instantly. No interview wait time.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900/60 border border-white/10 backdrop-blur-xl flex flex-col items-start text-left relative overflow-hidden group hover:border-emerald-500/30 transition-all">
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-400 font-black text-sm flex items-center justify-center mb-4 border border-cyan-500/30 group-hover:scale-110 transition-transform">
                02
              </div>
              <h3 className="text-sm font-bold text-white mb-1.5">Pitch to Hosts & Planners</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Share your link with couples getting married, event planners, birthday hosts, or venues across India.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900/60 border border-white/10 backdrop-blur-xl flex flex-col items-start text-left relative overflow-hidden group hover:border-emerald-500/30 transition-all">
              <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-400 font-black text-sm flex items-center justify-center mb-4 border border-purple-500/30 group-hover:scale-110 transition-transform">
                03
              </div>
              <h3 className="text-sm font-bold text-white mb-1.5">Auto-Linked Registration</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                When they click your link, our system permanently binds their event account to your partner code in the database.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900/60 border border-white/10 backdrop-blur-xl flex flex-col items-start text-left relative overflow-hidden group hover:border-emerald-500/30 transition-all">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 font-black text-sm flex items-center justify-center mb-4 border border-amber-500/30 group-hover:scale-110 transition-transform">
                04
              </div>
              <h3 className="text-sm font-bold text-white mb-1.5">24h Direct UPI Payout</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Once the host books, your 10% cash bonus is transferred straight to your registered UPI ID within 24 hours.
              </p>
            </div>

          </div>
        </section>

        {/* ══════════════════════ 4. INTERACTIVE 10% EARNINGS CALCULATOR ══════════════════════ */}
        <section className="relative z-10 w-full max-w-4xl mb-20">
          <div className="bg-slate-900/80 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8 pb-6 border-b border-white/10">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 block mb-1">
                  COMMISSION ESTIMATOR
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                  <IndianRupee className="w-6 h-6 text-emerald-400" />
                  <span>Interactive 10% Earnings Calculator</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Select plan packages and simulate your monthly referral income.</p>
              </div>

              <div className="px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-black font-mono self-start sm:self-auto">
                Flat 10% / Closed Deal
              </div>
            </div>

            {/* Plan Tier Selector */}
            <div className="space-y-3 mb-8">
              <label className="text-xs font-bold text-slate-300 block">Select Average Event Plan Package:</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                      className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                        isSel
                          ? 'bg-emerald-500/15 border-emerald-400 text-white shadow-lg shadow-emerald-500/10 scale-[1.02]'
                          : 'bg-slate-950/60 border-white/10 text-slate-400 hover:border-white/20'
                      }`}
                    >
                      <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-300">{pkg.label}</div>
                      <div className="text-xl font-mono font-black text-emerald-400 mt-1">₹{pkg.price}</div>
                      <div className="text-[10px] text-slate-400 mt-1">{pkg.desc}</div>
                      <div className="mt-3 pt-3 border-t border-white/10 flex justify-between items-center text-xs">
                        <span className="text-slate-400">10% Cut per Deal:</span>
                        <span className="font-mono font-black text-emerald-300">₹{pkg.commission}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Slider for Number of Deals */}
            <div className="space-y-4 mb-8 bg-slate-950/80 p-5 rounded-2xl border border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300">Estimated Bookings / Month:</span>
                <span className="text-base font-mono font-black text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-xl border border-cyan-500/30">
                  {dealsCount} Events
                </span>
              </div>

              <input
                type="range"
                min="1"
                max="30"
                value={dealsCount}
                onChange={(e) => setDealsCount(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
              />

              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>1 Deal</span>
                <span>10 Deals</span>
                <span>20 Deals</span>
                <span>30 Deals</span>
              </div>
            </div>

            {/* Total Result Bar */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/90 via-slate-950 to-teal-950/90 border border-emerald-500/40 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
              <div>
                <span className="text-[10px] text-emerald-400 font-black uppercase tracking-widest block">
                  PROJECTED MONTHLY PAYOUT
                </span>
                <div className="text-3xl sm:text-4xl font-mono font-black text-emerald-300 mt-0.5">
                  ₹{totalEstimatedEarnings.toLocaleString()}
                  <span className="text-xs font-sans text-slate-400 font-normal ml-2">direct to your UPI</span>
                </div>
              </div>

              <div className="text-xs text-slate-300 text-center sm:text-right">
                <span className="block text-slate-400">⚡ Transferred within 24h of each deal</span>
                <span className="font-bold text-white mt-0.5 block">Zero deduction · 100% net earnings</span>
              </div>
            </div>

          </div>
        </section>

        {/* ══════════════════════ 5. READY-MADE CLIENT PITCH SCRIPTS (1-CLICK COPY) ══════════════════════ */}
        <section className="relative z-10 w-full max-w-5xl mb-20">
          <div className="text-center mb-10">
            <span className="text-[11px] font-black uppercase tracking-widest text-cyan-400 block mb-1">
              PROMOTER SALES TOOLKIT
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">Ready-Made Client Pitch Templates</h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-xl mx-auto">
              Copy and forward these high-converting scripts to your clients. Your personal partner link is already included!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Script 1: Weddings & Parties */}
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl flex flex-col justify-between shadow-xl">
              <div>
                <div className="flex items-center justify-between gap-2 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-pink-500/20 text-pink-400">
                      <Heart size={16} />
                    </div>
                    <span className="text-xs font-bold text-white uppercase tracking-wider">For Wedding Couples & Party Hosts</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">WhatsApp Ready</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-white/10 text-xs text-slate-300 font-sans whitespace-pre-line leading-relaxed mb-4 select-all">
                  {weddingPitch}
                </div>
              </div>

              <button
                onClick={() => handleCopyPitch('wedding', weddingPitch)}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-black text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-pink-500/20 cursor-pointer active:scale-95"
              >
                {copiedPitchId === 'wedding' ? <Check size={16} /> : <Copy size={16} />}
                <span>{copiedPitchId === 'wedding' ? 'Wedding Script Copied with Your Link!' : 'Copy Wedding Pitch Script'}</span>
              </button>
            </div>

            {/* Script 2: Corporate & Planners */}
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl flex flex-col justify-between shadow-xl">
              <div>
                <div className="flex items-center justify-between gap-2 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
                      <Building size={16} />
                    </div>
                    <span className="text-xs font-bold text-white uppercase tracking-wider">For Event Planners & Corporate Hosts</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">WhatsApp Ready</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-white/10 text-xs text-slate-300 font-sans whitespace-pre-line leading-relaxed mb-4 select-all">
                  {corporatePitch}
                </div>
              </div>

              <button
                onClick={() => handleCopyPitch('corporate', corporatePitch)}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 cursor-pointer active:scale-95"
              >
                {copiedPitchId === 'corporate' ? <Check size={16} /> : <Copy size={16} />}
                <span>{copiedPitchId === 'corporate' ? 'Corporate Script Copied with Your Link!' : 'Copy Corporate Pitch Script'}</span>
              </button>
            </div>

          </div>
        </section>

        {/* ══════════════════════ 6. FREQUENTLY ASKED QUESTIONS (ACCORDION) ══════════════════════ */}
        <section className="relative z-10 w-full max-w-4xl mb-20">
          <div className="text-center mb-10">
            <span className="text-[11px] font-black uppercase tracking-widest text-emerald-400 block mb-1">
              GOT QUESTIONS?
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">Partner Program FAQ</h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">Clear facts for all part-time promoters and sales affiliates</p>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl bg-slate-900/70 border border-white/10 overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-white hover:text-emerald-300 transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      size={18}
                      className={`text-slate-400 transition-transform duration-300 shrink-0 ${
                        isOpen ? 'rotate-180 text-emerald-400' : ''
                      }`}
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
                        <div className="px-5 pb-5 text-xs text-slate-400 leading-relaxed border-t border-white/5 pt-3">
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

        {/* ══════════════════════ 7. VIP WHATSAPP PARTNER DESK CTA ══════════════════════ */}
        <section className="relative z-10 w-full max-w-4xl text-center">
          <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-teal-950/80 border-2 border-emerald-500/40 rounded-3xl p-8 sm:p-12 space-y-5 shadow-[0_0_60px_rgba(16,185,129,0.15)] relative overflow-hidden">
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-wider">
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
                className="inline-flex items-center justify-center gap-2.5 py-4 px-8 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/25 transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                <MessageCircle size={18} className="fill-slate-950" />
                <span>Chat with Partner Desk on WhatsApp (+91 9866161775)</span>
                <ArrowRight size={16} />
              </a>
            </div>

            <p className="text-[10px] text-slate-400">
              Your Partner ID <strong className="text-emerald-400 font-mono">{partnerId}</strong> will be pre-filled automatically.
            </p>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
