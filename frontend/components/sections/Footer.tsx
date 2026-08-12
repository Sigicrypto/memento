"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import AnimatedLogo from '@/components/AnimatedLogo';
import PartnerProgramModal from '@/components/PartnerProgramModal';

const FacebookIcon = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
  </svg>
);

const InstagramIcon = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

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
                
                <div className="flex items-center gap-4 ml-4 pl-4 border-l border-white/10">
                  <a href="https://www.facebook.com/1270689629459999" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-slate-900 border border-white/10 text-slate-400 hover:text-blue-500 hover:border-blue-500/50 hover:bg-blue-500/10 transition-all shadow-lg hover:-translate-y-1" aria-label="Facebook">
                    <FacebookIcon size={18} />
                  </a>
                  <a href="https://www.instagram.com/my_memento_app" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-slate-900 border border-white/10 text-slate-400 hover:text-pink-500 hover:border-pink-500/50 hover:bg-pink-500/10 transition-all shadow-lg hover:-translate-y-1" aria-label="Instagram">
                    <InstagramIcon size={18} />
                  </a>
                  <a href="https://wa.me/919866161775" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-slate-900 border border-white/10 text-slate-400 hover:text-emerald-500 hover:border-emerald-500/50 hover:bg-emerald-500/10 transition-all shadow-lg hover:-translate-y-1" aria-label="WhatsApp">
                    <MessageCircle size={18} />
                  </a>
                </div>
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
