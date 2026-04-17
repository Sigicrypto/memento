"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface PricingSectionProps {
  showingINR: boolean;
  showingOMR: boolean;
  setShowingINR: (val: boolean) => void;
  setShowingOMR: (val: boolean) => void;
  currency: { showINR: boolean; showOMR: boolean };
  Sym: string;
  plans: Array<{
    name: string;
    price: string;
    emoji: string;
    description: string;
    stats: string;
    features: string[];
    tagline: string;
    popular: boolean;
    badge?: string;
    featured?: boolean;
  }>;
}

const PricingSection: React.FC<PricingSectionProps> = ({
  showingINR,
  showingOMR,
  setShowingINR,
  setShowingOMR,
  currency,
  Sym,
  plans
}) => {
  return (
    <section id="pricing" className="sec py-24">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, type: 'spring', stiffness: 100, damping: 15 }}
          className="text-center mb-16"
        >
          <span className="hero-badge mb-4">One-time Payment • Per Event</span>
          <h2 className="sec-h2 text-4xl md:text-5xl font-bold mb-4 text-white">
            Pricing That <span className="gradient-text-vibrant italic">Grows With You</span>
          </h2>
          <p className="sec-sub text-lg text-slate-400">Simple, transparent pricing. No subscriptions, zero surprises.</p>
        </motion.div>

        {/* Currency toggles */}
        <div className="flex justify-center gap-4 mb-12">
          {!showingINR && currency.showINR && (
            <button 
              className="px-6 py-2 rounded-full bg-surface/40 hover:bg-surface/60 border border-white/10 text-white text-sm font-bold transition-all" 
              onClick={() => { setShowingINR(true); setShowingOMR(false); }}
            >
              Switch to ₹ INR
            </button>
          )}
          {!showingOMR && currency.showOMR && (
            <button 
              className="px-6 py-2 rounded-full bg-surface/40 hover:bg-surface/60 border border-white/10 text-white text-sm font-bold transition-all" 
              onClick={() => { setShowingOMR(true); setShowingINR(false); }}
            >
              Switch to ر.ع. OMR
            </button>
          )}
          {(showingINR || showingOMR) && (
            <button 
              className="px-6 py-2 rounded-full bg-surface/40 hover:bg-surface/60 border border-white/10 text-white text-sm font-bold transition-all" 
              onClick={() => { setShowingINR(false); setShowingOMR(false); }}
            >
              Switch to $ USD
            </button>
          )}
        </div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
          }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {plans.map((p, i) => (
            <motion.div 
              key={i} 
              className={`gcard flex flex-col p-8 rounded-3xl bg-surface/40 backdrop-blur-xl border ${p.popular ? 'border-primary/50 ring-2 ring-primary/20' : 'border-white/10'} relative h-full`}
              variants={{
                hidden: { opacity: 0, scale: 0.9, y: 30 },
                visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 15 } }
              }}
              whileHover={{ scale: p.featured ? 1.05 : 1.03, y: -5 }}
            >
              <div className="gcard-inner flex flex-col h-full relative z-10">
                <div className="flex gap-2 mb-6 flex-wrap">
                  {p.popular && <span className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black tracking-widest uppercase">⭐ Most Popular</span>}
                  {p.badge && !p.popular && (
                    <span className="px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-[10px] font-black tracking-widest uppercase">{p.badge}</span>
                  )}
                </div>

                <div className="mb-8">
                  <span className="text-4xl mb-4 block">{p.emoji}</span>
                  <h3 className="text-2xl font-black text-white">{p.name}</h3>
                  <p className="text-slate-400 text-sm mt-2">{p.description}</p>
                </div>

                <div className="mb-8 p-6 rounded-2xl bg-white/5 border border-white/5">
                  <div className="flex items-baseline gap-1">
                    <span className="text-slate-400 text-lg font-medium">{Sym}</span>
                    <span className="text-5xl font-black text-white tracking-tighter">{p.price}</span>
                    <span className="text-slate-500 text-sm ml-1">/event</span>
                  </div>
                  <p className="text-primary-light text-xs font-bold mt-4 uppercase tracking-widest">{p.stats}</p>
                </div>

                <ul className="space-y-4 mb-10 flex-grow">
                  {p.features.map((feat, j) => (
                    <li key={j} className="flex gap-3 text-sm text-slate-300 items-start">
                      <span className="text-primary flex-shrink-0 mt-0.5">{feat.includes('✓') ? '' : '•'}</span>
                      <span>{feat.replace('✓ ', '')}</span>
                    </li>
                  ))}
                </ul>

                <button className={`w-full py-4 rounded-xl font-bold transition-all ${p.popular ? 'bg-gradient-to-r from-primary to-accent text-white shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1' : 'bg-white/10 text-white hover:bg-white/20'}`}>
                  Get Started
                </button>
                <p className="text-[10px] text-center text-slate-500 mt-4 font-medium uppercase tracking-widest italic">{p.tagline}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default PricingSection;
