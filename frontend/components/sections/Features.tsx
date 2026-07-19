"use client";

import React from 'react';
import { motion } from 'framer-motion';

const Features: React.FC = () => {
  return (
    <section id="features" className="py-24 relative overflow-hidden scroll-mt-32">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-widest uppercase mb-6">
            Everything you need
          </div>
          <h2 className="h1-text mb-6">
            The Best Experience. <span className="text-secondary italic">Built in.</span>
          </h2>
        </motion.div>
 
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
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
              className={`gcard h-full flex flex-col items-start ${f.big ? 'lg:col-span-2' : ''}`}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
              }}
            >
              <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-3xl mb-8 group-hover:scale-110 transition-transform">
                {f.icon}
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">{f.title}</h3>
              <p className="text-text-secondary text-lg leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Features;
