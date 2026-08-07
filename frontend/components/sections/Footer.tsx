"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import AnimatedLogo from '@/components/AnimatedLogo';
import PartnerProgramModal from '@/components/PartnerProgramModal';

const Footer: React.FC = () => {
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);

  return (
    <>
      <footer id="contact" className="w-full py-12 md:py-16 border-t border-border scroll-mt-32 relative z-10">
        <div className="section-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="flex flex-col gap-10"
          >
            {/* Dedicated Partner Program Banner */}
            <div className="p-6 md:p-8 rounded-3xl bg-slate-900/90 border border-emerald-500/30 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden">
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
              <div className="flex items-center gap-4 text-left">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 shadow-lg">
                  <span className="text-xl">🤝</span>
                </div>
                <div>
                  <h4 className="text-base sm:text-lg font-black text-white tracking-tight">Memento Event Partner Program</h4>
                  <p className="text-xs sm:text-sm text-slate-300">Earn a 10% cash payout on every event booked using your unique partner ID.</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsPartnerModalOpen(true)}
                className="w-full md:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95 shrink-0"
              >
                Earn 10% Commission ↗
              </button>
            </div>

            {/* Links and Copyright Row */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-3 opacity-80 hover:opacity-100 transition-opacity duration-300">
                <div className="w-10 h-10 grayscale opacity-50 flex items-center justify-center overflow-hidden">
                  <AnimatedLogo width={40} height={40} />
                </div>
                <span className="text-xl font-black text-text-primary tracking-tight">Memento</span>
              </div>

              <div className="flex gap-6 md:gap-8 flex-wrap justify-center items-center">
                <Link href="/privacy" className="text-sm text-text-secondary hover:text-neon-cyan transition-colors duration-300">
                  Privacy Policy
                </Link>
                <Link href="/terms" className="text-sm text-text-secondary hover:text-neon-cyan transition-colors duration-300">
                  Terms of Service
                </Link>
                <a href="https://www.facebook.com/1270689629459999" target="_blank" rel="noopener noreferrer" className="text-sm text-text-secondary hover:text-neon-cyan transition-colors duration-300">
                  Facebook
                </a>
                <a href="https://www.instagram.com/my_memento_app" target="_blank" rel="noopener noreferrer" className="text-sm text-text-secondary hover:text-neon-cyan transition-colors duration-300">
                  Instagram
                </a>
                <a href="https://wa.me/919866161775" target="_blank" rel="noopener noreferrer" className="text-sm text-text-secondary hover:text-neon-cyan transition-colors duration-300">
                  Contact
                </a>
              </div>

              <div className="text-xs text-text-muted text-center md:text-right">
                © {new Date().getFullYear()} Memento. All rights reserved.
              </div>
            </div>
          </motion.div>
        </div>
      </footer>

      <PartnerProgramModal
        isOpen={isPartnerModalOpen}
        onClose={() => setIsPartnerModalOpen(false)}
      />
    </>
  );
};

export default Footer;
