"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

// Local storage keys
const GUEST_ID_KEY = 'memento_guest_id';
const GUEST_NAME_KEY = 'memento_guest_name';

interface Photo {
  id: string;
  storage_path: string;
  uploader_name: string;
  created_at: string;
  caption?: string;
  event_id: string;
  guest_id?: string;
  media_type?: 'image' | 'video';
}

interface Event {
  id: string;
  name: string;
  enable_smart_privacy?: boolean;
  plan_type?: string;
  enable_safety_filter?: boolean;
}

export default function MobilePage() {
  const params = useParams();
  const slug = params.slug as string;
  const router = useRouter();

  // Event and user state
  const [event, setEvent] = useState<Event | null>(null);
  const [guestId, setGuestId] = useState<string | null>(null);
  const [uploaderName, setUploaderName] = useState('');

  // Photo display state
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [realtimeStatus, setRealtimeStatus] = useState<string>('connecting');

  // Upload state
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Smart privacy state
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [matchedPhotoIds, setMatchedPhotoIds] = useState<string[] | null>(null);

  // Set or get guest ID and name on mount
  useEffect(() => {
    let id = localStorage.getItem(GUEST_ID_KEY);
    if (!id) {
      id = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem(GUEST_ID_KEY, id);
    }
    setGuestId(id);

    const name = localStorage.getItem(GUEST_NAME_KEY);
    if (name) setUploaderName(name);
  }, []);

  // Cache guest name when it changes
  useEffect(() => {
    if (uploaderName.trim()) {
      localStorage.setItem(GUEST_NAME_KEY, uploaderName.trim());
    }
  }, [uploaderName]);

  // Fetch event info
  useEffect(() => {
    const fetchEvent = async () => {
      console.log("[mobile] fetching event for slug:", slug);
      const { data, error } = await supabase
        .from('events')
        .select('id, name, enable_smart_privacy, plan_type, enable_safety_filter')
        .eq('slug', slug)
        .single();

      console.log("[mobile] event fetch result:", { data, error });
      if (error || !data) {
        console.log("[mobile] event not found, redirecting to 404");
        router.push('/404');
        return;
      }
      setEvent(data as Event);
      console.log("[mobile] event loaded:", data);
    };
    fetchEvent();
  }, [slug, router]);

  // Fetch user's photos and listen for new ones
  useEffect(() => {
    if (!event?.id || !guestId) return;

    const fetchPhotos = async () => {
      let query = supabase
        .from('photos')
        .select('*')
        .eq('event_id', event.id)
        .order('created_at', { ascending: false });

      if (matchedPhotoIds) {
        query = query.in('id', matchedPhotoIds);
      } else {
        query = query.eq('guest_id', guestId);
      }
      
      const { data, error } = await query;
      if (error) console.error('Error fetching photos:', error);
      else if (data) setPhotos(data);
    };
    fetchPhotos();

    const channel = supabase
      .channel(`user-photos-${guestId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'photos', filter: `guest_id=eq.${guestId}` }, (payload) => {
        const newPhoto = payload.new as Photo;
        setPhotos((prev) => [newPhoto, ...prev.filter(p => p.id !== newPhoto.id)]);
        setSuccessMessage('Photo uploaded successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      })
      .subscribe((status) => setRealtimeStatus(status));

    return () => { supabase.removeChannel(channel); };
  }, [event, guestId, matchedPhotoIds]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;

    // Filter invalid types
    const validFiles = selectedFiles.filter(f => f.type.startsWith('image/') || f.type.startsWith('video/'));
    if (validFiles.length < selectedFiles.length) {
      setError('Only photos and videos are allowed.');
      return;
    }

    // Checking MB constraints to protect storage buckets
    const MAX_IMAGE_MB = 10;
    const MAX_VIDEO_MB = 50;

    for (const file of validFiles) {
       const isVideo = file.type.startsWith('video/');
       const fileSizeMB = file.size / (1024 * 1024);
       if (isVideo && fileSizeMB > MAX_VIDEO_MB) {
         setError(`Video ${file.name} is too large. Max size is ${MAX_VIDEO_MB}MB.`);
         return;
       }
       if (!isVideo && fileSizeMB > MAX_IMAGE_MB) {
         setError(`Photo ${file.name} is too large. Max size is ${MAX_IMAGE_MB}MB.`);
         return;
       }
    }

    const hasVideo = validFiles.some(f => f.type.startsWith('video/'));
    if (hasVideo && (event?.plan_type === 'STARTER' || !event?.plan_type)) {
      setError('Video uploads are a Standard feature.');
      return;
    }

    setFiles(validFiles);
    setPreviews(validFiles.map(f => URL.createObjectURL(f)));
    setError('');
    setSuccessMessage('');
  };

  const handleUpload = async () => {
    if (files.length === 0 || !event?.id || !guestId) {
      console.error("[mobile] upload prerequisites missing", { 
        filesCount: files.length, 
        eventId: event?.id, 
        guestId 
      });
      return;
    }

    console.log("[mobile] starting upload", {
      event,
      guestId,
      files: files.map(f => ({
        name: f.name,
        type: f.type,
        size: f.size
      }))
    });

    setUploading(true);
    setUploadProgress(0);
    setError('');

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const filePath = `${event.id}/${guestId}-${Date.now()}-${file.name}`;
      
      console.log("[mobile] uploading file:", file.name);
      console.log("[mobile] file path:", filePath);
      
      const { error: uploadError } = await supabase.storage.from('photos').upload(filePath, file);

      console.log("[mobile] storage upload error:", uploadError);
      if (uploadError) {
        setError(`Upload failed: ${uploadError.message}`);
        setUploading(false);
        return;
      }

      const mediaType = file.type.startsWith('video/') ? 'video' : 'image';
      const photoData = {
        event_id: event.id,
        storage_path: filePath,
        uploader_name: uploaderName || 'Anonymous',
        caption: caption || null,
        guest_id: guestId,
        media_type: mediaType,
        approved: !event?.enable_safety_filter,
      };

      console.log("[mobile] inserting photo metadata:", photoData);
      const { error: dbError } = await supabase.from('photos').insert(photoData);

      console.log("[mobile] db insert error:", dbError);
      if (dbError) {
        setError(`Database error: ${dbError.message}`);
        setUploading(false);
        return;
      }
      
      console.log("[mobile] upload success for:", file.name);
      setUploadProgress(((i + 1) / files.length) * 100);
    }

    setUploading(false);
    setSuccessMessage('Upload complete!');
    setFiles([]);
    setPreviews([]);
    setCaption('');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleFindMyPhotos = async () => {
    if (!selfieFile || !event) return;

    setIsSearching(true);
    try {
      const selfiePath = `selfies/${event.id}-${Date.now()}`;
      const { error: uploadError } = await supabase.storage.from('photos').upload(selfiePath, selfieFile);
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('photos').getPublicUrl(selfiePath);
      const imageUrl = urlData.publicUrl;

      const { data, error: functionError } = await supabase.functions.invoke('find-my-photos', {
        body: { eventId: event.id, imageUrl },
      });

      if (functionError) throw functionError;

      setMatchedPhotoIds(data.photoIds || []);

      await supabase.storage.from('photos').remove([selfiePath]);

    } catch (error: any) {
      console.error('Error finding photos:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsSearching(false);
    }
  };

  const getPublicUrl = (path: string) => supabase.storage.from('photos').getPublicUrl(path).data.publicUrl;

  return (
    <div className="nm-page pb-40">
      <div className="nm-card mx-4 mt-12 p-4">
        <h1 className="text-xl font-bold text-center" style={{color:'var(--text1)'}}>{event?.name || 'Loading...'}</h1>
      </div>

      {/* UPLOAD SECTION */}
      <div className="mx-4 mt-4 nm-card p-4">
        <h2 className="text-lg font-bold text-center mb-2" style={{color:'var(--text1)'}}>Upload Your Photos</h2>
        <input type="file" accept="image/*,video/*" multiple onChange={handleFileChange} className="hidden" id="photo-upload" />
        <label htmlFor="photo-upload" className="nm-btn w-full text-center py-3 cursor-pointer">Select Photos/Videos</label>
        
        {previews.length > 0 && (
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-3 gap-2">
              {previews.map((src, i) => <img key={i} src={src} className="w-full h-24 object-cover rounded-lg" />)}
            </div>
            <input type="text" value={uploaderName} onChange={(e) => setUploaderName(e.target.value)} placeholder="Your Name (Optional)" className="nm-input w-full" />
            <textarea value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Caption (Optional)" className="nm-input w-full" rows={2} />
            <button onClick={handleUpload} className="nm-btn nm-btn-accent w-full py-3 font-bold" disabled={uploading}>
              {uploading ? `Uploading ${Math.round(uploadProgress)}%...` : `Upload ${files.length} Item(s)`}
            </button>
          </div>
        )}
      </div>

      {/* SMART PRIVACY SECTION */}
      {event?.enable_smart_privacy && (event.plan_type === 'Premium' || event.plan_type === 'White Label') && (
        <div className="mx-4 mt-4 nm-card p-4">
          <h2 className="text-lg font-bold text-center mb-2" style={{color:'var(--text1)'}}>Find My Photos</h2>
          <p className="text-sm text-center mb-4" style={{color:'var(--text2)'}}>Upload a selfie to find all photos you're in.</p>
          <input type="file" accept="image/*" onChange={(e) => { setSelfieFile(e.target.files?.[0] || null); setSelfiePreview(URL.createObjectURL(e.target.files?.[0]!)); }} className="hidden" id="selfie-upload" />
          <label htmlFor="selfie-upload" className="nm-btn w-full text-center py-3">Select Selfie</label>
          {selfiePreview && (
            <div className="mt-4 text-center">
              <img src={selfiePreview} alt="Selfie preview" className="w-32 h-32 object-cover rounded-lg mx-auto mb-4" />
              <button onClick={handleFindMyPhotos} className="nm-btn nm-btn-accent px-6 py-2" disabled={isSearching}>{isSearching ? 'Searching...' : 'Find My Photos'}</button>
            </div>
          )}
        </div>
      )}

      {/* YOUR PHOTOS SECTION */}
      <div className="px-4 mt-6">
        <h2 className="text-lg font-bold mb-2" style={{color:'var(--text1)'}}>Your Uploaded Photos</h2>
        {photos.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-sm" style={{color:'var(--text2)'}}>You haven't uploaded any photos yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {photos.map((photo) => (
              <div key={photo.id} className="relative group">
                {photo.media_type === 'video' ? (
                  <video src={getPublicUrl(photo.storage_path)} className="w-full h-auto object-cover rounded-lg" controls playsInline loop muted />
                ) : (
                  <img src={getPublicUrl(photo.storage_path)} className="w-full h-auto object-cover rounded-lg" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 p-4 z-20 bg-[var(--bg)] border-t border-[var(--border)]">
        <div className="max-w-4xl mx-auto">
          <Link href={`/wall/${slug}`} className="nm-btn flex-1 py-3 font-semibold text-center w-full">🖼️ Back to Full Event Wall</Link>
        </div>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="fixed top-4 left-4 right-4 nm-card p-4 text-center text-red-400 z-50">
          {error}
        </div>
      )}
      {successMessage && (
        <div className="fixed top-4 left-4 right-4 nm-card p-4 text-center text-green-400 z-50">
          {successMessage}
        </div>
      )}
    </div>
  );
}