"use client";
 
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Sparkles, Zap, Star, Shield, Layout, ArrowRight, Heart, Music, BarChart3, Globe, ArrowLeft } from 'lucide-react';
 
import { PLANS } from '@/lib/plans';
import SectionHeader from '@/components/sections/SectionHeader';
import SpecularButton from '@/components/SpecularButton';
import { useRouter } from 'next/navigation';
type Region = 'IN' | 'GLOBAL';
 
 
export default function Pricing({ isEmbedded = false, eventId }: { isEmbedded?: boolean, eventId?: string }) {
  const [region, setRegion] = useState<Region>('IN');
  const router = useRouter();

  useEffect(() => {
    // Always display prices in INR
    setRegion('IN');
  }, []);
 
  return (
    <section id="pricing" className={`${isEmbedded ? 'lp-section' : 'pt-44 pb-40'} relative z-10 scroll-mt-32 w-full flex flex-col items-center justify-center`}>
      <div className="section-container wide-section-container w-full px-4 md:px-8">
        {!isEmbedded && (
          <div className="mb-10">
            <a href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-white/50 hover:text-white transition-colors">
               <ArrowLeft size={16} /> Back to Homepage
            </a>
          </div>
        )}

        <SectionHeader
          badge="Transparent Pricing"
          badgeColor="purple"
          title="Pricing That Fits Every Event"
          description="One-time payment. No hidden subscriptions. Just lifetime access to your memories."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-14 xl:gap-20 mb-36 items-stretch w-full mx-auto" style={{ maxWidth: '1800px' }}>
          {PLANS.map((plan, idx) => {
            const price = region === 'IN' ? plan.priceIN : plan.priceGlobal;
            const Icon = plan.id === 'starter' ? Zap : plan.id === 'standard' ? Star : plan.id === 'premium' ? Heart : Shield;
            
            return (
              <motion.div 
                key={idx} 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
                className={`@container lp-card flex flex-col h-full relative group w-full max-w-none p-8 sm:p-10 md:p-12 lg:p-16 text-center ${plan.highlight ? 'border-neon-magenta shadow-[0_0_40px_rgba(255,0,255,0.25)]' : ''}`}
              >
                {/* Recommended badge */}
                {plan.highlight && (
                   <div 
                     className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-gradient-neon text-white text-sm font-bold shadow-[0_0_15px_rgba(168,85,247,0.4)] hover:shadow-[0_0_25px_rgba(168,85,247,0.65)] hover:scale-105 active:scale-95 transition-all duration-200 whitespace-nowrap h-fit cursor-default"
                     style={{
                       paddingLeft: '1rem',
                       paddingRight: '1rem',
                       paddingTop: '.5rem',
                       paddingBottom: '.5rem',
                     }}
                   >
                      Recommended
                   </div>
                )}

                <div className="flex flex-col items-center gap-4 mb-10 text-center">
                   <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-[1.5rem] sm:rounded-[1.75rem] bg-[#1a1a1a] border border-white/10 flex items-center justify-center flex-shrink-0 text-white group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <Icon size={28} className={`sm:w-[30px] sm:h-[30px] ${plan.highlight ? 'text-neon-magenta' : 'text-white/80'}`} />
                   </div>
                   <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-wide">{plan.name}</h3>
                </div>

                <div className="mb-8 flex flex-col items-center text-center px-4 md:px-0">
                   <div className="flex items-baseline gap-1 sm:gap-2 mb-4 justify-center whitespace-nowrap">
                      <span className="text-[clamp(2.25rem,14cqw,4.5rem)] font-black text-white tracking-tighter leading-none">{price}</span>
                      <span className="text-white/50 text-[clamp(1rem,4cqw,1.5rem)] font-medium">/event</span>
                   </div>
                   <p className="text-white/60 text-sm sm:text-base md:text-lg leading-relaxed max-w-xl mx-auto">{plan.description}</p>
                </div>

                <div className="flex justify-center mb-8 px-2 sm:px-4">
                   <p className="text-[11px] sm:text-sm md:text-base font-bold uppercase tracking-widest text-neon-cyan bg-neon-cyan/10 inline-block px-4 sm:px-6 py-2 sm:py-3 rounded-full border border-neon-cyan/20 whitespace-nowrap">{plan.stats}</p>
                </div>

                <div className="flex-grow mb-10 space-y-4">
                   {plan.features.map((f, i) => (
                       <div key={i} className={`flex items-start gap-2 sm:gap-3 text-sm ${f.included ? 'text-white/90' : 'text-white/30'}`}>
                          {f.included ? <Check size={18} className="text-neon-cyan flex-shrink-0 mt-0.5 sm:w-[20px]" /> : <X size={18} className="flex-shrink-0 mt-0.5 sm:w-[20px]" />}
                          <span className="leading-snug text-[13px] sm:text-[15px] text-left">{f.label}</span>
                       </div>
                   ))}
                </div>

                 <SpecularButton 
                   onClick={() => router.push(`/checkout?plan=${plan.name.toUpperCase().replace(' ', '_')}${eventId ? `&eventId=${eventId}` : ''}`)}
                   className="mt-auto w-full font-bold whitespace-nowrap"
                   radius={999}
                   textColor="#ffffff"
                   lineColor={plan.highlight ? "#a855f7" : "#00ffff"}
                   baseColor="#1a1a1a"
                   intensity={1.5}
                   size="lg"
                   autoAnimate={plan.highlight}
                 >
                   {plan.name === 'White Label' ? 'Get Started' : 'Select Plan'}
                 </SpecularButton>
              </motion.div>
            );
          })}
        </div>
 
        {/* Feature Breakdown Section */}
        <div className="flex flex-col gap-10 relative z-10 mb-36 w-full max-w-[2200px] mx-auto px-4 md:px-10">
           <h3 className="text-3xl md:text-4xl font-bold text-center text-white mb-6">Feature Breakdown</h3>
           <div className="glass-panel border border-white/10 rounded-[40px] w-full" style={{ padding: '2rem 3rem' }}>
              <div className="w-full overflow-x-auto pb-6">
                 <table className="w-full text-left min-w-[1200px] border-collapse">
                    <thead>
                       <tr className="border-b border-white/10 bg-[#1a1a1a]/50">
                          <th className="py-8 text-sm font-bold uppercase tracking-widest text-white/50 w-1/5 rounded-tl-2xl" style={{ paddingLeft: '2rem', paddingRight: '2rem' }}>Capability</th>
                          <th className="py-8 px-4 text-sm font-bold uppercase tracking-widest text-white/80 text-center w-1/5">Starter</th>
                          <th className="py-8 px-4 text-sm font-bold uppercase tracking-widest text-neon-magenta text-center w-1/5">Standard</th>
                          <th className="py-8 px-4 text-sm font-bold uppercase tracking-widest text-neon-cyan text-center w-1/5">Premium</th>
                          <th className="py-8 px-4 text-sm font-bold uppercase tracking-widest text-white text-center rounded-tr-2xl w-1/5">White Label</th>
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
 
      </div>
    </section>
  );
}
 
function ComparisonRow({ label, values }: { label: string, values: any[] }) {
  return (
    <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
       <td className="py-6 font-bold text-white/90 text-base" style={{ paddingLeft: '2rem', paddingRight: '2rem' }}>{label}</td>
       {values.map((v, i) => (
          <td key={i} className="py-10 px-4 align-middle w-1/5">
             <div className="flex justify-center items-center w-full">
                {typeof v === 'boolean' ? (
                   v ? (
                      <Check size={22} className="text-neon-cyan drop-shadow-[0_0_8px_rgba(0,255,255,0.6)]" />
                   ) : (
                      <X size={22} className="text-white/20" />
                   )
                ) : (
                    <span className="text-base font-bold uppercase tracking-wider text-white/80 text-center">{v}</span>
                 )}
             </div>
          </td>
       ))}
    </tr>
  );
}
