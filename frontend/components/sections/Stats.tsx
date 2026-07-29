"use client";

import React from 'react';
import { motion } from 'framer-motion';

const Stats: React.FC = () => {
  return (
    <section className="py-16 md:py-24 border-y border-white/5 bg-[#0e0e0e]/50 backdrop-blur-sm relative z-20">
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-around items-center gap-12 md:gap-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <p className="text-5xl md:text-6xl font-bold text-neon-cyan glow-text-cyan mb-2">10k+</p>
          <p className="text-sm font-medium text-white/60 uppercase tracking-widest">Events Hosted</p>
        </motion.div>
        
        <div className="hidden md:block w-px h-16 bg-white/10"></div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center"
        >
          <p className="text-5xl md:text-6xl font-bold text-neon-magenta mb-2" style={{ textShadow: '0 0 10px rgba(255, 0, 255, 0.7)' }}>2M+</p>
          <p className="text-sm font-medium text-white/60 uppercase tracking-widest">Photos Shared</p>
        </motion.div>
        
        <div className="hidden md:block w-px h-16 bg-white/10"></div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center"
        >
          <p className="text-5xl md:text-6xl font-bold text-neon-purple mb-2" style={{ textShadow: '0 0 10px rgba(157, 78, 221, 0.7)' }}>99.9%</p>
          <p className="text-sm font-medium text-white/60 uppercase tracking-widest">Uptime Sync</p>
        </motion.div>
      </div>
    </section>
  );
};

export default Stats;
