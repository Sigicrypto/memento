"use client";

import { useState, useRef, Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import '@/app/globals.css';

function UploadContent() {
  const searchParams = useSearchParams();
  const demoId = searchParams.get('id');
  const [photos, setPhotos] = useState<File[]>([]);
  const [videos, setVideos] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('');
  const [lastUrl, setLastUrl] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Monitor connection to the wall
  useEffect(() => {
    if (!demoId) return;
    const channel = supabase.channel(`demo-status-${demoId}`);
    channel.subscribe((status) => {
      setIsConnected(status === 'SUBSCRIBED');
    });
    return () => { supabase.removeChannel(channel); };
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
      const newFiles = Array.from(e.target.files);
      const spaceLeft = 5 - photos.length;
      if (newFiles.length > spaceLeft) {
        alert(`You can only add ${spaceLeft} more photo(s).`);
      }
      setPhotos((prev) => [...prev, ...newFiles.slice(0, spaceLeft)]);
    }
    if (photoInputRef.current) photoInputRef.current.value = '';
  };

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      if (videos.length >= 1) {
        alert("You can only upload 1 video.");
        return;
      }
      setVideos([e.target.files[0]]);
    }
    if (videoInputRef.current) videoInputRef.current.value = '';
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const removeVideo = () => setVideos([]);

  const handleUpload = async () => {
    if (photos.length === 0 && videos.length === 0) return;
    setUploading(true);
    setProgress(5); // Jump to 5% immediately
    setError(null);
    setStatus('Initializing...');

    const allFiles = [...photos, ...videos];
    let uploadedCount = 0;
    const channel = supabase.channel(`demo-${demoId}`);

    try {
      // 1. Try to connect to realtime (with a 5s timeout)
      setStatus('Connecting to Wall...');
      await Promise.race([
        new Promise<void>((resolve) => {
          channel.subscribe((status) => {
            if (status === 'SUBSCRIBED') resolve();
          });
        }),
        new Promise<void>((resolve) => setTimeout(resolve, 3000))
      ]);

      setProgress(10);

      // 2. Loop through and upload files
      for (const file of allFiles) {
        const type = file.type.startsWith('video') ? 'video' : 'image';
        const fileExt = file.name.split('.').pop() || (type === 'video' ? 'mp4' : 'jpg');
        const fileName = `demo/${demoId}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        
        setStatus(`Uploading ${type} ${uploadedCount + 1}/${allFiles.length}...`);
        
        // Minor progress bump during upload start
        setProgress(prev => Math.min(prev + 5, 90));

        const { data, error: uploadError } = await supabase.storage
          .from('photos')
          .upload(fileName, file);

        if (uploadError) throw new Error(uploadError.message || `Failed to upload ${type}`);

        if (data) {
          const { data: { publicUrl } } = supabase.storage
            .from('photos')
            .getPublicUrl(data.path);

          setLastUrl(publicUrl);
          setStatus(`Syncing with Wall...`);
          
          await channel.send({
            type: 'broadcast',
            event: 'NEW_UPLOAD',
            payload: {
              id: Date.now() + Math.random(),
              url: publicUrl,
              type: type,
              caption: type === 'video' ? 'Awesome Video!' : 'Great Photo!',
              uploader: 'Demo Guest'
            }
          });
        }
        
        uploadedCount++;
        setProgress(Math.round(10 + (uploadedCount / allFiles.length) * 85));
      }

      setStatus('Success!');
      setProgress(100);
      setTimeout(() => setSuccess(true), 500);
    } catch (err: any) {
      console.error('Process Error:', err);
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      supabase.removeChannel(channel);
    }
  };

  if (success) {
    return (
      <div className="nm-page flex flex-col items-center justify-center p-6 text-center">
        <div className="nm-circle w-20 h-20 mb-6 text-4xl">✅</div>
        <h1 className="text-2xl font-bold mb-2" style={{color:'#e2e8f0'}}>Upload Complete!</h1>
        <p className="text-sm mb-4" style={{color:'#7f849c'}}>Your photo is now live on the wall.</p>
        
        {lastUrl && (
          <a href={lastUrl} target="_blank" className="text-xs mb-8 block underline" style={{color:'#f59e0b'}}>
            View Uploaded File
          </a>
        )}

        <button onClick={() => { setSuccess(false); setPhotos([]); setVideos([]); setError(null); setProgress(0); }} className="nm-btn px-6 py-3 font-bold">
          Upload More
        </button>
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
      {/* Target ID Debug Indicator */}
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

        <div className="nm-card p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold" style={{color:'#e2e8f0'}}>Photos ({photos.length}/5)</h2>
            {!uploading && photos.length < 5 && (
              <button onClick={() => photoInputRef.current?.click()} className="nm-btn px-3 py-1.5 text-xs text-[#f59e0b] font-bold">
                + Add Photo
              </button>
            )}
          </div>
          <input type="file" accept="image/*" multiple ref={photoInputRef} onChange={handlePhotoSelect} className="hidden" />
          
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
            <h2 className="font-semibold" style={{color:'#e2e8f0'}}>Video ({videos.length}/1)</h2>
            {!uploading && videos.length === 0 && (
              <button onClick={() => videoInputRef.current?.click()} className="nm-btn px-3 py-1.5 text-xs text-[#f59e0b] font-bold">
                + Add Video
              </button>
            )}
          </div>
          <input type="file" accept="video/*" ref={videoInputRef} onChange={handleVideoSelect} className="hidden" />

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
