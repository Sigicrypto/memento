"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, FlipHorizontal, Flashlight, FlashlightOff, Sliders, Settings, 
  X, Check, RotateCcw, Upload, Lock, Sparkles, Eye, Sun, Grid, Compass, 
  Activity, Zap, Info, ChevronUp, ChevronDown, Image as ImageIcon, Volume2, 
  VolumeX, Shield, SlidersHorizontal, Layers, Film, Crop, Radio, Target, MoveVertical, Focus
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { extractFaceDescriptorRobust, fileToImage } from '@/lib/faceEngine';
import { 
  detectTrackCapabilities, analyzeFrameV2, computeViewportCSSFilter, EVENT_PRESETS, FILM_STYLES,
  EventPresetKey, FilmStyleKey, DeviceCapabilitiesSummary, RealtimeV2Analysis 
} from '@/lib/aiCameraAdvisor';
import ProCameraUpgradeModal from '@/components/ProCameraUpgradeModal';

export type ShootingMode = 'AUTO' | 'PRO' | 'PORTRAIT' | 'EVENT' | 'LOW LIGHT' | 'PRODUCT' | 'DOCUMENT';
export type AspectRatioType = '4:3' | '1:1' | '16:9' | '9:16';
export type PeakingColor = '#00e5ff' | '#00ffaa' | '#ff0077' | '#ffff00' | '#ff3300';

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
  eventSlug,
  eventName = 'Memento Event',
  isProUser = false,
  onPhotoUploaded,
  onClose,
}: ProCameraProps) {
  // ── Camera Stream & Canvas Refs ──
  const videoRef = useRef<HTMLVideoElement>(null);
  const viewfinderRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const histogramCanvasRef = useRef<HTMLCanvasElement>(null);
  const peakingCanvasRef = useRef<HTMLCanvasElement>(null);
  const zebraCanvasRef = useRef<HTMLCanvasElement>(null);
  const v2AnalysisCanvasRef = useRef<HTMLCanvasElement>(null);
  const loupeCanvasRef = useRef<HTMLCanvasElement>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [activeTrack, setActiveTrack] = useState<MediaStreamTrack | null>(null);
  const [cameraDevices, setCameraDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isLoadingCamera, setIsLoadingCamera] = useState<boolean>(true);

  // Capabilities
  const [capabilities, setCapabilities] = useState<DeviceCapabilitiesSummary>({
    hasISO: false, hasShutterSpeed: false, hasFocusMode: false, hasFocusDistance: false,
    hasWhiteBalance: false, hasColorTemperature: false, hasExposureCompensation: false,
    hasZoom: false, hasTorch: false, cameraCount: 1,
  });

  // ── Camera Settings ──
  const [shootingMode, setShootingMode] = useState<ShootingMode>('AUTO');
  const [activePresetKey, setActivePresetKey] = useState<EventPresetKey>('wedding');
  const [activeFilmStyle, setActiveFilmStyle] = useState<FilmStyleKey>('process_zero');
  const [aspectRatio, setAspectRatio] = useState<AspectRatioType>('4:3');
  const [lensZoom, setLensZoom] = useState<number>(1);

  // Manual Controls
  const [iso, setIso] = useState<number>(400);
  const [shutterSpeed, setShutterSpeed] = useState<string>('1/125');
  const [exposureCompensation, setExposureCompensation] = useState<number>(0);
  const [wbMode, setWbMode] = useState<'auto' | 'daylight' | 'cloudy' | 'tungsten' | 'fluorescent' | 'manual'>('auto');
  const [colorTemperature, setColorTemperature] = useState<number>(5500);
  const [wbTint, setWbTint] = useState<number>(0);
  const [focusMode, setFocusMode] = useState<'auto' | 'manual'>('auto');
  const [focusDistance, setFocusDistance] = useState<number>(0.5);
  const [isFocusLoupeVisible, setIsFocusLoupeVisible] = useState<boolean>(false);

  // Touch Target Box
  const [focusTargetPos, setFocusTargetPos] = useState<{ x: number; y: number } | null>(null);
  const [showTargetSunSlider, setShowTargetSunSlider] = useState<boolean>(false);
  const touchStartPos = useRef<{ x: number; y: number; ev: number; focus: number } | null>(null);

  // Toggles & HUD
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [showLevel, setShowLevel] = useState<boolean>(true);
  const [showHistogram, setShowHistogram] = useState<boolean>(false);
  const [showFocusPeaking, setShowFocusPeaking] = useState<boolean>(false);
  const [peakingColor, setPeakingColor] = useState<PeakingColor>('#00e5ff');
  const [showZebra, setShowZebra] = useState<boolean>(false);
  const [zebraThreshold, setZebraThreshold] = useState<number>(240);
  const [mirrorFront, setMirrorFront] = useState<boolean>(true);
  const [photoFormat, setPhotoFormat] = useState<'JPEG' | 'HEIF' | 'RAW+JPEG'>('JPEG');
  const [torchOn, setTorchOn] = useState<boolean>(false);
  const [selfTimer, setSelfTimer] = useState<number>(0);
  const [timerCountdown, setTimerCountdown] = useState<number | null>(null);
  const [hapticsEnabled, setHapticsEnabled] = useState<boolean>(true);
  const [shutterSoundEnabled, setShutterSoundEnabled] = useState<boolean>(true);

  // UI Panels State
  const [showSettingsDrawer, setShowSettingsDrawer] = useState<boolean>(false);
  const [showPresetsPanel, setShowPresetsPanel] = useState<boolean>(false);
  const [showFilmStylePanel, setShowFilmStylePanel] = useState<boolean>(false);
  const [showGuidedBanner, setShowGuidedBanner] = useState<boolean>(true);
  const [activeManualControlTab, setActiveManualControlTab] = useState<'iso' | 'shutter' | 'ev' | 'wb' | 'focus' | 'tint' | null>(null);

  // Upgrade Modal
  const [showUpgradeModal, setShowUpgradeModal] = useState<boolean>(false);
  const [upgradeReason, setUpgradeReason] = useState<string>('Pro Camera');

  // Realtime Gyro/Level State
  const [rollAngle, setRollAngle] = useState<number>(0);

  // Realtime V2 Scene Analysis State (Throttled)
  const [v2Analysis, setV2Analysis] = useState<RealtimeV2Analysis>({
    luminance: 128, isLowLight: false, isOverexposed: false, isBacklit: false, motionScore: 0, recommendation: 'Analyzing scene...',
  });

  // Capture & Upload State
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
  const [capturedPreviewUrl, setCapturedPreviewUrl] = useState<string | null>(null);
  const [uploaderName, setUploaderName] = useState<string>('');
  const [caption, setCaption] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadSuccess, setUploadSuccess] = useState<boolean>(false);

  // ── Synthetic Audio Shutter Click ──
  const playShutterSound = useCallback(() => {
    if (!shutterSoundEnabled) return;
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
  }, [shutterSoundEnabled]);

  // ── Device Gyro Listener ──
  useEffect(() => {
    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.gamma !== null) setRollAngle(Math.round(e.gamma));
    };
    if (typeof window !== 'undefined' && 'DeviceOrientationEvent' in window) {
      window.addEventListener('deviceorientation', handleOrientation);
    }
    return () => {
      if (typeof window !== 'undefined' && 'DeviceOrientationEvent' in window) {
        window.removeEventListener('deviceorientation', handleOrientation);
      }
    };
  }, []);

  // Saved Uploader Name
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('memento_guest_name') || '';
      if (saved) setUploaderName(saved);
    }
  }, []);

  // Live Viewfinder CSS Filter Updates (DOM Ref Direct Assignment)
  useEffect(() => {
    if (videoRef.current) {
      const filterStr = computeViewportCSSFilter(exposureCompensation, iso, colorTemperature, wbTint, activeFilmStyle);
      videoRef.current.style.filter = filterStr;
    }
  }, [exposureCompensation, iso, colorTemperature, wbTint, activeFilmStyle]);

  // ── Camera Initialization & Stream Handling (Fix Stream Ref Loop Bug!) ──
  const stopCameraStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  const initCamera = useCallback(async (deviceId?: string) => {
    setIsLoadingCamera(true);
    setCameraError(null);
    stopCameraStream();

    try {
      let videoDevs: MediaDeviceInfo[] = [];
      if (navigator.mediaDevices && typeof navigator.mediaDevices.enumerateDevices === 'function') {
        const devices = await navigator.mediaDevices.enumerateDevices();
        videoDevs = devices.filter((d) => d.kind === 'videoinput');
        setCameraDevices(videoDevs);
      }

      const targetId = deviceId || (videoDevs.find((d) => d.label.toLowerCase().includes('back') || d.label.toLowerCase().includes('environment'))?.deviceId || videoDevs[0]?.deviceId);

      const videoConstraints: any = targetId
        ? { deviceId: targetId }
        : { facingMode: 'environment' };

      const newStream = await navigator.mediaDevices.getUserMedia({
        video: videoConstraints,
        audio: false,
      });

      streamRef.current = newStream;
      setStream(newStream);

      const track = newStream.getVideoTracks()[0];
      if (track) {
        setActiveTrack(track);
        const caps = detectTrackCapabilities(track);
        caps.cameraCount = videoDevs.length;
        setCapabilities(caps);
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
      setCameraError(err?.message || 'Camera permission required. Tap below to select or take photo.');
      setIsLoadingCamera(false);
    }
  }, [stopCameraStream]);

  // Run camera initialization ONCE on mount or when selectedDeviceId changes
  useEffect(() => {
    initCamera(selectedDeviceId);
    return () => {
      stopCameraStream();
    };
  }, [selectedDeviceId, initCamera, stopCameraStream]);

  // Apply track constraints dynamically
  const applyCameraConstraints = useCallback(async (overrides: Record<string, any>) => {
    if (!activeTrack || typeof activeTrack.applyConstraints !== 'function') return;
    try {
      const advancedConstraints: any = {};
      if ('iso' in overrides && capabilities.hasISO) advancedConstraints.iso = overrides.iso;
      if ('exposureCompensation' in overrides && capabilities.hasExposureCompensation) advancedConstraints.exposureCompensation = overrides.exposureCompensation;
      if ('focusMode' in overrides && capabilities.hasFocusMode) advancedConstraints.focusMode = overrides.focusMode;
      if ('focusDistance' in overrides && capabilities.hasFocusDistance) advancedConstraints.focusDistance = overrides.focusDistance;
      if ('whiteBalanceMode' in overrides && capabilities.hasWhiteBalance) advancedConstraints.whiteBalanceMode = overrides.whiteBalanceMode;
      if ('colorTemperature' in overrides && capabilities.hasColorTemperature) advancedConstraints.colorTemperature = overrides.colorTemperature;
      if ('zoom' in overrides && capabilities.hasZoom) advancedConstraints.zoom = overrides.zoom;
      if ('torch' in overrides && capabilities.hasTorch) advancedConstraints.torch = overrides.torch;

      if (Object.keys(advancedConstraints).length > 0) {
        await activeTrack.applyConstraints({ advanced: [advancedConstraints] } as any);
      }
    } catch (e) {}
  }, [activeTrack, capabilities]);

  const toggleTorch = async () => {
    const nextTorch = !torchOn;
    setTorchOn(nextTorch);
    await applyCameraConstraints({ torch: nextTorch });
  };

  const switchCameraLens = (zoomMultiplier: number) => {
    setLensZoom(zoomMultiplier);
    if (capabilities.hasZoom) {
      applyCameraConstraints({ zoom: zoomMultiplier });
    } else if (cameraDevices.length > 1) {
      const targetIndex = zoomMultiplier === 0.5 ? 0 : zoomMultiplier >= 2 ? cameraDevices.length - 1 : 1;
      const targetDev = cameraDevices[targetIndex] || cameraDevices[0];
      if (targetDev && targetDev.deviceId !== selectedDeviceId) {
        setSelectedDeviceId(targetDev.deviceId);
      }
    }
  };

  const requirePro = (featureName: string, action: () => void) => {
    if (isProUser) {
      action();
    } else {
      setUpgradeReason(featureName);
      setShowUpgradeModal(true);
    }
  };

  const applyPreset = (presetKey: EventPresetKey) => {
    const preset = EVENT_PRESETS[presetKey];
    if (!preset) return;
    setActivePresetKey(presetKey);

    const s = preset.settings;
    if (s.iso) setIso(s.iso);
    if (s.shutterSpeed) setShutterSpeed(s.shutterSpeed);
    if (s.exposureCompensation !== undefined) setExposureCompensation(s.exposureCompensation);
    if (s.colorTemperature) setColorTemperature(s.colorTemperature);
    if (s.tint !== undefined) setWbTint(s.tint);
    if (s.focusMode) setFocusMode(s.focusMode);

    applyCameraConstraints({
      iso: s.iso,
      exposureCompensation: s.exposureCompensation,
      colorTemperature: s.colorTemperature,
      focusMode: s.focusMode,
    });
  };

  // ── Fallback Camera Roll File Input Handler ──
  const handleFallbackFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const blob = file.slice(0, file.size, file.type);
    setCapturedBlob(blob);
    setCapturedPreviewUrl(URL.createObjectURL(file));
  };

  // ── Touch Gesture Handlers ──
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      touchStartPos.current = {
        x: touch.clientX,
        y: touch.clientY,
        ev: exposureCompensation,
        focus: focusDistance,
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!touchStartPos.current || e.touches.length !== 1) return;
    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStartPos.current.x;
    const deltaY = touch.clientY - touchStartPos.current.y;

    if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 10) {
      const evChange = -Number((deltaY / 100).toFixed(1));
      const newEV = Math.max(-3, Math.min(3, Number((touchStartPos.current.ev + evChange).toFixed(1))));
      setExposureCompensation(newEV);
      applyCameraConstraints({ exposureCompensation: newEV });
    } else if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
      setIsFocusLoupeVisible(true);
      setFocusMode('manual');
      const focusChange = Number((deltaX / 300).toFixed(2));
      const newFocus = Math.max(0, Math.min(1, Number((touchStartPos.current.focus + focusChange).toFixed(2))));
      setFocusDistance(newFocus);
      applyCameraConstraints({ focusDistance: newFocus });
    }
  };

  const handleTouchEnd = () => {
    touchStartPos.current = null;
    setTimeout(() => setIsFocusLoupeVisible(false), 800);
  };

  const handleViewfinderClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!viewfinderRef.current) return;
    const rect = viewfinderRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setFocusTargetPos({ x, y });
    setShowTargetSunSlider(true);
    if (hapticsEnabled && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([20]);
    }

    setTimeout(() => {
      setShowTargetSunSlider(false);
    }, 3500);
  };

  // ── Throttled Overlays Loop ──
  const lastAnalysisTime = useRef<number>(0);

  useEffect(() => {
    let animId: number;

    const processFrame = () => {
      if (videoRef.current && videoRef.current.readyState === 4) {
        const video = videoRef.current;
        const now = Date.now();

        if (now - lastAnalysisTime.current > 1000 && v2AnalysisCanvasRef.current) {
          lastAnalysisTime.current = now;
          const res = analyzeFrameV2(v2AnalysisCanvasRef.current, video);
          setV2Analysis((prev) => (prev.recommendation !== res.recommendation ? res : prev));
        }

        if (showHistogram && histogramCanvasRef.current) {
          drawHistogram(video, histogramCanvasRef.current);
        }

        if (showFocusPeaking && peakingCanvasRef.current) {
          drawFocusPeakingV2(video, peakingCanvasRef.current, peakingColor);
        }

        if (showZebra && zebraCanvasRef.current) {
          drawZebraOverlayV2(video, zebraCanvasRef.current, zebraThreshold);
        }

        if (isFocusLoupeVisible && loupeCanvasRef.current) {
          drawFocusLoupe(video, loupeCanvasRef.current);
        }
      }
      animId = requestAnimationFrame(processFrame);
    };

    animId = requestAnimationFrame(processFrame);
    return () => cancelAnimationFrame(animId);
  }, [showHistogram, showFocusPeaking, peakingColor, showZebra, zebraThreshold, isFocusLoupeVisible]);

  // ── Canvas Loupe Rendering ──
  const drawFocusLoupe = (video: HTMLVideoElement, canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d');
    if (!ctx || !video.videoWidth || !video.videoHeight) return;
    canvas.width = 140;
    canvas.height = 140;

    const srcX = video.videoWidth * 0.4;
    const srcY = video.videoHeight * 0.4;
    const srcW = video.videoWidth * 0.2;
    const srcH = video.videoHeight * 0.2;

    ctx.save();
    ctx.beginPath();
    ctx.arc(70, 70, 68, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(video, srcX, srcY, srcW, srcH, 0, 0, 140, 140);
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#00e5ff';
    ctx.stroke();
    ctx.restore();
  };

  const drawHistogram = (video: HTMLVideoElement, canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = 160;
    canvas.height = 80;
    ctx.clearRect(0, 0, 160, 80);

    const sampleCanvas = document.createElement('canvas');
    sampleCanvas.width = 80;
    sampleCanvas.height = 40;
    const sampleCtx = sampleCanvas.getContext('2d', { willReadFrequently: true });
    if (!sampleCtx) return;
    sampleCtx.drawImage(video, 0, 0, 80, 40);

    const imgData = sampleCtx.getImageData(0, 0, 80, 40).data;
    const histogram = new Array(256).fill(0);

    for (let i = 0; i < imgData.length; i += 4) {
      const lum = Math.round(0.2126 * imgData[i] + 0.7152 * imgData[i + 1] + 0.0722 * imgData[i + 2]);
      histogram[lum]++;
    }

    const maxVal = Math.max(...histogram) || 1;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, 160, 80);

    ctx.fillStyle = 'rgba(34, 211, 238, 0.75)';
    for (let i = 0; i < 256; i += 2) {
      const barHeight = (histogram[i] / maxVal) * 70;
      const x = (i / 256) * 160;
      ctx.fillRect(x, 80 - barHeight, 1.2, barHeight);
    }
  };

  const drawFocusPeakingV2 = (video: HTMLVideoElement, canvas: HTMLCanvasElement, colorHex: string) => {
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;
    const width = 160;
    const height = 120;
    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(video, 0, 0, width, height);

    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;
    const output = ctx.createImageData(width, height);
    const outData = output.data;

    const rCol = parseInt(colorHex.substring(1, 3), 16) || 0;
    const gCol = parseInt(colorHex.substring(3, 5), 16) || 229;
    const bCol = parseInt(colorHex.substring(5, 7), 16) || 255;

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = (y * width + x) * 4;
        const lumCenter = 0.2126 * data[idx] + 0.7152 * data[idx + 1] + 0.0722 * data[idx + 2];
        const lumRight = 0.2126 * data[idx + 4] + 0.7152 * data[idx + 5] + 0.0722 * data[idx + 6];
        const lumBottom = 0.2126 * data[idx + width * 4] + 0.7152 * data[idx + width * 4 + 1] + 0.0722 * data[idx + width * 4 + 2];

        const diff = Math.abs(lumCenter - lumRight) + Math.abs(lumCenter - lumBottom);

        if (diff > 42) {
          outData[idx] = rCol;
          outData[idx + 1] = gCol;
          outData[idx + 2] = bCol;
          outData[idx + 3] = 230;
        }
      }
    }
    ctx.putImageData(output, 0, 0);
  };

  const drawZebraOverlayV2 = (video: HTMLVideoElement, canvas: HTMLCanvasElement, threshold: number) => {
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;
    const width = 160;
    const height = 120;
    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(video, 0, 0, width, height);

    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;
    ctx.clearRect(0, 0, width, height);

    ctx.fillStyle = '#ff0055';
    for (let y = 0; y < height; y += 4) {
      for (let x = 0; x < width; x += 4) {
        const idx = (y * width + x) * 4;
        const lum = 0.2126 * data[idx] + 0.7152 * data[idx + 1] + 0.0722 * data[idx + 2];
        if (lum >= threshold) {
          ctx.fillRect(x, y, 3, 3);
        }
      }
    }
  };

  // ── Shutter Action ──
  const handleShutterTap = () => {
    if (cameraError) {
      if (fileInputRef.current) fileInputRef.current.click();
      return;
    }

    if (selfTimer > 0) {
      let count = selfTimer;
      setTimerCountdown(count);
      const interval = setInterval(() => {
        count -= 1;
        if (count > 0) {
          setTimerCountdown(count);
        } else {
          clearInterval(interval);
          setTimerCountdown(null);
          executeCaptureV2();
        }
      }, 1000);
    } else {
      executeCaptureV2();
    }
  };

  const executeCaptureV2 = async () => {
    playShutterSound();
    if (hapticsEnabled && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([45]);
    }

    if (!videoRef.current) {
      if (fileInputRef.current) fileInputRef.current.click();
      return;
    }

    try {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 1920;
      canvas.height = video.videoHeight || 1080;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        if (mirrorFront && selectedDeviceId.includes('front')) {
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
        }

        const activeFilter = computeViewportCSSFilter(exposureCompensation, iso, colorTemperature, wbTint, activeFilmStyle);
        if (activeFilter && activeFilter !== 'none') {
          ctx.filter = activeFilter;
        }

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        canvas.toBlob((blob) => {
          if (blob) {
            setCapturedBlob(blob);
            setCapturedPreviewUrl(URL.createObjectURL(blob));
          }
        }, 'image/jpeg', 0.95);
      }
    } catch (err) {
      if (fileInputRef.current) fileInputRef.current.click();
    }
  };

  const handleUploadPhoto = async () => {
    if (!capturedBlob || !eventId) return;

    setIsUploading(true);
    setUploadProgress(10);

    try {
      const filename = `pro_cam_v2_${eventId}_${Date.now()}.jpg`;
      const storagePath = `${eventId}/${filename}`;

      const { error: storageErr } = await supabase.storage.from('photos').upload(storagePath, capturedBlob, {
        contentType: 'image/jpeg',
      });
      if (storageErr) throw storageErr;
      setUploadProgress(60);

      const { data: inserted, error: dbErr } = await supabase.from('photos').insert({
        event_id: eventId,
        storage_path: storagePath,
        uploader_name: uploaderName.trim() || 'Pro Photographer',
        caption: caption.trim() || null,
        media_type: 'image',
        approved: true,
      }).select().single();

      if (dbErr) throw dbErr;
      setUploadProgress(90);

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

      setUploadProgress(100);
      setUploadSuccess(true);
      if (uploaderName.trim() && typeof window !== 'undefined') {
        localStorage.setItem('memento_guest_name', uploaderName.trim());
      }

      if (onPhotoUploaded && inserted) {
        onPhotoUploaded(inserted.id);
      }

      setTimeout(() => {
        setCapturedBlob(null);
        setCapturedPreviewUrl(null);
        setUploadSuccess(false);
        setIsUploading(false);
        setUploadProgress(0);
      }, 1500);
    } catch (err: any) {
      alert(err.message || 'Upload failed');
      setIsUploading(false);
    }
  };

  const getAspectRatioContainerClass = () => {
    switch (aspectRatio) {
      case '1:1': return 'aspect-square max-w-lg mx-auto rounded-3xl overflow-hidden';
      case '16:9': return 'aspect-video w-full rounded-3xl overflow-hidden';
      case '9:16': return 'w-full h-full';
      default: return 'w-full h-full';
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] bg-black text-white flex flex-col justify-between overflow-hidden select-none touch-none font-sans h-[100dvh] w-vw">
      <canvas ref={v2AnalysisCanvasRef} className="hidden" />

      {/* Fallback Camera Roll File Input */}
      <input 
        ref={fileInputRef} 
        type="file" 
        accept="image/*" 
        capture="environment" 
        onChange={handleFallbackFileSelect} 
        className="hidden" 
      />

      {/* ── Top Header Navigation ── */}
      <div className="absolute top-0 inset-x-0 z-30 flex items-center justify-between p-4 bg-gradient-to-b from-black/90 via-black/50 to-transparent backdrop-blur-[2px] pt-safe">
        <button 
          onClick={onClose} 
          className="p-2.5 rounded-full bg-black/60 border border-white/15 text-white/90 hover:text-white backdrop-blur-md active:scale-95 transition-transform"
        >
          <X size={20} />
        </button>

        {/* Halide Process Zero & Mode Badge */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const nextStyle = activeFilmStyle === 'process_zero' ? 'natural' : 'process_zero';
              setActiveFilmStyle(nextStyle);
            }}
            className={`px-3 py-1 rounded-full border text-[11px] font-extrabold tracking-wider font-mono transition-all flex items-center gap-1.5 ${
              activeFilmStyle === 'process_zero'
                ? 'bg-amber-400 text-black border-amber-300 shadow-lg shadow-amber-500/20'
                : 'bg-black/60 text-zinc-400 border-white/15'
            }`}
          >
            <Zap size={12} className={activeFilmStyle === 'process_zero' ? 'fill-black' : ''} />
            <span>PROCESS ZERO</span>
          </button>

          <span className="text-[10px] font-bold text-cyan-400 uppercase bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/30 font-mono">
            {shootingMode}
          </span>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2">
          {capabilities.hasTorch && (
            <button 
              onClick={toggleTorch}
              className={`p-2.5 rounded-full border backdrop-blur-md transition-all active:scale-95 ${
                torchOn ? 'bg-amber-400 text-black border-amber-300 shadow-lg shadow-amber-500/30' : 'bg-black/60 text-white/80 border-white/15'
              }`}
            >
              {torchOn ? <Flashlight size={18} /> : <FlashlightOff size={18} />}
            </button>
          )}

          <button 
            onClick={() => setShowFilmStylePanel(!showFilmStylePanel)}
            className="p-2.5 rounded-full bg-black/60 border border-white/15 text-white/80 hover:text-white backdrop-blur-md active:scale-95 transition-transform"
            title="Film Science Profiles"
          >
            <Film size={20} className={activeFilmStyle !== 'natural' ? 'text-cyan-400' : ''} />
          </button>

          <button 
            onClick={() => setShowSettingsDrawer(!showSettingsDrawer)}
            className="p-2.5 rounded-full bg-black/60 border border-white/15 text-white/80 hover:text-white backdrop-blur-md active:scale-95 transition-transform"
          >
            <Settings size={20} />
          </button>
        </div>
      </div>

      {/* ── Main Viewfinder Area ── */}
      <div 
        ref={viewfinderRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={handleViewfinderClick}
        className="relative flex-grow w-full h-full bg-zinc-950 overflow-hidden flex items-center justify-center cursor-crosshair"
      >
        {isLoadingCamera && (
          <div className="flex flex-col items-center gap-3 text-zinc-400">
            <div className="w-10 h-10 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-medium tracking-wide">Starting Pro Camera Viewfinder...</p>
          </div>
        )}

        {cameraError && (
          <div className="p-6 max-w-xs text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto">
              <Camera size={24} />
            </div>
            <p className="text-sm font-medium text-red-300">{cameraError}</p>
            <button 
              onClick={() => fileInputRef.current?.click()} 
              className="px-5 py-3 rounded-2xl bg-cyan-400 text-black font-extrabold text-xs uppercase tracking-wider shadow-lg hover:bg-cyan-300 transition-colors"
            >
              Take Photo with Device Camera
            </button>
          </div>
        )}

        {/* Video Frame */}
        <div className={`relative transition-all duration-300 ${getAspectRatioContainerClass()}`}>
          <video 
            ref={videoRef}
            playsInline
            webkit-playsinline="true"
            muted
            autoPlay
            style={{ WebkitTransform: 'translateZ(0)', transform: 'translateZ(0)' }}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              mirrorFront && selectedDeviceId.includes('front') ? 'scale-x-[-1]' : ''
            } ${isLoadingCamera || cameraError ? 'opacity-0' : 'opacity-100'}`}
          />

          {/* Grid Overlay */}
          {showGrid && !isLoadingCamera && !cameraError && (
            <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 border border-white/10">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="border border-white/10" />
              ))}
            </div>
          )}

          {/* Horizon Level */}
          {showLevel && !isLoadingCamera && !cameraError && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className={`relative w-48 h-0.5 transition-all duration-100 ${
                Math.abs(rollAngle) <= 1 ? 'bg-emerald-400 shadow-lg shadow-emerald-400/50 scale-105' : 'bg-white/40'
              }`} style={{ transform: `rotate(${rollAngle}deg)` }}>
                <div className="absolute left-1/2 -top-1.5 -translate-x-1/2 w-3 h-3 border-2 border-white/80 rounded-full" />
              </div>
            </div>
          )}

          {/* Focus Peaking Overlay */}
          {showFocusPeaking && (
            <canvas ref={peakingCanvasRef} className="absolute inset-0 w-full h-full pointer-events-none opacity-80" />
          )}

          {/* Zebra Overlay */}
          {showZebra && (
            <canvas ref={zebraCanvasRef} className="absolute inset-0 w-full h-full pointer-events-none opacity-70" />
          )}
        </div>

        {/* Halide Focus Loupe Circle Magnifier */}
        {isFocusLoupeVisible && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-40 flex flex-col items-center gap-1 animate-in zoom-in-75">
            <canvas ref={loupeCanvasRef} className="w-36 h-36 rounded-full border-2 border-cyan-400 shadow-2xl bg-black" />
            <span className="text-[10px] font-mono font-bold bg-black/80 px-2 py-0.5 rounded-full text-cyan-400">
              FOCUS LOUPE: {Math.round(focusDistance * 100)}%
            </span>
          </div>
        )}

        {/* Halide Touch AF/AE Target Reticle Box */}
        {focusTargetPos && (
          <div 
            className="absolute pointer-events-none z-30 flex flex-col items-center gap-1 transition-all duration-150"
            style={{ left: focusTargetPos.x - 30, top: focusTargetPos.y - 30 }}
          >
            <div className="w-16 h-16 border-2 border-yellow-400 rounded-lg shadow-lg flex items-center justify-center relative animate-pulse">
              <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full" />
              {showTargetSunSlider && (
                <div className="absolute -right-6 top-0 bottom-0 flex flex-col items-center justify-between text-yellow-400 text-[9px] font-mono">
                  <Sun size={12} />
                  <div className="w-0.5 h-8 bg-yellow-400/60 rounded" />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Live OLED Telemetry Bar */}
        <div className="absolute top-20 left-4 pointer-events-none flex flex-col gap-1 z-20">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/80 border border-amber-500/40 backdrop-blur-md text-[11px] font-mono text-amber-400 shadow-xl">
            <span>ISO {iso}</span>
            <span className="text-white/30">|</span>
            <span>{shutterSpeed}s</span>
            <span className="text-white/30">|</span>
            <span className="text-emerald-400">EV {exposureCompensation > 0 ? `+${exposureCompensation}` : exposureCompensation}</span>
            <span className="text-white/30">|</span>
            <span className="text-cyan-400">{colorTemperature}K</span>
          </div>

          <div className="flex gap-1.5 mt-1">
            {v2Analysis.motionScore > 25 && (
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 text-[10px] font-bold">
                ⚡ Motion Detected
              </span>
            )}
            {v2Analysis.isBacklit && (
              <span className="px-2.5 py-0.5 rounded-full bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 text-[10px] font-bold">
                ☀️ Backlight Alert
              </span>
            )}
          </div>
        </div>

        {/* Live Histogram Overlay */}
        {showHistogram && (
          <div className="absolute top-20 right-4 pointer-events-none rounded-xl overflow-hidden border border-white/20 shadow-xl bg-black/70 backdrop-blur-md">
            <canvas ref={histogramCanvasRef} className="w-36 h-20" />
            <div className="px-2 py-0.5 bg-black/80 text-[9px] text-zinc-400 font-mono text-center">RGB HISTOGRAM</div>
          </div>
        )}

        {/* Timer Countdown Overlay */}
        <AnimatePresence>
          {timerCountdown !== null && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.5 }}
              className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            >
              <span className="text-8xl font-extrabold text-cyan-400 drop-shadow-2xl animate-pulse">
                {timerCountdown}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* AI Guided Recommendation Banner */}
        {showGuidedBanner && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-32 inset-x-4 z-20 p-3 rounded-2xl bg-zinc-900/95 border border-cyan-500/30 backdrop-blur-md shadow-xl flex items-start gap-3"
          >
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shrink-0">
              <Sparkles size={16} />
            </div>
            <div className="flex-grow min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-cyan-400 tracking-wide">
                  AI Guidance — {EVENT_PRESETS[activePresetKey].label}
                </span>
                <button onClick={() => setShowGuidedBanner(false)} className="text-zinc-500 hover:text-white">
                  <X size={14} />
                </button>
              </div>
              <p className="text-[11px] text-zinc-300 mt-0.5 leading-tight">
                {v2Analysis.recommendation || EVENT_PRESETS[activePresetKey].settings.tip}
              </p>
              <button 
                onClick={() => applyPreset(v2Analysis.suggestedPreset || activePresetKey)}
                className="mt-2 text-[10px] font-bold px-2.5 py-1 rounded-lg bg-cyan-400 text-black hover:bg-cyan-300 transition-colors inline-flex items-center gap-1"
              >
                <Zap size={11} /> Apply Recommended Settings
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* ── Bottom Control Deck ── */}
      <div className="relative z-30 bg-gradient-to-t from-black via-black/95 to-transparent pt-4 pb-safe px-4 space-y-3">
        
        {/* Lens Switcher & Aspect Ratio Bar */}
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-1.5">
            {[
              { label: '0.5x', zoom: 0.5 },
              { label: '1x', zoom: 1 },
              { label: '2x', zoom: 2 },
            ].map((l) => (
              <button
                key={l.label}
                onClick={() => switchCameraLens(l.zoom)}
                className={`w-9 h-9 rounded-full text-xs font-bold font-mono transition-all ${
                  lensZoom === l.zoom 
                    ? 'bg-white text-black shadow-lg shadow-white/20 scale-105' 
                    : 'bg-zinc-900/80 text-zinc-400 border border-zinc-800'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 bg-zinc-900/80 border border-zinc-800 rounded-full p-1">
            {(['4:3', '1:1', '16:9', '9:16'] as AspectRatioType[]).map((ar) => (
              <button
                key={ar}
                onClick={() => setAspectRatio(ar)}
                className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold transition-all ${
                  aspectRatio === ar ? 'bg-cyan-400 text-black' : 'text-zinc-400 hover:text-white'
                }`}
              >
                {ar}
              </button>
            ))}
          </div>
        </div>

        {/* Shooting Mode Selector Ribbon */}
        <div className="flex items-center justify-center gap-4 overflow-x-auto no-scrollbar py-1">
          {(['AUTO', 'PRO', 'PORTRAIT', 'EVENT', 'LOW LIGHT', 'PRODUCT', 'DOCUMENT'] as ShootingMode[]).map((mode) => {
            const isProLocked = !isProUser && (mode === 'PRO' || mode === 'LOW LIGHT');
            return (
              <button
                key={mode}
                onClick={() => {
                  if (isProLocked) {
                    requirePro(`${mode} Mode`, () => setShootingMode(mode));
                  } else {
                    setShootingMode(mode);
                    if (mode === 'EVENT') setShowPresetsPanel(true);
                  }
                }}
                className={`text-xs font-bold tracking-widest uppercase transition-all whitespace-nowrap flex items-center gap-1 ${
                  shootingMode === mode
                    ? 'text-cyan-400 border-b-2 border-cyan-400 pb-0.5'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <span>{mode}</span>
                {isProLocked && <Lock size={10} className="text-amber-400" />}
              </button>
            );
          })}
        </div>

        {/* Manual Control Bar */}
        {shootingMode === 'PRO' && (
          <div className="p-3 rounded-2xl bg-zinc-900/95 border border-zinc-800 backdrop-blur-md space-y-3">
            <div className="flex items-center justify-between text-xs border-b border-zinc-800 pb-2">
              {[
                { id: 'iso', label: 'ISO', val: iso, locked: !isProUser },
                { id: 'shutter', label: 'Shutter', val: shutterSpeed, locked: !isProUser },
                { id: 'ev', label: 'EV', val: exposureCompensation, locked: false },
                { id: 'wb', label: 'WB', val: wbMode, locked: false },
                { id: 'tint', label: 'Tint', val: wbTint > 0 ? `+${wbTint}` : wbTint, locked: !isProUser },
                { id: 'focus', label: 'Focus', val: focusMode, locked: !isProUser },
              ].map((ctrl) => (
                <button
                  key={ctrl.id}
                  onClick={() => {
                    if (ctrl.locked) {
                      requirePro(`Manual ${ctrl.label}`, () => setActiveManualControlTab(ctrl.id as any));
                    } else {
                      setActiveManualControlTab(activeManualControlTab === ctrl.id ? null : ctrl.id as any);
                    }
                  }}
                  className={`flex flex-col items-center px-2 py-1 rounded-xl transition-all ${
                    activeManualControlTab === ctrl.id ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <span className="text-[10px] font-semibold text-zinc-500 uppercase flex items-center gap-0.5">
                    {ctrl.label} {ctrl.locked && <Lock size={9} className="text-amber-400" />}
                  </span>
                  <span className="text-xs font-bold font-mono text-white mt-0.5">{ctrl.val}</span>
                </button>
              ))}
            </div>

            {activeManualControlTab === 'iso' && (
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-zinc-400 font-mono">
                  <span>ISO {iso}</span>
                  <span>Max 6400</span>
                </div>
                <input 
                  type="range" 
                  min={100} 
                  max={6400} 
                  step={100} 
                  value={iso} 
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setIso(val);
                    applyCameraConstraints({ iso: val });
                  }} 
                  className="w-full accent-cyan-400 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                />
              </div>
            )}

            {activeManualControlTab === 'shutter' && (
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                {['1/2000', '1/1000', '1/500', '1/250', '1/125', '1/60', '1/30', '1/15'].map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      setShutterSpeed(s);
                      applyCameraConstraints({ shutterSpeed: s });
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-mono font-bold whitespace-nowrap ${
                      shutterSpeed === s ? 'bg-amber-400 text-black' : 'bg-zinc-800 text-zinc-300'
                    }`}
                  >
                    {s}s
                  </button>
                ))}
              </div>
            )}

            {activeManualControlTab === 'ev' && (
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-zinc-400 font-mono">
                  <span>EV {exposureCompensation > 0 ? `+${exposureCompensation}` : exposureCompensation}</span>
                </div>
                <input 
                  type="range" 
                  min={-3} 
                  max={3} 
                  step={0.3} 
                  value={exposureCompensation} 
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setExposureCompensation(val);
                    applyCameraConstraints({ exposureCompensation: val });
                  }} 
                  className="w-full accent-emerald-400 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                />
              </div>
            )}
          </div>
        )}

        {/* Main Shutter Bar */}
        <div className="flex items-center justify-between px-6 pt-2 pb-3">
          <button 
            onClick={() => setShowPresetsPanel(!showPresetsPanel)}
            className="p-3 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white active:scale-95 transition-transform"
            title="Event Presets"
          >
            <Sparkles size={20} className="text-cyan-400" />
          </button>

          {/* Shutter Button */}
          <button 
            onClick={handleShutterTap}
            className="relative w-20 h-20 rounded-full border-4 border-white/90 p-1 flex items-center justify-center active:scale-90 transition-transform shadow-2xl shadow-cyan-500/20"
          >
            <div className="w-full h-full rounded-full bg-white active:bg-cyan-400 transition-colors shadow-inner" />
          </button>

          {/* Device Camera Flip */}
          <button 
            onClick={() => {
              if (cameraDevices.length > 1) {
                const nextDev = cameraDevices.find((d) => d.deviceId !== selectedDeviceId) || cameraDevices[0];
                if (nextDev) setSelectedDeviceId(nextDev.deviceId);
              }
            }}
            className="p-3 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white active:scale-95 transition-transform"
          >
            <FlipHorizontal size={20} />
          </button>
        </div>
      </div>

      {/* ── Film Styles Drawer Modal ── */}
      <AnimatePresence>
        {showFilmStylePanel && (
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-0 inset-x-0 z-[1600] p-6 bg-zinc-950 border-t border-zinc-800 rounded-t-3xl shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Film size={16} className="text-cyan-400" />
                <span>Film Science Profiles</span>
              </h3>
              <button onClick={() => setShowFilmStylePanel(false)} className="text-zinc-500 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Object.values(FILM_STYLES).map((fs) => (
                <button
                  key={fs.key}
                  onClick={() => {
                    setActiveFilmStyle(fs.key);
                    setShowFilmStylePanel(false);
                  }}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    activeFilmStyle === fs.key
                      ? 'bg-cyan-500/10 border-cyan-500 text-white shadow-lg'
                      : 'bg-zinc-900/60 border-zinc-800/80 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <h4 className="text-xs font-bold text-white flex items-center gap-1">
                    <span>{fs.label}</span>
                    {fs.isProcessZero && <Zap size={10} className="text-amber-400 fill-amber-400" />}
                  </h4>
                  <p className="text-[10px] text-zinc-500 line-clamp-1 mt-0.5">{fs.description}</p>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Event Presets Drawer Modal ── */}
      <AnimatePresence>
        {showPresetsPanel && (
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-0 inset-x-0 z-[1600] p-6 bg-zinc-950 border-t border-zinc-800 rounded-t-3xl shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles size={16} className="text-cyan-400" />
                <span>Event Photography Presets</span>
              </h3>
              <button onClick={() => setShowPresetsPanel(false)} className="text-zinc-500 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 max-h-60 overflow-y-auto no-scrollbar">
              {Object.values(EVENT_PRESETS).map((p) => (
                <button
                  key={p.key}
                  onClick={() => {
                    applyPreset(p.key);
                    setShowPresetsPanel(false);
                  }}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    activePresetKey === p.key
                      ? 'bg-cyan-500/10 border-cyan-500 text-white shadow-lg'
                      : 'bg-zinc-900/60 border-zinc-800/80 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <span className="text-xl">{p.icon}</span>
                  <h4 className="text-xs font-bold text-white mt-1">{p.label}</h4>
                  <p className="text-[10px] text-zinc-500 line-clamp-1 mt-0.5">{p.tagline}</p>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Settings Drawer Modal ── */}
      <AnimatePresence>
        {showSettingsDrawer && (
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-0 inset-x-0 z-[1700] p-6 bg-zinc-950 border-t border-zinc-800 rounded-t-3xl shadow-2xl space-y-5 max-h-[85vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Settings size={18} className="text-cyan-400" />
                <span>Pro Camera Settings</span>
              </h3>
              <button onClick={() => setShowSettingsDrawer(false)} className="text-zinc-500 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                <span className="text-zinc-300 font-semibold">Shutter Sound</span>
                <button 
                  onClick={() => setShutterSoundEnabled(!shutterSoundEnabled)}
                  className={`p-2 rounded-lg ${shutterSoundEnabled ? 'bg-cyan-500/20 text-cyan-400' : 'text-zinc-500'}`}
                >
                  {shutterSoundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
                </button>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-zinc-400 uppercase tracking-wider text-[10px]">Overlays & HUD</h4>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => setShowGrid(!showGrid)}
                    className={`p-3 rounded-xl border flex items-center justify-between ${showGrid ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400' : 'bg-zinc-900 border-zinc-800 text-zinc-400'}`}
                  >
                    <span>Grid Lines</span>
                    <Grid size={16} />
                  </button>

                  <button 
                    onClick={() => setShowLevel(!showLevel)}
                    className={`p-3 rounded-xl border flex items-center justify-between ${showLevel ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400' : 'bg-zinc-900 border-zinc-800 text-zinc-400'}`}
                  >
                    <span>Horizon Level</span>
                    <Compass size={16} />
                  </button>

                  <button 
                    onClick={() => setShowHistogram(!showHistogram)}
                    className={`p-3 rounded-xl border flex items-center justify-between ${showHistogram ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400' : 'bg-zinc-900 border-zinc-800 text-zinc-400'}`}
                  >
                    <span>RGB Histogram</span>
                    <Activity size={16} />
                  </button>

                  <button 
                    onClick={() => {
                      if (!isProUser) requirePro('Focus Peaking', () => setShowFocusPeaking(!showFocusPeaking));
                      else setShowFocusPeaking(!showFocusPeaking);
                    }}
                    className={`p-3 rounded-xl border flex items-center justify-between ${showFocusPeaking ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400' : 'bg-zinc-900 border-zinc-800 text-zinc-400'}`}
                  >
                    <span className="flex items-center gap-1">Focus Peaking {!isProUser && <Lock size={10} className="text-amber-400" />}</span>
                    <Eye size={16} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Photo Review Modal ── */}
      <AnimatePresence>
        {capturedPreviewUrl && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[2200] bg-black/95 flex flex-col justify-between p-4 sm:p-6"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Review Photo</span>
              <button 
                onClick={() => {
                  setCapturedBlob(null);
                  setCapturedPreviewUrl(null);
                }}
                className="p-2 rounded-full bg-zinc-900 text-zinc-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="relative flex-grow my-4 rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 flex items-center justify-center">
              <img src={capturedPreviewUrl} alt="Captured memory" className="w-full h-full object-contain" />

              {uploadSuccess && (
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3 text-emerald-400">
                  <Check size={48} className="animate-bounce" />
                  <p className="text-base font-bold">Successfully Shared to Event!</p>
                </div>
              )}
            </div>

            <div className="space-y-3 max-w-lg mx-auto w-full">
              {eventId && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input 
                    type="text" 
                    placeholder="Your Name..." 
                    value={uploaderName}
                    onChange={(e) => setUploaderName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-400"
                  />
                  <input 
                    type="text" 
                    placeholder="Add caption..." 
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-400"
                  />
                </div>
              )}

              <div className="flex gap-3">
                <button 
                  onClick={() => {
                    setCapturedBlob(null);
                    setCapturedPreviewUrl(null);
                  }}
                  className="flex-1 py-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-300 font-bold text-xs hover:bg-zinc-800 transition-colors flex items-center justify-center gap-1.5"
                >
                  <RotateCcw size={16} /> Retake
                </button>

                <button 
                  onClick={handleUploadPhoto}
                  disabled={isUploading}
                  className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-400 to-emerald-400 text-black font-bold text-xs hover:brightness-110 transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-500/20"
                >
                  <Upload size={16} /> {isUploading ? `Uploading (${uploadProgress}%)...` : eventId ? 'Use Photo & Upload' : 'Save Photo'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Upgrade Gate Modal ── */}
      <ProCameraUpgradeModal 
        isOpen={showUpgradeModal} 
        onClose={() => setShowUpgradeModal(false)} 
        triggeredFeature={upgradeReason}
      />
    </div>
  );
}
