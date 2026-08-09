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
      <footer id="contact" className="w-full py-12 md:py-16 border-t border-white/10 relative z-10 bg-slate-950 flex flex-col items-center">
        <div className="w-full max-w-6xl mx-auto px-4 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="flex flex-col gap-10"
          >
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
