'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Gift, Share2, MessageCircle, ArrowRight, Copy, Check, Info } from 'lucide-react';
import PartnerProgramModal from '@/components/PartnerProgramModal';

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
  const [copied, setCopied] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Generate a clean referral tracking code based on slug and timestamp
  const refCode = `MEM-${(eventSlug || 'DEMO').toUpperCase().slice(0, 6)}-${Date.now().toString(36).slice(-4).toUpperCase()}`;

  const referMessage = `Hi Memento! 👋 I took photos at "${eventName}". My Unique Partner ID is ${refCode}. I would like to inquire about event referral privileges & 10% referral bonus details.`;
  const whatsappReferUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(referMessage)}`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(refCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
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
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Event Partner Privilege</span>
          </div>
          <button
            type="button"
            onClick={handleCopyCode}
            className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-300 bg-emerald-950/80 hover:bg-emerald-900/80 px-2.5 py-1 rounded border border-emerald-500/40 transition-colors"
          >
            <span>ID: <strong>{refCode}</strong></span>
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          </button>
        </div>

        {/* Main Pitch Title */}
        <div className="space-y-1.5 mb-4">
          <h3 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
            Your Unique Partner ID: <span className="font-mono text-emerald-300">{refCode}</span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Quote your Partner ID when recommending Memento for weddings, galas, or corporate events.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-1">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all"
          >
            <Info className="w-4 h-4 text-emerald-400" />
            <span>View Partner Program Details</span>
          </button>

          <a
            href={whatsappReferUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
          >
            <MessageCircle className="w-4 h-4 fill-slate-950" />
            <span>Connect on WhatsApp</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </motion.div>

      <PartnerProgramModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        refCode={refCode}
      />
    </>
  );
}
