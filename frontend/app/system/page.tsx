"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import AnimatedLogo from '@/components/AnimatedLogo';

export default function SystemAdminPage() {
  const { user, profile } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
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

      // If user is already logged in (e.g. Google), ensure profile exists with admin role
      if (user) {
        const { error: upsertError } = await supabase
          .from('profiles')
          .upsert({ 
            id: user.id, 
            email: user.email,
            role: 'admin',
            // Preserve existing data if any
            full_name: profile?.full_name || user.user_metadata?.full_name || 'Admin',
          });

        if (upsertError) throw upsertError;
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

      // Set session cookie for middleware
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        document.cookie = `sb-access-token=${session.access_token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax; Secure`;
      }

      setMessage('Access granted! Redirecting to admin panel...');
      setTimeout(() => {
        router.push('/admin');
      }, 1000);
    } catch (error: any) {
      setError(error.message || 'Access denied');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="lp min-h-screen relative overflow-hidden flex flex-col items-center justify-center pt-24 pb-12 px-4">
      <div className="aurora-bg fixed inset-0 z-0" />
      <div className="grain fixed inset-0 z-1 opacity-[0.03] pointer-events-none" />

      <div className="relative z-10 max-w-md w-full">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-6 justify-center group transform hover:scale-105 transition-all">
            <AnimatedLogo width={220} height={70} />
          </Link>
          <h1 className="text-3xl font-bold mb-2 text-white tracking-tight">
            {user ? 'Elevate Account' : 'System Access'}
          </h1>
          <p className="text-sm text-slate-400 px-4">
            {user ? `Grant admin access to ${user.email}` : 'Administrator authentication required'}
          </p>
        </div>

        <div className="gcard cinematic-glow shadow-2xl">
          <div className="gcard-border" />
          <div className="gcard-inner p-8">
            {user ? (
              <form onSubmit={handleLogin} className="space-y-6">
                {error && (
                  <div className="p-3 text-sm rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
                    {error}
                  </div>
                )}
                {message && (
                  <div className="p-3 text-sm rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                    {message}
                  </div>
                )}
                
                <div>
                  <label className="block text-xs font-bold mb-2 uppercase tracking-wide text-slate-500">Authenticated As</label>
                  <div className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-300 font-medium">
                    {user.email}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold mb-2 uppercase tracking-wide text-amber-500/80">Access Code</label>
                  <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all font-medium" 
                    placeholder="Enter system access code" required />
                </div>

                <button type="submit" disabled={loading} className="btn-hero-primary w-full !py-3 shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2">
                  {loading
                    ? <div className="w-5 h-5 border-2 rounded-full animate-spin border-white/20 border-t-white" />
                    : <>🔐 Elevate to Admin</>}
                </button>
              </form>
            ) : (
              <div className="space-y-6 text-center">
                <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 text-sm text-slate-400 leading-relaxed">
                  You must be <span className="text-white font-bold">logged in to your main account</span> before you can elevate to Administrator status using the system code.
                </div>
                
                <Link href="/auth" className="btn-hero-primary w-full !py-3 shadow-lg shadow-amber-500/20 inline-flex items-center justify-center gap-2">
                  🔑 Login with your Account
                </Link>

                <div className="pt-4">
                  <p className="text-[10px] uppercase font-black tracking-widest text-slate-500 mb-4">Or use emergency fallback</p>
                  <form onSubmit={handleLogin} className="space-y-4 text-left">
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none text-sm" 
                      placeholder="Admin Email" required />
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none text-sm" 
                      placeholder="Access Code" required />
                    <button type="submit" disabled={loading} className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-all text-sm">
                      Access System
                    </button>
                    {error && <p className="text-[10px] text-rose-400 text-center">{error}</p>}
                  </form>
                </div>
              </div>
            )}

            <div className="mt-8 pt-6 text-center">
              <div className="w-full h-px bg-white/10 mb-6" />
              <p className="text-xs mb-4 text-slate-500 font-medium uppercase tracking-widest">Return to main site?</p>
              <Link href="/" className="px-6 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-all inline-block font-semibold shadow-sm">🏠 Back Home</Link>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center p-4 rounded-xl bg-rose-500/5 border border-rose-500/10">
          <p className="text-xs font-bold text-rose-400/80 uppercase tracking-wider flex items-center justify-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            Authorized personnel only.<br/>Access is logged and monitored.
          </p>
        </div>
      </div>
    </main>
  );
}
