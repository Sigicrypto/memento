"use client";

import React from 'react';
import { motion } from 'framer-motion';
import SectionHeader from './SectionHeader';

const WhyChoose: React.FC = () => {
  const items = [
    { icon: '🎉', title: 'Weddings', desc: 'From the first look to the last dance, every guest becomes part of your story.', big: true },
    { icon: '🎂', title: 'Parties', desc: 'No more chasing friends for photos. Get them all at once in a beautiful live gallery.' },
    { icon: '🏢', title: 'Corporate', desc: 'Real-time interaction on any screen. Perfect for networking and engagement.' },
    { icon: '👰', title: 'Anniversaries', desc: 'Celebrate the journey. Let every generation share their memories with one click.' },
    { icon: '🎈', title: 'Festivals', desc: 'Capture the scale and energy of the crowd. Crowdsourced memories that look professional.' },
  ];

  return (
    <section id="why" className="lp-section overflow-hidden scroll-mt-32">
      <div className="section-container">
        <SectionHeader
          badge="Use Cases"
          badgeColor="cyan"
          title={<>Capture what matters. <span className="text-gradient-neon">Instantly.</span></>}
          description="From intimate weddings to grand festivals, Memento turns every guest into a contributor, creating a shared memory that lasts forever."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {items.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: 'easeOut' }}
              className={`lp-card group relative overflow-hidden flex flex-col justify-center ${f.big ? 'lg:col-span-2' : ''}`}
            >
              <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-neon-cyan/20 blur-[70px] rounded-full group-hover:bg-neon-cyan/40 transition-all" />
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-bg-subtle border border-border flex items-center justify-center text-3xl mb-8 group-hover:scale-110 group-hover:border-neon-cyan/50 transition-all duration-500">
                  {f.icon}
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-text-primary mb-4 group-hover:text-neon-cyan transition-colors duration-300 tracking-tight">
                  {f.title}
                </h3>
                <p className="text-text-secondary text-base md:text-lg leading-relaxed max-w-lg">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChoose;
