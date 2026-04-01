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
    <div className="nm-page flex items-center justify-center px-4 py-24 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full blur-[100px] opacity-20 pointer-events-none" style={{background: 'radial-gradient(circle, #f59e0b, transparent)'}} />
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full blur-[100px] opacity-20 pointer-events-none" style={{background: 'radial-gradient(circle, #f472b6, transparent)'}} />

      <div className="w-full max-w-xl relative z-10">
        <div className="nm-card p-12 text-center backdrop-blur-xl border border-white/5 shadow-2xl">
          <div className="nm-circle w-24 h-24 mx-auto mb-8 text-5xl flex items-center justify-center animate-bounce" style={{background:'rgba(34,197,94,0.1)', color:'#22c55e'}}>
            ✨
          </div>
          <h1 className="text-4xl font-black mb-4 tracking-tight" style={{color:'var(--text1)'}}>
            Welcome to <span style={{background:'linear-gradient(135deg, #f59e0b, #f472b6)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent'}}>Premium</span>
          </h1>
          <p className="text-lg mb-8 leading-relaxed" style={{color:'var(--text2)'}}>
            Your account and {eventId ? 'event' : 'dashboard'} have been upgraded to <span className="font-bold underline decoration-amber-500/30 underline-offset-4">{PLAN_DISPLAY[plan] || plan}</span>.
          </p>
          
          <div className="nm-inset p-6 mb-10 rounded-2xl border border-white/5 group transition-all hover:bg-white/5">
            <h3 className="text-sm font-bold uppercase tracking-widest mb-4 opacity-50" style={{color:'var(--text1)'}}>Now Unlocked</h3>
            <div className="grid grid-cols-2 gap-4 text-left">
              <div className="flex items-center gap-3">
                <span className="text-amber-500">✓</span>
                <span className="text-xs" style={{color:'var(--text2)'}}>Extended Storage</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-amber-500">✓</span>
                <span className="text-xs" style={{color:'var(--text2)'}}>High-Res Exports</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-amber-500">✓</span>
                <span className="text-xs" style={{color:'var(--text2)'}}>Custom Branding</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-amber-500">✓</span>
                <span className="text-xs" style={{color:'var(--text2)'}}>Priority Support</span>
              </div>
            </div>
          </div>

          <p className="text-sm mb-4" style={{color:'#7f849c'}}>Redirecting you in a few seconds...</p>
          <div className="nm-inset h-1.5 rounded-full overflow-hidden mb-8 max-w-xs mx-auto">
            <div className="h-full bg-gradient-to-r from-amber-500 to-pink-500 transition-all duration-[5000ms] ease-linear w-0 animate-progress" />
          </div>
          
          <div className="flex gap-4">
            <Link href="/dashboard" className="nm-btn flex-1 py-4 font-bold text-sm tracking-wide">
              Dashboard
            </Link>
            <Link href={eventId ? `/wall/${eventId}` : '/create'} className="nm-btn nm-btn-accent flex-[1.5] py-4 font-bold text-sm tracking-wide flex items-center justify-center gap-2">
              Launch Live Wall <span className="text-lg">→</span>
            </Link>
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
    </div>
  );
}

export default function StripeSuccessPage() {
  return (
    <Suspense fallback={
      <div className="nm-page flex items-center justify-center">
        <div className="nm-circle w-14 h-14">
          <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{borderColor:'#252c46',borderTopColor:'#f59e0b'}} />
        </div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}

