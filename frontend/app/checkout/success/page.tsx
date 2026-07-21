"use client";

import { useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

const PLAN_DISPLAY: Record<string, string> = {
  STARTER: 'Starter', PRO: 'Pro', PREMIUM: 'Premium', WHITE_LABEL: 'White Label',
};

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const plan = (searchParams.get('plan') || 'PRO').toUpperCase();
  const eventId = searchParams.get('eventId');

  useEffect(() => {
    const upgrade = async () => {
      // ── 1. Update user metadata for account-wide plan ────────────────
      await supabase.auth.updateUser({ data: { plan_type: plan } });
      
      // ── 2. Update specific event if eventId is present ───────────────
      if (eventId) {
        console.log('[success] Upgrading event:', eventId, 'to', plan);
        const { error } = await supabase
          .from('events')
          .update({ plan_type: plan })
          .eq('id', eventId);
        
        if (error) {
          console.error('[success] Error upgrading event:', error);
          // If RLS fails, we might need a service-role bridge, 
          // but for now we assume the owner is the one on the success page.
        }
      }
    };
    upgrade();
    const t = setTimeout(() => {
      const dest = eventId ? `/wall/${eventId}` : '/dashboard';
      router.push(dest);
    }, 5000);
    return () => clearTimeout(t);
  }, [plan, eventId, router]);

  return (
    <main className="lp min-h-screen relative overflow-hidden flex items-center justify-center px-4 py-24">
      <div className="aurora-bg fixed inset-0 z-0" />
      <div className="grain fixed inset-0 z-1 opacity-[0.03] pointer-events-none" />

      {/* Additional glows for success page */}
      <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] rounded-full blur-[120px] opacity-20 pointer-events-none bg-emerald-500/40" />

      <div className="w-full max-w-xl relative z-10">
        <div className="gcard cinematic-glow text-center backdrop-blur-xl border border-black/5 dark:border-white/5 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)]">
          <div className="gcard-border" />
          <div className="gcard-inner p-12">
            <div className="w-24 h-24 rounded-full mx-auto mb-8 text-5xl flex items-center justify-center animate-bounce bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
              ✨
            </div>
            <h1 className="text-4xl font-black mb-4 tracking-tight ">
              Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-rose-400">Premium</span>
            </h1>
            <p className="text-lg mb-8 leading-relaxed text-slate-700 dark:text-slate-300">
              Your account and {eventId ? 'event' : 'dashboard'} have been upgraded to <span className="font-bold underline decoration-amber-500/50 underline-offset-4 text-emerald-400">{PLAN_DISPLAY[plan] || plan}</span>.
            </p>
            
            <div className="bg-black/5 dark:bg-white/5 p-6 mb-10 rounded-2xl border border-black/10 dark:border-white/10 shadow-inner group transition-all hover:bg-black/10 dark:bg-white/10">
              <h3 className="text-sm font-bold uppercase tracking-widest mb-4 text-slate-500">Now Unlocked</h3>
              <div className="grid grid-cols-2 gap-4 text-left">
                <div className="flex items-center gap-3">
                  <span className="text-amber-500">✓</span>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Extended Storage</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-amber-500">✓</span>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">High-Res Exports</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-amber-500">✓</span>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Custom Branding</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-amber-500">✓</span>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Priority Support</span>
                </div>
              </div>
            </div>

            <p className="text-sm mb-4 text-slate-600 dark:text-slate-400">Redirecting you in a few seconds...</p>
            <div className="h-1.5 rounded-full overflow-hidden mb-8 max-w-xs mx-auto bg-black/10 dark:bg-white/10">
              <div className="h-full bg-gradient-to-r from-amber-500 to-pink-500 transition-all duration-[5000ms] ease-linear w-0 animate-progress" />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/dashboard" className="flex-1 py-4 font-bold text-sm tracking-wide rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:bg-black/10 dark:bg-white/10 transition-all text-center">
                Dashboard
              </Link>
              <Link href={eventId ? `/wall/${eventId}` : '/create'} className="btn-hero-primary flex-[1.5] !py-4 text-sm flex items-center justify-center gap-2">
                Launch Live Wall <span className="text-lg">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
      <style jsx>{`
        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }
        .animate-progress {
          animation: progress 5s linear forwards;
        }
      `}</style>
    </main>
  );
}

export default function StripeSuccessPage() {
  return (
    <Suspense fallback={
      <div className="lp min-h-screen relative overflow-hidden flex items-center justify-center">
        <div className="aurora-bg fixed inset-0 z-0" />
        <div className="grain fixed inset-0 z-1 opacity-[0.03] pointer-events-none" />
        <div className="relative z-10 w-14 h-14 border-4 rounded-full border-black/10 dark:border-white/10 border-t-amber-500 animate-spin" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
