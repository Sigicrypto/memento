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
            <span className="hero-title-accent">Instantly. Effortlessly.</span>
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

        {/* Hero Visuals - Minimal App Window Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="mt-20 relative w-full max-w-4xl mx-auto"
        >
          <div className="gcard p-2 rounded-2xl overflow-hidden shadow-2xl bg-bg-subtle">
            <div className="h-10 border-b border-border flex items-center px-4 gap-2 bg-surface">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-border" />
                <div className="w-3 h-3 rounded-full bg-border" />
                <div className="w-3 h-3 rounded-full bg-border" />
              </div>
              <div className="mx-auto w-48 h-5 bg-border rounded-md opacity-50" />
            </div>
            <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4 bg-bg">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <div key={i} className="aspect-square bg-bg-subtle border border-border rounded-xl overflow-hidden">
                   <div className="w-full h-full bg-border opacity-20 animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
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
