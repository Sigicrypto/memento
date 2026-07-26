"use client";
 
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Sparkles, Zap, Star, Shield, Layout, ArrowRight, Heart, Music, BarChart3, Globe, ArrowLeft } from 'lucide-react';
 
import { PLANS } from '@/lib/plans';
type Region = 'IN' | 'GLOBAL';
 
 
export default function Pricing({ isEmbedded = false, eventId }: { isEmbedded?: boolean, eventId?: string }) {
  const [region, setRegion] = useState<Region>('GLOBAL');
 
  useEffect(() => {
    // Simple client-side region detection fallback
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz.includes('Calcutta') || tz.includes('India')) setRegion('IN');
  }, []);
 
  return (
    <section id="pricing" className={`${isEmbedded ? 'py-20' : 'pt-32 pb-24'} relative z-10 scroll-mt-32 w-full bg-bg`}>
      <div className="container">
        {!isEmbedded && (
          <div className="mb-10">
            <a href="/" className="inline-flex items-center gap-2 text-xs font-semibold text-text-muted hover:text-text-primary transition-colors">
               <ArrowLeft size={16} /> Back to Homepage
            </a>
          </div>
        )}
 
        <div className="text-center mb-16">
          <div className="hero-badge mb-4">
            Transparent Pricing
          </div>
          <h2 className="h2-text mb-4 text-text-primary">Pricing That Fits Every Event</h2>
          <p className="text-text-secondary text-sm max-w-xl mx-auto">One-time payment. No hidden subscriptions. Just lifetime access to your memories.</p>
        </div>
 
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-24 max-w-6xl mx-auto items-stretch">
          {PLANS.map((plan, idx) => {
            const price = region === 'IN' ? plan.priceIN : plan.priceGlobal;
            const Icon = plan.id === 'starter' ? Zap : plan.id === 'standard' ? Star : plan.id === 'premium' ? Heart : Shield;
            
            return (
              <motion.div 
                key={idx} 
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                className={`card-interactive flex flex-col h-full relative bg-surface/60 backdrop-blur-xl ${plan.highlight ? 'border-primary shadow-[0_0_30px_rgba(var(--primary-rgb),0.2)]' : 'border-border/50'}`}
              >
                {/* Recommended badge */}
                {plan.highlight && (
                   <div className="absolute -top-3 right-4 bg-primary text-bg text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded">
                      Recommended
                   </div>
                )}

                <div className="flex items-center gap-3 mb-4">
                   <div className="w-8 h-8 rounded bg-bg-subtle border border-border flex items-center justify-center flex-shrink-0 text-text-primary">
                      <Icon size={16} />
                   </div>
                   <h3 className="text-base font-bold text-text-primary">{plan.name}</h3>
                </div>

                <div className="mb-4">
                   <div className="flex items-baseline gap-1 mb-1">
                      <span className="text-3xl font-bold text-text-primary tracking-tight">{price}</span>
                      <span className="text-text-secondary text-xs">/event</span>
                   </div>
                   <p className="text-text-secondary text-xs">{plan.description}</p>
                </div>

                <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-4">{plan.stats}</p>

                <div className="flex-grow mb-6 space-y-3">
                   {plan.features.map((f, i) => (
                      <div key={i} className={`flex items-start gap-2 text-sm ${f.included ? 'text-text-primary' : 'text-text-muted'}`}>
                         {f.included ? <Check size={16} className="text-primary flex-shrink-0 mt-0.5" /> : <X size={16} className="flex-shrink-0 mt-0.5" />}
                         <span>{f.label}</span>
                      </div>
                   ))}
                </div>

                 <a 
                   href={`/checkout?plan=${plan.name.toUpperCase().replace(' ', '_')}${eventId ? `&eventId=${eventId}` : ''}`}
                   className={`btn w-full btn-lg ${plan.highlight ? 'btn-primary' : 'btn-secondary'}`}
                >
                   {plan.name === 'White Label' ? 'Get Started' : 'Select Plan'}
                </a>
              </motion.div>
            );
          })}
        </div>
 
        {/* Feature Breakdown Section */}
        <div className="flex flex-col gap-8 max-w-6xl mx-auto relative z-10">
           <h3 className="h3-text text-center text-text-primary">Feature Breakdown</h3>
           <div className="card overflow-x-auto p-0 border-border/50 bg-surface/60 backdrop-blur-xl">
              <table className="w-full text-left min-w-[720px] border-collapse">
                 <thead>
                    <tr className="border-b border-border bg-bg">
                       <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-text-muted w-1/3">Capability</th>
                       <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-success text-center">Starter</th>
                       <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-primary text-center">Standard</th>
                       <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-accent text-center">Premium</th>
                       <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-text-primary text-center">White Label</th>
                    </tr>
                 </thead>
                 <tbody>
                    <ComparisonRow label="Photo Uploads" values={['25/guest', '50/guest', 'Unlimited', 'Unlimited']} />
                    <ComparisonRow label="Live Wall Access" values={[true, true, true, true]} />
                    <ComparisonRow label="Zip Download" values={[true, true, true, true]} />
                    <ComparisonRow label="AI Face Discovery" values={[false, true, true, true]} />
                    <ComparisonRow label="Slideshow Designer" values={[false, true, true, true]} />
                    <ComparisonRow label="Real-time Reactions" values={[false, true, true, true]} />
                    <ComparisonRow label="Cinematic Soundtrack" values={[false, false, true, true]} />
                    <ComparisonRow label="Branding Removal" values={[false, false, false, true]} />
                    <ComparisonRow label="Storage Duration" values={['1 Month', '3 Months', '6 Months', '6 Months']} />
                 </tbody>
              </table>
           </div>
        </div>
 
        <div className="mt-20 max-w-4xl mx-auto relative z-10">
           <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="card text-center py-16 px-6 bg-surface/60 backdrop-blur-xl border-border/50"
           >
              <h3 className="text-3xl md:text-4xl font-bold tracking-tight text-text-primary mb-4">
                 Ready to preserve every heartbeat?
              </h3>
              <p className="text-text-secondary text-base mb-8 max-w-xl mx-auto">
                 Trusted by 2,000+ planners worldwide. No contracts, no subscriptions. Just magic.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                 <a href="/create" className="btn btn-primary btn-lg min-w-[200px]">
                    Create My Wall
                 </a>
                 <a href="https://wa.me/96896095692" target="_blank" className="btn btn-ghost btn-lg">
                    Questions? Chat with us
                 </a>
              </div>
           </motion.div>
        </div>
      </div>
    </section>
  );
}
 
function ComparisonRow({ label, values }: { label: string, values: any[] }) {
  return (
    <tr className="border-b border-border hover:bg-bg-subtle transition-colors">
       <td className="py-4 px-6 font-medium text-text-primary text-sm">{label}</td>
       {values.map((v, i) => (
          <td key={i} className="py-4 px-6 text-center align-middle">
             {typeof v === 'boolean' ? (
                v ? (
                   <Check size={16} className="text-text-primary mx-auto" />
                ) : (
                   <X size={16} className="text-text-muted mx-auto" />
                )
             ) : (
                 <span className="text-xs font-semibold uppercase tracking-wider text-text-primary">{v}</span>
              )}
          </td>
       ))}
    </tr>
  );
}
