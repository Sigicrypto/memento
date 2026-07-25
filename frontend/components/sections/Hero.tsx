"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Play, ArrowRight } from 'lucide-react';

interface HeroProps {
  setIsDemoOpen: (open: boolean) => void;
}

const Hero: React.FC<HeroProps> = ({ setIsDemoOpen }) => {
  return (
    <section className="relative overflow-hidden" style={{ paddingTop: '160px', paddingBottom: '120px' }}>
      <div className="container mx-auto px-6 relative z-10 flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-3xl"
        >
          <h1 className="display-text mb-6">
            Collect Every Moment.
            <br />
            <span className="hero-title-accent text-gradient">Instantly. Effortlessly.</span>
          </h1>
          <p className="text-lg text-text-secondary mb-10 max-w-xl mx-auto leading-relaxed">
            The minimal QR-based photo sharing platform for modern events. No apps required, zero hassle. A premium experience for your guests.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => setIsDemoOpen(true)}
              className="btn btn-primary px-8 py-3 group"
            >
              <span>Watch Demo Wall</span>
              <Play size={16} className="fill-current group-hover:translate-x-0.5 transition-transform" />
            </button>
            <button className="btn btn-ghost px-8 py-3 group">
              How it works <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </motion.div>

        {/* Hero Visuals - High-Fidelity App Window Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="mt-20 relative w-full max-w-4xl mx-auto"
        >
          <div className="card p-2 rounded-2xl overflow-hidden shadow-2xl bg-bg-subtle border border-border">
            <div className="h-10 border-b border-border flex items-center px-4 gap-2 bg-surface">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-border" />
                <div className="w-2.5 h-2.5 rounded-full bg-border" />
                <div className="w-2.5 h-2.5 rounded-full bg-border" />
              </div>
              <div className="mx-auto w-48 h-5 bg-bg-subtle border border-border rounded-md flex items-center justify-center">
                <span className="text-[9px] text-text-muted font-medium font-mono">memento.live/demo</span>
              </div>
            </div>
            <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4 bg-bg">
              {[
                { name: "Alex K.", color: "from-pink-500/20 via-rose-500/25 to-zinc-900/10", likes: 12 },
                { name: "Jessica M.", color: "from-blue-600/20 via-indigo-500/25 to-zinc-900/10", likes: 8 },
                { name: "Ryan T.", color: "from-amber-400/20 via-orange-500/25 to-zinc-900/10", likes: 15 },
                { name: "Emma W.", color: "from-emerald-400/20 via-teal-500/25 to-zinc-900/10", likes: 21 },
                { name: "Michael S.", color: "from-violet-500/20 via-purple-600/25 to-zinc-900/10", likes: 4 },
                { name: "Sarah L.", color: "from-fuchsia-500/20 via-pink-600/25 to-zinc-900/10", likes: 19 },
                { name: "David P.", color: "from-cyan-500/20 via-blue-500/25 to-zinc-900/10", likes: 11 },
                { name: "Chloe B.", color: "from-rose-400/20 via-orange-400/25 to-zinc-900/10", likes: 14 }
              ].map((card, i) => (
                <div key={i} className="aspect-[4/5] bg-surface border border-border rounded-xl overflow-hidden relative group transition-all duration-300 hover:border-border-hover">
                   <div className={`w-full h-full bg-gradient-to-tr ${card.color} group-hover:scale-105 transition-transform duration-700`} />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-80" />
                   <div className="absolute bottom-2.5 left-2.5 right-2.5 flex justify-between items-center z-10">
                     <span className="text-[10px] font-medium text-white/90">{card.name}</span>
                     <span className="text-[10px] text-white/80 flex items-center gap-0.5 font-medium">♥ {card.likes}</span>
                   </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
