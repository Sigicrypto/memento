"use client";

import React from 'react';
import { motion } from 'framer-motion';

const WhyChoose: React.FC = () => {
  return (
    <section id="why" className="sec py-16">
      <div className="container mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, type: 'spring', stiffness: 100, damping: 15 }}
        >
          <span className="hero-badge mb-4">Why Choose Memento?</span>
          <h2 className="sec-h2 text-4xl md:text-5xl font-bold mb-4">
            Capture what matters. <span className="gradient-text-vibrant italic">Instantly.</span>
          </h2>
          <p className="sec-sub text-lg text-slate-400 max-w-2xl mx-auto mb-16">
            Your guests take the photos, we collect them all in one place. No missed moments, no lost memories.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: '🎉', title: 'Perfect for Weddings', desc: 'From the first look to the last dance, every guest becomes your personal photographer.', big: true },
            { icon: '🎂', title: 'Birthdays & Private Parties', desc: 'No more chasing friends for photos. Get them all at once in a beautiful live gallery.' },
            { icon: '🏢', title: 'Corporate Events', desc: 'Level up your branding. Show real-time interaction on any screen with full moderation.' },
            { icon: '👰', title: 'Anniversaries', desc: 'Celebrate the journey. Let every generation share their memories in one click.' },
            { icon: '🎈', title: 'Festivals', desc: 'Capture the scale and energy. Crowdsourced memories that look professional.' },
          ].map((f, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className={`gcard feat-card p-8 rounded-3xl bg-surface/40 backdrop-blur-xl border border-white/10 text-left ${f.big ? 'lg:col-span-2' : ''} cinematic-glow`}
            >
              <div className="gcard-inner">
                <span className="text-4xl mb-6 block">{f.icon}</span>
                <h3 className="text-2xl font-bold text-white mb-4">{f.title}</h3>
                <p className="text-slate-400 text-lg leading-relaxed">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChoose;
