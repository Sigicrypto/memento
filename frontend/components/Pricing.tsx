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
            <a href="/" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-black dark:text-white transition-all">
               <ArrowLeft size={14} /> Back to Homepage
            </a>
          </div>
        )}
 
        <div className="text-center mb-20">
          <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-black uppercase tracking-widest text-primary mb-6">
             <Sparkles size={12} /> Transparent Pricing
          </motion.div>
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">Pricing That <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">Fits Every Event</span></h2>
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
                className={`h-full flex flex-col glass-panel !overflow-visible relative group transition-all duration-500 hover:border-primary/50 ${plan.highlight ? 'border-primary/40 ring-1 ring-primary/20 bg-primary/5 shadow-2xl shadow-primary/10' : ''}`}
                style={{ padding: '32px' }}
              >
                {/* Recommended badge — absolutely positioned, doesn't affect flow */}
                {plan.highlight && (
                   <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-white text-[10px] font-black uppercase tracking-widest px-5 py-2 rounded-full shadow-xl shadow-primary/30 whitespace-nowrap z-20">
                      ✨ Recommended
                   </div>
                )}

                {/* Section 1: Icon + Plan Name — fixed height for alignment */}
                <div className="flex items-center gap-3 mb-5" style={{ minHeight: '40px' }}>
                   <div className={`w-10 h-10 rounded-xl bg-white/5 border border-black/20 dark:border-black/10 dark:border-white/10 flex items-center justify-center flex-shrink-0 ${plan.iconColor}`}>
                      <Icon size={20} />
                   </div>
                   <h3 className="text-xl font-bold leading-tight">{plan.name}</h3>
                </div>

                {/* Section 2: Price + Description — fixed height for alignment */}
                <div className="mb-5" style={{ minHeight: '72px' }}>
                   <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold tracking-tighter">{price}</span>
                      <span className="text-black dark:text-white text-xs font-medium">/event</span>
                   </div>
                   <p className="text-black dark:text-white text-xs mt-2 italic leading-relaxed">"{plan.description}"</p>
                </div>

                {/* Section 3: Stats badge */}
                <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-4">{plan.stats}</p>

                {/* Section 4: Feature list — flex-grow to fill remaining space */}
                <div className="flex-grow mb-6">
                   <div className="flex flex-col gap-[10px]">
                      {plan.features.map((f, i) => (
                         <div key={i} className={`flex items-start gap-3 text-xs ${f.included ? 'text-black dark:text-white' : 'text-black/50 dark:text-white/40'}`}>
                            {f.included ? <Check size={14} className="text-primary mt-0.5 flex-shrink-0" /> : <X size={14} className="mt-0.5 flex-shrink-0" />}
                            <span className={f.included ? 'text-black dark:text-white' : ''}>{f.label}</span>
                         </div>
                      ))}
                   </div>
                </div>

                {/* Section 5: CTA button — pushed to bottom with mt-auto */}
                 <a 
                   href={`/checkout?plan=${plan.name.toUpperCase().replace(' ', '_')}${eventId ? `&eventId=${eventId}` : ''}`}
                   className={`w-full py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all text-center mt-auto flex items-center justify-center gap-2 ${plan.highlight ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'bg-black/5 dark:bg-white/5 border border-black/20 dark:border-white/10 hover:bg-black/10 dark:hover:bg-white/10 text-black dark:text-white'}`}
                >
                   {plan.name === 'White Label' ? 'Get Started ✦' : 'Select Plan ✦'}
                </a>
              </motion.div>
            );
          })}
        </div>
 
        {/* Feature Breakdown Section */}
        <div className="flex flex-col" style={{ gap: '40px' }}>
           <h3 className="text-3xl font-bold text-center">Feature Breakdown</h3>
           <div
              className="glass-panel overflow-hidden border-black/20 dark:border-black/10 dark:border-white/10"
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
 
        {/* CTA Section — 64px spacing from Feature Breakdown */}
        <div style={{ marginTop: '64px' }}>
           <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="relative overflow-hidden"
              style={{
                borderRadius: '24px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                background: 'rgba(15, 15, 18, 0.7)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                boxShadow: '0 32px 64px -16px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.04)',
              }}
           >
              {/* Ambient glow effects */}
              <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
                 <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[200px] bg-primary/10 rounded-full blur-[100px]" />
                 <div className="absolute bottom-0 right-0 w-[200px] h-[200px] bg-secondary/5 rounded-full blur-[80px]" />
              </div>
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
                    className="font-bold tracking-tight text-black dark:text-white"
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
                    className="text-text-secondary"
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
                       className="inline-flex items-center justify-center font-semibold text-black dark:text-white transition-all duration-300 hover:-translate-y-0.5"
                       style={{
                         height: '56px',
                         padding: '0 40px',
                         borderRadius: '16px',
                         background: 'linear-gradient(135deg, #6366f1, #818cf8)',
                         boxShadow: '0 8px 24px -4px rgba(99, 102, 241, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.06) inset',
                         fontSize: '0.95rem',
                         letterSpacing: '0.01em',
                       }}
                    >
                       Create My Wall ✦
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
          className="font-semibold text-black dark:text-white text-sm"
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
                   <X size={18} className="text-black dark:text-white opacity-20 mx-auto" style={{ display: 'block' }} />
                )
             ) : (
                 <span className="text-[10px] font-black uppercase tracking-widest text-black dark:text-white">{v}</span>
              )}
          </td>
       ))}
    </tr>
  );
}
