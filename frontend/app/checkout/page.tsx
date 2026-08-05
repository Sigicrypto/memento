"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, Shield, Clock, Sparkles, MessageCircle, IndianRupee, CreditCard } from 'lucide-react';
import AnimatedLogo from '@/components/AnimatedLogo';

const PLAN_PRICES: Record<string, { IN: string; amount: string }> = {
  STARTER:       { IN: '₹2,499',  amount: '2,499' },
  STANDARD:      { IN: '₹4,999',  amount: '4,999' },
  PREMIUM:       { IN: '₹7,499',  amount: '7,499' },
  'WHITE LABEL': { IN: '₹9,999', amount: '9,999' },
  'WHITE_LABEL':  { IN: '₹9,999', amount: '9,999' },
};

const PLAN_DISPLAY_NAMES: Record<string, string> = {
  STARTER: 'Starter', STANDARD: 'Standard', PREMIUM: 'Premium',
  'WHITE LABEL': 'White Label', 'WHITE_LABEL': 'White Label',
};

const PLAN_FEATURES: Record<string, string[]> = {
  STARTER: ['Live Photo Wall', '25 uploads/guest', 'ZIP Download', '1 Month Storage'],
  STANDARD: ['Everything in Starter', '50 uploads/guest', 'AI Face Discovery', 'Slideshow TV Mode', 'Real-time Reactions', '3 Month Storage'],
  PREMIUM: ['Everything in Standard', 'Unlimited uploads', 'Cinematic Soundtrack', 'Priority 24/7 Support', '6 Month Storage'],
  'WHITE_LABEL': ['Everything in Premium', 'Custom Domain', 'Full Branding Removal', 'Partner Resell Rights', 'Concierge Setup'],
  'WHITE LABEL': ['Everything in Premium', 'Custom Domain', 'Full Branding Removal', 'Partner Resell Rights', 'Concierge Setup'],
};

function CheckoutContent() {
  const searchParams = useSearchParams();
  const planName = searchParams.get('plan') || 'STANDARD';
  const router = useRouter();
  const { user, isLoading } = useAuth();
  
  const [status, setStatus] = useState<'IDLE' | 'PENDING_MANUAL'>('IDLE');
  const [eventData, setEventData] = useState<{ name: string } | null>(null);

  const eventId = searchParams.get('eventId');

  useEffect(() => {
    if (!isLoading && !user) {
      const currentUrl = encodeURIComponent(window.location.pathname + window.location.search);
      router.push(`/auth?redirect=${currentUrl}`);
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (eventId) {
      supabase.from('events').select('name').eq('id', eventId).single().then(({ data }) => {
        if (data) setEventData(data);
      });
    }
  }, [eventId]);

  const planKey = planName.toUpperCase();
  const planLabel = PLAN_DISPLAY_NAMES[planKey] || planName;
  const prices = PLAN_PRICES[planKey] || { IN: '₹5,000', amount: '5,000' };
  const features = PLAN_FEATURES[planKey] || PLAN_FEATURES['STANDARD'];

  const whatsappMessage = encodeURIComponent(
    `Hi! I'd like to purchase the Memento *${planLabel}* plan.\n\nEmail: ${user?.email || ''}\nPlan: ${planLabel} (${prices.IN})\n${eventData ? `Event: ${eventData.name}\n` : ''}\nPlease guide me with the payment process.`
  );

  if (isLoading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <div className="w-10 h-10 border-3 border-border border-t-accent-cyan rounded-full animate-spin" />
    </div>
  );

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', position: 'relative', overflow: 'hidden' }}>
      {/* Background */}
      <div className="grain" />
      <div className="orbs">
        <div className="orb orb-primary opacity-30" />
        <div className="orb orb-secondary opacity-30" />
      </div>

      {/* Top Nav Header */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        height: '64px', background: 'var(--surface)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px',
      }}>
        <Link href="/#pricing" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '13px', fontWeight: 600 }}>
          <ArrowLeft size={18} />
          <span className="hidden sm:inline">Back to Pricing</span>
        </Link>
        <AnimatedLogo width={110} height={28} />
        <div style={{ width: '100px' }} />
      </nav>

      {/* Main Content */}
      <div style={{
        position: 'relative', zIndex: 10,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', padding: '96px 20px 40px',
      }}>
        {status === 'IDLE' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ width: '100%', maxWidth: '520px' }}
          >
            {/* Main Card */}
            <div style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '28px',
              boxShadow: '0 24px 64px rgba(0, 0, 0, 0.25)',
              overflow: 'hidden',
            }}>
              {/* Card Header — Plan Summary */}
              <div style={{
                padding: '36px 36px 28px',
                borderBottom: '1px solid var(--border)',
                background: 'linear-gradient(135deg, color-mix(in srgb, var(--accent-cyan) 6%, var(--surface)), var(--surface))',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <div>
                    <p style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '4px' }}>
                      Selected Plan
                    </p>
                    <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                      Memento {planLabel}
                    </h1>
                  </div>
                  <div style={{
                    padding: '10px 20px',
                    borderRadius: '16px',
                    background: 'color-mix(in srgb, var(--accent-cyan) 12%, transparent)',
                    border: '1px solid color-mix(in srgb, var(--accent-cyan) 25%, transparent)',
                  }}>
                    <span style={{ fontSize: '24px', fontWeight: 800, color: 'var(--accent-cyan)' }}>{prices.IN}</span>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginLeft: '4px' }}>/event</span>
                  </div>
                </div>

                {eventData && (
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 8px' }}>
                    For event: <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>&quot;{eventData.name}&quot;</span>
                  </p>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}>
                  <span style={{
                    padding: '4px 12px', borderRadius: '999px', fontSize: '11px', fontWeight: 700,
                    background: 'color-mix(in srgb, var(--success) 15%, transparent)',
                    border: '1px solid color-mix(in srgb, var(--success) 25%, transparent)',
                    color: 'var(--success)',
                  }}>
                    ✓ One-time Payment
                  </span>
                  <span style={{
                    padding: '4px 12px', borderRadius: '999px', fontSize: '11px', fontWeight: 700,
                    background: 'color-mix(in srgb, var(--accent-cyan) 12%, transparent)',
                    border: '1px solid color-mix(in srgb, var(--accent-cyan) 20%, transparent)',
                    color: 'var(--accent-cyan)',
                  }}>
                    No Subscription
                  </span>
                </div>
              </div>

              {/* Features Included */}
              <div style={{ padding: '28px 36px', borderBottom: '1px solid var(--border)' }}>
                <p style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: '16px' }}>
                  What&apos;s Included
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {features.map((feature, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Check size={14} style={{ color: 'var(--success)', flexShrink: 0 }} />
                      <span style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 500 }}>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Section */}
              <div style={{ padding: '32px 36px' }}>
                <p style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: '20px' }}>
                  How to Purchase
                </p>

                {/* WhatsApp CTA — Primary */}
                <div style={{
                  padding: '24px',
                  borderRadius: '20px',
                  background: 'linear-gradient(135deg, rgba(37, 211, 102, 0.12), rgba(18, 140, 126, 0.08))',
                  border: '1px solid rgba(37, 211, 102, 0.25)',
                  marginBottom: '20px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '10px',
                      background: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    </div>
                    <div>
                      <p style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Message us on WhatsApp</p>
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>Get instant access within minutes</p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      window.open(`https://wa.me/96896095692?text=${whatsappMessage}`, '_blank');
                      setStatus('PENDING_MANUAL');
                    }}
                    style={{
                      width: '100%',
                      padding: '16px',
                      borderRadius: '14px',
                      border: 'none',
                      background: 'linear-gradient(135deg, #25D366, #128C7E)',
                      color: '#fff',
                      fontSize: '15px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px',
                      boxShadow: '0 4px 16px rgba(37, 211, 102, 0.3)',
                      transition: 'transform 0.15s, box-shadow 0.15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(37, 211, 102, 0.4)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(37, 211, 102, 0.3)'; }}
                  >
                    <MessageCircle size={20} />
                    Contact on WhatsApp to Purchase
                  </button>
                </div>

                {/* Coming Soon — More Payment Options */}
                <div style={{
                  padding: '20px 24px',
                  borderRadius: '16px',
                  background: 'var(--bg-subtle)',
                  border: '1px solid var(--border)',
                  marginBottom: '24px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <div style={{
                      width: '32px', height: '32px', borderRadius: '10px',
                      background: 'color-mix(in srgb, var(--accent-cyan) 15%, transparent)',
                      border: '1px solid color-mix(in srgb, var(--accent-cyan) 20%, transparent)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'var(--accent-cyan)',
                    }}>
                      <CreditCard size={16} />
                    </div>
                    <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                      More payment options coming soon
                    </p>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
                    UPI, Net Banking, Credit/Debit Cards, and Razorpay integration are on the way. For now, reach out via WhatsApp for a quick, hassle-free setup.
                  </p>
                </div>

                {/* Trust Signals */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '11px', fontWeight: 600 }}>
                    <Shield size={14} style={{ color: 'var(--success)' }} />
                    Secure & Private
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '11px', fontWeight: 600 }}>
                    <Clock size={14} style={{ color: 'var(--accent-cyan)' }} />
                    Instant Activation
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '11px', fontWeight: 600 }}>
                    <Sparkles size={14} style={{ color: '#f59e0b' }} />
                    No Hidden Fees
                  </div>
                </div>
              </div>
            </div>

            {/* Cancel Link */}
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <Link
                href="/#pricing"
                style={{ fontSize: '13px', color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 600 }}
              >
                ← Back to Pricing
              </Link>
            </div>
          </motion.div>
        )}

        {status === 'PENDING_MANUAL' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            style={{ width: '100%', maxWidth: '480px' }}
          >
            <div style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '28px',
              boxShadow: '0 24px 64px rgba(0, 0, 0, 0.25)',
              padding: '48px 40px',
              textAlign: 'center',
            }}>
              {/* Animated Check Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', damping: 12 }}
                style={{
                  width: '80px', height: '80px', borderRadius: '24px',
                  background: 'linear-gradient(135deg, rgba(37, 211, 102, 0.15), rgba(18, 140, 126, 0.1))',
                  border: '2px solid rgba(37, 211, 102, 0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 24px',
                  boxShadow: '0 8px 32px rgba(37, 211, 102, 0.15)',
                }}
              >
                <svg width="36" height="36" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              </motion.div>

              <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
                Message Sent!
              </h2>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '28px', lineHeight: 1.6 }}>
                We&apos;ve opened WhatsApp for you. Our team will respond shortly and help you complete your <span style={{ fontWeight: 700, color: 'var(--accent-cyan)' }}>{planLabel}</span> purchase.
              </p>

              {/* What Happens Next */}
              <div style={{
                padding: '20px 24px',
                borderRadius: '16px',
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border)',
                textAlign: 'left',
                marginBottom: '28px',
              }}>
                <p style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: '14px' }}>
                  What happens next?
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    { step: '1', text: 'Our team responds on WhatsApp' },
                    { step: '2', text: 'Complete payment via preferred method' },
                    { step: '3', text: 'Your account is upgraded instantly' },
                  ].map(({ step, text }) => (
                    <div key={step} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '28px', height: '28px', borderRadius: '8px', flexShrink: 0,
                        background: 'color-mix(in srgb, var(--accent-cyan) 15%, transparent)',
                        border: '1px solid color-mix(in srgb, var(--accent-cyan) 25%, transparent)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '12px', fontWeight: 800, color: 'var(--accent-cyan)',
                      }}>
                        {step}
                      </div>
                      <span style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 500 }}>{text}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => window.open(`https://wa.me/96896095692?text=${whatsappMessage}`, '_blank')}
                  style={{
                    flex: 1, padding: '14px', borderRadius: '14px', border: 'none',
                    background: 'linear-gradient(135deg, #25D366, #128C7E)', color: '#fff',
                    fontSize: '14px', fontWeight: 700, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  }}
                >
                  <MessageCircle size={16} />
                  Open WhatsApp
                </button>
                <button
                  onClick={() => router.push('/dashboard')}
                  className="btn btn-secondary"
                  style={{ flex: 1, padding: '14px', borderRadius: '14px', fontSize: '14px', fontWeight: 700 }}
                >
                  Go to Dashboard
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
        <div className="w-10 h-10 border-3 border-border border-t-accent-cyan rounded-full animate-spin" />
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
