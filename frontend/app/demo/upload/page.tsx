"use client";

import { useState, useRef, Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { DemoMedia, upsertDemoPhoto } from '@/lib/demoWall';
import AnimatedLogo from '@/components/AnimatedLogo';
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
  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!demoId) return;
    const channel = supabase.channel(getDemoChannelName(demoId));
    channel.subscribe((status) => setIsConnected(status === 'SUBSCRIBED'));
    return () => {
      supabase.removeChannel(channel);
    };
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
    setUploadSuccess(false);
    setStatus('Uploading...');
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
        setStatus(`Uploading ${uploaded}/${totalFiles}...`);
        await new Promise(r => setTimeout(r, 200));
      }
      setStatus('Sending to wall...');
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
      setTotalUploaded(prev => prev + urls.length);
      setUploadPhotos([]);
      setUploadVideos([]);
      setComment('');
      setStatus('');
      setUploadSuccess(true);
      if (photoInputRef.current) photoInputRef.current.value = '';
      if (videoInputRef.current) videoInputRef.current.value = '';
      setTimeout(() => setUploadSuccess(false), 4000);
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
    <div className="lp min-h-screen pb-16">
      <div className="orbs"><div className="orb orb1" /><div className="orb orb2" /><div className="orb orb3" /></div>
      <div className="grain" />

      {/* NAV */}
      <nav className="lp-nav scrolled">
        <Link href="/">
          <AnimatedLogo width={150} height={50} />
        </Link>
        <span className="hero-badge" style={{ gap: 6 }}>
          <span className={`pulse-dot`} style={{ background: isConnected ? '#4ade80' : '#f87171' }} />
          <span className="text-xs font-bold tracking-widest uppercase"
            style={{ color: isConnected ? '#16a34a' : '#ef4444' }}>
            {isConnected ? 'Live' : 'Offline'}
          </span>
          {totalUploaded > 0 && (
            <span className="text-xs font-bold" style={{ color: 'var(--amber)' }}>· {totalUploaded} sent ✓</span>
          )}
        </span>
      </nav>

      <div className="px-4 pt-28 flex flex-col items-center">
        {/* Header */}
        <div className="text-center mb-8 reveal visible" style={{ maxWidth: 480, width: '100%' }}>
          <span className="kicker">Demo Wall</span>
          <h1 className="hero-h1" style={{ fontSize: 'clamp(1.8rem, 6vw, 3rem)', marginBottom: '0.5rem' }}>Share the Moment</h1>
          <p className="hero-sub" style={{ fontSize: '1rem' }}>Upload photos or a video to the live wall</p>
        </div>

        {/* Success Banner */}
        {uploadSuccess && (
          <div className="w-full max-w-md mb-6 p-4 rounded-2xl text-center reveal visible"
            style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.15), rgba(16,185,129,0.1))', border: '1px solid rgba(34,197,94,0.3)' }}>
            <p className="text-2xl mb-1">🎉</p>
            <p className="font-bold" style={{ color: '#22c55e' }}>Posted to the wall!</p>
            <p className="text-sm" style={{ color: 'var(--text3)' }}>Your memories are now live</p>
          </div>
        )}

        {/* Error Banner */}
        {error && (
          <div className="w-full max-w-md mb-6 p-4 rounded-2xl"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
            <p className="text-sm text-center" style={{ color: '#ef4444' }}>{error}</p>
          </div>
        )}

        <div className="w-full max-w-md space-y-4">

          {/* Name & Comment */}
          <div className="gcard">
            <div className="gcard-border" />
            <div className="gcard-inner p-5 space-y-4">
              <div>
                <label className="text-xs font-bold tracking-widest uppercase mb-2 block" style={{ color: 'var(--text3)' }}>Your Name</label>
                <input
                  type="text"
                  placeholder="e.g. Sarah"
                  value={uploaderName}
                  onChange={e => setUploaderName(e.target.value)}
                  disabled={uploading}
                  maxLength={40}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                  style={{
                    background: 'rgba(30,41,59,0.06)',
                    border: '1.5px solid rgba(100,116,139,0.2)',
                    color: 'var(--text1)',
                  }}
                />
              </div>
              <div>
                <label className="text-xs font-bold tracking-widest uppercase mb-2 block" style={{ color: 'var(--text3)' }}>Caption <span style={{ color: 'var(--text3)', fontWeight: 400 }}>(optional)</span></label>
                <textarea
                  placeholder="Write something about this moment..."
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  disabled={uploading}
                  maxLength={120}
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all resize-none"
                  style={{
                    background: 'rgba(30,41,59,0.06)',
                    border: '1.5px solid rgba(100,116,139,0.2)',
                    color: 'var(--text1)',
                  }}
                />
                <p className="text-right text-xs mt-1" style={{ color: 'var(--text3)' }}>{comment.length}/120</p>
              </div>
            </div>
          </div>

          {/* Photos */}
          <div className="gcard">
            <div className="gcard-border" />
            <div className="gcard-inner p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-bold" style={{ color: 'var(--text1)' }}>📷 Photos</p>
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                  style={{ background: uploadPhotos.length > 0 ? 'rgba(34,197,94,0.15)' : 'rgba(100,116,139,0.1)', color: uploadPhotos.length > 0 ? '#22c55e' : 'var(--text3)' }}>
                  {uploadPhotos.length}/{MAX_IMAGES}
                </span>
              </div>
              <input ref={photoInputRef} type="file" accept="image/*" multiple onChange={handlePhotoSelect} className="hidden" disabled={uploading} />
              {uploadPhotos.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {uploadPhotos.map((photo, i) => (
                    <div key={i} className="relative aspect-square rounded-xl overflow-hidden group">
                      <img src={URL.createObjectURL(photo)} className="w-full h-full object-cover" alt="" />
                      {!uploading && (
                        <button onClick={() => removePhoto(i)}
                          className="absolute top-1 right-1 w-5 h-5 flex items-center justify-center rounded-full text-xs font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{ background: 'rgba(239,68,68,0.9)' }}>×</button>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {uploadPhotos.length < MAX_IMAGES && (
                <button onClick={() => photoInputRef.current?.click()} disabled={uploading}
                  className="w-full py-3 rounded-xl text-sm font-semibold border-2 border-dashed transition-all"
                  style={{ borderColor: 'rgba(100,116,139,0.3)', color: 'var(--text2)', background: 'transparent', opacity: uploading ? 0.5 : 1 }}>
                  {uploadPhotos.length === 0 ? '+ Choose Photos' : '+ Add More'}
                </button>
              )}
            </div>
          </div>

          {/* Video */}
          <div className="gcard">
            <div className="gcard-border" />
            <div className="gcard-inner p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-bold" style={{ color: 'var(--text1)' }}>🎥 Video</p>
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                  style={{ background: uploadVideos.length > 0 ? 'rgba(34,197,94,0.15)' : 'rgba(100,116,139,0.1)', color: uploadVideos.length > 0 ? '#22c55e' : 'var(--text3)' }}>
                  {uploadVideos.length}/{MAX_VIDEOS}
                </span>
              </div>
              <input ref={videoInputRef} type="file" accept="video/*" onChange={handleVideoSelect} className="hidden" disabled={uploading} />
              {uploadVideos.length > 0 && (
                <div className="relative aspect-video rounded-xl overflow-hidden mb-3">
                  <video src={URL.createObjectURL(uploadVideos[0])} className="w-full h-full object-cover" muted />
                  {!uploading && (
                    <button onClick={removeVideo}
                      className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold text-white"
                      style={{ background: 'rgba(239,68,68,0.9)' }}>×</button>
                  )}
                </div>
              )}
              {uploadVideos.length < MAX_VIDEOS && (
                <button onClick={() => videoInputRef.current?.click()} disabled={uploading}
                  className="w-full py-3 rounded-xl text-sm font-semibold border-2 border-dashed transition-all"
                  style={{ borderColor: 'rgba(100,116,139,0.3)', color: 'var(--text2)', background: 'transparent', opacity: uploading ? 0.5 : 1 }}>
                  + Choose Video
                </button>
              )}
            </div>
          </div>

          {/* Upload progress */}
          {uploading && (
            <div className="px-1">
              <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--text3)' }}>
                <span>{status}</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full rounded-full h-1.5" style={{ background: 'rgba(100,116,139,0.2)' }}>
                <div className="h-1.5 rounded-full transition-all duration-300" style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)' }} />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handleUpload}
            disabled={uploading || totalFiles === 0}
            className="btn-glow w-full py-4 font-bold text-lg"
            style={{ opacity: uploading || totalFiles === 0 ? 0.5 : 1 }}
          >
            {uploading ? `Uploading... ${progress}%` : `Share to Wall${totalFiles > 0 ? ` (${totalFiles} file${totalFiles !== 1 ? 's' : ''})` : ''}`}
          </button>

        </div>
      </div>
    </div>
  );
}

export default function DemoUploadPage() {
  return (
    <Suspense fallback={<div className="lp min-h-screen flex items-center justify-center"><span style={{ color: 'var(--text2)' }}>Loading...</span></div>}>
      <DemoUploadContent />
    </Suspense>
  );
}
