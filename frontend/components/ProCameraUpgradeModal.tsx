"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Sliders, Eye, Sun, Camera, Cpu, Layers, CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

interface ProCameraUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  triggeredFeature?: string;
}

export default function ProCameraUpgradeModal({ isOpen, onClose, triggeredFeature }: ProCameraUpgradeModalProps) {
  if (!isOpen) return null;

  const benefits = [
    { icon: <Sliders className="w-4 h-4 text-cyan-400" />, title: "Manual Camera Controls", desc: "Granular ISO, Shutter Speed & Focus adjustment" },
    { icon: <Sun className="w-4 h-4 text-amber-400" />, title: "Professional Exposure", desc: "Fine-tune exposure compensation & spot metering" },
    { icon: <Eye className="w-4 h-4 text-emerald-400" />, title: "Focus & Peaking", desc: "Sobel edge-detection peaking & manual distance lock" },
    { icon: <Camera className="w-4 h-4 text-purple-400" />, title: "White Balance & Kelvin", desc: "Daylight, Tungsten, Cloudy & manual Kelvin sliders" },
    { icon: <Layers className="w-4 h-4 text-pink-400" />, title: "Multi-Lens Selection", desc: "Seamlessly switch between Ultra-wide, Main & Telephoto" },
    { icon: <Cpu className="w-4 h-4 text-sky-400" />, title: "Guided AI Assistant", desc: "Real-time scene analysis & 1-tap optimal settings" },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden my-auto"
        >
          {/* Subtle Ambient Glow */}
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

          {/* Close button */}
          <button 
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-zinc-900/80 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>

          {/* Header */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-amber-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold mb-3">
              <Sparkles size={13} className="text-cyan-400 animate-pulse" />
              <span>Memento Pro Exclusive</span>
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Memento Pro Camera
            </h2>
            <p className="text-zinc-400 text-sm mt-1.5 max-w-sm">
              Turn your phone into a professional event camera.
            </p>

            {triggeredFeature && (
              <p className="text-xs text-amber-400/90 font-medium mt-2 bg-amber-500/10 px-3 py-1 rounded-md border border-amber-500/20">
                🔒 Lock: {triggeredFeature} requires Pro access
              </p>
            )}
          </div>

          {/* Benefits Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
            {benefits.map((b, idx) => (
              <div 
                key={idx}
                className="flex items-start gap-3 p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700/80 transition-colors"
              >
                <div className="p-2 rounded-xl bg-zinc-950 border border-zinc-800 shrink-0">
                  {b.icon}
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">{b.title}</h4>
                  <p className="text-[11px] text-zinc-400 leading-tight mt-0.5">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Key Value & CTA */}
          <div className="space-y-3">
            <Link 
              href="/pricing" 
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 text-black font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 hover:brightness-110 active:scale-[0.99] transition-all"
            >
              <span>Upgrade to Memento Pro</span>
              <ArrowRight size={18} />
            </Link>

            <button 
              onClick={onClose}
              className="w-full py-2.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors font-medium text-center"
            >
              Continue using Free Camera
            </button>
          </div>

          {/* Security & Guarantee Note */}
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-zinc-500 mt-4">
            <ShieldCheck size={13} />
            <span>Included in Memento Premium & Professional plans</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
