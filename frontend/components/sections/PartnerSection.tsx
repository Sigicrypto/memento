"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Award, ArrowRight, Copy, Check, ShieldCheck, Wallet } from 'lucide-react';
import { usePartnerId } from '@/hooks/usePartnerId';
import PartnerProgramModal from '@/components/PartnerProgramModal';

export default function PartnerSection() {
  const { partnerId, copyPartnerId, copied } = usePartnerId();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <section className="relative py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full" id="partner-program">
      {/* Sleek, Concealed Executive Banner Card */}
      <div className="relative z-10 bg-gradient-to-r from-slate-900/90 via-slate-900/95 to-slate-950/90 dark:from-slate-950/90 dark:via-slate-900/90 dark:to-slate-950/90 border border-emerald-500/25 rounded-3xl p-6 sm:p-8 backdrop-blur-2xl shadow-[0_0_50px_rgba(16,185,129,0.1)] overflow-hidden">
        
        {/* Subtle Glow Backdrop Orbs */}
        <div className="absolute -top-20 -left-20 w-48 h-48 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 relative z-10">
          
          {/* Left Column: Badge & Title */}
          <div className="space-y-2 max-w-2xl text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-extrabold uppercase tracking-widest">
              <Award className="w-3.5 h-3.5 text-emerald-400" />
              <span>Memento Partner Desk</span>
            </div>

            <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight">
              Earn <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">10% Cash Commission</span> on Every Event
            </h3>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Introduce Memento’s live photo wall to wedding couples, corporate organizers, or event planners. Get 10% cash transferred directly to your UPI ID on every confirmed booking.
            </p>
          </div>

          {/* Right Column: Unique ID Pill & CTA Button */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto shrink-0">
            {/* Concealed Partner Code Pill */}
            <div className="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-slate-900/90 border border-white/10 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-slate-300 font-medium">Your ID: <strong className="text-emerald-400 font-mono font-bold">{partnerId}</strong></span>
              </div>
              <button
                onClick={copyPartnerId}
                className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[11px] font-bold transition-all flex items-center gap-1 shrink-0"
              >
                {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            {/* Primary Action Button */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full sm:w-auto py-3 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95 shrink-0"
            >
              <Sparkles className="w-4 h-4 fill-slate-950" />
              <span>Earn 10% Cash</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>

      {/* Full Detailed Partner Modal */}
      {isModalOpen && (
        <PartnerProgramModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          refCode={partnerId}
        />
      )}
    </section>
  );
}
