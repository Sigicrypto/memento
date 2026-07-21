"use client";
 
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, FileText, Lock, UserCheck, CreditCard, Scale, HelpCircle, Check } from 'lucide-react';
 
export default function TermsPage() {
  return (
    <div className="min-h-screen relative overflow-x-hidden flex flex-col">
      <div className="grain" />
      <div className="orbs"><div className="orb orb-primary" /><div className="orb orb-secondary" /></div>
 
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-[100] h-20 border-b border-black/5 dark:border-black/20 dark:border-black/10 dark:border-white/5 backdrop-blur-xl px-8 flex items-center justify-between">
         <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 text-text-muted hover:text-black dark:hover:text-black dark:text-white transition-all font-bold text-sm">
               <ArrowLeft size={16} /> Back to Home
            </Link>
            <div className="h-6 w-px bg-black/10 dark:bg-white/10 hidden md:block" />
            <span className="text-xl font-bold tracking-tighter">memento</span>
         </div>
      </nav>
 
      <main className="relative z-10 pt-32 px-8 pb-32 max-w-4xl mx-auto w-full">
         <div className="text-center mb-16">
            <p className="text-primary text-[10px] font-black uppercase tracking-[.3em] mb-4">LEGAL DOCUMENTATION</p>
            <h1 className="text-5xl font-bold tracking-tight mb-4">Terms of Service</h1>
            <p className="text-text-secondary">Last updated: {new Date().toLocaleDateString()}</p>
         </div>
 
         <div className="glass-panel p-8 md:p-12 space-y-12">
            <section className="space-y-4">
               <div className="flex items-center gap-3 text-primary mb-6">
                  <FileText size={24} />
                  <h2 className="text-2xl font-bold">1. Acceptance of Terms</h2>
               </div>
               <p className="text-text-secondary leading-relaxed">By accessing and using Memento, you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service.</p>
            </section>
 
            <section className="space-y-6">
               <div className="flex items-center gap-3 text-secondary mb-6">
                  <Shield size={24} />
                  <h2 className="text-2xl font-bold">2. Service Description</h2>
               </div>
               <p className="text-text-secondary leading-relaxed">Memento is a premium SaaS platform offering real-time photo sharing and event wall experiences. Features include:</p>
               <ul className="grid md:grid-cols-2 gap-4">
                  <FeatureItem label="Instant Photo Collection" />
                  <FeatureItem label="Live AI Reveal Walls" />
                  <FeatureItem label="QR-Based Guest Access" />
                  <FeatureItem label="Cinematic Slideshows" />
                  <FeatureItem label="Full Content Moderation" />
                  <FeatureItem label="Secure Data Retention" />
               </ul>
            </section>
 
            <section className="space-y-4">
               <div className="flex items-center gap-3 text-indigo-400 mb-6">
                  <UserCheck size={24} />
                  <h2 className="text-2xl font-bold">3. User Accounts</h2>
               </div>
               <p className="text-text-secondary leading-relaxed">Organizers must create an account to host walls. You are responsible for account security and ensuring all information provided is accurate and legitimate. Minimum age for account creation is 13.</p>
            </section>
 
            <section className="space-y-4">
               <div className="flex items-center gap-3 text-emerald-400 mb-6">
                  <CreditCard size={24} />
                  <h2 className="text-2xl font-bold">4. Payments & Refunds</h2>
               </div>
               <p className="text-text-secondary leading-relaxed">Plans are charged as one-time payments per event. No recurring subscriptions. Due to the digital nature of the services, refunds are evaluated on a case-by-case basis before the event date.</p>
            </section>
 
            <section className="space-y-6">
               <div className="flex items-center gap-3 text-red-400 mb-6">
                  <Scale size={24} />
                  <h2 className="text-2xl font-bold">5. Content & Conduct</h2>
               </div>
               <div className="p-6 rounded-2xl bg-red-500/5 border border-red-500/20">
                  <p className="font-bold mb-4">Zero Tolerance Policy</p>
                  <p className="text-text-secondary text-sm leading-relaxed mb-4">You are strictly responsible for all content uploaded to your walls. Memento prohibits explicit, illegal, or abusive imagery.</p>
                  <p className="text-text-secondary text-sm leading-relaxed">We provide automated safety filters and manual moderation tools. Memento reserves the right to terminate any wall violating these terms without refund.</p>
               </div>
            </section>
 
            <section className="space-y-4">
               <div className="flex items-center gap-3 text-amber-400 mb-6">
                  <HelpCircle size={24} />
                  <h2 className="text-2xl font-bold">12. Contact</h2>
               </div>
               <p className="text-text-secondary leading-relaxed">Questions? Reach out to our legal team directly:</p>
               <div className="flex flex-wrap gap-4 mt-4">
                  <div className="px-5 py-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-black/20 dark:border-black/10 dark:border-white/10 text-xs font-bold">support@memento.app</div>
                  <div className="px-5 py-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500 text-xs font-bold">+968 96095692 (WhatsApp)</div>
               </div>
            </section>
         </div>
      </main>
    </div>
  );
}
 
function FeatureItem({ label }: { label: string }) {
  return (
    <li className="flex items-center gap-3 text-sm text-text-secondary">
       <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
          <Check size={12} />
       </div>
       {label}
    </li>
  );
}
