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
import './landing.css';

// Upload constants
const MAX_IMAGES = 5;
const MAX_VIDEOS = 1;
const ACCEPTED_IMAGE_TYPES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/heic', 'image/heif']);
const ACCEPTED_VIDEO_TYPES = new Set(['video/mp4']);
const ACCEPTED_IMAGE_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'heic', 'heif']);
const ACCEPTED_VIDEO_EXTENSIONS = new Set(['mp4']);

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
  if (file.type === 'image/heic' || file.type === 'image/heif') {
    return file;
  }
  try {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) return file;
    const image = new Image();
    image.src = URL.createObjectURL(file);
    await new Promise((resolve) => {
      image.onload = resolve;
    });
    const MAX_WIDTH = 1920;
    const MAX_HEIGHT = 1080;
    let width = image.width;
    let height = image.height;
    if (width > MAX_WIDTH || height > MAX_HEIGHT) {
      const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);
      width = Math.round(width * ratio);
      height = Math.round(height * ratio);
    }
    canvas.width = width;
    canvas.height = height;
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, outputType, 0.92);
    });
    if (!blob || blob.size >= file.size) return file;
    const nextExtension = outputType === 'image/png' ? 'png' : 'jpg';
    const nextName = file.name.replace(/\.[^.]+$/, `.${nextExtension}`);
    return new File([blob], nextName, { type: outputType, lastModified: Date.now() });
  } catch {
    return file;
  }
}
async function broadcastUpload(demoId: string, payload: DemoMedia) {
  const channel = supabase.channel(`demo-${demoId}`);
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
  
  // Upload states
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
      if (isViewMode(hash)) {
        setViewMode(hash);
      }
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
    const timerInterval = setInterval(() => {
      syncCountdown();
    }, 1000);

    return () => clearInterval(timerInterval);
  }, []);

  useEffect(() => {
    if (!demoId) return;

    const syncFromStorage = () => {
      setPhotos(readDemoPhotos(demoId));
    };

    syncFromStorage();

    const handleStorage = (event: StorageEvent) => {
      if (!event.key || event.key === getDemoPhotosKey(demoId)) {
        syncFromStorage();
      }
    };

    window.addEventListener('storage', handleStorage);

    const channel = supabase.channel(`demo-wall-${demoId}`);

    channel.on('broadcast', { event: 'NEW_UPLOAD' }, (payload) => {
      const data = payload.payload as Partial<DemoMedia>;
      if (!data.url || !data.type) {
        return;
      }
      const mediaUrl = data.url;
      const mediaType: DemoMedia['type'] = data.type === 'video' ? 'video' : 'image';

      setPhotos(prev => {
        const newPhoto: DemoMedia = {
          id: String(data.id || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`),
          url: mediaUrl,
          type: mediaType,
          caption: data.caption || '',
          uploader: data.uploader || 'Demo Guest',
          createdAt: typeof data.createdAt === 'number' ? data.createdAt : Date.now(),
        };
        const updatedPhotos = mergeDemoMedia(prev, newPhoto);
        writeDemoPhotos(demoId, updatedPhotos);
        return updatedPhotos;
      });
    });

    channel.subscribe((status) => {
      setIsConnected(status === 'SUBSCRIBED');
    });

    return () => {
      window.removeEventListener('storage', handleStorage);
      supabase.removeChannel(channel);
    };
  }, [demoId]);

  useEffect(() => {
    if (photos.length > 0 && currentSlide >= photos.length) {
      setCurrentSlide(0);
    }
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
    if (demoId) {
      setUploadUrl(`${window.location.origin}/demo/upload?id=${demoId}`);
    }
  }, [demoId]);

  // Upload handlers
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validPhotos = files.filter(isAcceptedImage);
    const invalidFiles = files.filter(f => !isAcceptedImage(f));
    
    if (invalidFiles.length > 0) {
      setValidationMessage(`Invalid files: ${invalidFiles.map(f => f.name).join(', ')}`);
      setTimeout(() => setValidationMessage(null), 5000);
      return;
    }
    
    const totalPhotos = uploadPhotos.length + validPhotos.length;
    if (totalPhotos > MAX_IMAGES) {
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

  const removePhoto = (index: number) => {
    setUploadPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const removeVideo = (index: number) => {
    setUploadVideos(prev => prev.filter((_, i) => i !== index));
  };

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
        
        const { data, error } = await supabase.storage
          .from('photos')
          .upload(fileName, preparedFile);

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

  return (
    <div className="nm-page pb-12 min-h-screen relative">
      {/* Debug Info Overlay */}
      <div className="fixed bottom-4 left-4 z-50 flex items-center gap-3 bg-[#14182a]/80 backdrop-blur-md px-4 py-2 rounded-full border border-white/5 shadow-2xl">
        <div className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-green-500 shadow-[0_0_10px_#4ade80]' : 'bg-red-500 shadow-[0_0_10px_#f87171]'}`} />
        <span className="text-[10px] uppercase tracking-widest font-bold text-white/50">Wall ID: <span className="text-white">{demoId}</span></span>
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-[var(--surface)]/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link href="/">
              <AnimatedLogo width={180} height={60} />
            </Link>
            <div className="flex items-center gap-4">
              {user ? (
                <>
                  <Link href="/dashboard" className="nm-btn px-4 py-2 text-sm">Dashboard</Link>
                </>
              ) : (
                <>
                  <Link href="/auth" className="nm-btn px-4 py-2 text-sm">Sign In</Link>
                  <Link href="/#pricing" className="nm-btn nm-btn-accent px-4 py-2 text-sm font-bold">Create a Wall</Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Demo Content */}
      <div className="px-4 pt-28">
        <div className="max-w-7xl mx-auto mb-8 px-4 flex flex-col items-center">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2 px-4" style={{color:'var(--text1)'}}>Memento Live Demo</h1>
            <p className="text-sm mb-4" style={{color:'var(--text2)'}}>Scan the QR code to post to this wall right now!</p>
            <div className="flex justify-center items-center gap-4 mb-6">
              <span className="nm-badge flex items-center gap-1.5" style={{color:'#4ade80'}}>
                <span className={`w-2 h-2 ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'} rounded-full`}></span>
                {isConnected ? 'WALL ACTIVE' : 'CONNECTING...'}
              </span>
              <span className="nm-badge" style={{color:'#f472b6'}}>
                Resets in {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
              </span>
            </div>
            
            <div className="bg-white p-4 rounded-xl mx-auto shadow-[0_0_20px_rgba(245,158,11,0.2)] inline-block">
              {uploadUrl ? <QRCodeSVG value={uploadUrl} size={150} level="M" /> : <div style={{width:150,height:150}}/>}
            </div>
          </div>

          {/* Upload Section */}
          <div className="w-full max-w-md mx-auto mb-8">
            {validationMessage && (
              <div className="gcard mb-4" style={{ background: 'rgba(251,191,36,0.12)' }}>
                <div className="gcard-inner py-3 text-center">
                  <p className="text-sm font-semibold" style={{ color: '#d97706' }}>{validationMessage}</p>
                </div>
              </div>
            )}

            {uploadSuccess && (
              <div className="gcard mb-4" style={{ background: 'rgba(34,197,94,0.12)' }}>
                <div className="gcard-inner py-3 text-center">
                  <p className="text-sm font-semibold" style={{ color: '#16a34a' }}>🎉 Uploaded successfully!</p>
                </div>
              </div>
            )}

            {uploadError && (
              <div className="gcard mb-4" style={{ background: 'rgba(239,68,68,0.12)' }}>
                <div className="gcard-inner py-3 text-center">
                  <p className="text-sm font-semibold" style={{ color: '#dc2626' }}>{uploadError}</p>
                </div>
              </div>
            )}

            {/* Photos Card */}
            <div className="gcard mb-4">
              <div className="gcard-border" />
              <div className="gcard-inner">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-bold text-base" style={{ color: 'var(--text1)' }}>
                    Photos
                    <span className="ml-2 text-sm font-normal" style={{ color: 'var(--text3)' }}>({uploadPhotos.length}/{MAX_IMAGES})</span>
                  </h2>
                  {!uploading && uploadPhotos.length < MAX_IMAGES && (
                    <button onClick={() => photoInputRef.current?.click()} className="btn-outline" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>
                      + Add
                    </button>
                  )}
                </div>
                <input type="file" accept=".jpg,.jpeg,.png,.heic,.heif,image/jpeg,image/png,image/heic,image/heif" multiple ref={photoInputRef} onChange={handlePhotoSelect} className="hidden" />

                {uploadPhotos.length === 0 ? (
                  <button
                    onClick={() => photoInputRef.current?.click()}
                    className="w-full py-10 rounded-2xl text-center transition-all"
                    style={{ background: 'rgba(245,158,11,0.06)', border: '2px dashed rgba(245,158,11,0.35)' }}
                  >
                    <span className="text-3xl block mb-2">🖼️</span>
                    <p className="text-sm font-semibold" style={{ color: 'var(--amber)' }}>Tap to select photos</p>
                    <p className="text-xs mt-1" style={{ color: 'var(--text3)' }}>JPG, PNG, HEIC · Max {MAX_IMAGES}</p>
                  </button>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {uploadPhotos.map((p, i) => (
                      <div key={i} className="relative aspect-square rounded-xl overflow-hidden" style={{ boxShadow: '0 4px 12px rgba(30,41,59,0.08)' }}>
                        <img src={URL.createObjectURL(p)} alt="preview" className="w-full h-full object-cover" />
                        {!uploading && (
                          <button onClick={() => removePhoto(i)} className="absolute top-1 right-1 w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold text-white" style={{ background: '#ef4444' }}>×</button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Videos Card */}
            <div className="gcard mb-4">
              <div className="gcard-border" />
              <div className="gcard-inner">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-bold text-base" style={{ color: 'var(--text1)' }}>
                    Video
                    <span className="ml-2 text-sm font-normal" style={{ color: 'var(--text3)' }}>({uploadVideos.length}/{MAX_VIDEOS})</span>
                  </h2>
                  {!uploading && uploadVideos.length < MAX_VIDEOS && (
                    <button onClick={() => videoInputRef.current?.click()} className="btn-outline" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>
                      + Add
                    </button>
                  )}
                </div>
                <input type="file" accept=".mp4,video/mp4" ref={videoInputRef} onChange={handleVideoSelect} className="hidden" />

                {uploadVideos.length === 0 ? (
                  <button
                    onClick={() => videoInputRef.current?.click()}
                    className="w-full py-10 rounded-2xl text-center transition-all"
                    style={{ background: 'rgba(245,158,11,0.06)', border: '2px dashed rgba(245,158,11,0.35)' }}
                  >
                    <span className="text-3xl block mb-2">🎥</span>
                    <p className="text-sm font-semibold" style={{ color: 'var(--amber)' }}>Tap to select video</p>
                    <p className="text-xs mt-1" style={{ color: 'var(--text3)' }}>MP4 · Max {MAX_VIDEOS}</p>
                  </button>
                ) : (
                  <div className="space-y-2">
                    {uploadVideos.map((v, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(30,41,59,0.04)' }}>
                        <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0" style={{ background: '#000' }}>
                          <video src={URL.createObjectURL(v)} className="w-full h-full object-cover" muted />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate" style={{ color: 'var(--text1)' }}>{v.name}</p>
                          <p className="text-xs" style={{ color: 'var(--text3)' }}>{(v.size / 1024 / 1024).toFixed(1)} MB</p>
                        </div>
                        {!uploading && (
                          <button onClick={() => removeVideo(i)} className="w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold text-white flex-shrink-0" style={{ background: '#ef4444' }}>×</button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Upload Progress */}
            {uploading && (
              <div className="gcard mb-4">
                <div className="gcard-border" />
                <div className="gcard-inner py-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium" style={{ color: 'var(--text1)' }}>Uploading...</span>
                    <span className="text-sm font-bold" style={{ color: 'var(--amber)' }}>{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'rgba(30,41,59,0.1)' }}>
                    <div className="h-full transition-all duration-300 ease-out rounded-full" style={{ width: `${uploadProgress}%`, background: 'linear-gradient(90deg, #f59e0b, #fcd34d)' }} />
                  </div>
                </div>
              </div>
            )}

            {/* Upload Button */}
            <button
              onClick={handleUpload}
              disabled={uploading || (uploadPhotos.length === 0 && uploadVideos.length === 0)}
              className="btn-glow w-full"
              style={{ opacity: uploading || (uploadPhotos.length === 0 && uploadVideos.length === 0) ? 0.6 : 1 }}
            >
              <span>{uploading ? 'Uploading...' : '📸 Share to Live Wall'}</span>
            </button>
          </div>

          {/* View Mode Controls */}
          <div className="flex justify-center gap-2">
            {(['grid','polaroid','slideshow'] as const).map((mode) => (
              <button key={mode} onClick={() => {
                setViewMode(mode);
                window.location.hash = mode;
              }}
                className="nm-btn px-4 py-2 text-sm capitalize"
                style={{
                  color: viewMode === mode ? '#f59e0b' : 'var(--text2)',
                  boxShadow: viewMode === mode
                    ? 'inset 4px 4px 8px #14182a, inset -4px -4px 8px #252c46'
                    : '6px 6px 12px #14182a, -6px -6px 12px #252c46',
                }}>
                {mode}
              </button>
            ))}
          </div>
        </div>

        {/* Grid View */}
        {viewMode === 'grid' && (
          <div className="flex justify-center">
            <div className="max-w-6xl w-full">
              {photos.length === 0 ? (
                <div className="text-center py-20">
                  <div className="nm-circle w-20 h-20 mx-auto mb-6 text-5xl">📷</div>
                  <h2 className="text-2xl font-bold mb-4" style={{color:'var(--text1)'}}>No Photos Yet</h2>
                  <p className="text-sm mb-6" style={{color:'var(--text2)'}}>Scan the QR code above to upload the first photo!</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 justify-items-center">
                  {photos.map((photo, i) => (
                  <div key={photo.id || i} className="nm-card group relative aspect-square overflow-hidden hover:scale-105 transition-transform w-full max-w-[240px]"
                    style={{animationDelay:`${i * 0.12}s`}}>
                    <div className="flex flex-col items-center justify-center h-full p-2 relative z-10">
                      {photo.url ? (
                        photo.type === 'video' ? (
                          <video src={photo.url} className="w-full h-full object-cover absolute inset-0 z-0 opacity-40" autoPlay muted loop playsInline preload="metadata" />
                        ) : (
                          <img src={photo.url} className="w-full h-full object-cover absolute inset-0 z-0 opacity-40 group-hover:opacity-100 transition-opacity" alt="Upload" loading="lazy" />
                        )
                      ) : null}
                      <div className="z-10 bg-[var(--surface)]/60 backdrop-blur-md p-2 rounded-lg mt-auto mb-2 text-center w-full">
                        <p className="text-sm font-medium truncate" style={{color:'var(--text1)'}}>{photo.caption}</p>
                        <p className="text-xs mt-1 truncate" style={{color:'var(--text2)'}}>by {photo.uploader}</p>
                      </div>
                    </div>
                  </div>
                ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Polaroid View */}
        {viewMode === 'polaroid' && (
          <div className="flex justify-center">
            <div className="max-w-6xl w-full">
              {photos.length === 0 ? (
                <div className="text-center py-20">
                  <div className="nm-circle w-20 h-20 mx-auto mb-6 text-5xl">📷</div>
                  <h2 className="text-2xl font-bold mb-4" style={{color:'var(--text1)'}}>No Photos Yet</h2>
                  <p className="text-sm mb-6" style={{color:'var(--text2)'}}>Scan the QR code above to upload the first photo!</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 justify-items-center">
                  {photos.map((photo, index) => (
                  <div key={photo.id || index} className="relative w-full max-w-[240px]"
                    style={{animation:`float 3s ease-in-out infinite`, animationDelay:`${index * 0.5}s`}}>
                    <div className="nm-card p-3 transform rotate-3 hover:rotate-0 transition-transform">
                      <div className="nm-inset aspect-square rounded-xl flex items-center justify-center mb-2 overflow-hidden relative">
                        {photo.url ? (
                          photo.type === 'video' ? (
                            <video src={photo.url} className="w-full h-full object-cover" autoPlay muted loop playsInline preload="metadata" />
                          ) : (
                            <img src={photo.url} className="w-full h-full object-cover" alt="Upload" loading="lazy" />
                          )
                        ) : null}
                      </div>
                      <p className="text-xs text-center font-medium" style={{color:'var(--text1)'}}>{photo.caption}</p>
                    </div>
                  </div>
                ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Slideshow View */}
        {viewMode === 'slideshow' && (
          <div className="flex justify-center">
            <div className="max-w-4xl w-full">
              {photos.length === 0 ? (
                <div className="text-center py-20">
                  <div className="nm-circle w-20 h-20 mx-auto mb-6 text-5xl">📷</div>
                  <h2 className="text-2xl font-bold mb-4" style={{color:'var(--text1)'}}>No Photos Yet</h2>
                  <p className="text-sm mb-6" style={{color:'var(--text2)'}}>Scan the QR code above to upload the first photo!</p>
                </div>
              ) : (
                <>
                  <div
                    className="nm-card relative overflow-hidden"
                    style={{aspectRatio:'16/9'}}
                    onMouseEnter={() => setIsPlaying(false)}
                    onTouchStart={() => setIsPlaying(false)}
                  >
                    <div className="flex items-center justify-center h-full relative">
                      {photos[currentSlide].url ? (
                        photos[currentSlide].type === 'video' ? (
                          <video src={photos[currentSlide].url} className="w-full h-full object-contain absolute transition-opacity duration-300" autoPlay muted loop playsInline preload="metadata" />
                        ) : (
                          <img src={photos[currentSlide].url} className="w-full h-full object-contain absolute transition-opacity duration-300" alt="Upload" />
                        )
                      ) : null}
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-6 z-10" style={{background:'linear-gradient(to top, #14182a, transparent)'}}>
                      <h3 className="text-xl font-semibold drop-shadow-lg" style={{color:'var(--text1)'}}>{photos[currentSlide].caption}</h3>
                      <p className="text-sm drop-shadow-md" style={{color:'#f59e0b'}}>by {photos[currentSlide].uploader}</p>
                    </div>
                    <button onClick={() => setIsPlaying(!isPlaying)}
                      className="nm-circle w-12 h-12 absolute bottom-6 right-6 z-20" style={{color:'var(--text1)'}}>
                      {isPlaying
                        ? <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                        : <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>}
                    </button>
                  </div>
                  <div className="flex justify-center gap-2 mt-4 flex-wrap px-4">
                    {photos.map((_, index) => (
                      <button key={index} onClick={() => setCurrentSlide(index)}
                        className="w-2 h-2 rounded-full transition-all flex-shrink-0"
                        style={{background: index === currentSlide ? '#f59e0b' : '#252c46'}} />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(3deg); }
          50% { transform: translateY(-10px) rotate(-2deg); }
        }
      `}</style>
    </div>
  );
}

