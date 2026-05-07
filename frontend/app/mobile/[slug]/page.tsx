"use client";
 
import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import Webcam from 'react-webcam';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Image as ImageIcon, Upload, X, CheckCircle, AlertTriangle, User, Search, Sparkles, Layout, ArrowRight } from 'lucide-react';
import { hasFeature } from '@/lib/permissions';
import { extractFaceDescriptorRobust, fileToImage, MATCH_THRESHOLD } from '@/lib/faceEngine';
 
const MAX_IMAGES = 10;
const MAX_VIDEO_MB = 50;
const ACCEPTED_IMAGE_TYPES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/heic', 'image/heif']);
const ACCEPTED_VIDEO_TYPES = new Set(['video/mp4', 'video/quicktime', 'video/webm', 'video/x-m4v']);
 
function isAcceptedVideo(file: File) {
  return file.type.startsWith('video/') || ACCEPTED_VIDEO_TYPES.has(file.type);
}
 
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
 
  // Selfie State
  const [isSearching, setIsSearching] = useState(false);
  const [matchedPhotoIds, setMatchedPhotoIds] = useState<string[] | null>(null);
  const [showSelfieCam, setShowSelfieCam] = useState(false);
  const webcamRef = useRef<Webcam>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
 
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
 
  useEffect(() => {
    if (uploaderName.trim()) localStorage.setItem(GUEST_NAME_KEY, uploaderName.trim());
  }, [uploaderName]);
 
  useEffect(() => {
    const fetchEvent = async () => {
      const { data, error } = await supabase.from('events').select('id, name, plan_type, enable_safety_filter, expires_at').eq('slug', slug).single();
      if (error || !data) { router.push('/'); return; }
      setEvent(data as Event);
    };
    fetchEvent();
  }, [slug, router]);
 
  useEffect(() => {
    if (!event?.id) return;
    const fetchPhotos = async () => {
      let query = supabase.from('photos').select('*').eq('event_id', event.id).order('created_at', { ascending: false });
      if (matchedPhotoIds) {
        if (matchedPhotoIds.length > 0) query = query.in('id', matchedPhotoIds);
        else { setPhotos([]); return; }
      }
      const { data } = await query;
      if (data) {
        if (matchedPhotoIds) setPhotos(data);
        else setPhotos(data.filter(p => sessionPhotoIds.includes(p.id)));
      }
    };
    fetchPhotos();
 
    const channel = supabase.channel(`event-photos-${event.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'photos', filter: `event_id=eq.${event.id}` }, (payload) => {
        const newPhoto = payload.new as Photo;
        if (sessionPhotoIds.includes(newPhoto.id)) setPhotos(prev => [newPhoto, ...prev.filter(p => p.id !== newPhoto.id)]);
      }).subscribe((status) => setRealtimeStatus(status));
    return () => { supabase.removeChannel(channel); };
  }, [event, matchedPhotoIds, sessionPhotoIds]);
 
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
         setError(`Video too large (max ${MAX_VIDEO_MB}MB)`);
         setProcessingFiles(false); return;
      }
      if (f.name.toLowerCase().endsWith('.heic') || f.name.toLowerCase().endsWith('.heif')) {
        try {
          const heic2any = (await import('heic2any')).default;
          const blob = await heic2any({ blob: f, toType: 'image/jpeg', quality: 0.8 });
          validFiles.push(new File([Array.isArray(blob)?blob[0]:blob], f.name.replace(/\.heic$|\.heif$/i, '.jpg'), { type: 'image/jpeg' }));
        } catch { setError('HEIC processing failed.'); }
      } else if (f.type.startsWith('image/') || isVideo) {
        validFiles.push(f);
      }
    }
    setFiles(prev => [...prev, ...validFiles].slice(0, MAX_IMAGES));
    setProcessingFiles(false);
  };
 
  const handleUpload = async () => {
    if (!files.length || !event || !guestId) return;
    setUploading(true); setError(null); setUploadProgress(0);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const path = `${event.id}/${guestId}-${Date.now()}-${file.name}`;
        setStatusText(`Uploading ${i + 1}/${files.length}...`);
        const { error: uploadError } = await supabase.storage.from('photos').upload(path, file);
        if (uploadError) throw uploadError;
        const { data: inserted, error: dbError } = await supabase.from('photos').insert({
          event_id: event.id, storage_path: path, uploader_name: uploaderName.trim() || 'Anonymous Guest',
          caption: caption.trim() || null, media_type: isAcceptedVideo(file) ? 'video' : 'image',
          approved: !event.enable_safety_filter,
        }).select().single();
        if (dbError) throw dbError;
        if (inserted) setSessionPhotoIds(prev => [...prev, inserted.id]);
        if (!isAcceptedVideo(file)) {
          try {
            const img = await fileToImage(file);
            const descriptor = await extractFaceDescriptorRobust(img, 'ssd');
            if (descriptor) await supabase.from('photo_faces').insert({ photo_id: inserted.id, event_id: event.id, descriptor: Array.from(descriptor) });
          } catch (e) {}
        }
        setUploadProgress(((i + 1) / files.length) * 100);
      }
      setSuccessMessage('Successfully shared to wall!');
      setFiles([]); setCaption('');
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) { setError(err.message || 'Upload failed.'); }
    finally { setUploading(false); setStatusText(''); setUploadProgress(0); }
  };
 
  const captureSelfie = async () => {
    const screenshot = webcamRef.current?.getScreenshot();
    if (!screenshot) return;
    setIsSearching(true); setShowSelfieCam(false);
    try {
      const img = new Image(); img.src = screenshot;
      await new Promise(r => img.onload = r);
      const descriptor = await extractFaceDescriptorRobust(img, 'ssd');
      if (!descriptor) { alert("Couldn't see face. Try better light!"); return; }
      const { data, error } = await supabase.rpc('match_photo_faces', {
        query_embedding: Array.from(descriptor), match_threshold: MATCH_THRESHOLD, match_count: 50, target_event_id: event?.id
      });
      if (error) throw error;
      const ids = Array.from(new Set((data || []).map((d: any) => d.photo_id))) as string[];
      setMatchedPhotoIds(ids);
      if (ids.length === 0) alert("No matches found yet.");
    } catch (err) { alert("Match failed."); } finally { setIsSearching(false); }
  };
 
  const getPublicUrl = (path: string) => supabase.storage.from('photos').getPublicUrl(path).data.publicUrl;
 
  return (
    <div className="min-h-screen bg-black text-white relative overflow-x-hidden flex flex-col">
      <div className="grain" />
      <div className="orbs"><div className="orb orb-primary" /><div className="orb orb-secondary" /></div>
 
      {/* ── Modern Header ── */}
      <nav className="fixed top-0 left-0 right-0 z-[100] h-20 border-b border-white/5 backdrop-blur-xl px-6 flex items-center justify-between">
         <Link href="/" className="text-xl font-bold tracking-tighter">memento</Link>
         <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[9px] font-black uppercase tracking-widest text-primary">
            <div className={`w-1.5 h-1.5 rounded-full ${realtimeStatus === 'SUBSCRIBED' ? 'bg-green-500' : 'bg-primary'} animate-pulse`} />
            {realtimeStatus === 'SUBSCRIBED' ? 'Connected' : 'Syncing'}
         </div>
      </nav>
 
      <main className="relative z-10 pt-32 px-6 pb-20 max-w-lg mx-auto w-full">
         <div className="text-center mb-10">
            <p className="text-primary text-[10px] font-black uppercase tracking-[.3em] mb-2">{slug.toUpperCase()}</p>
            <h1 className="text-4xl font-bold tracking-tight mb-3">Share the Moment</h1>
            <p className="text-text-secondary">{event?.name || 'Live Photo Wall'}</p>
         </div>
 
         {/* Feedback */}
         <AnimatePresence>
           {successMessage && (
             <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="p-4 rounded-2xl bg-green-500/10 border border-green-500/20 text-green-500 text-sm font-bold flex items-center gap-3 mb-6">
                <CheckCircle size={18} /> {successMessage}
             </motion.div>
           )}
           {error && (
             <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="p-4 rounded-2xl bg-pink-500/10 border border-pink-500/20 text-pink-500 text-sm font-bold flex items-center gap-3 mb-6">
                <AlertTriangle size={18} /> {error}
             </motion.div>
           )}
         </AnimatePresence>
 
         {/* ── Upload Panel ── */}
         <div className="glass-panel p-8 mb-8 space-y-6">
            <div className="space-y-4">
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1">Your Name</label>
                  <input type="text" value={uploaderName} onChange={e => setUploaderName(e.target.value)} placeholder="Sarah..." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-all text-sm" />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1">Add a Caption</label>
                  <textarea value={caption} onChange={e => setCaption(e.target.value)} placeholder="Great times! ✨" rows={2} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-all text-sm resize-none" />
               </div>
            </div>
 
            <div className="h-px bg-white/5" />
 
            {/* Drop Zone */}
            <input ref={fileInputRef} type="file" multiple accept="image/*,video/*,.heic,.heif" className="hidden" onChange={handleFileChange} />
            
            {files.length > 0 ? (
               <div className="grid grid-cols-3 gap-2">
                  {files.map((f, i) => (
                    <div key={i} className="relative aspect-square rounded-xl overflow-hidden group">
                       <img src={URL.createObjectURL(f)} className="w-full h-full object-cover" alt="" />
                       <button onClick={() => setFiles(p => p.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center border border-white/10 text-white">
                          <X size={12} />
                       </button>
                    </div>
                  ))}
                  {files.length < MAX_IMAGES && (
                    <button onClick={() => fileInputRef.current?.click()} className="aspect-square rounded-xl border-2 border-dashed border-white/10 flex items-center justify-center text-text-muted hover:border-primary/50 transition-all">
                       <Upload size={20} />
                    </button>
                  )}
               </div>
            ) : (
               <button onClick={() => fileInputRef.current?.click()} className="w-full aspect-video rounded-2xl border-2 border-dashed border-white/10 bg-white/5 flex flex-col items-center justify-center gap-4 hover:border-primary/50 hover:bg-primary/5 transition-all group">
                  <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                     <Camera size={28} />
                  </div>
                  <div className="text-center">
                     <p className="text-sm font-bold">Pick Photos or Videos</p>
                     <p className="text-[10px] text-text-muted uppercase tracking-widest mt-1">Up to {MAX_IMAGES} files</p>
                  </div>
               </button>
            )}
 
            <button 
              onClick={handleUpload} 
              disabled={uploading || files.length === 0 || processingFiles}
              className="btn-premium w-full !py-4 flex flex-col items-center justify-center relative overflow-hidden disabled:opacity-30"
            >
               {uploading && <div className="absolute inset-0 bg-primary/10 origin-left scale-x-0" style={{ transform: `scaleX(${uploadProgress / 100})`, transition: 'transform 0.3s ease-out' }} />}
               <span className="relative z-10 font-bold uppercase tracking-widest text-xs">
                  {uploading ? statusText : processingFiles ? 'Processing...' : `Share to Wall (${files.length}) ✦`}
               </span>
            </button>
         </div>
 
         {/* ── Actions ── */}
         <div className="flex flex-col gap-4">
            <button onClick={() => setShowSelfieCam(true)} className="w-full py-5 rounded-2xl border border-white/5 bg-white/5 font-bold text-xs uppercase tracking-[.2em] flex items-center justify-center gap-3 hover:bg-white/10 transition-all">
               <User size={18} className="text-primary" /> Find Me on Wall
            </button>
            {matchedPhotoIds && (
               <button onClick={() => setMatchedPhotoIds(null)} className="text-[10px] font-black uppercase tracking-widest text-primary text-center">✕ Clear Filter & Show My Uploads</button>
            )}
         </div>
 
         {/* ── Gallery ── */}
         {(matchedPhotoIds || photos.length > 0) && (
            <div className="mt-16 space-y-8">
               <div className="flex items-center gap-6">
                  <h2 className="text-[10px] font-black uppercase tracking-[.3em] text-text-muted whitespace-nowrap">
                     {matchedPhotoIds ? 'FOUND FOR YOU' : 'MEMORY FEED'}
                  </h2>
                  <div className="h-px w-full bg-white/5" />
               </div>
 
               <div className="grid grid-cols-2 gap-4">
                  {photos.map(p => (
                    <div key={p.id} className="relative aspect-[4/5] rounded-2xl overflow-hidden border border-white/5 bg-white/5 group">
                       <img src={getPublicUrl(p.storage_path)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                       {p.caption && (
                         <div className="absolute inset-x-0 bottom-0 p-3 bg-black/60 backdrop-blur-md">
                            <p className="text-[10px] italic text-white/80 line-clamp-2">"{p.caption}"</p>
                         </div>
                       )}
                    </div>
                  ))}
               </div>
 
               {matchedPhotoIds && photos.length === 0 && (
                 <div className="text-center py-12 glass-panel">
                    <p className="text-sm text-text-secondary font-medium">No matches found for your face yet.</p>
                 </div>
               )}
            </div>
         )}
      </main>
 
      {/* ── Selfie Modal ── */}
      <AnimatePresence>
         {showSelfieCam && (
           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[1000] bg-black/95 backdrop-blur-3xl flex items-center justify-center p-6">
              <div className="glass-panel p-8 w-full max-w-sm text-center relative">
                 <button onClick={() => setShowSelfieCam(false)} className="absolute top-6 right-6 text-text-muted hover:text-white transition-colors"><X size={20} /></button>
                 <h2 className="text-2xl font-bold mb-2">Find My Photos</h2>
                 <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-8 italic">Smile for the Wall</p>
                 
                 <div className="aspect-square w-full rounded-2xl overflow-hidden border-2 border-white/10 mb-8 items-center justify-center flex bg-white/5 relative">
                    <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg" videoConstraints={{ facingMode: 'user' }} className="w-full h-full object-cover" mirrored />
                    <div className="absolute inset-0 border-4 border-transparent border-t-primary animate-spin" style={{ animationDuration: '3s' }} />
                 </div>
 
                 <div className="flex gap-4">
                    <button onClick={() => setShowSelfieCam(false)} className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest bg-white/5 rounded-xl border border-white/10">Cancel</button>
                    <button onClick={captureSelfie} className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest bg-primary text-white rounded-xl shadow-lg shadow-primary/20 font-black">Scan Face</button>
                 </div>
              </div>
           </motion.div>
         )}
      </AnimatePresence>
 
      {/* Footer Nav */}
      <footer className="fixed bottom-0 left-0 right-0 h-20 border-t border-white/5 backdrop-blur-xl z-[100] px-10 flex items-center justify-center">
         <Link href={`/wall/${slug}`} className="flex items-center gap-3 text-sm font-bold text-text-muted hover:text-primary transition-all">
            <Layout size={18} /> View Wall Experience
         </Link>
      </footer>
    </div>
  );
}