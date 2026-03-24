"use client";

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

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
    <div className="aurora-bg min-h-[90vh] flex items-center justify-center px-4">
      <div className="relative z-10 w-full max-w-md">
        {/* Glow backdrop */}
        <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-primary/20 via-accent/10 to-accent2/20 blur-xl pointer-events-none" />

        <div className="card relative !p-8">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-lg font-bold glow-purple">
              M
            </div>
          </div>

          <h1 className="text-2xl font-bold text-center mb-1">
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </h1>
          <p className="text-dark-text text-sm text-center mb-6">
            {isSignUp ? 'Start capturing memories today' : 'Sign in to your Memento dashboard'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-dark-text mb-1.5">Email</label>
              <input type="email" className="input" value={email}
                onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" />
            </div>
            <div>
              <label className="block text-xs font-medium text-dark-text mb-1.5">Password</label>
              <input type="password" className="input" value={password}
                onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" minLength={6} />
            </div>
            {isSignUp && (
              <div>
                <label className="block text-xs font-medium text-dark-text mb-1.5">Mobile Number</label>
                <input type="tel" className="input" value={phone}
                  onChange={(e) => setPhone(e.target.value)} placeholder="+971 50 123 4567" />
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/15 p-3 rounded-xl">
                <span>⚠️</span> {error}
              </div>
            )}
            {message && (
              <div className="flex items-center gap-2 text-green-400 text-sm bg-green-500/10 border border-green-500/15 p-3 rounded-xl">
                <span>✅</span> {message}
              </div>
            )}

            <button type="submit" className="btn-primary w-full !py-3" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Please wait…
                </span>
              ) : isSignUp ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-dark-border" /></div>
            <div className="relative flex justify-center"><span className="bg-dark-card px-3 text-xs text-dark-text">or</span></div>
          </div>

          <p className="text-sm text-center text-dark-text">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              onClick={() => { setIsSignUp(!isSignUp); setError(''); setMessage(''); }}
              className="text-primary-light font-semibold hover:text-primary transition"
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
