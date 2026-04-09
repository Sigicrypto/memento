"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

type Region = 'IN' | 'GLOBAL';
const REGION_COOKIE = 'livewall_region';

const PLAN_PRICES: Record<string, { IN: string; GLOBAL: string }> = {
  STARTER:     { IN: '₹2,500',  GLOBAL: '$30' },
  STANDARD:    { IN: '₹5,000',  GLOBAL: '$60' },
  PREMIUM:     { IN: '₹7,500',  GLOBAL: '$90' },
  'WHITE LABEL': { IN: '₹10,000', GLOBAL: '$120' },
  'WHITE_LABEL': { IN: '₹10,000', GLOBAL: '$120' },
};

const PLAN_DISPLAY_NAMES: Record<string, string> = {
  STARTER: 'Starter', STANDARD: 'Standard', PREMIUM: 'Premium',
  'WHITE LABEL': 'White Label', 'WHITE_LABEL': 'White Label',
};

function readRegionCookie(): Region {
  if (typeof document === 'undefined') return 'GLOBAL';
  const match = document.cookie.match(new RegExp(`(^| )${REGION_COOKIE}=([^;]+)`));
  const value = match?.[2];
  return value === 'IN' ? 'IN' : 'GLOBAL';
}

function CheckoutContent() {
  const searchParams = useSearchParams();
  const planName = searchParams.get('plan') || 'STANDARD';
  const router = useRouter();
  const { user, isLoading } = useAuth();
  
  const [status, setStatus] = useState<'IDLE' | 'PROCESSING' | 'SUCCESS'>('IDLE');
  const [region, setRegion] = useState<Region>('GLOBAL');
  const [eventData, setEventData] = useState<{ name: string } | null>(null);

  const eventId = searchParams.get('eventId');

  useEffect(() => {
    setRegion(readRegionCookie());
  }, []);

  // Strict Auth: Redirect if not logged in
  useEffect(() => {
    if (!isLoading && !user) {
      const currentUrl = encodeURIComponent(window.location.pathname + window.location.search);
      router.push(`/auth?redirect=${currentUrl}`);
    }
  }, [user, isLoading, router]);

  // Fetch event details if eventId is provided
  useEffect(() => {
    if (eventId) {
      supabase.from('events').select('name').eq('id', eventId).single().then(({ data }) => {
        if (data) setEventData(data);
      });
    }
  }, [eventId]);

  const planKey = planName.toUpperCase();
  const planLabel = PLAN_DISPLAY_NAMES[planKey] || planName;
  const prices = PLAN_PRICES[planKey] || { IN: '₹5,000', GLOBAL: '$60' };
  const priceDisplay = region === 'IN' ? prices.IN : prices.GLOBAL;
  const regionLabel = region === 'IN' ? 'India' : 'Global';

  const handlePayment = async () => {
    setStatus('PROCESSING');
    try {
      const res = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: planKey,
          region,
          userId: user?.id,
          userEmail: user?.email,
          eventId,
        }),
      });
      const data = await res.json();

      // ── Mock fallback or Dev mode success ──
      if (data.mock || data.dev) {
        console.log('[checkout] Mock/Dev success received');
        const verifyRes = await fetch('/api/payment/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            plan: planKey,
            eventId,
            mock: true,
          }),
        });
        if (verifyRes.ok) {
          setStatus('SUCCESS');
          const redirectUrl = eventId ? `/wall/${eventId}` : '/create';
          setTimeout(() => router.push(redirectUrl), 3000);
        } else {
          setStatus('IDLE');
          alert('Verification failed');
        }
        return;
      }

      // ── Stripe: redirect to hosted checkout ──
      if (data.gateway === 'stripe' && data.sessionUrl) {
        window.location.href = data.sessionUrl;
        return;
      }

      // ── Razorpay: open modal ──
      if (data.gateway === 'razorpay') {
        await new Promise<void>((resolve, reject) => {
          const s = document.createElement('script');
          s.src = 'https://checkout.razorpay.com/v1/checkout.js';
          s.onload = () => resolve();
          s.onerror = () => reject(new Error('Razorpay script failed'));
          document.head.appendChild(s);
        });
        const rzp = new (window as any).Razorpay({
          key: data.key,
          amount: data.amount,
          currency: data.currency,
          name: 'Memento',
          description: `${planLabel} Plan`,
          order_id: data.orderId,
          handler: async (response: any) => {
            const verifyRes = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                paymentId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id,
                signature: response.razorpay_signature,
                plan: planKey,
                userId: user?.id,
                eventId,
              }),
            });
            if (verifyRes.ok) {
              setStatus('SUCCESS');
              const redirectUrl = eventId ? `/wall/${eventId}` : '/create';
              setTimeout(() => router.push(redirectUrl), 3000);
            } else {
              setStatus('IDLE');
              alert('Payment verification failed. Contact support.');
            }
          },
          prefill: { email: user?.email || '' },
          theme: { color: '#f59e0b' },
        });
        rzp.open();
        setStatus('IDLE');
        return;
      }

      // ── Mock fallback (no keys configured) ──
      await new Promise(r => setTimeout(r, 2000));
      if (user) {
        await supabase.auth.updateUser({ data: { plan_type: planName } });
      }
      setStatus('SUCCESS');
      const redirectUrl = eventId ? `/wall/${eventId}` : '/create';
      setTimeout(() => router.push(redirectUrl), 3000);
    } catch {
      setStatus('IDLE');
      alert('Payment failed. Please try again.');
    }
  };

  if (isLoading) return (
    <div className="lp min-h-screen relative overflow-hidden flex items-center justify-center">
      <div className="aurora-bg fixed inset-0 z-0" />
      <div className="grain fixed inset-0 z-1 opacity-[0.03] pointer-events-none" />
      <div className="relative z-10 w-14 h-14 border-4 rounded-full border-white/10 border-t-amber-500 animate-spin" />
    </div>
  );

  return (
    <main className="lp min-h-screen relative overflow-hidden flex items-center justify-center px-4 py-12">
      <div className="aurora-bg fixed inset-0 z-0" />
      <div className="grain fixed inset-0 z-1 opacity-[0.03] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        <div className="gcard cinematic-glow text-center">
          <div className="gcard-border" />
          <div className="gcard-inner p-8 md:p-10">
            {status === 'IDLE' && (
              <>
                <div className="w-20 h-20 rounded-full bg-amber-500/10 border border-amber-500/20 text-4xl mx-auto mb-6 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.2)]">💳</div>
                <h1 className="text-3xl font-bold mb-2 text-white">Checkout</h1>
                <div className="flex items-center justify-center gap-3 mb-6">
                  <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-gradient-to-r from-amber-500 to-rose-500 text-white">One-time</span>
                  <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-white/10 text-slate-300">{regionLabel} price</span>
                </div>
                <p className="text-sm mb-8 text-slate-400">
                  Upgrading {eventData ? <span className="font-bold text-slate-200">&quot;{eventData.name}&quot;</span> : 'account'} to <span className="font-bold text-amber-400">{planLabel}</span>.
                </p>

                <div className="p-5 mb-8 text-left rounded-2xl bg-white/5 border border-white/10 shadow-inner">
                  <div className="flex justify-between text-sm mb-3">
                    <span className="text-slate-300">Memento {planLabel}</span>
                    <span className="font-bold text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/20">Demo</span>
                  </div>
                  <div className="w-full h-px bg-white/10 my-4" />
                  <div className="flex justify-between font-bold text-lg">
                    <span className="text-white">Total Due</span>
                    <span className="text-amber-400">{priceDisplay}</span>
                  </div>
                  <p className="text-xs mt-3 text-slate-500 font-medium">One-time payment. No subscriptions, no recurring charges.</p>
                </div>

                <button onClick={handlePayment} className="btn-hero-primary w-full py-4 text-base font-bold mb-4 shadow-lg shadow-amber-500/20">
                  {region === 'IN' ? '🇮🇳 Pay with Razorpay' : '🌐 Pay with Stripe'}
                </button>
                <Link href="/#pricing" className="text-xs text-slate-500 hover:text-white transition-colors font-semibold">Cancel and go back</Link>
              </>
            )}

            {status === 'PROCESSING' && (
              <div className="py-10">
                <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 mx-auto mb-6 flex items-center justify-center">
                  <div className="w-8 h-8 border-4 rounded-full animate-spin border-transparent border-t-amber-500" />
                </div>
                <h2 className="text-2xl font-bold mb-3 text-white">Processing Payment...</h2>
                <p className="text-sm text-slate-400">Please do not refresh the page.</p>
              </div>
            )}

            {status === 'SUCCESS' && (
              <div className="py-10">
                <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 mx-auto mb-6 text-4xl flex items-center justify-center text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]">✅</div>
                <h2 className="text-2xl font-bold mb-3 text-white">Upgrade Successful!</h2>
                <p className="text-sm mb-8 text-slate-400">
                  Your account has been upgraded to <span className="font-bold text-amber-400">{planLabel}</span>. Redirecting...
                </p>
                <div className="h-2 rounded-full overflow-hidden bg-white/5 border border-white/10">
                  <div className="h-full w-full transition-all duration-1000 ease-out bg-gradient-to-r from-amber-500 to-rose-500 origin-left animate-pulse" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="lp min-h-screen relative overflow-hidden flex items-center justify-center">
        <div className="aurora-bg fixed inset-0 z-0" />
        <div className="grain fixed inset-0 z-1 opacity-[0.03] pointer-events-none" />
        <div className="relative z-10 w-14 h-14 border-4 rounded-full border-white/10 border-t-amber-500 animate-spin" />
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
