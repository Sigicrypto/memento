"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { QrCode, Zap, DownloadCloud } from 'lucide-react';

const Features: React.FC = () => {
  return (
    <section id="features" className="py-24 md:py-32 px-6 md:px-12 max-w-7xl mx-auto relative z-20">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">Seamless Integration</h2>
        <p className="text-white/60 max-w-2xl mx-auto text-lg">Designed for friction-less sharing, so your guests stay in the moment.</p>
      </motion.div>

      <motion.div 
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
        }}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="grid grid-cols-1 md:grid-cols-3 gap-8"
      >
        {/* Card 1 */}
        <motion.div 
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
          }}
          className="glass-panel rounded-2xl p-8 group hover:-translate-y-2 transition-all duration-300 relative overflow-hidden"
        >
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-neon-cyan/20 blur-[50px] rounded-full group-hover:bg-neon-cyan/40 transition-all"></div>
          <div className="w-14 h-14 rounded-full bg-[#1a1a1a] flex items-center justify-center mb-6 border border-white/10 group-hover:border-neon-cyan/50 transition-colors">
            <QrCode size={24} className="text-neon-cyan" />
          </div>
          <h3 className="text-2xl font-semibold mb-3 text-white">No App Required</h3>
          <p className="text-white/60 text-base leading-relaxed">Guests simply scan a customized QR code to instantly join the gallery via their mobile browser.</p>
        </motion.div>

        {/* Card 2 */}
        <motion.div 
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
          }}
          className="glass-panel rounded-2xl p-8 group hover:-translate-y-2 transition-all duration-300 relative overflow-hidden"
        >
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-neon-magenta/20 blur-[50px] rounded-full group-hover:bg-neon-magenta/40 transition-all"></div>
          <div className="w-14 h-14 rounded-full bg-[#1a1a1a] flex items-center justify-center mb-6 border border-white/10 group-hover:border-neon-magenta/50 transition-colors">
            <Zap size={24} className="text-neon-magenta" />
          </div>
          <h3 className="text-2xl font-semibold mb-3 text-white">Real-time Sync</h3>
          <p className="text-white/60 text-base leading-relaxed">Photos hit the big screen the millisecond they are snapped, creating a live, pulsing heartbeat of your event.</p>
        </motion.div>

        {/* Card 3 */}
        <motion.div 
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
          }}
          className="glass-panel rounded-2xl p-8 group hover:-translate-y-2 transition-all duration-300 relative overflow-hidden"
        >
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-neon-purple/20 blur-[50px] rounded-full group-hover:bg-neon-purple/40 transition-all"></div>
          <div className="w-14 h-14 rounded-full bg-[#1a1a1a] flex items-center justify-center mb-6 border border-white/10 group-hover:border-neon-purple/50 transition-colors">
            <DownloadCloud size={24} className="text-neon-purple" />
          </div>
          <h3 className="text-2xl font-semibold mb-3 text-white">High-Quality Downloads</h3>
          <p className="text-white/60 text-base leading-relaxed">After the dust settles, attendees can download high-res versions of their favorite moments.</p>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Features;
