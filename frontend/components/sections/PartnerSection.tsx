"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Award, ArrowRight, Copy, Check, ShieldCheck } from 'lucide-react';
import { usePartnerId } from '@/hooks/usePartnerId';
import PartnerProgramModal from '@/components/PartnerProgramModal';

export default function PartnerSection() {
  const { partnerId, copyPartnerId, copied } = usePartnerId();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <section className="relative py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full" id="partner-program">
      {/* Sleek, Centered Executive Banner Card */}
      <div className="relative z-10 bg-slate-900/90 dark:bg-slate-950/90 border border-emerald-500/30 rounded-3xl p-8 sm:p-10 md:p-12 backdrop-blur-2xl shadow-[0_0_60px_rgba(16,185,129,0.12)] overflow-hidden text-center flex flex-col items-center">
        
        {/* Subtle Ambient Glow Orbs */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-48 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-96 h-48 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Centered Top Badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-extrabold uppercase tracking-widest mb-4"
        >
          <Award className="w-4 h-4 text-emerald-400" />
          <span>Memento Partner Desk</span>
        </motion.div>

        {/* Centered Title */}
        <motion.h3
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.05 }}
          className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight max-w-3xl leading-tight mb-3"
        >
          Earn <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">10% Cash Commission</span> on Every Event
        </motion.h3>

        {/* Centered Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed mb-8"
        >
          Introduce Memento’s live photo wall to wedding couples, corporate organizers, or event planners. Get 10% cash transferred directly to your UPI ID on every confirmed booking.
        </motion.p>

        {/* Centered Controls Row: Partner Code Pill & Action Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto"
        >
          {/* Unique Partner ID Pill */}
          <div className="w-full sm:w-auto px-4 py-3 rounded-2xl bg-slate-950/80 border border-white/15 flex items-center justify-center gap-3 text-xs shadow-inner">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-slate-300 font-medium">Your ID: <strong className="text-emerald-400 font-mono font-bold">{partnerId}</strong></span>
            </div>
            <button
              onClick={copyPartnerId}
              className="px-3 py-1 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-bold transition-all flex items-center gap-1.5 shrink-0"
            >
              {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>

          {/* Primary Action Button */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto py-3.5 px-7 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95 shrink-0"
          >
            <Sparkles className="w-4 h-4 fill-slate-950" />
            <span>Earn 10% Cash</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>

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
