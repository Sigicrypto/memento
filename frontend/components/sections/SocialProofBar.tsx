"use client";

import React from "react";

export default function SocialProofBar() {
  const stats = [
    { number: "10,000+", label: "Events Created" },
    { number: "500,000+", label: "Photos Shared" },
    { number: "50+", label: "Countries" },
    { number: "4.9★", label: "Average Rating" },
  ];

  return (
    <section className="w-full py-10 px-4 md:px-8 bg-surface border-y border-border flex flex-col items-center justify-center">
      <div className="max-w-6xl w-full mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {stats.map((stat, index) => (
            <div key={index} className="flex flex-col items-center">
              <div className="text-3xl md:text-4xl font-bold text-accent">
                {stat.number}
              </div>
              <div className="text-text-secondary text-sm mt-1">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
        <p className="text-text-muted text-sm mt-6 text-center">
          Trusted by event hosts and planners worldwide
        </p>
      </div>
    </section>
  );
}
