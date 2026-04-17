"use client";

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import Webcam from 'react-webcam';
import AnimatedLogo from '@/components/AnimatedLogo';
import { hasFeature } from '@/lib/permissions';
import { extractFaceDescriptor, fileToImage } from '@/lib/faceEngine';

const MAX_IMAGES = 10;
const MAX_VIDEO_MB = 50;
const ACCEPTED_IMAGE_TYPES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/heic', 'image/heif']);
const ACCEPTED_VIDEO_TYPES = new Set(['video/mp4', 'video/quicktime', 'video/webm', 'video/x-m4v']);

function getFileExtension(fileName: string) {
  return fileName.split('.').pop()?.toLowerCase() || '';
}

function isAcceptedVideo(file: File) {
  return file.type.startsWith('video/') || ACCEPTED_VIDEO_TYPES.has(file.type);
}

// Local storage keys
const GUEST_NAME_KEY = 'memento_guest_name';
const GUEST_ID_KEY = 'memento_guest_id';

interface Photo {
  id: string;
  storage_path: string;
  uploader_name: string;
  created_at: string;
  caption?: string;
  event_id: string;
  media_type?: 'image' | 'video';
}

interface Event {
  id: string;
  name: string;
  plan_type?: string;
  enable_safety_filter?: boolean;
  expires_at?: string | null;
}

export default function MobilePage() {
  const params = useParams();
  const slug = params.slug as string;
  const router = useRouter();

  // State
  const [event, setEvent] = useState<Event | null>(null);
  const [guestId, setGuestId] = useState<string | null>(null);
  const [uploaderName, setUploaderName] = useState('');
  const [sessionPhotoIds, setSessionPhotoIds] = useState<string[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [realtimeStatus, setRealtimeStatus] = useState<string>('connecting');

  // Upload State
  const [files, setFiles] = useState<File[]>([]);
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingFiles, setProcessingFiles] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [statusText, setStatusText] = useState('');

  // Selfie/Face Match State
  const [isSearching, setIsSearching] = useState(false);
  const [matchedPhotoIds, setMatchedPhotoIds] = useState<string[] | null>(null);
  const [showSelfieCam, setShowSelfieCam] = useState(false);
  const webcamRef = useRef<Webcam>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Init Guest ID & Name ──
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

  // Cache name
  useEffect(() => {
    if (uploaderName.trim()) localStorage.setItem(GUEST_NAME_KEY, uploaderName.trim());
  }, [uploaderName]);

  // ── Fetch Event ──
  useEffect(() => {
    const fetchEvent = async () => {
      const { data, error } = await supabase.from('events').select('id, name, plan_type, enable_safety_filter, expires_at').eq('slug', slug).single();
      if (error || !data) { router.push('/'); return; }
      setEvent(data as Event);
    };
    fetchEvent();
  }, [slug, router]);

  // ── Realtime & Feedback Photos ──
  useEffect(() => {
    if (!event?.id) return;
    const fetchPhotos = async () => {
      let query = supabase.from('photos').select('*').eq('event_id', event.id).order('created_at', { ascending: false });
      if (matchedPhotoIds) query = query.in('id', matchedPhotoIds);
      const { data } = await query;
      if (data) setPhotos(matchedPhotoIds ? data : data.filter(p => sessionPhotoIds.includes(p.id)));
    };
    fetchPhotos();

    const channel = supabase.channel(`event-photos-${event.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'photos', filter: `event_id=eq.${event.id}` }, (payload) => {
        const newPhoto = payload.new as Photo;
        if (sessionPhotoIds.includes(newPhoto.id)) setPhotos(prev => [newPhoto, ...prev.filter(p => p.id !== newPhoto.id)]);
      }).subscribe((status) => setRealtimeStatus(status));
    return () => { supabase.removeChannel(channel); };
  }, [event, matchedPhotoIds, sessionPhotoIds]);

  // ── File Handlers ──
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    if (selected.length === 0) return;
    setProcessingFiles(true);
    setError(null);

    const validFiles: File[] = [];
    for (const f of selected) {
      const isVideo = isAcceptedVideo(f);
      if (isVideo && !hasFeature(event?.plan_type, 'VIDEO_UPLOAD')) {
         setError('Video uploads are a Premium feature.');
         setProcessingFiles(false); return;
      }
      if (isVideo && f.size > MAX_VIDEO_MB * 1024 * 1024) {
         setError(`Video is too large (max ${MAX_VIDEO_MB}MB)`);
         setProcessingFiles(false); return;
      }
      // HEIC handling
      if (f.name.toLowerCase().endsWith('.heic') || f.name.toLowerCase().endsWith('.heif')) {
        try {
          const heic2any = (await import('heic2any')).default;
          const blob = await heic2any({ blob: f, toType: 'image/jpeg', quality: 0.8 });
          const newFile = new File([Array.isArray(blob)?blob[0]:blob], f.name.replace(/\.heic$|\.heif$/i, '.jpg'), { type: 'image/jpeg' });
          validFiles.push(newFile);
        } catch { setError('Failed to process HEIC file.'); }
      } else if (f.type.startsWith('image/') || isVideo) {
        validFiles.push(f);
      }
    }
    setFiles(prev => [...prev, ...validFiles].slice(0, MAX_IMAGES));
    setProcessingFiles(false);
  };

  const removeFile = (index: number) => setFiles(prev => prev.filter((_, i) => i !== index));

  const handleUpload = async () => {
    if (!files.length || !event || !guestId) return;
    setUploading(true);
    setError(null);
    setUploadProgress(0);
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const path = `${event.id}/${guestId}-${Date.now()}-${file.name}`;
        setStatusText(`Uploading ${i + 1} of ${files.length}...`);
        
        const { error: uploadError } = await supabase.storage.from('photos').upload(path, file);
        if (uploadError) throw uploadError;

        const { data: inserted, error: dbError } = await supabase.from('photos').insert({
          event_id: event.id, storage_path: path,
          uploader_name: uploaderName.trim() || 'Anonymous Guest',
          caption: caption.trim() || null,
          media_type: isAcceptedVideo(file) ? 'video' : 'image',
          approved: !event.enable_safety_filter,
        }).select().single();

        if (dbError) throw dbError;
        if (inserted) setSessionPhotoIds(prev => [...prev, inserted.id]);
        
        // Face indexing
        if (isAcceptedVideo(file) === false && hasFeature(event.plan_type, 'SELFIE_MATCH')) {
           try {
             const img = await fileToImage(file);
             const descriptor = await extractFaceDescriptor(img);
             if (descriptor) {
               await supabase.from('photo_faces').insert({ photo_id: inserted.id, event_id: event.id, descriptor: Array.from(descriptor) });
             }
           } catch (e) { console.warn("Face indexing failed", e); }
        }
        setUploadProgress(((i + 1) / files.length) * 100);
      }
      setSuccessMessage('Successfully shared to wall!');
      setFiles([]); setCaption('');
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setError(err.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false); setStatusText(''); setUploadProgress(0);
    }
  };

  const handleFindMyPhotos = async () => {
    if (!hasFeature(event?.plan_type, 'SELFIE_MATCH')) {
       alert("✨ Face Match is a Premium feature! Upgrade your wall to unlock.");
       return;
    }
    setShowSelfieCam(true);
  };

  // ── Face Match ──
  const captureSelfie = async () => {
    const screenshot = webcamRef.current?.getScreenshot();
    if (!screenshot) return;
    setIsSearching(true); setShowSelfieCam(false);
    try {
      const img = new Image(); img.src = screenshot;
      await new Promise(r => img.onload = r);
      const descriptor = await extractFaceDescriptor(img);
      if (!descriptor) { alert("Couldn't see your face clearly. Try better light!"); return; }
      const { data, error } = await supabase.rpc('match_photo_faces', {
        query_embedding: Array.from(descriptor), match_threshold: 0.65, match_count: 50, target_event_id: event?.id
      });
      if (error) throw error;
      const ids = data.map((d: any) => d.photo_id);
      setMatchedPhotoIds(ids);
      if (ids.length === 0) alert("No photos found yet—keep posing!");
    } catch (err) { alert("Error searching for photos."); } finally { setIsSearching(false); }
  };

  const getPublicUrl = (path: string) => supabase.storage.from('photos').getPublicUrl(path).data.publicUrl;

  return (
    <div className="lp mobile-page min-h-screen">
      <style>{`
        .mobile-page { padding-bottom: env(safe-area-inset-bottom, 32px); }
        .upload-content { display: flex; flex-direction: column; align-items: center; padding: 7rem 1.5rem 3rem; width: 100%; max-width: 520px; margin: 0 auto; gap: 1.25rem; }
        .upload-drop-zone { width: 100%; padding: 3rem 1.75rem; border-radius: 24px; border: 2px dashed rgba(100,116,139,0.18); background: rgba(30,41,59,0.02); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px; cursor: pointer; transition: all 0.2s; }
        .upload-drop-zone:active { transform: scale(0.98); background: rgba(6,182,212,0.08); border-color: rgba(6,182,212,0.4); }
        .upload-input { width: 100%; padding: 18px 22px; border-radius: 20px; font-size: 1rem; outline: none; transition: 0.2s; background: rgba(255,255,255,0.04); border: 1.5px solid rgba(255,255,255,0.08); color: #fff; }
        .upload-input:focus { border-color: rgba(6,182,212,0.4); background: rgba(255,255,255,0.08); }
        .preview-thumb { width:100%; aspect-ratio:1; border-radius:12px; object-fit:cover; border:1px solid rgba(255,255,255,0.1); }
        .status-pill { display: inline-flex; align-items: center; gap: 6px; padding: 5px 14px; border-radius: 999px; font-size: 0.65rem; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; border: 1.5px solid rgba(34,197,94,0.3); color: #4ade80; background: rgba(34,197,94,0.1); }
      `}</style>

      <div className="orbs"><div className="orb orb1" /><div className="orb orb2" /><div className="orb orb3" /></div>
      <div className="grain" />

      {/* Nav */}
      <nav className="lp-nav scrolled">
        <Link href="/"><AnimatedLogo width={130} height={40} /></Link>
        <div className="status-pill">
          <div className="pulse-dot" style={{ background: realtimeStatus==='SUBSCRIBED'?'#4ade80':'#f59e0b' }} />
          {realtimeStatus==='SUBSCRIBED'?'Live':'Syncing'}
        </div>
      </nav>

      <div className="upload-content">
        {/* Header */}
        <div className="text-center w-full mb-4">
          <span className="kicker">{slug?.toUpperCase()}</span>
          <h1 className="hero-h1" style={{ fontSize: '2.4rem', marginBottom: '0.5rem' }}>
            Share the <span className="gradient-text">Moment</span>
          </h1>
          <p className="hero-sub">{event?.name || 'Loading Event...'}</p>
        </div>

        {/* Feedback */}
        {successMessage && <div className="gcard w-full p-4 text-center border-green-500/20 bg-green-500/10 text-green-400 font-bold text-sm">✓ {successMessage}</div>}
        {error && <div className="gcard w-full p-4 text-center border-red-500/20 bg-red-500/10 text-red-400 text-sm">⚠️ {error}</div>}

        {/* Upload Card */}
        <div className="gcard w-full p-8 rounded-[36px]">
          <div className="gcard-border" />
          <div style={{ position:'relative', zIndex:1, display:'flex', flexDirection:'column', gap:'1.75rem' }}>
            
            <div className="flex flex-col gap-4">
               <div>
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block ml-1">Your Name</label>
                 <input type="text" className="upload-input" placeholder="Sarah..." value={uploaderName} onChange={e=>setUploaderName(e.target.value)} />
               </div>
               <div>
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block ml-1">Add a Caption</label>
                 <textarea className="upload-input" placeholder="What a night!" rows={2} value={caption} onChange={e=>setCaption(e.target.value)} />
               </div>
            </div>

            <div className="h-px bg-white/5" />

            {/* Selection */}
            <input ref={fileInputRef} type="file" multiple accept="image/*,video/*,.heic,.heif" className="hidden" onChange={handleFileChange} />
            
            {files.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {files.map((f, i) => (
                  <div key={i} className="relative aspect-square">
                    <img src={URL.createObjectURL(f)} className="preview-thumb" alt="" />
                    <button onClick={()=>removeFile(i)} className="absolute -top-1 -right-1 w-5 h-5 bg-black/80 rounded-full flex items-center justify-center text-[10px] border border-white/10">✕</button>
                  </div>
                ))}
                {files.length < MAX_IMAGES && (
                  <button onClick={()=>fileInputRef.current?.click()} className="aspect-square rounded-xl border-2 border-dashed border-white/10 flex items-center justify-center text-xl opacity-40">+</button>
                )}
              </div>
            )}

            {files.length === 0 && (
              <div className="upload-drop-zone" onClick={()=>fileInputRef.current?.click()}>
                 <span className="text-4xl">📸</span>
                 <p className="font-bold text-[1.1rem]">Choose Photos or Video</p>
                 <p className="text-[11px] opacity-60 uppercase tracking-widest mt-1">Supports JPG, PNG, HEIC & Video</p>
              </div>
            )}

            {/* Upload Button */}
            <button 
              onClick={handleUpload} 
              disabled={uploading || files.length === 0 || processingFiles}
              className="btn-hero-primary w-full py-5 rounded-[20px] font-black tracking-widest text-[13px] uppercase disabled:opacity-30 mt-2"
            >
              {uploading ? `${statusText} ${Math.round(uploadProgress)}%` : processingFiles ? 'Processing Files...' : `Share to Wall (${files.length}) ✦`}
            </button>
          </div>
        </div>

        {/* Action: Find Me */}
        <div className="w-full flex flex-col gap-4 mt-2">
           <button 
             onClick={handleFindMyPhotos}
             className="w-full py-5 rounded-[24px] border border-white/5 bg-white/5 font-black text-xs tracking-[0.2em] uppercase hover:bg-white/10 transition-all flex items-center justify-center gap-3"
           >
             ✨ Find Me On Wall
           </button>
           {matchedPhotoIds && (
             <button onClick={()=>setMatchedPhotoIds(null)} className="text-[10px] font-bold text-cyan-500 uppercase tracking-widest text-center mt-1">✕ Clear Search & Show My Uploads</button>
           )}
        </div>

        {/* Gallery Preview */}
        {photos.length > 0 && (
          <div className="w-full mt-8">
             <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-6 flex items-center gap-4">
               {matchedPhotoIds ? 'Found for You' : 'Your Shared Memories'}
               <div className="h-px flex-1 bg-white/5" />
             </h2>
             <div className="grid grid-cols-2 gap-4">
               {photos.map(p => (
                 <div key={p.id} className="gcard p-0 aspect-[4/5] overflow-hidden group">
                    <img src={getPublicUrl(p.storage_path)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                    {p.caption && (
                      <div className="absolute inset-x-0 bottom-0 p-3 bg-black/60 backdrop-blur-md">
                        <p className="text-[10px] italic text-white/80 line-clamp-2">"{p.caption}"</p>
                      </div>
                    )}
                 </div>
               ))}
             </div>
          </div>
        )}
      </div>

      {/* Selfie Modal */}
      {showSelfieCam && (
        <div className="fixed inset-0 z-[1000] bg-black/95 backdrop-blur-3xl flex items-center justify-center p-6">
          <div className="gcard max-w-sm w-full p-8 text-center bg-black/40 border-white/10">
             <h2 className="text-xl font-black mb-2">Find My Photos</h2>
             <p className="text-slate-400 text-[10px] uppercase tracking-widest mb-8">Smile for the camera</p>
             <div className="aspect-square w-full rounded-3xl overflow-hidden border-2 border-white/10 mb-8 items-center justify-center flex bg-slate-900">
               <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg" videoConstraints={{ facingMode: 'user' }} className="w-full h-full object-cover" />
             </div>
             <div className="flex gap-4">
               <button onClick={()=>setShowSelfieCam(false)} className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest bg-white/5 rounded-2xl">Cancel</button>
               <button onClick={captureSelfie} className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest bg-cyan-500 text-black rounded-2xl font-black">Scan ✦</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}