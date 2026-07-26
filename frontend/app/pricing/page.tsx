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
    <main className="lp min-h-screen relative overflow-hidden flex flex-col w-full">
      <div className="fixed inset-0 z-0 overflow-hidden bg-bg">
         {/* Haikei SVG Wave */}
         <svg className="absolute w-[200vw] h-[200vh] -top-1/2 -left-1/2 opacity-20 pointer-events-none animate-[spin_120s_linear_infinite]" viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg">
            <path fill="var(--primary)" d="M472.9,-540C583.7,-432.2,624.4,-235.6,634,-48.5C643.5,138.6,621.8,316.2,514.9,444.6C408,572.9,215.8,652,24.1,623.2C-167.6,594.4,-334.8,457.7,-441.7,329.3C-548.6,201,-595.2,81.1,-589.6,-36.5C-584.1,-154.1,-526.4,-269.5,-427.3,-373.1C-328.2,-476.7,-187.6,-568.6,-5.4,-562.1C176.8,-555.7,362.1,-647.8,472.9,-540Z" transform="translate(450 300)" />
         </svg>
         <svg className="absolute w-[150vw] h-[150vh] top-0 left-0 opacity-10 pointer-events-none animate-[spin_90s_linear_infinite_reverse]" viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg">
            <path fill="var(--accent-cyan)" d="M427,-545.9C545.9,-461.3,629.4,-303.7,654.5,-133.7C679.6,36.2,646.2,218.6,547.4,360C448.6,501.4,284.4,601.7,117.2,618.3C-50,634.9,-214.2,567.8,-358.5,455.5C-502.8,343.2,-627.3,185.7,-642.6,18.4C-657.9,-148.9,-564.2,-306.1,-437.3,-395.2C-310.4,-484.3,-150.2,-545.3,11.3,-558.8C172.8,-572.3,308,-494.3,427,-545.9Z" transform="translate(450 300)" />
         </svg>
         <div className="absolute inset-0 backdrop-blur-3xl" />
      </div>

      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center relative z-10">
          <div className="w-14 h-14 border-4 rounded-full animate-spin border-black/10 dark:border-border border-t-amber-500" />
        </div>
      }>
        <Pricing isEmbedded={false} eventId={eventId} />
      </Suspense>
    </main>
  );
}
