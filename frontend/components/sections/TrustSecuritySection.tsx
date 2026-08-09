"use client";

import React from "react";
import { ShieldCheck, Lock, EyeOff, Trash2, Key, HardDrive } from "lucide-react";

export default function TrustSecuritySection() {
  const trustPoints = [
    {
      icon: <Lock className="w-5 h-5 text-cyan-400" />,
      title: "Private Event Galleries",
      description: "Only guests with your QR code or access PIN can view and upload to your event gallery.",
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />,
      title: "Host Moderation & Filtering",
      description: "Complete control over uploaded media. Approve or reject photos before they appear on screen.",
    },
    {
      icon: <EyeOff className="w-5 h-5 text-purple-400" />,
      title: "Access Control & Close Event",
      description: "Lock upload access at any time or turn galleries view-only after the event ends.",
    },
    {
      icon: <HardDrive className="w-5 h-5 text-amber-400" />,
      title: "Protected Storage Cloud",
      description: "Photos are stored securely with automated lifecycle protection and non-public storage paths.",
    },
    {
      icon: <Trash2 className="w-5 h-5 text-red-400" />,
      title: "Host Data Deletion",
      description: "Event hosts retain full rights to delete photos or remove entire galleries at any time.",
    },
    {
      icon: <Key className="w-5 h-5 text-blue-400" />,
      title: "Secure Session Tokens",
      description: "CSRF protection, rate limiting, and encrypted session cookies safeguard host and guest flows.",
    },
  ];

  return (
    <section className="w-full py-20 px-4 md:px-8 relative bg-slate-950/80 border-b border-white/5 flex flex-col items-center justify-center">
      <div className="max-w-6xl w-full mx-auto flex flex-col items-center text-center">
        
        <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-extrabold tracking-wider uppercase mb-4">
          Privacy & Control
        </span>

        <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight max-w-3xl">
          Your Memories, <span className="text-emerald-400">Strictly Private</span>
        </h2>

        <p className="text-slate-300 text-sm md:text-base max-w-2xl mt-4 font-medium">
          Built with host control at the core. Your photos stay strictly within your event.
        </p>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full mt-12 text-center">
          {trustPoints.map((tp) => (
            <div
              key={tp.title}
              className="p-6 rounded-2xl bg-slate-900/60 border border-white/10 hover:border-emerald-500/30 transition-all shadow-xl flex flex-col items-center text-center"
            >
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                {tp.icon}
              </div>
              <h3 className="text-white font-extrabold text-base mb-2">{tp.title}</h3>
              <p className="text-slate-400 text-xs leading-relaxed">{tp.description}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
