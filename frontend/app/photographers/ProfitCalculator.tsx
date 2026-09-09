"use client";

import React, { useState } from 'react';

export default function ProfitCalculator() {
  const [events, setEvents] = useState(4);
  const charge = 3000;
  const cost = 1999;
  const profitPerEvent = charge - cost;
  const total = profitPerEvent * events;

  return (
    <div className="rounded-2xl border border-border bg-surface p-6 md:p-10 shadow-card hover:shadow-card-hover transition-shadow max-w-xl mx-auto text-center flex flex-col items-center">
      <h3 className="text-xl md:text-2xl font-display font-semibold mb-6 text-text-primary text-center">
        Profit Calculator
      </h3>
      <div className="mb-8 flex flex-col items-center text-center w-full">
        <label className="text-text-secondary mb-3 text-base md:text-lg text-center">
          How many weddings do you shoot per month?
        </label>
        <input 
          type="number" 
          min="1"
          max="100"
          value={events} 
          onChange={(e) => setEvents(Math.max(0, parseInt(e.target.value) || 0))}
          className="w-32 text-center text-3xl p-3 rounded-xl border border-border bg-bg text-text-primary font-display outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all mx-auto"
        />
      </div>
      <div className="bg-bg-subtle p-6 rounded-xl border border-border mb-6 text-center w-full">
        <p className="text-text-primary text-base md:text-lg mb-2 text-center">
          If you charge <span className="font-semibold">₹{charge.toLocaleString()}</span> per event and pay <span className="font-semibold">₹{cost.toLocaleString()}</span>, that's <span className="font-semibold text-accent-cyan">₹{profitPerEvent.toLocaleString()}</span> profit
        </p>
        <p className="text-2xl sm:text-3xl font-display font-bold mt-4 text-accent text-center">
          × {events} = ₹{total.toLocaleString()}/month extra revenue
        </p>
      </div>
      <p className="text-xs sm:text-sm text-text-muted text-center">
        Note: Most photographers charge ₹2,000–5,000 as a live wall add-on package.
      </p>
    </div>
  );
}
