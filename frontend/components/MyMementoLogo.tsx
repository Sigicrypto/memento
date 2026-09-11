"use client";

import React from "react";

interface MyMementoLogoProps {
  className?: string;
  variant?: "dark" | "light";
  showTagline?: boolean;
}

export default function MyMementoLogo({
  className = "",
  variant = "dark",
  showTagline = true,
}: MyMementoLogoProps) {
  const isLight = variant === "light";
  const textColor = isLight ? "text-white" : "text-[#0A2540]";
  const taglineColor = isLight ? "text-amber-300" : "text-[#B8860B]";

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Brand Icon: Camera Emblem with No Background */}
      <div className="relative w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center shrink-0">
        <img
          src="/memento-camera-logo.png"
          alt="MyMemento Camera Logo"
          className="w-full h-full object-contain drop-shadow-sm"
        />
      </div>

      {/* Wordmark */}
      <div className="flex flex-col text-left">
        <span
          className={`font-serif font-black text-lg sm:text-xl tracking-tight leading-none ${textColor}`}
        >
          MyMemento
        </span>
        {showTagline && (
          <span
            className={`text-[8px] sm:text-[8.5px] font-bold tracking-[0.18em] uppercase leading-tight mt-0.5 ${taglineColor}`}
          >
            YOUR MOMENTS LIVE FOREVER
          </span>
        )}
      </div>
    </div>
  );
}
