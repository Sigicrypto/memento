"use client";

import { useState, useRef, Suspense, useEffect } from 'react';
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

// MUST match getDemoChannelName() in demo/page.tsx
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
  } catch (err) {
    console.error('Broadcast failed:', err);
  }
}

export default function DemoUploadPage() {
  const searchParams = useSearchParams();
  const demoId = searchParams.get('id') || '';
  const [uploadPhotos, setUploadPhotos] = useState<File[]>([]);
  const [uploadVideos, setUploadVideos] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [lastUrl, setLastUrl] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [totalUploaded, setTotalUploaded] = useState(0);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!demoId) return;
    const channel = supabase.channel(getDemoChannelName(demoId));
    channel.subscribe((status) => setIsConnected(status === 'SUBSCRIBED'));
    return () => supabase.removeChannel(channel);
  }, [demoId]);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validPhotos = files.filter(isAcceptedImage);
    const invalidFiles = files.filter(f => !isAcceptedImage(f));
    if (invalidFiles.length > 0) {
      setError(`Invalid files: ${invalidFiles.map(f => f.name).join(', ')}`);
      setTimeout(() => setError(null), 5000);
      return;
    }
    setUploadPhotos(prev => [...prev.slice(0, MAX_IMAGES - 1), ...validPhotos].slice(0, MAX_IMAGES));
    setError(null);
  };

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validVideos = files.filter(isAcceptedVideo);
    const invalidFiles = files.filter(f => !isAcceptedVideo(f));
    if (invalidFiles.length > 0) {
      setError(`Invalid files: ${invalidFiles.map(f => f.name).join(', ')}`);
      setTimeout(() => setError(null), 5000);
      return;
    }
    if (validVideos.length > 0) {
      setUploadVideos([validVideos[0]]);
      setError(null);
    }
  };

  const removePhoto = (index: number) => {
    setUploadPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const removeVideo = () => {
    setUploadVideos([]);
  };

  const uploadFile = async (file: File, type: 'image' | 'video'): Promise<string> => {
    const fileName = `${demoId}/${Date.now()}-${file.name}`;
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
    setStatus('Uploading files...');
    try {
      const totalFiles = uploadPhotos.length + uploadVideos.length;
      let uploaded = 0;
      const uploadPromises: Promise<string>[] = [];
      for (const photo of uploadPhotos) {
        const compressed = await compressDemoImage(photo);
        uploadPromises.push(uploadFile(compressed, 'image'));
      }
      for (const video of uploadVideos) {
        uploadPromises.push(uploadFile(video, 'video'));
      }
      const urls = await Promise.all(uploadPromises);
      for (const url of urls) {
        uploaded++;
        setProgress(Math.round((uploaded / totalFiles) * 100));
        setStatus(`Uploaded ${uploaded}/${totalFiles} files...`);
        await new Promise(r => setTimeout(r, 300));
      }
      setStatus('Sending to wall...');
      for (let i = 0; i < urls.length; i++) {
        const publicUrl = urls[i];
        const type = i < uploadPhotos.length ? 'image' : 'video';
        const caption = type === 'video' ? '🎥 Live Video!' : '📸 Live Photo!';
        
        // Primary: insert into DB → triggers reliable postgres_changes on wall
        console.log('[DEMO UPLOAD] Inserting into demo_uploads:', { demo_id: demoId, url: publicUrl, type, caption });
        const { error: insertError } = await supabase.from('demo_uploads').insert({
          demo_id: demoId,
          url: publicUrl,
          type,
          caption: caption || 'Demo Photo',
          uploader: 'Demo Guest',
        });
        if (insertError) {
          console.error('[DEMO UPLOAD] Database insert failed:', insertError);
          console.log('[DEMO UPLOAD] Continuing with fallback methods...');
        } else {
          console.log('[DEMO UPLOAD] Database insert successful');
        }

        const payload: DemoMedia = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          url: publicUrl,
          type,
          caption,
          uploader: 'Demo Guest',
          createdAt: Date.now(),
        };

        // Fallback: localStorage + broadcast (same-browser and backup path)
        upsertDemoPhoto(demoId, payload);
        await broadcastUpload(demoId, payload);
      }
      setLastUrl(urls[0]);
      setStatus('Upload complete!');
      setTotalUploaded(prev => prev + urls.length);
      setUploadPhotos([]);
      setUploadVideos([]);
      // Reset input refs
      if (photoInputRef.current) photoInputRef.current.value = '';
      if (videoInputRef.current) videoInputRef.current.value = '';
      setTimeout(() => setStatus(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Upload failed. Please try again.');
      setStatus('');
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <div className="lp min-h-screen flex flex-col items-center py-12 px-4">
      <div className="orbs"><div className="orb orb1" /><div className="orb orb2" /><div className="orb orb3" /></div>
      <div className="grain" />

      {/* Connection badge */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
        <span className="hero-badge" style={{ gap: 8 }}>
          <span className={`pulse-dot ${isConnected ? '' : 'opacity-40'}`}
            style={{ background: isConnected ? '#4ade80' : '#f87171' }} />
          <span className="text-xs font-bold tracking-widest uppercase"
            style={{ color: isConnected ? '#16a34a' : '#dc2626' }}>
            {isConnected ? 'Connected to Wall' : 'Connecting...'}
          </span>
          {totalUploaded > 0 && (
            <span className="text-xs font-bold" style={{ color: 'var(--amber)' }}>· {totalUploaded} shared ✓</span>
          )}
        </span>
      </div>

      <div className="text-center mb-8 reveal visible">
        <h1 className="hero-h1" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}>Add to Wall</h1>
        <p className="hero-sub" style={{ fontSize: '1.1rem', maxWidth: '500px', margin: '0 auto' }}>
          Share photos and videos to the live wall
        </p>
      </div>

      {error && (
        <div className="w-full max-w-md mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30">
          <p className="text-red-400 text-sm text-center">{error}</p>
        </div>
      )}

      {status && !error && (
        <div className="w-full max-w-md mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/30">
          <p className="text-green-400 text-sm text-center">{status}</p>
          {uploading && (
            <div className="mt-3">
              <div className="w-full bg-green-500/20 rounded-full h-2">
                <div className="bg-green-400 h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}
        </div>
      )}

      <div className="w-full max-w-md space-y-6">
        {/* Photo Upload */}
        <div className="gcard">
          <div className="gcard-border" />
          <div className="gcard-inner p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold" style={{ color: 'var(--text1)' }}>Photos</h3>
              <span className="text-xs px-2 py-1 rounded-full" style={{ background: 'rgba(34, 197, 94, 0.2)', color: '#22c55e' }}>
                {uploadPhotos.length}/{MAX_IMAGES}
              </span>
            </div>
            {uploadPhotos.length === 0 ? (
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoSelect}
                className="hidden"
                disabled={uploading}
              />
            ) : (
              <div className="space-y-2">
                {uploadPhotos.map((photo, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl"
                    style={{ background: 'rgba(30,41,59,0.04)' }}>
                    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-200">
                      <img src={URL.createObjectURL(photo)} className="w-full h-full object-cover" alt="" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: 'var(--text1)' }}>{photo.name}</p>
                      <p className="text-xs" style={{ color: 'var(--text3)' }}>{(photo.size / 1024 / 1024).toFixed(1)} MB</p>
                    </div>
                    {!uploading && (
                      <button onClick={() => removePhoto(i)}
                        className="w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold text-white flex-shrink-0"
                        style={{ background: '#ef4444' }}>×</button>
                    )}
                  </div>
                ))}
                {uploadPhotos.length < MAX_IMAGES && (
                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoSelect}
                    className="hidden"
                    disabled={uploading}
                  />
                )}
              </div>
            )}
            {(uploadPhotos.length < MAX_IMAGES) && (
              <button
                onClick={() => photoInputRef.current?.click()}
                disabled={uploading}
                className="w-full py-3 rounded-xl font-semibold transition-all duration-200 border-2"
                style={{ 
                  background: 'transparent', 
                  borderColor: 'var(--text3)', 
                  color: 'var(--text2)',
                  opacity: uploading ? 0.5 : 1
                }}
              >
                {uploadPhotos.length === 0 ? '📷 Choose Photos' : '+ Add More Photos'}
              </button>
            )}
          </div>
        </div>

        {/* Video Upload */}
        <div className="gcard">
          <div className="gcard-border" />
          <div className="gcard-inner p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold" style={{ color: 'var(--text1)' }}>Videos</h3>
              <span className="text-xs px-2 py-1 rounded-full" style={{ background: 'rgba(34, 197, 94, 0.2)', color: '#22c55e' }}>
                {uploadVideos.length}/{MAX_VIDEOS}
              </span>
            </div>
            {uploadVideos.length === 0 ? (
              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                onChange={handleVideoSelect}
                className="hidden"
                disabled={uploading}
              />
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
                      <button onClick={removeVideo}
                        className="w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold text-white flex-shrink-0"
                        style={{ background: '#ef4444' }}>×</button>
                    )}
                  </div>
                ))}
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleVideoSelect}
                  className="hidden"
                  disabled={uploading}
                />
              </div>
            )}
            {uploadVideos.length < MAX_VIDEOS && (
              <button
                onClick={() => videoInputRef.current?.click()}
                disabled={uploading}
                className="w-full py-3 rounded-xl font-semibold transition-all duration-200 border-2"
                style={{ 
                  background: 'transparent', 
                  borderColor: 'var(--text3)', 
                  color: 'var(--text2)',
                  opacity: uploading ? 0.5 : 1
                }}
              >
                🎥 Choose Video
              </button>
            )}
          </div>
        </div>

        {/* Upload Button */}
        <button
          onClick={handleUpload}
          disabled={uploading || (!uploadPhotos.length && !uploadVideos.length)}
          className="w-full py-4 rounded-xl font-bold text-white transition-all duration-200"
          style={{ 
            background: uploading ? 'var(--text3)' : 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            opacity: uploading || (!uploadPhotos.length && !uploadVideos.length) ? 0.5 : 1,
            transform: uploading ? 'scale(0.98)' : 'scale(1)'
          }}
        >
          {uploading ? 'Uploading...' : `Upload ${uploadPhotos.length + uploadVideos.length} File${uploadPhotos.length + uploadVideos.length !== 1 ? 's' : ''}`}
        </button>
      </div>

      {lastUrl && (
        <div className="mt-8 text-center">
          <p className="text-sm mb-2" style={{ color: 'var(--text2)' }}>Last uploaded:</p>
          <div className="w-32 h-32 mx-auto rounded-xl overflow-hidden">
            {uploadVideos.length > 0 ? (
              <video src={lastUrl} className="w-full h-full object-cover" autoPlay muted loop />
            ) : (
              <img src={lastUrl} className="w-full h-full object-cover" alt="" />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
