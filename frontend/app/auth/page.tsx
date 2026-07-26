"use client";

import { useState, useEffect, Suspense } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Phone, ArrowRight, Loader2, Check, ShieldCheck, Sparkles } from 'lucide-react';
import { AuroraBackground } from '@/components/ui/aurora-background';

function AuthPageContent() {
  const { user, profile, isLoading, signIn, signUp, signInWithGoogle } = useAuth();
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
        const { error: signUpError } = await signUp(email, password, phone);
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
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Left Panel - Visual/Marketing */}
      <div className="relative hidden lg:flex flex-col justify-between bg-zinc-900 text-white overflow-hidden p-12 border-r border-white/10">
        <AuroraBackground className="absolute inset-0 z-0 opacity-80" />
        <div className="relative z-10">
           <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity w-fit">
             <div className="w-8 h-8 rounded-lg bg-white text-zinc-900 flex items-center justify-center shadow-lg">
               <Sparkles size={18} />
             </div>
             <span className="text-2xl font-bold tracking-tight drop-shadow-sm">memento</span>
           </Link>
        </div>
        <div className="relative z-10 max-w-lg mb-20 drop-shadow-xl">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="text-4xl lg:text-5xl font-bold tracking-tight mb-6 leading-[1.1]"
          >
            The easiest way to collect event memories.
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="text-zinc-200 text-lg leading-relaxed font-medium"
          >
            Create stunning, real-time photo walls for your weddings, parties, and corporate events. No apps for your guests to download, just pure shared memories.
          </motion.p>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex flex-col items-center justify-center p-6 bg-bg relative">
        <div className="absolute inset-0 lg:hidden overflow-hidden pointer-events-none">
           <AuroraBackground className="opacity-40" />
        </div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="relative z-10 w-full max-w-md bg-surface/50 backdrop-blur-xl lg:bg-transparent lg:backdrop-blur-none p-8 lg:p-0 rounded-3xl lg:rounded-none border lg:border-none border-border shadow-xl lg:shadow-none"
        >
          <div className="text-center lg:text-left mb-10">
             <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
               <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center shadow-md">
                 <Sparkles size={18} />
               </div>
               <Link href="/" className="text-2xl font-bold tracking-tight">memento</Link>
             </div>
             <h1 className="text-3xl font-bold tracking-tight mb-2 text-text-primary">{isSignUp ? 'Create an account' : 'Welcome back'}</h1>
             <p className="text-text-secondary text-sm">{isSignUp ? 'Enter your details below to get started.' : 'Enter your credentials to access your dashboard.'}</p>
          </div>

          <div className="space-y-6">
             <button onClick={() => signInWithGoogle()} className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl bg-bg-subtle border border-border hover:bg-border transition-all font-bold text-sm text-text-primary group shadow-sm">
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.67-.35-1.39-.35-2.09s.13-1.42.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
             </button>

             <div className="flex items-center gap-4">
                <div className="h-px w-full bg-border" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted whitespace-nowrap">OR</span>
                <div className="h-px w-full bg-border" />
             </div>

             <form onSubmit={handleSubmit} className="space-y-4">
                {isSignUp && (
                   <div className="space-y-1.5">
                      <label className="text-xs font-bold text-text-primary ml-1">Full Name</label>
                      <div className="relative group">
                         <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" />
                         <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="John Doe" className="w-full bg-bg-subtle border border-border rounded-xl pl-11 pr-4 py-3.5 focus:outline-none focus:border-primary transition-all text-sm shadow-sm text-text-primary" />
                      </div>
                   </div>
                )}

                <div className="space-y-1.5">
                   <label className="text-xs font-bold text-text-primary ml-1">Email Address</label>
                   <div className="relative group">
                      <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" />
                      <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="sarah@example.com" className="w-full bg-bg-subtle border border-border rounded-xl pl-11 pr-4 py-3.5 focus:outline-none focus:border-primary transition-all text-sm shadow-sm text-text-primary" />
                   </div>
                </div>

                <div className="space-y-1.5">
                   <div className="flex items-center justify-between ml-1">
                      <label className="text-xs font-bold text-text-primary">Password</label>
                      {!isSignUp && <Link href="/auth/reset" className="text-xs font-bold text-primary hover:underline">Forgot password?</Link>}
                   </div>
                   <div className="relative group">
                      <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" />
                      <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" className="w-full bg-bg-subtle border border-border rounded-xl pl-11 pr-4 py-3.5 focus:outline-none focus:border-primary transition-all text-sm shadow-sm text-text-primary" />
                   </div>
                </div>

                {isSignUp && (
                   <div className="space-y-1.5">
                      <label className="text-xs font-bold text-text-primary ml-1">Mobile Number (Optional)</label>
                      <div className="relative group">
                         <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" />
                         <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1 555 000 0000" className="w-full bg-bg-subtle border border-border rounded-xl pl-11 pr-4 py-3.5 focus:outline-none focus:border-primary transition-all text-sm shadow-sm text-text-primary" />
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
                  <button type="submit" disabled={loading} className="btn-premium w-full !py-4 flex items-center justify-center gap-2 group">
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
