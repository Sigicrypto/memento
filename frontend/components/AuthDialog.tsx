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
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
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
      setFieldErrors({});
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

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`
        }
      });
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    setMessage('');

    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Name is required';
    if (!email.trim()) newErrors.email = 'Email is required';
    if (password.length < 6) newErrors.password = 'Min 6 characters';
    if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors);
      setError('Please fix the highlighted errors');
      setTimeout(() => setFieldErrors({}), 3000);
      return;
    }

    setLoading(true);
    try {
      const baseUrl = typeof window !== 'undefined'
        ? window.location.origin.includes('localhost') ? window.location.origin : 'https://memento-sigicryptos-projects.vercel.app'
        : process.env.NEXT_PUBLIC_SITE_URL || 'https://memento-sigicryptos-projects.vercel.app';

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

      // Trigger welcome email asynchronously
      fetch('/api/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: email.trim(),
          template: 'welcome',
          templateData: [name.trim()]
        })
      }).catch(err => console.error('Failed to send welcome email:', err));

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
    setFieldErrors({});
    setMessage('');

    const newErrors: Record<string, string> = {};
    if (!email.trim()) newErrors.email = 'Email is required';
    if (!password) newErrors.password = 'Password is required';

    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors);
      setTimeout(() => setFieldErrors({}), 3000);
      return;
    }

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


  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setFieldErrors({ email: 'Required for reset' });
      setError('Enter your email first, then click Forgot Password');
      setTimeout(() => setFieldErrors({}), 3000);
      return;
    }
    setError('');
    setFieldErrors({});
    setLoading(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://memento-sigicryptos-projects.vercel.app';
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${baseUrl}/auth/reset-password`,
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
      <div className="auth-dialog relative overflow-hidden">
        {/* Close button */}
        <button className="auth-close-btn" onClick={onClose} style={{ zIndex: 100 }}>
          <X size={20} />
        </button>

        {/* Plan badge */}
        {planInfo && (
          <div className="auth-plan-badge">
            <span>{planInfo.name} Plan</span>
          </div>
        )}

        {step === 'auth' && (
          <>
            {/* Header */}
            <div className="auth-header">
              <h2 className="auth-title">
                {tab === 'login' ? 'Welcome back' : 'Create your account'}
              </h2>
              <p className="auth-subtitle">
                {tab === 'login'
                  ? 'Sign in to access your photo walls'
                  : 'Start collecting moments from your events'}
              </p>
            </div>


            {/* Tabs */}
            <div className="auth-tabs">
              <button
                className={`auth-tab ${tab === 'signup' ? 'active' : ''}`}
                onClick={() => { setTab('signup'); setError(''); setMessage(''); }}
              >
                Sign Up
              </button>
              <button
                className={`auth-tab ${tab === 'login' ? 'active' : ''}`}
                onClick={() => { setTab('login'); setError(''); setMessage(''); }}
              >
                Login
              </button>
            </div>

            {/* Form */}
            <form onSubmit={tab === 'signup' ? handleSignUp : handleSignIn} className="auth-form">
              {tab === 'signup' && (
                <div className="auth-field">
                  <label className="auth-label">Full Name</label>
                  <div className="auth-input-wrap">
                    <User size={16} className="auth-input-icon" />
                    <input
                      type="text"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={`auth-input ${fieldErrors.name ? 'border-rose-500/50 bg-rose-500/10 animate-shake' : ''}`}
                      autoComplete="name"
                    />
                  </div>
                </div>
              )}

              <div className="auth-field">
                <label className="auth-label">Email</label>
                <div className="auth-input-wrap">
                  <Mail size={16} className="auth-input-icon" />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`auth-input ${fieldErrors.email ? 'border-rose-500/50 bg-rose-500/10 animate-shake' : ''}`}
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="auth-field">
                <label className="auth-label">Password</label>
                <div className="auth-input-wrap">
                  <Lock size={16} className="auth-input-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`auth-input ${fieldErrors.password ? 'border-rose-500/50 bg-rose-500/10 animate-shake' : ''}`}
                    autoComplete={tab === 'signup' ? 'new-password' : 'current-password'}
                  />
                  <button
                    type="button"
                    className="auth-eye-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="Toggle password visibility"
                    aria-pressed={showPassword}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {tab === 'signup' && (
                <div className="auth-field">
                  <label className="auth-label">Confirm Password</label>
                  <div className="auth-input-wrap">
                    <Lock size={16} className="auth-input-icon" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Re-enter password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`auth-input ${fieldErrors.confirmPassword ? 'border-rose-500/50 bg-rose-500/10 animate-shake' : ''}`}
                      autoComplete="new-password"
                    />
                  </div>
                </div>
              )}

              {tab === 'login' && (
                <button type="button" className="auth-forgot-btn" onClick={handleForgotPassword}>
                  Forgot password?
                </button>
              )}

              {error && <div className="auth-error">{error}</div>}
              {message && <div className="auth-message">{message}</div>}

              <button type="submit" className="auth-submit-btn" disabled={loading}>
                {loading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <>
                    <span>{tab === 'signup' ? 'Create Account' : 'Sign In'}</span>
                  </>
                )}
              </button>

              <div className="flex items-center gap-4 my-3 opacity-50">
                <div className="h-px bg-white/20 flex-grow"></div>
                <span className="text-[10px] font-black uppercase tracking-widest text-white/50">OR</span>
                <div className="h-px bg-white/20 flex-grow"></div>
              </div>

              <button 
                type="button" 
                onClick={() => signInWithGoogle()} 
                className="w-full flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-sm font-bold text-white rounded-[12px] py-4"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25C22.56 11.47 22.49 10.73 22.37 10H12V14.26H17.92C17.67 15.63 16.89 16.81 15.74 17.58V20.34H19.3C21.38 18.42 22.56 15.6 22.56 12.25Z" fill="#4285F4"/>
                  <path d="M12 23C14.97 23 17.46 22.02 19.3 20.34L15.74 17.58C14.74 18.25 13.48 18.66 12 18.66C9.13 18.66 6.7 16.73 5.82 14.13H2.15V16.98C4.01 20.67 7.7 23 12 23Z" fill="#34A853"/>
                  <path d="M5.82 14.13C5.6 13.47 5.47 12.76 5.47 12C5.47 11.24 5.6 10.53 5.82 9.87V7.02H2.15C1.38 8.56 0.95 10.24 0.95 12C0.95 13.76 1.38 15.44 2.15 16.98L5.82 14.13Z" fill="#FBBC05"/>
                  <path d="M12 5.34C13.62 5.34 15.06 5.89 16.2 6.99L19.39 3.8C17.45 2 14.97 0.95 12 0.95C7.7 0.95 4.01 3.33 2.15 7.02L5.82 9.87C6.7 7.27 9.13 5.34 12 5.34Z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>
            </form>

            <p className="auth-footer-text">
              {tab === 'signup' ? 'Already have an account?' : "Don't have an account?"}
              <button
                className="auth-switch-btn"
                onClick={() => { setTab(tab === 'signup' ? 'login' : 'signup'); setError(''); setMessage(''); }}
              >
                {tab === 'signup' ? 'Sign In' : 'Sign Up'}
              </button>
            </p>
          </>
        )}

        {step === 'success' && (
          <div className="auth-success">
            <div className="auth-success-icon">
              <Check size={32} />
            </div>
            <h2 className="auth-title">You&apos;re all set!</h2>
            <p className="auth-subtitle">
              {message || 'Your account has been created. Redirecting to your dashboard...'}
            </p>
            <button className="auth-submit-btn" onClick={onClose}>
              <span>Go to Dashboard</span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
