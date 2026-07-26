"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Corners from '@/components/Corners';

const Stats: React.FC = () => {
  return (
    <section className="py-24 relative">
      <div className="container">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-surface/70 backdrop-blur-2xl border border-border px-8 md:px-16 py-12 shadow-xl max-w-6xl mx-auto">
          <div className="absolute inset-0 bg-gradient-to-r from-accent-cyan/5 via-transparent to-accent-cyan/5 opacity-50" />
          <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-border">
            {[
              { val: '∞', label: 'Photos per wall' },
              { val: '0s', label: 'App install time' },
              { val: '<3s', label: 'Upload speed' },
              { val: '0', label: 'Hidden fees' },
            ].map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col items-center justify-center text-center px-4 group"
              >
                <div className="text-4xl md:text-5xl font-bold text-text-primary mb-2 group-hover:scale-110 group-hover:text-accent-cyan transition-all duration-300">{s.val}</div>
                <div className="text-text-secondary font-medium text-sm md:text-base uppercase tracking-widest">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Stats;
