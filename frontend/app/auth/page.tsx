"use client";

import { useState, useEffect, Suspense } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, User, Phone, ArrowRight, Loader2, Check, ArrowLeft } from 'lucide-react';

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

      if (isPaid) {
        router.push('/dashboard');
      } else if (plan) {
        router.push(`/checkout?plan=${plan}`);
      } else {
        router.push('/dashboard');
      }
    }
  }, [user, profile, isLoading, searchParams, router]);

  useEffect(() => {
    if (searchParams.get('mode') === 'signup') {
      setIsSignUp(true);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      if (isSignUp) {
        const { error: signUpError } = await signUp(email, password, phone);
        if (signUpError) throw signUpError;
        setMessage('Check your email for a confirmation link!');
      } else {
        const { error: signInError } = await signIn(email, password);
        if (signInError) throw signInError;
        
        const plan = searchParams.get('plan');
        if (plan) {
          router.push(`/checkout?plan=${plan}`);
        } else {
          router.push('/dashboard');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center px-4 py-20 min-h-[90vh] relative z-10">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="glass-card p-10 md:p-12 relative overflow-hidden">
          {/* Decorative background glow inside card */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-[60px] pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-accent/10 rounded-full blur-[60px] pointer-events-none" />

          {/* Logo/Icon */}
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20 rotate-3">
              <span className="text-4xl">📷</span>
            </div>
          </div>

          <div className="text-center mb-10">
            <h1 className="text-3xl font-extrabold tracking-tight text-white mb-3">
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </h1>
            <p className="text-slate-400 text-sm leading-relaxed">
              {isSignUp ? 'Start capturing memories today with Memento' : 'Sign in to access your live event photo walls'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="auth-oauth-row mb-6">
              <button 
                type="button"
                onClick={() => signInWithGoogle()}
                className="auth-oauth-btn w-full bg-white/5 hover:bg-white/10 border-white/10 hover:border-white/20 transition-all flex items-center justify-center gap-3 py-3 rounded-2xl font-semibold text-white group"
              >
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.67-.35-1.39-.35-2.09s.13-1.42.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span className="group-hover:translate-x-0.5 transition-transform">Continue with Google</span>
              </button>
            </div>

            <div className="auth-divider mb-6">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">or continue with email</span>
            </div>

            <div className="space-y-4">
              {isSignUp && (
                <div className="auth-field">
                  <label className="auth-label block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Full Name</label>
                  <div className="auth-input-wrap flex items-center bg-white/5 border border-white/10 rounded-2xl px-4 focus-within:border-primary/50 focus-within:ring-4 focus-within:ring-primary/10 transition-all">
                    <User size={18} className="text-slate-500" />
                    <input 
                      type="text" 
                      value={name} 
                      onChange={(e) => setName(e.target.value)} 
                      placeholder="John Doe" 
                      className="bg-transparent border-none text-white w-full py-4 text-sm outline-none px-3 placeholder:text-slate-600" 
                    />
                  </div>
                </div>
              )}

              <div className="auth-field">
                <label className="auth-label block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Email Address</label>
                <div className="auth-input-wrap flex items-center bg-white/5 border border-white/10 rounded-2xl px-4 focus-within:border-primary/50 focus-within:ring-4 focus-within:ring-primary/10 transition-all">
                  <Mail size={18} className="text-slate-500" />
                  <input 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                    placeholder="you@example.com" 
                    className="bg-transparent border-none text-white w-full py-4 text-sm outline-none px-3 placeholder:text-slate-600" 
                  />
                </div>
              </div>

              <div className="auth-field">
                <label className="auth-label block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Password</label>
                <div className="auth-input-wrap flex items-center bg-white/5 border border-white/10 rounded-2xl px-4 focus-within:border-primary/50 focus-within:ring-4 focus-within:ring-primary/10 transition-all">
                  <Lock size={18} className="text-slate-500" />
                  <input 
                    type="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                    placeholder="••••••••" 
                    minLength={6} 
                    className="bg-transparent border-none text-white w-full py-4 text-sm outline-none px-3 placeholder:text-slate-600" 
                  />
                </div>
              </div>

              {isSignUp && (
                <div className="auth-field">
                  <label className="auth-label block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Mobile Number</label>
                  <div className="auth-input-wrap flex items-center bg-white/5 border border-white/10 rounded-2xl px-4 focus-within:border-primary/50 focus-within:ring-4 focus-within:ring-primary/10 transition-all">
                    <Phone size={18} className="text-slate-500" />
                    <input 
                      type="tel" 
                      value={phone} 
                      onChange={(e) => setPhone(e.target.value)} 
                      placeholder="+968 96095692" 
                      className="bg-transparent border-none text-white w-full py-4 text-sm outline-none px-3 placeholder:text-slate-600" 
                    />
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3 text-red-400 text-sm">
                <span className="text-lg">⚠️</span> {error}
              </div>
            )}
            {message && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 flex items-center gap-3 text-green-400 text-sm">
                <span className="text-lg">✅</span> {message}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading} 
              className="auth-submit-btn w-full py-4 rounded-2xl text-white font-bold flex items-center justify-center gap-3 hover:translate-y-[-2px] active:translate-y-[0] transition-all disabled:opacity-50 disabled:translate-y-0"
              style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))', boxShadow: '0 8px 30px rgba(6, 182, 212, 0.3)' }}
            >
              {loading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <>
                  <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {!isSignUp && (
            <div className="text-center mt-6">
              <Link href="/auth/reset" className="text-sm font-semibold text-primary hover:text-primary-light transition-colors">
                Forgot your password?
              </Link>
            </div>
          )}

          <p className="text-sm text-center mt-10 text-slate-500">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button 
              onClick={() => { setIsSignUp(!isSignUp); setError(''); setMessage(''); }} 
              className="text-white font-bold hover:text-primary transition-colors ml-1"
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>

        <div className="text-center mt-10">
          <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-400 transition-colors uppercase tracking-widest">
            <ArrowLeft size={14} />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-4 border-white/10 border-t-primary rounded-full animate-spin" />
      </div>
    }>
      <AuthPageContent />
    </Suspense>
  );
}
