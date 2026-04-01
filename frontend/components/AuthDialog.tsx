"use client";

import React, { useState, useEffect, useRef } from 'react';
import { X, Mail, Lock, User, Eye, EyeOff, Loader2, Check, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type PlanType = 'starter' | 'standard' | 'premium' | 'whitelabel' | null;
type AuthTab = 'login' | 'signup';
type AuthStep = 'auth' | 'payment' | 'success';

interface AuthDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlan?: PlanType;
  onAuthSuccess?: (userId: string, plan: PlanType) => void;
}

const PLAN_LABELS: Record<string, { name: string; emoji: string; color: string }> = {
  starter: { name: 'Starter', emoji: '🟢', color: '#22c55e' },
  standard: { name: 'Standard', emoji: '🔵', color: '#3b82f6' },
  premium: { name: 'Premium', emoji: '🟣', color: '#a855f7' },
  whitelabel: { name: 'White Label', emoji: '🟡', color: '#eab308' },
};

export default function AuthDialog({ isOpen, onClose, selectedPlan = null, onAuthSuccess }: AuthDialogProps) {
  const [tab, setTab] = useState<AuthTab>('signup');
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

  // Sync selectedPlan prop
  useEffect(() => {
    if (selectedPlan) setPlan(selectedPlan);
  }, [selectedPlan]);

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
          window.location.href = `/checkout?plan=${plan}`;
        } else {
          // Otherwise, redirect to dashboard
          window.location.href = '/dashboard';
        }
      }
    } catch (err: any) {
      setError(err.message || 'Sign in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: 'google' | 'github') => {
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
      <div className="auth-dialog">
        {/* Close button */}
        <button className="auth-close-btn" onClick={onClose}>
          <X size={20} />
        </button>

        {/* Plan badge */}
        {planInfo && (
          <div className="auth-plan-badge" style={{ borderColor: `${planInfo.color}30`, background: `${planInfo.color}08` }}>
            <span>{planInfo.emoji}</span>
            <span style={{ color: planInfo.color, fontWeight: 600 }}>{planInfo.name} Plan</span>
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

            {/* OAuth buttons */}
            <div className="auth-oauth-row">
              <button className="auth-oauth-btn" onClick={() => handleOAuth('google')} disabled={loading}>
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span>Google</span>
              </button>
              <button className="auth-oauth-btn" onClick={() => handleOAuth('github')} disabled={loading}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
                </svg>
                <span>GitHub</span>
              </button>
            </div>

            {/* Divider */}
            <div className="auth-divider">
              <span>or continue with email</span>
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
                      className="auth-input"
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
                    className="auth-input"
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
                    className="auth-input"
                    autoComplete={tab === 'signup' ? 'new-password' : 'current-password'}
                  />
                  <button
                    type="button"
                    className="auth-eye-btn"
                    onClick={() => setShowPassword(!showPassword)}
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
                      className="auth-input"
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
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <>
                    <span>{tab === 'signup' ? 'Create Account' : 'Sign In'}</span>
                    <ArrowRight size={16} />
                  </>
                )}
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
