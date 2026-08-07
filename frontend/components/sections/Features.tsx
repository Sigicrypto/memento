"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { QrCode, Zap, DownloadCloud } from 'lucide-react';
import SectionHeader from './SectionHeader';

const features = [
  {
    icon: QrCode,
    color: 'neon-cyan',
    title: 'No App Required',
    desc: 'Guests simply scan a customized QR code to instantly join the gallery via their mobile browser.',
  },
  {
    icon: Zap,
    color: 'neon-magenta',
    title: 'Real-time Sync',
    desc: 'Photos hit the big screen the millisecond they are snapped, creating a live, pulsing heartbeat of your event.',
  },
  {
    icon: DownloadCloud,
    color: 'neon-purple',
    title: 'High-Res Delivery',
    desc: 'After the dust settles, attendees can download high-res versions of their favorite moments.',
  },
];

const colorMap = {
  'neon-cyan': {
    glow: 'bg-neon-cyan/20 group-hover:bg-neon-cyan/40',
    icon: 'text-neon-cyan',
    border: 'group-hover:border-neon-cyan/50',
  },
  'neon-magenta': {
    glow: 'bg-neon-magenta/20 group-hover:bg-neon-magenta/40',
    icon: 'text-neon-magenta',
    border: 'group-hover:border-neon-magenta/50',
  },
  'neon-purple': {
    glow: 'bg-neon-purple/20 group-hover:bg-neon-purple/40',
    icon: 'text-neon-purple',
    border: 'group-hover:border-neon-purple/50',
  },
};

const Features: React.FC = () => {
  return (
    <section id="features" className="lp-section z-20 scroll-mt-32 w-full flex flex-col items-center justify-center">
      <div className="section-container wide-section-container w-full max-w-[1800px] mx-auto px-6 md:px-10">
        <SectionHeader
          badge="Features"
          badgeColor="magenta"
          title="Seamless Integration"
          description="Designed for friction-less sharing, so your guests stay in the moment."
        />

        <motion.div
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
          }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-1 lg:grid-cols-3 items-stretch mt-20 gap-12 lg:gap-16"
        >
          {features.map((feature, i) => {
            const Icon = feature.icon;
            const colors = colorMap[feature.color as keyof typeof colorMap];

            return (
              <motion.div
                key={i}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
                }}
                className="lp-card p-10 md:p-16 group relative overflow-hidden flex flex-col items-start text-left h-full"
              >
                <div className={`absolute -right-12 -top-12 w-40 h-40 blur-[60px] rounded-full transition-all ${colors.glow}`} />
                <div className={`w-16 h-16 rounded-2xl bg-bg-subtle flex items-center justify-center mb-10 border border-border group-hover:scale-110 transition-transform duration-500 shadow-xl ${colors.border}`}>
                  <Icon size={28} className={colors.icon} />
                </div>
                <h3 className="text-2xl lg:text-3xl font-bold mb-4 text-text-primary tracking-tight">{feature.title}</h3>
                <p className="text-text-secondary text-base md:text-lg leading-relaxed max-w-sm">{feature.desc}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default Features;
