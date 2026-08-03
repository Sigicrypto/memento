"use client";

import { useState, useRef, Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { DemoMedia, upsertDemoPhoto } from '@/lib/demoWall';
import AnimatedLogo from '@/components/AnimatedLogo';
import FloatingParticles from '@/components/FloatingParticles';
import { Upload } from 'lucide-react';

const MAX_IMAGES = 5;
const MAX_VIDEOS = 1;
const ACCEPTED_IMAGE_TYPES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/heic', 'image/heif']);
const ACCEPTED_VIDEO_TYPES = new Set(['video/mp4', 'video/quicktime', 'video/webm', 'video/x-m4v']);
const ACCEPTED_IMAGE_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'heic', 'heif']);
const ACCEPTED_VIDEO_EXTENSIONS = new Set(['mp4', 'mov', 'webm', 'm4v']);

const getDemoChannelName = (demoId: string) => `demo-${demoId}`;

function getFileExtension(fileName: string) {
  return fileName.split('.').pop()?.toLowerCase() || '';
}
function isAcceptedImage(file: File) {
  return ACCEPTED_IMAGE_TYPES.has(file.type) || ACCEPTED_IMAGE_EXTENSIONS.has(getFileExtension(file.name));
}
function isAcceptedVideo(file: File) {
  return ACCEPTED_VIDEO_TYPES.has(file.type) || ACCEPTED_VIDEO_EXTENSIONS.has(getFileExtension(file.name));
}

async function compressDemoImage(file: File): Promise<File> {
  const ext = getFileExtension(file.name);
  if (ext === 'heic' || ext === 'heif') return file;
  try {
    const imageUrl = URL.createObjectURL(file);
    const image = new Image();
    image.src = imageUrl;
    await new Promise((resolve) => { image.onload = resolve; });
    URL.revokeObjectURL(imageUrl);
    const MAX_DIM = 1920;
    const scale = Math.min(1, MAX_DIM / Math.max(image.width, image.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(image.width * scale);
    canvas.height = Math.round(image.height * scale);
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    const outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
    const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, outputType, 0.92));
    if (!blob || blob.size >= file.size) return file;
    const nextExt = outputType === 'image/png' ? 'png' : 'jpg';
    return new File([blob], file.name.replace(/\.[^.]+$/, `.${nextExt}`), { type: outputType, lastModified: Date.now() });
  } catch {
    return file;
  }
}

async function broadcastUpload(demoId: string, payload: DemoMedia) {
  try {
    await supabase.channel(getDemoChannelName(demoId)).send({
      type: 'broadcast',
      event: 'NEW_UPLOAD',
      payload,
    });
  } catch (err: any) {
    console.warn('Broadcast failed:', err.message || err);
  }
}

// ── localStorage helpers for lifetime per-device quota ──────────────────
function getQuotaKey(demoId: string) {
  return `demo-quota-${demoId}`;
}
function loadQuota(demoId: string): { photos: number; videos: number; timestamp: number } {
  try {
    const raw = localStorage.getItem(getQuotaKey(demoId));
    if (!raw) return { photos: 0, videos: 0, timestamp: Date.now() };
    const parsed = JSON.parse(raw);
    
    // If there's no timestamp, it's legacy data from before this feature, so it's safely expired.
    if (!parsed.timestamp) {
      return { photos: 0, videos: 0, timestamp: Date.now() };
    }
    
    // Auto-reset quota after 5 minutes (matching the demo wall duration)
    if (Date.now() - parsed.timestamp > 5 * 60 * 1000) {
      return { photos: 0, videos: 0, timestamp: Date.now() };
    }
    
    return {
      photos: typeof parsed.photos === 'number' ? parsed.photos : 0,
      videos: typeof parsed.videos === 'number' ? parsed.videos : 0,
      timestamp: parsed.timestamp
    };
  } catch { return { photos: 0, videos: 0, timestamp: Date.now() }; }
}
function saveQuota(demoId: string, photos: number, videos: number, existingTimestamp?: number) {
  try {
    const timestamp = existingTimestamp || Date.now();
    localStorage.setItem(getQuotaKey(demoId), JSON.stringify({ photos, videos, timestamp }));
  } catch { /* storage unavailable */ }
}

function DemoUploadContent() {
  const searchParams = useSearchParams();
  const demoId = searchParams.get('id') || '';
  const [uploadPhotos, setUploadPhotos] = useState<File[]>([]);
  const [uploadVideos, setUploadVideos] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [totalUploaded, setTotalUploaded] = useState(0);
  const [uploaderName, setUploaderName] = useState('');
  const [comment, setComment] = useState('');
  const [photoDragOver, setPhotoDragOver] = useState(false);
  const [videoDragOver, setVideoDragOver] = useState(false);
  // Lifetime quota — persisted in localStorage per device per demoId
  const [lifetimePhotos, setLifetimePhotos] = useState(0);
  const [lifetimeVideos, setLifetimeVideos] = useState(0);
  const [quotaTimestamp, setQuotaTimestamp] = useState<number>(Date.now());
  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Load lifetime quota from localStorage once demoId is known
  useEffect(() => {
    if (!demoId) return;
    
    const refreshQuota = () => {
      const quota = loadQuota(demoId);
      setLifetimePhotos(quota.photos);
      setLifetimeVideos(quota.videos);
      setQuotaTimestamp(quota.timestamp);
    };
    
    refreshQuota();
    const interval = setInterval(refreshQuota, 5000);
    return () => clearInterval(interval);
  }, [demoId]);

  useEffect(() => {
    if (!demoId) return;
    const channel = supabase.channel(getDemoChannelName(demoId));
    channel.subscribe((status) => setIsConnected(status === 'SUBSCRIBED'));
    return () => { supabase.removeChannel(channel); };
  }, [demoId]);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    processPhotoFiles(files);
  };

  const processPhotoFiles = (files: File[]) => {
    const validPhotos = files.filter(isAcceptedImage);
    const invalidFiles = files.filter(f => !isAcceptedImage(f));
    if (invalidFiles.length > 0) {
      setError(`Invalid file type: only JPG, PNG, HEIC are accepted.`);
      setTimeout(() => setError(null), 5000);
      return;
    }
    setUploadPhotos(prev => {
      // lifetime quota = already uploaded (persisted) + currently staged
      const totalUsed = lifetimePhotos + prev.length;
      const slotsLeft = MAX_IMAGES - totalUsed;
      if (slotsLeft <= 0) {
        setError(`You've used all ${MAX_IMAGES} photo uploads for this demo.`);
        setTimeout(() => setError(null), 5000);
        return prev;
      }
      const toAdd = validPhotos.slice(0, slotsLeft);
      if (validPhotos.length > slotsLeft) {
        setError(`Only ${slotsLeft} slot${slotsLeft !== 1 ? 's' : ''} left — added ${toAdd.length} of ${validPhotos.length}.`);
        setTimeout(() => setError(null), 5000);
      } else {
        setError(null);
      }
      return [...prev, ...toAdd];
    });
  };

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    processVideoFiles(files);
  };

  const processVideoFiles = (files: File[]) => {
    const validVideos = files.filter(isAcceptedVideo);
    const invalidFiles = files.filter(f => !isAcceptedVideo(f));
    if (invalidFiles.length > 0) {
      setError(`Invalid file type: only common video formats (MP4, MOV, WEBM) are accepted.`);
      setTimeout(() => setError(null), 5000);
      return;
    }
    // Lifetime video quota check
    if (lifetimeVideos >= MAX_VIDEOS) {
      setError(`You've already used your 1 video upload for this demo.`);
      setTimeout(() => setError(null), 5000);
      return;
    }
    if (validVideos.length > 0) {
      setUploadVideos([validVideos[0]]);
      setError(null);
    }
  };

  const handlePhotoDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setPhotoDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    processPhotoFiles(files);
  };

  const handleVideoDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setVideoDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    processVideoFiles(files);
  };

  const removePhoto = (index: number) => {
    setUploadPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const removeVideo = () => setUploadVideos([]);

  const uploadFile = async (file: File): Promise<string> => {
    const fileName = `demo/${demoId}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const { error: uploadError } = await supabase.storage.from('photos').upload(fileName, file);
    if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);
    const { data: { publicUrl } } = supabase.storage.from('photos').getPublicUrl(fileName);
    return publicUrl;
  };

  const handleUpload = async () => {
    if (!uploadPhotos.length && !uploadVideos.length) return;
    setUploading(true);
    setProgress(0);
    setError(null);
    setUploadSuccess(false);
    setStatus('Preparing…');
    try {
      const totalFiles = uploadPhotos.length + uploadVideos.length;
      let uploaded = 0;
      const uploadPromises: Promise<string>[] = [];
      for (const photo of uploadPhotos) {
        const compressed = await compressDemoImage(photo);
        uploadPromises.push(uploadFile(compressed));
      }
      for (const video of uploadVideos) {
        uploadPromises.push(uploadFile(video));
      }
      const urls = await Promise.all(uploadPromises);
      for (const url of urls) {
        uploaded++;
        setProgress(Math.round((uploaded / totalFiles) * 100));
        setStatus(`Uploading ${uploaded} of ${totalFiles}…`);
        await new Promise(r => setTimeout(r, 200));
      }
      setStatus('Sending to wall…');
      const uploader = uploaderName.trim() || 'Demo Guest';
      for (let i = 0; i < urls.length; i++) {
        const publicUrl = urls[i];
        const type = i < uploadPhotos.length ? 'image' : 'video';
        const caption = comment.trim() || (type === 'video' ? '🎥 Live Video!' : '📸 Live Photo!');
        const { error: insertError } = await supabase.from('demo_uploads').insert({
          demo_id: demoId,
          url: publicUrl,
          type,
          caption,
          uploader,
        });
        if (insertError) console.error('[DEMO UPLOAD] Database insert failed:', insertError);
        const payload: DemoMedia = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          url: publicUrl,
          type,
          caption,
          uploader,
          createdAt: Date.now(),
        };
        upsertDemoPhoto(demoId, payload);
        await broadcastUpload(demoId, payload);
      }
      // Persist lifetime quota to localStorage so limits survive page refreshes
      const newLifetimePhotos = lifetimePhotos + uploadPhotos.length;
      const newLifetimeVideos = lifetimeVideos + uploadVideos.length;
      setLifetimePhotos(newLifetimePhotos);
      setLifetimeVideos(newLifetimeVideos);
      saveQuota(demoId, newLifetimePhotos, newLifetimeVideos, quotaTimestamp);

      setTotalUploaded(prev => prev + urls.length);
      setUploadPhotos([]);
      setUploadVideos([]);
      setComment('');
      setStatus('');
      setUploadSuccess(true);
      if (photoInputRef.current) photoInputRef.current.value = '';
      if (videoInputRef.current) videoInputRef.current.value = '';
      setTimeout(() => setUploadSuccess(false), 5000);
    } catch (err: any) {
      setError(err.message || 'Upload failed. Please try again.');
      setStatus('');
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const totalFiles = uploadPhotos.length + uploadVideos.length;

  return (
    <>
      {/* ── Inline styles that extend landing.css ───────────────────────── */}
      <style>{`
        /* ── Upload-specific tokens ── */
        :root {
          --upload-radius: 20px;
          --upload-zone-bg: rgba(30,41,59,0.04);
          --upload-zone-border: rgba(100,116,139,0.18);
          --upload-zone-hover:text-text-primary rgba(245,158,11,0.08);
          --upload-zone-hover-border: rgba(245,158,11,0.45);
          --input-bg: rgba(255,255,255,0.04);
          --input-border: rgba(255,255,255,0.08);
          --input-focus-border: var(--amber);
          --success-bg: linear-gradient(135deg,rgba(34,197,94,0.12),rgba(16,185,129,0.07));
          --success-border: rgba(34,197,94,0.28);
          --error-bg: rgba(239,68,68,0.08);
          --error-border: rgba(239,68,68,0.25);
        }

        /* ── Page shell ── */
        .upload-page {
          min-height: 100dvh;
          padding-bottom: env(safe-area-inset-bottom, 32px);
          padding-left: env(safe-area-inset-left, 0px);
          padding-right: env(safe-area-inset-right, 0px);
        }

        /* ── Content wrapper ── */
        .upload-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 7rem 1rem 7rem;
          width: 100%;
          max-width: 1000px;
          margin: 0 auto;
          gap: 1.25rem;
        }

        .upload-layout-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.25rem;
          width: 100%;
          max-width: 520px;
        }

        .upload-col-left, .upload-col-right {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .upload-col-right {
           position: relative; /* For sticky submit button */
        }

        @media (min-width: 860px) {
          .upload-layout-grid {
            grid-template-columns: 1fr 1fr;
            max-width: 1000px;
            align-items: start;
            gap: 2rem;
          }
        }

        /* ── Page header ── */
        .upload-header {
          text-align: center;
          width: 100%;
          margin-bottom: 0.5rem;
        }
        .upload-header .hero-h1 {
          font-size: clamp(1.75rem,5.5vw,2.6rem);
          line-height: 1.15;
          margin-bottom: 0.5rem;
        }
        .upload-header .hero-sub {
          font-size: 0.975rem;
          margin-bottom: 0;
        }

        /* ── Status badge (nav area) ── */
        .upload-status-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 14px 5px 10px;
          border-radius: 999px;
          font-size: 0.7rem;
          font-weight: 800;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          border: 1.5px solid;
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          transition: all 0.3s ease;
        }
        .upload-status-pill.live {
          background: rgba(34,197,94,0.1);
          border-color: rgba(34,197,94,0.3);
          color: #16a34a;
        }
        .upload-status-pill.offline {
          background: rgba(239,68,68,0.08);
          border-color: rgba(239,68,68,0.25);
          color: #dc2626;
        }
        .upload-sent-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 12px;
          border-radius: 999px;
          font-size: 0.7rem;
          font-weight: 700;
          background: rgba(245,158,11,0.12);
          border: 1.5px solid rgba(245,158,11,0.3);
          color: var(--amber, #f59e0b);
        }

        /* ── Glass cards (already have gcard styles from landing.css) ── */
        .upload-section {
          width: 100%;
        }
        .upload-section .gcard-inner {
          padding: 1.5rem;
        }

        /* ── Section label inside card ── */
        .upload-section-label {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1rem;
        }
        .upload-section-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.875rem;
          font-weight: 700;
          color: var(--text-primary, #ffffff);
        }
        .upload-section-title .emoji {
          font-size: 1rem;
        }
        .upload-count-pill {
          padding: 3px 10px;
          border-radius: 999px;
          font-size: 0.7rem;
          font-weight: 700;
          transition: all 0.25s ease;
        }
        .upload-count-pill.empty {
          background: rgba(100,116,139,0.1);
          color: var(--text-muted, #94a3b8);
        }
        .upload-count-pill.filled {
          background: rgba(34,197,94,0.14);
          color: #16a34a;
        }
        .upload-count-pill.maxed {
          background: rgba(239,68,68,0.1);
          color: #dc2626;
        }

        /* ── Inputs ── */
        .upload-input {
          width: 100%;
          padding: 13px 16px;
          border-radius: 14px;
          font-size: 0.9rem;
          outline: none;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
          background: var(--input-bg);
          border: 1.5px solid var(--input-border);
          color: var(--text-primary, #ffffff);
          -webkit-appearance: none;
        }
        .upload-input::placeholder { color: var(--text-muted, #94a3b8); }
        .upload-input:focus {
          border-color: var(--input-focus-border);
          background: rgba(255,255,255,0.7);
          box-shadow: 0 0 0 3px rgba(245,158,11,0.1);
        }
        .upload-input:disabled { opacity: 0.5; cursor: not-allowed; }
        .upload-textarea {
          resize: none;
          min-height: 80px;
        }
        .upload-label {
          display: block;
          font-size: 0.7rem;
          font-weight: 800;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--text-muted, #94a3b8);
          margin-bottom: 8px;
        }
        .char-count {
          text-align: right;
          font-size: 0.7rem;
          color: var(--text-muted, #94a3b8);
          margin-top: 5px;
        }

        /* ── Drop zone ── */
        .upload-drop-zone {
          width: 100%;
          padding: 2rem 1rem;
          border-radius: var(--upload-radius);
          border: 2px dashed var(--upload-zone-border);
          background: var(--upload-zone-bg);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 10px;
          cursor: pointer;
          transition: all 0.22s ease;
          -webkit-tap-highlight-color: transparent;
        }
        .upload-drop-zone:hover,
        .upload-drop-zone.drag-over {
          border-color: var(--upload-zone-hover-border);
          background: var(--upload-zone-hover);
        }
        .upload-drop-zone:active { transform: scale(0.985); }
        .upload-drop-zone.disabled {
          opacity: 0.45;
          cursor: not-allowed;
          pointer-events: none;
        }
        .drop-zone-icon {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.4rem;
          background: linear-gradient(135deg,rgba(245,158,11,0.15),rgba(244,114,182,0.1));
          border: 1.5px solid rgba(245,158,11,0.2);
        }
        .drop-zone-text {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-secondary, #cbd5e1);
        }
        .drop-zone-hint {
          font-size: 0.72rem;
          color: var(--text-muted, #94a3b8);
        }

        /* ── Photo preview grid ── */
        .photo-preview-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
          margin-bottom: 14px;
        }
        .photo-preview-item {
          position: relative;
          aspect-ratio: 1;
          border-radius: 14px;
          overflow: hidden;
          box-shadow: 0 2px 12px rgba(0,0,0,0.1);
        }
        .photo-preview-item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .photo-remove-btn {
          position: absolute;
          top: 6px;
          right: 6px;
          width: 26px;
          height: 26px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.85rem;
          font-weight: 700;
          color: #fff;
          background: rgba(15,23,42,0.65);
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          border: none;
          cursor: pointer;
          transition: background 0.18s, transform 0.18s;
          -webkit-tap-highlight-color: transparent;
          opacity: 0;
        }
        .photo-preview-item:hover .photo-remove-btn,
        .photo-preview-item:focus-within .photo-remove-btn {
          opacity: 1;
        }
        /* Always visible on touch devices */
        @media (hover:text-text-primary none) {
          .photo-remove-btn { opacity: 1; }
        }
        .photo-remove-btn:hover { background: rgba(239,68,68,0.85); transform: scale(1.1); }

        /* ── Video preview ── */
        .video-preview-wrap {
          position: relative;
          aspect-ratio: 16/9;
          border-radius: 16px;
          overflow: hidden;
          margin-bottom: 14px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.12);
        }
        .video-preview-wrap video {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .video-remove-btn {
          position: absolute;
          top: 10px;
          right: 10px;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1rem;
          font-weight: 700;
          color: #fff;
          background: rgba(15,23,42,0.6);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border: none;
          cursor: pointer;
          transition: background 0.18s;
        }
        .video-remove-btn:hover { background: rgba(239,68,68,0.85); }

        /* ── Progress bar ── */
        .upload-progress-wrap {
          width: 100%;
          padding: 0 2px;
        }
        .upload-progress-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.78rem;
          color: var(--text-muted, #94a3b8);
          margin-bottom: 8px;
          font-weight: 500;
        }
        .upload-progress-track {
          width: 100%;
          height: 6px;
          border-radius: 999px;
          background: rgba(100,116,139,0.15);
          overflow: hidden;
        }
        .upload-progress-fill {
          height: 100%;
          border-radius: 999px;
          background: linear-gradient(90deg, #f59e0b, #f472b6, #3b82f6);
          background-size: 200% 100%;
          transition: width 0.35s cubic-bezier(.22,1,.36,1);
          animation: shimmer 1.8s linear infinite;
        }
        @keyframes shimmer {
          0% { background-position: 200% center; }
          100% { background-position: -200% center; }
        }

        /* ── Success banner ── */
        .upload-success {
          width: 100%;
          padding: 1.25rem 1.5rem;
          border-radius: 20px;
          text-align: center;
          background: var(--success-bg);
          border: 1.5px solid var(--success-border);
          animation: slideDown 0.4s cubic-bezier(.22,1,.36,1);
        }
        @keyframes slideDown {
          from { opacity:0; transform:translateY(-16px) scale(0.97); }
          to { opacity:1; transform:translateY(0) scale(1); }
        }
        .success-emoji { font-size: 2rem; margin-bottom: 6px; display: block; }
        .success-title {
          font-size: 1rem;
          font-weight: 700;
          color: #16a34a;
          margin-bottom: 3px;
        }
        .success-sub { font-size: 0.8rem; color: var(--text-muted, #94a3b8); }

        /* ── Error banner ── */
        .upload-error {
          width: 100%;
          padding: 1rem 1.25rem;
          border-radius: 16px;
          background: var(--error-bg);
          border: 1.5px solid var(--error-border);
          font-size: 0.85rem;
          color: #ef4444;
          text-align: center;
          animation: slideDown 0.3s ease;
        }

        /* ── Submit button override ── */
        .upload-submit-btn {
          width: 100%;
          padding: 1rem 1.5rem;
          font-size: 1rem;
          font-weight: 700;
          letter-spacing: 0.02em;
          border-radius: 16px;
          transition: opacity 0.2s, transform 0.15s;
          min-height: 56px;
        }
        .upload-submit-btn:not(:disabled):active { transform: scale(0.97); }

        /* ── Divider ── */
        .upload-divider {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 12px;
          color: var(--text-muted, #94a3b8);
          font-size: 0.72rem;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .upload-divider::before,
        .upload-divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: rgba(100,116,139,0.15);
        }

        /* ── Mobile fine-tuning ── */
        @media (max-width: 480px) {
          .upload-content {
            padding-top: 6rem;
            gap: 1rem;
          }
          .upload-section .gcard-inner {
            padding: 1.25rem;
          }
          .photo-preview-grid {
            grid-template-columns: repeat(3,1fr);
            gap: 8px;
          }
          .upload-drop-zone {
            padding: 1.5rem 1rem;
          }
        }
      `}</style>

      <div className="min-h-screen bg-bg relative lp overflow-hidden upload-page">
        {/* Background elements to match landing page */}
        <div className="grain" />
        <div className="orbs">
          <div className="orb orb-primary" />
          <div className="orb orb-secondary" />
        </div>
        <FloatingParticles className="opacity-60" />

        {/* ── NAV ── */}
        <nav className="lp-nav scrolled" style={{ background: 'rgba(24, 24, 27, 0.95)', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <Link href="/">
            <AnimatedLogo width={150} height={50} />
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className={`upload-status-pill ${isConnected ? 'live' : 'offline'}`}>
              <span className="pulse-dot" style={{ background: isConnected ? '#22c55e' : '#f87171' }} />
              {isConnected ? 'Live' : 'Offline'}
            </span>
            {totalUploaded > 0 && (
              <span className="upload-sent-badge">
                ✓&nbsp;{totalUploaded} sent
              </span>
            )}
          </div>
        </nav>

        {/* ── Main content ── */}
        <div className="upload-content">

          {/* Header */}
          <div className="upload-header reveal visible">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
              <span className="kicker">Demo Wall</span>
              <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Session: {demoId}</span>
            </div>
            <h1 className="hero-h1">
              Share the <span className="gradient-text">Moment</span>
            </h1>
            <p className="hero-sub">Upload photos or a video — they appear on the live wall instantly.</p>
          </div>

          {/* ── Success banner ── */}
          {uploadSuccess && (
            <div className="upload-success">
              <span className="success-emoji">🎉</span>
              <p className="success-title">Posted to the wall!</p>
              <p className="success-sub">Your memories are now live for everyone to see.</p>
            </div>
          )}

          {/* ── Error banner ── */}
          {error && (
            <div className="upload-error">
              ⚠️ &nbsp;{error}
            </div>
          )}

          <div className="upload-layout-grid">
            <div className="upload-col-left">

              {/* ── Name & Caption card ── */}
          <div className="upload-section gcard reveal visible">
            <div className="gcard-border" />
            <div className="gcard-inner" style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              <div>
                <label className="upload-label">Your Name</label>
                <input
                  type="text"
                  className="upload-input"
                  placeholder="e.g. Sarah"
                  value={uploaderName}
                  onChange={e => setUploaderName(e.target.value)}
                  disabled={uploading}
                  maxLength={40}
                  autoComplete="given-name"
                />
              </div>
              <div>
                <label className="upload-label">
                  Caption&nbsp;<span style={{ fontWeight: 400, textTransform: 'none', fontSize: '0.7rem' }}>(optional)</span>
                </label>
                <textarea
                  className="upload-input upload-textarea"
                  placeholder="Write something about this moment…"
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  disabled={uploading}
                  maxLength={120}
                  rows={2}
                />
                <p className="char-count">{comment.length}/120</p>
              </div>
            </div>
          </div>

          {/* ── Photos card ── */}
          <div className="upload-section gcard reveal visible">
            <div className="gcard-border" />
            <div className="gcard-inner">
              <div className="upload-section-label">
                <span className="upload-section-title">
                  <span className="emoji">📷</span> Photos
                </span>
                <span className={`upload-count-pill ${(lifetimePhotos + uploadPhotos.length) > 0 ? 'filled' : 'empty'} ${(lifetimePhotos + uploadPhotos.length) >= MAX_IMAGES ? 'maxed' : ''}`}>
                  {lifetimePhotos + uploadPhotos.length}/{MAX_IMAGES}
                </span>
              </div>

              {/* Previews */}
              {uploadPhotos.length > 0 && (
                <div className="photo-preview-grid">
                  {uploadPhotos.map((photo, i) => (
                    <div key={i} className="photo-preview-item">
                      <img src={URL.createObjectURL(photo)} alt="" />
                      {!uploading && (
                        <button
                          className="photo-remove-btn"
                          onClick={() => removePhoto(i)}
                          aria-label="Remove photo"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Drop zone — uses lifetime quota */}
              {(() => {
                const totalUsed = lifetimePhotos + uploadPhotos.length;
                const slotsLeft = MAX_IMAGES - totalUsed;
                
                if (lifetimePhotos >= MAX_IMAGES && uploadPhotos.length === 0) {
                  return (
                    <div style={{
                      width: '100%', padding: '0.85rem 1rem', borderRadius: 14,
                      background: 'rgba(34,197,94,0.08)', border: '1.5px solid rgba(34,197,94,0.25)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      gap: 8, fontSize: '0.82rem', fontWeight: 600, color: '#16a34a',
                    }}>
                      ✓ Photo limit reached ({MAX_IMAGES}/{MAX_IMAGES} used)
                    </div>
                  );
                }
                return (
                  <div
                    className={`upload-drop-zone relative ${photoDragOver ? 'drag-over' : ''} ${uploading ? 'disabled' : ''}`}
                    onDragOver={e => { e.preventDefault(); if (totalUsed < MAX_IMAGES) setPhotoDragOver(true); }}
                    onDragLeave={() => setPhotoDragOver(false)}
                    onDrop={totalUsed < MAX_IMAGES ? handlePhotoDrop : (e => { e.preventDefault(); setPhotoDragOver(false); })}
                  >
                    <div className="drop-zone-icon">{uploadPhotos.length === 0 && lifetimePhotos === 0 ? '🖼️' : '➕'}</div>
                    <p className="drop-zone-text">
                      {totalUsed === 0
                        ? 'Select photos below'
                        : totalUsed >= MAX_IMAGES
                          ? 'Ready to upload (Limit reached)'
                          : `Add more — ${slotsLeft} slot${slotsLeft !== 1 ? 's' : ''} left`}
                    </p>
                    <div className="w-full relative mt-4 flex gap-2 z-30">
                      <label className={`btn btn-secondary flex-1 m-0 flex items-center justify-center ${totalUsed >= MAX_IMAGES ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                        {!uploading && totalUsed < MAX_IMAGES && (
                          <input
                            type="file"
                            accept="image/*,image/heic,image/heif"
                            multiple
                            onChange={handlePhotoSelect}
                            className="hidden"
                            title="Choose photos"
                          />
                        )}
                        {totalUsed === 0 ? 'Select Photos' : totalUsed >= MAX_IMAGES ? 'Limit Reached' : 'Add Photos'}
                      </label>
                      {uploadPhotos.length > 0 && (
                        <button 
                          type="button" 
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleUpload(); }} 
                          disabled={uploading}
                          className="btn-glow flex items-center justify-center w-12 h-12 flex-shrink-0 rounded-xl pointer-events-auto"
                          title="Upload Photos"
                        >
                          <Upload size={20} />
                        </button>
                      )}
                    </div>
                    <p className="drop-zone-hint mt-2">
                      {lifetimePhotos > 0
                        ? `${lifetimePhotos} already uploaded · ${totalUsed >= MAX_IMAGES ? '0 remaining' : slotsLeft + ' remaining'}`
                        : `JPG, PNG, HEIC — up to ${MAX_IMAGES} total`}
                    </p>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* ── Video card ── */}
          <div className="upload-section gcard reveal visible">
            <div className="gcard-border" />
            <div className="gcard-inner">
              <div className="upload-section-label">
                <span className="upload-section-title">
                  <span className="emoji">🎥</span> Video
                </span>
                <span className={`upload-count-pill ${(lifetimeVideos + uploadVideos.length) > 0 ? 'filled' : 'empty'} ${(lifetimeVideos + uploadVideos.length) >= MAX_VIDEOS ? 'maxed' : ''}`}>
                  {lifetimeVideos + uploadVideos.length}/{MAX_VIDEOS}
                </span>
              </div>

              {uploadVideos.length > 0 && (
                <div className="video-preview-wrap">
                  <video
                    src={URL.createObjectURL(uploadVideos[0])}
                    muted
                    playsInline
                    preload="metadata"
                  />
                  {!uploading && (
                    <button className="video-remove-btn" onClick={removeVideo} aria-label="Remove video">
                      ×
                    </button>
                  )}
                </div>
              )}

              {(() => {
                const totalUsed = lifetimeVideos + uploadVideos.length;
                
                if (lifetimeVideos >= MAX_VIDEOS && uploadVideos.length === 0) {
                  return (
                    <div style={{
                      width: '100%', padding: '0.85rem 1rem', borderRadius: 14,
                      background: 'rgba(34,197,94,0.08)',
                      border: '1.5px solid rgba(34,197,94,0.25)',
                      display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                      gap: 8, fontSize: '0.82rem', fontWeight: 600, color: '#16a34a',
                    }}>
                      ✓ Video limit reached ({MAX_VIDEOS}/{MAX_VIDEOS} used)
                    </div>
                  );
                }
                
                return (
                  <div
                    className={`upload-drop-zone relative ${videoDragOver ? 'drag-over' : ''} ${uploading ? 'disabled' : ''}`}
                    onDragOver={e => { e.preventDefault(); if (totalUsed < MAX_VIDEOS) setVideoDragOver(true); }}
                    onDragLeave={() => setVideoDragOver(false)}
                    onDrop={totalUsed < MAX_VIDEOS ? handleVideoDrop : (e => { e.preventDefault(); setVideoDragOver(false); })}
                  >
                    {!uploading && totalUsed < MAX_VIDEOS && (
                      <input
                        type="file"
                        accept="video/*"
                        onChange={handleVideoSelect}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        title="Choose video"
                      />
                    )}
                    <div className="drop-zone-icon">🎬</div>
                    <p className="drop-zone-text">{totalUsed >= MAX_VIDEOS ? 'Ready to upload' : 'Tap to select a video'}</p>
                    <div className="w-full relative mt-4 flex gap-2 z-30 pointer-events-none">
                      <button type="button" className={`btn btn-secondary flex-1 ${totalUsed >= MAX_VIDEOS ? 'opacity-50' : ''}`}>
                        {totalUsed >= MAX_VIDEOS ? 'Limit Reached' : 'Select Video'}
                      </button>
                      {uploadVideos.length > 0 && (
                        <button 
                          type="button" 
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleUpload(); }} 
                          disabled={uploading}
                          className="btn-glow flex items-center justify-center w-12 h-12 flex-shrink-0 rounded-xl pointer-events-auto"
                          title="Upload Video"
                        >
                          <Upload size={20} />
                        </button>
                      )}
                    </div>
                    <p className="drop-zone-hint mt-2">MP4, MOV, WEBM — 1 video maximum</p>
                  </div>
                );
              })()}
            </div>
            </div>
          </div>

          <div className="upload-col-right">

            {/* ── Live preview card — shows name + caption as they'll appear on the wall ── */}
          {(uploaderName.trim() || comment.trim() || totalFiles > 0) && !uploading && (
            <div className="upload-section gcard reveal visible" style={{ animationDelay: '0.05s' }}>
              <div className="gcard-border" />
              <div className="gcard-inner" style={{ padding: '1.1rem 1.4rem' }}>
                <p className="upload-label" style={{ marginBottom: '0.65rem' }}>Preview on wall</p>
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.75rem',
                }}>
                  {/* Avatar circle */}
                  <div style={{
                    flexShrink: 0,
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #f59e0b, #f472b6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontWeight: 800,
                    fontSize: '1rem',
                    letterSpacing: '-0.02em',
                  }}>
                    {uploaderName.trim() ? uploaderName.trim().charAt(0).toUpperCase() : '?'}
                  </div>
                  {/* Name + caption */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      color: 'var(--text-primary, #ffffff)',
                      marginBottom: '2px',
                      lineHeight: 1.3,
                    }}>
                      {uploaderName.trim() || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontWeight: 400 }}>Your name</span>}
                    </p>
                    <p style={{
                      fontSize: '0.82rem',
                      color: 'var(--text-secondary, #cbd5e1)',
                      lineHeight: 1.45,
                      wordBreak: 'break-word',
                    }}>
                      {comment.trim() || (
                        <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                          {totalFiles > 0 ? (uploadVideos.length > 0 ? '🎥 Live Video!' : '📸 Live Photo!') : 'No caption'}
                        </span>
                      )}
                    </p>
                    {(totalFiles > 0 || lifetimePhotos > 0 || lifetimeVideos > 0) && (
                      <p style={{
                        fontSize: '0.7rem',
                        color: 'var(--text-muted)',
                        marginTop: '5px',
                        fontWeight: 600,
                      }}>
                        {totalFiles > 0 && (
                          <>
                            {uploadPhotos.length > 0 && `${uploadPhotos.length} photo${uploadPhotos.length !== 1 ? 's' : ''}`}
                            {uploadPhotos.length > 0 && uploadVideos.length > 0 && ' · '}
                            {uploadVideos.length > 0 && '1 video'}
                            {' · ready to share'}
                          </>
                        )}
                        {lifetimePhotos > 0 && totalFiles === 0 && `${lifetimePhotos} photo${lifetimePhotos !== 1 ? 's' : ''} already sent`}
                        {lifetimeVideos > 0 && lifetimePhotos === 0 && totalFiles === 0 && '1 video already sent'}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Divider ── */}
          {totalFiles > 0 && !uploading && (
            <div className="upload-divider">
              {totalFiles} file{totalFiles !== 1 ? 's' : ''} ready
            </div>
          )}

          {/* ── Progress bar ── */}
          {uploading && (
            <div className="upload-progress-wrap">
              <div className="upload-progress-header">
                <span>{status}</span>
                <span style={{ fontWeight: 700, color: 'var(--text-secondary, #cbd5e1)' }}>{progress}%</span>
              </div>
              <div className="upload-progress-track">
                <div className="upload-progress-fill" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}


          
          </div>
        </div>
      </div>

        {/* ── Footer Nav for Live Demo Wall ── */}
        <footer style={{
           position: 'fixed', bottom: 0, left: 0, right: 0, height: '6rem',
           borderTop: '1px solid rgba(255, 255, 255, 0.1)', background: 'rgba(24, 24, 27, 0.95)',
           backdropFilter: 'blur(12px)', zIndex: 100, display: 'flex', alignItems: 'center',
           justifyContent: 'center', paddingBottom: '1rem'
        }}>
           <Link href={`/?id=${demoId}&demo=true`} style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.875rem',
              fontWeight: 700, color: 'rgba(255, 255, 255, 0.8)', textDecoration: 'none'
           }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
              View Wall Experience
           </Link>
        </footer>

      </div>
    </>
  );
}

export default function DemoUploadPage() {
  return (
    <Suspense fallback={
      <div className="lp min-h-screen flex items-center justify-center">
        <span style={{ color: 'var(--text-secondary)' }}>Loading…</span>
      </div>
    }>
      <DemoUploadContent />
    </Suspense>
  );
}