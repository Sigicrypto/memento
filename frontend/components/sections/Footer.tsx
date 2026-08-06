"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import AnimatedLogo from '@/components/AnimatedLogo';

const Footer: React.FC = () => {
  return (
    <footer id="contact" className="w-full py-12 md:py-16 border-t border-white/10 scroll-mt-32 relative z-10">
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
            <span className="text-2xl font-black text-white tracking-tight">Memento</span>
          </div>

          <div className="flex gap-6 md:gap-8 flex-wrap justify-center">
            <Link href="/privacy" className="text-sm text-white/50 hover:text-neon-cyan transition-colors duration-300">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-sm text-white/50 hover:text-neon-cyan transition-colors duration-300">
              Terms of Service
            </Link>
            <a href="https://wa.me/919866161775" target="_blank" rel="noopener noreferrer" className="text-sm text-white/50 hover:text-neon-cyan transition-colors duration-300">
              Contact
            </a>
          </div>

          <div className="text-sm text-white/40 text-center md:text-right">
            © {new Date().getFullYear()} Memento. All rights reserved.
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
