"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, CheckCircle2, QrCode, Sparkles, Upload, Radio, Play } from "lucide-react";
import Image from "next/image";
import { QRCodeSVG } from "qrcode.react";

interface InteractiveHeroDemoProps {
  onOpenDemoModal?: () => void;
}

interface DemoPhoto {
  id: string;
  url: string;
  uploader: string;
  caption: string;
  timeAgo: string;
}

const INITIAL_DEMO_PHOTOS: DemoPhoto[] = [
  {
    id: "demo-1",
    url: "/landing-hero/photo1.jpg",
    uploader: "Priya & Rohan",
    caption: "First dance under the lights ✨",
    timeAgo: "Just now",
  },
  {
    id: "demo-2",
    url: "/landing-hero/photo5.jpg",
    uploader: "Marcus V.",
    caption: "Best wedding party team! 🎉",
    timeAgo: "1 min ago",
  },
  {
    id: "demo-3",
    url: "/landing-hero/photo2.jpg",
    uploader: "Ananya S.",
    caption: "Pure happiness & tears of joy 💖",
    timeAgo: "3 mins ago",
  },
  {
    id: "demo-4",
    url: "/landing-hero/photo8.jpg",
    uploader: "David K.",
    caption: "The stage looks incredible! 🥂",
    timeAgo: "5 mins ago",
  },
  {
    id: "demo-5",
    url: "/landing-hero/photo7.jpg",
    uploader: "Siddharth",
    caption: "Dance floor energy is unmatched 💃",
    timeAgo: "7 mins ago",
  },
  {
    id: "demo-6",
    url: "/landing-hero/photo9.jpg",
    uploader: "Maya & Alex",
    caption: "Toast to the happy couple 🥂",
    timeAgo: "10 mins ago",
  },
];

const DYNAMIC_PHOTO_POOL: Array<Omit<DemoPhoto, 'id'>> = [
  {
    url: "/landing-hero/photo3.jpg",
    uploader: "Vikram R.",
    caption: "Laughter at Table 4! 😂",
    timeAgo: "Just now",
  },
  {
    url: "/landing-hero/photo6.jpg",
    uploader: "Sophie T.",
    caption: "Behind the scenes prep ✨",
    timeAgo: "Just now",
  },
  {
    url: "/landing-hero/photo4.jpg",
    uploader: "Karan M.",
    caption: "Grand entrance moment! 👑",
    timeAgo: "Just now",
  },
  {
    url: "/landing-hero/photo11.jpg",
    uploader: "Jessica P.",
    caption: "Champagne tower cheers! 🍾",
    timeAgo: "Just now",
  },
  {
    url: "/landing-hero/photo12.jpg",
    uploader: "Rahul G.",
    caption: "Unforgettable evening! 🎉",
    timeAgo: "Just now",
  },
];

export default function InteractiveHeroDemo({ onOpenDemoModal }: InteractiveHeroDemoProps) {
  const [phoneState, setPhoneState] = useState<"qr" | "camera" | "uploading" | "success">("qr");
  const [displayedPhotos, setDisplayedPhotos] = useState<DemoPhoto[]>(INITIAL_DEMO_PHOTOS);
  const [photoCount, setPhotoCount] = useState(152);
  const [poolIdx, setPoolIdx] = useState(0);

  const currentPhoto = DYNAMIC_PHOTO_POOL[poolIdx % DYNAMIC_PHOTO_POOL.length];

  useEffect(() => {
    const timer = setInterval(() => {
      setPhoneState((prev) => {
        if (prev === "qr") return "camera";
        if (prev === "camera") return "uploading";
        if (prev === "uploading") {
          const nextPhotoItem = DYNAMIC_PHOTO_POOL[poolIdx % DYNAMIC_PHOTO_POOL.length];
          setDisplayedPhotos((curr) => [
            {
              id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
              url: nextPhotoItem.url,
              uploader: `${nextPhotoItem.uploader} (Live)`,
              caption: nextPhotoItem.caption,
              timeAgo: "Just now",
            },
            ...curr.slice(0, 5),
          ]);
          setPhotoCount((c) => c + 1);
          setPoolIdx((i) => i + 1);
          return "success";
        }
        return "qr";
      });
    }, 3500);

    return () => clearInterval(timer);
  }, [poolIdx]);

  const handleManualUploadTrigger = () => {
    if (onOpenDemoModal) {
      onOpenDemoModal();
    }
  };

  return (
    <section id="demo" className="w-full py-16 px-4 md:px-8 relative overflow-hidden bg-slate-950/60 border-y border-white/5 flex flex-col items-center justify-center">
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[400px] h-[400px] bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[400px] h-[400px] bg-purple-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl w-full mx-auto flex flex-col items-center text-center">
        <div className="text-center mb-10 max-w-2xl mx-auto flex flex-col items-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-extrabold tracking-wider uppercase mb-3">
            <Radio className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
            Live Experience Demonstration
          </span>
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">
            From Phone to Big Screen in Seconds
          </h2>
          <p className="text-slate-400 text-sm md:text-base max-w-xl mx-auto mt-2 font-medium">
            Watch guest uploads appear live on the event wall in real-time. Zero app downloads required.
          </p>
        </div>

        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center justify-center bg-slate-900/60 border border-white/10 rounded-3xl p-6 md:p-10 backdrop-blur-xl shadow-2xl">
          <div className="lg:col-span-5 flex flex-col items-center justify-center w-full">
            <div className="text-xs font-mono uppercase tracking-widest text-slate-400 mb-3 flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Guest Experience (Phone)
            </div>

            <div className="w-full max-w-[290px] h-[520px] bg-black rounded-[40px] p-3 border-4 border-slate-700 shadow-2xl relative flex flex-col overflow-hidden mx-auto">
              <div className="w-28 h-4 bg-slate-800 rounded-b-xl mx-auto mb-2 shrink-0 z-20" />

              <div className="flex-1 bg-slate-950 rounded-[30px] overflow-hidden relative flex flex-col">
                <AnimatePresence mode="wait">
                  {phoneState === "qr" && (
                    <motion.div
                      key="qr"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="flex-1 p-5 flex flex-col items-center justify-center text-center bg-gradient-to-b from-slate-900 to-black"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center mb-4 text-cyan-400">
                        <QrCode size={24} />
                      </div>
                      <h4 className="text-white font-bold text-sm mb-1">Scanning Event QR</h4>
                      <p className="text-slate-400 text-xs mb-6">Camera opens instantly in browser</p>
                      
                      <div className="p-3 bg-white rounded-2xl border-2 border-cyan-400/50 shadow-lg animate-pulse">
                        <QRCodeSVG value="https://mymementoapp.com/demo" size={100} />
                      </div>
                      <span className="text-[10px] font-mono text-cyan-400 mt-4">Scanning code...</span>
                    </motion.div>
                  )}

                  {phoneState === "camera" && (
                    <motion.div
                      key="camera"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="flex-1 relative bg-slate-900 flex flex-col"
                    >
                      <Image
                        src={currentPhoto.url}
                        alt="Camera viewfinder"
                        fill
                        sizes="280px"
                        className="object-cover opacity-90"
                      />
                      <div className="absolute inset-0 border-2 border-dashed border-cyan-400/70 m-4 rounded-2xl pointer-events-none" />
                      
                      <div className="mt-auto p-4 bg-black/60 backdrop-blur-md flex items-center justify-between z-10">
                        <span className="text-xs text-white/80 font-medium">Sarah & Ahmed</span>
                        <div className="w-12 h-12 rounded-full border-4 border-white bg-cyan-500 flex items-center justify-center text-black shadow-lg">
                          <Camera size={20} />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {phoneState === "uploading" && (
                    <motion.div
                      key="uploading"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="flex-1 p-6 flex flex-col items-center justify-center text-center bg-slate-950"
                    >
                      <div className="w-14 h-14 rounded-full bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400 mb-4 animate-bounce">
                        <Upload size={24} />
                      </div>
                      <h4 className="text-white font-bold text-sm mb-1">Sending to Live Wall</h4>
                      <p className="text-slate-400 text-xs mb-4">Compressing & syncing...</p>
                      
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: "0%" }}
                          animate={{ width: "100%" }}
                          transition={{ duration: 2.5 }}
                          className="bg-gradient-to-r from-cyan-400 to-purple-500 h-full"
                        />
                      </div>
                    </motion.div>
                  )}

                  {phoneState === "success" && (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="flex-1 p-6 flex flex-col items-center justify-center text-center bg-slate-950"
                    >
                      <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-emerald-400 mb-4">
                        <CheckCircle2 size={28} />
                      </div>
                      <h4 className="text-white font-bold text-base mb-1">Photo Uploaded!</h4>
                      <p className="text-slate-300 text-xs mb-4">It is now live on the event display wall!</p>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
                        Live Synced
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="mt-3 flex justify-between px-2 text-[10px] text-slate-400 font-mono">
                <span className={phoneState === "qr" ? "text-cyan-400 font-bold" : ""}>1. Scan</span>
                <span className={phoneState === "camera" ? "text-cyan-400 font-bold" : ""}>2. Snap</span>
                <span className={phoneState === "uploading" ? "text-cyan-400 font-bold" : ""}>3. Send</span>
                <span className={phoneState === "success" ? "text-emerald-400 font-bold" : ""}>4. Live</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 flex flex-col w-full">
            <div className="w-full bg-slate-950 border border-white/10 rounded-2xl p-4 md:p-6 shadow-2xl flex flex-col relative overflow-hidden">
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4 flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 text-xs font-black tracking-widest uppercase">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                    MEMENTO LIVE
                  </div>
                  <div>
                    <h3 className="text-white font-extrabold text-base md:text-lg leading-tight">
                      Sarah & Ahmed Reception
                    </h3>
                    <p className="text-slate-400 text-xs">
                      {photoCount} photos · 38 guests · LIVE
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleManualUploadTrigger}
                  className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
                >
                  <Sparkles size={13} />
                  <span>Try Uploading Yourself</span>
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 min-h-[300px]">
                <AnimatePresence>
                  {displayedPhotos.slice(0, 6).map((photo) => (
                    <motion.div
                      key={photo.id}
                      initial={{ opacity: 0, scale: 0.8, y: -20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.5 }}
                      className="group relative aspect-[4/3] rounded-xl overflow-hidden bg-slate-900 border border-white/10 shadow-lg"
                    >
                      <Image
                        src={photo.url}
                        alt={photo.caption}
                        fill
                        sizes="(max-width: 768px) 50vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90" />
                      <div className="absolute bottom-2 left-2 right-2 text-left">
                        <p className="text-white text-xs font-medium truncate">{photo.caption}</p>
                        <p className="text-cyan-400 text-[10px] font-mono">by {photo.uploader}</p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-2">
                  <Play size={12} className="text-cyan-400" /> Auto-slideshow running
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  Sandbox Demo Environment · Customer Data Isolated
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
