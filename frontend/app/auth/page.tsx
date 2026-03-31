"use client";

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AuthPage() {
  const { signIn, signUp } = useAuth();
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    if (isSignUp) {
      const { error } = await signUp(email, password, phone);
      if (error) setError(error.message);
      else setMessage('Check your email for a confirmation link!');
    } else {
      const { error } = await signIn(email, password);
      if (error) setError(error.message);
      else router.push('/dashboard');
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

