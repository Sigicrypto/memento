"use client";
 
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, CheckCircle, XCircle, ArrowLeft, Clock, Trash2, Check, Layout, AlertTriangle } from 'lucide-react';
 
interface Photo {
  id: string;
  storage_path: string;
  uploader_name: string;
  caption?: string;
  created_at: string;
  approved: boolean;
  media_type?: string;
}
 
export default function ModeratePage() {
  const params = useParams();
  const slug = params.slug as string;
  const router = useRouter();
  const { user, isLoading } = useAuth();
 
  const [eventName, setEventName] = useState('');
  const [eventId, setEventId] = useState<string | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('pending');
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
 
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };
 
  useEffect(() => {
    if (isLoading) return;
    const fetchEvent = async () => {
      const { data, error } = await supabase.from('events').select('id, name, owner_id').eq('slug', slug).single();
      if (error || !data) { router.push('/dashboard'); return; }
      if (user?.id !== data.owner_id) { router.push('/dashboard'); return; }
      
      setEventName(data.name);
      setEventId(data.id);
 
      const { data: photoData } = await supabase.from('photos').select('*').eq('event_id', data.id).order('created_at', { ascending: false });
      if (photoData) setPhotos(photoData);
      setLoading(false);
    };
    fetchEvent();
  }, [slug, user, isLoading, router]);
 
  const getPublicUrl = (path: string) => supabase.storage.from('photos').getPublicUrl(path).data.publicUrl;
 
  const approvePhoto = async (photoId: string) => {
    await supabase.from('photos').update({ approved: true }).eq('id', photoId);
    setPhotos(prev => prev.map(p => p.id === photoId ? { ...p, approved: true } : p));
  };
 
  const rejectPhoto = async (photo: Photo) => {
    if (!confirm('Reject and delete this photo permanently?')) return;
    await supabase.storage.from('photos').remove([photo.storage_path]);
    await supabase.from('photos').delete().eq('id', photo.id);
    setPhotos((prev) => prev.filter((p) => p.id !== photo.id));
    showToast('Photo rejected and deleted');
  };
 
  const handleBulkApprove = async () => {
    if (selectedIds.size === 0) return;
    const ids = Array.from(selectedIds);
    await supabase.from('photos').update({ approved: true }).in('id', ids);
    setPhotos(prev => prev.map(p => ids.includes(p.id) ? { ...p, approved: true } : p));
    setSelectedIds(new Set());
    showToast(`Approved ${ids.length} photos`);
  };
 
  const handleBulkReject = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Reject and delete ${selectedIds.size} photos permanently?`)) return;
    const ids = Array.from(selectedIds);
    const photosToDelete = photos.filter(p => ids.includes(p.id));
    await supabase.storage.from('photos').remove(photosToDelete.map(p => p.storage_path));
    await supabase.from('photos').delete().in('id', ids);
    setPhotos((prev) => prev.filter((p) => !ids.includes(p.id)));
    setSelectedIds(new Set());
    showToast(`Rejected and deleted ${ids.length} photos`);
  };
 
  const toggleSelection = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
 
  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-subtle">
        <div className="w-8 h-8 border-2 border-border border-t-primary rounded-full animate-spin" />
      </div>
    );
  }
 
  const filteredPhotos = photos.filter(p => filter === 'all' ? true : filter === 'pending' ? !p.approved : p.approved);
 
  return (
    <div className="min-h-screen flex flex-col bg-bg-subtle relative pb-20">
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -20, x: '-50%' }} animate={{ opacity: 1, y: 0, x: '-50%' }} exit={{ opacity: 0, y: -20, x: '-50%' }} className={`fixed top-20 left-1/2 z-[200] px-4 py-2 rounded-md flex items-center gap-2 font-medium text-sm shadow-md border ${toast.type === 'success' ? 'bg-success/10 text-success border-success/20' : 'bg-error/10 text-error border-error/20'}`}>
            {toast.type === 'success' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
 
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-[64px] border-b border-border bg-bg flex items-center justify-between px-6">
         <div className="flex items-center gap-4">
            <Link href={`/wall/${slug}`} className="flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors font-medium text-sm">
               <ArrowLeft size={16} /> Back to Wall
            </Link>
            <div className="h-6 w-px bg-border hidden md:block" />
            <span className="text-sm font-bold tracking-tight hidden md:block text-text-primary">memento</span>
         </div>
         <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-bg-subtle border border-border text-xs font-semibold text-text-primary">
            <Shield size={14} /> Moderation
         </div>
      </nav>
 
      <main className="flex-grow pt-24 px-6 max-w-7xl mx-auto w-full">
         {/* Header Card */}
         <div className="card mb-8 flex flex-col md:flex-row items-center justify-between gap-6 bg-bg">
            <div className="text-center md:text-left">
               <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                  <div className="w-10 h-10 rounded-md bg-bg-subtle border border-border flex items-center justify-center text-text-primary">
                     <Shield size={20} />
                  </div>
                  <div>
                     <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Event Control</p>
                     <h1 className="text-xl font-bold text-text-primary">{eventName}</h1>
                  </div>
               </div>
               <p className="text-sm text-text-secondary flex items-center justify-center md:justify-start gap-1.5">
                  <Clock size={14} /> {photos.filter(p => !p.approved).length} photos awaiting approval
               </p>
            </div>
 
            <div className="flex flex-col gap-3 items-end w-full md:w-auto">
               <div className="flex bg-bg-subtle p-1 rounded-md border border-border w-full md:w-auto">
                  {(['pending', 'approved', 'all'] as const).map(f => (
                    <button key={f} onClick={() => { setFilter(f); setSelectedIds(new Set()); }} className={`flex-1 md:flex-none px-4 py-1.5 rounded text-xs font-semibold uppercase tracking-wider transition-colors ${filter === f ? 'bg-bg shadow-sm text-text-primary' : 'text-text-muted hover:text-text-primary'}`}>
                       {f}
                    </button>
                  ))}
               </div>
               {selectedIds.size > 0 && (
                 <div className="flex items-center gap-2 w-full md:w-auto">
                    <span className="text-xs font-medium text-text-secondary whitespace-nowrap">{selectedIds.size} selected</span>
                    <button onClick={handleBulkApprove} className="btn btn-primary btn-sm flex-1 md:flex-none"><Check size={14} /> Approve</button>
                    <button onClick={handleBulkReject} className="btn btn-secondary btn-sm flex-1 md:flex-none text-error hover:bg-error/10 hover:border-error/20"><Trash2 size={14} /> Reject</button>
                 </div>
               )}
            </div>
         </div>
 
         {/* Grid */}
         <AnimatePresence mode="wait">
            {filteredPhotos.length === 0 ? (
               <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="py-20 text-center card bg-bg border-dashed">
                  <div className="w-12 h-12 rounded-full bg-bg-subtle border border-border flex items-center justify-center text-text-muted mx-auto mb-4">
                     <CheckCircle size={24} />
                  </div>
                  <h2 className="text-lg font-semibold mb-1 text-text-primary">All Caught Up!</h2>
                  <p className="text-sm text-text-secondary">No {filter !== 'all' ? filter : ''} photos to moderate right now.</p>
               </motion.div>
            ) : (
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                   {filteredPhotos.map((photo, i) => (
                     <motion.div key={photo.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: (i % 8) * 0.05 }} onClick={() => toggleSelection(photo.id)} className={`relative group aspect-[3/4] rounded-md overflow-hidden border cursor-pointer ${selectedIds.has(photo.id) ? 'border-primary ring-2 ring-primary/20' : !photo.approved ? 'border-border' : 'border-border'} bg-bg-subtle`}>
                        {selectedIds.has(photo.id) && (
                          <div className="absolute inset-0 bg-primary/10 z-10 pointer-events-none" />
                        )}
                        <div className="absolute top-2 left-2 z-20">
                          <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selectedIds.has(photo.id) ? 'bg-primary border-primary text-bg' : 'border-border bg-bg/80 backdrop-blur text-transparent'}`}>
                             <Check size={12} />
                          </div>
                        </div>
                        <div className="absolute inset-0">
                           {photo.media_type === 'video' ? (
                              <video src={getPublicUrl(photo.storage_path)} className="w-full h-full object-cover" muted playsInline />
                           ) : (
                              <Image src={getPublicUrl(photo.storage_path)} className="object-cover transition-transform duration-500 group-hover:scale-105" alt="" fill sizes="(max-width: 768px) 50vw, 25vw" loading="lazy" />
                           )}
                        </div>
                       
                       <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end">
                          <div className="flex items-center justify-between mb-2">
                             <div>
                                <p className="text-[10px] font-bold text-white truncate max-w-[80px]">{photo.uploader_name}</p>
                                <p className="text-[10px] text-white/70">{new Date(photo.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                             </div>
                             {photo.approved && <div className="px-1.5 py-0.5 rounded bg-success/20 text-success text-[9px] font-bold uppercase tracking-wider border border-success/20">Approved</div>}
                          </div>
                          
                          {photo.caption && <p className="text-xs text-white/90 italic mb-3 line-clamp-2">"{photo.caption}"</p>}
                          
                          <div className="flex gap-2 relative z-20">
                              {!photo.approved && (
                                <button onClick={(e) => { e.stopPropagation(); approvePhoto(photo.id); showToast('Photo approved'); }} className="flex-1 py-1.5 rounded bg-bg text-text-primary text-[10px] font-bold hover:bg-bg-subtle transition-colors flex items-center justify-center gap-1.5 border border-border">
                                   <Check size={12} /> Approve
                                </button>
                              )}
                              <button onClick={(e) => { e.stopPropagation(); rejectPhoto(photo); }} className="flex-1 py-1.5 rounded bg-error/90 text-white text-[10px] font-bold hover:bg-error transition-colors flex items-center justify-center gap-1.5">
                                 <Trash2 size={12} /> Reject
                              </button>
                           </div>
                       </div>
                     </motion.div>
                   ))}
               </motion.div>
            )}
         </AnimatePresence>
      </main>
 
      {/* Footer Nav */}
      <footer className="fixed bottom-0 left-0 right-0 h-[64px] border-t border-border bg-bg flex items-center justify-center z-50">
         <Link href={`/wall/${slug}`} className="flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">
            <Layout size={16} /> Direct to Wall View
         </Link>
      </footer>
    </div>
  );
}
