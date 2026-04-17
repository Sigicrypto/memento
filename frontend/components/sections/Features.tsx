"use client";

import React from 'react';
import { motion } from 'framer-motion';

const Features: React.FC = () => {
  return (
    <section id="features" className="sec py-16">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, type: 'spring', stiffness: 100, damping: 15 }}
          className="text-center mb-16"
        >
          <span className="hero-badge mb-4">Core Features</span>
          <h2 className="sec-h2 text-4xl md:text-5xl font-bold mb-4">
            The Best Experience. <span className="gradient-text-vibrant italic">Built in.</span>
          </h2>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
          }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {[
            { icon: '✨', title: 'Selfie-Safe Matching', desc: 'The ultimate privacy feature. Guests scan their face to instantly find and download only their photos—no manual searching required.', big: true },
            { icon: '📺', title: 'Live Slideshow', desc: 'Auto-plays on any screen. Cast to TV or projector for a stunning real-time display.' },
            { icon: '📷', title: 'Mirror Grid & Album', desc: 'Beautiful high-res photo gallery with automated albums and grid views.' },
            { icon: '🔒', title: 'Private Walls', desc: 'Password-protect your memory wall. Full moderation allows you to approve every shot before it goes live.' },
            { icon: '📱', title: 'Zero Friction', desc: 'No apps. No accounts. No logins. Just scan a QR and start sharing within 3 seconds.' },
            { icon: '🛡️', title: 'Safety & Moderation', desc: 'Control your event. Remove or approve photos with one tap to keep the energy positive.' },
          ].map((f, i) => (
            <motion.div 
              key={i} 
              className={`gcard feat-card flex flex-col p-8 rounded-3xl bg-surface/40 backdrop-blur-xl border border-white/10 ${f.big ? 'lg:col-span-2' : ''}`}
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 15 } }
              }}
              whileHover={{ scale: 1.03, y: -5 }}
            >
              <div className="gcard-inner flex flex-col h-full">
                <span className="text-4xl mb-6">{f.icon}</span>
                <h3 className="text-2xl font-bold text-white mb-4">{f.title}</h3>
                <p className="text-slate-400 text-lg leading-relaxed">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Features;
