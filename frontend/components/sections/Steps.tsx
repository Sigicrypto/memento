"use client";

import React from "react";
import { QrCode, Camera, Share2, Tv, Check } from "lucide-react";

export default function Steps() {
  const steps = [
    {
      step: "01",
      title: "SCAN",
      icon: <QrCode className="w-6 h-6 text-primary" />,
      iconBg: "bg-primary/10 border border-primary/20",
      description: "Guests point their phone camera at your event QR code.",
    },
    {
      step: "02",
      title: "CAPTURE",
      icon: <Camera className="w-6 h-6 text-accent" />,
      iconBg: "bg-accent/10 border border-accent/20",
      description: "The camera opens right in their browser. Snap a photo.",
    },
    {
      step: "03",
      title: "SHARE",
      icon: <Share2 className="w-6 h-6 text-primary" />,
      iconBg: "bg-primary/10 border border-primary/20",
      description: "One tap uploads it in full resolution to your gallery.",
    },
    {
      step: "04",
      title: "EXPERIENCE",
      icon: <Tv className="w-6 h-6 text-accent" />,
      iconBg: "bg-accent/10 border border-accent/20",
      description: "Photos appear live on your venue TV or projector.",
    },
  ];

  const trustItems = [
    "No app download",
    "No account creation",
    "No login",
    "Works on any phone"
  ];

  return (
    <section id="how-it-works" className="w-full py-20 md:py-28 px-4 md:px-8 bg-bg border-b border-border flex flex-col items-center justify-center">
      <div className="max-w-6xl w-full mx-auto flex flex-col items-center text-center">
        
        <span className="bg-primary/10 border border-primary/20 text-primary rounded-full uppercase tracking-wider text-xs font-bold px-3.5 py-1 mb-4">
          HOW IT WORKS
        </span>

        <h2 className="text-text-primary font-bold text-3xl md:text-4xl lg:text-5xl tracking-tight max-w-3xl">
          From QR Code to Live Gallery in Seconds
        </h2>

        <p className="text-text-secondary text-base md:text-lg mt-4 max-w-2xl">
          Zero friction for your guests. No app, no login, no frustration.
        </p>

        {/* 4 Steps Grid */}
        <div className="relative w-full mt-16">
          {/* Connecting Line - Desktop */}
          <div className="hidden lg:block absolute top-[48px] left-[12.5%] right-[12.5%] h-[2px] bg-border z-0"></div>
          
          {/* Connecting Line - Mobile */}
          <div className="block lg:hidden absolute top-[48px] bottom-[48px] left-1/2 -translate-x-1/2 w-[2px] border-l-2 border-dotted border-border z-0"></div>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 w-full relative z-10 text-center">
            {steps.map((item) => (
              <div
                key={item.step}
                className="bg-surface border border-border rounded-2xl p-6 text-center flex flex-col items-center relative overflow-hidden group h-full justify-start shadow-card"
              >
                <span className="text-7xl font-bold text-border/30 absolute top-2 right-4 pointer-events-none select-none">
                  {item.step}
                </span>

                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 relative z-10 ${item.iconBg}`}>
                  {item.icon}
                </div>

                <h3 className="text-text-primary font-semibold text-lg mb-3 relative z-10">
                  {item.title}
                </h3>

                <p className="text-text-secondary text-sm leading-relaxed relative z-10">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Trust strip below steps */}
        <div className="text-text-secondary text-sm flex items-center justify-center gap-4 mt-12 flex-wrap">
          {trustItems.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-500" />
              <span>{item}</span>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
