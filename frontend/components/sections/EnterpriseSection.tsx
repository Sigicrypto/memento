import React from 'react';
import { Building2, ShieldCheck, Palette, Server, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function EnterpriseSection() {
  return (
    <section className="py-24 px-4 md:px-8 bg-slate-900/50 border-t border-white/5 relative overflow-hidden w-full flex justify-center">
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] pointer-events-none mix-blend-overlay"></div>
      
      <div className="w-full max-w-7xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-extrabold tracking-wider uppercase mb-6">
              <Building2 size={14} />
              For Event Professionals
            </span>
            <h2 className="text-3xl md:text-5xl font-black text-white leading-tight mb-6">
              Built for <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">Agencies & Planners</span>
            </h2>
            <p className="text-slate-300 text-lg mb-8 leading-relaxed">
              Scale your event business with our enterprise-grade white-label platform. Deliver premium, moderated live experiences to your corporate and luxury wedding clients under your own brand.
            </p>
            
            <div className="space-y-6 mb-10">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
                  <Palette className="text-purple-400" size={24} />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg mb-1">100% White-Label Branding</h3>
                  <p className="text-slate-400 text-sm">Remove all Memento branding. Host galleries on your custom domain (e.g., live.youragency.com).</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
                  <ShieldCheck className="text-cyan-400" size={24} />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg mb-1">Advanced Host Moderation</h3>
                  <p className="text-slate-400 text-sm">Dedicated moderation dashboard to approve or reject photos in real-time before they hit the live screen.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                  <Server className="text-emerald-400" size={24} />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg mb-1">Enterprise Privacy & GDPR</h3>
                  <p className="text-slate-400 text-sm">Strict data retention rules, password-protected vaults, and compliance for corporate peace of mind.</p>
                </div>
              </div>
            </div>

            <Link href="/professionals" className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold transition-all hover:scale-105">
              Explore Professional Features <ArrowRight size={18} />
            </Link>
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/20 to-cyan-500/20 blur-3xl rounded-full"></div>
            <div className="relative bg-slate-900 border border-white/10 rounded-2xl p-2 shadow-2xl overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-purple-500 to-cyan-500"></div>
              <div className="bg-slate-950 rounded-xl p-6 border border-white/5">
                <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center">
                      <Building2 size={20} className="text-slate-400" />
                    </div>
                    <div>
                      <div className="text-white font-bold">Agency Dashboard</div>
                      <div className="text-slate-500 text-xs">live.youragency.com</div>
                    </div>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20">
                    Live Event Active
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="h-24 rounded-lg bg-slate-900 border border-white/5 flex items-center px-6 gap-6 relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-500"></div>
                    <div className="w-16 h-12 rounded bg-slate-800"></div>
                    <div className="flex-1">
                      <div className="h-3 w-24 bg-slate-700 rounded mb-2"></div>
                      <div className="h-2 w-32 bg-slate-800 rounded"></div>
                    </div>
                    <div className="flex gap-2">
                      <div className="px-4 py-1.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold">Approve</div>
                      <div className="px-4 py-1.5 rounded-full bg-rose-500/10 text-rose-400 text-xs font-bold">Reject</div>
                    </div>
                  </div>
                  <div className="h-24 rounded-lg bg-slate-900 border border-white/5 flex items-center px-6 gap-6">
                    <div className="w-16 h-12 rounded bg-slate-800"></div>
                    <div className="flex-1">
                      <div className="h-3 w-20 bg-slate-700 rounded mb-2"></div>
                      <div className="h-2 w-28 bg-slate-800 rounded"></div>
                    </div>
                    <div className="flex gap-2">
                      <div className="px-4 py-1.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold">Approve</div>
                      <div className="px-4 py-1.5 rounded-full bg-rose-500/10 text-rose-400 text-xs font-bold">Reject</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
