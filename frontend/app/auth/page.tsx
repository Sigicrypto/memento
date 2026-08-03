"use client";

import { useState, useEffect, Suspense } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Phone, ArrowRight, Loader2, Check, ShieldCheck, Sparkles } from 'lucide-react';
import { AuroraBackground } from '@/components/ui/aurora-background';

function AuthPageContent() {
  const { user, profile, isLoading, signIn, signUp } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSignUp, setIsSignUp] = useState(searchParams.get('mode') === 'signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isLoading && user && profile) {
      const plan = searchParams.get('plan');
      const isPaid = profile.payment_status === 'paid';
      if (isPaid) router.push('/dashboard');
      else if (plan) router.push(`/checkout?plan=${plan}`);
      else router.push('/dashboard');
    }
  }, [user, profile, isLoading, searchParams, router]);

  useEffect(() => {
    if (searchParams.get('mode') === 'signup') setIsSignUp(true);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setMessage(''); setLoading(true);
    try {
      if (isSignUp) {
        if (!name.trim()) {
          throw new Error('Full name is required for sign up.');
        }
        const { error: signUpError } = await signUp(email, password, phone, name);
        if (signUpError) throw signUpError;
        setMessage('Check your email for a confirmation link!');
      } else {
        const { error: signInError } = await signIn(email, password);
        if (signInError) throw signInError;
        const plan = searchParams.get('plan');
        router.push(plan ? `/checkout?plan=${plan}` : '/dashboard');
      }
    } catch (err: any) { setError(err.message || 'Authentication failed'); }
    finally { setLoading(false); }
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

           <h1 className="text-3xl font-bold tracking-tight mb-2 text-text-primary">{isSignUp ? 'Create an account' : 'Welcome back'}</h1>
           <p className="text-text-secondary text-sm">{isSignUp ? 'Enter your details below to get started.' : 'Enter your credentials to access your dashboard.'}</p>
        </div>

        <div className="flex flex-col items-center w-full space-y-6">

           <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full max-w-sm">
              {isSignUp && (
                 <div className="space-y-1.5">
                    <label className="text-xs font-bold text-text-primary ml-1">Full Name</label>
                    <div className="relative group">
                       <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" />
                       <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="John Doe" className="w-full bg-bg-subtle border border-border rounded-xl pl-12 pr-4 py-5 focus:outline-none focus:border-border-focus transition-all text-sm shadow-sm text-text-primary" />
                    </div>
                 </div>
              )}

              <div className="space-y-1.5">
                 <label className="text-xs font-bold text-text-primary ml-1">Email Address</label>
                 <div className="relative group">
                    <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" />
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="sarah@example.com" className="w-full bg-bg-subtle border border-border rounded-xl pl-12 pr-4 py-5 focus:outline-none focus:border-border-focus transition-all text-sm shadow-sm text-text-primary" />
                 </div>
              </div>

              <div className="space-y-1.5">
                 <div className="flex items-center justify-between ml-1">
                    <label className="text-xs font-bold text-text-primary">Password</label>
                    {!isSignUp && <Link href="/auth/reset" className="text-xs font-bold text-primary hover:underline">Forgot password?</Link>}
                 </div>
                 <div className="relative group">
                    <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" />
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" className="w-full bg-bg-subtle border border-border rounded-xl pl-12 pr-4 py-5 focus:outline-none focus:border-border-focus transition-all text-sm shadow-sm text-text-primary" />
                 </div>
              </div>

              {isSignUp && (
                 <div className="space-y-1.5">
                    <label className="text-xs font-bold text-text-primary ml-1">Mobile Number (Optional)</label>
                    <div className="relative group">
                       <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" />
                       <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1 555 000 0000" className="w-full bg-bg-subtle border border-border rounded-xl pl-12 pr-4 py-5 focus:outline-none focus:border-border-focus transition-all text-sm shadow-sm text-text-primary" />
                    </div>
                 </div>
              )}

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
                       <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
                       <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                     </>
                   )}
                </button>
              </div>
           </form>

           <p className="text-center text-sm text-text-secondary mt-6">
              {isSignUp ? "Already have an account?" : "Don't have an account?"}{' '}
              <button onClick={() => { setIsSignUp(!isSignUp); setError(''); setMessage(''); }} className="font-bold text-text-primary hover:text-primary transition-colors underline decoration-border underline-offset-4 hover:decoration-primary">
                 {isSignUp ? 'Sign In' : 'Create one'}
              </button>
           </p>
        </div>
      </motion.div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    }>
      <AuthPageContent />
    </Suspense>
  );
}
