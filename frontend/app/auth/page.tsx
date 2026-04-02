"use client";

import { useState, useEffect, Suspense } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function AuthPageContent() {
  const { user, profile, isLoading, signIn, signUp, signInWithGoogle, signOut } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSignUp, setIsSignUp] = useState(searchParams.get('mode') === 'signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
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
        // If not paid and no plan selected, go to dashboard which will now show activation UI
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

    if (isSignUp) {
      const { error } = await signUp(email, password, phone);
      if (error) setError(error.message);
      else {
        setMessage('Check your email for a confirmation link!');
        const plan = searchParams.get('plan');
        // If there is a plan, we might want to tell them to confirm email before proceeding
        // or redirect to a wait page. For now, let's keep it simple.
      }
    } else {
      const { error } = await signIn(email, password);
      if (error) setError(error.message);
      else {
        const plan = searchParams.get('plan');
        if (plan) {
          router.push(`/checkout?plan=${plan}`);
        } else {
          router.push('/dashboard');
        }
      }
    }
    setLoading(false);
  };

  return (
    <div className="nm-page flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="nm-card p-8">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="nm-circle w-16 h-16 text-2xl">📷</div>
          </div>

          <h1 className="text-2xl font-bold text-center mb-1" style={{color:'var(--text1)'}}>
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </h1>
          <p className="text-sm text-center mb-6" style={{color:'var(--text2)'}}>
            {isSignUp ? 'Start capturing memories today' : 'Sign in to your Memento dashboard'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold mb-2" style={{color:'var(--text2)'}}>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" className="nm-input" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-2" style={{color:'var(--text2)'}}>Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" minLength={6} className="nm-input" />
            </div>
            {isSignUp && (
              <div>
                <label className="block text-xs font-semibold mb-2" style={{color:'var(--text2)'}}>Mobile Number</label>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+968 96095692" className="nm-input" />
              </div>
            )}

            {error && (
              <div className="nm-inset p-3 flex items-center gap-2 text-sm" style={{color:'#f87171'}}>
                <span>⚠️</span> {error}
              </div>
            )}
            {message && (
              <div className="nm-inset p-3 flex items-center gap-2 text-sm" style={{color:'#4ade80'}}>
                <span>✅</span> {message}
              </div>
            )}

            <button type="submit" disabled={loading} className="nm-btn nm-btn-accent w-full py-3 text-sm font-bold disabled:opacity-50">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                  Please wait…
                </span>
              ) : isSignUp ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          {!isSignUp && (
            <div className="text-center mt-4">
              <Link href="/auth/reset" className="text-sm transition-colors" style={{color:'#f59e0b'}}>
                Forgot your password?
              </Link>
            </div>
          )}

          <div className="nm-divider" />

          <button 
            onClick={() => signInWithGoogle()}
            className="nm-btn w-full py-3 flex items-center justify-center gap-3 text-sm font-bold bg-white/5 border-white/10 hover:bg-white/10 transition-all mb-4"
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.67-.35-1.39-.35-2.09s.13-1.42.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Sign in with Google
          </button>

          <p className="text-sm text-center" style={{color:'var(--text2)'}}>
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button onClick={() => { setIsSignUp(!isSignUp); setError(''); setMessage(''); }} className="font-semibold transition-colors" style={{color:'#f59e0b'}}>
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>

        <div className="text-center mt-6">
          <Link href="/" className="text-xs transition-colors" style={{color:'#4a4f6a'}}>← Back to Home</Link>
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="nm-page flex items-center justify-center">
        <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{borderColor:'#252c46',borderTopColor:'#f59e0b'}} />
      </div>
    }>
      <AuthPageContent />
    </Suspense>
  );
}
