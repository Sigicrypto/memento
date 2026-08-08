"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Gift, CheckCircle2, Copy, Check, ArrowRight, DollarSign, Award, MessageCircle, ShieldCheck, UserCheck, Wallet, RefreshCw, QrCode, Download } from 'lucide-react';

import { usePartnerId } from '@/hooks/usePartnerId';

interface PartnerProgramModalProps {
  isOpen: boolean;
  onClose: () => void;
  refCode?: string;
}

const WHATSAPP_NUMBER = '919866161775';

export default function PartnerProgramModal({
  isOpen,
  onClose,
  refCode: overrideRefCode,
}: PartnerProgramModalProps) {
  const { partnerId: autoPartnerId, partnerLink, copyPartnerId, copyPartnerLink, copied, copiedLink, whatsappShareUrl } = usePartnerId();
  const activePartnerId = overrideRefCode || autoPartnerId;
  const activeLink = overrideRefCode ? `https://mymementoapp.com/join?ref=${overrideRefCode}` : partnerLink;
  
  const [activeTab, setActiveTab] = useState<'overview' | 'qrcode' | 'payout'>('overview');
  const [eventValue, setEventValue] = useState<number>(14999);
  
  // Registration Form State
  const [fullName, setFullName] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [upiId, setUpiId] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load existing profile from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedProfile = localStorage.getItem(`memento_promoter_${activePartnerId}`);
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
  }, [activePartnerId]);

  if (!isOpen) return null;

  const commissionAmount = Math.round(eventValue * 0.1);

  const handleRegisterPromoter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !whatsappNumber || !upiId) return;

    setIsSubmitting(true);
    const profile = {
      partnerId: activePartnerId,
      fullName,
      whatsappNumber,
      upiId,
      registeredAt: new Date().toISOString(),
    };

    // Save locally
    localStorage.setItem(`memento_promoter_${activePartnerId}`, JSON.stringify(profile));

    // Try sending to backend API
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

  const whatsappMessage = `Hi Memento Partner Desk! 👋 I registered my Partner ID ${activePartnerId} (${fullName || 'Promoter'}). UPI ID: ${upiId || 'Not set'}. I want to submit/verify a 10% event referral!`;
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6 overflow-y-auto custom-scrollbar">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-xl"
          onClick={onClose}
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-2xl bg-[#0b0f19] border border-emerald-500/30 rounded-3xl p-6 sm:p-8 text-white shadow-[0_0_80px_rgba(16,185,129,0.15)] overflow-hidden z-10 my-auto"
        >
          {/* Ambient Glow Orbs */}
          <div className="absolute -top-32 -right-32 w-64 h-64 bg-emerald-500/20 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-cyan-500/20 rounded-full blur-[100px] pointer-events-none" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all z-20"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>

          {/* Top Header Badge */}
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-extrabold uppercase tracking-widest">
              <Award size={14} className="text-emerald-400" />
              <span>Memento Partner Program</span>
            </div>

            {isSaved && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold">
                <ShieldCheck size={13} />
                <span>Verified Partner Profile</span>
              </span>
            )}
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">
            Earn <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">10% Referral Bonus</span> for Each User Referred
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
            Promote Memento for weddings, corporate events, and parties. Earn 10% cash referral bonus for each user referred, credited directly to your registered UPI ID within 24 hours.
          </p>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1.5 p-1.5 bg-slate-900/80 border border-white/10 rounded-2xl mb-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'overview'
                  ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles size={14} />
              <span>Overview</span>
            </button>
            <button
              onClick={() => setActiveTab('qrcode')}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'qrcode'
                  ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <QrCode size={14} />
              <span>Referral QR Poster</span>
            </button>
            <button
              onClick={() => setActiveTab('payout')}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'payout'
                  ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Wallet size={14} />
              <span>{isSaved ? 'UPI Payout Active' : 'Register UPI'}</span>
            </button>
          </div>

          {activeTab === 'overview' ? (
            <>
              {/* 1-Click Unique Partner Share Link Box */}
              <div className="bg-slate-900/90 border border-emerald-500/30 rounded-2xl p-4 sm:p-5 mb-6 shadow-inner space-y-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">YOUR 1-CLICK REFERRAL LINK</p>
                    <p className="text-xs sm:text-sm font-mono font-bold text-emerald-300 break-all">{activeLink}</p>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold shrink-0">
                    ID: {activePartnerId}
                  </span>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={copyPartnerLink}
                    className="flex-1 py-2.5 px-3.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold transition-all flex items-center justify-center gap-2"
                  >
                    {copiedLink ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    <span>{copiedLink ? 'Link Copied!' : 'Copy Referral Link'}</span>
                  </button>

                  <a
                    href={whatsappShareUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20 shrink-0"
                  >
                    <MessageCircle size={14} className="fill-slate-950" />
                    <span>Share on WhatsApp</span>
                  </a>
                </div>
              </div>

              {/* 3 Step Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-start">
                  <span className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 font-extrabold text-xs flex items-center justify-center mb-3">1</span>
                  <h4 className="text-xs font-bold text-white mb-1">Share Unique Link</h4>
                  <p className="text-[11px] text-slate-400 leading-normal">Share your 1-Click Referral Link with wedding couples, planners, or hosts.</p>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-start">
                  <span className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 font-extrabold text-xs flex items-center justify-center mb-3">2</span>
                  <h4 className="text-xs font-bold text-white mb-1">Host Auto-Linked</h4>
                  <p className="text-[11px] text-slate-400 leading-normal">Host registers via your link. The booking is automatically linked to your partner account.</p>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-start">
                  <span className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 font-extrabold text-xs flex items-center justify-center mb-3">3</span>
                  <h4 className="text-xs font-bold text-white mb-1">10% Bonus (24h)</h4>
                  <p className="text-[11px] text-slate-400 leading-normal">10% referral bonus credited directly to your registered UPI ID within 24 hours of booking.</p>
                </div>
              </div>

              {/* Live Payout Calculator */}
              <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-4 sm:p-5 mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-300">Estimated Booking Price:</span>
                  <span className="text-xs font-mono font-bold text-emerald-400">₹{eventValue.toLocaleString()}</span>
                </div>

                <input
                  type="range"
                  min={2500}
                  max={30000}
                  step={500}
                  value={eventValue}
                  onChange={(e) => setEventValue(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400 mb-3"
                />

                <div className="flex items-center justify-between pt-2 border-t border-white/10">
                  <span className="text-xs font-extrabold text-white">Your 10% Referral Bonus:</span>
                  <span className="text-base sm:text-lg font-mono font-black text-emerald-300">₹{commissionAmount.toLocaleString()}</span>
                </div>
              </div>
            </>
          ) : activeTab === 'qrcode' ? (
            /* Tab 2: Digital Referral QR Poster Card */
            <div className="bg-slate-900/90 border border-emerald-500/30 rounded-2xl p-5 sm:p-6 mb-6 text-center space-y-4 shadow-2xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-extrabold uppercase tracking-widest">
                <Award size={14} />
                <span>Memento Ambassador Digital QR Card</span>
              </div>

              {/* QR Code Container */}
              <div className="w-48 h-48 sm:w-56 sm:h-56 mx-auto bg-[#090d16] p-3 rounded-2xl border-2 border-emerald-500/40 shadow-[0_0_40px_rgba(16,185,129,0.2)] flex items-center justify-center relative group">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(activeLink)}&color=10b981&bcolor=090d16`}
                  alt={`Referral QR Code for ${activePartnerId}`}
                  className="w-full h-full object-contain rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <p className="text-xs font-bold text-white">Scan to Join Memento Live Event App</p>
                <p className="text-[11px] font-mono text-emerald-300 font-bold">{activeLink}</p>
                <p className="text-[10px] text-slate-400">Scan code with any mobile camera to claim 10% referral bonus tracking.</p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
                <a
                  href={`https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(activeLink)}&color=10b981&bcolor=090d16`}
                  download={`Memento-Referral-QR-${activePartnerId}.png`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                >
                  <Download size={14} className="stroke-[3]" />
                  <span>Download Referral QR Code</span>
                </a>

                <a
                  href={whatsappShareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-2"
                >
                  <MessageCircle size={14} className="text-emerald-400" />
                  <span>Share QR Link on WhatsApp</span>
                </a>
              </div>
            </div>
          ) : (
            /* Tab 3: Payout Registration Form */
            <form onSubmit={handleRegisterPromoter} className="bg-slate-900/90 border border-white/10 rounded-2xl p-5 sm:p-6 mb-6 space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-white/10">
                <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400">
                  <UserCheck size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Verified Promoter Profile</h3>
                  <p className="text-[11px] text-slate-400">Register your UPI ID once to receive direct cash payouts for your referrals.</p>
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
                className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25"
              >
                {isSubmitting ? <RefreshCw size={14} className="animate-spin" /> : <ShieldCheck size={16} />}
                <span>{isSaved ? 'Update Payout Details' : 'Register & Verify Payout Profile'}</span>
              </button>

              {isSaved && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 text-emerald-300 text-[11px] font-medium">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  <span>Profile active! All referrals using code <strong>{activePartnerId}</strong> will be paid to <strong>{upiId}</strong>.</span>
                </div>
              )}
            </form>
          )}

          {/* Action CTA */}
          <div className="space-y-3">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/25 transition-all hover:scale-[1.01] active:scale-[0.99]"
            >
              <MessageCircle className="w-4 h-4 fill-slate-950" />
              <span>Connect with Partner Desk on WhatsApp</span>
              <ArrowRight className="w-4 h-4" />
            </a>

            <p className="text-[10px] text-center text-slate-400">
              Partner Desk WhatsApp: <strong className="text-white">+91 9866161775</strong> · Payouts transferred directly to your registered UPI ID.
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
