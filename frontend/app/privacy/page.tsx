"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, Eye, Lock, RefreshCcw, Database, Mail, MessageCircle } from 'lucide-react';
import AnimatedLogo from '@/components/AnimatedLogo';
import ThemeToggle from '@/components/ThemeToggle';

export default function PrivacyPage() {
  return (
    <div style={{
      minHeight: '100vh',
      position: 'relative',
      overflowX: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      background: 'var(--bg)',
    }}>
      {/* Background Decor */}
      <div className="grain" />
      <div className="orbs">
        <div className="orb orb-primary opacity-30" />
        <div className="orb orb-secondary opacity-30" />
      </div>

      {/* Fixed Top Nav Bar */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        height: '64px', background: 'var(--surface)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px',
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '13px', fontWeight: 600 }}>
          <ArrowLeft size={18} />
          <span className="hidden sm:inline">Back to Home</span>
        </Link>

        <AnimatedLogo width={110} height={28} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <ThemeToggle />
        </div>
      </nav>

      {/* Main Centered Content Container */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        width: '100%',
        maxWidth: '800px',
        margin: '0 auto',
        paddingTop: '120px',
        paddingBottom: '80px',
        paddingLeft: '20px',
        paddingRight: '20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        {/* Title Header */}
        <div style={{ textAlign: 'center', marginBottom: '36px', width: '100%' }}>
          <span style={{
            display: 'inline-flex', padding: '4px 16px', borderRadius: '999px',
            fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em',
            background: 'color-mix(in srgb, var(--accent-cyan) 12%, transparent)',
            border: '1px solid color-mix(in srgb, var(--accent-cyan) 20%, transparent)',
            color: 'var(--accent-cyan)', marginBottom: '16px',
          }}>
            Privacy Commitment
          </span>
          <h1 style={{ fontSize: '42px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 10px', letterSpacing: '-0.02em' }}>
            Privacy Policy
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0 }}>
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            width: '100%',
            boxSizing: 'border-box',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '28px',
            padding: '48px 40px',
            boxShadow: '0 24px 64px rgba(0, 0, 0, 0.25)',
            display: 'flex',
            flexDirection: 'column',
            gap: '40px',
          }}
        >
          {/* Section 1 */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 text-text-primary pb-3 border-b border-border">
              <div className="w-10 h-10 rounded-xl bg-accent-cyan/10 border border-accent-cyan/20 flex items-center justify-center text-accent-cyan shrink-0">
                <Eye size={20} />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold">1. Information We Collect</h2>
            </div>
            <p className="text-text-secondary leading-relaxed text-sm sm:text-base">
              We collect minimal information to provide our live photo wall and guest sharing service securely:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <PrivacyItem label="Email for Account Identity & Billing" />
              <PrivacyItem label="Event Metadata (Slugs, Titles & Dates)" />
              <PrivacyItem label="Uploaded Media (Guest Photos & Videos)" />
              <PrivacyItem label="Optional Guest Display Names" />
              <PrivacyItem label="Facial Matching Descriptors (In-Memory Only)" />
              <PrivacyItem label="Basic Usage Telemetry & Performance Logs" />
            </div>
          </section>

          {/* Section 2 */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 text-text-primary pb-3 border-b border-border">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                <Database size={20} />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold">2. Data Usage & Protection</h2>
            </div>
            <p className="text-text-secondary leading-relaxed text-sm sm:text-base">
              Your data is used exclusively to facilitate your private event galleries. We never sell your personal information or shared media to third parties. Uploaded photos are processed strictly to render galleries, power AI facial discovery, and provide analytics for event hosts.
            </p>
          </section>

          {/* Section 3 */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 text-text-primary pb-3 border-b border-border">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                <Lock size={20} />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold">3. Security Infrastructure</h2>
            </div>
            <p className="text-text-secondary leading-relaxed text-sm sm:text-base">
              Memento is built on an enterprise-grade cloud architecture. All media uploads and database queries are encrypted both at rest and in transit via HTTPS / TLS 1.3. Hosts can set privacy passwords to prevent unauthorized access.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 text-text-primary pb-3 border-b border-border">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                <RefreshCcw size={20} />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold">4. Media Retention Policy</h2>
            </div>
            <p className="text-text-secondary leading-relaxed text-sm sm:text-base">
              Uploaded photos and event galleries are stored safely in your cloud vault according to your tier level:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <RetentionCard label="Starter" duration="30 Days Storage" />
              <RetentionCard label="Standard" duration="90 Days Storage" />
              <RetentionCard label="Premium+" duration="180 Days Storage" />
            </div>
            <p className="text-text-muted text-xs italic">
              Note: Hosts can permanently export or purge their event data and all associated media at any time directly from the dashboard.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 text-text-primary pb-3 border-b border-border">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                <Mail size={20} />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold">5. Contact & Support</h2>
            </div>
            <p className="text-text-secondary leading-relaxed text-sm sm:text-base">
              For privacy-related inquiries, data deletion requests, or support, please contact our team directly:
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <div className="px-5 py-3 rounded-xl bg-bg-subtle border border-border text-xs font-bold text-text-primary flex items-center gap-2">
                <Mail size={14} className="text-accent-cyan" />
                <span>privacy@memento.app</span>
              </div>
              <a
                href="https://wa.me/96896095692"
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center gap-2 hover:bg-emerald-500/20 transition-colors no-underline"
              >
                <MessageCircle size={14} />
                <span>+968 96095692 (WhatsApp Support)</span>
              </a>
            </div>
          </section>
        </motion.div>
      </div>
    </div>
  );
}

function PrivacyItem({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-bg-subtle border border-border text-xs font-semibold text-text-primary">
      <div className="w-5 h-5 rounded-full bg-accent-cyan/10 flex items-center justify-center text-accent-cyan shrink-0">
        <Shield size={10} />
      </div>
      <span>{label}</span>
    </div>
  );
}

function RetentionCard({ label, duration }: { label: string; duration: string }) {
  return (
    <div className="p-4 rounded-2xl bg-bg-subtle border border-border text-center">
      <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-1">{label}</p>
      <p className="text-base font-extrabold text-text-primary">{duration}</p>
    </div>
  );
}
