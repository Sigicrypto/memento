"use client";

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

// ─── BACKGROUND DECORATION ───
const BackgroundDecoration = () => (
  <div style={{ position:'fixed', inset:0, zIndex:-1, overflow:'hidden', pointerEvents:'none' }}>
    <div style={{ position:'absolute', inset:0, background:'var(--bg)', opacity:0.97 }} />
    <div style={{ position:'absolute', inset:0, background:`url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3C%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`, opacity:0.02, mixBlendMode:'overlay' }} />
    <div className="orb" style={{ top:'-10%', left:'-10%', width:'60vw', height:'60vw', background:'radial-gradient(circle, rgba(245,158,11,0.08) 0%, transparent 70%)' }} />
    <div className="orb" style={{ bottom:'-5%', right:'-5%', width:'70vw', height:'70vw', background:'radial-gradient(circle, rgba(244,114,182,0.08) 0%, transparent 70%)' }} />
  </div>
);

const FontLoader = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Outfit:wght@400;500;600;700;800;900&display=swap');
    
    :root {
      --bg: #faf9fd;
      --text1: #1e293b;
      --text2: #64748b;
      --amber: #f59e0b;
      --rose: #f472b6;
      --border: rgba(226, 232, 240, 0.8);
      --glass: rgba(255, 255, 255, 0.7);
    }

    .mobile-page {
      font-family: 'Outfit', sans-serif;
      min-height: 100vh;
      color: var(--text1);
      position: relative;
    }

    .glass-card {
      background: var(--glass);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.4);
      box-shadow: 0 8px 32px rgba(148, 163, 184, 0.1);
      border-radius: 28px;
      transition: all 0.3s ease;
    }

    .btn-glow {
      background: linear-gradient(135deg, var(--amber), var(--rose));
      color: white;
      border: none;
      box-shadow: 0 10px 25px rgba(244, 114, 182, 0.3);
      position: relative;
      overflow: hidden;
      transition: 0.3s;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
    }
    .btn-glow:active { transform: scale(0.96); opacity: 0.9; }

    .btn-outline {
      background: rgba(255,255,255,0.4);
      border: 1px solid var(--border);
      color: var(--text1);
      backdrop-filter: blur(8px);
      transition: 0.3s;
    }
    .btn-outline:active { background: rgba(255,255,255,0.6); }

    .m-input {
      background: rgba(255, 255, 255, 0.5);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 16px;
      font-size: 16px;
      width: 100%;
      outline: none;
      transition: 0.3s;
      font-family: 'Inter', sans-serif;
    }
    .m-input:focus {
      border-color: var(--rose);
      background: white;
      box-shadow: 0 0 0 4px rgba(244, 114, 182, 0.1);
    }

    .orb {
      position: absolute;
      border-radius: 50%;
      filter: blur(80px);
      animation: drift 20s infinite alternate ease-in-out;
    }
    @keyframes drift {
      from { transform: translate(0,0) scale(1); }
      to { transform: translate(10%, 10%) scale(1.1); }
    }

    .status-badge {
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.05em;
      display: flex;
      align-items: center;
      gap: 6px;
    }
  `}</style>
);

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
        .select('id, name, plan_type, enable_safety_filter')
        .eq('slug', slug)
        .single();

      if (error || !data) {
        console.error("[mobile] event fetch error:", error);
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
    <div className="mobile-page pb-40" style={{ paddingTop:'40px' }}>
      <FontLoader />
      <BackgroundDecoration />

      <div className="px-6">
        <div className="glass-card p-6 mb-6 text-center">
          <h1 style={{ fontSize:28, fontWeight:900, letterSpacing:'-0.03em', color:'var(--text1)', marginBottom:4 }}>{event?.name || 'Loading...'}</h1>
          <div style={{ display:'flex', justifyContent:'center' }}>
            <div className="status-badge" style={{ background: realtimeStatus === 'SUBSCRIBED' ? 'rgba(34,197,94,0.1)' : 'rgba(245,158,11,0.1)', color: realtimeStatus === 'SUBSCRIBED' ? '#10b981' : '#f59e0b' }}>
              <div style={{ width:6, height:6, borderRadius:'50%', background:'currentColor' }} />
              {realtimeStatus === 'SUBSCRIBED' ? 'LIVE' : 'CONNECTING...'}
            </div>
          </div>
        </div>

        {/* UPLOAD SECTION */}
        <div className="glass-card p-6 mb-8">
          <h2 style={{ fontSize:18, fontWeight:800, marginBottom:16 }}>Capture a Moment</h2>
          
          <input type="file" accept="image/*,video/*" multiple onChange={handleFileChange} className="hidden" id="photo-upload" />
          <label htmlFor="photo-upload" className="btn-glow w-full py-5 rounded-2xl font-bold text-lg cursor-pointer mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
            CHOOSE PHOTOS
          </label>
          
          {previews.length > 0 && (
            <div className="mt-6 space-y-5">
              <div className="grid grid-cols-3 gap-2">
                {previews.map((src, i) => (
                  <div key={i} style={{ aspectRatio:'1/1', position:'relative', borderRadius:12, overflow:'hidden', boxShadow:'0 4px 12px rgba(0,0,0,0.1)' }}>
                    <img src={src} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
              <input type="text" value={uploaderName} onChange={(e) => setUploaderName(e.target.value)} placeholder="Your Name (Optional)" className="m-input" />
              <textarea value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Add a memory note..." className="m-input" rows={2} />
              <button onClick={handleUpload} className="btn-glow w-full py-5 rounded-2xl font-black tracking-widest text-sm" disabled={uploading} style={{ background: uploading ? 'var(--text2)' : undefined }}>
                {uploading ? `UPLOADING ${Math.round(uploadProgress)}%` : `POST TO WALL`}
              </button>
            </div>
          )}
        </div>

        {/* YOUR PHOTOS SECTION */}
        <div className="mb-10">
          <h2 style={{ fontSize:20, fontWeight:900, marginBottom:20, paddingLeft:4 }}>Your Memories</h2>
          {photos.length === 0 ? (
            <div className="glass-card py-16 px-8 text-center" style={{ opacity:0.6 }}>
              <div style={{ fontSize:40, marginBottom:12 }}>✨</div>
              <p style={{ fontSize:14, fontWeight:600 }}>Your uploads will appear here</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {photos.map((photo) => (
                <div key={photo.id} className="glass-card" style={{ borderRadius:20, overflow:'hidden', border:'none' }}>
                  {photo.media_type === 'video' ? (
                    <video src={getPublicUrl(photo.storage_path)} className="w-full h-48 object-cover" controls playsInline loop muted />
                  ) : (
                    <img src={getPublicUrl(photo.storage_path)} className="w-full h-48 object-cover" />
                  )}
                  {photo.caption && <div style={{ padding:10, fontSize:11, fontStyle:'italic', color:'var(--text2)' }}>"{photo.caption}"</div>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 p-6 z-20" style={{ background:'linear-gradient(to top, var(--bg) 60%, transparent)' }}>
        <div className="max-w-4xl mx-auto">
          <Link href={`/wall/${slug}`} className="btn-outline w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2" style={{ borderRadius:20 }}>
            <span>🖼️</span> VIEW FULL EVENT WALL
          </Link>
        </div>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="fixed top-24 left-6 right-6 glass-card p-4 text-center text-sm font-bold text-red-500 z-50 border-red-100" style={{ background:'rgba(255,241,242,0.9)' }}>
          {error}
        </div>
      )}
      {successMessage && (
        <div className="fixed top-24 left-6 right-6 glass-card p-4 text-center text-sm font-bold text-green-600 z-50 border-green-100" style={{ background:'rgba(240,253,244,0.9)' }}>
          {successMessage}
        </div>
      )}
    </div>
  );
}