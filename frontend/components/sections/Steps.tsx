"use client";

import React from 'react';
import { motion } from 'framer-motion';
import SectionHeader from './SectionHeader';

const Steps: React.FC = () => {
  const steps = [
    { num: '01', icon: '🎉', title: 'Create Your Event', desc: 'Name it and get a shareable QR code in under a minute.' },
    { num: '02', icon: '📲', title: 'Guests Scan & Share', desc: 'No app. No login. Just scan the QR and upload photos instantly.' },
    { num: '03', icon: '✨', title: 'Watch It Come Alive', desc: 'Every photo streams live into a beautiful gallery for everyone.' },
  ];

  return (
    <section id="howitworks" className="lp-section overflow-hidden scroll-mt-32">
      <div className="section-container">
        <SectionHeader
          badge="Process"
          badgeColor="magenta"
          title="Three steps. That's it."
          description="No downloads. No accounts. No friction."
        />

        <div className="relative max-w-5xl mx-auto">
          <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-neon-cyan/30 to-transparent hidden lg:block" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 relative z-10">
            {steps.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.15, ease: 'easeOut' }}
                className="lp-card group relative overflow-hidden flex flex-col items-center text-center justify-center"
              >
                <div className="absolute -right-12 -top-12 w-40 h-40 bg-neon-magenta/20 blur-[60px] rounded-full group-hover:bg-neon-magenta/40 transition-all" />
                <div className="relative z-10 w-full flex flex-col items-center">
                  <span className="text-xs font-bold text-neon-cyan tracking-widest mb-6 uppercase font-mono bg-neon-cyan/10 px-4 py-1.5 rounded-full border border-neon-cyan/30">
                    Step {s.num}
                  </span>
                  <div className="w-16 h-16 rounded-2xl bg-bg-subtle flex items-center justify-center mb-8 border border-border group-hover:border-neon-cyan/50 group-hover:scale-110 transition-all duration-300">
                    <span className="text-3xl">{s.icon}</span>
                  </div>
                  <h3 className="text-xl lg:text-2xl font-bold text-text-primary mb-4 tracking-tight group-hover:text-neon-cyan transition-colors duration-300">
                    {s.title}
                  </h3>
                  <p className="text-text-secondary font-medium leading-relaxed text-base max-w-xs">{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Steps;
