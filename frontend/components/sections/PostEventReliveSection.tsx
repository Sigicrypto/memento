"use client";

import React from "react";
import { FolderArchive, Calendar, Share2, Tv, DownloadCloud, Sparkles, Check } from "lucide-react";

export default function PostEventReliveSection() {
  return (
    <section className="w-full py-20 md:py-28 px-4 sm:px-6 lg:px-12 bg-[#FAFAF8] border-b border-slate-200/80 flex flex-col items-center justify-center">
      <div className="max-w-7xl w-full mx-auto flex flex-col items-center">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold tracking-[0.15em] uppercase mb-4">
            <Sparkles size={13} className="text-amber-500" />
            <span>AFTER THE CELEBRATION</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[#0A2540] tracking-tight leading-tight mb-4">
            One Celebration. Every Perspective. One Lasting Archive.
          </h2>

          <p className="text-slate-600 text-sm sm:text-base md:text-lg leading-relaxed max-w-2xl mx-auto font-normal">
            Memento isn&apos;t just an interactive centerpiece for the wedding night. It curates a timeless digital heirloom ready to relive for decades to come.
          </p>
        </div>

        {/* Magic UI Bento Grid (Gallery & Archive Dominant) */}
        <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-y-8 sm:gap-y-10 md:gap-y-8 gap-x-6 sm:gap-x-8 max-w-6xl mx-auto">
          
          {/* Card 1: 1-Click Master 4K ZIP (Span 7) */}
          <div className="md:col-span-7 bg-[#F8FAFC] border border-slate-200/90 rounded-3xl p-7 sm:p-8 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-[#0A2540] mb-5 shadow-sm">
                <FolderArchive size={24} className="stroke-[2.2]" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600 mb-1 block">
                FULL RESOLUTION ARCHIVE
              </span>
              <h3 className="text-2xl font-bold text-[#0A2540] mb-3">
                1-Click Master 4K ZIP Download
              </h3>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-lg mb-6">
                Download every single photo and video captured by guests and second shooters at full original camera resolution. Zero downsampling, perfect for physical albums and studio delivery.
              </p>
            </div>

            {/* Simulated ZIP Archive Preview */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 font-bold text-xs">
                  ZIP
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Priya_Rohan_Wedding_MasterArchive.zip</h4>
                  <p className="text-[11px] text-slate-500 font-mono">184 Photos · 4K Uncompressed · 1.8 GB</p>
                </div>
              </div>
              <div className="px-3.5 py-1.5 rounded-full bg-[#0A2540] text-white text-xs font-bold flex items-center gap-1.5">
                <DownloadCloud size={14} />
                <span>Ready</span>
              </div>
            </div>
          </div>

          {/* Card 2: Chronological Timeline View (Span 5) */}
          <div className="md:col-span-5 bg-[#EEF5FB] border border-blue-100 rounded-3xl p-7 sm:p-8 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-white border border-blue-200/80 flex items-center justify-center text-[#0A2540] mb-5 shadow-sm">
                <Calendar size={24} className="stroke-[2.2]" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-700 mb-1 block">
                STORYTELLING FLOW
              </span>
              <h3 className="text-2xl font-bold text-[#0A2540] mb-3">
                Chronological Timeline
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-6">
                Browse the celebration in exact chronological sequence — from early morning bridal makeup to the final midnight dance.
              </p>
            </div>

            <div className="space-y-2 border-t border-blue-200/60 pt-4 text-xs font-semibold text-slate-700">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-600" />
                <span>Morning Prep (11:00 AM) · 42 Photos</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>Ceremony &amp; Vows (4:30 PM) · 88 Photos</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-600" />
                <span>Reception &amp; Party (9:00 PM) · 124 Photos</span>
              </div>
            </div>
          </div>

          {/* Card 3: Private Guest Sharing Link (Span 5) */}
          <div className="md:col-span-5 bg-[#F8FAFC] border border-slate-200/90 rounded-3xl p-7 sm:p-8 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-[#0A2540] mb-5 shadow-sm">
                <Share2 size={24} className="stroke-[2.2]" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600 mb-1 block">
                ZERO LOGIN VIEWING
              </span>
              <h3 className="text-2xl font-bold text-[#0A2540] mb-3">
                Private Sharing Link
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-4">
                Share a secure link via WhatsApp or email with friends and family. Guests can view the gallery and download their favourite memories without creating an account.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-200/70 flex items-center gap-2 text-xs font-semibold text-emerald-700">
              <Check size={16} />
              <span>Password protection &amp; lock controls</span>
            </div>
          </div>

          {/* Card 4: Fullscreen Slideshow on Demand (Span 7) */}
          <div className="md:col-span-7 bg-gradient-to-br from-[#0A2540] to-[#051324] text-white border border-slate-800 rounded-3xl p-7 sm:p-8 flex flex-col justify-between shadow-lg">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-amber-400 mb-5 shadow-inner">
                <Tv size={24} className="stroke-[2.2]" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-1 block">
                ANNIVERSARY REPLAY
              </span>
              <h3 className="text-2xl font-bold text-white mb-3">
                Fullscreen Slideshow Mode
              </h3>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-lg mb-6">
                Replay your wedding memories on the living room TV or projector anytime. Features gentle auto-transitions and built-in acoustic background audio.
              </p>
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-amber-300 font-mono">
              <span>Works on Smart TV browsers &amp; AirPlay</span>
              <span>HD / 4K Auto-Fit</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
