"use client";

import React from "react";
import { QrCode, CloudUpload, Tv, ChevronRight } from "lucide-react";

export default function Steps() {
  const steps = [
    {
      number: "1",
      icon: QrCode,
      title: "Scan QR Code",
      description: "Guests scan the QR code at your event",
    },
    {
      number: "2",
      icon: CloudUpload,
      title: "Upload Photos",
      description: "Guests capture and upload photos from their phones",
    },
    {
      number: "3",
      icon: Tv,
      title: "See It Live",
      description: "Photos appear in real time on the big screen",
    },
  ];

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

        <p className="text-slate-500 text-sm sm:text-base mb-12">
          Just 3 simple steps
        </p>

        {/* 3 Step Flow Cards with Connecting Chevrons */}
        <div className="w-full flex flex-col md:flex-row items-center justify-between gap-3 lg:gap-4 max-w-5xl mx-auto">
          
          {/* Step 1 */}
          <div className="w-full md:flex-1 bg-[#EEF5FB] border border-blue-100/70 rounded-2xl px-5 py-4 flex items-center gap-4 shadow-sm">
            <div className="w-8 h-8 rounded-full bg-[#0A2540] text-white font-bold text-sm flex items-center justify-center shrink-0">
              1
            </div>
            <QrCode className="w-9 h-9 text-[#0A2540] shrink-0 stroke-[2]" />
            <div className="text-left">
              <h3 className="font-bold text-[#0A2540] text-base leading-tight">
                Scan QR Code
              </h3>
              <p className="text-slate-600 text-xs leading-snug mt-0.5">
                Guests scan the QR code at your event
              </p>
            </div>
          </div>

          {/* Chevron 1 */}
          <div className="hidden md:flex items-center justify-center text-slate-400 shrink-0 px-1">
            <ChevronRight size={22} className="stroke-[2.5]" />
          </div>

          {/* Step 2 */}
          <div className="w-full md:flex-1 bg-[#EEF5FB] border border-blue-100/70 rounded-2xl px-5 py-4 flex items-center gap-4 shadow-sm">
            <div className="w-8 h-8 rounded-full bg-[#0A2540] text-white font-bold text-sm flex items-center justify-center shrink-0">
              2
            </div>
            <CloudUpload className="w-9 h-9 text-[#0A2540] shrink-0 stroke-[2]" />
            <div className="text-left">
              <h3 className="font-bold text-[#0A2540] text-base leading-tight">
                Upload Photos
              </h3>
              <p className="text-slate-600 text-xs leading-snug mt-0.5">
                Guests capture and upload photos from their phones
              </p>
            </div>
          </div>

          {/* Chevron 2 */}
          <div className="hidden md:flex items-center justify-center text-slate-400 shrink-0 px-1">
            <ChevronRight size={22} className="stroke-[2.5]" />
          </div>

          {/* Step 3 */}
          <div className="w-full md:flex-1 bg-[#EEF5FB] border border-blue-100/70 rounded-2xl px-5 py-4 flex items-center gap-4 shadow-sm">
            <div className="w-8 h-8 rounded-full bg-[#0A2540] text-white font-bold text-sm flex items-center justify-center shrink-0">
              3
            </div>
            <Tv className="w-9 h-9 text-[#0A2540] shrink-0 stroke-[2]" />
            <div className="text-left">
              <h3 className="font-bold text-[#0A2540] text-base leading-tight">
                See It Live
              </h3>
              <p className="text-slate-600 text-xs leading-snug mt-0.5">
                Photos appear in real time on the big screen
              </p>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
