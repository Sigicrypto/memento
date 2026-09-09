"use client";

import React from 'react';
import { Camera, QrCode, Sparkles } from 'lucide-react';

interface StudioBrandingPreviewProps {
  studioName: string;
  logoUrl?: string;
  primaryColor: string;
  secondaryColor: string;
}

export default function StudioBrandingPreview({
  studioName,
  logoUrl,
  primaryColor,
  secondaryColor,
}: StudioBrandingPreviewProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-bold text-text-primary mb-1 font-display">Live Branding Simulator</h3>
        <p className="text-xs text-text-secondary">See how your white-label studio branding appears across client touchpoints</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Touchpoint 1: Printable Table QR Card Preview */}
        <div className="rounded-2xl border border-border bg-bg-subtle p-5 flex flex-col items-center text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-3">
            Table Card QR Preview
          </span>

          <div
            className="w-full max-w-[240px] aspect-[3/4] bg-white rounded-xl shadow-lg border p-4 flex flex-col items-center justify-between text-neutral-900"
            style={{ borderColor: primaryColor }}
          >
            {/* Top Studio Logo */}
            <div className="w-full flex items-center justify-center gap-1.5 pt-1">
              {logoUrl ? (
                <img src={logoUrl} alt={studioName} className="h-6 object-contain" />
              ) : (
                <div
                  className="px-2 py-0.5 rounded text-[11px] font-black uppercase tracking-wider text-white"
                  style={{ backgroundColor: primaryColor }}
                >
                  {studioName || 'YOUR STUDIO'}
                </div>
              )}
            </div>

            {/* Title & QR Code */}
            <div className="flex flex-col items-center my-auto">
              <h4 className="font-bold text-xs mb-1">Scan to Share Photos</h4>
              <p className="text-[9px] text-neutral-500 mb-2">Priya & Arjun's Wedding</p>
              <div
                className="w-24 h-24 rounded-lg p-2 border flex items-center justify-center bg-neutral-50"
                style={{ borderColor: primaryColor }}
              >
                <QrCode size={64} className="text-neutral-800" />
              </div>
              <p className="text-[8px] text-neutral-400 mt-2">No app download needed</p>
            </div>

            {/* Bottom accent strip */}
            <div
              className="w-full py-1 text-center rounded-b text-[8px] font-bold tracking-widest text-white uppercase"
              style={{ backgroundColor: primaryColor }}
            >
              Captured by {studioName || 'Your Studio'}
            </div>
          </div>
        </div>

        {/* Touchpoint 2: Live Wall Footer Preview */}
        <div className="rounded-2xl border border-border bg-bg-subtle p-5 flex flex-col items-center text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-3">
            Live Wall Screen Preview
          </span>

          <div className="w-full max-w-[280px] aspect-video bg-neutral-950 rounded-xl shadow-lg border border-neutral-800 overflow-hidden flex flex-col justify-between p-3 text-white">
            {/* Wall Top Bar */}
            <div className="flex items-center justify-between border-b border-neutral-800 pb-1.5 text-[9px]">
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                <span className="font-bold tracking-wider">LIVE GALLERY</span>
              </div>
              <span className="text-neutral-400">Priya & Arjun</span>
            </div>

            {/* Center mockup grid */}
            <div className="grid grid-cols-3 gap-1 my-auto">
              <div className="aspect-square rounded bg-neutral-800/80" />
              <div className="aspect-square rounded bg-neutral-700/80" />
              <div className="aspect-square rounded bg-neutral-800/80" />
            </div>

            {/* Wall Bottom White-Label Bar */}
            <div
              className="w-full py-1 px-2 rounded flex items-center justify-between text-[8px] font-medium"
              style={{ backgroundColor: `${primaryColor}25`, borderColor: primaryColor }}
            >
              <span className="text-neutral-300">Scan QR on tables to appear live!</span>
              <span className="font-bold" style={{ color: primaryColor }}>
                {studioName || 'Studio Live'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
