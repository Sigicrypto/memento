"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

type Region = 'IN' | 'GLOBAL';
const REGION_COOKIE = 'livewall_region';

const PLAN_PRICES: Record<string, { IN: string; GLOBAL: string }> = {
  FREE:        { IN: '₹0',      GLOBAL: '$0' },
  STARTER:     { IN: '₹2,500',  GLOBAL: '$30' },
  PRO:         { IN: '₹5,000',  GLOBAL: '$60' },
  PREMIUM:     { IN: '₹7,500',  GLOBAL: '$90' },
  'WHITE LABEL': { IN: '₹10,000', GLOBAL: '$120' },
  'WHITE_LABEL': { IN: '₹10,000', GLOBAL: '$120' },
};

const PLAN_DISPLAY_NAMES: Record<string, string> = {
  FREE: 'Free', STARTER: 'Starter', PRO: 'Pro', PREMIUM: 'Premium',
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
  const planName = searchParams.get('plan') || 'PRO';
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  
  const [status, setStatus] = useState<'IDLE' | 'PROCESSING' | 'SUCCESS'>('IDLE');
  const [region, setRegion] = useState<Region>('GLOBAL');
  const [eventData, setEventData] = useState<{ name: string } | null>(null);

  const eventId = searchParams.get('eventId');

  useEffect(() => {
    setRegion(readRegionCookie());
  }, []);

  // Strict Auth: Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      const currentUrl = encodeURIComponent(window.location.pathname + window.location.search);
      router.push(`/auth?redirect=${currentUrl}`);
    }
  }, [user, authLoading, router]);

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

  if (authLoading) return (
    <div className="nm-page flex items-center justify-center">
      <div className="nm-circle w-14 h-14">
        <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{borderColor:'#252c46',borderTopColor:'#f59e0b'}} />
      </div>
    </div>
  );

  return (
    <div className="nm-page flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="nm-card p-8 text-center">
          {status === 'IDLE' && (
            <>
              <div className="nm-circle w-20 h-20 mx-auto mb-6 text-4xl">💳</div>
              <h1 className="text-2xl font-bold mb-2" style={{color:'var(--text1)'}}>Checkout</h1>
              <div className="flex items-center justify-center gap-3 mb-6">
                <span className="nm-badge" style={{background:'linear-gradient(135deg,#f59e0b,#f472b6)',color:'var(--surface)',boxShadow:'none'}}>One-time</span>
                <span className="nm-badge">{regionLabel} price</span>
              </div>
              <p className="text-sm mb-6" style={{color:'var(--text2)'}}>
                Upgrading {eventData ? <span className="font-bold text-slate-800">"{eventData.name}"</span> : 'account'} to <span className="font-bold" style={{color:'#f59e0b'}}>{planLabel}</span>.
              </p>

              <div className="nm-inset p-4 mb-8 text-left rounded-2xl">
                <div className="flex justify-between text-sm mb-2">
                  <span style={{color:'var(--text2)'}}>Memento {planLabel}</span>
                  <span className="font-bold text-xs" style={{color:'#4a4f6a'}}>Demo checkout</span>
                </div>
                <div className="nm-divider my-2" />
                <div className="flex justify-between font-bold">
                  <span style={{color:'var(--text1)'}}>Total Due</span>
                  <span style={{color:'#f59e0b'}}>{priceDisplay}</span>
                </div>
                <p className="text-xs mt-2" style={{color:'#4a4f6a'}}>One-time payment. No subscriptions, no recurring charges.</p>
              </div>

              <button onClick={handlePayment} className="nm-btn nm-btn-accent w-full py-4 text-base font-bold mb-4">
                {region === 'IN' ? '🇮🇳 Pay with Razorpay' : '🌐 Pay with Stripe'}
              </button>
              <Link href="/#pricing" className="text-xs" style={{color:'#4a4f6a'}}>Cancel and go back</Link>
            </>
          )}

          {status === 'PROCESSING' && (
            <div className="py-10">
              <div className="nm-circle w-16 h-16 mx-auto mb-6">
                <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{borderColor:'#252c46',borderTopColor:'#f59e0b'}} />
              </div>
              <h2 className="text-xl font-bold mb-2" style={{color:'var(--text1)'}}>Processing Payment...</h2>
              <p className="text-sm" style={{color:'var(--text2)'}}>Please do not refresh the page.</p>
            </div>
          )}

          {status === 'SUCCESS' && (
            <div className="py-10">
              <div className="nm-circle w-20 h-20 mx-auto mb-6 text-4xl">✅</div>
              <h2 className="text-2xl font-bold mb-2" style={{color:'var(--text1)'}}>Upgrade Successful!</h2>
              <p className="text-sm mb-8" style={{color:'var(--text2)'}}>
                Your account has been upgraded to {planLabel}. Redirecting...
              </p>
              <div className="nm-inset h-2 rounded-full overflow-hidden">
                <div className="h-full w-full transition-all duration-500" style={{background:'linear-gradient(90deg,#f59e0b,#f472b6)'}} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="nm-page flex items-center justify-center">
        <div className="nm-circle w-14 h-14">
          <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{borderColor:'#252c46',borderTopColor:'#f59e0b'}} />
        </div>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}

