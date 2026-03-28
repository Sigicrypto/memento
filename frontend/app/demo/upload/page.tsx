"use client";

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
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
  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

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
    setProgress(0);

    const allFiles = [...photos, ...videos];
    let uploadedCount = 0;

    const channel = supabase.channel(`demo-${demoId}`);
    await new Promise<void>((resolve) => {
      channel.subscribe((status) => {
        if (status === 'SUBSCRIBED') resolve();
      });
    });

    try {
      for (const file of allFiles) {
        const type = file.type.startsWith('video') ? 'video' : 'image';
        const fileExt = file.name.split('.').pop();
        const fileName = `demo/${demoId}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        
        console.log(`Uploading ${fileName}...`);
        const { data, uploadError } = await supabase.storage
          .from('photos')
          .upload(fileName, file) as any;

        if (uploadError) {
          console.error('Upload error:', uploadError);
          throw new Error(uploadError.message || 'Upload failed');
        }

        if (data) {
          const { data: { publicUrl } } = supabase.storage
            .from('photos')
            .getPublicUrl(data.path);

          console.log(`Broadcasting URL: ${publicUrl}`);
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
        setProgress(Math.round((uploadedCount / allFiles.length) * 100));
      }

      setSuccess(true);
    } catch (err: any) {
      console.error('Final upload error:', err);
      setError(err.message || 'An unexpected error occurred during upload.');
    } finally {
      setUploading(false);
      supabase.removeChannel(channel);
    }
  };

  if (success) {
    return (
      <div className="nm-page flex flex-col items-center justify-center p-6 text-center">
        <div className="nm-circle w-20 h-20 mb-6 text-4xl">✅</div>
        <h1 className="text-2xl font-bold mb-2" style={{color:'#e2e8f0'}}>Upload Complete!</h1>
        <p className="text-sm mb-8" style={{color:'#7f849c'}}>Check out the live wall to see your memories.</p>
        <button onClick={() => { setSuccess(false); setError(null); setPhotos([]); setVideos([]); }} className="nm-btn px-6 py-3 font-bold">
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
        <p className="text-sm mb-8" style={{color:'#7f849c'}}>{error}</p>
        <button onClick={() => { setError(null); setUploading(false); }} className="nm-btn px-6 py-3 font-bold">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="nm-page min-h-screen py-8 px-4 flex flex-col items-center">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="nm-circle w-12 h-12 mx-auto mb-4 text-2xl inline-flex items-center justify-center">📷</span>
          <h1 className="text-2xl font-bold" style={{color:'#e2e8f0'}}>Demo Upload</h1>
          <p className="text-sm mt-1" style={{color:'#7f849c'}}>Share to the live wall!</p>
        </div>

        <div className="nm-card p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold" style={{color:'#e2e8f0'}}>Photos ({photos.length}/5)</h2>
            {photos.length < 5 && (
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
                  <button onClick={() => removePhoto(i)} className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs shadow-lg">
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="nm-card p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold" style={{color:'#e2e8f0'}}>Video ({videos.length}/1)</h2>
            {videos.length === 0 && (
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
              <button onClick={removeVideo} className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center text-sm shadow-lg z-10">
                ×
              </button>
            </div>
          )}
        </div>

        {(photos.length > 0 || videos.length > 0) && (
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#14182a]/90 backdrop-blur-md z-50">
            <div className="max-w-md mx-auto">
              <button 
                onClick={handleUpload} 
                className="nm-btn nm-btn-accent w-full py-4 font-bold text-lg"
                disabled={uploading}
              >
                {uploading ? `Uploading... ${progress}%` : `Upload ${photos.length + videos.length} Item(s)`}
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
