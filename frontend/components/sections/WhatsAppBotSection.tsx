import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Zap, ShieldCheck } from 'lucide-react';
import SectionHeader from '@/components/sections/SectionHeader';

export default function WhatsAppBotSection() {
  return (
    <section className="py-24 relative z-10 w-full flex flex-col items-center justify-center border-y border-white/5 bg-gradient-to-b from-slate-950/80 to-emerald-950/20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full">
        <SectionHeader 
          title="Frictionless Entry via WhatsApp"
          badge="QR-LESS JOINING"
          badgeColor="cyan"
          description="Don't want guests squinting at QR codes? Just have them text your dedicated Memento WhatsApp bot. They'll be instantly added to your event gallery."
        />
        
        <div className="mt-16 flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-24">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex-1 max-w-md w-full relative"
          >
            {/* WhatsApp Chat Mockup */}
            <div className="rounded-3xl border border-white/10 bg-[#0b141a] overflow-hidden shadow-2xl">
              <div className="bg-[#202c33] px-4 py-3 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center">
                  <MessageCircle size={20} className="text-white" />
                </div>
                <div>
                  <div className="text-white font-semibold text-sm">Memento Bot</div>
                  <div className="text-emerald-400 text-xs">bot account</div>
                </div>
              </div>
              
              <div className="p-4 flex flex-col gap-4 bg-[url('https://web.whatsapp.com/img/bg-chat-tile-dark_a4be512e7195b6b733d9110b408f075d.png')] bg-cover min-h-[300px]">
                {/* Guest Message */}
                <div className="self-end bg-[#005c4b] text-white rounded-lg rounded-tr-none px-3 py-2 max-w-[80%] shadow-sm text-sm">
                  JOIN SarahAlex26
                  <span className="text-[10px] text-white/60 ml-2 float-right mt-1">12:01 PM</span>
                </div>
                
                {/* Bot Reply */}
                <div className="self-start bg-[#202c33] text-white rounded-lg rounded-tl-none px-3 py-2 max-w-[80%] shadow-sm text-sm">
                  🎉 Welcome to Sarah & Alex's Wedding! 
                  <br/><br/>
                  Tap the link below to instantly open your camera and share photos to the Live Wall. No app required! 📸
                  <br/><br/>
                  <a href="#" className="text-sky-400 font-medium">memento.events/SarahAlex26</a>
                  <span className="text-[10px] text-white/60 ml-2 float-right mt-1">12:01 PM</span>
                </div>
              </div>
            </div>
            
            {/* Decorative Glow */}
            <div className="absolute -inset-4 bg-emerald-500/20 blur-3xl -z-10 rounded-full opacity-50" />
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex-1 flex flex-col gap-8"
          >
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <MessageCircle size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Zero Friction Onboarding</h3>
                <p className="text-slate-400 leading-relaxed">Everyone uses WhatsApp. Give your older guests and relatives a familiar interface to join the fun without scanning codes.</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Zap size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Instant Gallery Access</h3>
                <p className="text-slate-400 leading-relaxed">The bot instantly replies with a secure deep link that auto-authenticates the guest, bypassing any login screens.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Secure & Private</h3>
                <p className="text-slate-400 leading-relaxed">Links generated by the WhatsApp bot are uniquely tied to the guest's phone number, ensuring your private event stays private.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
