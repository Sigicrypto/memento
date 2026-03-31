"use client";

import { useState, useRef, Suspense, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { DemoMedia, upsertDemoPhoto } from '@/lib/demoWall';
import '@/app/landing.css';

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

async function loadImageFromFile(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const imageUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => { URL.revokeObjectURL(imageUrl); resolve(image); };
    image.onerror = () => { URL.revokeObjectURL(imageUrl); reject(new Error('Unable to read image.')); };
    image.src = imageUrl;
  });
}

async function compressDemoImage(file: File) {
  const extension = getFileExtension(file.name);
  if (extension === 'heic' || extension === 'heif') return file;
  try {
    const image = await loadImageFromFile(file);
    const maxDimension = 1600;
    const scale = Math.min(1, maxDimension / Math.max(image.width, image.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(image.width * scale));
    canvas.height = Math.max(1, Math.round(image.height * scale));
    const context = canvas.getContext('2d');
    if (!context) return file;
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, outputType, 0.82));
    if (!blob || blob.size >= file.size) return file;
    const nextExtension = outputType === 'image/png' ? 'png' : 'jpg';
    const nextName = file.name.replace(/\.[^.]+$/, `.${nextExtension}`);
    return new File([blob], nextName, { type: outputType, lastModified: Date.now() });
  } catch {
    return file;
  }
}

function UploadContent() {
  const searchParams = useSearchParams();
  const demoId = searchParams.get('id');
  const [photos, setPhotos] = useState<File[]>([]);
  const [videos, setVideos] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('');
  const [lastUrl, setLastUrl] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // Establish a persistent, subscribed channel early and keep it alive
  useEffect(() => {
    if (!demoId) return;
    const channel = supabase.channel(`demo-wall-${demoId}`);
    channelRef.current = channel;
    channel.subscribe((s) => setIsConnected(s === 'SUBSCRIBED'));
    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [demoId]);

  if (!demoId) {
    return (
      <div className="lp flex items-center justify-center min-h-screen p-4 text-center">
        <div className="gcard p-10">
          <div className="gcard-inner">
            <p className="text-xl font-bold" style={{ color: 'var(--text1)' }}>Invalid Demo Link</p>
            <p className="text-sm mt-2" style={{ color: 'var(--text2)' }}>Please scan a valid QR code from the Memento wall.</p>
          </div>
        </div>
      </div>
    );
  }

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const nextFiles = Array.from(e.target.files).filter(isAcceptedImage);
      if (nextFiles.length !== e.target.files.length) {
        setValidationMessage('Demo upload supports JPG, PNG, and HEIC images only.');
      } else {
        setValidationMessage(null);
      }
      const spaceLeft = MAX_IMAGES - photos.length;
      if (spaceLeft <= 0) {
        setValidationMessage(`Max ${MAX_IMAGES} images in demo mode.`);
      } else {
        if (nextFiles.length > spaceLeft) setValidationMessage(`You can only add ${spaceLeft} more image(s).`);
        setPhotos((prev) => [...prev, ...nextFiles.slice(0, spaceLeft)]);
      }
    }
    if (photoInputRef.current) photoInputRef.current.value = '';
  };

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      if (!isAcceptedVideo(e.target.files[0])) {
        setValidationMessage('Demo upload supports MP4 video only.');
        if (videoInputRef.current) videoInputRef.current.value = '';
        return;
      }
      if (videos.length >= MAX_VIDEOS) {
        setValidationMessage(`Max ${MAX_VIDEOS} video in demo mode.`);
        return;
      }
      setValidationMessage(null);
      setVideos([e.target.files[0]]);
    }
    if (videoInputRef.current) videoInputRef.current.value = '';
  };

  const removePhoto = (index: number) => setPhotos(prev => prev.filter((_, i) => i !== index));
  const removeVideo = () => setVideos([]);

  const handleUpload = async () => {
    if (!demoId || (photos.length === 0 && videos.length === 0)) return;

    setUploading(true);
    setProgress(5);
    setError(null);
    setValidationMessage(null);
    setStatus('Preparing files...');

    const allFiles = [...photos, ...videos];
    let uploadedCount = 0;

    // Use the already-subscribed persistent channel
    const channel = channelRef.current;

    try {
      setProgress(10);

      for (const file of allFiles) {
        const type = file.type.startsWith('video') ? 'video' : 'image';
        const preparedFile = type === 'image' ? await compressDemoImage(file) : file;
        const fileExt = getFileExtension(preparedFile.name) || (type === 'video' ? 'mp4' : 'jpg');
        const fileName = `demo/${demoId}/${Date.now()}_${Math.random().toString(36).slice(2, 7)}.${fileExt}`;

        setStatus(`Uploading ${type} ${uploadedCount + 1} of ${allFiles.length}...`);
        const { data, error: uploadError } = await supabase.storage
          .from('photos')
          .upload(fileName, preparedFile, { cacheControl: '3600', upsert: false });

        if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

        if (data) {
          const { data: { publicUrl } } = supabase.storage.from('photos').getPublicUrl(data.path);
          setLastUrl(publicUrl);
          setStatus('Syncing with wall...');

          const payload: DemoMedia = {
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            url: publicUrl,
            type: type,
            caption: type === 'video' ? '🎥 Live Video from Demo!' : '📸 Live Photo from Demo!',
            uploader: 'Demo Guest',
            createdAt: Date.now(),
          };

          // Save locally first
          upsertDemoPhoto(demoId, payload);

          // Broadcast over the persistent subscribed channel for reliable sync
          if (channel && isConnected) {
            await channel.send({ type: 'broadcast', event: 'NEW_UPLOAD', payload });
          } else {
            // Fallback: create a new channel and wait for subscription before sending
            const fallbackCh = supabase.channel(`demo-wall-${demoId}`);
            await new Promise<void>((resolve) => {
              fallbackCh.subscribe(async (s) => {
                if (s === 'SUBSCRIBED') {
                  await fallbackCh.send({ type: 'broadcast', event: 'NEW_UPLOAD', payload });
                  setTimeout(() => { supabase.removeChannel(fallbackCh); resolve(); }, 500);
                }
              });
              setTimeout(resolve, 6000); // hard timeout
            });
          }
        }

        uploadedCount++;
        setProgress(Math.round(10 + (uploadedCount / allFiles.length) * 85));
      }

      setStatus('Done! 🎉');
      setProgress(100);
      setUploading(false);
      setPhotos([]);
      setVideos([]);
      setTimeout(() => setSuccess(true), 400);
    } catch (err: any) {
      setUploading(false);
      setError(err.message || 'Upload failed. Please try again.');
    }
  };

  if (success) {
    return (
      <div className="lp min-h-screen flex flex-col items-center justify-center py-12 px-4 relative">
        <div className="orbs">
          <div className="orb orb1" /><div className="orb orb2" /><div className="orb orb3" />
        </div>
        <div className="grain" />
        <div className="gcard w-full max-w-sm text-center">
          <div className="gcard-border" />
          <div className="gcard-inner py-10">
            <div className="text-6xl mb-4">✅</div>
            <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text1)' }}>Uploaded!</h1>
            <p className="text-sm mb-6" style={{ color: 'var(--text2)' }}>Your photo is now live on the wall.</p>
            {lastUrl && (
              <div className="mb-6 rounded-xl overflow-hidden border border-white/50 shadow-lg">
                {lastUrl.includes('video') ? (
                  <video src={lastUrl} className="w-full max-h-52 object-cover" controls playsInline />
                ) : (
                  <img src={lastUrl} className="w-full max-h-52 object-cover" alt="Your upload" />
                )}
              </div>
            )}
            <button
              onClick={() => {
                setSuccess(false); setError(null); setValidationMessage(null);
                setProgress(0); setStatus(''); setUploading(false);
                setPhotos([]); setVideos([]);
              }}
              className="btn-glow w-full"
            >
              <span>📸 Share Another</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="lp min-h-screen flex flex-col items-center justify-center py-12 px-4 relative">
        <div className="orbs">
          <div className="orb orb1" /><div className="orb orb2" /><div className="orb orb3" />
        </div>
        <div className="grain" />
        <div className="gcard w-full max-w-sm text-center">
          <div className="gcard-border" />
          <div className="gcard-inner py-10">
            <div className="text-5xl mb-4">❌</div>
            <h1 className="text-xl font-bold mb-2" style={{ color: 'var(--text1)' }}>Upload Failed</h1>
            <p className="text-sm px-2 mb-6" style={{ color: '#ef4444' }}>{error}</p>
            <button onClick={() => { setError(null); setUploading(false); setProgress(0); }} className="btn-glow w-full">
              <span>Try Again</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="lp min-h-screen flex flex-col items-center py-10 px-4 relative">
      {/* Background Atmosphere */}
      <div className="orbs">
        <div className="orb orb1" /><div className="orb orb2" /><div className="orb orb3" />
      </div>
      <div className="floating-shapes">
        <div className="shape s-cross s-1">✦</div>
        <div className="shape s-circle s-2" />
        <div className="shape s-star s-3">★</div>
        <div className="shape s-ring s-4" />
      </div>
      <div className="grain" />

      {/* Connection Badge */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2 rounded-full"
        style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.8)', boxShadow: '0 4px 16px rgba(30,41,59,0.08)' }}>
        <span className={`pulse-dot ${isConnected ? 'active' : ''}`} />
        <span className="text-xs font-bold tracking-widest uppercase" style={{ color: isConnected ? '#10b981' : 'var(--text2)' }}>
          {isConnected ? 'Connected to Wall' : 'Connecting...'}
        </span>
      </div>

      <div className="w-full max-w-md mt-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">📷</div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text1)' }}>
            Share to the <span className="gradient-text">Live Wall</span>
          </h1>
          <p className="text-sm mt-2" style={{ color: 'var(--text2)' }}>Your photo will appear instantly on the screen!</p>
        </div>

        {validationMessage && (
          <div className="gcard mb-4 text-center" style={{ background: 'rgba(251,191,36,0.15)' }}>
            <div className="gcard-inner py-3">
              <p className="text-sm font-semibold" style={{ color: '#d97706' }}>{validationMessage}</p>
            </div>
          </div>
        )}

        {/* Photos Card */}
        <div className="gcard mb-4">
          <div className="gcard-border" />
          <div className="gcard-inner">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-base" style={{ color: 'var(--text1)' }}>Photos ({photos.length}/{MAX_IMAGES})</h2>
              {!uploading && photos.length < MAX_IMAGES && (
                <button onClick={() => photoInputRef.current?.click()} className="btn-outline py-1.5 px-4 text-sm">
                  + Add
                </button>
              )}
            </div>
            <input type="file" accept=".jpg,.jpeg,.png,.heic,.heif,image/jpeg,image/png,image/heic,image/heif" multiple ref={photoInputRef} onChange={handlePhotoSelect} className="hidden" />
            {photos.length === 0 ? (
              <button
                onClick={() => photoInputRef.current?.click()}
                className="w-full py-10 rounded-2xl text-center transition-all"
                style={{ background: 'rgba(245,158,11,0.05)', border: '2px dashed rgba(245,158,11,0.3)' }}
              >
                <span className="text-3xl block mb-2">📁</span>
                <p className="text-sm font-medium" style={{ color: 'var(--amber)' }}>Tap to select photos</p>
                <p className="text-xs mt-1" style={{ color: 'var(--text3)' }}>JPG, PNG, HEIC • Max {MAX_IMAGES}</p>
              </button>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {photos.map((p, i) => (
                  <div key={i} className="relative aspect-square rounded-xl overflow-hidden" style={{ boxShadow: '0 4px 12px rgba(30,41,59,0.1)' }}>
                    <img src={URL.createObjectURL(p)} alt="preview" className="w-full h-full object-cover" />
                    {!uploading && (
                      <button onClick={() => removePhoto(i)} className="absolute top-1 right-1 w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold text-white" style={{ background: '#ef4444' }}>
                        ×
                      </button>
                    )}
                  </div>
                ))}
                {photos.length < MAX_IMAGES && !uploading && (
                  <button onClick={() => photoInputRef.current?.click()} className="aspect-square rounded-xl flex flex-col items-center justify-center transition-all" style={{ background: 'rgba(245,158,11,0.08)', border: '2px dashed rgba(245,158,11,0.3)' }}>
                    <span className="text-2xl" style={{ color: 'var(--amber)' }}>+</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Video Card */}
        <div className="gcard mb-8">
          <div className="gcard-border" />
          <div className="gcard-inner">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-base" style={{ color: 'var(--text1)' }}>Video ({videos.length}/{MAX_VIDEOS})</h2>
              {!uploading && videos.length === 0 && (
                <button onClick={() => videoInputRef.current?.click()} className="btn-outline py-1.5 px-4 text-sm">
                  + Add
                </button>
              )}
            </div>
            <input type="file" accept=".mp4,video/mp4" ref={videoInputRef} onChange={handleVideoSelect} className="hidden" />
            {videos.length === 0 ? (
              <button
                onClick={() => videoInputRef.current?.click()}
                className="w-full py-8 rounded-2xl text-center transition-all"
                style={{ background: 'rgba(244,114,182,0.05)', border: '2px dashed rgba(244,114,182,0.3)' }}
              >
                <span className="text-3xl block mb-2">🎥</span>
                <p className="text-sm font-medium" style={{ color: 'var(--rose)' }}>Tap to select a video</p>
                <p className="text-xs mt-1" style={{ color: 'var(--text3)' }}>MP4 only • Max {MAX_VIDEOS}</p>
              </button>
            ) : (
              <div className="relative aspect-video rounded-xl overflow-hidden" style={{ boxShadow: '0 4px 12px rgba(30,41,59,0.1)' }}>
                <video src={URL.createObjectURL(videos[0])} className="w-full h-full object-cover" controls />
                {!uploading && (
                  <button onClick={removeVideo} className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full text-white font-bold shadow-lg z-10" style={{ background: '#ef4444' }}>
                    ×
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fixed Upload Bar */}
      {(photos.length > 0 || videos.length > 0) && (
        <div className="fixed bottom-0 left-0 right-0 p-4 z-50" style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(16px)', borderTop: '1px solid rgba(255,255,255,0.8)', boxShadow: '0 -4px 24px rgba(30,41,59,0.08)' }}>
          <div className="max-w-md mx-auto">
            {uploading && (
              <div className="mb-3">
                <div className="flex justify-between text-xs font-bold mb-1.5" style={{ color: 'var(--amber)' }}>
                  <span>{status}</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(245,158,11,0.15)' }}>
                  <div className="h-full rounded-full transition-all duration-300" style={{ width: `${progress}%`, background: 'linear-gradient(90deg, var(--amber), var(--rose))' }} />
                </div>
              </div>
            )}
            <button onClick={handleUpload} className="btn-glow w-full py-4 text-lg justify-center" disabled={uploading} style={{ opacity: uploading ? 0.7 : 1 }}>
              <span>{uploading ? '✨ Sharing...' : '🚀 Share to Live Wall'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DemoUploadPage() {
  return (
    <Suspense fallback={
      <div className="lp flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-spin">✦</div>
          <p className="gradient-text font-bold">Loading...</p>
        </div>
      </div>
    }>
      <UploadContent />
    </Suspense>
  );
}
