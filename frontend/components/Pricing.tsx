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
    <section id="pricing" className={`${isEmbedded ? 'py-20' : 'pt-40 pb-32'} px-6 relative z-10 scroll-mt-32 w-full flex justify-center`}>
      <div className="container mx-auto w-full">
        {!isEmbedded && (
          <div className="mb-12">
            <a href="/" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-text-primary transition-all">
               <ArrowLeft size={14} /> Back to Homepage
            </a>
          </div>
        )}
 
        <div className="text-center mb-20">
          <div className="hero-badge mb-6">
            Transparent Pricing
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Pricing That Fits Every Event</h2>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto">One-time payment. No hidden subscriptions. Just lifetime access to your memories.</p>
        </div>
 
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-7 mb-32 items-stretch max-w-6xl mx-auto">
          {PLANS.map((plan, idx) => {
            const price = region === 'IN' ? plan.priceIN : plan.priceGlobal;
            const Icon = plan.id === 'starter' ? Zap : plan.id === 'standard' ? Star : plan.id === 'premium' ? Heart : Shield;
            
            return (
              <motion.div 
                key={idx} 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className={`h-full flex flex-col gcard relative group ${plan.highlight ? 'gcard-accent' : ''}`}
              >
                {/* Recommended badge */}
                {plan.highlight && (
                   <div className="absolute top-0 right-4 -translate-y-1/2 bg-text-primary text-bg text-[10px] font-semibold uppercase tracking-widest px-3 py-1 rounded-full whitespace-nowrap z-20">
                      Recommended
                   </div>
                )}

                {/* Section 1: Icon + Plan Name */}
                <div className="flex items-center gap-3 mb-5" style={{ minHeight: '40px' }}>
                   <div className={`w-8 h-8 rounded-lg bg-bg-subtle border border-border flex items-center justify-center flex-shrink-0`}>
                      <Icon size={16} className="text-text-primary" />
                   </div>
                   <h3 className="text-lg font-bold leading-tight text-text-primary">{plan.name}</h3>
                </div>

                {/* Section 2: Price + Description — fixed height for alignment */}
                <div className="mb-5" style={{ minHeight: '72px' }}>
                   <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold tracking-tighter">{price}</span>
                      <span className="text-text-primary text-xs font-medium">/event</span>
                   </div>
                   <p className="text-text-primary text-xs mt-2 italic leading-relaxed">"{plan.description}"</p>
                </div>

                {/* Section 3: Stats badge */}
                <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-4">{plan.stats}</p>

                {/* Section 4: Feature list — flex-grow to fill remaining space */}
                <div className="flex-grow mb-6">
                   <div className="flex flex-col gap-[10px]">
                      {plan.features.map((f, i) => (
                         <div key={i} className={`flex items-start gap-3 text-xs ${f.included ? 'text-text-primary' : 'text-text-muted'}`}>
                            {f.included ? <Check size={14} className="text-primary mt-0.5 flex-shrink-0" /> : <X size={14} className="mt-0.5 flex-shrink-0" />}
                            <span className={f.included ? 'text-text-primary' : ''}>{f.label}</span>
                         </div>
                      ))}
                   </div>
                </div>

                {/* Section 5: CTA button */}
                 <a 
                   href={`/checkout?plan=${plan.name.toUpperCase().replace(' ', '_')}${eventId ? `&eventId=${eventId}` : ''}`}
                   className={`btn w-full mt-auto ${plan.highlight ? 'btn-primary' : 'btn-secondary'}`}
                >
                   {plan.name === 'White Label' ? 'Get Started' : 'Select Plan'}
                </a>
              </motion.div>
            );
          })}
        </div>
 
        {/* Feature Breakdown Section */}
        <div className="flex flex-col" style={{ gap: '40px' }}>
           <h3 className="text-3xl font-bold text-center">Feature Breakdown</h3>
           <div
              className="glass-panel overflow-hidden border-border"
              style={{ padding: '0' }}
           >
              <div className="overflow-x-auto" style={{ padding: '24px 24px 32px' }}>
                 <table
                    className="w-full text-sm text-left"
                    style={{ tableLayout: 'fixed', minWidth: '720px', borderCollapse: 'collapse' }}
                 >
                    <thead>
                       <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                          <th
                             className="text-[10px] font-black uppercase tracking-widest text-text-muted text-left"
                             style={{ width: '30%', padding: '16px 24px 16px 32px' }}
                          >
                             Capability
                          </th>
                          <th
                             className="text-[10px] font-black uppercase tracking-widest text-green-400 text-center"
                             style={{ width: '17.5%', padding: '16px 24px' }}
                          >
                             Starter
                          </th>
                          <th
                             className="text-[10px] font-black uppercase tracking-widest text-primary text-center"
                             style={{ width: '17.5%', padding: '16px 24px' }}
                          >
                             Standard
                          </th>
                          <th
                             className="text-[10px] font-black uppercase tracking-widest text-secondary text-center"
                             style={{ width: '17.5%', padding: '16px 24px' }}
                          >
                             Premium
                          </th>
                          <th
                             className="text-[10px] font-black uppercase tracking-widest text-indigo-400 text-center"
                             style={{ width: '17.5%', padding: '16px 24px' }}
                          >
                             White Label
                          </th>
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
        </div>
 
        {/* CTA Section */}
        <div className="mt-16">
           <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="gcard overflow-hidden"
           >
              {/* Subtle top gradient line */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

              {/* Content container with responsive padding */}
              <div
                className="relative flex flex-col items-center justify-center text-center"
                style={{
                  padding: 'clamp(40px, 6vw, 80px) clamp(24px, 5vw, 64px)',
                  zIndex: 1,
                }}
              >
                 {/* Headline — 56-64px on desktop, responsive */}
                 <h3
                    className="font-bold tracking-tight text-text-primary"
                    style={{
                      fontSize: 'clamp(2rem, 4.5vw, 3.5rem)',
                      lineHeight: 1.15,
                      maxWidth: '640px',
                      marginBottom: '24px',
                    }}
                 >
                    Ready to preserve every heartbeat?
                 </h3>

                 {/* Subtitle */}
                 <p
                    className="text-text-primary/80"
                    style={{
                      fontSize: 'clamp(0.95rem, 1.5vw, 1.125rem)',
                      lineHeight: 1.7,
                      maxWidth: '520px',
                      marginBottom: '40px',
                    }}
                 >
                    Trusted by 2,000+ planners worldwide. No contracts, no subscriptions. Just magic.
                 </p>

                 {/* Button group — inline on desktop, stacked on mobile */}
                 <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                    {/* Primary CTA */}
                    <a
                       href="/create"
                       className="btn btn-primary px-8 py-3"
                    >
                       Create My Wall
                    </a>

                    {/* Secondary CTA */}
                    <a
                       href="https://wa.me/96896095692"
                       target="_blank"
                       className="inline-flex items-center justify-center gap-2 text-text-muted hover:text-primary transition-colors duration-300"
                       style={{
                         height: '56px',
                         fontSize: '0.7rem',
                         fontWeight: 900,
                         textTransform: 'uppercase' as const,
                         letterSpacing: '0.1em',
                       }}
                    >
                       Questions? Chat with us <ArrowRight size={14} />
                    </a>
                 </div>
              </div>
           </motion.div>
        </div>
      </div>
    </section>
  );
}
 
function ComparisonRow({ label, values }: { label: string, values: any[] }) {
  return (
    <tr
       className="hover:bg-white/5 transition-colors"
       style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}
    >
       <td
          className="font-semibold text-text-primary text-sm"
          style={{ padding: '18px 24px 18px 32px' }}
       >
          {label}
       </td>
       {values.map((v, i) => (
          <td
             key={i}
             className="text-center"
             style={{ padding: '18px 24px', verticalAlign: 'middle' }}
          >
             {typeof v === 'boolean' ? (
                v ? (
                   <Check size={18} className="text-primary mx-auto" style={{ display: 'block' }} />
                ) : (
                   <X size={18} className="text-text-primary opacity-20 mx-auto" style={{ display: 'block' }} />
                )
             ) : (
                 <span className="text-[10px] font-black uppercase tracking-widest text-text-primary">{v}</span>
              )}
          </td>
       ))}
    </tr>
  );
}
