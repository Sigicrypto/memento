'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Camera, MessageCircle, ArrowRight } from 'lucide-react';

interface WhatsAppViralBannerProps {
  eventName?: string;
  eventSlug?: string;
  className?: string;
}

const WHATSAPP_NUMBER = '919866161775';

export default function WhatsAppViralBanner({
  eventName = 'this celebration',
  className = '',
}: WhatsAppViralBannerProps) {
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hi Memento! I saw the live photo wall at ${eventName} and I'd like to set one up for my upcoming event.`)}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={`w-full overflow-hidden rounded-2xl bg-surface border border-border shadow-card p-5 sm:p-6 text-text-primary relative text-center flex flex-col items-center ${className}`}
    >
      {/* Top Header Badge */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-bold tracking-wide uppercase mb-3">
        <Camera className="w-3.5 h-3.5 text-accent" />
        <span>Host Your Own Live Wall</span>
      </div>

      {/* Main Pitch Title */}
      <div className="space-y-1 mb-4 text-center max-w-md">
        <h3 className="text-base sm:text-lg font-bold tracking-tight text-text-primary">
          Loved capturing photos at this event?
        </h3>
        <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
          Turn every guest's phone into your event camera. Set up your private live gallery in 60 seconds — no app download needed.
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-md">
        <Link
          href="/create"
          className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-accent hover:bg-[#D9932B] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
        >
          <span>Create Free Event</span>
          <ArrowRight className="w-4 h-4" />
        </Link>

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-bg-subtle hover:bg-border/60 border border-border text-text-primary font-bold text-xs flex items-center justify-center gap-2 transition-all"
        >
          <MessageCircle className="w-4 h-4 text-primary" />
          <span>Chat on WhatsApp</span>
        </a>
      </div>
    </motion.div>
  );
}
