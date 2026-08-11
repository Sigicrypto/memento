"use client";
 
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Check, X, Zap, Star, Heart, Shield, ArrowLeft } from 'lucide-react';
 
import { PLANS } from '@/lib/plans';
import SectionHeader from '@/components/sections/SectionHeader';
import { useRouter } from 'next/navigation';
 
export default function Pricing({ isEmbedded = false, eventId }: { isEmbedded?: boolean, eventId?: string }) {
  const router = useRouter();
 
  return (
    <section id="pricing" className={`${isEmbedded ? 'lp-section' : 'pt-32 pb-32'} relative z-10 scroll-mt-32 w-full flex flex-col items-center justify-center bg-slate-950/80`}>
      <div className="max-w-6xl w-full mx-auto px-4 md:px-8 flex flex-col items-center text-center">
        {!isEmbedded && (
          <div className="mb-10">
            <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white transition-colors">
               <ArrowLeft size={16} /> Back to Homepage
            </Link>
          </div>
        )}

        <SectionHeader
          badge="Simple Configurable Pricing"
          badgeColor="cyan"
          title="Transparent Pricing for Every Event"
          description="Clear pricing tailored for host celebrations and professional event businesses."
        />

        {/* ─── Pricing Cards Grid ─── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 lg:gap-6 mb-20 items-stretch w-full mt-10">
          {PLANS.map((plan, idx) => {
            const price = plan.price;
            const Icon = plan.id === 'free' ? Zap : plan.id === 'event' ? Star : plan.id === 'premium' ? Heart : Shield;
            
            return (
              <motion.div 
                key={plan.id} 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08, duration: 0.5 }}
                className={`relative flex flex-col h-full group rounded-2xl lg:rounded-3xl border bg-slate-900/80 backdrop-blur-xl p-6 sm:p-8 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_60px_rgba(0,0,0,0.5)] ${
                  plan.highlight 
                    ? 'border-cyan-500/50 shadow-[0_0_30px_rgba(6,182,212,0.2)]' 
                    : 'border-white/10 hover:border-white/20'
                }`}
              >
                {/* Recommended badge */}
                {plan.badge && (
                   <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-extrabold px-4 py-1.5 shadow-lg whitespace-nowrap z-10">
                      {plan.badge}
                   </div>
                )}

                {/* Icon + Plan Name */}
                <div className="flex flex-col items-center gap-3 mb-6 text-center pt-3">
                   <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 border transition-transform duration-300 group-hover:scale-110 ${
                     plan.highlight 
                       ? 'bg-cyan-500/10 border-cyan-500/30' 
                       : 'bg-white/5 border-white/10'
                   }`}>
                      <Icon size={24} className={plan.highlight ? 'text-cyan-400' : 'text-white'} />
                   </div>
                   <h3 className="text-xl font-extrabold text-white">{plan.name}</h3>
                </div>

                {/* Price */}
                <div className="mb-6 text-center">
                   <div className="flex items-baseline gap-1 justify-center">
                      <span className="text-3xl lg:text-4xl font-black text-white tracking-tight">{price}</span>
                      {plan.period && <span className="text-slate-400 text-xs font-medium">{plan.period}</span>}
                   </div>
                   <p className="text-slate-400 text-xs mt-2 leading-relaxed font-medium">{plan.description}</p>
                </div>

                {/* Stats Badge */}
                <div className="flex justify-center mb-6">
                   <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-300 bg-cyan-500/10 px-3.5 py-1.5 rounded-full border border-cyan-500/30">{plan.stats}</span>
                </div>

                {/* Divider */}
                <div className="w-full h-px bg-white/10 mb-6" />

                {/* Features */}
                <div className="flex-grow mb-8 space-y-3">
                   {plan.features.map((f, i) => (
                       <div key={i} className={`flex items-start gap-2.5 ${f.included ? 'text-slate-200' : 'text-slate-500 opacity-50'}`}>
                          {f.included 
                            ? <Check size={16} className="text-cyan-400 flex-shrink-0 mt-0.5" /> 
                            : <X size={16} className="flex-shrink-0 mt-0.5" />
                          }
                          <span className="leading-relaxed text-xs text-left font-medium">{f.label}</span>
                       </div>
                   ))}
                </div>

                {/* CTA Button */}
                <button
                  type="button"
                  onClick={() => router.push(`/checkout?plan=${plan.id}${eventId ? `&eventId=${eventId}` : ''}`)}
                  className={`mt-auto w-full font-extrabold text-xs py-3.5 px-6 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] ${
                    plan.highlight
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-cyan-500/30 hover:shadow-cyan-500/50'
                      : 'bg-white/10 hover:bg-white/20 text-white border border-white/15'
                  }`}
                >
                  <span>Select Plan</span>
                </button>
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
           <h3 className="text-2xl md:text-3xl font-bold text-center text-white mb-8">Feature Comparison</h3>
           <div className="rounded-2xl border border-white/10 bg-slate-900/60 overflow-hidden shadow-xl">
              <div className="w-full overflow-x-auto">
                 <table className="w-full text-left min-w-[700px] border-collapse">
                    <thead>
                       <tr className="border-b border-white/10 bg-slate-950">
                          <th className="py-4 px-6 text-xs font-bold uppercase tracking-widest text-slate-400 w-[28%]">Capability</th>
                          <th className="py-4 px-4 text-xs font-bold uppercase tracking-widest text-slate-300 text-center w-[18%]">Free</th>
                          <th className="py-4 px-4 text-xs font-bold uppercase tracking-widest text-cyan-400 text-center w-[18%]">Event</th>
                          <th className="py-4 px-4 text-xs font-bold uppercase tracking-widest text-amber-400 text-center w-[18%]">Premium</th>
                          <th className="py-4 px-4 text-xs font-bold uppercase tracking-widest text-purple-400 text-center w-[18%]">Professional</th>
                       </tr>
                    </thead>
                    <tbody>
                       <ComparisonRow label="Photo & Video Uploads" values={['30 Photos', '1,000 Uploads', '5,000 Uploads', '10,000 / Event']} />
                       <ComparisonRow label="Live Wall Experience" values={[false, true, true, true]} />
                       <ComparisonRow label="Full ZIP Download" values={[false, true, true, true]} />
                       <ComparisonRow label="Host Moderation Panel" values={[false, false, true, true]} />
                       <ComparisonRow label="Custom Branding" values={[false, false, true, true]} />
                       <ComparisonRow label="White-Label & Custom Domain" values={[false, false, false, true]} />
                       <ComparisonRow label="Storage Duration" values={['24 Hours', '7 Days', '30 Days', '90 Days']} />
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
    <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
       <td className="py-3.5 px-6 font-semibold text-slate-200 text-xs md:text-sm">{label}</td>
       {values.map((v, i) => (
          <td key={i} className="py-3.5 px-4 text-center">
             {typeof v === 'boolean' ? (
                v ? (
                   <Check size={18} className="text-cyan-400 mx-auto" />
                ) : (
                   <X size={18} className="text-slate-600 opacity-40 mx-auto" />
                )
             ) : (
                 <span className="text-xs font-bold uppercase tracking-wider text-slate-300">{v}</span>
              )}
          </td>
       ))}
    </tr>
  );
}
