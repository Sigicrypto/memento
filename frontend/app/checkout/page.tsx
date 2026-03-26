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
  const priceDisplay = region === 'IN' ? '5000 INR' : '60 USD';
  const regionLabel = region === 'IN' ? 'India' : 'Global';

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
        <div className="nm-card p-10 text-center">
          {status === 'IDLE' && (
            <>
              <div className="nm-circle w-20 h-20 mx-auto mb-6 text-4xl">💳</div>
              <h1 className="text-2xl font-bold mb-2" style={{color:'#e2e8f0'}}>Checkout</h1>
              <div className="flex items-center justify-center gap-3 mb-6">
                <span className="nm-badge" style={{background:'linear-gradient(135deg,#f59e0b,#f472b6)',color:'#1e2235',boxShadow:'none'}}>One-time</span>
                <span className="nm-badge">{regionLabel} price</span>
              </div>
              <p className="text-sm mb-6" style={{color:'#7f849c'}}>
                You are buying <span className="font-bold" style={{color:'#f59e0b'}}>{planLabel}</span>.
              </p>

              <div className="nm-inset p-4 mb-8 text-left rounded-2xl">
                <div className="flex justify-between text-sm mb-2">
                  <span style={{color:'#7f849c'}}>Memento {planLabel}</span>
                  <span className="font-bold text-xs" style={{color:'#4a4f6a'}}>Demo checkout</span>
                </div>
                <div className="nm-divider my-2" />
                <div className="flex justify-between font-bold">
                  <span style={{color:'#e2e8f0'}}>Total Due</span>
                  <span style={{color:'#f59e0b'}}>{priceDisplay}</span>
                </div>
                <p className="text-xs mt-2" style={{color:'#4a4f6a'}}>Pay once. Your wall remains available for Signature duration.</p>
              </div>

              <button onClick={handlePayment} className="nm-btn nm-btn-accent w-full py-4 text-base font-bold mb-4">
                Confirm Mock Payment
              </button>
              <Link href="/pricing" className="text-xs" style={{color:'#4a4f6a'}}>Cancel and go back</Link>
            </>
          )}

          {status === 'PROCESSING' && (
            <div className="py-10">
              <div className="nm-circle w-16 h-16 mx-auto mb-6">
                <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{borderColor:'#252c46',borderTopColor:'#f59e0b'}} />
              </div>
              <h2 className="text-xl font-bold mb-2" style={{color:'#e2e8f0'}}>Processing Payment...</h2>
              <p className="text-sm" style={{color:'#7f849c'}}>Please do not refresh the page.</p>
            </div>
          )}

          {status === 'SUCCESS' && (
            <div className="py-10">
              <div className="nm-circle w-20 h-20 mx-auto mb-6 text-4xl">✅</div>
              <h2 className="text-2xl font-bold mb-2" style={{color:'#e2e8f0'}}>Upgrade Successful!</h2>
              <p className="text-sm mb-8" style={{color:'#7f849c'}}>
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
