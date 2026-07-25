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
          className="text-center mb-20"
        >
          <div className="hud-chip mb-6">
            Inspiration
          </div>
          <h2 className="h1-text mb-6">
            Real <span className="hero-title-accent italic">Event Walls</span>
          </h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">See how people are using Memento to capture their special moments in high resolution.</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
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
              className="viewfinder gcard !p-0 aspect-[4/3] group cursor-pointer overflow-hidden"
            >
              <Corners />
              <img src={item.src} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-60 group-hover:opacity-100" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent p-8 flex flex-col justify-end">
                <h3 className="text-text-primary font-bold text-xl mb-1 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">{item.title}</h3>
                <p className="font-mono-ui text-accent-cyan text-xs font-bold tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-300">{item.count}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Gallery;
