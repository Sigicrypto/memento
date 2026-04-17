"use client";

import React from 'react';
import { motion } from 'framer-motion';

const Gallery: React.FC = () => {
  return (
    <section className="sec py-24">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, type: 'spring', stiffness: 100, damping: 15 }}
          className="text-center mb-16"
        >
          <span className="hero-badge mb-4">Gallery</span>
          <h2 className="sec-h2 text-4xl md:text-5xl font-bold mb-4">
            Real <span className="gradient-text-vibrant italic">Event Walls</span>
          </h2>
          <p className="sec-sub text-lg text-slate-400">See how people are using Memento to capture their special moments</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: i * 0.1 }}
              whileHover={{ scale: 1.05 }}
              className="relative group overflow-hidden rounded-2xl aspect-[4/3]"
            >
              <img src={item.src} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                <h3 className="text-white font-bold text-xl mb-1">{item.title}</h3>
                <p className="text-primary-light text-sm font-medium">{item.count}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Gallery;
