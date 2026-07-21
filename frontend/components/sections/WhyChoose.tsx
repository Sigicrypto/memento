"use client";

import React from 'react';
import { motion } from 'framer-motion';

const WhyChoose: React.FC = () => {
  return (
    <section id="why" className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-widest uppercase mb-6">
            Use Cases
          </div>
          <h2 className="h1-text mb-6">
            Capture what matters. <span className="text-secondary">Instantly.</span>
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
              className={`gcard flex flex-col items-start ${f.big ? 'lg:col-span-2' : ''}`}
            >
              <div className="w-14 h-14 rounded-2xl bg-white/5 border border-black/20 dark:border-black/10 dark:border-white/10 flex items-center justify-center text-3xl mb-8 group-hover:scale-110 transition-transform">
                {f.icon}
              </div>
              <h3 className="text-2xl font-bold text-black dark:text-white mb-4">{f.title}</h3>
              <p className="text-text-secondary text-lg leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChoose;
