import Pricing from '@/components/Pricing';
import { Suspense } from 'react';

export const metadata = {
  title: 'Pricing | Memento',
  description: 'Choose the perfect plan for your event. One-time payment, no subscriptions.',
};

export default function PricingPage({
  searchParams,
}: {
  searchParams: { eventId?: string };
}) {
  const eventId = searchParams?.eventId;

  return (
    <main className="lp min-h-screen relative overflow-hidden flex flex-col w-full items-center">
      <div className="aurora-bg fixed inset-0 z-0" />
      <div className="grain fixed inset-0 z-1 opacity-[0.03] pointer-events-none" />

      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center relative z-10">
          <div className="w-14 h-14 border-4 rounded-full animate-spin border-white/10 border-t-amber-500" />
        </div>
      }>
        <Pricing isEmbedded={false} eventId={eventId} />
      </Suspense>
    </main>
  );
}
