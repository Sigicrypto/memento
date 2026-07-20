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
            <a href="/" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-white transition-all">
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
 
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-32 items-stretch max-w-6xl mx-auto">
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
                className={`flex flex-col h-full glass-panel !overflow-visible p-8 relative group transition-all duration-500 hover:border-primary/50 ${plan.highlight ? 'border-primary/40 ring-1 ring-primary/20 bg-primary/5 shadow-2xl shadow-primary/10' : ''}`}
              >
                {plan.highlight && (
                   <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-white text-[10px] font-black uppercase tracking-widest px-5 py-2 rounded-full shadow-xl shadow-primary/30 whitespace-nowrap z-20">
                      ✨ Recommended
                   </div>
                )}
 
                <div className="flex items-center gap-3 mb-6">
                   <div className={`w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center ${plan.iconColor}`}>
                      <Icon size={20} />
                   </div>
                   <h3 className="text-xl font-bold">{plan.name}</h3>
                </div>
 
                <div className="mb-6">
                   <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold tracking-tighter">{price}</span>
                      <span className="text-text-muted text-xs font-medium">/event</span>
                   </div>
                   <p className="text-text-secondary text-xs mt-2 italic">"{plan.description}"</p>
                </div>
 
                <div className="space-y-4 flex-grow mb-8">
                   <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-4">{plan.stats}</p>
                   {plan.features.map((f, i) => (
                      <div key={i} className={`flex items-start gap-3 text-xs ${f.included ? 'text-text-secondary' : 'text-text-muted opacity-40'}`}>
                         {f.included ? <Check size={14} className="text-primary mt-0.5 flex-shrink-0" /> : <X size={14} className="mt-0.5 flex-shrink-0" />}
                         <span className={f.included ? 'text-white/80' : ''}>{f.label}</span>
                      </div>
                   ))}
                </div>

                <a 
                   href={`/checkout?plan=${plan.name.toUpperCase().replace(' ', '_')}${eventId ? `&eventId=${eventId}` : ''}`}
                   className={`w-full py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all text-center mt-auto flex items-center justify-center gap-2 group ${plan.highlight ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'bg-white/5 border border-white/10 hover:bg-white/10 text-white'}`}
                >
                   {plan.name === 'White Label' ? 'Get Started ✦' : 'Select Plan ✦'}
                </a>
              </motion.div>
            );
          })}
        </div>
 
        <div className="space-y-12">
           <h3 className="text-3xl font-bold text-center">Feature Breakdown</h3>
           <div className="glass-panel p-0 overflow-hidden border-white/10">
              <div className="overflow-x-auto">
                 <table className="w-full min-w-[900px] text-sm text-left table-fixed">
                    <thead className="bg-white/5 border-b border-white/10">
                       <tr>
                          <th className="w-[20%] px-8 py-5 text-[10px] font-black uppercase tracking-widest text-text-muted">Capability</th>
                          <th className="w-[20%] px-4 py-5 text-[10px] font-black uppercase tracking-widest text-green-400 text-center">Starter</th>
                          <th className="w-[20%] px-4 py-5 text-[10px] font-black uppercase tracking-widest text-primary text-center">Standard</th>
                          <th className="w-[20%] px-4 py-5 text-[10px] font-black uppercase tracking-widest text-secondary text-center">Premium</th>
                          <th className="w-[20%] px-4 py-5 text-[10px] font-black uppercase tracking-widest text-indigo-400 text-center">White Label</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                       <ComparisonRow label="Unlimited Photos" values={[true, true, true, true]} />
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
 
        <div className="mt-40">
           <div className="glass-panel p-12 md:p-20 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-primary/5 -z-10 group-hover:bg-primary/10 transition-all" />
              <div className="relative z-10 max-w-2xl mx-auto">
                 <h3 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">Ready to preserve every heartbeat?</h3>
                 <p className="text-text-secondary text-lg mb-12">Trusted by 2,000+ planners worldwide. No contracts, no subscriptions. Just magic.</p>
                 <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                    <a href="/create" className="btn-premium !px-12 !py-5 shadow-2xl shadow-primary/20">Create My Wall ✦</a>
                    <a href="https://wa.me/96896095692" target="_blank" className="text-xs font-black uppercase tracking-widest hover:text-primary transition-colors flex items-center gap-2">
                       Questions? Chat with us <ArrowRight size={14} />
                    </a>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </section>
  );
}
 
function ComparisonRow({ label, values }: { label: string, values: any[] }) {
  return (
    <tr className="hover:bg-white/5 transition-colors">
       <td className="px-8 py-4 font-bold text-white/80 text-sm">{label}</td>
       {values.map((v, i) => (
          <td key={i} className="px-4 py-4 text-center">
             {typeof v === 'boolean' ? (
                v ? <Check size={18} className="text-primary mx-auto" /> : <X size={18} className="text-text-muted opacity-20 mx-auto" />
             ) : (
                <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">{v}</span>
             )}
          </td>
       ))}
    </tr>
  );
}
