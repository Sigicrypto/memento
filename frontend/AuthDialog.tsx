"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { X, Mail, Lock, User, Eye, EyeOff, Loader2, Check, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type PlanType = 'starter' | 'standard' | 'premium' | 'whitelabel' | null;
type AuthTab = 'login' | 'signup';
type AuthStep = 'auth' | 'payment' | 'success';
type Region = 'IN' | 'OM' | 'GLOBAL';

function getRegion(): Region {
  if (typeof document === 'undefined') return 'GLOBAL';
  const match = document.cookie.match(/(^| )livewall_region=([^;]+)/);
  const val = match?.[2];
  if (val === 'IN') return 'IN';
  if (val === 'OM') return 'OM';
  return 'GLOBAL';
}

const WA_NUMBER = '96896095692'; // +968 96095692

function buildWhatsAppUrl(name: string, plan: PlanType): string {
  const planLabel = plan ? plan.charAt(0).toUpperCase() + plan.slice(1) : 'a plan';
  const msg = encodeURIComponent(
    `Hi! I just signed up for Memento.\n\nName: ${name}\nPlan: ${planLabel}\n\nPlease guide me on how to proceed with the payment.`
  );
  return `https://wa.me/${WA_NUMBER}?text=${msg}`;
}

interface AuthDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlan?: PlanType;
  initialTab?: AuthTab;
  onAuthSuccess?: (userId: string, plan: PlanType) => void;
}

const PLAN_LABELS: Record<string, { name: string; emoji: string; color: string }> = {
  starter: { name: 'Starter', emoji: '🟢', color: '#22c55e' },
  standard: { name: 'Standard', emoji: '🔵', color: '#3b82f6' },
  premium: { name: 'Premium', emoji: '🟣', color: '#a855f7' },
  whitelabel: { name: 'White Label', emoji: '🟡', color: '#eab308' },
};

export default function AuthDialog({ isOpen, onClose, selectedPlan = null, initialTab = 'signup', onAuthSuccess }: AuthDialogProps) {
  const router = useRouter();
  const [tab, setTab] = useState<AuthTab>(initialTab);
  const [step, setStep] = useState<AuthStep>('auth');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [plan, setPlan] = useState<PlanType>(selectedPlan);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Sync initial state
  useEffect(() => {
    if (isOpen) {
      if (selectedPlan) setPlan(selectedPlan);
      setTab(initialTab);
    }
  }, [isOpen, selectedPlan, initialTab]);

  // Reset state on open
  useEffect(() => {
    if (isOpen) {
      setError('');
      setMessage('');
      setStep('auth');
    }
  }, [isOpen]);

  // Close on ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!name.trim()) { setError('Please enter your name'); return; }
    if (!email.trim()) { setError('Please enter your email'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match'); return; }

    setLoading(true);
    try {
      const baseUrl = typeof window !== 'undefined'
        ? window.location.origin
        : process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: name.trim(),
            plan_type: plan || 'starter',
          },
          emailRedirectTo: `${baseUrl}/auth/callback?plan=${plan || 'starter'}`,
        },
      });

      if (signUpError) throw signUpError;

      if (data.user) {
        // Insert profile row
        await supabase.from('profiles').upsert({
          id: data.user.id,
          full_name: name.trim(),
          email: email.trim(),
          plan: plan || 'starter',
        });

        // ── Oman: redirect to WhatsApp for manual payment ──
        const region = getRegion();
        if (region === 'OM' && plan && plan !== 'starter') {
          setMessage('Account created! Redirecting you to WhatsApp for payment...');
          setStep('success');
          setTimeout(() => {
            window.open(buildWhatsAppUrl(name.trim(), plan), '_blank');
          }, 1500);
          return;
        }

        setMessage('Check your email for a confirmation link!');
        // If email confirmation is disabled in Supabase, proceed directly
        if (data.session) {
          onAuthSuccess?.(data.user.id, plan);
          setStep('success');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Sign up failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!email.trim()) { setError('Please enter your email'); return; }
    if (!password) { setError('Please enter your password'); return; }

    setLoading(true);
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) throw signInError;

      if (data.user) {
        // If a paid plan was selected, redirect to payment
        if (plan && plan !== 'starter') {
          router.push(`/checkout?plan=${plan}`);
        } else {
          // Otherwise, redirect to dashboard
          router.push('/dashboard');
        }
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Sign in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: 'google') => {
    setError('');
    setLoading(true);
    try {
      const baseUrl = typeof window !== 'undefined'
        ? window.location.origin
        : process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${baseUrl}/auth/callback?plan=${plan || 'starter'}`,
        },
      });
      if (oauthError) throw oauthError;
    } catch (err: any) {
      setError(err.message || 'OAuth login failed');
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) { setError('Enter your email first, then click Forgot Password'); return; }
    setError('');
    setLoading(true);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      if (resetError) throw resetError;
      setMessage('Password reset link sent to your email!');
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  const planInfo = plan ? PLAN_LABELS[plan] : null;

  return (
    <div
      ref={overlayRef}
      className="auth-dialog-overlay"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div className="auth-dialog glass-panel" style={{ padding: '2.5rem', border: 'none', boxShadow: '0 40px 80px rgba(0,0,0,0.6)' }}>
        {/* Close button */}
        <button className="auth-close-btn text-text-secondary hover:text-white transition-colors" onClick={onClose}>
          <X size={20} />
        </button>

        {/* Plan badge */}
        {planInfo && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 mb-6" style={{ borderColor: `${planInfo.color}30` }}>
            <span className="text-sm">{planInfo.emoji}</span>
            <span className="text-xs font-bold tracking-wider uppercase" style={{ color: planInfo.color }}>{planInfo.name} Plan</span>
          </div>
        )}

        {step === 'auth' && (
          <div className="w-full">
            {/* Header */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">
                {tab === 'login' ? 'Welcome back' : 'Create account'}
              </h2>
              <p className="text-text-secondary">
                {tab === 'login'
                  ? 'Access your event walls'
                  : 'Start collecting moments instantly'}
              </p>
            </div>

            {/* OAuth buttons */}
            <div className="mb-6">
              <button 
                className="btn-secondary w-full h-12 flex items-center justify-center gap-3 rounded-xl hover:bg-white/10 transition-all font-medium" 
                onClick={() => handleOAuth('google')} 
                disabled={loading}
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                <span>Continue with Google</span>
              </button>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-4 mb-6">
              <div className="h-px flex-1 bg-white/10"></div>
              <span className="text-xs text-text-muted uppercase tracking-widest font-bold">OR</span>
              <div className="h-px flex-1 bg-white/10"></div>
            </div>

            {/* Form */}
            <form onSubmit={tab === 'signup' ? handleSignUp : handleSignIn} className="space-y-4">
              {tab === 'signup' && (
                <div className="input-group">
                  <label className="label">Full Name</label>
                  <div className="relative">
                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                    <input
                      type="text"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="input pl-10 h-11"
                      autoComplete="name"
                    />
                  </div>
                </div>
              )}

              <div className="input-group">
                <label className="label">Email</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    type="email"
                    placeholder="you@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input pl-10 h-11"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="input-group">
                <label className="label">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input pl-10 h-11"
                    autoComplete={tab === 'signup' ? 'new-password' : 'current-password'}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-white transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {tab === 'signup' && (
                <div className="input-group">
                  <label className="label">Confirm Password</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Re-enter password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="input pl-10 h-11"
                      autoComplete="new-password"
                    />
                  </div>
                </div>
              )}

              {tab === 'login' && (
                <div className="flex justify-end">
                  <button type="button" className="text-xs text-text-muted hover:text-primary transition-colors font-medium" onClick={handleForgotPassword}>
                    Forgot password?
                  </button>
                </div>
              )}

              {error && (
                <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                  {error}
                </div>
              )}
              {message && (
                <div className="px-4 py-3 rounded-xl bg-primary/10 border border-primary/20 text-primary text-sm">
                  {message}
                </div>
              )}

              <button type="submit" className="btn-primary w-full h-12 rounded-xl text-base font-bold flex items-center justify-center gap-2" disabled={loading}>
                {loading ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <>
                    <span>{tab === 'signup' ? 'Create Account' : 'Sign In'}</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-white/5 text-center">
              <p className="text-sm text-text-secondary">
                {tab === 'signup' ? 'Already have an account?' : "Don't have an account?"}
                <button
                  className="ml-2 font-bold text-white hover:text-primary transition-colors"
                  onClick={() => { setTab(tab === 'signup' ? 'login' : 'signup'); setError(''); setMessage(''); }}
                >
                  {tab === 'signup' ? 'Sign In' : 'Sign Up'}
                </button>
              </p>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-primary/10 border border-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check size={32} className="text-primary" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">You&apos;re all set!</h2>
            <p className="text-text-secondary mb-8">
              {message || 'Your account has been created successfully. One last step to your dashboard.'}
            </p>
            <button className="btn-primary w-full h-12 rounded-xl font-bold" onClick={onClose}>
              <span>Enter Dashboard</span>
              <ArrowRight size={18} className="ml-2 inline" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
