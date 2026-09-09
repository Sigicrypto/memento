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
    <section id="demo" className="w-full py-20 md:py-28 px-4 md:px-8 relative overflow-hidden bg-bg-subtle border-y border-border flex flex-col items-center justify-center">
      <div className="max-w-7xl w-full mx-auto flex flex-col items-center text-center">
        <div className="text-center mb-10 max-w-2xl mx-auto flex flex-col items-center">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-primary/10 border border-primary/25 text-primary text-xs font-bold tracking-wider uppercase mb-4">
            <Radio className="w-3.5 h-3.5 animate-pulse text-primary" />
            Live Experience Demonstration
          </span>
          <h2 className="text-3xl md:text-5xl font-black text-text-primary tracking-tight font-display">
            From Phone to Big Screen in Seconds
          </h2>
          <p className="text-text-secondary text-sm md:text-base max-w-xl mx-auto mt-3 font-medium leading-relaxed">
            Watch guest uploads appear live on the event wall in real-time. Zero app downloads required.
          </p>
        </div>

        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center justify-center bg-surface border border-border rounded-3xl p-6 md:p-10 shadow-card">
          <div className="lg:col-span-5 flex flex-col items-center justify-center w-full">
            <div className="text-xs font-mono uppercase tracking-widest text-text-secondary mb-3 flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
              Guest Experience (Phone)
            </div>

            <div className="w-full max-w-[290px] h-[520px] bg-neutral-900 rounded-[40px] p-3 border-4 border-neutral-300 shadow-xl relative flex flex-col overflow-hidden mx-auto">
              <div className="w-28 h-4 bg-neutral-800 rounded-b-xl mx-auto mb-2 shrink-0 z-20" />

              <div className="flex-1 bg-white rounded-[30px] overflow-hidden relative flex flex-col">
                <AnimatePresence mode="wait">
                  {phoneState === "qr" && (
                    <motion.div
                      key="qr"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="flex-1 p-5 flex flex-col items-center justify-center text-center bg-gradient-to-b from-stone-50 to-white"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 text-primary">
                        <QrCode size={24} />
                      </div>
                      <h4 className="text-text-primary font-bold text-sm mb-1">Scanning Event QR</h4>
                      <p className="text-text-secondary text-xs mb-6">Camera opens instantly in browser</p>
                      
                      <div className="p-3 bg-white rounded-2xl border-2 border-accent/40 shadow-md">
                        <QRCodeSVG value="https://mymementoapp.com/demo" size={100} />
                      </div>
                      <span className="text-[10px] font-mono text-primary font-bold mt-4 animate-pulse">Scanning code...</span>
                    </motion.div>
                  )}

                  {phoneState === "camera" && (
                    <motion.div
                      key="camera"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="flex-1 relative bg-neutral-900 flex flex-col"
                    >
                      <Image
                        src={currentPhoto.url}
                        alt="Camera viewfinder"
                        fill
                        sizes="280px"
                        className="object-cover opacity-90"
                      />
                      <div className="absolute inset-0 border-2 border-dashed border-accent/70 m-4 rounded-2xl pointer-events-none" />
                      
                      <div className="mt-auto p-4 bg-black/70 backdrop-blur-md flex items-center justify-between z-10">
                        <span className="text-xs text-white/90 font-medium">Priya & Arjun</span>
                        <div className="w-12 h-12 rounded-full border-4 border-white bg-accent flex items-center justify-center text-white shadow-lg">
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
                      className="flex-1 p-6 flex flex-col items-center justify-center text-center bg-stone-50"
                    >
                      <div className="w-14 h-14 rounded-full bg-accent/15 border border-accent/30 flex items-center justify-center text-accent mb-4 animate-bounce">
                        <Upload size={24} />
                      </div>
                      <h4 className="text-text-primary font-bold text-sm mb-1">Sending to Live Wall</h4>
                      <p className="text-text-secondary text-xs mb-4">Compressing & syncing...</p>
                      
                      <div className="w-full bg-neutral-200 h-2 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: "0%" }}
                          animate={{ width: "100%" }}
                          transition={{ duration: 2.5 }}
                          className="bg-accent h-full"
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
                      className="flex-1 p-6 flex flex-col items-center justify-center text-center bg-white"
                    >
                      <div className="w-14 h-14 rounded-full bg-green-100 border border-green-300 flex items-center justify-center text-green-600 mb-4">
                        <CheckCircle2 size={28} />
                      </div>
                      <h4 className="text-text-primary font-bold text-sm mb-1">Photo Uploaded!</h4>
                      <p className="text-text-secondary text-xs mb-4">Look up at the venue screen 🎉</p>
                      <div className="px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-accent font-bold text-[10px]">
                        Live on Screen Now
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="mt-3 flex justify-between px-2 text-[10px] text-neutral-400 font-mono">
                <span className={phoneState === "qr" ? "text-accent font-bold" : ""}>1. Scan</span>
                <span className={phoneState === "camera" ? "text-accent font-bold" : ""}>2. Snap</span>
                <span className={phoneState === "uploading" ? "text-accent font-bold" : ""}>3. Send</span>
                <span className={phoneState === "success" ? "text-green-600 font-bold" : ""}>4. Live</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 flex flex-col w-full">
            <div className="w-full bg-[#1C1917] border border-[#292524] rounded-2xl p-4 md:p-6 shadow-2xl flex flex-col relative overflow-hidden">
              <div className="flex items-center justify-between pb-4 border-b border-neutral-800 mb-4 flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 text-xs font-black tracking-widest uppercase">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                    MEMENTO LIVE
                  </div>
                  <div>
                    <h3 className="text-white font-extrabold text-base md:text-lg leading-tight">
                      Priya & Arjun Reception
                    </h3>
                    <p className="text-neutral-400 text-xs">
                      {photoCount} photos · 184 guests · LIVE
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleManualUploadTrigger}
                  className="px-4 py-2 rounded-full bg-accent hover:bg-[#D9932B] text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles size={13} />
                  <span>Try Uploading Yourself</span>
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 min-h-[300px]">
                <AnimatePresence>
                  {displayedPhotos.slice(0, 6).map((photo, idx) => (
                    <motion.div
                      key={photo.id}
                      initial={{ opacity: 0, scale: 0.8, y: -20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.5 }}
                      className={`group relative aspect-[4/3] rounded-xl overflow-hidden bg-neutral-900 border shadow-lg ${
                        idx === 0
                          ? 'border-accent ring-2 ring-accent/30 shadow-[0_0_12px_rgba(242,169,59,0.4)]'
                          : 'border-white/10'
                      }`}
                    >
                      <Image
                        src={photo.url}
                        alt={photo.caption}
                        fill
                        sizes="(max-width: 768px) 50vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent opacity-90" />
                      
                      {idx === 0 && (
                        <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-accent text-white text-[9px] font-bold flex items-center gap-1 shadow">
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                          Just Landed
                        </div>
                      )}

                      <div className="absolute bottom-2 left-2 right-2 text-left">
                        <p className="text-white text-xs font-medium truncate">{photo.caption}</p>
                        <p className="text-accent text-[10px] font-mono">by {photo.uploader}</p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <div className="mt-4 pt-3 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
                <span className="flex items-center gap-2">
                  <Play size={12} className="text-accent" /> Auto-slideshow running
                </span>
                <span className="text-[11px] font-mono text-neutral-400">
                  Venue Display Mode · 4K Sync
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
