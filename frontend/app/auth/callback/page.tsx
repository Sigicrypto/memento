"use client";

import { useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;

    const handleAuth = async () => {
      // Allow supabase client to parse the hash fragment
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (session) {
        processed.current = true;
        
        // Ensure profile exists/updates
        const plan = searchParams.get('plan');
        await supabase.from('profiles').upsert({
          id: session.user.id,
          full_name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || '',
          email: session.user.email || '',
          plan: plan || 'starter',
        });

        if (plan && plan !== 'starter') {
          router.push(`/checkout?plan=${plan}`);
        } else {
          router.push('/dashboard');
        }
      }
    };
    
    // First try checking immediately (sometimes session is instantly ready)
    handleAuth();

    // Listen to auth state changes in case the hash parsing takes a moment
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session) {
        handleAuth();
      }
    });

    return () => subscription.unsubscribe();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-bg">
      <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-text-secondary text-sm animate-pulse">Authenticating...</p>
    </div>
  );
}

export default function AuthCallback() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center bg-bg">
        <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin mb-4"></div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}
