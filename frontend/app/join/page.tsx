"use client";

import { useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Sparkles, Loader2 } from 'lucide-react';

function JoinHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const refCode = searchParams.get('ref') || searchParams.get('partnerId');

  useEffect(() => {
    if (refCode) {
      const formattedCode = refCode.toUpperCase();
      // Store referral token in localStorage
      localStorage.setItem('memento_ref_token', formattedCode);
      localStorage.setItem('memento_partner_id', formattedCode);

      // Set 30-day cookie for server side & middleware access
      document.cookie = `memento_ref_token=${formattedCode}; path=/; max-age=2592000; SameSite=Lax`;
    }

    // Redirect to auth sign up after capturing token
    const timer = setTimeout(() => {
      router.push(`/auth?mode=signup${refCode ? `&ref=${refCode.toUpperCase()}` : ''}`);
    }, 600);

    return () => clearTimeout(timer);
  }, [refCode, router]);

  return (
    <div className="min-h-screen bg-[#07090E] flex flex-col items-center justify-center text-white px-4">
      <div className="p-8 rounded-3xl bg-slate-900/90 border border-emerald-500/30 text-center max-w-md shadow-2xl backdrop-blur-xl relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto mb-4">
          <Sparkles className="w-6 h-6 animate-pulse" />
        </div>

        <h2 className="text-xl font-black text-white mb-2">Welcome to Memento</h2>
        <p className="text-xs text-slate-300 mb-6">
          {refCode ? (
            <span>You were invited by Ambassador <strong className="text-emerald-400 font-mono">{refCode.toUpperCase()}</strong>. Setting up your account...</span>
          ) : (
            <span>Connecting you to Memento Live Event App...</span>
          )}
        </p>

        <div className="flex items-center justify-center gap-2 text-xs text-slate-400 font-medium">
          <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
          <span>Redirecting to registration...</span>
        </div>
      </div>
    </div>
  );
}

export default function JoinPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#07090E] flex items-center justify-center text-white">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
      </div>
    }>
      <JoinHandler />
    </Suspense>
  );
}
