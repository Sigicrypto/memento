"use client";

import React from 'react';
import Link from 'next/link';
import AnimatedLogo from '@/components/AnimatedLogo'; // Using the project's existing animated logo instead of the image

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#0e0e0e] w-full py-12 border-t border-white/10 mt-24 relative z-10">
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2 opacity-80 hover:opacity-100 transition-opacity">
          {/* We use the app's existing logo instead of the external image link */}
          <div className="w-8 h-8 grayscale opacity-50 flex items-center justify-center overflow-hidden">
             <AnimatedLogo width={32} height={32} />
          </div>
          <span className="text-xl font-black text-white">Memento</span>
        </div>
        
        <div className="flex gap-8 flex-wrap justify-center">
          <Link href="/privacy" className="text-sm text-white/60 hover:text-neon-cyan transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="text-sm text-white/60 hover:text-neon-cyan transition-colors">Terms of Service</Link>
          <Link href="#" className="text-sm text-white/60 hover:text-neon-cyan transition-colors">Security</Link>
          <Link href="#" className="text-sm text-white/60 hover:text-neon-cyan transition-colors">Status</Link>
        </div>
        
        <div className="text-sm text-white/60">
          © {new Date().getFullYear()} Memento. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
