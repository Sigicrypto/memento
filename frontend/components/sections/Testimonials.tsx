"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Corners from '@/components/Corners';

const Testimonials: React.FC = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-20"
        >
          <div className="hud-chip mb-6">
            Testimonials
          </div>
          <h2 className="h1-text mb-6">
            Loved by <span className="hero-title-accent italic">Event Organizers</span>
          </h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">See why thousands of planners trust Memento for their most important celebrations.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { quote: "We collected 500+ photos in just one evening! Memento made our wedding hassle-free and magical.", author: "Rohan & Priya", role: "Happy Couple", event: "Mumbai Wedding", rating: 5 },
            { quote: "Our clients loved seeing the live photo wall at their gala. It was the talk of the night—seamless interaction.", author: "Fatima Al Balushi", role: "Event Coordinator", event: "Muscat Corporate Gala", rating: 5 },
            { quote: "The simplest way to gather memories. No app, no friction, just pure joy in real-time. Highly recommended.", author: "Sarah Jenkins", role: "Wedding Planner", event: "London Destination Wedding", rating: 5 }
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="viewfinder gcard flex flex-col"
            >
              <Corners />
              <div className="flex gap-1 mb-6">
                {[...Array(item.rating)].map((_, j) => <span key={j} className="text-accent-cyan text-sm">★</span>)}
              </div>
              <p className="text-text-primary text-lg leading-relaxed mb-10 flex-grow italic">&quot;{item.quote}&quot;</p>

              <div className="flex items-center gap-4 border-t border-border pt-6">
                <div className="w-12 h-12 rounded-full bg-bg-subtle border border-accent-cyan/30 flex items-center justify-center text-accent-cyan font-bold font-mono-ui text-sm">
                  {item.author.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <p className="text-text-primary font-bold leading-none mb-1">{item.author}</p>
                  <p className="mono-label">{item.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Social Proof Bar */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="viewfinder mt-24 grid grid-cols-2 md:grid-cols-4 gap-8 p-12 rounded-[2rem] bg-surface border border-border backdrop-blur-3xl text-center"
        >
          <Corners />
          {[
            { val: '10k+', label: 'Events' },
            { val: '500k+', label: 'Photos' },
            { val: '50+', label: 'Countries' },
            { val: '4.9★', label: 'Rating' },
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center">
              <span className="font-mono-ui text-4xl md:text-5xl font-bold text-text-primary mb-2 tracking-tighter">{item.val}</span>
              <span className="mono-label">{item.label}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonials;
