"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

function UpdatePasswordContent() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check if we have the reset token in the URL
    const token = searchParams.get('token');
    if (!token) {
      setError('Invalid or expired reset link');
      setTimeout(() => router.push('/auth'), 3000);
    }
  }, [searchParams, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        setError(error.message);
      } else {
        setMessage('Password updated successfully!');
        setTimeout(() => router.push('/auth'), 2000);
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
            <div className="nm-circle w-16 h-16 mx-auto mb-4 text-2xl">🔑</div>
            <h1 className="text-3xl font-bold mb-2" style={{color:'var(--text1)'}}>Update Password</h1>
            <p style={{color:'var(--text2)'}}>Enter your new password</p>
          </div>

          {message && <div className="nm-inset p-4 mb-6 text-center text-sm" style={{color:'#4ade80'}}>{message}</div>}
          {error && <div className="nm-inset p-4 mb-6 text-center text-sm" style={{color:'#f87171'}}>{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold mb-2" style={{color:'var(--text2)'}}>New Password</label>
              <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                required minLength={6} placeholder="Enter new password" className="nm-input" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-2" style={{color:'var(--text2)'}}>Confirm Password</label>
              <input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                required minLength={6} placeholder="Confirm new password" className="nm-input" />
            </div>
            <button type="submit" disabled={loading} className="nm-btn nm-btn-accent w-full py-3 font-bold disabled:opacity-50">
              {loading ? 'Updating...' : 'Update Password'}
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

export default function UpdatePasswordPage() {
  return (
    <Suspense fallback={
      <div className="nm-page flex items-center justify-center">
        <div className="nm-circle w-14 h-14">
          <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{borderColor:'#252c46',borderTopColor:'#f59e0b'}} />
        </div>
      </div>
    }>
      <UpdatePasswordContent />
    </Suspense>
  );
}

