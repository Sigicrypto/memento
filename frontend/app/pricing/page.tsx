import { Metadata } from 'next';
import { Suspense } from 'react';
import Pricing from '@/components/Pricing';
import ThemedNav from '@/components/ThemedNav';
import Footer from '@/components/sections/Footer';

export const metadata: Metadata = {
  title: 'Per-Event Pricing | Memento — Simple Guest-Based Plans',
  description: 'Transparent per-event pricing based on guest count. All features included. No subscriptions. Plans from ₹999/$15 per event.',
};

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-bg flex flex-col">
      <Suspense fallback={<div className="h-20" />}>
        <ThemedNav />
      </Suspense>
      
      <div className="flex-1">
        <Suspense fallback={
          <div className="w-full py-24 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
          </div>
        }>
          <Pricing />
        </Suspense>
      </div>

      <Suspense fallback={<div className="h-40" />}>
        <Footer />
      </Suspense>
    </main>
  );
}
