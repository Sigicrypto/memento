"use client";

import React from 'react';
import { motion } from 'framer-motion';

const Stats: React.FC = () => {
  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-6">
        <div className="premium-stats bg-white/5 backdrop-blur-sm border border-white/5 rounded-[2rem] p-8 md:p-12">
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
              className="premium-stat"
            >
              <div className="stat-value">{s.val}</div>
              <div className="stat-label">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;
