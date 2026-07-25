"use client";
 
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Home, Sparkles } from 'lucide-react';
 
export default function NotFound() {
  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center p-6 text-center">
      <div className="grain" />
      <div className="orbs"><div className="orb orb-primary" /><div className="orb orb-secondary" /></div>
 
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 space-y-8"
      >
        <div className="relative inline-block">
           <h1 className="text-[10rem] md:text-[15rem] font-bold leading-none opacity-5 select-none">404</h1>
           <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-2xl shadow-primary/20">
                 <Sparkles size={48} />
              </div>
           </div>
        </div>
 
        <div className="space-y-4">
           <p className="text-primary text-[10px] font-black uppercase tracking-[.4em]">MISSING MOMENT</p>
           <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Lost in Space</h2>
           <p className="text-text-secondary text-lg max-w-md mx-auto">This page has vanished into the constellations. Let's get you back to safety.</p>
        </div>
 
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
           <Link href="/" className="btn-premium !px-10 !py-4 flex items-center gap-3">
              <Home size={18} /> Back to Homepage
           </Link>
           <button onClick={() => window.history.back()} className="px-8 py-4 rounded-xl bg-bg-subtle border border-border hover:bg-border transition-all font-bold text-xs uppercase tracking-widest flex items-center gap-2">
              <ArrowLeft size={16} /> Previous View
           </button>
        </div>
      </motion.div>
 
      <div className="mt-20 opacity-20 text-[10px] font-black uppercase tracking-[.3em] text-text-muted">
         MEMENTO PLATFORM INFRASTRUCTURE
      </div>
    </div>
  );
}
