"use client";

import React from 'react';
import { motion } from 'framer-motion';

export const BackgroundBeams = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]">
      <div className="absolute inset-0 bg-[url('https://ui.aceternity.com/_next/static/media/grid.864c0920.svg')] opacity-[0.05] dark:opacity-[0.03] invert dark:invert-0 bg-center [mask-image:linear-gradient(to_bottom,white,transparent)]" />
      <div className="absolute w-full h-full">
        <motion.div
          animate={{
            transform: [
              "translateY(0px) translateX(0px)",
              "translateY(-20px) translateX(20px)",
              "translateY(0px) translateX(0px)",
            ],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-accent-cyan/20 blur-[100px] rounded-full pointer-events-none mix-blend-multiply dark:mix-blend-screen"
        />
        <motion.div
          animate={{
            transform: [
              "translateY(0px) translateX(0px)",
              "translateY(20px) translateX(-20px)",
              "translateY(0px) translateX(0px)",
            ],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-accent-indigo/20 blur-[80px] rounded-full pointer-events-none mix-blend-multiply dark:mix-blend-screen"
        />
      </div>
    </div>
  );
};
