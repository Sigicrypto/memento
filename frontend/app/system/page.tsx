"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function SystemAdminPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Check against environment variable admin code
      const adminCode = process.env.NEXT_PUBLIC_ADMIN_ACCESS_CODE || 'memento-admin-2024';
      
      if (password !== adminCode) {
        throw new Error('Invalid access code');
      }

      // Sign in with Supabase
      const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: adminCode, // Use admin code as password for simplicity
      });

      if (signInError) {
        // If user doesn't exist, try to sign them up first
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password: adminCode,
          options: {
            emailRedirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/system/callback`
          }
        });

        if (signUpError) throw signUpError;

        if (signUpData.user) {
          // Update user metadata to mark as admin
          await supabase.auth.updateUser({
            data: { 
              role: 'admin',
              is_admin: true 
            }
          });
        }
      } else if (authData.user) {
        // Update user metadata to mark as admin
        const { error: updateError } = await supabase.auth.updateUser({
          data: { 
            role: 'admin',
            is_admin: true 
          }
        });

        if (updateError) {
          console.warn('Could not update admin role:', updateError);
        }
      }

      // Redirect to admin page
      router.push('/admin');
    } catch (error: any) {
      setError(error.message || 'Access denied');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative">
      {/* Background Effects */}
      <div className="fixed inset-0 aurora-bg pointer-events-none" />
      <div className="fixed inset-0 grid-pattern pointer-events-none" />

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          {/* Logo and Header */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center text-white font-bold">
                M
              </div>
              <span className="text-2xl font-bold gradient-text">Memento</span>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">System Access</h1>
            <p className="text-gray-600 dark:text-gray-400">Administrator authentication required</p>
          </div>

          {/* Login Form */}
          <div className="card">
            <form onSubmit={handleLogin} className="space-y-6">
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Administrator Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input"
                  placeholder="system@memento.com"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Access Code
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input"
                  placeholder="Enter system access code"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
                ) : (
                  '🔐 Access System'
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Return to main site?
              </p>
              <Link href="/" className="btn-secondary text-sm">
                🏠 Home
              </Link>
            </div>
          </div>

          {/* Security Notice */}
          <div className="mt-6 text-center">
            <p className="text-xs text-red-500 dark:text-red-400 font-medium">
              ⚠️ Authorized personnel only. Access is logged and monitored.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
