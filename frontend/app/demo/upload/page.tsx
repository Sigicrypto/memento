"use client";

import { useState, useRef, Suspense, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { DemoMedia, upsertDemoPhoto } from '@/lib/demoWall';
import '@/app/globals.css';

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
    image.onload = () => {
      URL.revokeObjectURL(imageUrl);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(imageUrl);
      reject(new Error('Unable to read image for compression.'));
    };
    image.src = imageUrl;
  });
}

async function compressDemoImage(file: File) {
  const extension = getFileExtension(file.name);
  if (extension === 'heic' || extension === 'heif') {
    return file;
  }

  try {
    const image = await loadImageFromFile(file);
    const maxDimension = 1600;
    const scale = Math.min(1, maxDimension / Math.max(image.width, image.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(image.width * scale));
    canvas.height = Math.max(1, Math.round(image.height * scale));
    const context = canvas.getContext('2d');

    if (!context) {
      return file;
    }

    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    const outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, outputType, 0.82);
    });

    if (!blob || blob.size >= file.size) {
      return file;
    }

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

  // Monitor connection to the wall
  useEffect(() => {
    if (!demoId) return;

    const channel = supabase.channel(`demo-${demoId}-status-check`);
    channel.subscribe((status) => {
      setIsConnected(status === 'SUBSCRIBED');
    });
    return () => {
      supabase.removeChannel(channel);
    };
  }, [demoId]);

  if (!demoId) {
    return (
      <div className="nm-page flex items-center justify-center p-4 text-center">
        <div className="nm-card p-8">
          <p className="text-xl" style={{color:'#e2e8f0'}}>Invalid Demo Link</p>
          <p className="text-sm mt-2" style={{color:'#7f849c'}}>Please scan a valid QR code.</p>
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
        setValidationMessage(`You can upload a maximum of ${MAX_IMAGES} images in demo mode.`);
      } else {
        if (nextFiles.length > spaceLeft) {
          setValidationMessage(`You can upload only ${MAX_IMAGES} images in demo mode.`);
        }
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
        setValidationMessage(`You can upload only ${MAX_VIDEOS} video in demo mode.`);
        return;
      }
      setValidationMessage(null);
      setVideos([e.target.files[0]]);
    }
    if (videoInputRef.current) videoInputRef.current.value = '';
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const removeVideo = () => setVideos([]);

  const handleUpload = async () => {
    if (!demoId) {
      setError('Demo session not found. Reload the Demo Wall and try again.');
      return;
    }
    if (photos.length === 0 && videos.length === 0) return;

    setUploading(true);
    setProgress(5);
    setError(null);
    setValidationMessage(null);
    setStatus('Preparing files...');

    const allFiles = [...photos, ...videos];
    let uploadedCount = 0;
    const broadcastChannel = supabase.channel(`demo-upload-${demoId}-${Date.now()}`);

    try {
      setStatus('Connecting to Wall...');
      const subStatus = await new Promise<string>((resolve) => {
        broadcastChannel.subscribe((status) => {
          if (status === 'SUBSCRIBED' || status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            resolve(status);
          }
        });
        setTimeout(() => resolve('TIMEOUT'), 5000);
      });

      if (subStatus !== 'SUBSCRIBED') {
        setStatus('Connection is slow. Uploading anyway...');
      }

      setProgress(10);

      for (const file of allFiles) {
        const type = file.type.startsWith('video') ? 'video' : 'image';
        const preparedFile = type === 'image' ? await compressDemoImage(file) : file;
        const fileExt = getFileExtension(preparedFile.name) || (type === 'video' ? 'mp4' : 'jpg');
        const fileName = `demo/${demoId}/${Date.now()}_${Math.random().toString(36).slice(2, 7)}.${fileExt}`;

        setStatus(`Uploading ${type} ${uploadedCount + 1}/${allFiles.length}...`);
        const { data, error: uploadError } = await supabase.storage
          .from('photos')
          .upload(fileName, preparedFile, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          throw new Error(`Upload failed: ${uploadError.message}`);
        }

        if (data) {
          const { data: { publicUrl } } = supabase.storage
            .from('photos')
            .getPublicUrl(data.path);

          setLastUrl(publicUrl);
          setStatus('Syncing with wall...');

          const payload: DemoMedia = {
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            url: publicUrl,
            type: type,
            caption: type === 'video' ? 'Live Video from Demo!' : 'Live Photo from Demo!',
            uploader: 'Demo Guest',
            createdAt: Date.now(),
          };

          upsertDemoPhoto(demoId, payload);

          const broadcastResp = await broadcastChannel.send({
            type: 'broadcast',
            event: 'NEW_UPLOAD',
            payload: payload
          });

          if (broadcastResp !== 'ok') {
            setStatus('Uploaded. Live wall sync may take a moment.');
          }
        }

        uploadedCount++;
        setProgress(Math.round(10 + (uploadedCount / allFiles.length) * 85));
      }

      setStatus('Success!');
      setProgress(100);
      setUploading(false);
      setPhotos([]);
      setVideos([]);
      setTimeout(() => setSuccess(true), 300);
    } catch (err: any) {
      setUploading(false);
      setError(err.message || 'Upload failed. Please try again on a better connection.');
    } finally {
      supabase.removeChannel(broadcastChannel);
    }
  };

  if (success) {
    return (
      <div className="nm-page min-h-screen py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="nm-circle w-20 h-20 mx-auto mb-6 text-4xl">✅</div>
            <h1 className="text-3xl font-bold mb-2" style={{color:'#e2e8f0'}}>Upload Complete!</h1>
            <p className="text-sm mb-6" style={{color:'#7f849c'}}>Your photo is now live on the wall.</p>
          </div>

          {/* View Options */}
          <div className="text-center mb-8">
            <h2 className="text-xl font-bold mb-4" style={{color:'#e2e8f0'}}>View Your Photo on the Wall</h2>
            <div className="flex justify-center gap-2 mb-6 flex-wrap">
              <Link href={`/demo?id=${demoId}`} className="nm-btn nm-btn-accent px-6 py-3 font-bold">
                🖼️ Open Live Wall
              </Link>
              <Link href={`/demo?id=${demoId}#grid`} className="nm-btn px-4 py-3 text-sm">
                📱 Grid View
              </Link>
              <Link href={`/demo?id=${demoId}#polaroid`} className="nm-btn px-4 py-3 text-sm">
                📸 Polaroid View
              </Link>
              <Link href={`/demo?id=${demoId}#slideshow`} className="nm-btn px-4 py-3 text-sm">
                🎬 Slideshow
              </Link>
            </div>
          </div>

          {/* Uploaded File Preview */}
          {lastUrl && (
            <div className="text-center mb-8">
              <h3 className="text-lg font-semibold mb-4" style={{color:'#e2e8f0'}}>Your Upload</h3>
              <div className="nm-card p-4 inline-block">
                {lastUrl.includes('video') ? (
                  <video src={lastUrl} className="max-w-sm max-h-64 rounded-lg" controls playsInline />
                ) : (
                  <img src={lastUrl} className="max-w-sm max-h-64 rounded-lg" alt="Your upload" />
                )}
              </div>
              <div className="mt-4">
                <a href={lastUrl} target="_blank" className="nm-btn px-4 py-2 text-sm">
                  🔗 View Full Size
                </a>
              </div>
            </div>
          )}

          {/* Upload More Options */}
          <div className="text-center">
            <div className="nm-card p-6 inline-block">
              <h3 className="text-lg font-semibold mb-4" style={{color:'#e2e8f0'}}>Share More Photos</h3>
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => { 
                    setSuccess(false); 
                    setError(null); 
                    setValidationMessage(null);
                    setProgress(0); 
                    setStatus(''); 
                    setUploading(false);
                    setPhotos([]);
                    setVideos([]);
                  }} 
                  className="nm-btn nm-btn-accent px-6 py-3 font-bold"
                >
                  ➕ Add More Photos
                </button>
                <Link href={`/demo?id=${demoId}`} className="nm-btn px-4 py-2 text-sm">
                  🏠 Back to Wall
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="nm-page flex flex-col items-center justify-center p-6 text-center">
        <div className="nm-circle w-20 h-20 mb-6 text-4xl">❌</div>
        <h1 className="text-2xl font-bold mb-2" style={{color:'#e2e8f0'}}>Upload Failed</h1>
        <p className="text-sm px-4 mb-4" style={{color:'#fca5a5'}}>{error}</p>
        <button onClick={() => { setError(null); setUploading(false); setProgress(0); }} className="nm-btn px-6 py-3 font-bold">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="nm-page min-h-screen py-8 px-4 flex flex-col items-center">
      <div className="fixed top-4 left-4 z-50 flex items-center gap-2 bg-[#14182a]/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/5 shadow-xl">
        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 shadow-[0_0_8px_#4ade80]' : 'bg-red-500'}`} />
        <span className="text-[10px] font-bold text-white/40 uppercase tracking-tighter">Syncing: <span className="text-[#f59e0b]">{demoId}</span></span>
      </div>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="nm-circle w-12 h-12 mx-auto mb-4 text-2xl inline-flex items-center justify-center">📷</span>
          <h1 className="text-2xl font-bold" style={{color:'#e2e8f0'}}>Demo Upload</h1>
          <p className="text-sm mt-1" style={{color:'#7f849c'}}>Share to the live wall!</p>
        </div>

        {validationMessage && (
          <div className="nm-card px-4 py-3 mb-4 text-sm text-center" style={{color:'#fbbf24'}}>{validationMessage}</div>
        )}

        <div className="nm-card p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold" style={{color:'#e2e8f0'}}>Photos ({photos.length}/{MAX_IMAGES})</h2>
            {!uploading && photos.length < MAX_IMAGES && (
              <button onClick={() => photoInputRef.current?.click()} className="nm-btn px-3 py-1.5 text-xs text-[#f59e0b] font-bold">
                + Add Photo
              </button>
            )}
          </div>
          <input type="file" accept=".jpg,.jpeg,.png,.heic,.heif,image/jpeg,image/png,image/heic,image/heif" multiple ref={photoInputRef} onChange={handlePhotoSelect} className="hidden" />
          
          {photos.length === 0 ? (
            <div className="nm-inset p-8 text-center rounded-xl border-dashed border-2" style={{borderColor: '#252c46'}}>
              <p className="text-xs" style={{color:'#7f849c'}}>No photos selected</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {photos.map((p, i) => (
                <div key={i} className="relative aspect-square rounded-lg overflow-hidden nm-inset">
                  <img src={URL.createObjectURL(p)} alt="preview" className="w-full h-full object-cover" />
                  {!uploading && (
                    <button onClick={() => removePhoto(i)} className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs shadow-lg">
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="nm-card p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold" style={{color:'#e2e8f0'}}>Video ({videos.length}/{MAX_VIDEOS})</h2>
            {!uploading && videos.length === 0 && (
              <button onClick={() => videoInputRef.current?.click()} className="nm-btn px-3 py-1.5 text-xs text-[#f59e0b] font-bold">
                + Add Video
              </button>
            )}
          </div>
          <input type="file" accept=".mp4,video/mp4" ref={videoInputRef} onChange={handleVideoSelect} className="hidden" />

          {videos.length === 0 ? (
            <div className="nm-inset p-8 text-center rounded-xl border-dashed border-2" style={{borderColor: '#252c46'}}>
              <p className="text-xs" style={{color:'#7f849c'}}>No video selected</p>
            </div>
          ) : (
            <div className="relative aspect-video rounded-lg overflow-hidden nm-inset">
              <video src={URL.createObjectURL(videos[0])} className="w-full h-full object-cover" controls />
              {!uploading && (
                <button onClick={removeVideo} className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center text-sm shadow-lg z-10">
                  ×
                </button>
              )}
            </div>
          )}
        </div>

        {(photos.length > 0 || videos.length > 0) && (
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#14182a]/90 backdrop-blur-md z-50">
            <div className="max-w-md mx-auto">
              {uploading && (
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-1 text-[10px] font-bold uppercase tracking-widest text-[#f59e0b]">
                    <span>{status}</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="nm-inset h-1.5 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#f59e0b] to-[#f472b6] transition-all duration-300" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              )}
              <button 
                onClick={handleUpload} 
                className="nm-btn nm-btn-accent w-full py-4 font-bold text-lg"
                disabled={uploading}
              >
                {uploading ? `Processing...` : `Share to Live Wall`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function DemoUploadPage() {
  return (
    <Suspense fallback={<div className="nm-page flex items-center justify-center min-h-screen text-[#f59e0b]">Loading...</div>}>
      <UploadContent />
    </Suspense>
  );
}
