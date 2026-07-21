"use client";
 
import { useState, useEffect, Suspense } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Phone, ArrowRight, Loader2, Check, ArrowLeft, ShieldCheck, Sparkles } from 'lucide-react';
 
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
    <div className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center p-6">
      <div className="grain" />
      <div className="orbs"><div className="orb orb-primary" /><div className="orb orb-secondary" /></div>
 
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="text-center mb-10">
           <Link href="/" className="text-3xl font-bold tracking-tighter mb-4 inline-block hover:opacity-80 transition-opacity">memento</Link>
           <p className="text-text-muted text-[10px] font-black uppercase tracking-[.3em]">SECURE ACCESS</p>
        </div>
 
        <div className="glass-panel p-8 md:p-10 space-y-8">
           <div className="text-center">
              <h1 className="text-3xl font-bold tracking-tight mb-2">{isSignUp ? 'Create Account' : 'Welcome Back'}</h1>
              <p className="text-text-secondary text-sm">{isSignUp ? 'Join the next generation of event sharing.' : 'Sign in to manage your memories.'}</p>
           </div>
 
           <button onClick={() => signInWithGoogle()} className="w-full flex items-center justify-center gap-3 py-4 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:bg-black/10 dark:bg-white/10 transition-all font-bold text-sm group">
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.67-.35-1.39-.35-2.09s.13-1.42.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
           </button>
 
           <div className="flex items-center gap-4">
              <div className="h-px w-full bg-black/5 dark:bg-white/5" />
              <span className="text-[9px] font-black uppercase tracking-widest text-text-muted whitespace-nowrap">OR EMAIL</span>
              <div className="h-px w-full bg-black/5 dark:bg-white/5" />
           </div>
 
           <form onSubmit={handleSubmit} className="space-y-5">
              {isSignUp && (
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1">Full Name</label>
                    <div className="relative group">
                       <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" />
                       <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="John Doe" className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl pl-12 pr-4 py-3.5 focus:outline-none focus:border-primary transition-all text-sm" />
                    </div>
                 </div>
              )}
 
              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1">Email Address</label>
                 <div className="relative group">
                    <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" />
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="sarah@example.com" className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl pl-12 pr-4 py-3.5 focus:outline-none focus:border-primary transition-all text-sm" />
                 </div>
              </div>
 
              <div className="space-y-2">
                 <div className="flex items-center justify-between ml-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">Password</label>
                    {!isSignUp && <Link href="/auth/reset" className="text-[10px] font-bold text-primary hover:opacity-80 transition-opacity">Forgot?</Link>}
                 </div>
                 <div className="relative group">
                    <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" />
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl pl-12 pr-4 py-3.5 focus:outline-none focus:border-primary transition-all text-sm" />
                 </div>
              </div>
 
              {isSignUp && (
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1">Mobile Number</label>
                    <div className="relative group">
                       <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" />
                       <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+968 0000 0000" className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl pl-12 pr-4 py-3.5 focus:outline-none focus:border-primary transition-all text-sm" />
                    </div>
                 </div>
              )}
 
              <AnimatePresence>
                 {error && (
                   <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold flex items-center gap-3">
                      <ShieldCheck size={16} /> {error}
                   </motion.div>
                 )}
                 {message && (
                   <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500 text-xs font-bold flex items-center gap-3">
                      <Check size={16} /> {message}
                   </motion.div>
                 )}
              </AnimatePresence>
 
              <button type="submit" disabled={loading} className="btn-premium w-full !py-4 flex items-center justify-center gap-3 group">
                 {loading ? <Loader2 size={20} className="animate-spin" /> : (
                   <>
                     <span>{isSignUp ? 'Create My Account' : 'Sign In ✦'}</span>
                     <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                   </>
                 )}
              </button>
           </form>
 
           <p className="text-center text-sm text-text-secondary">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button onClick={() => { setIsSignUp(!isSignUp); setError(''); setMessage(''); }} className="font-bold hover:text-primary transition-colors">
                 {isSignUp ? 'Sign In' : 'Sign Up Free'}
              </button>
           </p>
        </div>
 
        <div className="mt-12 text-center">
           <Link href="/" className="text-[10px] font-black text-text-muted hover:text-black dark:hover:text-white uppercase tracking-widest transition-colors flex items-center justify-center gap-2">
              <ArrowLeft size={12} /> Back to Homepage
           </Link>
        </div>
      </motion.div>
    </div>
  );
}
 
export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    }>
      <AuthPageContent />
    </Suspense>
  );
}
