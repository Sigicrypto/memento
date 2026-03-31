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

  useEffect(() => {
    // Update user plan after Stripe redirect
    const upgrade = async () => {
      await supabase.auth.updateUser({ data: { plan_type: plan } });
    };
    upgrade();
    const t = setTimeout(() => router.push('/dashboard'), 4000);
    return () => clearTimeout(t);
  }, [plan, router]);

  return (
    <div className="nm-page flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="nm-card p-10 text-center">
          <div className="nm-circle w-20 h-20 mx-auto mb-6 text-4xl">✅</div>
          <h1 className="text-2xl font-bold mb-2" style={{color:'var(--text1)'}}>Payment Successful!</h1>
          <p className="text-sm mb-2" style={{color:'var(--text2)'}}>
            Your account has been upgraded to{' '}
            <span className="font-bold" style={{color:'#f59e0b'}}>{PLAN_DISPLAY[plan] || plan}</span>.
          </p>
          <p className="text-xs mb-8" style={{color:'#4a4f6a'}}>Redirecting to your dashboard...</p>
          <div className="nm-inset h-2 rounded-full overflow-hidden mb-6">
            <div className="h-full w-full animate-pulse" style={{background:'linear-gradient(90deg,#f59e0b,#f472b6)'}} />
          </div>
          <Link href="/dashboard" className="nm-btn nm-btn-accent w-full py-3 font-bold block text-center">
            Go to Dashboard →
          </Link>
        </div>
      </div>
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

