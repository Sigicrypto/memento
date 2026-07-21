"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

type Region = 'IN' | 'OM' | 'GLOBAL';
const REGION_COOKIE = 'livewall_region';

const PLAN_PRICES: Record<string, { IN: string; OM: string; GLOBAL: string }> = {
  STARTER:     { IN: '₹2,499',  OM: 'ر.ع. 15',  GLOBAL: '$30' },
  STANDARD:    { IN: '₹4,999',  OM: 'ر.ع. 29',  GLOBAL: '$60' },
  PREMIUM:     { IN: '₹7,499',  OM: 'ر.ع. 39',  GLOBAL: '$90' },
  'WHITE LABEL': { IN: '₹9,999', OM: 'ر.ع. 59', GLOBAL: '$120' },
  'WHITE_LABEL': { IN: '₹9,999', OM: 'ر.ع. 59', GLOBAL: '$120' },
};

const PLAN_DISPLAY_NAMES: Record<string, string> = {
  STARTER: 'Starter', STANDARD: 'Standard', PREMIUM: 'Premium',
  'WHITE LABEL': 'White Label', 'WHITE_LABEL': 'White Label',
};

function readRegionCookie(): Region {
  if (typeof document === 'undefined') return 'GLOBAL';
  const match = document.cookie.match(new RegExp(`(^| )${REGION_COOKIE}=([^;]+)`));
  const value = match?.[2];
  if (value === 'IN') return 'IN';
  if (value === 'OM') return 'OM';
  return 'GLOBAL';
}

function CheckoutContent() {
  const searchParams = useSearchParams();
  const planName = searchParams.get('plan') || 'STANDARD';
  const router = useRouter();
  const { user, isLoading } = useAuth();
  
  const [status, setStatus] = useState<'IDLE' | 'PROCESSING' | 'SUCCESS' | 'PENDING_MANUAL'>('IDLE');
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
  const prices = PLAN_PRICES[planKey] || { IN: '₹4,999', OM: 'ر.ع. 29', GLOBAL: '$60' };
  const priceDisplay = region === 'IN' ? prices.IN : region === 'OM' ? prices.OM : prices.GLOBAL;
  const regionLabel = region === 'IN' ? 'India' : region === 'OM' ? 'Oman' : 'Global';

  const handlePayment = async () => {
    // Payment integrations removed for now.
    // The user will use the manual WhatsApp flow below.
  };

  if (isLoading) return (
    <div className="lp min-h-screen relative overflow-hidden flex items-center justify-center">
      <div className="aurora-bg fixed inset-0 z-0" />
      <div className="grain fixed inset-0 z-1 opacity-[0.03] pointer-events-none" />
      <div className="relative z-10 w-14 h-14 border-4 rounded-full border-black/10 dark:border-white/10 border-t-amber-500 animate-spin" />
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
                <h1 className="text-3xl font-bold mb-2 ">Checkout</h1>
                <div className="flex items-center justify-center gap-3 mb-6">
                  <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-gradient-to-r from-amber-500 to-rose-500 ">One-time</span>
                  <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-black/10 dark:bg-white/10 text-slate-700 dark:text-slate-300">{regionLabel} price</span>
                </div>
                <p className="text-sm mb-8 text-slate-600 dark:text-slate-400">
                  Upgrading {eventData ? <span className="font-bold text-slate-200">&quot;{eventData.name}&quot;</span> : 'account'} to <span className="font-bold text-amber-400">{planLabel}</span>.
                </p>

                <div className="p-5 mb-8 text-left rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 shadow-inner">
                  <div className="flex justify-between text-sm mb-3">
                    <span className="text-slate-700 dark:text-slate-300">Memento {planLabel}</span>
                    <span className="font-bold text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/20">Demo</span>
                  </div>
                  <div className="w-full h-px bg-black/10 dark:bg-white/10 my-4" />
                  <div className="flex justify-between font-bold text-lg">
                    <span className="">Total Due</span>
                    <span className="text-amber-400">{priceDisplay}</span>
                  </div>
                  <p className="text-xs mt-3 text-slate-500 font-medium">One-time payment. No subscriptions, no recurring charges.</p>
                </div>

                {/* ── All Regions: Manual Payment UI ── */}
                <div style={{ marginTop: 24 }}>

                  {/* Option 1: Bank Transfer */}
                  <div className="p-5 mb-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-amber-500/20 text-left">
                    <p className="text-amber-400 font-bold text-xs uppercase tracking-widest mb-3">🏦 Option 1 — Bank Transfer</p>
                    <div className="space-y-1.5 text-sm text-slate-700 dark:text-slate-300">
                      <p><span className="text-slate-500">Bank Name:</span> Bank Muscat</p>
                      <p><span className="text-slate-500">Account Name:</span> <span className="font-semibold">Sagar Shaik Trade LLC</span></p>
                      <p><span className="text-slate-500">IBAN / Acc No:</span> <span className="font-mono text-xs tracking-wider">0364073422230017</span></p>
                      <p><span className="text-slate-500">Reference:</span> <span className="text-amber-400 font-semibold">{planLabel} - {user?.email}</span></p>
                    </div>
                  </div>

                  {/* Option 2: Mobile Number Transfer */}
                  <div className="p-5 mb-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-emerald-500/20 text-left">
                    <p className="text-emerald-400 font-bold text-xs uppercase tracking-widest mb-3">📱 Option 2 — Mobile Transfer (Oman Only)</p>
                    <div className="space-y-1.5 text-sm text-slate-700 dark:text-slate-300">
                      <p><span className="text-slate-500">Bank Muscat Mobile No:</span></p>
                      <p
                        className="font-mono text-xl font-bold tracking-widest cursor-pointer select-all"
                        onClick={() => navigator.clipboard.writeText('96095692')}
                        title="Click to copy"
                      >
                        9609 5692
                        <span className="ml-2 text-xs text-slate-500 font-normal normal-case tracking-normal">(tap to copy)</span>
                      </p>
                      <p className="text-slate-500 text-xs mt-1">Send via Bank Muscat mobile app using this number.</p>
                      <p><span className="text-slate-500">Reference note:</span> <span className="text-amber-400 font-semibold">{planLabel} - {user?.email}</span></p>
                    </div>
                  </div>

                  <p className="text-center text-xs text-slate-500 mb-3">After payment, confirm via WhatsApp with your receipt 📸</p>

                  <button
                    onClick={() => {
                      window.open(`https://wa.me/96896095692?text=${encodeURIComponent(`Hi! I've completed the payment for Memento ${planLabel} plan.\n\nEmail: ${user?.email || ''}\nPlan: ${planLabel} (${priceDisplay})\n\nPlease confirm my account upgrade.`)}`, '_blank');
                      setStatus('PENDING_MANUAL');
                      setTimeout(() => router.push('/dashboard'), 6000);
                    }}
                    className="btn-hero-primary w-full py-4 text-base font-bold flex items-center justify-center gap-2 no-underline"
                    style={{ background: 'linear-gradient(135deg, #25D366, #128C7E)', color: '#fff' }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    Confirm via WhatsApp
                  </button>
                </div>
                <Link href="/#pricing" className="text-xs text-slate-500 hover:text-black dark:hover:text-white transition-colors font-semibold">Cancel and go back</Link>
              </>
            )}

            {status === 'PROCESSING' && (
              <div className="py-10">
                <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 mx-auto mb-6 flex items-center justify-center">
                  <div className="w-8 h-8 border-4 rounded-full animate-spin border-transparent border-t-amber-500" />
                </div>
                <h2 className="text-2xl font-bold mb-3 ">Processing Payment...</h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">Please do not refresh the page.</p>
              </div>
            )}

            {status === 'SUCCESS' && (
              <div className="py-10">
                <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 mx-auto mb-6 text-4xl flex items-center justify-center text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]">✅</div>
                <h2 className="text-2xl font-bold mb-3 ">Upgrade Successful!</h2>
                <p className="text-sm mb-8 text-slate-600 dark:text-slate-400">
                  Your account has been upgraded to <span className="font-bold text-amber-400">{planLabel}</span>. Redirecting...
                </p>
                <div className="h-2 rounded-full overflow-hidden bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
                  <div className="h-full w-full transition-all duration-1000 ease-out bg-gradient-to-r from-amber-500 to-rose-500 origin-left animate-pulse" />
                </div>
              </div>
            )}

            {status === 'PENDING_MANUAL' && (
              <div className="py-10">
                <div className="w-20 h-20 rounded-full bg-blue-500/10 border border-blue-500/20 mx-auto mb-6 text-4xl flex items-center justify-center text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.2)]">⏳</div>
                <h2 className="text-2xl font-bold mb-3 ">Verification Pending</h2>
                <p className="text-sm mb-8 text-slate-600 dark:text-slate-400">
                  We have received your WhatsApp message. An admin will verify your <span className="font-bold text-amber-400">{planLabel}</span> payment shortly. Redirecting...
                </p>
                <div className="h-2 rounded-full overflow-hidden bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
                  <div className="h-full w-full transition-all duration-1000 ease-out bg-gradient-to-r from-blue-500 to-cyan-500 origin-left animate-pulse" />
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
        <div className="relative z-10 w-14 h-14 border-4 rounded-full border-black/10 dark:border-white/10 border-t-amber-500 animate-spin" />
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
