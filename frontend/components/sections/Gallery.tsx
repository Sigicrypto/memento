"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Corners from '@/components/Corners';

const Gallery: React.FC = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-20 relative z-10"
        >
          <div className="hero-badge mb-6 backdrop-blur-md bg-surface/50 border-border">
            Inspiration
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 text-text-primary">
            Real <span className="text-accent-cyan italic">Event Walls</span>
          </h2>
          <p className="text-lg text-text-secondary font-medium max-w-2xl mx-auto">See how people are using Memento to capture their special moments in high resolution.</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10 max-w-7xl mx-auto">
          {[
            { title: 'Sarah & John Wedding', src: '/landing-hero/photo5.jpg', count: '156 photos' },
            { title: 'Tech Conference 2024', src: '/landing-hero/photo2.jpg', count: '289 photos' },
            { title: 'Birthday Celebration', src: '/landing-hero/photo7.jpg', count: '87 photos' },
            { title: 'Corporate Gala', src: '/landing-hero/photo8.jpg', count: '234 photos' },
            { title: 'Graduation Party', src: '/landing-hero/photo9.jpg', count: '145 photos' },
            { title: 'Festival Weekend', src: '/landing-hero/photo10.jpg', count: '512 photos' }
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="group relative cursor-pointer overflow-hidden rounded-3xl bg-surface/70 backdrop-blur-md border border-border aspect-[4/3] shadow-xl"
            >
              <img src={item.src} alt={item.title} className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 opacity-70 group-hover:opacity-100" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute inset-0 p-8 flex flex-col justify-end">
                <h3 className="text-white font-bold text-2xl mb-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">{item.title}</h3>
                <p className="font-mono-ui text-accent-cyan text-sm font-bold tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">{item.count}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Gallery;
