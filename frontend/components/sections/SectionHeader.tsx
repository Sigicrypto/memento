"use client";

import React from 'react';
import { motion } from 'framer-motion';

type BadgeColor = 'cyan' | 'magenta' | 'purple';

const badgeStyles: Record<BadgeColor, string> = {
  cyan: 'border-neon-cyan/30 bg-neon-cyan/10 text-neon-cyan',
  magenta: 'border-neon-magenta/30 bg-neon-magenta/10 text-neon-magenta',
  purple: 'border-neon-purple/30 bg-neon-purple/10 text-neon-purple',
};

interface SectionHeaderProps {
  badge: string;
  badgeColor?: BadgeColor;
  title: React.ReactNode;
  description: string;
  className?: string;
}

export default function SectionHeader({
  badge,
  badgeColor = 'cyan',
  title,
  description,
  className = '',
}: SectionHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      className={`section-header ${className}`}
    >
      <div className={`section-badge ${badgeStyles[badgeColor]}`}>
        {badge}
      </div>
      <h2 className="section-title">{title}</h2>
      <p className="section-desc">{description}</p>
    </motion.div>
  );
}
