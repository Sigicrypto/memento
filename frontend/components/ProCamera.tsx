"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, X, RefreshCw, Flashlight, FlashlightOff, Image as ImageIcon, Check, RotateCcw } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { extractFaceDescriptorRobust, fileToImage } from '@/lib/faceEngine';

type AspectRatioType = '4:3' | '1:1' | '16:9' | '9:16';
type FilterType = 'original' | 'bw' | 'cinematic' | 'vintage' | 'polaroid' | 'cyberpunk' | 'dreamy' | 'golden' | 'cool' | 'vivid';

const FILTERS: Record<FilterType, { label: string; css: string; emoji: string }> = {
  original: { label: 'Original', css: 'none', emoji: '📷' },
  bw: { label: 'B&W Noir', css: 'grayscale(1) contrast(1.2)', emoji: '🖤' },
  cinematic: { label: 'Cinematic', css: 'saturate(1.28) contrast(1.12)', emoji: '🎬' },
  vintage: { label: 'Vintage', css: 'sepia(0.22) contrast(1.08) saturate(1.12) hue-rotate(-6deg)', emoji: '🕰️' },
  polaroid: { label: 'Polaroid', css: 'sepia(0.4) contrast(0.85) blur(0.5px)', emoji: '🎞️' },
  cyberpunk: { label: 'Cyberpunk', css: 'contrast(1.3) saturate(1.5) hue-rotate(-15deg)', emoji: '🌃' },
  dreamy: { label: 'Dreamy', css: 'brightness(1.1) contrast(0.9) blur(1px)', emoji: '✨' },
  golden: { label: 'Golden Hour', css: 'sepia(0.3) brightness(1.05) saturate(1.2)', emoji: '🌅' },
  cool: { label: 'Cool', css: 'saturate(0.9) hue-rotate(10deg)', emoji: '❄️' },
  vivid: { label: 'Vivid', css: 'saturate(1.5) contrast(1.1)', emoji: '🎉' }
};

interface ProCameraProps {
  eventId?: string;
  eventSlug?: string;
  eventName?: string;
  isProUser?: boolean;
  onPhotoUploaded?: (photoId: string) => void;
  onClose?: () => void;
}

export default function ProCamera({
  eventId,
  eventName = 'Memento Event',
  onPhotoUploaded,
  onClose,
}: ProCameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const viewfinderRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [activeTrack, setActiveTrack] = useState<MediaStreamTrack | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [isLoadingCamera, setIsLoadingCamera] = useState<boolean>(true);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Settings
  const [activeFilter, setActiveFilter] = useState<FilterType>('original');
  const [aspectRatio, setAspectRatio] = useState<AspectRatioType>('4:3');
  const [torchOn, setTorchOn] = useState<boolean>(false);
  const [hasTorchCaps, setHasTorchCaps] = useState<boolean>(false);

  // Focus UI
  const [focusTargetPos, setFocusTargetPos] = useState<{ x: number; y: number } | null>(null);

  // Capture & Upload State
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
  const [capturedPreviewUrl, setCapturedPreviewUrl] = useState<string | null>(null);
  const [uploaderName, setUploaderName] = useState<string>('');
  const [caption, setCaption] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadSuccess, setUploadSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('memento_guest_name') || '';
      if (saved) setUploaderName(saved);
    }
  }, []);

  const stopCameraStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  const initCamera = useCallback(async (forceFacingMode?: 'user' | 'environment') => {
    setIsLoadingCamera(true);
    setCameraError(null);
    stopCameraStream();

    try {
      const targetFacing = forceFacingMode || facingMode;
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: targetFacing } },
        audio: false,
      });

      streamRef.current = newStream;
      setStream(newStream);

      const track = newStream.getVideoTracks()[0];
      if (track) {
        setActiveTrack(track);
        try {
          const caps: any = track.getCapabilities();
          setHasTorchCaps('torch' in caps);
        } catch (e) {}
      }

      if (videoRef.current) {
        const video = videoRef.current;
        video.srcObject = newStream;
        video.onloadedmetadata = () => {
          video.play().catch(() => {});
        };
        video.play().catch(() => {});
      }
      setIsLoadingCamera(false);
    } catch (err: any) {
      console.warn('Camera getUserMedia error:', err);
      setCameraError(err?.message || 'Camera permission required.');
      setIsLoadingCamera(false);
    }
  }, [facingMode, stopCameraStream]);

  useEffect(() => {
    initCamera();
    return () => stopCameraStream();
  }, [initCamera, stopCameraStream]);

  // Apply CSS Filter to Live Viewfinder
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.style.filter = FILTERS[activeFilter].css;
    }
  }, [activeFilter]);

  const toggleCameraFacingMode = () => {
    const nextFacing = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextFacing);
    initCamera(nextFacing);
  };

  const toggleTorch = async () => {
    if (!activeTrack || !hasTorchCaps) return;
    try {
      const nextTorch = !torchOn;
      await activeTrack.applyConstraints({ advanced: [{ torch: nextTorch }] } as any);
      setTorchOn(nextTorch);
    } catch (e) {}
  };

  const handleViewfinderClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!viewfinderRef.current) return;
    const rect = viewfinderRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setFocusTargetPos({ x, y });
    setTimeout(() => setFocusTargetPos(null), 2000);
  };

  const playShutterSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, audioCtx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.04);
    } catch (e) {}
  };

  const handleShutterTap = () => {
    if (cameraError) {
      if (fileInputRef.current) fileInputRef.current.click();
      return;
    }

    if (!videoRef.current) return;

    playShutterSound();
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate([45]);

    try {
      const video = videoRef.current;
      const baseWidth = video.videoWidth || 1920;
      const baseHeight = video.videoHeight || 1080;
      
      const canvas = document.createElement('canvas');
      canvas.width = baseWidth;
      canvas.height = baseHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        if (facingMode === 'user') {
          ctx.translate(baseWidth, 0);
          ctx.scale(-1, 1);
        }

        const cssFilter = FILTERS[activeFilter].css;
        if (cssFilter !== 'none') {
          ctx.filter = cssFilter;
        }

        ctx.drawImage(video, 0, 0, baseWidth, baseHeight);
        ctx.filter = 'none';

        canvas.toBlob((blob) => {
          if (blob) {
            setCapturedBlob(blob);
            setCapturedPreviewUrl(URL.createObjectURL(blob));
          }
        }, 'image/jpeg', 0.92);
      }
    } catch (err) {
      if (fileInputRef.current) fileInputRef.current.click();
    }
  };

  const handleUploadPhoto = async () => {
    if (!capturedBlob || !eventId) return;
    setIsUploading(true);

    try {
      const filename = `memento_upload_${eventId}_${Date.now()}.jpg`;
      const storagePath = `${eventId}/${filename}`;

      const { error: storageErr } = await supabase.storage.from('photos').upload(storagePath, capturedBlob, {
        contentType: 'image/jpeg',
      });
      if (storageErr) throw storageErr;

      const { data: inserted, error: dbErr } = await supabase.from('photos').insert({
        event_id: eventId,
        storage_path: storagePath,
        uploader_name: uploaderName.trim() || 'Guest',
        caption: caption.trim() || null,
        media_type: 'image',
        approved: true,
      }).select().single();

      if (dbErr) throw dbErr;

      // Extract Face
      try {
        const fileObj = new File([capturedBlob], filename, { type: 'image/jpeg' });
        const imgEl = await fileToImage(fileObj);
        const descriptor = await extractFaceDescriptorRobust(imgEl, 'ssd');
        if (descriptor && inserted) {
          await supabase.from('photo_faces').insert({
            photo_id: inserted.id,
            event_id: eventId,
            descriptor: Array.from(descriptor),
          });
        }
      } catch (faceErr) {}

      setUploadSuccess(true);
      if (uploaderName.trim()) localStorage.setItem('memento_guest_name', uploaderName.trim());

      if (onPhotoUploaded && inserted) onPhotoUploaded(inserted.id);

      setTimeout(() => {
        setCapturedBlob(null);
        setCapturedPreviewUrl(null);
        setUploadSuccess(false);
        setIsUploading(false);
        setCaption('');
      }, 1500);
    } catch (err: any) {
      alert(err.message || 'Upload failed');
      setIsUploading(false);
    }
  };

  const handleFallbackFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCapturedBlob(file);
    setCapturedPreviewUrl(URL.createObjectURL(file));
  };

  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case '1:1': return 'aspect-square w-full max-w-md mx-auto';
      case '16:9': return 'aspect-video w-full max-w-md mx-auto';
      case '9:16': return 'w-full h-full';
      default: return 'w-full h-full';
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] bg-black text-white flex flex-col justify-between overflow-hidden select-none font-sans h-[100dvh] w-vw">
      
      <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={handleFallbackFileSelect} className="hidden" />

      {/* Top Header */}
      <div className="absolute top-0 inset-x-0 z-30 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/80 to-transparent pt-safe">
        <button onClick={onClose} className="p-2 rounded-full bg-black/60 border border-white/10 text-white/90 hover:text-white backdrop-blur active:scale-95 transition">
          <X size={20} />
        </button>
        
        {hasTorchCaps && (
          <button onClick={toggleTorch} className={`p-2 rounded-full border backdrop-blur active:scale-95 transition ${torchOn ? 'bg-amber-400 text-black border-amber-300 shadow-lg shadow-amber-500/30' : 'bg-black/60 text-white/80 border-white/10'}`}>
            {torchOn ? <Flashlight size={18} /> : <FlashlightOff size={18} />}
          </button>
        )}
      </div>

      {/* Viewfinder Area */}
      <div ref={viewfinderRef} onClick={handleViewfinderClick} className="relative flex-grow w-full h-full bg-zinc-950 overflow-hidden flex items-center justify-center cursor-crosshair">
        {isLoadingCamera && (
          <div className="flex flex-col items-center gap-3 text-zinc-400">
            <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-medium">Starting Camera...</p>
          </div>
        )}

        {cameraError && (
          <div className="p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto">
              <Camera size={24} />
            </div>
            <p className="text-sm font-medium text-red-300">{cameraError}</p>
            <button onClick={() => fileInputRef.current?.click()} className="px-5 py-3 rounded-2xl bg-cyan-400 text-black font-extrabold text-xs uppercase shadow-lg hover:bg-cyan-300">
              Pick from Gallery
            </button>
          </div>
        )}

        <div className={`relative transition-all duration-300 ${getAspectRatioClass()}`}>
          <video 
            ref={videoRef}
            playsInline
            muted
            autoPlay
            className={`w-full h-full object-cover transition-opacity duration-300 ${facingMode === 'user' ? 'scale-x-[-1]' : ''} ${isLoadingCamera || cameraError ? 'opacity-0' : 'opacity-100'}`}
          />
        </div>

        {/* Touch Focus Indicator */}
        {focusTargetPos && (
          <div className="absolute pointer-events-none z-30 flex items-center justify-center transition-all animate-pulse" style={{ left: focusTargetPos.x - 30, top: focusTargetPos.y - 30 }}>
            <div className="w-16 h-16 border-2 border-yellow-400 rounded-lg shadow-lg" />
          </div>
        )}
      </div>

      {/* Bottom Controls Dock */}
      <div className="relative z-30 bg-black/80 backdrop-blur-xl border-t border-white/10 pt-2 pb-safe px-3 space-y-3">
        
        {/* Quick Filters Ribbon */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 px-1">
          {(Object.keys(FILTERS) as FilterType[]).map((key) => {
            const filter = FILTERS[key];
            return (
              <button
                key={key}
                onClick={() => setActiveFilter(key)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 border shrink-0 ${
                  activeFilter === key ? 'bg-cyan-400 text-black border-cyan-300 shadow-md shadow-cyan-500/20 scale-105' : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:text-white'
                }`}
              >
                <span>{filter.emoji}</span>
                <span>{filter.label}</span>
              </button>
            );
          })}
        </div>

        {/* Aspect Ratio Selector */}
        <div className="flex items-center justify-center gap-2">
          {(['4:3', '1:1', '16:9', '9:16'] as AspectRatioType[]).map((ar) => (
            <button
              key={ar}
              onClick={() => setAspectRatio(ar)}
              className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold transition ${
                aspectRatio === ar ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {ar}
            </button>
          ))}
        </div>

        {/* Shutter Area */}
        <div className="flex items-center justify-between px-6 pb-2">
          <button onClick={() => fileInputRef.current?.click()} className="p-3 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white">
            <ImageIcon size={22} />
          </button>

          <button onClick={handleShutterTap} className="w-16 h-16 rounded-full border-4 border-white/90 p-1 flex items-center justify-center active:scale-90 transition shadow-2xl">
            <div className="w-full h-full rounded-full bg-white active:bg-cyan-400 transition-colors shadow-inner" />
          </button>

          <button onClick={toggleCameraFacingMode} className="p-3 rounded-full bg-cyan-500/20 border border-cyan-400/50 text-cyan-300 hover:text-white active:scale-90 transition">
            <RefreshCw size={22} />
          </button>
        </div>
      </div>

      {/* Photo Review & Upload Modal */}
      <AnimatePresence>
        {capturedPreviewUrl && (
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className="fixed inset-0 z-[2200] bg-black flex flex-col p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-2 mt-safe">
              <span className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Review & Post</span>
              <button onClick={() => { setCapturedBlob(null); setCapturedPreviewUrl(null); }} className="p-2 rounded-full bg-zinc-900 text-zinc-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="relative flex-grow my-2 rounded-2xl overflow-hidden bg-zinc-900 flex items-center justify-center max-h-[50vh]">
              <img src={capturedPreviewUrl} alt="Captured" className="w-full h-full object-contain" />
              {uploadSuccess && (
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3 text-emerald-400">
                  <Check size={56} className="animate-bounce" />
                  <p className="text-lg font-bold">Posted to Wall!</p>
                </div>
              )}
            </div>

            <div className="space-y-4 max-w-lg mx-auto w-full mt-4">
              <div className="space-y-3">
                <input 
                  type="text" 
                  placeholder="Your Name (Optional)" 
                  value={uploaderName}
                  onChange={(e) => setUploaderName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-400"
                />
                <textarea 
                  placeholder="Add a caption..." 
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-400 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2 pb-safe">
                <button onClick={() => { setCapturedBlob(null); setCapturedPreviewUrl(null); }} className="flex-1 py-4 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 font-bold hover:bg-zinc-800 flex items-center justify-center gap-2">
                  <RotateCcw size={18} /> Retake
                </button>

                <button 
                  onClick={handleUploadPhoto}
                  disabled={isUploading}
                  className="flex-[2] py-4 rounded-xl bg-cyan-400 text-black font-extrabold text-sm uppercase flex items-center justify-center gap-2 hover:bg-cyan-300 shadow-lg shadow-cyan-500/20 disabled:opacity-50"
                >
                  {isUploading ? 'Uploading...' : '🚀 Upload to Wall'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
