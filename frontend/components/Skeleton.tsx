"use client";

import React from 'react';
import { motion } from 'framer-motion';

export const Skeleton = ({ className }: { className?: string }) => {
  return (
    <div
      className={`relative overflow-hidden bg-white/5 rounded-xl before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent ${className}`}
    />
  );
};

export const SkeletonCard = () => (
  <div className="glass-panel p-6 flex flex-col gap-4">
    <Skeleton className="w-full aspect-video rounded-lg" />
    <Skeleton className="w-3/4 h-6" />
    <Skeleton className="w-1/2 h-4" />
  </div>
);

export const SkeletonText = ({ lines = 3 }: { lines?: number }) => (
  <div className="flex flex-col gap-3 w-full">
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton key={i} className={`h-4 ${i === lines - 1 ? 'w-2/3' : 'w-full'}`} />
    ))}
  </div>
);

export const SkeletonAvatar = ({ size = 12 }: { size?: number }) => (
  <Skeleton className={`w-${size} h-${size} rounded-full`} />
);
