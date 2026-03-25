"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

type Region = 'IN' | 'GLOBAL';
const REGION_COOKIE = 'livewall_region';

function readRegionCookie(): Region {
  if (typeof document === 'undefined') return 'GLOBAL';
  const match = document.cookie.match(new RegExp(`(^| )${REGION_COOKIE}=([^;]+)`));
  const value = match?.[2];
  return value === 'IN' ? 'IN' : 'GLOBAL';
}

function CheckoutContent() {
  const searchParams = useSearchParams();
  const planName = searchParams.get('plan') || 'SIGNATURE';
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  
  const [status, setStatus] = useState<'IDLE' | 'PROCESSING' | 'SUCCESS'>('IDLE');
  const [region, setRegion] = useState<Region>('GLOBAL');

  useEffect(() => {
    setRegion(readRegionCookie());
  }, []);

  const planLabel = planName === 'SIGNATURE' ? 'Signature' : planName;
  const priceDisplay = region === 'IN' ? 'INR ₹5,000' : 'USD 60';

  const handlePayment = async () => {
    setStatus('PROCESSING');
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    if (user) {
      // Update user metadata to reflect new plan
      const { error } = await supabase.auth.updateUser({
        data: { plan_type: planName }
      });
      
      if (error) {
        alert("Mock Payment Failed: " + error.message);
        setStatus('IDLE');
        return;
      }
    }
    
    setStatus('SUCCESS');
    
    // Redirect after success
    setTimeout(() => {
      router.push('/dashboard');
    }, 3000);
  };

  if (authLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="aurora-bg min-h-[90vh] flex items-center justify-center px-4">
      <div className="relative z-10 w-full max-w-md">
        <div className="card relative !p-10 text-center">
          {status === 'IDLE' && (
            <>
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
                💳
              </div>
              <h1 className="text-2xl font-bold mb-2">Checkout</h1>
              <p className="text-dark-text text-sm mb-8">
                You are upgrading to the <span className="text-primary-light font-bold">{planLabel}</span> plan.
              </p>
              
              <div className="bg-dark-card/50 border border-dark-border p-4 rounded-xl mb-8 text-left">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-dark-text">Memento {planLabel}</span>
                  <span className="text-white font-bold">Mock Payment</span>
                </div>
                <div className="border-t border-dark-border my-2 pt-2 flex justify-between font-bold">
                  <span>Total Due</span>
                  <span className="text-primary-light">{priceDisplay} (Developer Mock)</span>
                </div>
              </div>

              <button 
                onClick={handlePayment}
                className="btn-primary w-full py-4 text-lg shadow-xl shadow-primary/20"
              >
                Confirm Mock Payment
              </button>
              <Link href="/pricing" className="block mt-4 text-xs text-dark-text hover:text-white transition">
                Cancel and go back
              </Link>
            </>
          )}

          {status === 'PROCESSING' && (
            <div className="py-10">
              <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-6" />
              <h2 className="text-xl font-bold mb-2">Processing Payment...</h2>
              <p className="text-dark-text text-sm">Please do not refresh the page.</p>
            </div>
          )}

          {status === 'SUCCESS' && (
            <div className="py-10 animate-scaleIn">
              <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl shadow-lg shadow-green-500/20">
                ✅
              </div>
              <h2 className="text-2xl font-bold mb-2 text-white">Upgrade Successful!</h2>
              <p className="text-dark-text text-sm mb-8">
                Your account has been upgraded to **{planLabel}**.
                Redirecting you to the dashboard...
              </p>
              <div className="w-full bg-dark-border h-1 rounded-full overflow-hidden">
                <div className="bg-green-500 h-full animate-progress" />
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
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
