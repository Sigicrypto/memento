"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Award, ArrowRight } from 'lucide-react';
import { usePartnerId } from '@/hooks/usePartnerId';
import PartnerProgramModal from '@/components/PartnerProgramModal';

export default function PartnerSection() {
  const { partnerId } = usePartnerId();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <section className="relative py-10 px-4 sm:px-6 lg:px-8 w-full flex justify-center items-center" id="partner-program">
      {/* Sleek, Concealed Executive Teaser Card */}
      <div className="relative z-10 w-full max-w-4xl bg-slate-900/80 dark:bg-slate-950/80 border border-emerald-500/25 rounded-3xl p-6 sm:p-8 md:p-10 backdrop-blur-2xl shadow-[0_0_50px_rgba(16,185,129,0.12)] overflow-hidden text-center flex flex-col items-center justify-center mx-auto">
        
        {/* Subtle Glow Orbs */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-36 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-80 h-36 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Centered Top Badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-extrabold uppercase tracking-widest mb-3"
        >
          <Award className="w-3.5 h-3.5 text-emerald-400" />
          <span>Memento Partner Program</span>
        </motion.div>

        {/* Centered Slick Title */}
        <motion.h3
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.05 }}
          className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-snug mb-2 max-w-2xl"
        >
          Earn <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">10% Referral Bonus</span> for Each User Referred
        </motion.h3>

        {/* Minimal 1-Liner Teaser */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed mb-6 font-normal"
        >
          Recommend Memento to upcoming hosts & couples. 10% cash bonus credited directly to your UPI ID within 24 hours of booking.
        </motion.p>

        {/* Primary Action Button (Reveals full modal on click) */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 }}
        >
          <button
            onClick={() => setIsModalOpen(true)}
            className="py-3 px-8 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-xl shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 fill-slate-950" />
            <span>Earn 10% Referral Bonus ↗</span>
          </button>
        </motion.div>

      </div>

      {/* Full Detailed Partner Modal (Revealed on Click) */}
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
