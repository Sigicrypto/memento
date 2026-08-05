"use client";

import React from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { QrCode } from "lucide-react";
import Image from "next/image";
import { useAuthModal } from "@/context/AuthModalContext";

interface HeroProps {
  setIsDemoOpen: (val: boolean) => void;
}

const Hero: React.FC<HeroProps> = ({ setIsDemoOpen }) => {
  const { openAuth } = useAuthModal();
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 1000], [0, 200]);
  const y2 = useTransform(scrollY, [0, 1000], [0, 100]);
  const y3 = useTransform(scrollY, [0, 1000], [0, 300]);

  return (
    <section
      className="relative overflow-hidden w-full flex flex-col items-center"
      style={{
        paddingTop: "clamp(8rem, 15vh, 14rem)",
        paddingBottom: "3rem",
        minHeight: "85vh",
      }}
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(600px,90vw)] h-[min(600px,90vw)] bg-neon-purple/20 blur-[120px] rounded-full pointer-events-none" />

      <div className="section-container relative z-10 flex flex-col items-center text-center mt-12 md:mt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="section-badge border-neon-cyan/30 bg-neon-cyan/10 text-neon-cyan mb-8"
        >
          Live Photo Walls
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-5xl md:text-7xl font-bold leading-[1.08] text-white tracking-tight max-w-4xl"
        >
          The Pulse of <span className="text-gradient-neon">Your Event</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="text-white/60 max-w-2xl mx-auto text-lg md:text-xl font-medium mt-8"
        >
          Transform guest photos into a real-time digital masterpiece. No apps,
          no hassle — just pure shared memories synced to the big screen.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-12 mb-20 md:mb-32"
        >
                    <button
            onClick={() => setIsDemoOpen(true)}
            style={{
              paddingLeft: '1rem',
              paddingRight: '1rem',
              paddingTop: '.5rem',
              paddingBottom: '.5rem',
              marginLeft: '0.5rem',
              marginRight: '0.5rem',
            }}
            className="rounded-full bg-gradient-neon text-white text-sm font-bold shadow-[0_0_15px_rgba(168,85,247,0.4)] hover:shadow-[0_0_25px_rgba(168,85,247,0.65)] hover:scale-105 active:scale-95 transition-all duration-200 whitespace-nowrap h-fit"
          >
            Try Demo
          </button>
          <button
            onClick={() => openAuth("signup")}
            style={{
              paddingLeft: '1rem',
              paddingRight: '1rem',
              paddingTop: '.5rem',
              paddingBottom: '.5rem',
              marginLeft: '0.5rem',
              marginRight: '0.5rem',
            }}
            className="rounded-full bg-gradient-neon text-white text-sm font-bold shadow-[0_0_15px_rgba(168,85,247,0.4)] hover:shadow-[0_0_25px_rgba(168,85,247,0.65)] hover:scale-105 active:scale-95 transition-all duration-200 whitespace-nowrap h-fit"
          >
            Get Started
          </button>
        </motion.div>

        {/* Floating UI showcase */}
        <div className="relative w-full max-w-5xl h-[380px] md:h-[480px] mt-56 md:mt-64 perspective-[1000px] hidden sm:block">
          <motion.div
            style={{ y: y1, animationDelay: "0s" }}
            initial={{ opacity: 0, x: -100, rotateY: 15, rotateZ: -10 }}
            animate={{ opacity: 1, x: 0, rotateY: 15, rotateZ: -10 }}
            transition={{ duration: 1.2, delay: 0.6, type: "spring" }}
            className="absolute left-[5%] md:left-[8%] top-24 w-60 md:w-72 h-72 md:h-[360px] glass-panel p-2 rounded-2xl neon-glow-magenta animate-float-3d"
          >
            <div className="w-full h-full rounded-xl overflow-hidden relative">
              <Image
                src="/landing-hero/photo10.jpg"
                alt="Concert Event"
                fill
                priority
                className="object-cover opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            </div>
          </motion.div>

          <motion.div
            style={{ y: y2, animationDelay: "1s" }}
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1, delay: 0.8, type: "spring" }}
            className="absolute left-1/2 top-8 -translate-x-1/2 w-64 md:w-72 h-72 md:h-[360px] glass-panel p-8 rounded-2xl flex items-center justify-center neon-glow z-20 animate-float-3d bg-[#111]"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-neon-cyan/20 blur-[40px] rounded-full" />
              <QrCode size={100} className="text-neon-cyan relative z-10" />
            </div>
          </motion.div>

          <motion.div
            style={{ y: y3, animationDelay: "2s" }}
            initial={{ opacity: 0, x: 100, rotateY: -15, rotateZ: 10 }}
            animate={{ opacity: 1, x: 0, rotateY: -15, rotateZ: 10 }}
            transition={{ duration: 1.2, delay: 1, type: "spring" }}
            className="absolute right-[5%] md:right-[8%] top-16 w-60 md:w-72 h-72 md:h-[360px] glass-panel p-2 rounded-2xl shadow-[0_0_20px_rgba(157,78,221,0.3)] animate-float-3d"
          >
            <div className="w-full h-full rounded-xl overflow-hidden relative">
              <Image
                src="/landing-hero/photo5.jpg"
                alt="Party Event"
                fill
                priority
                className="object-cover opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
