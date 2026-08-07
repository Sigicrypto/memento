"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Award, Wallet, ArrowRight, ShieldCheck, CheckCircle2, Copy, Check, MessageCircle, DollarSign, TrendingUp, Users } from 'lucide-react';
import { usePartnerId } from '@/hooks/usePartnerId';
import PartnerProgramModal from '@/components/PartnerProgramModal';

export default function PartnerSection() {
  const { partnerId, copyPartnerId, copied } = usePartnerId();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Interactive Calculator State
  const [eventsPerMonth, setEventsPerMonth] = useState<number>(3);
  const [packagePrice, setPackagePrice] = useState<number>(14999);

  const monthlyIncome = Math.round(eventsPerMonth * packagePrice * 0.1);
  const annualIncome = monthlyIncome * 12;

  return (
    <section className="relative py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full" id="partner-program">
      {/* Background Decor */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl h-96 bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative z-10 bg-slate-900/80 border border-emerald-500/30 rounded-3xl p-6 sm:p-10 lg:p-12 backdrop-blur-2xl shadow-[0_0_90px_rgba(16,185,129,0.12)] overflow-hidden">
        
        {/* Ambient Top Right Orb */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-gradient-to-br from-emerald-500/20 to-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-extrabold uppercase tracking-widest mb-4"
          >
            <Award className="w-4 h-4" />
            <span>Memento Event Partner Program</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-black text-text-primary tracking-tight"
          >
            Earn <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 dark:from-emerald-400 dark:via-teal-300 dark:to-cyan-400">10% Cash Commission</span> on Every Event
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-sm sm:text-base text-text-secondary leading-relaxed"
          >
            Turn your network into part-time income. Recommend Memento’s live photo wall to wedding couples, corporate organizers, or event planners, and earn 10% cash transferred directly to your UPI ID.
          </motion.p>
        </div>

        {/* 2 Column Layout: Interactive Calculator & 3-Step Process */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-12">
          
          {/* Column 1: Live Income Calculator Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-6 bg-slate-950/90 border border-emerald-500/30 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden"
          >
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Part-Time Income Calculator</h3>
                  <p className="text-xs text-slate-400">See how much you can earn monthly</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[11px] font-extrabold border border-emerald-500/30 uppercase">
                10% Direct Payout
              </span>
            </div>

            {/* Slider 1: Events Referred */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2 text-xs font-bold">
                <span className="text-slate-300">Events Referred per Month:</span>
                <span className="text-emerald-400 font-mono font-extrabold text-sm">{eventsPerMonth} {eventsPerMonth === 1 ? 'Event' : 'Events'}</span>
              </div>
              <input
                type="range"
                min={1}
                max={15}
                step={1}
                value={eventsPerMonth}
                onChange={(e) => setEventsPerMonth(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
              />
            </div>

            {/* Selector 2: Package Type */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2 text-xs font-bold">
                <span className="text-slate-300">Average Event Package Price:</span>
                <span className="text-emerald-400 font-mono font-extrabold text-sm">₹{packagePrice.toLocaleString()}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Party (₹4.9k)', val: 4999 },
                  { label: 'Wedding (₹15k)', val: 14999 },
                  { label: 'Festival (₹30k)', val: 29999 },
                ].map((item) => (
                  <button
                    key={item.val}
                    onClick={() => setPackagePrice(item.val)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      packagePrice === item.val
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                        : 'bg-slate-900 border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Earnings Highlight Box */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/15 via-teal-500/10 to-slate-900 border border-emerald-500/40 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">ESTIMATED MONTHLY INCOME</p>
                <p className="text-2xl sm:text-3xl font-mono font-black text-emerald-400">₹{monthlyIncome.toLocaleString()} <span className="text-xs text-slate-400 font-normal">/ month</span></p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">ANNUAL POTENTIAL</p>
                <p className="text-base font-mono font-bold text-teal-300">₹{annualIncome.toLocaleString()} / yr</p>
              </div>
            </div>
          </motion.div>

          {/* Column 2: 3-Step Process & Benefits */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-6 space-y-4"
          >
            <div className="p-5 rounded-2xl bg-slate-950/60 border border-white/10 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-black text-sm flex items-center justify-center shrink-0">
                1
              </div>
              <div>
                <h4 className="text-sm font-bold text-white mb-1">Get Your Unique Partner ID</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Every visitor automatically gets a unique code (e.g., <span className="text-emerald-400 font-mono font-bold">{partnerId}</span>). You can also share your personal 1-click booking link.
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950/60 border border-white/10 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/30 text-teal-400 font-black text-sm flex items-center justify-center shrink-0">
                2
              </div>
              <div>
                <h4 className="text-sm font-bold text-white mb-1">Recommend Memento to Event Hosts</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Introduce Memento to wedding couples, birthday organizers, or corporate event planners. Host quotes your code during checkout.
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950/60 border border-white/10 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 font-black text-sm flex items-center justify-center shrink-0">
                3
              </div>
              <div>
                <h4 className="text-sm font-bold text-white mb-1">Receive 10% Cash to Your UPI</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Register your UPI ID once in the Partner Modal. 10% cash commission is transferred directly to your account post-booking.
                </p>
              </div>
            </div>

            {/* Quick Partner Code Banner */}
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                <span className="text-xs font-bold text-slate-200">Your Partner ID: <strong className="text-emerald-400 font-mono">{partnerId}</strong></span>
              </div>
              <button
                onClick={copyPartnerId}
                className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-bold transition-all flex items-center gap-1.5 shrink-0"
              >
                {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </motion.div>

        </div>

        {/* Bottom CTA Action Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
            <p className="text-xs text-slate-300 font-medium">
              Join 100+ active event ambassadors earning part-time commission on Memento.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto py-3.5 px-7 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-xl shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95 shrink-0"
          >
            <Sparkles className="w-4 h-4 fill-slate-950" />
            <span>Open Partner Desk & Register UPI</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Partner Modal */}
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
