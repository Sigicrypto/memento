"use client";

import React from 'react';
import { motion } from 'framer-motion';

const Steps: React.FC = () => {
  return (
    <section id="how" className="sec py-24">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, type: 'spring', stiffness: 100, damping: 15 }}
          className="text-center mb-16"
        >
          <span className="hero-badge mb-4">How it works</span>
          <h2 className="sec-h2 text-4xl md:text-5xl font-bold mb-4">
            Three steps. <span className="gradient-text-vibrant italic">That&apos;s it.</span>
          </h2>
          <p className="sec-sub text-lg text-slate-400">No downloads. No accounts. No friction.</p>
        </motion.div>

        <div className="relative">
          {/* Connecting Line (Desktop) */}
          <motion.div 
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, delay: 0.5, ease: "easeInOut" }}
            className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent hidden lg:block" 
          />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
            {[
              { num: '01', icon: '🎉', title: 'Create Your Event', desc: 'Name it and get a shareable QR code in under a minute.' },
              { num: '02', icon: '📲', title: 'Guests Scan & Share', desc: 'No app. No login. Just scan the QR and upload photos instantly.' },
              { num: '03', icon: '✨', title: 'Watch It Come Alive', desc: 'Every photo streams live into a beautiful gallery for everyone.' },
            ].map((s, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.2, ease: "easeOut" }}
                whileHover={{ scale: 1.05 }}
                className="gcard step-card p-8 rounded-3xl bg-surface/40 backdrop-blur-xl border border-white/10 relative overflow-hidden group"
              >
                <div className="gcard-inner relative z-10">
                  <span className="text-sm font-black text-primary/50 mb-4 block tracking-widest">{s.num}</span>
                  <span className="text-5xl mb-6 block group-hover:scale-110 transition-transform duration-300">{s.icon}</span>
                  <h3 className="text-2xl font-bold text-white mb-4">{s.title}</h3>
                  <p className="text-slate-400 leading-relaxed">{s.desc}</p>
                </div>
                {/* Decorative glow */}
                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-primary/10 blur-[50px] rounded-full group-hover:bg-primary/20 transition-colors" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Steps;
