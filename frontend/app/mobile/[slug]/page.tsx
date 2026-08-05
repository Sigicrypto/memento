"use client";
 
import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import Image from 'next/image';
import Webcam from 'react-webcam';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeToggle from '@/components/ThemeToggle';
import { Camera, Image as ImageIcon, Upload, X, CheckCircle, AlertTriangle, User, Search, Sparkles, Layout, ArrowRight, Heart, Download, Lock } from 'lucide-react';
import { hasFeature, getGuestPhotoLimit } from '@/lib/permissions';
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
  reaction_count?: number;
}

interface Event {
  id: string;
  name: string;
  plan_type?: string;
  enable_safety_filter?: boolean;
  expires_at?: string | null;
  brand_logo_url?: string | null;
  is_closed?: boolean;
}
 
export default function MobilePage() {
  const params = useParams();
  const slug = params.slug as string;
  const router = useRouter();
 
  // State
  const [event, setEvent] = useState<Event | null>(null);
  const [guestId, setGuestId] = useState<string | null>(null);
  const [uploaderName, setUploaderName] = useState('');
  const [localUploadCount, setLocalUploadCount] = useState(0);
  const [sessionPhotoIds, setSessionPhotoIds] = useState<string[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [realtimeStatus, setRealtimeStatus] = useState<string>('connecting');
  const [brandLogoUrl, setBrandLogoUrl] = useState<string | null>(null);
 
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
    const savedName = localStorage.getItem(GUEST_NAME_KEY);
    if (savedName) setUploaderName(savedName);
 
    const savedCount = parseInt(localStorage.getItem(`memento_uploads_${slug}`) || '0', 10);
    setLocalUploadCount(savedCount);
  }, [slug]);
 
  useEffect(() => {
    if (uploaderName.trim()) localStorage.setItem(GUEST_NAME_KEY, uploaderName.trim());
  }, [uploaderName]);
 
  useEffect(() => {
    const fetchEvent = async () => {
      const { data, error } = await supabase.from('events').select('id, name, plan_type, enable_safety_filter, expires_at, brand_logo_url, is_closed').eq('slug', slug).single();
      if (error || !data) { router.push('/'); return; }
      setEvent(data as Event);
      setBrandLogoUrl(data.brand_logo_url || null);
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
        setPhotos(data);
      }
    };
    fetchPhotos();
 
    const channel = supabase.channel(`event-photos-${event.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'photos', filter: `event_id=eq.${event.id}` }, (payload) => {
        const newPhoto = payload.new as Photo;
        setPhotos(prev => [newPhoto, ...prev.filter(p => p.id !== newPhoto.id)]);
      }).subscribe((status) => setRealtimeStatus(status));
    return () => { supabase.removeChannel(channel); };
  }, [event, matchedPhotoIds]);
 
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
        // Increment LocalStorage counter
        const newCount = localUploadCount + files.length;
        setLocalUploadCount(newCount);
        localStorage.setItem(`memento_uploads_${slug}`, newCount.toString());
 
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
      const img = new window.Image(); img.src = screenshot;
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
 
  const handleReaction = async (photoId: string) => {
    if (!hasFeature(event?.plan_type, 'LIVE_REACTIONS')) return;
    setPhotos(prev => prev.map(p => p.id === photoId ? { ...p, reaction_count: (p.reaction_count || 0) + 1 } : p));
    const gId = guestId || localStorage.getItem('memento_guest_id') || Math.random().toString(36).substring(2);
    localStorage.setItem('memento_guest_id', gId);
    await supabase.from('reactions').insert({ photo_id: photoId, guest_id: gId });
  };
 
  const handleDownload = async (p: Photo) => {
    try {
      const response = await fetch(getPublicUrl(p.storage_path));
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `memento_${p.uploader_name}_${p.id.substring(0, 4)}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (e) {
      console.error('Download failed', e);
    }
  };
 
  if (error && !event) return <div className="min-h-screen flex items-center justify-center p-6 text-center text-error bg-bg font-medium">{error}</div>;
 
  const limit = getGuestPhotoLimit(event?.plan_type);
  const isLimited = localUploadCount >= limit;
 
  return (
    <div className="min-h-screen flex flex-col relative pb-20 overflow-x-hidden bg-bg">
      <div className="grain pointer-events-none" />
      <div className="orbs pointer-events-none"><div className="orb orb-primary" /><div className="orb orb-secondary" /></div>
      <div className="absolute inset-0 bg-bg/50 backdrop-blur-[80px] z-0 pointer-events-none" />
      
      {/* ── Dynamic Island Header ── */}
      <nav className="fixed top-4 left-4 right-4 z-50 h-[52px] rounded-full bg-surface/80 backdrop-blur-xl shadow-lg border border-border px-4 flex items-center justify-between">
         <div className="flex items-center">
            {hasFeature(event?.plan_type, 'BRANDING_REMOVAL') ? (
               event?.brand_logo_url ? <img src={event.brand_logo_url} alt="Event Logo" className="h-6 object-contain drop-shadow-sm" /> : <div className="w-0 invisible" />
            ) : (
               <Link href="/" className="text-sm font-bold tracking-tight text-text-primary">memento</Link>
            )}
         </div>
         <div className="flex items-center gap-3">
           <ThemeToggle />
           <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-bg-subtle border border-border text-[10px] font-semibold text-text-primary">
              <div className={`w-1.5 h-1.5 rounded-full ${realtimeStatus === 'SUBSCRIBED' ? 'bg-success' : 'bg-primary'}`} />
              <span>{realtimeStatus === 'SUBSCRIBED' ? 'Live' : 'Sync'}</span>
           </div>
         </div>
      </nav>
 
      <main className="flex-grow pt-24 px-6 w-full max-w-lg mx-auto">
         <div className="text-center mb-8">
            <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1">{slug}</p>
            <h1 className="text-2xl font-bold mb-1 text-text-primary">Share the Moment</h1>
            <p className="text-text-secondary text-sm">{event?.name || 'Live Photo Wall'}</p>
         </div>
 
         {/* Feedback */}
         <AnimatePresence>
           {successMessage && (
             <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="p-3 rounded-md bg-success/10 border border-success/20 text-success text-sm font-medium flex items-center gap-2 mb-6">
                <CheckCircle size={16} /> {successMessage}
             </motion.div>
           )}
           {error && (
             <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="p-3 rounded-md bg-error/10 border border-error/20 text-error text-sm font-medium flex items-center gap-2 mb-6">
                <AlertTriangle size={16} /> {error}
             </motion.div>
           )}
         </AnimatePresence>
 
         {/* ── Upload Panel ── */}
         <div className="card mb-8">
            {(event?.is_closed || (event?.expires_at && new Date(event.expires_at) < new Date())) ? (
               <div className="text-center py-6 px-2">
                  <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center mx-auto mb-3">
                     <Lock size={22} />
                  </div>
                  <h3 className="text-lg font-bold mb-1 text-text-primary">Event Closed (View-Only)</h3>
                  <p className="text-text-secondary text-sm max-w-xs mx-auto mb-4">
                     This photo wall is closed for new uploads. You can still browse, react to, and download all memories below!
                  </p>
                  <Link href={`/wall/${slug}`} className="btn btn-secondary text-xs inline-flex items-center gap-1.5">
                     <Layout size={14} /> Open Live Wall Screen
                  </Link>
               </div>
            ) : isLimited ? (
               <div className="text-center py-6">
                  <AlertTriangle className="w-10 h-10 text-error mx-auto mb-3" />
                  <h3 className="text-lg font-bold mb-1 text-text-primary">Upload Limit Reached</h3>
                  <p className="text-text-secondary text-sm">
                     You've hit the {limit} photo limit for this event's plan. Enjoy the party!
                  </p>
               </div>
            ) : (
            <div className="space-y-5">
               <div className="input-group">
                  <label className="label">Your Name</label>
                  <input type="text" value={uploaderName} onChange={e => setUploaderName(e.target.value)} placeholder="Sarah..." className="input" />
               </div>
               <div className="input-group">
                  <label className="label">Add a Caption</label>
                  <textarea value={caption} onChange={e => setCaption(e.target.value)} placeholder="Great times! ✨" rows={2} className="input h-auto py-2 resize-none" />
               </div>
 
               <div className="h-px bg-border my-2" />
 
               {/* Drop Zone */}
               {files.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2">
                     {files.map((f, i) => (
                       <div key={i} className="relative aspect-square rounded-md overflow-hidden bg-bg-subtle border border-border group">
                          <img src={URL.createObjectURL(f)} className="w-full h-full object-cover" alt="" />
                          <button onClick={() => setFiles(p => p.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 w-6 h-6 bg-bg/80 backdrop-blur rounded-full flex items-center justify-center text-text-primary hover:bg-bg transition-colors">
                             <X size={12} />
                          </button>
                       </div>
                     ))}
                     {files.length < MAX_IMAGES && (
                       <div className="aspect-square rounded-md border-2 border-dashed border-border flex items-center justify-center text-text-muted hover:border-primary/50 transition-colors relative">
                          <input type="file" multiple accept="image/*,video/*,.heic,.heif" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                          <Upload size={20} />
                       </div>
                     )}
                  </div>
               ) : (
                  <div className="w-full rounded-lg border border-border bg-bg-subtle p-6 flex flex-col items-center justify-center gap-4 hover:border-primary/50 transition-colors relative">
                     <div className="w-12 h-12 rounded-full bg-bg border border-border flex items-center justify-center text-text-primary">
                        <Camera size={24} />
                     </div>
                     <div className="w-full relative">
                        <input type="file" multiple accept="image/*,video/*,.heic,.heif" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                        <button type="button" className="btn btn-secondary w-full pointer-events-none">
                           Select Files to Upload
                        </button>
                     </div>
                     <p className="text-xs text-text-muted mt-1 text-center">Up to {MAX_IMAGES} files (Photos or Video)</p>
                  </div>
               )}
 
               <div className="sticky bottom-4 z-50 mt-8">
                 <button 
                   onClick={handleUpload} 
                   disabled={uploading || files.length === 0 || processingFiles || isLimited}
                   className="btn btn-primary w-full btn-lg relative overflow-hidden shadow-2xl shadow-primary/20 ring-4 ring-bg/50"
                 >
                    {uploading && <div className="absolute inset-0 bg-white/20 origin-left scale-x-0" style={{ transform: `scaleX(${uploadProgress / 100})`, transition: 'transform 0.3s ease-out' }} />}
                    <span className="relative z-10 flex items-center gap-2">
                       {uploading ? statusText : processingFiles ? 'Processing...' : `🚀 Upload to Wall (${files.length})`}
                    </span>
                 </button>
               </div>
            </div>
            )}
         </div>
 
         {/* ── Actions ── */}
         {hasFeature(event?.plan_type, 'SELFIE_MATCH') && (
           <div className="flex flex-col gap-3">
              <button onClick={() => setShowSelfieCam(true)} className="btn btn-secondary w-full btn-lg">
                 <User size={16} /> Find Me on Wall
              </button>
              {matchedPhotoIds && (
                 <button onClick={() => setMatchedPhotoIds(null)} className="text-xs font-semibold text-text-primary hover:underline text-center mt-2">✕ Clear Filter & Show My Uploads</button>
              )}
           </div>
         )}
 
         {/* ── Gallery ── */}
         {(matchedPhotoIds || photos.length > 0) && (
            <div className="mt-12 space-y-6">
               <div className="flex items-center gap-4">
                  <h2 className="text-xs font-bold uppercase tracking-widest text-text-muted whitespace-nowrap">
                     {matchedPhotoIds ? 'Found for You' : 'Memory Feed'}
                  </h2>
                  <div className="h-px w-full bg-border" />
               </div>
 
               <div className="grid grid-cols-2 gap-3">
                  <AnimatePresence mode="popLayout">
                  {photos.map((p, i) => (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      key={p.id} 
                      className="relative aspect-[4/5] rounded-md overflow-hidden border border-border bg-bg-subtle group"
                    >
                       <Image 
                          src={getPublicUrl(p.storage_path)} 
                          alt={p.caption || "Guest memory"} 
                          fill 
                          sizes="(max-width: 768px) 50vw, 33vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-105" 
                       />
                       <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                         {hasFeature(event?.plan_type, 'LIVE_REACTIONS') && (
                           <button onClick={() => handleReaction(p.id)} className="w-8 h-8 bg-bg/80 backdrop-blur rounded-full flex items-center justify-center hover:text-pink-500 transition-colors border border-border shadow-sm text-text-primary">
                             <Heart size={14} className={p.reaction_count ? 'fill-pink-500 text-pink-500' : ''} />
                           </button>
                         )}
                         <button onClick={() => handleDownload(p)} className="w-8 h-8 bg-bg/80 backdrop-blur rounded-full flex items-center justify-center hover:text-primary transition-colors border border-border shadow-sm text-text-primary">
                           <Download size={14} />
                         </button>
                       </div>
                       {p.caption && (
                         <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
                            <p className="text-xs text-white line-clamp-2 font-medium">{p.caption}</p>
                         </div>
                       )}
                    </motion.div>
                  ))}
                  </AnimatePresence>
               </div>
 
               {matchedPhotoIds && photos.length === 0 && (
                 <div className="text-center py-10 card">
                    <p className="text-sm text-text-secondary font-medium">No matches found for your face yet.</p>
                 </div>
               )}
            </div>
         )}
      </main>
 
      {/* ── Selfie Modal ── */}
      <AnimatePresence>
         {showSelfieCam && (
           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[1000] bg-bg/95 backdrop-blur-sm flex items-center justify-center p-6">
              <div className="card p-6 w-full max-w-sm text-center relative border-border shadow-xl">
                 <button onClick={() => setShowSelfieCam(false)} className="absolute top-4 right-4 text-text-muted hover:text-text-primary transition-colors"><X size={20} /></button>
                 <h2 className="text-lg font-bold mb-1 text-text-primary">Find My Photos</h2>
                 <p className="text-sm text-text-secondary mb-6">Smile for the Wall</p>
                 
                 <div className="aspect-square w-full rounded-md overflow-hidden border border-border mb-6 flex items-center justify-center relative bg-bg-subtle">
                    <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg" videoConstraints={{ facingMode: 'user' }} className="w-full h-full object-cover" mirrored />
                 </div>
 
                 <div className="flex gap-3">
                    <button onClick={() => setShowSelfieCam(false)} className="btn btn-secondary flex-1 btn-lg">Cancel</button>
                    <button onClick={captureSelfie} className="btn btn-primary flex-1 btn-lg">Scan Face</button>
                 </div>
              </div>
           </motion.div>
         )}
      </AnimatePresence>
 
      {/* Footer Nav */}
      <footer className="fixed bottom-0 left-0 right-0 h-16 border-t border-border bg-bg/95 backdrop-blur z-50 px-6 flex items-center justify-center">
         <Link href={`/wall/${slug}`} className="flex items-center gap-2 text-sm font-semibold text-text-secondary hover:text-text-primary transition-colors">
            <Layout size={16} /> View Wall Experience
         </Link>
      </footer>
    </div>
  );
}