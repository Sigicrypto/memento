"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Corners from '@/components/Corners';

const testimonials = [
  { quote: "We collected 500+ photos in just one evening! Memento made our wedding hassle-free and magical.", author: "Rohan & Priya", role: "Happy Couple", event: "Mumbai Wedding", rating: 5 },
  { quote: "Our clients loved seeing the live photo wall at their gala. It was the talk of the night—seamless interaction.", author: "Fatima Al Balushi", role: "Event Coordinator", event: "Muscat Corporate Gala", rating: 5 },
  { quote: "The simplest way to gather memories. No app, no friction, just pure joy in real-time. Highly recommended.", author: "Sarah Jenkins", role: "Wedding Planner", event: "London Destination Wedding", rating: 5 },
  { quote: "Guests were raving about how easy it was. The live slideshow on the projector made the night unforgettable.", author: "Michael Chen", role: "Event Host", event: "Birthday Bash", rating: 5 },
  { quote: "I’ve tried other apps, but Memento’s no-app QR scan is a game changer. Perfect for our corporate retreat.", author: "Amanda Smith", role: "HR Director", event: "Corporate Retreat", rating: 5 },
];

const Testimonials: React.FC = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background Haikei SVG Waves */}
      <div className="absolute inset-0 z-0 overflow-hidden opacity-30">
         <svg className="absolute w-[200vw] h-[200vh] -top-1/2 -left-1/2 opacity-20 pointer-events-none animate-[spin_180s_linear_infinite]" viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg">
            <path fill="var(--primary)" d="M472.9,-540C583.7,-432.2,624.4,-235.6,634,-48.5C643.5,138.6,621.8,316.2,514.9,444.6C408,572.9,215.8,652,24.1,623.2C-167.6,594.4,-334.8,457.7,-441.7,329.3C-548.6,201,-595.2,81.1,-589.6,-36.5C-584.1,-154.1,-526.4,-269.5,-427.3,-373.1C-328.2,-476.7,-187.6,-568.6,-5.4,-562.1C176.8,-555.7,362.1,-647.8,472.9,-540Z" transform="translate(450 300)" />
         </svg>
         <div className="absolute inset-0 backdrop-blur-3xl" />
      </div>

      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-20 relative z-10"
        >
          <div className="hero-badge mb-6 backdrop-blur-md bg-white/5 border-white/10">
            Testimonials
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 text-white">
            Loved by <span className="text-accent-cyan italic">Event Organizers</span>
          </h2>
          <p className="text-lg text-zinc-400 font-medium max-w-2xl mx-auto">See why thousands of planners trust Memento for their most important celebrations.</p>
        </motion.div>

        <div className="relative flex w-full flex-col items-center justify-center overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)] z-10">
          <div className="flex w-max animate-marquee gap-8 py-4 pause-on-hover">
            {[...testimonials, ...testimonials].map((item, i) => (
              <div
                key={i}
                className="group relative flex flex-col w-[350px] md:w-[400px] shrink-0 overflow-hidden rounded-3xl bg-surface/40 backdrop-blur-xl border border-white/10 p-8 hover:bg-surface/60 hover:border-white/20 transition-all duration-500 shadow-2xl"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-accent-cyan/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex gap-1 mb-6">
                    {[...Array(item.rating)].map((_, j) => <span key={j} className="text-accent-cyan text-sm drop-shadow-[0_0_8px_rgba(45,212,191,0.5)]">★</span>)}
                  </div>
                  <p className="text-white text-lg font-medium leading-relaxed mb-10 flex-grow italic">&quot;{item.quote}&quot;</p>
    
                  <div className="flex items-center gap-4 pt-6 border-t border-white/10">
                    <div className="w-12 h-12 rounded-full bg-white/5 border border-accent-cyan/30 flex items-center justify-center text-accent-cyan font-bold font-mono-ui text-sm shadow-[0_0_15px_rgba(45,212,191,0.15)]">
                      {item.author.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="text-white font-bold leading-none mb-1 group-hover:text-accent-cyan transition-colors">{item.author}</p>
                      <p className="text-zinc-500 text-xs uppercase tracking-widest font-semibold">{item.role}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Social Proof Bar */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-8 p-12 rounded-3xl bg-surface/30 backdrop-blur-2xl border border-white/10 shadow-2xl text-center relative z-10"
        >
          {[
            { val: '10k+', label: 'Events' },
            { val: '500k+', label: 'Photos' },
            { val: '50+', label: 'Countries' },
            { val: '4.9★', label: 'Rating' },
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center">
              <span className="text-4xl md:text-5xl font-bold text-white mb-2 tracking-tighter drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">{item.val}</span>
              <span className="text-zinc-400 text-xs uppercase tracking-widest font-semibold">{item.label}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonials;
