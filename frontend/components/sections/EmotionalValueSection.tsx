"use client";

import React from "react";
import { motion } from "framer-motion";
import { Camera, Heart, Laugh, Sparkles, Music, Smile } from "lucide-react";

export default function EmotionalValueSection() {
  const valuePoints = [
    {
      icon: <Laugh className="w-5 h-5 text-amber-400" />,
      title: "Friends Laughing",
      description: "Unfiltered candids and hilarious inside jokes captured right at the table.",
    },
    {
      icon: <Heart className="w-5 h-5 text-pink-400" />,
      title: "Family Reactions",
      description: "Tears of joy from grandparents and priceless reactions when vows are spoken.",
    },
    {
      icon: <Camera className="w-5 h-5 text-cyan-400" />,
      title: "Behind-the-Scenes",
      description: "The chaos, excitement, and getting-ready stories before the main entrance.",
    },
    {
      icon: <Music className="w-5 h-5 text-purple-400" />,
      title: "Dance-Floor Magic",
      description: "Late-night energy, epic moves, and spontaneous party group shots.",
    },
    {
      icon: <Sparkles className="w-5 h-5 text-emerald-400" />,
      title: "Unexpected Moments",
      description: "The unplanned magic that no single photographer could ever catch alone.",
    },
    {
      icon: <Smile className="w-5 h-5 text-blue-400" />,
      title: "Personal Perspectives",
      description: "Every table, every group, every guest's unique view of your celebration.",
    },
  ];

  return (
    <section className="w-full py-20 px-4 md:px-8 relative bg-slate-950/80 border-b border-white/5 flex flex-col items-center justify-center">
      <div className="max-w-6xl w-full mx-auto flex flex-col items-center text-center">
        
        <span className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-extrabold tracking-wider uppercase mb-4">
          The Full Story of Your Event
        </span>

        <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight max-w-3xl leading-tight">
          Your photographer captures the big moments. <br className="hidden md:inline" />
          <span className="bg-gradient-to-r from-amber-300 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
            Your guests capture everything else.
          </span>
        </h2>

        <p className="text-slate-300 text-sm md:text-base max-w-2xl mt-4 leading-relaxed font-medium">
          Professional photographers focus on planned milestones. Memento brings together the hundreds of unscripted, genuine moments happening all across the room.
        </p>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full mt-12 text-center">
          {valuePoints.map((point, index) => (
            <motion.div
              key={point.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08, duration: 0.5 }}
              className="p-6 rounded-2xl bg-slate-900/60 border border-white/10 hover:border-cyan-500/40 backdrop-blur-md transition-all group shadow-lg flex flex-col items-center text-center"
            >
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                {point.icon}
              </div>
              <h3 className="text-white font-extrabold text-lg mb-2 group-hover:text-cyan-300 transition-colors">
                {point.title}
              </h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                {point.description}
              </p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
