"use client";

import React from "react";
import Image from "next/image";

interface WhiteLabelBadgeProps {
  agencyName?: string;
  agencyLogoUrl?: string;
}

export default function WhiteLabelBadge({ agencyName, agencyLogoUrl }: WhiteLabelBadgeProps) {
  if (!agencyName && !agencyLogoUrl) {
    return (
      <div className="text-[11px] font-mono text-slate-400 opacity-80">
        Powered by <span className="font-extrabold text-white">Memento</span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-slate-300">
      <span>Memories by</span>
      {agencyLogoUrl ? (
        <div className="relative w-16 h-4">
          <Image src={agencyLogoUrl} alt={agencyName || "Agency"} fill className="object-contain" />
        </div>
      ) : (
        <span className="font-bold text-white">{agencyName}</span>
      )}
    </div>
  );
}
