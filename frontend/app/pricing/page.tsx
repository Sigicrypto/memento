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
    <main className="min-h-screen bg-[#0e1228]">
      <Suspense fallback={
        <div className="nm-page flex items-center justify-center">
          <div className="nm-circle w-14 h-14">
            <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{borderColor:'#252c46',borderTopColor:'#f59e0b'}} />
          </div>
        </div>
      }>
        <Pricing isEmbedded={false} eventId={eventId} />
      </Suspense>
    </main>
  );
}
