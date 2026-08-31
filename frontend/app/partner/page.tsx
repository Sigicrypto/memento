"use client";

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
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
} from 'lucide-react';
import { usePartnerId } from '@/hooks/usePartnerId';

const ThemedNav = dynamic(() => import('@/components/ThemedNav'), { ssr: false });
const Footer = dynamic(() => import('@/components/sections/Footer'), { ssr: false });

const WHATSAPP_NUMBER = '919866161775';

export default function PartnerPage() {
  const { partnerId, partnerLink, copyPartnerId, copyPartnerLink, copied, copiedLink, whatsappShareUrl } = usePartnerId();
  
  const [selectedPlanPrice, setSelectedPlanPrice] = useState<number>(2999);
  
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

  const commissionAmount = Math.round(selectedPlanPrice * 0.1);

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

  const whatsappMessage = `Hi Memento Partner Desk! 👋 I am registered with Partner ID ${partnerId} (${fullName || 'Promoter'}). UPI ID: ${upiId || 'Not set'}. I want to connect regarding event referrals!`;
  const partnerDeskWhatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <>
      <ThemedNav />
      <main className="min-h-screen bg-[#07090E] text-white pt-28 pb-20 px-4 sm:px-6 lg:px-8 selection:bg-emerald-500/30 overflow-x-hidden flex flex-col items-center">
        
        {/* HERO SECTION */}
        <section className="relative w-full max-w-5xl text-center pt-8 pb-14 flex flex-col items-center">
          {/* Ambient Glows */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-emerald-500/15 blur-[120px] rounded-full pointer-events-none" />
          <div className="absolute top-1/3 left-1/3 w-[300px] h-[250px] bg-cyan-500/15 blur-[100px] rounded-full pointer-events-none" />

          {/* Top Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-extrabold uppercase tracking-widest mb-5">
            <Award size={15} />
            <span>Pan-India Event Sales Partner & Affiliate Program</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight max-w-4xl">
            Earn <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">10% Flat Commission</span> on Every Event Booking
          </h1>

          <p className="text-sm sm:text-lg text-slate-300 max-w-2xl mt-5 font-normal leading-relaxed">
            Work part-time from anywhere in India. Recommend Memento’s Live QR Photo Wall to wedding couples, party hosts, corporate planners, and venues. 
            Receive instant 10% cash bonuses credited directly to your UPI ID within 24 hours of booking.
          </p>

          {/* Commission Highlight Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-3xl mt-8">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-emerald-500/30 flex items-center gap-3.5 text-left">
              <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
                <TrendingUp size={20} />
              </div>
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Commission Basis</div>
                <div className="text-sm font-black text-emerald-400">10% Flat / Deal</div>
                <div className="text-[10px] text-slate-400">100% Commission · No Fixed Salary</div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-amber-500/30 flex items-center gap-3.5 text-left">
              <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
                <Zap size={20} />
              </div>
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Payout Speed</div>
                <div className="text-sm font-black text-amber-400">Within 24 Hours</div>
                <div className="text-[10px] text-slate-400">Instant UPI Direct Transfer</div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-cyan-500/30 flex items-center gap-3.5 text-left">
              <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 shrink-0">
                <Globe size={20} />
              </div>
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Work Flexibility</div>
                <div className="text-sm font-black text-cyan-400">Whole India</div>
                <div className="text-[10px] text-slate-400">Flexible / Part-Time Hours</div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 1: YOUR UNIQUE PARTNER CODE & LINK */}
        <section className="w-full max-w-4xl mb-12">
          <div className="bg-slate-900/90 border-2 border-emerald-500/40 rounded-3xl p-6 sm:p-8 shadow-[0_0_60px_rgba(16,185,129,0.12)] relative overflow-hidden">
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-white/10">
              <div>
                <span className="text-[11px] font-black uppercase tracking-widest text-emerald-400 flex items-center gap-1.5 mb-1">
                  <Sparkles size={14} /> Ready to Start Earning Immediately
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white">Your Unique Partner Tracking ID & Link</h2>
                <p className="text-xs text-slate-400 mt-1">No approval wait time. Share your link or code with clients now.</p>
              </div>

              <div className="flex items-center gap-2 bg-slate-950 px-4 py-2 rounded-2xl border border-emerald-500/40">
                <span className="text-xs font-mono text-slate-400 uppercase">Partner ID:</span>
                <span className="text-base font-mono font-black text-emerald-400">{partnerId}</span>
                <button
                  onClick={copyPartnerId}
                  className="ml-2 p-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 transition-colors cursor-pointer"
                  title="Copy Partner ID"
                >
                  {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                </button>
              </div>
            </div>

            {/* Link Box */}
            <div className="bg-slate-950/90 border border-emerald-500/30 rounded-2xl p-4 sm:p-5 space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">
                  YOUR 1-CLICK REFERRAL LINK (CLIENTS JOIN THROUGH THIS)
                </label>
                <div className="p-3 rounded-xl bg-slate-900 border border-white/10 text-xs sm:text-sm font-mono font-bold text-emerald-300 break-all select-all">
                  {partnerLink}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
                <button
                  onClick={copyPartnerLink}
                  className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {copiedLink ? <Check size={15} className="text-emerald-400" /> : <Copy size={15} />}
                  <span>{copiedLink ? 'Referral Link Copied!' : 'Copy 1-Click Referral Link'}</span>
                </button>

                <a
                  href={whatsappShareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                >
                  <MessageCircle size={15} className="fill-slate-950" />
                  <span>Share Referral Link on WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: HOW IT WORKS (ZERO CONFUSION GUIDE) */}
        <section className="w-full max-w-4xl mb-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">How the Partner Program Works</h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">Simple 4-step process from sharing to UPI bank payout</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/10 flex flex-col items-start text-left relative">
              <span className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 font-black text-sm flex items-center justify-center mb-3">1</span>
              <h3 className="text-sm font-bold text-white mb-1">Get Your Link / Code</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Your unique Partner ID (e.g. <strong className="text-emerald-400 font-mono">{partnerId}</strong>) and 1-Click Link are already generated above.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/10 flex flex-col items-start text-left relative">
              <span className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 font-black text-sm flex items-center justify-center mb-3">2</span>
              <h3 className="text-sm font-bold text-white mb-1">Recommend Memento</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Share with couples getting married, event planners, birthday hosts, corporate clients, or banquet venues across India.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/10 flex flex-col items-start text-left relative">
              <span className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 font-black text-sm flex items-center justify-center mb-3">3</span>
              <h3 className="text-sm font-bold text-white mb-1">Client Registers</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                When the host opens your link or quotes your code, their event account is permanently linked to your Partner ID.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/10 flex flex-col items-start text-left relative">
              <span className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 font-black text-sm flex items-center justify-center mb-3">4</span>
              <h3 className="text-sm font-bold text-white mb-1">Instant 10% UPI Payout</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                As soon as the host books, your 10% commission is credited directly to your registered UPI ID within 24 hours.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 3: INTERACTIVE 10% EARNINGS CALCULATOR */}
        <section className="w-full max-w-4xl mb-12">
          <div className="bg-slate-900/70 border border-white/10 rounded-3xl p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
              <div>
                <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                  <IndianRupee className="w-5 h-5 text-emerald-400" />
                  <span>10% Referral Earnings Calculator</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Select a package to view your commission per booking</p>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
                10% Direct Payout
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
              {[
                { id: 'event', label: 'Event Plan', price: 999, commission: 100, desc: 'Single celebration, 1,000 photos' },
                { id: 'premium', label: 'Premium Plan (Most Popular)', price: 2999, commission: 300, desc: 'Weddings & galas, 5,000 photos + AI' },
                { id: 'professional', label: 'Pro Agency Plan', price: 7999, commission: 800, desc: 'Agencies & multi-event coordinators' },
              ].map((pkg) => {
                const isSel = selectedPlanPrice === pkg.price;
                return (
                  <button
                    key={pkg.id}
                    type="button"
                    onClick={() => setSelectedPlanPrice(pkg.price)}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                      isSel
                        ? 'bg-emerald-500/15 border-emerald-500 text-white shadow-lg shadow-emerald-500/15 scale-[1.02]'
                        : 'bg-slate-950/60 border-white/5 text-slate-400 hover:border-white/15'
                    }`}
                  >
                    <div className="text-xs font-bold text-white uppercase">{pkg.label}</div>
                    <div className="text-lg font-mono font-black text-emerald-400 mt-1">₹{pkg.price}</div>
                    <div className="text-[11px] text-slate-400 mt-1">{pkg.desc}</div>
                    <div className="mt-3 pt-3 border-t border-white/10 flex justify-between items-center text-xs">
                      <span className="text-slate-400">Your 10% Cut:</span>
                      <span className="font-mono font-bold text-emerald-300">₹{pkg.commission}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center sm:text-left">
                <span className="text-xs text-slate-400 uppercase font-bold block">Referral Bonus for Selected Deal:</span>
                <span className="text-2xl sm:text-3xl font-mono font-black text-emerald-300">
                  ₹{commissionAmount.toLocaleString()} <span className="text-xs text-slate-400 font-sans font-normal">/ booking</span>
                </span>
              </div>
              <div className="text-xs text-slate-400 text-center sm:text-right">
                <span>E.g. 10 wedding referrals = <strong>₹3,000 – ₹8,000+</strong> direct to your UPI</span>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 4: 2 COLUMNS (QR POSTER + UPI REGISTRATION) */}
        <section className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 items-start">
          
          {/* DIGITAL QR POSTER CARD */}
          <div className="bg-slate-900/80 border border-emerald-500/30 rounded-3xl p-6 text-center space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <QrCode size={14} />
              <span>Your Digital QR Poster</span>
            </div>

            <h3 className="text-base font-bold text-white">Scan & Earn Referral QR Card</h3>

            {/* QR Code Container */}
            <div className="w-44 h-44 mx-auto bg-[#090d16] p-3 rounded-2xl border-2 border-emerald-500/40 shadow-[0_0_30px_rgba(16,185,129,0.2)] flex items-center justify-center">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(partnerLink)}&color=10b981&bcolor=090d16`}
                alt={`Referral QR Code for ${partnerId}`}
                className="w-full h-full object-contain rounded-xl"
              />
            </div>

            <div className="space-y-1">
              <p className="text-xs font-bold text-white">Scan to Open Your Partner Invite</p>
              <p className="text-[11px] font-mono text-emerald-300 font-bold">{partnerLink}</p>
            </div>

            <div className="pt-2">
              <a
                href={`https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(partnerLink)}&color=10b981&bcolor=090d16`}
                download={`Memento-Partner-QR-${partnerId}.png`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
              >
                <Download size={14} className="stroke-[3]" />
                <span>Download Your Branded QR Card</span>
              </a>
            </div>
          </div>

          {/* REGISTER UPI PAYOUT FORM */}
          <form onSubmit={handleRegisterPromoter} className="bg-slate-900/80 border border-white/10 rounded-3xl p-6 space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-white/10">
              <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400">
                <Wallet size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Register UPI Payout Profile</h3>
                <p className="text-[11px] text-slate-400">Link your UPI ID once to receive direct payouts.</p>
              </div>
            </div>

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
                className="w-full py-2.5 px-3.5 rounded-xl bg-slate-950 border border-white/15 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-400 transition-colors"
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
                className="w-full py-2.5 px-3.5 rounded-xl bg-slate-950 border border-white/15 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-400 transition-colors"
              />
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
                className="w-full py-2.5 px-3.5 rounded-xl bg-slate-950 border border-white/15 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-400 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 cursor-pointer"
            >
              {isSubmitting ? <RefreshCw size={14} className="animate-spin" /> : <ShieldCheck size={16} />}
              <span>{isSaved ? 'Update Payout Details' : 'Save & Verify Payout Profile'}</span>
            </button>

            {isSaved && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 text-emerald-300 text-[11px] font-medium">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                <span>Profile active! All referrals using code <strong>{partnerId}</strong> will be sent to <strong>{upiId}</strong>.</span>
              </div>
            )}
          </form>
        </section>

        {/* SECTION 5: FREQUENTLY ASKED QUESTIONS */}
        <section className="w-full max-w-4xl mb-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-extrabold text-white flex items-center justify-center gap-2">
              <HelpCircle className="w-6 h-6 text-emerald-400" />
              <span>Partner Program FAQ</span>
            </h2>
            <p className="text-slate-400 text-xs mt-1">Clear answers for all part-time promoters and sales affiliates</p>
          </div>

          <div className="space-y-3">
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/10">
              <h3 className="text-sm font-bold text-white mb-1">Is there a fixed monthly salary?</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                No. This is a 100% freelance / commission-based partner opportunity with a flat 10% cash bonus per completed booking. You have unlimited earning potential with zero minimum quotas.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/10">
              <h3 className="text-sm font-bold text-white mb-1">Where do I get my partner code?</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Your unique Partner ID (e.g. <strong className="text-emerald-400 font-mono">{partnerId}</strong>) is generated automatically and displayed at the top of this page. You do not need manual interview approval to start sharing.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/10">
              <h3 className="text-sm font-bold text-white mb-1">How is my referral tracked?</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                When a user visits your referral link (<span className="font-mono text-emerald-300">{partnerLink}</span>) or scans your QR poster, your Partner ID is automatically attached to their profile. When they purchase any event package, the 10% commission is queued for you.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/10">
              <h3 className="text-sm font-bold text-white mb-1">How and when do I get paid?</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Payouts are transferred directly to your registered UPI ID (Google Pay, PhonePe, Paytm, or BHIM) within 24 hours of lead monetization and booking confirmation.
              </p>
            </div>
          </div>
        </section>

        {/* BOTTOM CTA: WHATSAPP DESK */}
        <section className="w-full max-w-4xl text-center">
          <div className="bg-gradient-to-r from-emerald-950/60 via-slate-900 to-teal-950/60 border border-emerald-500/30 rounded-3xl p-8 space-y-4">
            <h2 className="text-xl sm:text-2xl font-black text-white">Have Questions or Need Help Closing a Deal?</h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
              Connect directly with our dedicated Partner Desk on WhatsApp. We can help answer client questions or assist with event demonstrations.
            </p>

            <div className="pt-2">
              <a
                href={partnerDeskWhatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 py-3.5 px-8 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm shadow-xl shadow-emerald-500/25 transition-all hover:scale-105 active:scale-95"
              >
                <MessageCircle size={18} className="fill-slate-950" />
                <span>Chat with Partner Desk on WhatsApp (+91 9866161775)</span>
                <ArrowRight size={16} />
              </a>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
