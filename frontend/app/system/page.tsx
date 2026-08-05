"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import AnimatedLogo from '@/components/AnimatedLogo';
import ThemeToggle from '@/components/ThemeToggle';
import { motion } from 'framer-motion';
import { ShieldCheck, Lock, AlertTriangle, ArrowLeft, Key, CheckCircle, Home } from 'lucide-react';

export default function SystemAdminPage() {
  const { user, isAdmin, isLoading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showFallback, setShowFallback] = useState(false);

  // Auto-redirect if already admin
  useEffect(() => {
    if (!isLoading && user && isAdmin) {
      router.push('/admin');
    }
  }, [user, isAdmin, isLoading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (user) {
        const response = await fetch('/api/admin/elevate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, accessCode: password }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Elevation failed');
      } else {
        const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
              emailRedirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/system/callback`
            }
          });

          if (signUpError) throw signUpError;

          if (signUpData.user) {
            const response = await fetch('/api/admin/elevate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId: signUpData.user.id, accessCode: password }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Elevation failed');
          }
        } else if (authData.user) {
          const response = await fetch('/api/admin/elevate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: authData.user.id, accessCode: password }),
          });
          const data = await response.json();
          if (!response.ok) throw new Error(data.error || 'Elevation failed');
        }
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        document.cookie = `sb-access-token=${session.access_token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax; Secure`;
      }

      setMessage('Access granted! Redirecting to admin panel...');
      setTimeout(() => {
        window.location.href = '/admin';
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Access denied');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-20 px-6 bg-bg relative overflow-hidden">
      {/* Background Effects */}
      <div className="grain" />
      <div className="orbs">
        <div className="orb orb-primary opacity-30" />
        <div className="orb orb-secondary opacity-30" />
      </div>

      {/* Top Header Bar */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        height: '64px', background: 'var(--surface)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px',
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '13px', fontWeight: 600 }}>
          <ArrowLeft size={18} />
          <span className="hidden sm:inline">Back to Home</span>
        </Link>
        
        <AnimatedLogo width={110} height={28} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <ThemeToggle />
        </div>
      </nav>

      {/* Main Form Container */}
      <main className="w-full max-w-lg mx-auto relative z-10 pt-12 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            padding: '40px 36px',
            borderRadius: '28px',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            boxShadow: '0 24px 64px rgba(0, 0, 0, 0.25)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Top Title Section */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div
              style={{
                width: '56px', height: '56px', borderRadius: '18px',
                background: 'color-mix(in srgb, var(--accent-cyan) 12%, transparent)',
                border: '1px solid color-mix(in srgb, var(--accent-cyan) 25%, transparent)',
                color: 'var(--accent-cyan)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px',
              }}
            >
              <ShieldCheck size={28} />
            </div>

            <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 6px' }}>
              {user ? 'Elevate Account' : 'System Access'}
            </h1>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
              {user ? `Grant admin access to ${user.email}` : 'Administrator authentication required'}
            </p>
          </div>

          {user ? (
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
              {error && (
                <div style={{
                  padding: '14px 16px', borderRadius: '12px',
                  background: 'color-mix(in srgb, var(--error) 12%, transparent)',
                  border: '1px solid color-mix(in srgb, var(--error) 25%, transparent)',
                  display: 'flex', alignItems: 'center', gap: '10px',
                  color: 'var(--error)', fontSize: '13px', fontWeight: 600,
                }}>
                  <AlertTriangle size={18} style={{ flexShrink: 0 }} />
                  <span>{error}</span>
                </div>
              )}

              {message && (
                <div style={{
                  padding: '14px 16px', borderRadius: '12px',
                  background: 'color-mix(in srgb, var(--success) 12%, transparent)',
                  border: '1px solid color-mix(in srgb, var(--success) 25%, transparent)',
                  display: 'flex', alignItems: 'center', gap: '10px',
                  color: 'var(--success)', fontSize: '13px', fontWeight: 600,
                }}>
                  <CheckCircle size={18} style={{ flexShrink: 0 }} />
                  <span>{message}</span>
                </div>
              )}

              {/* Authenticated Account Box */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-secondary)' }}>
                  Authenticated As
                </label>
                <div style={{
                  padding: '14px 16px',
                  borderRadius: '14px',
                  border: '1px solid var(--border)',
                  background: 'var(--bg-subtle)',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  fontWeight: 600,
                }}>
                  {user.email}
                </div>
              </div>

              {/* Access Code Input */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--accent-cyan)' }}>
                  System Access Code
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter system access code"
                    required
                    style={{
                      width: '100%',
                      padding: '14px 16px 14px 48px',
                      borderRadius: '14px',
                      border: '1px solid var(--border)',
                      background: 'var(--bg)',
                      color: 'var(--text-primary)',
                      fontSize: '14px',
                      fontWeight: 500,
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  padding: '16px',
                  fontSize: '15px',
                  fontWeight: 700,
                  borderRadius: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  marginTop: '8px',
                  cursor: 'pointer',
                }}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Key size={18} />
                    <span>Elevate to Admin</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'center' }}>
              <div style={{
                padding: '20px',
                borderRadius: '16px',
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border)',
                fontSize: '13px',
                color: 'var(--text-secondary)',
                lineHeight: 1.6,
              }}>
                You must be <strong style={{ color: 'var(--text-primary)' }}>signed in to your main account</strong> before you can elevate your permissions using a system code.
              </div>

              <Link
                href="/auth"
                className="btn btn-primary"
                style={{
                  width: '100%',
                  padding: '16px',
                  fontSize: '15px',
                  fontWeight: 700,
                  borderRadius: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  textDecoration: 'none',
                }}
              >
                <Key size={18} />
                <span>Login with Your Account</span>
              </Link>

              <div style={{ paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                {!showFallback ? (
                  <button
                    type="button"
                    onClick={() => setShowFallback(true)}
                    style={{
                      background: 'none', border: 'none',
                      fontSize: '11px', fontWeight: 800,
                      textTransform: 'uppercase', letterSpacing: '0.06em',
                      color: 'var(--text-muted)', cursor: 'pointer',
                    }}
                  >
                    Use emergency fallback instead?
                  </button>
                ) : (
                  <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
                    <p style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', textAlign: 'center', margin: 0 }}>
                      Emergency Fallback Login
                    </p>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Admin Email"
                      required
                      style={{
                        width: '100%', padding: '14px 16px', borderRadius: '14px',
                        border: '1px solid var(--border)', background: 'var(--bg)',
                        color: 'var(--text-primary)', fontSize: '14px', outline: 'none',
                      }}
                    />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Access Code"
                      required
                      style={{
                        width: '100%', padding: '14px 16px', borderRadius: '14px',
                        border: '1px solid var(--border)', background: 'var(--bg)',
                        color: 'var(--text-primary)', fontSize: '14px', outline: 'none',
                      }}
                    />
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn btn-primary"
                      style={{ width: '100%', padding: '14px', borderRadius: '14px', fontSize: '14px', fontWeight: 700 }}
                    >
                      {loading ? 'Authenticating...' : 'Access System'}
                    </button>
                    {error && (
                      <p style={{ fontSize: '12px', color: 'var(--error)', margin: 0, textAlign: 'center' }}>
                        {error}
                      </p>
                    )}
                  </form>
                )}
              </div>
            </div>
          )}

          {/* Return Home Option */}
          <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
            <Link
              href="/"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                fontSize: '13px', color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 600,
              }}
            >
              <Home size={16} />
              <span>Return to Main Site</span>
            </Link>
          </div>
        </motion.div>

        {/* Security Warning Banner */}
        <div style={{
          marginTop: '24px',
          padding: '16px 20px',
          borderRadius: '16px',
          background: 'color-mix(in srgb, var(--error) 10%, transparent)',
          border: '1px solid color-mix(in srgb, var(--error) 20%, transparent)',
          textAlign: 'center',
        }}>
          <p style={{
            fontSize: '11px', fontWeight: 800, textTransform: 'uppercase',
            letterSpacing: '0.06em', color: 'var(--error)', margin: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          }}>
            <AlertTriangle size={16} style={{ flexShrink: 0 }} />
            <span>Authorized personnel only. Access is logged and monitored.</span>
          </p>
        </div>
      </main>
    </div>
  );
}
