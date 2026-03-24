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
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
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

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === eventPassword) { setUnlocked(true); setPasswordError(''); }
    else setPasswordError('Incorrect password. Please try again.');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) { setFile(f); setPreview(URL.createObjectURL(f)); setSuccess(false); }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !eventId) return;
    setUploading(true); setUploadProgress(10); setError('');

    const ext = file.name.split('.').pop();
    const filePath = `${eventId}/${Date.now()}.${ext}`;

    setUploadProgress(30);
    const { error: uploadError } = await supabase.storage.from('photos').upload(filePath, file);
    if (uploadError) { setError(uploadError.message); setUploading(false); setUploadProgress(0); return; }

    setUploadProgress(70);
    const { error: dbError } = await supabase.from('photos').insert({
      event_id: eventId, storage_path: filePath,
      uploader_name: uploaderName || 'Guest', caption: caption || null,
    });
    if (dbError) { setError(dbError.message); setUploading(false); setUploadProgress(0); return; }

    setUploadProgress(100);
    setTimeout(() => setUploadProgress(0), 800);
    setSuccess(true); setFile(null); setPreview(null); setCaption(''); setUploading(false);
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
    <div className="aurora-bg min-h-[85vh] flex items-center justify-center px-4 py-8">
      <div className="relative z-10 w-full max-w-md">
        <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-accent/10 to-accent2/10 blur-xl pointer-events-none" />
        <div className="card relative !p-8">
          <div className="flex justify-center mb-5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent to-accent2 flex items-center justify-center text-2xl glow-purple">
              📸
            </div>
          </div>
          <h1 className="text-2xl font-bold text-center mb-1">Upload a Photo</h1>
          <p className="text-dark-text text-sm text-center mb-6">
            {eventName ? `Sharing to "${eventName}"` : 'Loading...'}
          </p>

          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-dark-text mb-1.5">Your Name (optional)</label>
              <input type="text" className="input" value={uploaderName}
                onChange={(e) => setUploaderName(e.target.value)} placeholder="e.g. Uncle Bob" />
            </div>
            <div>
              <label className="block text-xs font-medium text-dark-text mb-1.5">Message (optional)</label>
              <textarea className="input" value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="e.g. What a beautiful day!" rows={2} />
            </div>
            <div>
              <label className="block text-xs font-medium text-dark-text mb-1.5">Photo</label>
              <input type="file" accept="image/*" onChange={handleFileChange}
                className="input cursor-pointer file:mr-3 file:border-0 file:bg-primary/10 file:text-primary-light file:font-medium file:rounded-lg file:px-3 file:py-1 file:text-xs" required />
            </div>

            {preview && (
              <div className="rounded-xl overflow-hidden border border-dark-border">
                <img src={preview} alt="Preview" className="w-full h-52 object-cover" />
              </div>
            )}

            {uploadProgress > 0 && (
              <div className="w-full bg-dark-surface rounded-full h-2 overflow-hidden">
                <div className="bg-gradient-to-r from-primary to-accent h-2 rounded-full transition-all duration-500"
                  style={{ width: `${uploadProgress}%` }} />
              </div>
            )}

            {error && error !== 'Event not found.' && (
              <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/15 p-3 rounded-xl">
                <span>⚠️</span> {error}
              </div>
            )}
            {success && (
              <div className="flex items-center gap-2 text-green-400 text-sm bg-green-500/10 border border-green-500/15 p-3 rounded-xl">
                <span>✅</span> Photo uploaded! Feel free to upload another.
              </div>
            )}

            <button type="submit" className="btn-primary w-full !py-3" disabled={uploading || !file}>
              {uploading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Uploading…
                </span>
              ) : '📤 Upload Photo'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
