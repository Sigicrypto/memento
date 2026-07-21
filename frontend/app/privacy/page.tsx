"use client";
 
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, Eye, Lock, RefreshCcw, UserPlus, Database, Mail } from 'lucide-react';
 
export default function PrivacyPage() {
  return (
    <div className="min-h-screen relative overflow-x-hidden flex flex-col">
      <div className="grain" />
      <div className="orbs"><div className="orb orb-primary" /><div className="orb orb-secondary" /></div>
 
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-[100] h-20 border-b border-black/5 dark:border-white/5 backdrop-blur-xl px-8 flex items-center justify-between">
         <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 text-text-muted hover:text-black dark:hover:text-white transition-all font-bold text-sm">
               <ArrowLeft size={16} /> Back to Home
            </Link>
            <div className="h-6 w-px bg-black/10 dark:bg-white/10 hidden md:block" />
            <span className="text-xl font-bold tracking-tighter">memento</span>
         </div>
      </nav>
 
      <main className="relative z-10 pt-32 px-8 pb-32 max-w-4xl mx-auto w-full">
         <div className="text-center mb-16">
            <p className="text-secondary text-[10px] font-black uppercase tracking-[.3em] mb-4">PRIVACY COMMITMENT</p>
            <h1 className="text-5xl font-bold tracking-tight mb-4">Privacy Policy</h1>
            <p className="text-text-secondary">Last updated: {new Date().toLocaleDateString()}</p>
         </div>
 
         <div className="glass-panel p-8 md:p-12 space-y-12">
            <section className="space-y-4">
               <div className="flex items-center gap-3 text-secondary mb-6">
                  <Eye size={24} />
                  <h2 className="text-2xl font-bold">1. Information We Collect</h2>
               </div>
               <p className="text-text-secondary leading-relaxed">We collect minimal information to provide our premium service:</p>
               <div className="grid md:grid-cols-2 gap-4 mt-6">
                  <PrivacyItem label="Email for Account Identity" />
                  <PrivacyItem label="Event Metadata (Slugs & Tags)" />
                  <PrivacyItem label="Uploaded Media (Photos/Videos)" />
                  <PrivacyItem label="Optional Guest Identifiers" />
                  <PrivacyItem label="Temporary Face Descriptors" />
                  <PrivacyItem label="Basic Usage Telemetry" />
               </div>
            </section>
 
            <section className="space-y-4">
               <div className="flex items-center gap-3 text-primary mb-6">
                  <Database size={24} />
                  <h2 className="text-2xl font-bold">2. Data Usage</h2>
               </div>
               <p className="text-text-secondary leading-relaxed">Your data is used exclusively to facilitate your events. We never sell your personal information or shared media with third parties. Data is processed to create galleries, manage moderation, and improve platform performance.</p>
            </section>
 
            <section className="space-y-4">
               <div className="flex items-center gap-3 text-emerald-400 mb-6">
                  <Lock size={24} />
                  <h2 className="text-2xl font-bold">3. Security Infrastructure</h2>
               </div>
               <p className="text-text-secondary leading-relaxed">Memento is built on a high-security framework. All media is encrypted at rest and in transit via HTTPS. We implement rigorous access controls to ensure your private event remains private.</p>
            </section>
 
            <section className="space-y-6">
               <div className="flex items-center gap-3 text-amber-400 mb-6">
                  <RefreshCcw size={24} />
                  <h2 className="text-2xl font-bold">4. Retention Policy</h2>
               </div>
               <div className="grid sm:grid-cols-3 gap-4">
                  <RetentionCard label="Starter" duration="30 Days" />
                  <RetentionCard label="Standard" duration="90 Days" />
                  <RetentionCard label="Premium+" duration="180 Days" />
               </div>
               <p className="text-text-muted text-xs italic mt-4">Note: You can permanently delete your event and all associated media at any time via the dashboard.</p>
            </section>
 
            <section className="space-y-4">
               <div className="flex items-center gap-3 text-indigo-400 mb-6">
                  <Mail size={24} />
                  <h2 className="text-2xl font-bold">9. Contact Us</h2>
               </div>
               <p className="text-text-secondary leading-relaxed">For privacy-related inquiries or data requests, please contact our Data Officer:</p>
               <div className="flex flex-wrap gap-4 mt-4">
                  <div className="px-5 py-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-xs font-bold">privacy@memento.app</div>
                  <div className="px-5 py-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold">+968 96095692 (WhatsApp)</div>
               </div>
            </section>
         </div>
      </main>
    </div>
  );
}
 
function PrivacyItem({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 text-sm text-text-secondary">
       <div className="w-5 h-5 rounded-full bg-secondary/10 flex items-center justify-center text-secondary flex-shrink-0">
          <Shield size={10} />
       </div>
       {label}
    </div>
  );
}
 
function RetentionCard({ label, duration }: { label: string, duration: string }) {
  return (
    <div className="p-4 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-center">
       <p className="text-[9px] font-black uppercase tracking-widest text-text-muted mb-1">{label}</p>
       <p className="text-lg font-bold ">{duration}</p>
    </div>
  );
}
