"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Corners from '@/components/Corners';

const Features: React.FC = () => {
  return (
    <section id="features" className="py-24 relative overflow-hidden scroll-mt-32">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-16"
        >
          <div className="hero-badge mb-6">
            Everything you need
          </div>
          <h2 className="h2-text mb-4 text-text-primary">
            The Best Experience. Built in.
          </h2>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
          }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {[
            { icon: '✨', title: 'Selfie-Safe Matching', desc: 'The ultimate privacy feature. Guests scan their face to instantly find and download only their photos—no manual searching required.', className: 'md:col-span-2 md:row-span-2' },
            { icon: '📺', title: 'Live Slideshow', desc: 'Auto-plays on any screen. Cast to TV or projector.', className: 'md:col-span-1' },
            { icon: '📷', title: 'Mirror Grid', desc: 'Beautiful high-res photo gallery views.', className: 'md:col-span-1' },
            { icon: '🔒', title: 'Private Walls', desc: 'Password-protect your memory wall. Full moderation allows you to approve every shot.', className: 'md:col-span-2' },
            { icon: '📱', title: 'Zero Friction', desc: 'No apps. No accounts. No logins. Just scan a QR.', className: 'md:col-span-1' },
          ].map((f, i) => (
            <motion.div
              key={i}
              className={`viewfinder group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-surface border border-border p-6 hover:border-accent-cyan/50 transition-all duration-300 shadow-card hover:shadow-card-hover ${f.className}`}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-accent-cyan/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <Corners />
              
              <div className="relative z-10 flex flex-col h-full">
                <div className="w-12 h-12 rounded-xl bg-bg border border-border flex items-center justify-center text-2xl mb-6 shadow-sm group-hover:scale-110 group-hover:border-accent-cyan/30 transition-all duration-300">
                  {f.icon}
                </div>
                <div className="mt-auto">
                  <h3 className="text-lg font-bold text-text-primary mb-2 tracking-tight">{f.title}</h3>
                  <p className="text-text-secondary text-sm leading-relaxed">{f.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Features;
