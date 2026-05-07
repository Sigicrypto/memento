"use client";
 
import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';
import { Clock, ShieldCheck, Mail, ArrowLeft, Sparkles, Layout } from 'lucide-react';
 
export default function PendingApproval() {
  const { user, isApproved, isLoading } = useAuth();
  const router = useRouter();
 
  useEffect(() => {
    if (!isLoading && user && isApproved) {
      router.push('/dashboard');
    }
  }, [isLoading, user, isApproved, router]);
 
  if (isLoading) return (
    <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
      <div className="orbs"><div className="orb orb-primary" /><div className="orb orb-secondary" /></div>
      <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin relative z-10" />
    </div>
  );
 
  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden flex flex-col items-center justify-center p-6">
      <div className="grain" />
      <div className="orbs"><div className="orb orb-primary" /><div className="orb orb-secondary" /></div>
 
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 w-full max-w-xl text-center"
      >
        <div className="mb-12">
           <Link href="/" className="text-3xl font-bold tracking-tighter hover:opacity-80 transition-opacity">memento</Link>
        </div>
 
        <div className="glass-panel p-10 md:p-16 space-y-8 relative overflow-hidden">
           <div className="absolute top-0 right-0 p-10 opacity-5 scale-150 rotate-12">
              <ShieldCheck size={180} />
           </div>
 
           <div className="relative z-10">
              <div className="w-20 h-20 rounded-3xl bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary mx-auto mb-8 shadow-2xl shadow-secondary/10">
                 <Clock size={40} className="animate-pulse" />
              </div>
 
              <p className="text-secondary text-[10px] font-black uppercase tracking-[.4em] mb-4">MEMBER VERIFICATION</p>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 leading-tight">Your Account is <br/><span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-white/40">Under Review</span></h1>
              
              <p className="text-text-secondary text-lg leading-relaxed max-w-md mx-auto mb-10">
                Welcome to Memento! To ensure the highest quality of service and privacy, our team manually verifies all new accounts.
              </p>
 
              <div className="space-y-4">
                 <div className="flex items-center gap-4 justify-center p-4 rounded-2xl bg-white/5 border border-white/10 text-sm font-medium text-text-muted">
                    <Mail size={18} className="text-primary" />
                    We'll email you at <span className="text-white">{user?.email}</span>
                 </div>
                 <Link href="/" className="btn-premium w-full !py-4 flex items-center justify-center gap-3">
                    <ArrowLeft size={18} /> Return to Homepage
                 </Link>
              </div>
           </div>
        </div>
 
        <div className="mt-12 flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-[.3em] text-text-muted opacity-40">
           <Sparkles size={12} /> memento platform v1.0
        </div>
      </motion.div>
    </div>
  );
}
