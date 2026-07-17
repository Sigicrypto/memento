"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Play, ArrowRight } from 'lucide-react';

interface HeroProps {
  setIsDemoOpen: (open: boolean) => void;
}

const Hero: React.FC<HeroProps> = ({ setIsDemoOpen }) => {
  return (
    <section className="relative pt-44 pb-20 md:pt-64 md:pb-32 overflow-hidden">
      {/* Ambient Orbs */}
      <div className="orbs">
        <div className="orb orb-primary" />
        <div className="orb orb-secondary" />
      </div>

      <div className="container mx-auto px-6 relative z-10 flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-4xl"
        >
          <h1 className="display-text mb-6">
            Collect Every Moment.
            <br />
            <span className="text-secondary">Instantly. Effortlessly.</span>
          </h1>
          <p className="text-xl text-text-secondary mb-10 max-w-2xl mx-auto leading-relaxed">
            Leading QR-based photo sharing for weddings, celebrations, and corporate events. One-time payment, zero hassle. Premium experience for your guests.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => setIsDemoOpen(true)}
              className="btn-premium flex items-center gap-2 group"
            >
              <span>Watch Demo Wall</span>
              <Play size={18} className="fill-current group-hover:translate-x-0.5 transition-transform" />
            </button>
            <button className="px-8 py-4 text-white font-semibold flex items-center gap-2 hover:text-primary transition-colors">
              How it works <ArrowRight size={18} />
            </button>
          </div>
        </motion.div>

        {/* Hero Visuals */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="mt-20 relative w-full max-w-5xl mx-auto"
        >
          {/* Floating Polaroids */}
          <div className="absolute hidden lg:block left-0 top-20 rotate-[-12deg] z-20 -translate-x-1/2">
            <div className="gcard p-2 bg-white pb-10 w-48 shadow-2xl">
              <img src="/landing-hero/photo2.jpg" alt="Memory" className="w-full aspect-square object-cover rounded-sm mb-3" />
              <div className="h-2 w-2/3 bg-zinc-100 rounded-full mx-auto" />
            </div>
          </div>
          <div className="absolute hidden lg:block right-0 top-0 rotate-[8deg] z-20 translate-x-1/2">
            <div className="gcard p-2 bg-white pb-10 w-48 shadow-2xl">
              <img src="/landing-hero/photo6.jpg" alt="Memory" className="w-full aspect-square object-cover rounded-sm mb-3" />
              <div className="h-2 w-1/2 bg-zinc-100 rounded-full mx-auto" />
            </div>
          </div>

          <div className="flex items-center justify-center gap-6 lg:gap-12 scale-[0.9] md:scale-100">
            {/* Left Phone */}
            <div className="hidden md:block w-[280px] flex-shrink-0 h-[580px] rounded-[3rem] border-[8px] border-zinc-800 bg-zinc-900 overflow-hidden shadow-2xl transform rotate-[-6deg] translate-y-12">
              <div className="h-full flex flex-col p-4">
                <div className="flex justify-between items-center mb-6 pt-4">
                  <div className="h-6 w-20 bg-white/10 rounded-full" />
                  <div className="h-6 w-6 bg-white/10 rounded-full" />
                </div>
                <div className="grid grid-cols-2 gap-2 flex-grow overflow-hidden">
                  {[1,2,3,4,5,6].map(i => (
                    <div key={i} className="aspect-square bg-white/5 rounded-xl border border-white/10 animate-pulse" />
                  ))}
                </div>
                <div className="mt-4 h-12 w-full bg-primary/20 rounded-xl flex items-center justify-center text-primary text-xs font-bold tracking-widest border border-primary/20">
                  UPLOADING...
                </div>
              </div>
            </div>

            {/* Main Phone (Wall View) */}
            <div className="w-[300px] flex-shrink-0 h-[620px] rounded-[3rem] border-[8px] border-zinc-800 bg-black overflow-hidden shadow-[0_0_100px_rgba(99,102,241,0.2)] z-10">
              <div className="h-full flex flex-col">
                 <div className="h-14 bg-zinc-900/50 backdrop-blur-md flex items-center justify-between px-6 border-b border-white/5">
                   <div className="w-3 h-3 rounded-full bg-secondary" />
                   <div className="h-4 w-24 bg-white/10 rounded-full" />
                 </div>
                 <div className="flex-grow p-4 grid grid-cols-2 gap-3 overflow-hidden">
                    {[1,2,3,4,5,6,7,8].map(i => (
                      <div key={i} className="aspect-square bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                        <img src={`/landing-hero/photo${i+4}.jpg`} className="w-full h-full object-cover opacity-60" alt="" />
                      </div>
                    ))}
                 </div>
              </div>
            </div>

            {/* Right Phone */}
            <div className="hidden lg:block w-[280px] flex-shrink-0 h-[580px] rounded-[3rem] border-[8px] border-zinc-800 bg-zinc-900 overflow-hidden shadow-2xl transform rotate-[6deg] translate-y-12">
               <div className="h-full flex flex-col p-8 items-center justify-center">
                  <div className="w-full aspect-square bg-white rounded-2xl p-4 mb-6 shadow-xl">
                    <div className="w-full h-full bg-zinc-100 rounded-lg flex items-center justify-center">
                      <div className="w-2/3 h-2/3 border-4 border-zinc-300 border-dashed rounded-xl" />
                    </div>
                  </div>
                  <div className="h-4 w-2/3 bg-white/10 rounded-full mb-2" />
                  <div className="h-3 w-1/2 bg-white/5 rounded-full" />
               </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
