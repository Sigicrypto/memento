"use client";
 
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Check, X, Zap, Star, Heart, Shield, ArrowLeft } from 'lucide-react';
 
import { PLANS } from '@/lib/plans';
import SectionHeader from '@/components/sections/SectionHeader';
import SpecularButton from '@/components/SpecularButton';
import { useRouter } from 'next/navigation';
 
 
export default function Pricing({ isEmbedded = false, eventId }: { isEmbedded?: boolean, eventId?: string }) {
  const router = useRouter();
 
  return (
    <section id="pricing" className={`${isEmbedded ? 'lp-section' : 'pt-44 pb-40'} relative z-10 scroll-mt-32 w-full flex flex-col items-center justify-center`}>
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
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

        {/* ─── Pricing Cards Grid ─── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 lg:gap-6 mb-24 items-stretch w-full">
          {PLANS.map((plan, idx) => {
            const price = plan.price;
            const Icon = plan.id === 'starter' ? Zap : plan.id === 'standard' ? Star : plan.id === 'premium' ? Heart : Shield;
            
            return (
              <motion.div 
                key={idx} 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08, duration: 0.5 }}
                className={`relative flex flex-col h-full group rounded-2xl lg:rounded-3xl border bg-[var(--surface)] p-7 sm:p-8 lg:p-10 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_60px_rgba(0,0,0,0.3)] ${
                  plan.highlight 
                    ? 'border-[#a855f7]/50 shadow-[0_0_30px_rgba(168,85,247,0.2)]' 
                    : 'border-white/10 hover:border-white/20'
                }`}
              >
                {/* Recommended badge */}
                {plan.highlight && (
                   <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-[#a855f7] to-[#ec4899] text-white text-xs font-bold px-4 py-1.5 shadow-[0_0_15px_rgba(168,85,247,0.4)] whitespace-nowrap z-10">
                      ⭐ Recommended
                   </div>
                )}

                {/* Icon + Plan Name */}
                <div className="flex flex-col items-center gap-4 mb-8 text-center pt-3">
                   <div className={`w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 border transition-transform duration-300 group-hover:scale-110 ${
                     plan.highlight 
                       ? 'bg-[#a855f7]/10 border-[#a855f7]/20' 
                       : 'bg-white/5 border-white/10'
                   }`}>
                      <Icon size={26} className={plan.highlight ? 'text-[#a855f7]' : 'text-white/70'} />
                   </div>
                   <h3 className="text-xl lg:text-2xl font-bold text-white">{plan.name}</h3>
                </div>

                {/* Price */}
                <div className="mb-7 text-center">
                   <div className="flex items-baseline gap-1 justify-center">
                      <span className="text-3xl lg:text-4xl font-black text-white tracking-tight">{price}</span>
                      <span className="text-white/40 text-sm font-medium">/event</span>
                   </div>
                   <p className="text-white/50 text-xs sm:text-sm mt-3 leading-relaxed">{plan.description}</p>
                </div>

                {/* Stats Badge */}
                <div className="flex justify-center mb-7">
                   <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#00ffff] bg-[#00ffff]/8 px-4 py-2 rounded-full border border-[#00ffff]/15">{plan.stats}</span>
                </div>

                {/* Divider */}
                <div className="w-full h-px bg-white/8 mb-7" />

                {/* Features */}
                <div className="flex-grow mb-8 space-y-3.5">
                   {plan.features.map((f, i) => (
                       <div key={i} className={`flex items-start gap-2.5 ${f.included ? 'text-white/85' : 'text-white/25'}`}>
                          {f.included 
                            ? <Check size={16} className="text-[#00ffff] flex-shrink-0 mt-0.5" /> 
                            : <X size={16} className="flex-shrink-0 mt-0.5" />
                          }
                          <span className="leading-relaxed text-[13px] sm:text-sm text-left">{f.label}</span>
                       </div>
                   ))}
                </div>

                {/* CTA Button */}
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
 
        {/* ─── Feature Breakdown Table ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-20 w-full"
        >
           <h3 className="text-2xl md:text-3xl font-bold text-center text-white mb-8">Feature Breakdown</h3>
           <div className="rounded-2xl lg:rounded-3xl border border-white/10 bg-[var(--surface)] overflow-hidden">
              <div className="w-full overflow-x-auto">
                 <table className="w-full text-left min-w-[700px] border-collapse">
                    <thead>
                       <tr className="border-b border-white/10 bg-white/[0.03]">
                          <th className="py-4 lg:py-5 px-4 lg:px-6 text-xs font-bold uppercase tracking-widest text-white/40 w-[28%]">Capability</th>
                          <th className="py-4 lg:py-5 px-3 lg:px-4 text-xs font-bold uppercase tracking-widest text-white/70 text-center w-[18%]">Starter</th>
                          <th className="py-4 lg:py-5 px-3 lg:px-4 text-xs font-bold uppercase tracking-widest text-[#a855f7] text-center w-[18%]">Standard</th>
                          <th className="py-4 lg:py-5 px-3 lg:px-4 text-xs font-bold uppercase tracking-widest text-[#00ffff] text-center w-[18%]">Premium</th>
                          <th className="py-4 lg:py-5 px-3 lg:px-4 text-xs font-bold uppercase tracking-widest text-white/90 text-center w-[18%]">White Label</th>
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
        </motion.div>
 
      </div>
    </section>
  );
}
 
function ComparisonRow({ label, values }: { label: string, values: any[] }) {
  return (
    <tr className="border-b border-white/5 hover:bg-white/[0.03] transition-colors">
       <td className="py-3.5 lg:py-4 px-4 lg:px-6 font-semibold text-white/80 text-sm">{label}</td>
       {values.map((v, i) => (
          <td key={i} className="py-3.5 lg:py-4 px-3 lg:px-4 text-center">
             {typeof v === 'boolean' ? (
                v ? (
                   <Check size={18} className="text-[#00ffff] drop-shadow-[0_0_6px_rgba(0,255,255,0.5)] mx-auto" />
                ) : (
                   <X size={18} className="text-white/15 mx-auto" />
                )
             ) : (
                 <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-white/70">{v}</span>
              )}
          </td>
       ))}
    </tr>
  );
}
