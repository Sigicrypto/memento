"use client";

import React, { useState } from "react";
import { QrCode, Camera, Tv, ChevronRight, Sparkles, MonitorPlay, DownloadCloud, Users, Briefcase } from "lucide-react";

export default function Steps() {
  const [activeTab, setActiveTab] = useState<"guests" | "hosts">("guests");

  const guestSteps = [
    {
      number: "1",
      icon: QrCode,
      title: "Scan QR Code",
      description: "Point phone camera at table cards or entrance posters. Instant access.",
    },
    {
      number: "2",
      icon: Camera,
      title: "Snap in Browser",
      description: "Mobile web camera opens instantly. No app to download, no account required.",
    },
    {
      number: "3",
      icon: Tv,
      title: "Appears Live on Screen",
      description: "Photos and selfies stream live to venue TVs and projectors within 2 seconds.",
    },
  ];

  const hostSteps = [
    {
      number: "1",
      icon: Sparkles,
      title: "Create Event & QR Kit",
      description: "Set up in 60 seconds. Add your couple/studio branding and download printable QR cards.",
    },
    {
      number: "2",
      icon: MonitorPlay,
      title: "Connect Venue Screen",
      description: "Open the live wall link on any smart TV, projector, or laptop via HDMI or AirPlay.",
    },
    {
      number: "3",
      icon: DownloadCloud,
      title: "Moderate & 4K ZIP",
      description: "Filter photos in real-time or auto-approve, then download full-resolution ZIP archives.",
    },
  ];

  const steps = activeTab === "guests" ? guestSteps : hostSteps;

  return (
    <section id="how-it-works" className="w-full py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-white border-b border-slate-100 flex flex-col items-center justify-center">
      <div className="max-w-6xl w-full mx-auto flex flex-col items-center text-center">
        
        {/* Section Heading with decorative flanking rules */}
        <div className="flex items-center justify-center gap-3 md:gap-4 mb-2">
          <div className="w-8 sm:w-16 h-px bg-amber-400" />
          <h2 className="font-serif text-3xl sm:text-4xl md:text-4xl font-bold text-[#0A2540] tracking-tight">
            How It Works
          </h2>
          <div className="w-8 sm:w-16 h-px bg-amber-400" />
        </div>

        <p className="text-slate-500 text-sm sm:text-base mb-8">
          Simple for guests. Powerful for hosts and photographers.
        </p>

        {/* Dual-Track Tabs */}
        <div className="inline-flex p-1 rounded-full bg-slate-100 border border-slate-200 mb-12 shadow-inner">
          <button
            onClick={() => setActiveTab("guests")}
            className={`flex items-center gap-2 px-5 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === "guests"
                ? "bg-[#0A2540] text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Users size={15} />
            <span>For Guests</span>
          </button>

          <button
            onClick={() => setActiveTab("hosts")}
            className={`flex items-center gap-2 px-5 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === "hosts"
                ? "bg-[#0A2540] text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Briefcase size={15} />
            <span>For Hosts &amp; Photographers</span>
          </button>
        </div>

        {/* 3 Step Flow Cards with Connecting Chevrons */}
        <div className="w-full flex flex-col md:flex-row items-stretch justify-between gap-4 lg:gap-4 max-w-5xl mx-auto">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <React.Fragment key={step.number}>
                <div className="w-full md:flex-1 bg-[#EEF5FB] border border-blue-100/80 rounded-2xl p-5 flex flex-col items-start text-left shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between w-full mb-4">
                    <div className="w-8 h-8 rounded-full bg-[#0A2540] text-white font-bold text-sm flex items-center justify-center shrink-0">
                      {step.number}
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-white/90 flex items-center justify-center text-[#0A2540] shadow-sm">
                      <Icon className="w-5 h-5 stroke-[2.2]" />
                    </div>
                  </div>

                  <h3 className="font-bold text-[#0A2540] text-base sm:text-lg mb-1.5">
                    {step.title}
                  </h3>
                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {idx < steps.length - 1 && (
                  <div className="hidden md:flex items-center justify-center text-slate-400 shrink-0 px-1 self-center">
                    <ChevronRight size={22} className="stroke-[2.5]" />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

      </div>
    </section>
  );
}
