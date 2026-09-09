"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Cookie, ShieldCheck, Lock, CheckCircle2, RefreshCw } from "lucide-react";
import AnimatedLogo from "@/components/AnimatedLogo";
import ThemeToggle from "@/components/ThemeToggle";
import dynamic from "next/dynamic";

const Footer = dynamic(() => import("@/components/sections/Footer"), { ssr: false });

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-bg text-text-primary flex flex-col items-center">
      {/* Fixed Top Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-16 bg-surface/90 backdrop-blur-md border-b border-border flex items-center justify-between px-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-xs font-semibold text-text-secondary hover:text-text-primary transition-colors"
        >
          <ArrowLeft size={16} />
          <span className="hidden sm:inline">Back to Home</span>
        </Link>

        <AnimatedLogo width={110} height={28} />

        <div className="flex items-center gap-3">
          <ThemeToggle />
        </div>
      </nav>

      {/* Main Content */}
      <main className="w-full max-w-4xl mx-auto px-4 md:px-8 pt-36 sm:pt-44 pb-24 md:pb-32">
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-mono font-bold uppercase tracking-wider mb-4">
            <Cookie size={14} />
            Compliance & Transparency
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-text-primary font-display tracking-tight">
            Cookie Policy
          </h1>
          <p className="text-text-muted text-xs font-mono mt-3">
            Last Updated: September 2026
          </p>
        </div>

        <div className="bg-surface border border-border rounded-3xl p-8 sm:p-12 shadow-card space-y-10 text-sm sm:text-base leading-relaxed text-text-secondary">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-text-primary font-display flex items-center gap-2">
              <ShieldCheck size={20} className="text-accent" />
              1. Our Privacy-First Cookie Philosophy
            </h2>
            <p>
              At Memento, we believe your celebration memories belong exclusively to you and your guests. Unlike social media platforms and photo-sharing apps that rely on cross-site tracking networks, <strong>Memento does not use third-party advertising cookies, data trackers, or behavioral surveillance pixels.</strong>
            </p>
            <p>
              We only use cookies and local storage tokens that are strictly necessary to authenticate event hosts, keep event galleries private, and remember basic display preferences.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-text-primary font-display flex items-center gap-2">
              <Lock size={20} className="text-accent" />
              2. The Cookies We Use
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse border border-border rounded-xl overflow-hidden text-xs sm:text-sm">
                <thead>
                  <tr className="bg-bg-subtle border-b border-border text-text-primary font-bold">
                    <th className="p-3">Cookie Name</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Purpose</th>
                    <th className="p-3">Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr>
                    <td className="p-3 font-mono font-bold text-text-primary">sb-*-auth-token</td>
                    <td className="p-3">Strictly Essential</td>
                    <td className="p-3">Secure authentication and encrypted host session token via Supabase Auth.</td>
                    <td className="p-3">Session / 30 days</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono font-bold text-text-primary">livewall_region</td>
                    <td className="p-3">Functional</td>
                    <td className="p-3">Detects regional payment gateway preference (Razorpay INR vs Stripe USD).</td>
                    <td className="p-3">1 year</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono font-bold text-text-primary">theme</td>
                    <td className="p-3">Functional</td>
                    <td className="p-3">Preserves your light/dark mode visual preference across page navigation.</td>
                    <td className="p-3">1 year</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono font-bold text-text-primary">memento_partner_ref</td>
                    <td className="p-3">Attribution</td>
                    <td className="p-3">Stores partner referral ID for fair 10% commission payout on event bookings.</td>
                    <td className="p-3">30 days</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-text-primary font-display flex items-center gap-2">
              <CheckCircle2 size={20} className="text-emerald-600" />
              3. What We Never Do
            </h2>
            <ul className="space-y-2 list-disc list-inside text-text-secondary">
              <li>We never sell your browsing history, personal data, or uploaded photos to data brokers.</li>
              <li>We never deploy third-party advertising retargeting pixels (e.g. Meta Pixel, TikTok tracking).</li>
              <li>We never read cross-site cookies from other tabs on your browser.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-text-primary font-display flex items-center gap-2">
              <RefreshCw size={20} className="text-accent" />
              4. How to Control and Clear Cookies
            </h2>
            <p>
              You can instruct your browser to refuse or delete cookies at any time via your browser settings:
            </p>
            <ul className="space-y-2 list-disc list-inside text-text-secondary">
              <li><strong>Google Chrome:</strong> Settings → Privacy and Security → Third-Party Cookies.</li>
              <li><strong>Apple Safari:</strong> Preferences → Privacy → Block All Cookies.</li>
              <li><strong>Mozilla Firefox:</strong> Settings → Privacy & Security → Enhanced Tracking Protection.</li>
              <li><strong>Microsoft Edge:</strong> Settings → Cookies and Site Permissions.</li>
            </ul>
            <p className="text-xs text-text-muted mt-2">
              * Note: Disabling strictly essential cookies may prevent event hosts from logging into their dashboard or moderating live event walls.
            </p>
          </section>

          <section className="space-y-3 pt-6 border-t border-border">
            <h2 className="text-lg font-bold text-text-primary font-display">
              5. Questions or Inquiries
            </h2>
            <p>
              If you have any questions regarding our cookie practices, please contact our Data Protection team at:
            </p>
            <div className="p-4 rounded-xl bg-bg-subtle border border-border text-xs sm:text-sm font-mono text-text-primary">
              Email: privacy@memento.app <br />
              Direct WhatsApp Helpline: +91 9866161775
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
