"use client";

import React from "react";
import { ShieldCheck, Lock, EyeOff, Trash2, KeyRound, FileCheck } from "lucide-react";

export default function TrustSecuritySection() {
  const trustPoints = [
    {
      icon: <Lock className="w-5 h-5 text-primary" />,
      bg: "bg-primary/10 border border-primary/20",
      title: "Private by Default",
      description: "Only guests with your specific QR code can view or upload to your gallery.",
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-primary" />,
      bg: "bg-primary/10 border border-primary/20",
      title: "Host Moderation",
      description: "You approve every photo before it goes live on the big screen with 1 tap.",
    },
    {
      icon: <KeyRound className="w-5 h-5 text-accent" />,
      bg: "bg-accent/10 border border-accent/20",
      title: "Encrypted Cloud Vault",
      description: "Enterprise-grade SSL/TLS in transit and AES-256 encrypted storage at rest.",
    },
    {
      icon: <Trash2 className="w-5 h-5 text-text-secondary" />,
      bg: "bg-bg-subtle border border-border",
      title: "Full Deletion Rights",
      description: "Delete any individual photo, video clip, or your entire event album anytime.",
    },
    {
      icon: <EyeOff className="w-5 h-5 text-primary" />,
      bg: "bg-primary/10 border border-primary/20",
      title: "No Third-Party Sharing",
      description: "We never monetize, train AI on, or share your private event memories. Ever.",
    },
    {
      icon: <FileCheck className="w-5 h-5 text-accent" />,
      bg: "bg-accent/10 border border-accent/20",
      title: "Original Full-Res Quality",
      description: "Zero compression or downscaling. All original high-res photos and EXIF preserved.",
    },
  ];

  return (
    <section className="w-full py-20 px-4 md:px-8 bg-bg-subtle flex flex-col items-center justify-center text-center">
      <div className="max-w-6xl mx-auto flex flex-col items-center text-center">
        
        <span className="px-3.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-wider uppercase mb-4 mx-auto">
          PRIVACY & CONTROL
        </span>

        <h2 className="text-3xl md:text-5xl font-black text-text-primary tracking-tight text-center mb-12 max-w-3xl mx-auto">
          Your Memories Belong to You. Period.
        </h2>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full mb-12 text-center">
          {trustPoints.map((tp) => (
            <div
              key={tp.title}
              className="p-6 rounded-2xl bg-surface border border-border flex flex-col items-center text-center shadow-card hover:shadow-card-hover transition-all h-full"
            >
              <div className={`w-12 h-12 rounded-xl ${tp.bg} flex items-center justify-center mb-4 mx-auto`}>
                {tp.icon}
              </div>
              <h3 className="text-text-primary font-bold text-lg mb-2 text-center">{tp.title}</h3>
              <p className="text-text-secondary text-sm leading-relaxed text-center">{tp.description}</p>
            </div>
          ))}
        </div>

        {/* Callout */}
        <div className="bg-surface border border-border rounded-xl p-6 mt-4 max-w-2xl w-full mx-auto shadow-sm text-center">
          <h4 className="font-bold text-text-primary text-lg mb-2 text-center">Q: "Who can see my photos?"</h4>
          <p className="text-text-secondary text-base leading-relaxed text-center">
            A: "Only people with your unique event QR code or event link. Galleries are private by default and you can lock them at any time."
          </p>
        </div>

      </div>
    </section>
  );
}
