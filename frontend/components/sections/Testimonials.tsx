"use client";

import React from 'react';
import { motion } from 'framer-motion';

const Testimonials: React.FC = () => {
  return (
    <section className="sec py-24 relative overflow-hidden">
      {/* Decorative Orbs */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-accent/10 blur-[120px] rounded-full -z-10" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/10 blur-[120px] rounded-full -z-10" />

      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, type: 'spring', stiffness: 100, damping: 15 }}
          className="text-center mb-16"
        >
          <span className="hero-badge mb-4">Testimonials</span>
          <h2 className="sec-h2 text-4xl md:text-5xl font-bold mb-4">
            Loved by <span className="gradient-text-vibrant italic">Event Organizers</span>
          </h2>
          <p className="sec-sub text-lg text-slate-400">See what people are saying about Memento</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { quote: "We collected 500+ photos in just one evening! Memento made our wedding hassle-free.", author: "Rohan & Priya", role: "Happy Couple", event: "Mumbai Wedding • 524 photos", rating: 5 },
            { quote: "Our clients loved seeing the live photo wall at their corporate event. It was magical.", author: "Fatima Al Balushi", role: "Event Coordinator", event: "Muscat Corporate Gala • 320 photos", rating: 5 },
            { quote: "The simplest way to gather memories. No app, no friction, just pure joy in real-time.", author: "Sarah Jenkins", role: "Wedding Planner", event: "London Destination Wedding • 450 photos", rating: 5 }
          ].map((item, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              whileHover={{ y: -5 }}
              className="gcard p-8 rounded-3xl bg-surface/40 backdrop-blur-xl border border-white/10 flex flex-col h-full"
            >
              <div className="gcard-inner flex flex-col h-full">
                <div className="flex gap-1 mb-4">
                  {[...Array(item.rating)].map((_, j) => <span key={j} className="text-amber-400 text-lg">⭐</span>)}
                </div>
                <p className="text-slate-300 mb-8 text-lg leading-relaxed italic flex-grow">&quot;{item.quote}&quot;</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    {item.author.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="text-white font-bold text-lg leading-none mb-1">{item.author}</p>
                    <p className="text-slate-500 text-sm">{item.role}</p>
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t border-white/5">
                  <p className="text-primary-light text-xs font-black tracking-widest uppercase">{item.event}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Social Proof Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.3 }}
          className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-8 p-12 rounded-3xl bg-surface/20 border border-white/5 backdrop-blur-3xl text-center"
        >
          {[
            { val: '10k+', label: 'Events Created' },
            { val: '500k+', label: 'Photos Shared' },
            { val: '50+', label: 'Countries' },
            { val: '4.9★', label: 'User Rating' },
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center">
              <span className="text-4xl md:text-5xl font-black gradient-text-vibrant mb-2">{item.val}</span>
              <span className="text-slate-500 text-sm font-bold tracking-widest uppercase">{item.label}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonials;
