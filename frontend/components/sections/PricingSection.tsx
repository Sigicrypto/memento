"use client";

import React from 'react';
import Pricing from '@/components/Pricing';

export default function PricingSection() {
  return (
    <section id="pricing" className="py-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
          <p className="text-text-secondary text-lg">Choose the perfect plan for your event.</p>
        </div>
        <Pricing />
      </div>
    </section>
  );
}
