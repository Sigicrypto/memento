'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Gift, Share2, MessageCircle, CheckCircle2, ArrowRight, Copy, Check } from 'lucide-react';

interface WhatsAppViralBannerProps {
  eventName?: string;
  eventSlug?: string;
  className?: string;
}

const WHATSAPP_NUMBER = '919866161775';

export default function WhatsAppViralBanner({
  eventName = 'this event',
  eventSlug = 'demo',
  className = '',
}: WhatsAppViralBannerProps) {
  const [activeTab, setActiveTab] = useState<'host' | 'refer'>('refer');
  const [copied, setCopied] = useState(false);

  // Generate a clean referral tracking code based on slug and timestamp
  const refCode = `REF-${(eventSlug || 'memento').toUpperCase().slice(0, 10)}-${Date.now().toString(36).slice(-4).toUpperCase()}`;

  const hostMessage = `Hi Memento! 👋 I saw your live photo wall at "${eventName}" and want to host one for my upcoming event with 10% OFF! (Ref Code: ${refCode})`;
  const referMessage = `Hi Memento! 👋 I saw your live photo wall at "${eventName}". I want to refer an event / host an event to claim the 10% referral cashback! (Ref Code: ${refCode})`;

  const whatsappHostUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(hostMessage)}`;
  const whatsappReferUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(referMessage)}`;

  const currentUrl = activeTab === 'host' ? whatsappHostUrl : whatsappReferUrl;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(refCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={`w-full overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 border border-emerald-500/30 shadow-2xl shadow-emerald-500/10 p-5 sm:p-6 text-slate-100 relative ${className}`}
    >
      {/* Glow highlight backdrop */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Badge */}
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold tracking-wide uppercase shadow-inner">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span>Exclusive Referral Program</span>
        </div>
        <span className="text-[11px] font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
          Code: <strong className="text-emerald-300">{refCode}</strong>
        </span>
      </div>

      {/* Main Pitch Title */}
      <div className="space-y-1.5 mb-4">
        <h3 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
          Loved the Live Photo Wall? <Gift className="w-5 h-5 text-amber-400 shrink-0" />
        </h3>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          Give <span className="font-extrabold text-emerald-400">10% OFF</span> to a friend or earn <span className="font-extrabold text-emerald-400">10% CASH payout</span> on any event booked!
        </p>
      </div>

      {/* Toggle Selector Tabs */}
      <div className="grid grid-cols-2 gap-2 bg-slate-950/80 p-1 rounded-xl border border-slate-800 mb-5">
        <button
          type="button"
          onClick={() => setActiveTab('refer')}
          className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'refer'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          <Gift className="w-3.5 h-3.5" />
          <span>Earn 10% Cash</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('host')}
          className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'host'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Host Your Event (10% Off)</span>
        </button>
      </div>

      {/* Feature Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-5 text-xs text-slate-300">
        <div className="flex items-center gap-2 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Instant UPI Cashback upon booking</span>
        </div>
        <div className="flex items-center gap-2 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Works for Weddings, Corporate & Parties</span>
        </div>
      </div>

      {/* CTA Button Section */}
      <div className="space-y-2">
        <a
          href={currentUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-3.5 px-5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/25 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
        >
          <MessageCircle className="w-4 h-4 fill-slate-950" />
          <span>
            {activeTab === 'refer' ? 'Claim 10% Cash Referral on WhatsApp' : 'Get Memento with 10% OFF on WhatsApp'}
          </span>
          <ArrowRight className="w-4 h-4" />
        </a>

        <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 pt-1">
          <span>Official WhatsApp: <strong>+91 9866161775</strong></span>
          <button
            type="button"
            onClick={handleCopyCode}
            className="flex items-center gap-1 hover:text-emerald-300 transition-colors text-[11px] font-mono"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? 'Code Copied!' : 'Copy Ref Code'}</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
