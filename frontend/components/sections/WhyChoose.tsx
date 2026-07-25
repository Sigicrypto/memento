"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Corners from '@/components/Corners';

const WhyChoose: React.FC = () => {
  return (
    <section id="why" className="py-24 relative overflow-hidden">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-20"
        >
          <div className="hud-chip mb-6">Use Cases</div>
          <h2 className="h1-text mb-6">
            Capture what matters. <span className="hero-title-accent">Instantly.</span>
          </h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            From intimate weddings to grand festivals, Memento turns every guest into a contributor, creating a shared memory that lasts forever.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: '🎉', title: 'Weddings', desc: 'From the first look to the last dance, every guest becomes part of your story.', big: true },
            { icon: '🎂', title: 'Parties', desc: 'No more chasing friends for photos. Get them all at once in a beautiful live gallery.' },
            { icon: '🏢', title: 'Corporate', desc: 'Real-time interaction on any screen. Perfect for networking and engagement.' },
            { icon: '👰', title: 'Anniversaries', desc: 'Celebrate the journey. Let every generation share their memories with one click.' },
            { icon: '🎈', title: 'Festivals', desc: 'Capture the scale and energy of the crowd. Crowdsourced memories that look professional.' },
          ].map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className={`viewfinder gcard gcard-accent flex flex-col items-start group ${f.big ? 'lg:col-span-2' : ''}`}
            >
              <Corners />
              <div className="w-14 h-14 rounded-2xl bg-bg-subtle border border-border flex items-center justify-center text-3xl mb-8 group-hover:scale-110 group-hover:border-border-hover transition-all">
                {f.icon}
              </div>
              <h3 className="text-2xl font-bold text-text-primary mb-4">{f.title}</h3>
              <p className="text-text-secondary text-lg leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChoose;
