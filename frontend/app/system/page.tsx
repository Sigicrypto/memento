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
    <div className="nm-page flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-6 justify-center">
            <div className="nm-circle w-10 h-10 font-bold text-lg" style={{color:'#f59e0b'}}>M</div>
            <span className="text-2xl font-bold" style={{background:'linear-gradient(135deg,#f59e0b,#f472b6)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>Memento</span>
          </Link>
          <h1 className="text-3xl font-bold mb-2" style={{color:'#e2e8f0'}}>System Access</h1>
          <p style={{color:'#7f849c'}}>Administrator authentication required</p>
        </div>

        <div className="nm-card p-8">
          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="nm-inset p-3 text-sm" style={{color:'#f87171'}}>{error}</div>
            )}
            <div>
              <label className="block text-xs font-semibold mb-2" style={{color:'#7f849c'}}>Administrator Email</label>
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="nm-input" placeholder="system@memento.com" required />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-2" style={{color:'#7f849c'}}>Access Code</label>
              <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                className="nm-input" placeholder="Enter system access code" required />
            </div>
            <button type="submit" disabled={loading} className="nm-btn nm-btn-accent w-full py-3 font-bold">
              {loading
                ? <div className="w-5 h-5 border-2 rounded-full animate-spin mx-auto" style={{borderColor:'#252c46',borderTopColor:'#f59e0b'}} />
                : '🔐 Access System'}
            </button>
          </form>

          <div className="mt-6 pt-6 text-center">
            <div className="nm-divider mb-6" />
            <p className="text-xs mb-3" style={{color:'#7f849c'}}>Return to main site?</p>
            <Link href="/" className="nm-btn px-6 py-2 text-sm" style={{color:'#7f849c'}}>🏠 Home</Link>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs font-medium" style={{color:'#f87171'}}>⚠️ Authorized personnel only. Access is logged and monitored.</p>
        </div>
      </div>
    </div>
  );
}
