"use client";

import React from 'react';
import { motion } from 'framer-motion';
import SectionHeader from './SectionHeader';

const testimonials = [
  { quote: "We collected 500+ photos in just one evening! Memento made our wedding hassle-free and magical.", author: "Rohan & Priya", role: "Happy Couple", rating: 5 },
  { quote: "Our clients loved seeing the live photo wall at their gala. It was the talk of the night—seamless interaction.", author: "Fatima Al Balushi", role: "Event Coordinator", rating: 5 },
  { quote: "The simplest way to gather memories. No app, no friction, just pure joy in real-time. Highly recommended.", author: "Sarah Jenkins", role: "Wedding Planner", rating: 5 },
  { quote: "Guests were raving about how easy it was. The live slideshow on the projector made the night unforgettable.", author: "Michael Chen", role: "Event Host", rating: 5 },
  { quote: "I've tried other apps, but Memento's no-app QR scan is a game changer. Perfect for our corporate retreat.", author: "Amanda Smith", role: "HR Director", rating: 5 },
];

const Testimonials: React.FC = () => {
  return (
    <section className="lp-section overflow-hidden">
      <div className="section-container relative z-10">
        <SectionHeader
          badge="Testimonials"
          badgeColor="cyan"
          title={<>Loved by <span className="text-gradient-neon italic">Event Organizers</span></>}
          description="See why thousands of planners trust Memento for their most important celebrations."
        />
      </div>

      <div className="relative flex w-full flex-col items-center justify-center overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)] z-10 mb-16">
        <div className="flex w-max animate-marquee gap-6 py-4 pause-on-hover">
          {[...testimonials, ...testimonials].map((item, i) => (
            <div
              key={i}
              className="group relative flex flex-col w-[340px] md:w-[420px] shrink-0 overflow-hidden rounded-2xl glass-panel p-8 md:p-10 hover:-translate-y-2 transition-all duration-500"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-neon-cyan/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="relative z-10 flex flex-col items-center h-full text-center">
                <div className="flex gap-1 mb-6 justify-center">
                  {[...Array(item.rating)].map((_, j) => (
                    <span key={j} className="text-neon-cyan text-base drop-shadow-[0_0_8px_rgba(0,255,255,0.4)]">★</span>
                  ))}
                </div>
                <p className="text-white/90 text-lg font-medium leading-relaxed mb-8 flex-grow italic">
                  &quot;{item.quote}&quot;
                </p>
                <div className="flex flex-col items-center gap-3 pt-5 border-t border-white/10 w-full">
                  <div className="w-11 h-11 rounded-full bg-[#1a1a1a] border border-neon-cyan/30 flex items-center justify-center text-neon-cyan font-bold text-sm">
                    {item.author.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="text-white font-bold leading-none mb-1 group-hover:text-neon-cyan transition-colors duration-300">
                      {item.author}
                    </p>
                    <p className="text-white/50 text-xs uppercase tracking-widest font-semibold">{item.role}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 p-8 md:p-12 rounded-3xl glass-panel text-center"
        >
          {[
            { val: '10k+', label: 'Events' },
            { val: '500k+', label: 'Photos' },
            { val: '50+', label: 'Countries' },
            { val: '4.9★', label: 'Rating' },
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center">
              <span className="text-3xl md:text-4xl font-black text-white mb-2 tracking-tighter">{item.val}</span>
              <span className="text-white/50 text-xs uppercase tracking-widest font-bold">{item.label}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonials;
