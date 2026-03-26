"use client";

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

// Local storage keys
const GUEST_NAME_KEY = 'memento_guest_name';
const OFFLINE_UPLOADS_KEY = 'memento_offline_uploads';

interface OfflineUpload {
  id: string;
  eventId: string;
  file: File;
  uploaderName: string;
  caption: string;
  timestamp: number;
}

export default function UploadPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [eventName, setEventName] = useState('');
  const [eventId, setEventId] = useState<string | null>(null);
  const [eventPlan, setEventPlan] = useState<string>('FREE');
  
  const [eventPassword, setEventPassword] = useState<string | null>(null);
  const [unlocked, setUnlocked] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const [uploaderName, setUploaderName] = useState('');
  const [caption, setCaption] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEvent = async () => {
      const { data, error } = await supabase.from('events')
        .select('id, name, password').eq('slug', slug).single();
      if (error || !data) { setError('Event not found.'); return; }
      setEventName(data.name);
      setEventId(data.id);
      setEventPassword(data.password ?? null);
      setEventPlan('FREE'); // Default to FREE since plan_type doesn't exist
      if (!data.password) setUnlocked(true);
    };
    fetchEvent();
  }, [slug]);

  // Load cached guest name on mount
  useEffect(() => {
    const cachedName = localStorage.getItem(GUEST_NAME_KEY);
    if (cachedName) {
      setUploaderName(cachedName);
    }
  }, []);

  // Cache guest name when changed
  useEffect(() => {
    if (uploaderName.trim()) {
      localStorage.setItem(GUEST_NAME_KEY, uploaderName.trim());
    }
  }, [uploaderName]);

  // Check for offline uploads and retry
  useEffect(() => {
    if (eventId && navigator.onLine) {
      retryOfflineUploads();
    }
  }, [eventId]);

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => {
      if (eventId) retryOfflineUploads();
    };
    
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [eventId]);

  // AUTO-CLICK CAMERA ON UNLOCK
  useEffect(() => {
    if (unlocked) {
      setTimeout(() => {
        const input = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (input) {
          input.click();
        }
      }, 500);
    }
  }, [unlocked]);


  // Convert HEIC to JPG fallback
  const convertHeicToJpg = async (file: File): Promise<File> => {
    if (!file.type.includes('heic')) return file;
    
    try {
      // For now, return the original file with a warning
      // In production, you'd use a library like 'heic2any'
      console.warn('HEIC file detected, conversion not implemented in browser');
      return file;
    } catch (error) {
      console.error('HEIC conversion failed:', error);
      return file;
    }
  };

  // Store upload for offline retry
  const storeOfflineUpload = async (file: File, uploaderName: string, caption: string) => {
    const offlineUpload: OfflineUpload = {
      id: `${Date.now()}-${Math.random()}`,
      eventId: eventId!,
      file,
      uploaderName,
      caption,
      timestamp: Date.now()
    };
    
    const existingUploads = JSON.parse(localStorage.getItem(OFFLINE_UPLOADS_KEY) || '[]');
    existingUploads.push(offlineUpload);
    localStorage.setItem(OFFLINE_UPLOADS_KEY, JSON.stringify(existingUploads));
  };

  // Retry offline uploads
  const retryOfflineUploads = async () => {
    const offlineUploads = JSON.parse(localStorage.getItem(OFFLINE_UPLOADS_KEY) || '[]') as OfflineUpload[];
    const eventUploads = offlineUploads.filter(upload => upload.eventId === eventId);
    
    if (eventUploads.length === 0) return;
    
    const remainingUploads = [...offlineUploads];
    
    for (const upload of eventUploads) {
      try {
        const convertedFile = await convertHeicToJpg(upload.file);
        await uploadSingleFile(convertedFile, upload.uploaderName, upload.caption);
        
        // Remove successful upload
        const index = remainingUploads.findIndex(u => u.id === upload.id);
        if (index > -1) remainingUploads.splice(index, 1);
      } catch (error) {
        console.error('Failed to retry upload:', error);
      }
    }
    
    localStorage.setItem(OFFLINE_UPLOADS_KEY, JSON.stringify(remainingUploads));
    
    if (eventUploads.length > 0) {
      setSuccess(prev => prev || true);
    }
  };

  // Upload single file
  const uploadSingleFile = async (file: File, name: string, caption: string) => {
    if (!eventId) throw new Error('No event ID');
    
    const ext = file.name.split('.').pop();
    const filePath = `${eventId}/${Date.now()}-${Math.random()}.${ext}`;
    
    const { error: uploadError } = await supabase.storage
      .from('photos')
      .upload(filePath, file);
    
    if (uploadError) throw uploadError;
    
    const { error: dbError } = await supabase.from('photos').insert({
      event_id: eventId,
      storage_path: filePath,
      uploader_name: name || 'Guest',
      caption: caption || null,
    });
    
    if (dbError) throw dbError;
  };

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === eventPassword) { setUnlocked(true); setPasswordError(''); }
    else setPasswordError('Incorrect password. Please try again.');
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    
    // Check for videos on free plan
    const hasVideo = selectedFiles.some(f => f.type.startsWith('video/'));
    if (hasVideo && eventPlan === 'FREE') {
      setError('Video uploads are a Premium feature. High-res photos only on this event!');
      setFiles([]);
      setPreviews([]);
      return;
    }

    // Check for HEIC files and warn about conversion
    const hasHeic = selectedFiles.some(f => f.type.includes('heic'));
    if (hasHeic) {
      setError('HEIC photos detected. They will be uploaded in original format. For best compatibility, use JPG files.');
      setTimeout(() => setError(''), 5000);
    }

    if (selectedFiles.length > 0) {
      setFiles(selectedFiles);
      setPreviews(selectedFiles.map(f => URL.createObjectURL(f)));
      setSuccess(false);
      setError('');
    }
  };



  const uploadFiles = async (filesToUpload: File[]) => {
    if (filesToUpload.length === 0 || !eventId) return;
    
    setUploading(true);
    setUploadProgress(10);
    setError('');

    let uploadErrors: string[] = [];
    const isOffline = !navigator.onLine;

    for (let i = 0; i < filesToUpload.length; i++) {
      const fileItem = filesToUpload[i];
      
      try {
        // Convert HEIC if needed
        const convertedFile = await convertHeicToJpg(fileItem);
        
        setUploadProgress(Math.round(((i + 0.1) / filesToUpload.length) * 100));
        
        if (isOffline) {
          // Store for offline upload
          await storeOfflineUpload(convertedFile, uploaderName, caption);
        } else {
          // Upload immediately
          await uploadSingleFile(convertedFile, uploaderName, caption);
        }
        
        setUploadProgress(Math.round(((i + 0.5) / filesToUpload.length) * 100));
      } catch (error: any) {
        uploadErrors.push(error.message || 'Upload failed');
      }
    }

    if (uploadErrors.length > 0) {
      setError(`Failed to upload ${uploadErrors.length} file(s): ${uploadErrors[0]}`);
    } else if (isOffline) {
      setSuccess(true);
      setError('');
      // Show offline message
      setTimeout(() => {
        setSuccess(false);
        setError('Photos will be uploaded when you\'re back online.');
      }, 3000);
    } else {
      setSuccess(true);
      setError('');
      
      // Redirect to mobile page after successful upload
      setTimeout(() => {
        window.location.href = `/mobile/${slug}`;
      }, 2000);
    }

    setUploadProgress(100);
    setTimeout(() => setUploadProgress(0), 800);
    
    // Clear form only on successful online upload
    if (!isOffline && uploadErrors.length === 0) {
      setFiles([]);
      setPreviews([]);
      setCaption('');
    }
    
    setUploading(false);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    await uploadFiles(files);
  };


  // Not found
  if (error === 'Event not found.') {
    return (
      <div className="aurora-bg min-h-[85vh] flex items-center justify-center px-4">
        <div className="relative z-10 card max-w-sm text-center !p-10">
          <div className="text-5xl mb-4">😢</div>
          <h1 className="text-xl font-bold mb-2">Event Not Found</h1>
          <p className="text-[#a09080] text-sm">This link doesn't seem to be valid.</p>
        </div>
      </div>
    );
  }

  // Password gate
  if (!unlocked) {
    return (
      <div className="aurora-bg min-h-[85vh] flex items-center justify-center px-4">
        <div className="relative z-10 w-full max-w-sm">
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-primary/15 to-accent/10 blur-xl pointer-events-none" />
          <div className="card relative !p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[rgba(245,158,11,0.15)] border border-[rgba(245,158,11,0.25)] flex items-center justify-center text-3xl mx-auto mb-4 glow-purple">
              🔒
            </div>
            <h1 className="text-xl font-bold mb-1 text-[#f5f0e8]">{eventName || 'Private Event'}</h1>
            <p className="text-[#a09080] text-sm mb-6">Enter the password to upload photos.</p>
            <form onSubmit={handleUnlock} className="space-y-3">
              <input type="password" className="input text-center" value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Enter password…" autoFocus required />
              {passwordError && (
                <p className="text-[#f472b6] text-sm">{passwordError}</p>
              )}
              <button type="submit" className="btn-primary w-full">Unlock</button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Upload form
  return (
    <div className="aurora-bg min-h-[100vh] flex flex-col items-center px-4 pt-20 pb-10 text-[#f5f0e8] font-sans dark">
      <div className="w-full max-w-md flex flex-col items-center">
        <div className="w-full mb-4 rounded-2xl border border-[rgba(245,158,11,0.25)] bg-[rgba(245,158,11,0.08)] backdrop-blur-xl px-4 py-3 text-center">
          <p className="text-xs uppercase tracking-wider text-[#fcd34d]/90 font-semibold mb-1">Live Upload</p>
          <h2 className="text-lg font-bold text-[#f5f0e8] truncate">{eventName || 'Loading event...'}</h2>
        </div>
        
        {/* Connection Status Indicator */}
        <div className="w-full mb-4">
          <div className={`flex items-center justify-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
            navigator.onLine 
              ? 'bg-[rgba(245,158,11,0.20)] text-[#f59e0b] border border-[rgba(245,158,11,0.30)]' 
              : 'bg-[rgba(244,114,182,0.20)] text-[#f472b6] border border-[rgba(244,114,182,0.30)]'
          }`}>
            <span className={`w-2 h-2 rounded-full ${navigator.onLine ? 'bg-[#f59e0b]' : 'bg-[#f472b6]'} animate-pulse`} />
            {navigator.onLine ? '🟢 Online' : '📴 Offline - Photos will upload when connected'}
          </div>
        </div>
        
        {/* The White Prompt Card (Standard high contrast shape) */}

        <div className="w-full bg-[#faf7f2] dark:bg-[#1a1230]/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl text-center mb-8 border border-[rgba(245,158,11,0.15)] transform transition hover:scale-[1.01]">
          <h3 className="text-xl font-extrabold text-[#0a0600] dark:text-[#f5f0e8] mb-2">Upload your first photo or video</h3>
          <p className="text-[#5c4e38] dark:text-[#a09080] text-sm mb-10 leading-relaxed">Pick your best moments and post them to the live wall instantly.</p>

          <form onSubmit={handleUpload} className="space-y-4">
            {/* Hidden Input */}
            <input type="file" accept="image/*,video/*" multiple onChange={handleFileChange}
              className="hidden" id="photo-upload" required />

            {/* Large Circle Trigger Icon */}
            <label htmlFor="photo-upload" className="w-16 h-16 bg-[#faf7f2] dark:bg-[#1a1230] border border-[rgba(245,158,11,0.20)] rounded-full flex items-center justify-center mx-auto shadow-lg hover:shadow-xl hover:scale-105 transition cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6 text-[#0a0600] dark:text-[#f5f0e8]">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
            </label>
          </form>
        </div>

        {/* Uploading & Previews section (floating above or placed inline) */}
        <div className="w-full max-w-sm space-y-4">
          
          {previews.length > 0 && !uploading && (
            <div className="bg-[#faf7f2] dark:bg-[#1a1230]/95 backdrop-blur-xl rounded-3xl p-6 shadow-xl space-y-4 text-[#0a0600] dark:text-[#f5f0e8] transform transition border border-[rgba(245,158,11,0.20)]">
              <h4 className="font-bold text-lg">Add Details (Optional)</h4>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                  Your Name
                  {localStorage.getItem(GUEST_NAME_KEY) && (
                    <span className="ml-2 text-green-500 text-xs">✓ Remembered</span>
                  )}
                </label>
                <input 
                  type="text" 
                  className="w-full bg-[#f8f4ee] dark:bg-[#130f22] border border-[rgba(245,158,11,0.20)] text-[#0a0600] dark:text-[#f5f0e8] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#f59e0b]" 
                  value={uploaderName} 
                  onChange={(e) => setUploaderName(e.target.value)} 
                  placeholder="e.g. Uncle Bob" 
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#5c4e38] dark:text-[#a09080] mb-1.5">Message</label>
                <textarea className="w-full bg-[#f8f4ee] dark:bg-[#130f22] border border-[rgba(245,158,11,0.20)] text-[#0a0600] dark:text-[#f5f0e8] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#f59e0b]" value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="What a beautiful day!" rows={2} />
              </div>
              <button onClick={() => uploadFiles(files)} className="w-full bg-gradient-to-r from-[#f59e0b] to-[#f472b6] hover:from-[#f97316] hover:to-[#ec4899] text-[#0a0600] font-bold py-3 rounded-xl shadow-lg transition-all transform active:scale-95">
                📤 Post to Wall
              </button>
            </div>
          )}

          {previews.length > 0 && (

            <div className="grid grid-cols-2 gap-3">
              {previews.map((prev, idx) => (
                <div key={idx} className="rounded-xl overflow-hidden border border-[rgba(245,158,11,0.30)] aspect-square relative shadow-md">
                  {files[idx]?.type.startsWith('video/') ? (
                    <video src={prev} className="w-full h-full object-cover" controls playsInline />
                  ) : (
                    <img src={prev} alt="Preview" className="w-full h-full object-cover" />
                  )}
                </div>
              ))}
            </div>
          )}

          {uploadProgress > 0 && (
            <div className="w-full bg-[#130f22] rounded-full h-2 overflow-hidden shadow-inner">
              <div className="bg-gradient-to-r from-[#f59e0b] to-[#f472b6] h-2 rounded-full transition-all duration-500"
                style={{ width: `${uploadProgress}%` }} />
            </div>
          )}

          {error && error !== 'Event not found.' && (
            <div className="flex items-center gap-2 text-[#f472b6] text-sm bg-[rgba(244,114,182,0.10)] border border-[rgba(244,114,182,0.20)] p-3 rounded-xl shadow-sm">
              <span>⚠️</span> {error}
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 text-[#f59e0b] text-sm bg-[rgba(245,158,11,0.10)] border border-[rgba(245,158,11,0.20)] p-3 rounded-xl shadow-sm">
              <span>✅</span> Uploaded successfully! Redirecting to your photos...
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}

