"use client";

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import '../styles/neumorphic.css';

export default function NeumorphicAuthPage() {
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
    <div className="neumo-dark min-h-screen flex items-center justify-center px-4">
      {/* Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-20 w-64 h-64 neumo-icon neumo-icon-dark opacity-20" />
        <div className="absolute bottom-20 right-20 w-48 h-48 neumo-icon neumo-icon-dark opacity-20" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 neumo-icon neumo-icon-dark opacity-10" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="neumo-container neumo-container-dark">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="neumo-icon neumo-icon-dark w-20 h-20 text-4xl neumo-float">
              📷
            </div>
          </div>

          <h1 className="text-3xl font-bold text-center text-gray-200 mb-2">
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </h1>
          <p className="text-gray-400 text-center text-sm mb-8">
            {isSignUp ? 'Start capturing memories today' : 'Sign in to your Memento dashboard'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)} 
                required 
                placeholder="you@example.com"
                className="neumo-input neumo-input-dark"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)} 
                required 
                placeholder="••••••••" 
                minLength={6}
                className="neumo-input neumo-input-dark"
              />
            </div>
            
            {isSignUp && (
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Mobile Number</label>
                <input 
                  type="tel" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)} 
                  placeholder="+968 96095692"
                  className="neumo-input neumo-input-dark"
                />
              </div>
            )}

            {error && (
              <div className="neumo-card neumo-card-dark p-4 border-l-4 border-red-500">
                <p className="text-red-400 text-sm flex items-center gap-2">
                  <span>⚠️</span> {error}
                </p>
              </div>
            )}
            
            {message && (
              <div className="neumo-card neumo-card-dark p-4 border-l-4 border-green-500">
                <p className="text-green-400 text-sm flex items-center gap-2">
                  <span>✅</span> {message}
                </p>
              </div>
            )}

            <button 
              type="submit" 
              className="neumo-btn neumo-btn-dark w-full py-4 text-lg font-semibold bg-gradient-to-r from-blue-500 to-purple-500 text-white"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Please wait…
                </span>
              ) : isSignUp ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          {!isSignUp && (
            <div className="text-center mt-6">
              <Link href="/auth/reset" className="text-blue-400 hover:text-blue-300 text-sm transition-colors">
                Forgot your password?
              </Link>
            </div>
          )}

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-600"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-gray-800 px-4 text-xs text-gray-400">or</span>
            </div>
          </div>

          <p className="text-center text-gray-400 text-sm">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              onClick={() => { setIsSignUp(!isSignUp); setError(''); setMessage(''); }}
              className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-8">
          <Link href="/" className="text-gray-400 hover:text-gray-200 text-sm transition-colors flex items-center justify-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
