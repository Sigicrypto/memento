"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, FileText, UserCheck, CreditCard, Scale, HelpCircle, Check, MessageCircle, Mail } from 'lucide-react';
import AnimatedLogo from '@/components/AnimatedLogo';
import ThemeToggle from '@/components/ThemeToggle';

export default function TermsPage() {
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
        maxWidth: '1100px',
        margin: '0 auto',
        paddingTop: '120px',
        paddingBottom: '80px',
        paddingLeft: '24px',
        paddingRight: '24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        {/* Title Header */}
        <div style={{ textAlign: 'center', marginBottom: '36px', width: '100%' }}>
          <span style={{
            display: 'inline-flex', padding: '4px 16px', borderRadius: '999px',
            fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em',
            background: 'color-mix(in srgb, var(--primary) 12%, transparent)',
            border: '1px solid color-mix(in srgb, var(--primary) 20%, transparent)',
            color: 'var(--primary)', marginBottom: '16px',
          }}>
            Legal Documentation
          </span>
          <h1 style={{ fontSize: '42px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 10px', letterSpacing: '-0.02em' }}>
            Terms of Service
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
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                <FileText size={20} />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold">1. Acceptance of Terms</h2>
            </div>
            <p className="text-text-secondary leading-relaxed text-sm sm:text-base">
              By accessing and using Memento, you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 text-text-primary pb-3 border-b border-border">
              <div className="w-10 h-10 rounded-xl bg-accent-cyan/10 border border-accent-cyan/20 flex items-center justify-center text-accent-cyan shrink-0">
                <Shield size={20} />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold">2. Service Description</h2>
            </div>
            <p className="text-text-secondary leading-relaxed text-sm sm:text-base">
              Memento is a premium live photo wall sharing platform for events, weddings, and parties. Features include:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <FeatureItem label="Instant Photo Collection via QR Code" />
              <FeatureItem label="Live AI Reveal & Slideshow TV Mode" />
              <FeatureItem label="Instant Facial Discovery Search" />
              <FeatureItem label="Full Host Content Moderation Controls" />
              <FeatureItem label="Real-Time Guest Reactions & Emoji Float" />
              <FeatureItem label="Secure Encrypted Cloud Data Storage" />
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 text-text-primary pb-3 border-b border-border">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                <UserCheck size={20} />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold">3. User Accounts & Responsibilities</h2>
            </div>
            <p className="text-text-secondary leading-relaxed text-sm sm:text-base">
              Organizers must create an account to host walls. You are responsible for account security and ensuring all information provided is accurate and legitimate. Minimum age for account creation is 13.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 text-text-primary pb-3 border-b border-border">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                <CreditCard size={20} />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold">4. Payments & Event Pricing</h2>
            </div>
            <p className="text-text-secondary leading-relaxed text-sm sm:text-base">
              Plans are charged as one-time payments per event. There are no recurring subscriptions or surprise charges. Due to the digital nature of the services, refunds are evaluated on a case-by-case basis before the event date.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 text-text-primary pb-3 border-b border-border">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
                <Scale size={20} />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold">5. Content Policy & Acceptable Use</h2>
            </div>
            <div style={{
              padding: '20px 24px',
              borderRadius: '16px',
              background: 'color-mix(in srgb, var(--error) 10%, transparent)',
              border: '1px solid color-mix(in srgb, var(--error) 25%, transparent)',
            }}>
              <p className="font-bold text-rose-400 text-sm mb-2">Zero Tolerance Policy</p>
              <p className="text-text-secondary text-xs sm:text-sm leading-relaxed mb-3">
                Event hosts and guests are strictly responsible for all content uploaded to walls. Memento prohibits explicit, illegal, hateful, or abusive imagery.
              </p>
              <p className="text-text-secondary text-xs sm:text-sm leading-relaxed">
                We provide automated safety filters and host moderation tools. Memento reserves the right to terminate any wall violating these terms without refund.
              </p>
            </div>
          </section>

          {/* Section 6 */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 text-text-primary pb-3 border-b border-border">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                <HelpCircle size={20} />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold">6. Contact & Legal Enquiries</h2>
            </div>
            <p className="text-text-secondary leading-relaxed text-sm sm:text-base">
              Questions regarding these Terms of Service? Reach out to our team directly:
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <div className="px-5 py-3 rounded-xl bg-bg-subtle border border-border text-xs font-bold text-text-primary flex items-center gap-2">
                <Mail size={14} className="text-accent-cyan" />
                <span>support@memento.app</span>
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

function FeatureItem({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-bg-subtle border border-border text-xs font-semibold text-text-primary">
      <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
        <Check size={10} />
      </div>
      <span>{label}</span>
    </div>
  );
}
