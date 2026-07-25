"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Home, ScanLine } from 'lucide-react';
import Corners from '@/components/Corners';

export default function NotFound() {
  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center p-6 text-center">
      <div className="grain" />
      <div className="scanline" />
      <div className="orbs"><div className="orb orb-primary" /><div className="orb orb-secondary" /></div>

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 space-y-10"
      >
        <div className="hud-chip mx-auto w-fit">
          <span className="live-pulse" style={{ background: 'var(--error)' }} />
          Signal lost
        </div>

        <div className="relative inline-block viewfinder px-16 py-10">
          <Corners />
          <h1 className="font-mono-ui text-[7rem] md:text-[10rem] font-bold leading-none text-text-primary/[0.06] select-none tracking-tighter">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="reticle w-24 h-24 rounded-2xl bg-surface border border-border flex items-center justify-center text-accent-cyan shadow-2xl">
              <ScanLine size={40} strokeWidth={1.5} />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <p className="mono-label text-accent-cyan">Frame not found</p>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Out of Frame</h2>
          <p className="text-text-secondary text-lg max-w-md mx-auto">
            This page drifted outside the shot. Let&apos;s bring you back into view.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/" className="btn btn-primary btn-lg flex items-center gap-3">
            <Home size={18} /> Back to Homepage
          </Link>
          <button
            onClick={() => window.history.back()}
            className="btn btn-secondary btn-lg flex items-center gap-2"
          >
            <ArrowLeft size={16} /> Previous View
          </button>
        </div>
      </motion.div>

      <div className="mt-20 mono-label opacity-40">
        Memento Platform Infrastructure
      </div>
    </div>
  );
}
