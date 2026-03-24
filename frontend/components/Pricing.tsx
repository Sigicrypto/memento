"use client";

import { useState } from 'react';

const plans = [
  {
    name: 'Plus',
    description: 'Quick, easy and fun photo sharing for family & friends.',
    prices: { USD: '$19.99', INR: '₹1,499' },
    period: '/one time payment',
    buttonText: 'Buy Plus now',
    features: [
      'Unlimited high-resolution photos',
      'Ultra-fast uploads worldwide',
      'Live Slideshow and Polaroid Wall',
      'Download all photos as a ZIP file',
      'Guests can download photos',
      'Manual moderation',
      'Styling to match your design theme',
      'Password protect your wall',
      'QR Card Creator',
      '3 Months Upload / 1 Year Storage',
      'Up to 500 guests',
      'End-to-End Encryption',
    ],
    color: 'purple',
  },
  {
    name: 'Premium',
    description: 'Everything in Plus and more features for lasting memories.',
    prices: { USD: '$34.99', INR: '₹2,999' },
    period: '/one time payment',
    buttonText: 'Buy Premium now',
    popular: true,
    features: [
      'Video uploads',
      { text: 'Photo Book in PDF', badge: 'Beta' },
      'Sync to Google Drive',
      'Notifications on uploads',
      'Automatic safety filter',
      'Everything in Plus',
    ],
    color: 'cyan',
  },
  {
    name: 'Signature',
    description: 'Everything in Premium and more for top-tier events.',
    prices: { USD: '$59.99', INR: '₹4,999' },
    period: '/one time payment',
    buttonText: 'Buy Signature now',
    features: [
      'Upload for a full year',
      'Organize with unlimited walls',
      'Embed on your website',
      'Zapier integrations',
      'FTP Server Access',
      '1 Year Upload / 1 Year Storage',
      'Everything in Premium',
    ],
    color: 'pink',
  },
];

export default function Pricing() {
  const [currency, setCurrency] = useState<'USD' | 'INR'>('USD');

  return (
    <section id="pricing" className="relative z-10 w-full flex flex-col items-center px-6 py-32 bg-gradient-to-b from-transparent via-purple-500/5 to-transparent">
      {/* Title & Subtitle */}
      <p className="text-purple-500 text-sm font-semibold uppercase tracking-widest mb-5">Pricing</p>
      <h2
        className="font-bold text-gray-900 dark:text-white mb-6 text-center"
        style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', lineHeight: '1.25' }}
      >
        Choose the right <span className="gradient-text">version</span> for your event
      </h2>
      <p className="text-gray-500 dark:text-gray-400 text-center max-w-md mb-12 text-sm">
        Three plans that fits any type of event. Scale up as you need.
      </p>

      {/* Currency Switcher */}
      <div className="flex items-center gap-1 p-1 rounded-full bg-gray-100 dark:bg-purple-950/40 border border-gray-200 dark:border-purple-800/40 mb-16 shadow-inner backdrop-blur-md">
        <button
          onClick={() => setCurrency('USD')}
          className={`px-6 py-2 rounded-full text-xs font-semibold transition-all duration-300 ${
            currency === 'USD'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          USD ($)
        </button>
        <button
          onClick={() => setCurrency('INR')}
          className={`px-6 py-2 rounded-full text-xs font-semibold transition-all duration-300 ${
            currency === 'INR'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          INR (₹)
        </button>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl px-4">
        {plans.map((plan) => {
          const isPopular = plan.popular;
          const colorClass = plan.color === 'cyan' ? 'cyan' : plan.color === 'pink' ? 'pink' : 'purple';
          
          return (
            <div
              key={plan.name}
              className={`relative p-[1px] rounded-3xl transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 ${
                isPopular 
                  ? 'scale-102 md:scale-105 shadow-2xl shadow-purple-500/20 hover:shadow-purple-500/30' 
                  : 'shadow-lg hover:shadow-xl'
              } ${
                plan.color === 'cyan' 
                  ? 'bg-gradient-to-br from-purple-600 via-purple-500 to-cyan-400' 
                  : plan.color === 'pink'
                    ? 'bg-gradient-to-br from-pink-500/30 via-transparent to-purple-500/20'
                    : 'bg-gradient-to-br from-purple-500/30 via-transparent to-indigo-500/20'
              }`}
            >
              <div
                className="flex flex-col justify-between overflow-hidden relative h-full bg-white/95 dark:bg-purple-950/60 backdrop-blur-xl group"
                style={{ padding: '2.5rem', borderRadius: '23px' }}
              >
                {/* Background Glow Shift on Hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${
                  plan.color === 'cyan' ? 'from-purple-500/5 to-cyan-500/5' :
                  plan.color === 'pink' ? 'from-pink-500/5 to-purple-500/5' :
                  'from-purple-500/5 to-indigo-500/5'
                } opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none`} />

                {/* Card Header */}
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">{plan.name}</h3>
                    {isPopular && (
                      <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-gradient-to-r from-purple-600 to-cyan-500 text-white uppercase tracking-wider shadow-md animate-pulse">
                        Most Popular
                      </span>
                    )}
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 text-xs mb-6 min-h-[40px] leading-relaxed">
                    {plan.description}
                  </p>

                  {/* Pricing */}
                  <div className="mb-6 flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-gray-900 dark:text-white transition-all duration-300">
                      {plan.prices[currency]}
                    </span>
                    <span className="text-gray-400 dark:text-gray-500 text-xs">{plan.period}</span>
                  </div>

                  <button
                    className={`w-full py-3.5 rounded-xl text-xs font-bold mb-8 transition-all duration-300 border ${
                      isPopular
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-transparent hover:from-purple-700 hover:to-indigo-700 shadow-md hover:shadow-purple-500/30 hover:scale-[1.01]'
                        : 'bg-gray-50 dark:bg-purple-950/30 text-gray-900 dark:text-purple-300 border-gray-200/80 dark:border-purple-800/20 hover:bg-gray-100 dark:hover:bg-purple-900/30'
                    }`}
                  >
                    {plan.buttonText}
                  </button>

                  {/* Divider */}
                  <div className="border-t border-gray-100/80 dark:border-purple-800/10 mb-6" />

                  {/* Features List */}
                  <ul className="space-y-3.5">
                    {plan.features.map((feature, idx) => {
                      const isString = typeof feature === 'string';
                      const text = isString ? feature : feature.text;
                      const badge = !isString ? feature.badge : null;

                      return (
                        <li key={idx} className="flex items-start gap-3 text-xs text-gray-600 dark:text-gray-300">
                          <svg
                            className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                              isPopular ? 'text-cyan-500' : 'text-purple-500'
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2.5"
                              d="M5 13l4 4L19 7"
                            ></path>
                          </svg>
                          <span className="flex items-center gap-2">
                            {text}
                            {badge && (
                              <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                                {badge}
                              </span>
                            )}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
