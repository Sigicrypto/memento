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
      {/* Brand Icon: Blue rounded badge with camera & gold heart */}
      <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#0F2F57] to-[#0A2540] flex items-center justify-center shadow-sm shrink-0 border border-blue-950/20">
        <svg
          viewBox="0 0 32 32"
          fill="none"
          className="w-5 h-5 sm:w-6 sm:h-6"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Camera top flash bump */}
          <path
            d="M12 8C12 7.44772 12.4477 7 13 7H19C19.5523 7 20 7.44772 20 8V9H12V8Z"
            fill="white"
            fillOpacity="0.9"
          />
          {/* Camera body */}
          <rect
            x="6"
            y="9"
            width="20"
            height="15"
            rx="3"
            stroke="white"
            strokeWidth="2"
          />
          {/* Lens circle */}
          <circle cx="16" cy="16.5" r="4.5" stroke="white" strokeWidth="1.5" />
          {/* Gold Heart inside lens */}
          <path
            d="M16 18.5L14.7 17.3C13.4 16.1 12.5 15.3 12.5 14.3C12.5 13.5 13.1 12.9 13.9 12.9C14.4 12.9 14.9 13.1 15.2 13.5L16 14.3L16.8 13.5C17.1 13.1 17.6 12.9 18.1 12.9C18.9 12.9 19.5 13.5 19.5 14.3C19.5 15.3 18.6 16.1 17.3 17.3L16 18.5Z"
            fill="#F39C12"
          />
        </svg>
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
