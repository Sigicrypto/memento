"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });

      if (error) {
        setError(error.message);
      } else {
        setMessage('Check your email for a password reset link!');
        setTimeout(() => router.push('/auth'), 3000);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="nm-page flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="nm-card p-8">
          <div className="text-center mb-8">
            <div className="nm-circle w-16 h-16 mx-auto mb-4 text-2xl">🔐</div>
            <h1 className="text-3xl font-bold mb-2" style={{color:'#e2e8f0'}}>Reset Password</h1>
            <p style={{color:'#7f849c'}}>Enter your email to receive a reset link</p>
          </div>

          {message && (
            <div className="nm-inset p-4 mb-6 text-center text-sm" style={{color:'#4ade80'}}>{message}</div>
          )}
          {error && (
            <div className="nm-inset p-4 mb-6 text-center text-sm" style={{color:'#f87171'}}>{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold mb-2" style={{color:'#7f849c'}}>Email Address</label>
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                required placeholder="Enter your email" className="nm-input" />
            </div>
            <button type="submit" disabled={loading} className="nm-btn nm-btn-accent w-full py-3 font-bold disabled:opacity-50">
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>

          <div className="nm-divider" />
          <div className="text-center">
            <Link href="/auth" className="text-sm" style={{color:'#f59e0b'}}>← Back to Sign In</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
