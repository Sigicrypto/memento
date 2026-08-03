"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Loader2, Check, ShieldCheck, KeyRound, Lock } from 'lucide-react';
import { AuroraBackground } from '@/components/ui/aurora-background';

function UpdatePasswordContent() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    // When arriving from an email link, Supabase sets the session via the URL hash automatically.
    // We can listen to auth state changes to ensure we have a session before allowing update.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        // Ready to update password
      } else if (!session) {
        // If there's no session after a short delay, the link might be invalid
        const timeout = setTimeout(() => {
           supabase.auth.getSession().then(({ data }) => {
              if (!data.session) {
                 setError('Invalid or expired reset link. Please request a new one.');
              }
           });
        }, 1500);
        return () => clearTimeout(timeout);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        setError(error.message);
      } else {
        setMessage('Password updated successfully!');
        setTimeout(() => router.push('/auth'), 2000);
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
             <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center shadow-md">
               <KeyRound size={24} />
             </div>
           </div>
           <h1 className="text-3xl font-bold tracking-tight mb-2 text-text-primary">Update Password</h1>
           <p className="text-text-secondary text-sm">Enter your new secure password below.</p>
        </div>

        <div className="flex flex-col items-center w-full space-y-6">
           <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full max-w-sm">
              <div className="space-y-1.5">
                 <label className="text-xs font-bold text-text-primary ml-1">New Password</label>
                 <div className="relative group">
                    <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" />
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} placeholder="••••••••" className="w-full bg-bg-subtle border border-border rounded-xl pl-12 pr-4 py-5 focus:outline-none focus:border-border-focus transition-all text-sm shadow-sm text-text-primary" />
                 </div>
              </div>
              <div className="space-y-1.5">
                 <label className="text-xs font-bold text-text-primary ml-1">Confirm Password</label>
                 <div className="relative group">
                    <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" />
                    <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required minLength={6} placeholder="••••••••" className="w-full bg-bg-subtle border border-border rounded-xl pl-12 pr-4 py-5 focus:outline-none focus:border-border-focus transition-all text-sm shadow-sm text-text-primary" />
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
                       <span>Update Password</span>
                     </>
                   )}
                </button>
              </div>
           </form>

           <div className="w-full max-w-sm h-px bg-border my-2" />

           <p className="text-center text-sm text-text-secondary">
              <Link href="/auth" className="font-bold text-text-primary hover:text-primary transition-colors underline decoration-border underline-offset-4 hover:decoration-primary inline-flex items-center gap-1">
                 <ArrowLeft size={14} /> Back to Sign In
              </Link>
           </p>
        </div>
      </motion.div>
    </div>
  );
}

export default function UpdatePasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-bg">
         <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    }>
      <UpdatePasswordContent />
    </Suspense>
  );
}

