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
            className="flex flex-col md:flex-row justify-between items-center gap-8"
          >
            <div className="flex items-center gap-3 opacity-80 hover:opacity-100 transition-opacity duration-300">
              <div className="w-12 h-12 grayscale opacity-50 flex items-center justify-center overflow-hidden">
                <AnimatedLogo width={48} height={48} />
              </div>
              <span className="text-2xl font-black text-text-primary tracking-tight">Memento</span>
            </div>

            <div className="flex gap-6 md:gap-8 flex-wrap justify-center items-center">
              <button
                type="button"
                onClick={() => setIsPartnerModalOpen(true)}
                className="text-sm font-bold text-emerald-400 hover:text-emerald-300 transition-colors duration-300"
              >
                Partner Program (10% Comm.)
              </button>
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

            <div className="text-sm text-text-muted text-center md:text-right">
              © {new Date().getFullYear()} Memento. All rights reserved.
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
