"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { QRCodeSVG } from 'qrcode.react';
import {
  clearDemoData,
  DemoMedia,
  getDemoPhotosKey,
  getDemoTimeLeft,
  getOrCreateDemoExpiry,
  getOrCreateDemoId,
  readDemoPhotos,
  writeDemoPhotos,
  upsertDemoPhoto,
} from '@/lib/demoWall';
import AnimatedLogo from '@/components/AnimatedLogo';
import '../landing.css';

// Upload constants
const MAX_IMAGES = 5;
const MAX_VIDEOS = 1;
const ACCEPTED_IMAGE_TYPES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/heic', 'image/heif']);
const ACCEPTED_VIDEO_TYPES = new Set(['video/mp4']);
const ACCEPTED_IMAGE_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'heic', 'heif']);
const ACCEPTED_VIDEO_EXTENSIONS = new Set(['mp4']);

// ✅ FIX: single source of truth for channel name
// broadcastUpload() and the subscriber MUST use the same name
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
  if (file.type === 'image/heic' || file.type === 'image/heif') return file;
  try {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) return file;
    const image = new Image();
    image.src = URL.createObjectURL(file);
    await new Promise((resolve) => { image.onload = resolve; });
    const MAX_WIDTH = 1920, MAX_HEIGHT = 1080;
    let width = image.width, height = image.height;
    if (width > MAX_WIDTH || height > MAX_HEIGHT) {
      const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);
      width = Math.round(width * ratio);
      height = Math.round(height * ratio);
    }
    canvas.width = width;
    canvas.height = height;
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
    const blob = await new Promise<Blob | null>((resolve) => { canvas.toBlob(resolve, outputType, 0.92); });
    if (!blob || blob.size >= file.size) return file;
    const nextExtension = outputType === 'image/png' ? 'png' : 'jpg';
    return new File([blob], file.name.replace(/\.[^.]+$/, `.${nextExtension}`), { type: outputType, lastModified: Date.now() });
  } catch { return file; }
}

// ✅ FIX: uses getDemoChannelName() so it always matches the subscriber
async function broadcastUpload(demoId: string, payload: DemoMedia) {
  const channel = supabase.channel(getDemoChannelName(demoId));
  await channel.send({ type: 'broadcast', event: 'NEW_UPLOAD', payload });
  supabase.removeChannel(channel);
}

type ViewMode = 'grid' | 'polaroid' | 'slideshow';
function isViewMode(value: string): value is ViewMode {
  return value === 'grid' || value === 'polaroid' || value === 'slideshow';
}
function mergeDemoMedia(items: DemoMedia[], incoming: DemoMedia) {
  return [incoming, ...items.filter((item) => item.id !== incoming.id && item.url !== incoming.url)];
}

export default function DemoPage() {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [demoId, setDemoId] = useState<string>('');
  const [photos, setPhotos] = useState<DemoMedia[]>([]);
  const [timeLeft, setTimeLeft] = useState(300);
  const [isConnected, setIsConnected] = useState(false);
  const [uploadUrl, setUploadUrl] = useState('');

  const [uploadPhotos, setUploadPhotos] = useState<File[]>([]);
  const [uploadVideos, setUploadVideos] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      if (isViewMode(hash)) setViewMode(hash);
    };
    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    const newDemoId = getOrCreateDemoId(new URLSearchParams(window.location.search).get('id'));
    const expiryAt = getOrCreateDemoExpiry(newDemoId);
    const syncCountdown = () => {
      const remainingSeconds = Math.ceil(getDemoTimeLeft(newDemoId) / 1000);
      setTimeLeft(remainingSeconds);
      if (remainingSeconds <= 0) {
        clearDemoData(newDemoId);
        window.location.href = '/demo';
      }
    };
    setDemoId(newDemoId);
    setPhotos(readDemoPhotos(newDemoId));
    setTimeLeft(Math.max(0, Math.ceil((expiryAt - Date.now()) / 1000)));
    syncCountdown();
    const timerInterval = setInterval(syncCountdown, 1000);
    return () => clearInterval(timerInterval);
  }, []);

  useEffect(() => {
    if (!demoId) return;

    const syncFromStorage = () => setPhotos(readDemoPhotos(demoId));
    syncFromStorage();

    const handleStorage = (event: StorageEvent) => {
      if (!event.key || event.key === getDemoPhotosKey(demoId)) syncFromStorage();
    };
    window.addEventListener('storage', handleStorage);

    const addPhoto = (newPhoto: DemoMedia) => {
      setPhotos(prev => {
        const updatedPhotos = mergeDemoMedia(prev, newPhoto);
        writeDemoPhotos(demoId, updatedPhotos);
        return updatedPhotos;
      });
    };

    // Primary: postgres_changes on demo_uploads (reliable cross-device)
    console.log('[DEMO WALL] Setting up postgres_changes for demo_id:', demoId);
    const dbChannel = supabase
      .channel(`demo-db-${demoId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'demo_uploads', filter: `demo_id=eq.${demoId}` },
        (payload) => {
          console.log('[DEMO WALL] Received postgres_changes payload:', payload);
          const row = payload.new as { id: string; url: string; type: string; caption: string; uploader: string; created_at: string };
          if (!row.url || !row.type) {
            console.log('[DEMO WALL] Invalid payload - missing url or type');
            return;
          }
          console.log('[DEMO WALL] Adding photo to wall:', row);
          addPhoto({
            id: row.id,
            url: row.url,
            type: row.type === 'video' ? 'video' : 'image',
            caption: row.caption || '',
            uploader: row.uploader || 'Demo Guest',
            createdAt: new Date(row.created_at).getTime(),
          });
        }
      )
      .subscribe((status) => {
        console.log('[DEMO WALL] postgres_changes subscription status:', status);
        setIsConnected(status === 'SUBSCRIBED');
      });

    // Fallback: broadcast (same-browser backup)
    const bcastChannel = supabase.channel(getDemoChannelName(demoId));
    bcastChannel.on('broadcast', { event: 'NEW_UPLOAD' }, (payload) => {
      const data = payload.payload as Partial<DemoMedia>;
      if (!data.url || !data.type) return;
      addPhoto({
        id: String(data.id || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`),
        url: data.url,
        type: data.type === 'video' ? 'video' : 'image',
        caption: data.caption || '',
        uploader: data.uploader || 'Demo Guest',
        createdAt: typeof data.createdAt === 'number' ? data.createdAt : Date.now(),
      });
    });
    bcastChannel.subscribe();

    return () => {
      window.removeEventListener('storage', handleStorage);
      supabase.removeChannel(dbChannel);
      supabase.removeChannel(bcastChannel);
    };
  }, [demoId]);

  // Polling fallback: re-fetch demo_uploads every 5s in case realtime is delayed
  useEffect(() => {
    console.log('[DEMO WALL] Starting polling for demo_id:', demoId);
    if (!demoId) return;
    const poll = async () => {
      console.log('[DEMO WALL] Polling demo_uploads for demo_id:', demoId);
      const { data, error } = await supabase
        .from('demo_uploads')
        .select('*')
        .eq('demo_id', demoId)
        .order('created_at', { ascending: false })
        .limit(20);
      console.log('[DEMO WALL] Poll result:', { data, error });
      if (!data?.length) {
        console.log('[DEMO WALL] No data found in poll');
        return;
      }
      console.log('[DEMO WALL] Found', data.length, 'rows in poll');
      setPhotos(prev => {
        let updated = [...prev];
        for (const row of data) {
          const incoming: DemoMedia = {
            id: row.id,
            url: row.url,
            type: row.type === 'video' ? 'video' : 'image',
            caption: row.caption || '',
            uploader: row.uploader || 'Demo Guest',
            createdAt: new Date(row.created_at).getTime(),
          };
          updated = mergeDemoMedia(updated, incoming);
        }
        writeDemoPhotos(demoId, updated);
        return updated;
      });
    };
    poll(); // immediate on mount
    const interval = setInterval(poll, 2000); // poll every 2s
    return () => clearInterval(interval);
  }, [demoId]);

  useEffect(() => {
    if (photos.length > 0 && currentSlide >= photos.length) setCurrentSlide(0);
  }, [currentSlide, photos.length]);

  useEffect(() => {
    if (viewMode === 'slideshow' && isPlaying && photos.length > 1) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % photos.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [viewMode, isPlaying, photos.length]);

  useEffect(() => {
    if (demoId) setUploadUrl(`${window.location.origin}/demo/upload?id=${demoId}`);
  }, [demoId]);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validPhotos = files.filter(isAcceptedImage);
    const invalidFiles = files.filter(f => !isAcceptedImage(f));
    if (invalidFiles.length > 0) {
      setValidationMessage(`Invalid files: ${invalidFiles.map(f => f.name).join(', ')}`);
      setTimeout(() => setValidationMessage(null), 5000);
      return;
    }
    if (uploadPhotos.length + validPhotos.length > MAX_IMAGES) {
      setValidationMessage(`Maximum ${MAX_IMAGES} photos allowed`);
      setTimeout(() => setValidationMessage(null), 5000);
      return;
    }
    setUploadPhotos(prev => [...prev, ...validPhotos]);
    setUploadError(null);
  };

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validVideos = files.filter(isAcceptedVideo);
    const invalidFiles = files.filter(f => !isAcceptedVideo(f));
    if (invalidFiles.length > 0) {
      setValidationMessage(`Invalid video format: ${invalidFiles.map(f => f.name).join(', ')}`);
      setTimeout(() => setValidationMessage(null), 5000);
      return;
    }
    if (uploadVideos.length + validVideos.length > MAX_VIDEOS) {
      setValidationMessage(`Maximum ${MAX_VIDEOS} video allowed`);
      setTimeout(() => setValidationMessage(null), 5000);
      return;
    }
    setUploadVideos(prev => [...prev, ...validVideos]);
    setUploadError(null);
  };

  const removePhoto = (index: number) => setUploadPhotos(prev => prev.filter((_, i) => i !== index));
  const removeVideo = (index: number) => setUploadVideos(prev => prev.filter((_, i) => i !== index));

  const handleUpload = async () => {
    if (uploadPhotos.length === 0 && uploadVideos.length === 0) {
      setUploadError('Please select at least one photo or video');
      return;
    }
    setUploading(true);
    setUploadError(null);
    setUploadProgress(0);
    try {
      const allFiles = [...uploadPhotos, ...uploadVideos];
      let uploadedCount = 0;
      for (const file of allFiles) {
        const type = file.type.startsWith('video/') ? 'video' : 'image';
        const fileName = `${demoId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${type === 'video' ? 'mp4' : 'jpg'}`;
        const preparedFile = type === 'image' ? await compressDemoImage(file) : file;
        setUploadProgress(Math.round((uploadedCount / allFiles.length) * 50));
        const { data, error } = await supabase.storage.from('photos').upload(fileName, preparedFile);
        if (error) throw error;
        if (data) {
          const { data: { publicUrl } } = supabase.storage.from('photos').getPublicUrl(data.path);
          const payload: DemoMedia = {
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            url: publicUrl,
            type,
            caption: type === 'video' ? '🎥 Live Video from Demo!' : '📸 Live Photo from Demo!',
            uploader: 'Demo Guest',
            createdAt: Date.now(),
          };
          upsertDemoPhoto(demoId, payload);
          await broadcastUpload(demoId, payload);
        }
        uploadedCount++;
        setUploadProgress(Math.round(50 + (uploadedCount / allFiles.length) * 45));
      }
      setUploadProgress(100);
      setUploading(false);
      setUploadPhotos([]);
      setUploadVideos([]);
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (err: any) {
      setUploading(false);
      setUploadError(err.message || 'Upload failed. Please try again.');
    }
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  // Debug: manual refresh function
  const manualRefresh = async () => {
    console.log('[DEMO WALL] Manual refresh triggered');
    if (!demoId) return;
    const { data, error } = await supabase
      .from('demo_uploads')
      .select('*')
      .eq('demo_id', demoId)
      .order('created_at', { ascending: false })
      .limit(20);
    console.log('[DEMO WALL] Manual refresh result:', { data, error });
    if (!data?.length) {
      console.log('[DEMO WALL] No data found in manual refresh');
      return;
    }
    console.log('[DEMO WALL] Manual refresh found', data.length, 'rows');
    setPhotos(prev => {
      let updated = [...prev];
      for (const row of data) {
        const incoming: DemoMedia = {
          id: row.id,
          url: row.url,
          type: row.type === 'video' ? 'video' : 'image',
          caption: row.caption || '',
          uploader: row.uploader || 'Demo Guest',
          createdAt: new Date(row.created_at).getTime(),
        };
        updated = mergeDemoMedia(updated, incoming);
      }
      writeDemoPhotos(demoId, updated);
      return updated;
    });
  };

  const EmptyState = () => (
    <div className="text-center py-20 reveal visible">
      <div className="feat-icon mx-auto mb-6" style={{ width: 72, height: 72, fontSize: '2rem' }}>📷</div>
      <h2 className="sec-h2" style={{ fontSize: '1.8rem' }}>No Photos Yet</h2>
      <p className="sec-sub" style={{ fontSize: '1rem' }}>Scan the QR code above to upload the first photo!</p>
    </div>
  );

  return (
    <div className="lp pb-12 min-h-screen">

      {/* NAV — same as landing */}
      <nav className="lp-nav scrolled">
        <Link href="/">
          <AnimatedLogo width={180} height={60} />
        </Link>
        <div className="flex items-center gap-4">
          {user ? (
            <Link href="/dashboard" className="btn-outline" style={{ padding: '0.5rem 1.2rem', fontSize: '0.95rem' }}>
              Dashboard
            </Link>
          ) : (
            <>
              <Link href="/auth" className="btn-outline" style={{ padding: '0.5rem 1.2rem', fontSize: '0.95rem' }}>
                Sign In
              </Link>
              <Link href="/#pricing" className="btn-glow" style={{ padding: '0.55rem 1.4rem', fontSize: '0.95rem' }}>
                Create a Wall
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Connection badge */}
      <div className="fixed bottom-4 left-4 z-50">
        <span className="hero-badge" style={{ gap: 8 }}>
          <span className={`pulse-dot ${isConnected ? '' : 'opacity-40'}`}
            style={{ background: isConnected ? '#4ade80' : '#f87171' }} />
          <span className="text-xs font-bold tracking-widest uppercase"
            style={{ color: isConnected ? '#16a34a' : '#dc2626' }}>
            {isConnected ? 'Wall Live' : 'Connecting...'}
          </span>
          <span className="text-xs font-bold" style={{ color: 'var(--amber)' }}>· {photos.length} photos</span>
          <button onClick={manualRefresh} className="text-xs font-bold" style={{ color: 'var(--text3)', padding: '2px 6px', background: 'rgba(30,41,59,0.1)', borderRadius: '4px' }}>
            🔄 Refresh
          </button>
        </span>
      </div>

      <div className="px-4 pt-28">
        <div className="max-w-7xl mx-auto">

          {/* ── HERO TITLE — matches landing style ── */}
          <div className="text-center mb-10 reveal visible">
            <span className="kicker">Live Demo</span>
            <h1 className="hero-h1" style={{ fontSize: 'clamp(2.4rem, 6vw, 4.5rem)', marginBottom: '0.75rem' }}>
              Your Event Wall,
              <br />
              <span className="gradient-text">In Real Time.</span>
            </h1>
            <p className="hero-p" style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>
              Scan the QR code from any phone to post photos instantly to this wall.
            </p>

            {/* Status badges */}
            <div className="flex justify-center items-center gap-3 mb-8 flex-wrap">
              <span className="hero-badge" style={{ gap: 8 }}>
                <span className={`pulse-dot ${isConnected ? '' : 'opacity-30'}`}
                  style={{ background: isConnected ? '#4ade80' : '#f87171' }} />
                <span style={{ color: isConnected ? '#16a34a' : '#dc2626' }}>
                  {isConnected ? 'WALL ACTIVE' : 'CONNECTING...'}
                </span>
              </span>
              <span className="hero-badge" style={{ color: 'var(--rose)' }}>
                ⏱ Resets in {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
              </span>
              <span className="hero-badge" style={{ color: 'var(--amber)' }}>
                {photos.length} {photos.length === 1 ? 'photo' : 'photos'}
              </span>
            </div>

            {/* QR Code */}
            <div className="inline-block">
              <div className="gcard" style={{ display: 'inline-block' }}>
                <div className="gcard-border" />
                <div className="gcard-inner" style={{ padding: '1.25rem' }}>
                  {uploadUrl
                    ? <QRCodeSVG value={uploadUrl} size={160} level="M" />
                    : <div style={{ width: 160, height: 160 }} />
                  }
                  <p className="text-center mt-3 text-sm font-semibold" style={{ color: 'var(--text2)', letterSpacing: '0.04em' }}>
                    Scan to post photos
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ── UPLOAD SECTION ── */}
          <div className="max-w-md mx-auto mb-10">

            {/* Alerts */}
            {validationMessage && (
              <div className="gcard mb-4" style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)' }}>
                <div className="gcard-inner py-3 text-center">
                  <p className="text-sm font-semibold" style={{ color: '#d97706' }}>{validationMessage}</p>
                </div>
              </div>
            )}
            {uploadSuccess && (
              <div className="gcard mb-4" style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)' }}>
                <div className="gcard-inner py-3 text-center">
                  <p className="text-sm font-semibold" style={{ color: '#16a34a' }}>🎉 Uploaded successfully! Check the wall below.</p>
                </div>
              </div>
            )}
            {uploadError && (
              <div className="gcard mb-4" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
                <div className="gcard-inner py-3 text-center">
                  <p className="text-sm font-semibold" style={{ color: '#dc2626' }}>{uploadError}</p>
                </div>
              </div>
            )}

            {/* Photos card */}
            <div className="gcard mb-4">
              <div className="gcard-border" />
              <div className="gcard-inner">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-bold text-base" style={{ color: 'var(--text1)' }}>
                    Photos
                    <span className="ml-2 text-sm font-normal" style={{ color: 'var(--text3)' }}>({uploadPhotos.length}/{MAX_IMAGES})</span>
                  </h2>
                  {!uploading && uploadPhotos.length < MAX_IMAGES && (
                    <button onClick={() => photoInputRef.current?.click()} className="btn-outline"
                      style={{ padding: '0.35rem 0.9rem', fontSize: '0.82rem' }}>+ Add</button>
                  )}
                </div>
                <input type="file" accept=".jpg,.jpeg,.png,.heic,.heif,image/jpeg,image/png,image/heic,image/heif"
                  multiple ref={photoInputRef} onChange={handlePhotoSelect} className="hidden" />

                {uploadPhotos.length === 0 ? (
                  <button onClick={() => photoInputRef.current?.click()}
                    className="w-full py-10 rounded-2xl text-center transition-all"
                    style={{ background: 'rgba(245,158,11,0.05)', border: '2px dashed rgba(245,158,11,0.3)' }}>
                    <span className="text-3xl block mb-2">🖼️</span>
                    <p className="text-sm font-semibold" style={{ color: 'var(--amber)' }}>Tap to select photos</p>
                    <p className="text-xs mt-1" style={{ color: 'var(--text3)' }}>JPG, PNG, HEIC · Max {MAX_IMAGES}</p>
                  </button>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {uploadPhotos.map((p, i) => (
                      <div key={i} className="relative aspect-square rounded-xl overflow-hidden"
                        style={{ boxShadow: '0 4px 12px rgba(30,41,59,0.08)' }}>
                        <img src={URL.createObjectURL(p)} alt="preview" className="w-full h-full object-cover" />
                        {!uploading && (
                          <button onClick={() => removePhoto(i)}
                            className="absolute top-1 right-1 w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold text-white"
                            style={{ background: '#ef4444' }}>×</button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Videos card */}
            <div className="gcard mb-4">
              <div className="gcard-border" />
              <div className="gcard-inner">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-bold text-base" style={{ color: 'var(--text1)' }}>
                    Video
                    <span className="ml-2 text-sm font-normal" style={{ color: 'var(--text3)' }}>({uploadVideos.length}/{MAX_VIDEOS})</span>
                  </h2>
                  {!uploading && uploadVideos.length < MAX_VIDEOS && (
                    <button onClick={() => videoInputRef.current?.click()} className="btn-outline"
                      style={{ padding: '0.35rem 0.9rem', fontSize: '0.82rem' }}>+ Add</button>
                  )}
                </div>
                <input type="file" accept=".mp4,video/mp4" ref={videoInputRef} onChange={handleVideoSelect} className="hidden" />

                {uploadVideos.length === 0 ? (
                  <button onClick={() => videoInputRef.current?.click()}
                    className="w-full py-10 rounded-2xl text-center transition-all"
                    style={{ background: 'rgba(245,158,11,0.05)', border: '2px dashed rgba(245,158,11,0.3)' }}>
                    <span className="text-3xl block mb-2">🎥</span>
                    <p className="text-sm font-semibold" style={{ color: 'var(--amber)' }}>Tap to select video</p>
                    <p className="text-xs mt-1" style={{ color: 'var(--text3)' }}>MP4 · Max {MAX_VIDEOS}</p>
                  </button>
                ) : (
                  <div className="space-y-2">
                    {uploadVideos.map((v, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-xl"
                        style={{ background: 'rgba(30,41,59,0.04)' }}>
                        <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-black">
                          <video src={URL.createObjectURL(v)} className="w-full h-full object-cover" muted />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate" style={{ color: 'var(--text1)' }}>{v.name}</p>
                          <p className="text-xs" style={{ color: 'var(--text3)' }}>{(v.size / 1024 / 1024).toFixed(1)} MB</p>
                        </div>
                        {!uploading && (
                          <button onClick={() => removeVideo(i)}
                            className="w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold text-white flex-shrink-0"
                            style={{ background: '#ef4444' }}>×</button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Progress bar */}
            {uploading && (
              <div className="gcard mb-4">
                <div className="gcard-border" />
                <div className="gcard-inner py-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium" style={{ color: 'var(--text1)' }}>Uploading...</span>
                    <span className="text-sm font-bold" style={{ color: 'var(--amber)' }}>{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'rgba(30,41,59,0.08)' }}>
                    <div className="h-full transition-all duration-300 ease-out rounded-full"
                      style={{ width: `${uploadProgress}%`, background: 'linear-gradient(90deg, var(--amber), var(--rose))' }} />
                  </div>
                </div>
              </div>
            )}

            {/* Upload button */}
            <button onClick={handleUpload}
              disabled={uploading || (uploadPhotos.length === 0 && uploadVideos.length === 0)}
              className="btn-glow w-full"
              style={{ opacity: uploading || (uploadPhotos.length === 0 && uploadVideos.length === 0) ? 0.55 : 1 }}>
              <span>{uploading ? 'Uploading...' : '📸 Share to Live Wall'}</span>
            </button>
          </div>

          {/* ── VIEW MODE TABS ── */}
          <div className="flex justify-center gap-2 mb-8">
            {(['grid', 'polaroid', 'slideshow'] as const).map((mode) => (
              <button key={mode}
                onClick={() => { setViewMode(mode); window.location.hash = mode; }}
                className={viewMode === mode ? 'btn-glow' : 'btn-outline'}
                style={{ padding: '0.55rem 1.4rem', fontSize: '0.9rem', textTransform: 'capitalize' }}>
                {mode === 'grid' ? '⊞ Grid' : mode === 'polaroid' ? '🎞 Polaroid' : '▶ Slideshow'}
              </button>
            ))}
          </div>

          {/* ── GRID VIEW ── */}
          {viewMode === 'grid' && (
            photos.length === 0 ? <EmptyState /> : (
              <div className="gallery-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
                {photos.map((photo, i) => (
                  <div key={photo.id || i} className="gallery-item" style={{ animationDelay: `${i * 0.08}s` }}>
                    <div className="gallery-img-wrapper">
                      {photo.type === 'video'
                        ? <video src={photo.url} className="gallery-img" autoPlay muted loop playsInline preload="metadata" />
                        : <img src={photo.url} className="gallery-img" alt={photo.caption} loading="lazy" />
                      }
                      <div className="gallery-overlay">
                        <h3 className="gallery-title">{photo.caption}</h3>
                        <p className="gallery-count">by {photo.uploader}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {/* ── POLAROID VIEW ── */}
          {viewMode === 'polaroid' && (
            photos.length === 0 ? <EmptyState /> : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '2rem', justifyItems: 'center' }}>
                {photos.map((photo, i) => (
                  <div key={photo.id || i}
                    style={{ animation: 'polaroid-drift 8s ease-in-out infinite alternate', animationDelay: `${i * 0.5}s`, width: '100%', maxWidth: 220 }}>
                    <div className="gcard" style={{ transform: i % 2 === 0 ? 'rotate(-3deg)' : 'rotate(3deg)', transition: 'transform 0.3s' }}>
                      <div className="gcard-border" />
                      <div className="gcard-inner" style={{ padding: '0.75rem 0.75rem 1.5rem' }}>
                        <div className="aspect-square rounded-xl overflow-hidden mb-3">
                          {photo.type === 'video'
                            ? <video src={photo.url} className="w-full h-full object-cover" autoPlay muted loop playsInline preload="metadata" />
                            : <img src={photo.url} className="w-full h-full object-cover" alt={photo.caption} loading="lazy" />
                          }
                        </div>
                        <p className="text-xs text-center font-medium" style={{ color: 'var(--text2)' }}>{photo.caption}</p>
                        <p className="text-xs text-center mt-1" style={{ color: 'var(--text3)' }}>by {photo.uploader}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {/* ── SLIDESHOW VIEW ── */}
          {viewMode === 'slideshow' && (
            photos.length === 0 ? <EmptyState /> : (
              <div className="max-w-4xl mx-auto">
                <div className="gcard relative overflow-hidden"
                  style={{ aspectRatio: '16/9' }}
                  onMouseEnter={() => setIsPlaying(false)}
                  onTouchStart={() => setIsPlaying(false)}>
                  <div className="gcard-border" />
                  <div className="flex items-center justify-center h-full relative">
                    {photos[currentSlide].type === 'video'
                      ? <video src={photos[currentSlide].url} className="w-full h-full object-contain absolute transition-opacity duration-500" autoPlay muted loop playsInline preload="metadata" />
                      : <img src={photos[currentSlide].url} className="w-full h-full object-contain absolute transition-opacity duration-500" alt={photos[currentSlide].caption} />
                    }
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-6 z-10"
                    style={{ background: 'linear-gradient(to top, rgba(30,41,59,0.8), transparent)' }}>
                    <h3 className="text-xl font-semibold text-white drop-shadow-lg">{photos[currentSlide].caption}</h3>
                    <p className="text-sm drop-shadow-md" style={{ color: 'var(--amber)' }}>by {photos[currentSlide].uploader}</p>
                  </div>
                  <button onClick={() => setIsPlaying(!isPlaying)}
                    className="absolute bottom-6 right-6 z-20 feat-icon"
                    style={{ width: 44, height: 44, color: 'var(--text1)' }}>
                    {isPlaying
                      ? <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>
                      : <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>}
                  </button>
                </div>

                <div className="flex justify-center gap-2 mt-4 flex-wrap">
                  {photos.map((_, index) => (
                    <button key={index} onClick={() => setCurrentSlide(index)}
                      className="rounded-full transition-all"
                      style={{
                        width: index === currentSlide ? 24 : 8,
                        height: 8,
                        background: index === currentSlide ? 'var(--amber)' : 'rgba(30,41,59,0.15)',
                      }} />
                  ))}
                </div>
              </div>
            )
          )}

          {/* CTA at bottom */}
          <div className="text-center mt-16 pt-8" style={{ borderTop: '1px solid var(--border)' }}>
            <p className="sec-sub" style={{ fontSize: '1rem', marginBottom: '1rem' }}>
              Ready to create your own wall?
            </p>
            <Link href="/#pricing" className="btn-glow">
              <span>Get Started</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}