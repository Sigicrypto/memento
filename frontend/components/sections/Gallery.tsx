"use client";

import React from 'react';
import { motion } from 'framer-motion';
import SectionHeader from './SectionHeader';

const Gallery: React.FC = () => {
  const items = [
    { title: 'Sarah & John Wedding', src: '/landing-hero/photo5.jpg', count: '156 photos' },
    { title: 'Tech Conference 2024', src: '/landing-hero/photo2.jpg', count: '289 photos' },
    { title: 'Birthday Celebration', src: '/landing-hero/photo7.jpg', count: '87 photos' },
    { title: 'Corporate Gala', src: '/landing-hero/photo8.jpg', count: '234 photos' },
    { title: 'Graduation Party', src: '/landing-hero/photo9.jpg', count: '145 photos' },
    { title: 'Festival Weekend', src: '/landing-hero/photo10.jpg', count: '512 photos' },
  ];

  return (
    <section id="gallery" className="lp-section overflow-hidden scroll-mt-32">
      <div className="section-container">
        <SectionHeader
          badge="Inspiration"
          badgeColor="purple"
          title={<>Real <span className="text-gradient-neon italic">Event Walls</span></>}
          description="See how people are using Memento to capture their special moments in high resolution."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {items.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: 'easeOut' }}
              className="group relative cursor-pointer overflow-hidden rounded-2xl glass-panel aspect-[4/3] hover:scale-[1.02] transition-all duration-500 ease-out"
            >
              <img
                src={item.src}
                alt={item.title}
                className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 opacity-60 group-hover:opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-end">
                <h3 className="text-white font-bold text-lg md:text-xl mb-1 translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                  {item.title}
                </h3>
                <p className="text-neon-cyan text-xs font-bold tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
                  {item.count}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Gallery;
