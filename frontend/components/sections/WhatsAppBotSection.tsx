"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Zap, ShieldCheck } from 'lucide-react';
import SectionHeader from '@/components/sections/SectionHeader';

export default function WhatsAppBotSection() {
  return (
    <section className="py-20 md:py-24 relative z-10 w-full flex flex-col items-center justify-center border-y border-border bg-bg">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full">
        <SectionHeader 
          title="Frictionless Entry via WhatsApp"
          badge="INSTANT ACCESS"
          badgeColor="cyan"
          description="Don't want guests squinting at QR codes? Just have them text your studio's WhatsApp bot. They are instantly guided straight to your live event wall."
        />
        
        <div className="mt-12 flex flex-col items-center justify-center gap-12 w-full text-center">
          {/* WhatsApp Chat Mockup Centered */}
          <div className="max-w-md w-full relative mx-auto">
            <div className="rounded-3xl border border-border bg-surface overflow-hidden shadow-card text-left">
              <div className="bg-[#075E54] px-4 py-3.5 flex items-center gap-3 text-white">
                <div className="w-10 h-10 rounded-full bg-emerald-700/60 border border-white/20 flex items-center justify-center font-bold text-sm">
                  <MessageCircle size={20} className="text-white" />
                </div>
                <div>
                  <div className="text-white font-bold text-sm">Memento Studio Bot</div>
                  <div className="text-emerald-200 text-xs">Official Studio Assistant</div>
                </div>
              </div>
              
              <div className="p-4 flex flex-col gap-3.5 bg-[#ECE5DD] min-h-[320px]">
                {/* Guest Message */}
                <div className="self-end bg-[#E7FFDB] text-[#111B21] rounded-2xl rounded-tr-none px-3.5 py-2.5 max-w-[85%] shadow-sm text-sm border border-black/5">
                  <p className="font-semibold text-xs text-[#008069] mb-0.5">Guest (Aunt Shashi)</p>
                  JOIN SharmaPatel25
                  <span className="text-[10px] text-neutral-500 ml-2 float-right mt-1.5">7:42 PM</span>
                </div>
                
                {/* Bot Reply */}
                <div className="self-start bg-white text-[#111B21] rounded-2xl rounded-tl-none px-3.5 py-2.5 max-w-[85%] shadow-sm text-sm border border-black/5">
                  <p className="font-semibold text-xs text-[#008069] mb-1">Memento Assistant</p>
                  🎉 Welcome to the Celebration!
                  <br/><br/>
                  Tap the private link below to open your camera right now and send candid moments to the big screen:
                  <br/><br/>
                  <span className="text-primary font-bold underline cursor-pointer">
                    memento.events/your-event-name
                  </span>
                  <p className="text-[11px] text-neutral-500 mt-2">No app install required. Works on any phone camera.</p>
                  <span className="text-[10px] text-neutral-400 ml-2 float-right mt-1">7:42 PM</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* 3 Benefit Cards Centered */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-center">
            <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-surface border border-border shadow-card hover:shadow-card-hover transition-all">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 mb-4 mx-auto">
                <MessageCircle size={22} />
              </div>
              <h3 className="text-lg font-bold text-text-primary mb-2 text-center">Zero Friction Onboarding</h3>
              <p className="text-text-secondary leading-relaxed text-sm text-center">
                Every guest and relative already uses WhatsApp. Give attendees of all ages a familiar 1-tap entry without forcing them to download apps.
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-surface border border-border shadow-card hover:shadow-card-hover transition-all">
              <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-4 mx-auto">
                <Zap size={22} />
              </div>
              <h3 className="text-lg font-bold text-text-primary mb-2 text-center">Instant Gallery Deep-Link</h3>
              <p className="text-text-secondary leading-relaxed text-sm text-center">
                The bot replies in under 1 second with a secure link that launches the camera directly in their mobile browser.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-surface border border-border shadow-card hover:shadow-card-hover transition-all">
              <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-accent mb-4 mx-auto">
                <ShieldCheck size={22} />
              </div>
              <h3 className="text-lg font-bold text-text-primary mb-2 text-center">Family-Safe Moderation</h3>
              <p className="text-text-secondary leading-relaxed text-sm text-center">
                WhatsApp uploads flow directly into your host moderation queue, guaranteeing that only venue-appropriate photos hit the reception screen.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
