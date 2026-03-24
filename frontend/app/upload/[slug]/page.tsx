"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function UploadPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [eventName, setEventName] = useState('');
  const [eventId, setEventId] = useState<string | null>(null);
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
      if (!data.password) setUnlocked(true);
    };
    fetchEvent();
  }, [slug]);

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


  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === eventPassword) { setUnlocked(true); setPasswordError(''); }
    else setPasswordError('Incorrect password. Please try again.');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length > 0) {
      setFiles(selectedFiles);
      setPreviews(selectedFiles.map(f => URL.createObjectURL(f)));
      setSuccess(false);
      // Disabled Auto-Upload so user can enter caption
    }
  };



  const uploadFiles = async (filesToUpload: File[]) => {
    if (filesToUpload.length === 0 || !eventId) return;
    setUploading(true); setUploadProgress(10); setError('');

    let uploadErrors: string[] = [];

    for (let i = 0; i < filesToUpload.length; i++) {
       const fileItem = filesToUpload[i];
       const ext = fileItem.name.split('.').pop();
       const filePath = `${eventId}/${Date.now()}-${i}.${ext}`;

       setUploadProgress(Math.round(((i + 0.1) / filesToUpload.length) * 100));
       const { error: uploadError } = await supabase.storage.from('photos').upload(filePath, fileItem);
       if (uploadError) { uploadErrors.push(uploadError.message); continue; }

       setUploadProgress(Math.round(((i + 0.5) / filesToUpload.length) * 100));
       const { error: dbError } = await supabase.from('photos').insert({
         event_id: eventId, storage_path: filePath,
         uploader_name: uploaderName || 'Guest', caption: caption || null,
       });
       if (dbError) { uploadErrors.push(dbError.message); continue; }
    }

    if (uploadErrors.length > 0) {
       setError(`Failed to upload ${uploadErrors.length} file(s): ${uploadErrors[0]}`);
       setUploading(false);
       setUploadProgress(0);
       return;
    }

    setUploadProgress(100);
    setTimeout(() => setUploadProgress(0), 800);
    setSuccess(true); setFiles([]); setPreviews([]); setCaption(''); setUploading(false);
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
          <p className="text-dark-text text-sm">This link doesn't seem to be valid.</p>
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
            <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-3xl mx-auto mb-4 glow-purple">
              🔒
            </div>
            <h1 className="text-xl font-bold mb-1">{eventName || 'Private Event'}</h1>
            <p className="text-dark-text text-sm mb-6">Enter the password to upload photos.</p>
            <form onSubmit={handleUnlock} className="space-y-3">
              <input type="password" className="input text-center" value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Enter password…" autoFocus required />
              {passwordError && (
                <p className="text-red-400 text-sm">{passwordError}</p>
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

    <div className="aurora-bg min-h-[100vh] flex flex-col items-center px-4 pt-20 pb-10 text-white font-sans">
      <div className="w-full max-w-md flex flex-col items-center">
        
        {/* The White Prompt Card (Standard high contrast shape) */}

        <div className="w-full bg-white rounded-3xl p-8 shadow-2xl text-center mb-8 transform transition hover:scale-[1.01]">
          <h3 className="text-xl font-extrabold text-slate-900 mb-2">Upload your first photo or video</h3>
          <p className="text-slate-500 text-sm mb-10 leading-relaxed">Select some items you like and love from your camera roll.</p>

          <form onSubmit={handleUpload} className="space-y-4">
            {/* Hidden Input */}
            <input type="file" accept="image/*,video/*" multiple onChange={handleFileChange}
              className="hidden" id="photo-upload" required />

            {/* Large Circle Trigger Icon */}
            <label htmlFor="photo-upload" className="w-16 h-16 bg-white border border-slate-100 rounded-full flex items-center justify-center mx-auto shadow-lg hover:shadow-xl hover:scale-105 transition cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6 text-slate-700">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
            </label>
          </form>
        </div>

        {/* Uploading & Previews section (floating above or placed inline) */}
        <div className="w-full max-w-sm space-y-4">
          
          {previews.length > 0 && !uploading && (
            <div className="bg-white rounded-3xl p-6 shadow-xl space-y-4 text-slate-800 transform transition animate-scaleIn">
              <h4 className="font-bold text-lg">Add Details (Optional)</h4>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Your Name</label>
                <input type="text" className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500" value={uploaderName} onChange={(e) => setUploaderName(e.target.value)} placeholder="e.g. Uncle Bob" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Message</label>
                <textarea className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500" value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="What a beautiful day!" rows={2} />
              </div>
              <button onClick={() => uploadFiles(files)} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg transition-all transform active:scale-95">
                📤 Post to Wall
              </button>
            </div>
          )}

          {previews.length > 0 && (

            <div className="grid grid-cols-2 gap-3">
              {previews.map((prev, idx) => (
                <div key={idx} className="rounded-xl overflow-hidden border border-slate-800 aspect-square relative shadow-md">
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
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden shadow-inner">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${uploadProgress}%` }} />
            </div>
          )}

          {error && error !== 'Event not found.' && (
            <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 p-3 rounded-xl shadow-sm">
              <span>⚠️</span> {error}
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 text-green-400 text-sm bg-green-500/10 border border-green-500/20 p-3 rounded-xl shadow-sm">
              <span>✅</span> Uploaded successfully! Add more files above.
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}

