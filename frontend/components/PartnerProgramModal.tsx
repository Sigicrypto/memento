"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Gift, CheckCircle2, Copy, Check, ArrowRight, DollarSign, Award, MessageCircle } from 'lucide-react';

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
  const { partnerId: autoPartnerId, copyPartnerId, copied } = usePartnerId();
  const activePartnerId = overrideRefCode || autoPartnerId;
  const [eventValue, setEventValue] = useState<number>(7500);

  if (!isOpen) return null;

  const commissionAmount = Math.round(eventValue * 0.1);

  const whatsappMessage = `Hi Memento Partner Desk! 👋 I want to register for the 10% Event Partner Program / submit a referral booking. (Partner ID: ${activePartnerId})`;
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
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
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

          {/* Header Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-extrabold uppercase tracking-widest mb-4">
            <Award size={14} className="text-emerald-400" />
            <span>Memento Event Partner Program</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">
            Earn <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">10% Commission</span> on Every Event
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
            Share the live memory experience with event planners, wedding hosts, corporate organizers, or venue directors. Receive an honorarium payout for every confirmed event booking.
          </p>

          {/* Unique Partner ID Box */}
          <div className="bg-slate-900/90 border border-emerald-500/30 rounded-2xl p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-inner">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">YOUR UNIQUE PARTNER ID</p>
              <p className="text-lg font-mono font-bold text-emerald-300 tracking-wider">{activePartnerId}</p>
            </div>
            <button
              onClick={copyPartnerId}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold transition-all flex items-center justify-center gap-2 shrink-0"
            >
              {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Partner ID'}</span>
            </button>
          </div>

          {/* 3 Step Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-start">
              <span className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 font-extrabold text-xs flex items-center justify-center mb-3">1</span>
              <h4 className="text-xs font-bold text-white mb-1">Quote Partner ID</h4>
              <p className="text-[11px] text-slate-400 leading-normal">Provide your Unique Partner ID when introducing a host or booking an event.</p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-start">
              <span className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 font-extrabold text-xs flex items-center justify-center mb-3">2</span>
              <h4 className="text-xs font-bold text-white mb-1">Event Confirmed</h4>
              <p className="text-[11px] text-slate-400 leading-normal">Our team sets up the live wall stream & customized QR experience for the host.</p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-start">
              <span className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 font-extrabold text-xs flex items-center justify-center mb-3">3</span>
              <h4 className="text-xs font-bold text-white mb-1">10% Direct Payout</h4>
              <p className="text-[11px] text-slate-400 leading-normal">Receive your 10% honorarium via instant UPI or direct account transfer.</p>
            </div>
          </div>

          {/* Live Payout Calculator */}
          <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-4 sm:p-5 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-300">Estimated Event Package Value:</span>
              <span className="text-xs font-mono font-bold text-emerald-400">₹{eventValue.toLocaleString()}</span>
            </div>

            <input
              type="range"
              min={2500}
              max={25000}
              step={500}
              value={eventValue}
              onChange={(e) => setEventValue(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400 mb-3"
            />

            <div className="flex items-center justify-between pt-2 border-t border-white/10">
              <span className="text-xs font-extrabold text-white">Your 10% Partner Payout:</span>
              <span className="text-base sm:text-lg font-mono font-black text-emerald-300">₹{commissionAmount.toLocaleString()}</span>
            </div>
          </div>

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
              Partner Desk WhatsApp: <strong className="text-white">+91 9866161775</strong> · Payouts processed within 24 hours of booking.
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
