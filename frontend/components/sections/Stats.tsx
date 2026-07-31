"use client";

import React from 'react';
import { motion } from 'framer-motion';

const Stats: React.FC = () => {
  const stats = [
    { value: '10k+', label: 'Events Hosted', color: 'text-neon-cyan', glow: '0 0 20px rgba(0, 255, 255, 0.7)' },
    { value: '2M+', label: 'Photos Shared', color: 'text-neon-magenta', glow: '0 0 20px rgba(255, 0, 255, 0.7)' },
    { value: '99.9%', label: 'Uptime Sync', color: 'text-neon-purple', glow: '0 0 20px rgba(157, 78, 221, 0.7)' },
  ];

  return (
    <section className="lp-section z-20">
      <div className="section-container">
        <div className="p-10 md:p-14">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-6">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                className="text-center relative md:px-6"
              >
                {i > 0 && (
                  <div className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2 w-px h-16 bg-white/10" />
                )}
                <p
                  className={`text-5xl md:text-6xl font-black ${stat.color} mb-2 tracking-tighter`}
                  style={{ textShadow: stat.glow }}
                >
                  {stat.value}
                </p>
                <p className="text-xs font-bold text-white/50 uppercase tracking-[0.2em]">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Stats;
