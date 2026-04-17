"use client";

import React from 'react';
import { motion } from 'framer-motion';

const Stats: React.FC = () => {
  return (
    <section className="stats py-16">
      <div className="container mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="flex flex-wrap justify-center gap-8 md:gap-16"
        >
          {[
            { val: '∞', label: 'Photos per wall' },
            { val: '0s', label: 'App install time' },
            { val: '<3s', label: 'Upload speed' },
            { val: '0', label: 'Hidden fees' },
          ].map((s, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1, ease: 'backOut' }}
              className="stat group cursor-default"
            >
              <span className="stat-val group-hover:scale-110 transition-transform duration-300 inline-block text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent">{s.val}</span>
              <span className="stat-lbl text-sm opacity-70 group-hover:opacity-100 transition-opacity block mt-2 text-slate-400">{s.label}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Stats;
