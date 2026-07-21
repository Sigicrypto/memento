"use client";

import React, { useState, useRef, useCallback } from 'react';
import { Camera, RefreshCcw, Check, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Webcam from 'react-webcam';

export default function PhotoBoothPage() {
  const { slug } = useParams();
  const router = useRouter();
  const webcamRef = useRef<Webcam>(null);
  
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [overlay, setOverlay] = useState<'none' | 'hearts' | 'stars' | 'frame'>('none');

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) setImgSrc(imageSrc);
  }, [webcamRef]);

  const startCountdown = () => {
    setCountdown(3);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === 1) {
          clearInterval(interval);
          capture();
          return null;
        }
        return prev ? prev - 1 : null;
      });
    }, 1000);
  };

  const uploadPhoto = async () => {
    if (!imgSrc) return;
    setIsUploading(true);
    try {
      const res = await fetch(imgSrc);
      const blob = await res.blob();
      
      const fileName = `booth_${Date.now()}.jpg`;
      const { data, error: uploadError } = await supabase.storage
        .from('photos')
        .upload(`${slug}/${fileName}`, blob, { contentType: 'image/jpeg' });
        
      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('photos')
        .getPublicUrl(`${slug}/${fileName}`);

      // Insert into photos table (requires resolving event_id first, simplified here)
      // Usually would lookup event_id by slug.
      alert('Uploaded successfully!');
      setImgSrc(null);
    } catch (err) {
      console.error(err);
      alert('Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden">
      <div className="absolute top-6 left-6 z-50">
        <button onClick={() => router.back()} className="p-3 bg-black/10 dark:bg-white/10 rounded-full backdrop-blur-md">
          <X size={24} />
        </button>
      </div>

      <div className="relative w-full max-w-4xl aspect-[4/3] bg-zinc-900 rounded-3xl overflow-hidden shadow-2xl">
        <AnimatePresence>
          {countdown !== null && (
            <motion.div 
              initial={{ scale: 0.5, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 1.5, opacity: 0 }}
              className="absolute inset-0 z-40 flex items-center justify-center text-[150px] font-black drop-shadow-2xl"
            >
              {countdown}
            </motion.div>
          )}
        </AnimatePresence>

        {overlay === 'frame' && <div className="absolute inset-0 border-[20px] border-black/20 dark:border-white/20 z-30 pointer-events-none" />}

        {!imgSrc ? (
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            className="w-full h-full object-cover"
            mirrored={true}
          />
        ) : (
          <img src={imgSrc} className="w-full h-full object-cover scale-x-[-1]" alt="Captured" />
        )}

        <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-black/80 to-transparent z-40 flex justify-center gap-6">
          {!imgSrc ? (
            <button 
              onClick={startCountdown}
              disabled={countdown !== null}
              className="w-20 h-20 rounded-full bg-white/20 border-4 border-white flex items-center justify-center hover:bg-white/40 transition-colors"
            >
              <Camera size={32} className="" />
            </button>
          ) : (
            <>
              <button 
                onClick={() => setImgSrc(null)}
                className="px-8 py-4 bg-black/10 dark:bg-white/10 rounded-xl backdrop-blur-md font-bold hover:bg-white/20 transition-colors flex items-center gap-2"
              >
                <RefreshCcw size={20} /> Retake
              </button>
              <button 
                onClick={uploadPhoto}
                disabled={isUploading}
                className="px-8 py-4 bg-primary rounded-xl font-bold hover:bg-primary/90 transition-colors flex items-center gap-2"
              >
                {isUploading ? 'Uploading...' : <><Check size={20} /> Keep Photo</>}
              </button>
            </>
          )}
        </div>
      </div>
      
      <div className="mt-8 flex gap-4">
         <button onClick={() => setOverlay('none')} className={`px-4 py-2 rounded-lg font-bold text-sm ${overlay === 'none' ? 'bg-primary text-white' : 'bg-black/10 dark:bg-white/10 text-white/70'}`}>No Frame</button>
         <button onClick={() => setOverlay('frame')} className={`px-4 py-2 rounded-lg font-bold text-sm ${overlay === 'frame' ? 'bg-primary text-white' : 'bg-black/10 dark:bg-white/10 text-white/70'}`}>Classic Frame</button>
      </div>
    </div>
  );
}
