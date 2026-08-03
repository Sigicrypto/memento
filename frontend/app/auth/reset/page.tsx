"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowLeft, Loader2, Check, ShieldCheck, KeyRound } from 'lucide-react';
import { AuroraBackground } from '@/components/ui/aurora-background';

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://memento-sigicryptos-projects.vercel.app';
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${baseUrl}/auth/update-password`,
      });

      if (error) {
        setError(error.message);
      } else {
        setMessage('Check your email for a password reset link!');
        setTimeout(() => router.push('/auth'), 3000);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-6 relative bg-bg">
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
         <AuroraBackground className="opacity-40 dark:opacity-80" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-xl rounded-3xl bg-surface/70 backdrop-blur-xl border border-border px-8 py-16 md:px-20 md:py-24 hover:bg-surface hover:border-border-hover transition-all duration-500 shadow-xl"
      >
        <div className="text-center mb-10">
           <div className="flex items-center justify-center mb-6">
             <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shadow-md">
               <KeyRound size={24} />
             </div>
           </div>
           <h1 className="text-3xl font-bold tracking-tight mb-2 text-text-primary">Reset Password</h1>
           <p className="text-text-secondary text-sm">Enter your email to receive a secure reset link.</p>
        </div>

        <div className="flex flex-col items-center w-full space-y-6">
           <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full max-w-sm">
              <div className="space-y-1.5">
                 <label className="text-xs font-bold text-text-primary ml-1">Email Address</label>
                 <div className="relative group">
                    <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" />
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="sarah@example.com" className="w-full bg-bg-subtle border border-border rounded-xl pl-12 pr-4 py-5 focus:outline-none focus:border-border-focus transition-all text-sm shadow-sm text-text-primary" />
                 </div>
              </div>

              <AnimatePresence>
                 {error && (
                   <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="p-3 rounded-lg bg-error/10 border border-error/20 text-error text-xs font-bold flex items-center gap-2 overflow-hidden">
                      <ShieldCheck size={14} className="flex-shrink-0" /> {error}
                   </motion.div>
                 )}
                 {message && (
                   <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="p-3 rounded-lg bg-success/10 border border-success/20 text-success text-xs font-bold flex items-center gap-2 overflow-hidden">
                      <Check size={14} className="flex-shrink-0" /> {message}
                   </motion.div>
                 )}
              </AnimatePresence>

              <div className="pt-2">
                <button type="submit" disabled={loading} className="btn btn-primary w-full !py-4 flex items-center justify-center gap-2 group">
                   {loading ? <Loader2 size={18} className="animate-spin" /> : (
                     <>
                       <span>Send Reset Link</span>
                     </>
                   )}
                </button>
              </div>
           </form>

           <p className="text-center text-sm text-text-secondary mt-6">
              Remember your password?{' '}
              <Link href="/auth" className="font-bold text-text-primary hover:text-primary transition-colors underline decoration-border underline-offset-4 hover:decoration-primary inline-flex items-center gap-1">
                 <ArrowLeft size={14} /> Back to Sign In
              </Link>
           </p>
        </div>
      </motion.div>
    </div>
  );
}

