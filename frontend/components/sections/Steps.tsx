"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Corners from '@/components/Corners';

const Steps: React.FC = () => {
  return (
    <section id="howitworks" className="py-24 relative overflow-hidden scroll-mt-32">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-20 relative z-10"
        >
          <div className="hero-badge mb-6 backdrop-blur-md bg-white/5 border-white/10">
            Process
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 text-white">
            Three steps. That&apos;s it.
          </h2>
          <p className="text-lg text-zinc-400 font-medium max-w-2xl mx-auto">No downloads. No accounts. No friction.</p>
        </motion.div>

        <div className="relative max-w-6xl mx-auto">
          {/* Connecting Line (Desktop) */}
          <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-accent-cyan/30 to-transparent hidden lg:block" />
          {/* Animated glowing beam along the line */}
          <div className="absolute top-1/2 left-0 w-full h-px hidden lg:block overflow-hidden">
            <div className="w-1/3 h-full bg-gradient-to-r from-transparent via-accent-cyan to-transparent animate-shimmer" />
          </div>

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
                className="group relative overflow-hidden rounded-3xl bg-surface/40 backdrop-blur-xl border border-white/10 p-8 hover:bg-surface/60 hover:border-white/20 transition-all duration-500 shadow-2xl flex flex-col items-center text-center"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-accent-cyan/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="relative z-10 w-full">
                  <div className="flex flex-col items-center justify-center mb-8">
                    <span className="font-mono-ui text-sm font-bold text-accent-cyan tracking-widest mb-4">STEP {s.num}</span>
                    <div className="w-16 h-16 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center text-3xl shadow-[0_0_15px_rgba(255,255,255,0.05)] group-hover:scale-110 group-hover:shadow-[0_0_25px_rgba(255,255,255,0.15)] transition-all duration-500">
                      {s.icon}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3 tracking-tight">{s.title}</h3>
                  <p className="text-zinc-400 font-medium leading-relaxed">{s.desc}</p>
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
