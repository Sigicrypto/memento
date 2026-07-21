"use client";
 
import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import Image from 'next/image';
import Webcam from 'react-webcam';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Image as ImageIcon, Upload, X, CheckCircle, AlertTriangle, User, Search, Sparkles, Layout, ArrowRight, Heart, Download } from 'lucide-react';
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
      const { data, error } = await supabase.from('events').select('id, name, plan_type, enable_safety_filter, expires_at, brand_logo_url').eq('slug', slug).single();
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

  if (error) return <div className="min-h-screen flex items-center justify-center bg-black text-white p-6 text-center">{error}</div>;

  const limit = getGuestPhotoLimit(event?.plan_type);
  const isLimited = localUploadCount >= limit;

  return (
    <div className="min-h-screen bg-black text-white relative overflow-x-hidden flex flex-col">
      <div className="grain" />
      <div className="orbs"><div className="orb orb-primary" /><div className="orb orb-secondary" /></div>
 
      {/* ── Dynamic Island Header ── */}
      <nav className="fixed top-4 left-4 right-4 z-[100] h-16 rounded-full border border-white/10 bg-black/60 backdrop-blur-2xl px-6 flex items-center justify-between shadow-[0_4px_30px_rgba(0,0,0,0.5)] shadow-primary/5">
         {(hasFeature(event?.plan_type, 'BRANDING_REMOVAL') && brandLogoUrl) ? (
            <img src={brandLogoUrl} alt="Event Logo" className="h-6 object-contain" />
         ) : (
            <Link href="/" className="text-lg font-bold tracking-tighter bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">memento</Link>
         )}
         <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest text-white shadow-inner">
            <div className={`live-pulse ${realtimeStatus === 'SUBSCRIBED' ? '!bg-green-500' : ''}`} style={{ width: 6, height: 6 }} />
            <span className={realtimeStatus === 'SUBSCRIBED' ? 'text-green-400' : 'text-primary'}>{realtimeStatus === 'SUBSCRIBED' ? 'Live' : 'Sync'}</span>
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
            {isLimited ? (
               <div className="text-center py-6">
                  <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">Upload Limit Reached</h3>
                  <p className="text-text-secondary text-sm">
                     You've hit the {limit} photo limit for this event's plan. Enjoy the party!
                  </p>
               </div>
            ) : (
            <>
            <div className="space-y-4">
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1">Your Name</label>
                  <input type="text" value={uploaderName} onChange={e => setUploaderName(e.target.value)} placeholder="Sarah..." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm shadow-inner" />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1">Add a Caption</label>
                  <textarea value={caption} onChange={e => setCaption(e.target.value)} placeholder="Great times! ✨" rows={2} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm resize-none shadow-inner" />
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
              disabled={uploading || files.length === 0 || processingFiles || isLimited}
              className="btn-premium w-full !py-4 flex flex-col items-center justify-center relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed group"
            >
               {uploading && <div className="absolute inset-0 bg-white/20 origin-left scale-x-0" style={{ transform: `scaleX(${uploadProgress / 100})`, transition: 'transform 0.3s ease-out' }} />}
               <span className="relative z-10 font-bold uppercase tracking-widest text-xs flex items-center gap-2 group-hover:scale-105 transition-transform">
                  {uploading ? statusText : processingFiles ? 'Processing...' : `Share to Wall (${files.length})`}
                  {!uploading && !processingFiles && <Sparkles size={14} />}
               </span>
            </button>
            </>
            )}
         </div>
 
         {/* ── Actions ── */}
         {hasFeature(event?.plan_type, 'SELFIE_MATCH') && (
           <div className="flex flex-col gap-4">
              <button onClick={() => setShowSelfieCam(true)} className="w-full py-5 rounded-2xl border border-white/5 bg-white/5 font-bold text-xs uppercase tracking-[.2em] flex items-center justify-center gap-3 hover:bg-white/10 transition-all">
                 <User size={18} className="text-primary" /> Find Me on Wall
              </button>
              {matchedPhotoIds && (
                 <button onClick={() => setMatchedPhotoIds(null)} className="text-[10px] font-black uppercase tracking-widest text-primary text-center">✕ Clear Filter & Show My Uploads</button>
              )}
           </div>
         )}
 
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
                  <AnimatePresence mode="popLayout">
                  {photos.map((p, i) => (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.8, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.4, type: 'spring', bounce: 0.3, delay: i < 6 ? i * 0.1 : 0 }}
                      key={p.id} 
                      className="relative aspect-[4/5] rounded-2xl overflow-hidden border border-white/10 bg-white/5 group shadow-lg"
                    >
                       <Image 
                          src={getPublicUrl(p.storage_path)} 
                          alt={p.caption || "Guest memory"} 
                          fill 
                          sizes="(max-width: 768px) 50vw, 33vw"
                          className="object-cover group-hover:scale-110 transition-transform duration-700" 
                          priority={i < 4}
                       />
                       <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                         {hasFeature(event?.plan_type, 'LIVE_REACTIONS') && (
                           <button onClick={() => handleReaction(p.id)} className="w-8 h-8 bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center text-white/80 hover:text-pink-500 hover:scale-110 transition-all border border-white/10">
                             <Heart size={14} className={p.reaction_count ? 'fill-pink-500 text-pink-500' : ''} />
                           </button>
                         )}
                         <button onClick={() => handleDownload(p)} className="w-8 h-8 bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center text-white/80 hover:text-primary hover:scale-110 transition-all border border-white/10">
                           <Download size={14} />
                         </button>
                       </div>
                       {p.caption && (
                         <div className="absolute inset-x-0 bottom-0 p-3 bg-black/60 backdrop-blur-md">
                            <p className="text-[10px] italic text-white/80 line-clamp-2">"{p.caption}"</p>
                         </div>
                       )}
                    </motion.div>
                  ))}
                  </AnimatePresence>
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
                 
                 <div className="aspect-square w-full rounded-2xl overflow-hidden border-2 border-primary/50 mb-8 items-center justify-center flex bg-black relative shadow-[0_0_30px_rgba(245,158,11,0.2)]">
                    <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg" videoConstraints={{ facingMode: 'user' }} className="w-full h-full object-cover opacity-80" mirrored />
                    <div className="absolute inset-0 border-[4px] border-transparent border-t-primary border-b-primary rounded-full animate-spin opacity-50 pointer-events-none" style={{ animationDuration: '4s' }} />
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