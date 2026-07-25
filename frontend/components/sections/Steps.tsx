"use client";

import React from 'react';
import { motion } from 'framer-motion';

const Steps: React.FC = () => {
  return (
    <section id="howitworks" className="py-24 relative overflow-hidden scroll-mt-32">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-20"
        >
          <div className="hero-badge mb-6">
            Process
          </div>
          <h2 className="h1-text mb-6">
            Three steps. That&apos;s it.
          </h2>
          <p className="text-lg text-text-secondary">No downloads. No accounts. No friction.</p>
        </motion.div>
 
        <div className="relative">
          {/* Connecting Line (Desktop) */}
          <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/5 to-transparent hidden lg:block" />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
            {[
              { num: '01', icon: '🎉', title: 'Create Your Event', desc: 'Name it and get a shareable QR code in under a minute.' },
              { num: '02', icon: '📲', title: 'Guests Scan & Share', desc: 'No app. No login. Just scan the QR and upload photos instantly.' },
              { num: '03', icon: '✨', title: 'Watch It Come Alive', desc: 'Every photo streams live into a beautiful gallery for everyone.' },
            ].map((s, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="gcard group"
              >
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-8">
                    <span className="text-sm font-semibold text-text-muted">STEP {s.num}</span>
                    <span className="text-3xl group-hover:scale-105 transition-transform duration-300">{s.icon}</span>
                  </div>
                  <h3 className="text-xl font-semibold text-text-primary mb-2">{s.title}</h3>
                  <p className="text-text-secondary leading-relaxed">{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Steps;
