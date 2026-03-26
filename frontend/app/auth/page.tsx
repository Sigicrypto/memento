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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-amber-900 to-gray-900 flex items-center justify-center px-4">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Glow backdrop */}
        <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-amber-500/20 via-rose-500/10 to-amber-500/20 blur-xl pointer-events-none" />

        <div className="relative bg-gray-800/50 backdrop-blur-md rounded-2xl p-8 border border-amber-500/20">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-rose-500 flex items-center justify-center text-white text-lg font-bold shadow-lg shadow-amber-500/30">
              📷
            </div>
          </div>

          <h1 className="text-2xl font-bold text-center mb-1 text-white">
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </h1>
          <p className="text-gray-400 text-sm text-center mb-6">
            {isSignUp ? 'Start capturing memories today' : 'Sign in to your Memento dashboard'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Email</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)} 
                required 
                placeholder="you@example.com"
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)} 
                required 
                placeholder="••••••••" 
                minLength={6}
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all"
              />
            </div>
            {isSignUp && (
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Mobile Number</label>
                <input 
                  type="tel" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)} 
                  placeholder="+968 96095692"
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all"
                />
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 p-3 rounded-lg">
                <span>⚠️</span> {error}
              </div>
            )}
            {message && (
              <div className="flex items-center gap-2 text-green-400 text-sm bg-green-500/10 border border-green-500/20 p-3 rounded-lg">
                <span>✅</span> {message}
              </div>
            )}

            <button 
              type="submit" 
              className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-rose-500 text-white font-semibold rounded-lg hover:from-amber-600 hover:to-rose-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed" 
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Please wait…
                </span>
              ) : isSignUp ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          {!isSignUp && (
            <div className="text-center mt-4">
              <Link href="/auth/reset" className="text-amber-400 text-sm hover:text-amber-300 transition-colors">
                Forgot your password?
              </Link>
            </div>
          )}

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-gray-800 px-3 text-xs text-gray-400">or</span>
            </div>
          </div>

          <p className="text-sm text-center text-gray-400">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              onClick={() => { setIsSignUp(!isSignUp); setError(''); setMessage(''); }}
              className="text-amber-400 font-semibold hover:text-amber-300 transition-colors"
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
