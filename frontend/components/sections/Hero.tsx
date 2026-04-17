"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface HeroProps {
  setIsDemoOpen: (open: boolean) => void;
}

const Hero: React.FC<HeroProps> = ({ setIsDemoOpen }) => {
  return (
    <section className="hero pt-16 md:pt-20 py-16 overflow-hidden relative">
      <motion.div
        animate={{ rotate: 360, scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] md:w-[800px] md:h-[800px] rounded-full blur-[100px] pointer-events-none -z-10"
        style={{
          background: 'conic-gradient(from 0deg, rgba(6,182,212,0.4), rgba(236,72,153,0.4), rgba(99,102,241,0.4), rgba(6,182,212,0.4))'
        }}
      />
      
      <div className="container mx-auto px-6 relative z-10 flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, type: 'spring', stiffness: 100, damping: 15 }}
          className="text-center"
        >
          <h1 className="hero-h1 leading-tight md:leading-[1.1]">
            Collect Every Moment.
            <br />
            <span className="gradient-text-vibrant">Instantly. Effortlessly.</span>
          </h1>
        </motion.div>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2, type: 'spring', stiffness: 100, damping: 15 }}
          className="hero-p mt-6"
        >
          QR-based photo sharing for weddings, celebrations, and corporate events. One-time payment, zero hassle.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4, type: 'spring', stiffness: 100, damping: 15 }}
          className="hero-btns mt-10"
        >
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsDemoOpen(true)} 
            className="btn-hero-primary cinematic-glow"
          >
            <span>🎬 Watch Demo Wall</span>
          </motion.button>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.6, type: 'spring', stiffness: 100, damping: 15 }}
          className="hero-visual mt-16"
        >
          <div className="polaroid-float p-1" style={{ '--rot': '-8deg' } as React.CSSProperties}>
            <img src="/landing-hero/photo2.jpg" alt="Memory" />
          </div>
          <div className="polaroid-float p-2" style={{ '--rot': '12deg' } as React.CSSProperties}>
            <img src="/landing-hero/photo6.jpg" alt="Memory" />
          </div>
          <div className="polaroid-float p-3" style={{ '--rot': '-5deg' } as React.CSSProperties}>
            <img src="/landing-hero/photo12.jpg" alt="Memory" />
          </div>
          <div className="polaroid-float p-4" style={{ '--rot': '6deg' } as React.CSSProperties}>
            <img src="/landing-hero/photo4.jpg" alt="Memory" />
          </div>

          <div className="flex flex-col md:flex-row gap-8 items-end justify-center">
            {/* Left phone — Upload view */}
            <div className="phone-mockup hidden sm:block">
              <div className="phone-notch" />
              <div className="phone-screen">
                <div className="phone-header">
                  <span className="phone-title">Upload</span>
                  <span className="phone-live"><span className="pulse-dot" /> Live</span>
                </div>
                <div className="phone-grid">
                  {[
                    { src: '/landing-hero/photo1.jpg', alt: 'Guest photo 1' },
                    { src: '/landing-hero/photo2.jpg', alt: 'Guest photo 2' },
                    { src: '/landing-hero/photo3.jpg', alt: 'Guest photo 3' },
                    { src: '/landing-hero/photo4.jpg', alt: 'Guest photo 4' }
                  ].map((img, i) => (
                    <div key={i} className="phone-photo" style={{ background: `linear-gradient(135deg, rgba(245,158,11,${0.15 + i * 0.05}), rgba(244,114,182,${0.1 + i * 0.05}))`, animationDelay: `${0.8 + i * 0.2}s` }}>
                      <img src={img.src} alt={img.alt} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
                    </div>
                  ))}
                </div>
                <div className="phone-upload-bar">
                  ⬆ Uploading...
                  <div className="upload-progress"><div className="upload-progress-bar" /></div>
                </div>
              </div>
            </div>

            {/* Center phone — Live Wall */}
            <div className="phone-mockup phone-c">
              <div className="phone-notch" />
              <div className="phone-screen">
                <div className="phone-header">
                  <span className="phone-title">Sarah&apos;s Wedding</span>
                  <span className="phone-live"><span className="pulse-dot" /> 24 Live</span>
                </div>
                <div className="phone-grid">
                  {[
                    { src: '/landing-hero/photo5.jpg', alt: 'Wedding photo 1' },
                    { src: '/landing-hero/photo6.jpg', alt: 'Wedding photo 2' },
                    { src: '/landing-hero/photo7.jpg', alt: 'Wedding photo 3' },
                    { src: '/landing-hero/photo8.jpg', alt: 'Wedding photo 4' },
                    { src: '/landing-hero/photo9.jpg', alt: 'Wedding photo 5' },
                    { src: '/landing-hero/photo10.jpg', alt: 'Wedding photo 6' }
                  ].map((img, i) => (
                    <div key={i} className="phone-photo" style={{ background: `linear-gradient(135deg, rgba(${200 + i * 10},${100 + i * 15},${50 + i * 20},0.3), rgba(244,114,182,0.15))`, animationDelay: `${0.5 + i * 0.15}s` }}>
                      <img src={img.src} alt={img.alt} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right phone — QR Scan */}
            <div className="phone-mockup phone-r hidden lg:block">
              <div className="phone-notch" />
              <div className="phone-screen">
                <div className="phone-header">
                  <span className="phone-title">Join Wall</span>
                </div>
                <div className="phone-qr">QR</div>
                <p className="phone-scan-text">Scan to join the live wall</p>
                <div className="phone-grid" style={{ marginTop: '0.75rem' }}>
                  {[
                    { src: '/landing-hero/photo11.jpg', alt: 'Guest photo 1' },
                    { src: '/landing-hero/photo12.jpg', alt: 'Guest photo 2' }
                  ].map((img, i) => (
                    <div key={i} className="phone-photo" style={{ background: `linear-gradient(135deg, rgba(252,211,77,0.2), rgba(245,158,11,0.15))`, animationDelay: `${1.2 + i * 0.2}s` }}>
                      <img src={img.src} alt={img.alt} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
