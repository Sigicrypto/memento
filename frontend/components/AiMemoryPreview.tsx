"use client";

import React from "react";
import { Sparkles, Users, Video, Film, Star } from "lucide-react";

export default function AiMemoryPreview() {
  return (
    <div className="w-full p-6 rounded-2xl bg-slate-900/80 border border-purple-500/30 backdrop-blur-xl flex flex-col gap-4 text-white">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-purple-400" />
          <h3 className="font-extrabold text-sm text-white">AI Memory System</h3>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300 bg-purple-500/20 px-2.5 py-1 rounded-full border border-purple-500/40">
          Experimental / Beta Preview
        </span>
      </div>

      <p className="text-slate-400 text-xs leading-relaxed">
        Future AI pipeline architecture for automated memory curation and highlight creation.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2">
        <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex flex-col gap-1">
          <Star size={16} className="text-amber-400" />
          <h4 className="text-xs font-bold text-slate-200">Best Shot AI</h4>
          <p className="text-[10px] text-slate-400">Filters lighting, focus, and smiling faces automatically.</p>
        </div>
        <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex flex-col gap-1">
          <Users size={16} className="text-cyan-400" />
          <h4 className="text-xs font-bold text-slate-200">People & Moments</h4>
          <p className="text-[10px] text-slate-400">Clusters photos into Ceremony, Party, Family, and Friends.</p>
        </div>
        <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex flex-col gap-1">
          <Film size={16} className="text-pink-400" />
          <h4 className="text-xs font-bold text-slate-200">Auto Highlight Reel</h4>
          <p className="text-[10px] text-slate-400">Generates a 60-second animated video memory recap.</p>
        </div>
      </div>
    </div>
  );
}
