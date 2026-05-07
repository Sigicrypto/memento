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
  onGetStarted: (plan: 'starter' | 'standard' | 'premium' | 'whitelabel') => void;
}

const PricingSection: React.FC<PricingSectionProps> = ({
  showingINR,
  showingOMR,
  setShowingINR,
  setShowingOMR,
  currency,
  Sym,
  plans,
  onGetStarted
}) => {
  return (
    <section id="pricing" className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-widest uppercase mb-6">
            Transparent Pricing
          </div>
          <h2 className="h1-text mb-6">
            One-time Payment. <span className="text-secondary italic">Per Event.</span>
          </h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">Simple, transparent pricing. No subscriptions, zero surprises. Choose the plan that fits your event.</p>
        </motion.div>

        {/* Currency toggles */}
        <div className="flex justify-center gap-3 mb-16">
          <div className="flex p-1 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
            <button 
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${!showingINR && !showingOMR ? 'bg-primary text-white shadow-lg' : 'text-text-muted hover:text-white'}`} 
              onClick={() => { setShowingINR(false); setShowingOMR(false); }}
            >
              USD
            </button>
            {currency.showINR && (
              <button 
                className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${showingINR ? 'bg-primary text-white shadow-lg' : 'text-text-muted hover:text-white'}`} 
                onClick={() => { setShowingINR(true); setShowingOMR(false); }}
              >
                INR
              </button>
            )}
            {currency.showOMR && (
              <button 
                className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${showingOMR ? 'bg-primary text-white shadow-lg' : 'text-text-muted hover:text-white'}`} 
                onClick={() => { setShowingOMR(true); setShowingINR(false); }}
              >
                OMR
              </button>
            )}
          </div>
        </div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
          }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {plans.map((p, i) => (
            <motion.div 
              key={i} 
              className={`gcard flex flex-col ${p.popular ? 'border-primary/50 ring-1 ring-primary/20' : ''}`}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
              }}
            >
              <div className="flex-grow">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-3xl">{p.emoji}</span>
                  {p.popular && (
                    <span className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black tracking-widest uppercase">Popular</span>
                  )}
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-2">{p.name}</h3>
                <p className="text-text-muted text-sm mb-8 leading-relaxed">{p.description}</p>

                <div className="mb-8 pb-8 border-b border-white/5">
                  <div className="flex items-baseline gap-1">
                    <span className="text-text-muted text-xl font-medium">{Sym}</span>
                    <span className="text-5xl font-bold text-white tracking-tighter">{p.price}</span>
                    <span className="text-text-muted text-sm ml-1">/event</span>
                  </div>
                  <p className="text-primary text-[10px] font-bold mt-4 uppercase tracking-widest">{p.stats}</p>
                </div>

                <ul className="space-y-4 mb-10">
                  {p.features.map((feat, j) => (
                    <li key={j} className="flex gap-3 text-sm text-text-secondary items-start">
                      <span className="text-secondary flex-shrink-0 mt-1">✓</span>
                      <span>{feat.replace('✓ ', '')}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button 
                onClick={() => onGetStarted(p.name.toLowerCase().replace(' ', '') as any)}
                className={`w-full py-4 rounded-xl font-bold transition-all ${p.popular ? 'btn-premium' : 'bg-white/5 text-white border border-white/10 hover:bg-white/10'}`}
              >
                Get Started
              </button>
              <p className="text-[10px] text-center text-text-muted mt-4 font-bold uppercase tracking-widest italic">{p.tagline}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default PricingSection;
