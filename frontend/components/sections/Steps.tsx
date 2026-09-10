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
        <div className="w-full grid grid-cols-1 md:grid-cols-11 items-center gap-4 lg:gap-6">
          
          {/* Step 1 */}
          <div className="md:col-span-3 h-full flex flex-col items-center text-center p-6 sm:p-7 rounded-2xl bg-[#F0F5FA] border border-blue-100/70 shadow-sm hover:shadow-md transition-all">
            <div className="w-8 h-8 rounded-full bg-[#0A2540] text-white font-bold text-sm flex items-center justify-center mb-4">
              1
            </div>
            <div className="w-16 h-16 rounded-2xl bg-white border border-blue-100 flex items-center justify-center text-[#0D3B66] mb-4 shadow-sm">
              <QrCode size={32} className="stroke-[1.75]" />
            </div>
            <h3 className="font-bold text-[#0A2540] text-lg mb-1.5">
              Scan QR Code
            </h3>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed max-w-xs">
              Guests scan the QR code at your event
            </p>
          </div>

          {/* Chevron 1 */}
          <div className="hidden md:flex md:col-span-1 items-center justify-center text-slate-400">
            <ChevronRight size={28} className="stroke-[2.5]" />
          </div>

          {/* Step 2 */}
          <div className="md:col-span-3 h-full flex flex-col items-center text-center p-6 sm:p-7 rounded-2xl bg-[#F0F5FA] border border-blue-100/70 shadow-sm hover:shadow-md transition-all">
            <div className="w-8 h-8 rounded-full bg-[#0A2540] text-white font-bold text-sm flex items-center justify-center mb-4">
              2
            </div>
            <div className="w-16 h-16 rounded-2xl bg-white border border-blue-100 flex items-center justify-center text-[#0D3B66] mb-4 shadow-sm">
              <CloudUpload size={32} className="stroke-[1.75]" />
            </div>
            <h3 className="font-bold text-[#0A2540] text-lg mb-1.5">
              Upload Photos
            </h3>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed max-w-xs">
              Guests capture and upload photos from their phones
            </p>
          </div>

          {/* Chevron 2 */}
          <div className="hidden md:flex md:col-span-1 items-center justify-center text-slate-400">
            <ChevronRight size={28} className="stroke-[2.5]" />
          </div>

          {/* Step 3 */}
          <div className="md:col-span-3 h-full flex flex-col items-center text-center p-6 sm:p-7 rounded-2xl bg-[#F0F5FA] border border-blue-100/70 shadow-sm hover:shadow-md transition-all">
            <div className="w-8 h-8 rounded-full bg-[#0A2540] text-white font-bold text-sm flex items-center justify-center mb-4">
              3
            </div>
            <div className="w-16 h-16 rounded-2xl bg-white border border-blue-100 flex items-center justify-center text-[#0D3B66] mb-4 shadow-sm">
              <Tv size={32} className="stroke-[1.75]" />
            </div>
            <h3 className="font-bold text-[#0A2540] text-lg mb-1.5">
              See It Live
            </h3>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed max-w-xs">
              Photos appear in real time on the big screen
            </p>
          </div>

        </div>

      </div>
    </section>
  );
}
