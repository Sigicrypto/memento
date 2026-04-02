"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export default function SystemAdminPage() {
  const { user } = useAuth();
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

      // If user is already logged in (e.g. Gmail), just update their role
      if (user) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ role: 'admin' })
          .eq('id', user.id);

        if (updateError) throw updateError;
      } else {
        // Traditional Email/Password flow (Fallback)
        const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password: adminCode,
        });

        if (signInError) {
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email,
            password: adminCode,
            options: {
              emailRedirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/system/callback`
            }
          });

          if (signUpError) throw signUpError;

          if (signUpData.user) {
            await supabase.from('profiles').upsert({
              id: signUpData.user.id,
              email: signUpData.user.email || email,
              role: 'admin',
              full_name: 'Admin',
            });
          }
        } else if (authData.user) {
          await supabase.from('profiles').upsert({
            id: authData.user.id,
            email: authData.user.email || email,
            role: 'admin',
          });
        }
      }

      // Redirect to admin panel
      router.push('/admin');
    } catch (error: any) {
      setError(error.message || 'Access denied');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="nm-page flex items-center justify-center px-4 py-12 pb-40">
      <div className="max-w-md w-full">
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-3 mb-4 justify-center">
            <div className="nm-circle w-10 h-10 font-bold text-lg" style={{color:'#f59e0b'}}>M</div>
            <span className="text-xl font-bold" style={{background:'linear-gradient(135deg,#f59e0b,#f472b6)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>Memento</span>
          </Link>
          <h1 className="text-2xl font-bold mb-1" style={{color:'var(--text1)'}}>
            {user ? 'Elevate Account' : 'System Access'}
          </h1>
          <p className="text-sm" style={{color:'var(--text2)'}}>
            {user ? `Grant admin access to ${user.email}` : 'Administrator authentication required'}
          </p>
        </div>

        <div className="nm-card p-8">
          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="nm-inset p-3 text-sm" style={{color:'#f87171'}}>{error}</div>
            )}
            
            {!user && (
              <div>
                <label className="block text-xs font-semibold mb-2" style={{color:'var(--text2)'}}>Administrator Email</label>
                <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="nm-input" placeholder="system@memento.com" required />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold mb-2" style={{color:'var(--text2)'}}>Access Code</label>
              <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                className="nm-input" placeholder="Enter system access code" required />
            </div>
            <button type="submit" disabled={loading} className="nm-btn nm-btn-accent w-full py-3 font-bold">
              {loading
                ? <div className="w-5 h-5 border-2 rounded-full animate-spin mx-auto" style={{borderColor:'#252c46',borderTopColor:'#f59e0b'}} />
                : user ? '🔐 Elevate to Admin' : '🔐 Access System'}
            </button>
          </form>

          <div className="mt-6 pt-6 text-center">
            <div className="nm-divider mb-6" />
            <p className="text-xs mb-3" style={{color:'var(--text2)'}}>Return to main site?</p>
            <Link href="/" className="nm-btn px-6 py-2 text-sm" style={{color:'var(--text2)'}}>🏠 Home</Link>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs font-medium" style={{color:'#f87171'}}>⚠️ Authorized personnel only. Access is logged and monitored.</p>
        </div>
      </div>
    </div>
  );
}

