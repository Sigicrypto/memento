"use client";
 
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
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
  };
 
  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
        <div className="orbs"><div className="orb orb-primary" /><div className="orb orb-secondary" /></div>
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin relative z-10" />
      </div>
    );
  }
 
  const filteredPhotos = photos.filter(p => filter === 'all' ? true : filter === 'pending' ? !p.approved : p.approved);
 
  return (
    <div className="min-h-screen bg-black text-white relative overflow-x-hidden flex flex-col">
      <div className="grain" />
      <div className="orbs"><div className="orb orb-primary" /><div className="orb orb-secondary" /></div>
 
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-[100] h-20 border-b border-white/5 backdrop-blur-xl px-8 flex items-center justify-between">
         <div className="flex items-center gap-6">
            <Link href={`/wall/${slug}`} className="flex items-center gap-2 text-text-muted hover:text-white transition-all font-bold text-sm">
               <ArrowLeft size={16} /> Back to Wall
            </Link>
            <div className="h-6 w-px bg-white/10 hidden md:block" />
            <span className="text-xl font-bold tracking-tighter hidden md:block">memento</span>
         </div>
         <div className="flex items-center gap-3 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[9px] font-black uppercase tracking-widest text-primary">
            <Shield size={12} /> Moderation Portal
         </div>
      </nav>
 
      <main className="relative z-10 pt-32 px-8 pb-32 max-w-[1400px] mx-auto w-full">
         {/* Header Card */}
         <div className="glass-panel p-8 md:p-12 mb-12 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left">
               <div className="flex items-center justify-center md:justify-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                     <Shield size={24} />
                  </div>
                  <div>
                     <p className="text-[10px] font-black uppercase tracking-[.3em] text-primary">EVENT CONTROL</p>
                     <h1 className="text-3xl font-bold tracking-tight">{eventName}</h1>
                  </div>
               </div>
               <p className="text-sm text-text-secondary flex items-center justify-center md:justify-start gap-2">
                  <Clock size={16} /> {photos.filter(p => !p.approved).length} photos awaiting your approval
               </p>
            </div>
 
            <div className="bg-white/5 border border-white/10 p-1.5 rounded-2xl flex items-center gap-1 backdrop-blur-3xl">
               {(['pending', 'approved', 'all'] as const).map(f => (
                 <button key={f} onClick={() => setFilter(f)} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'text-text-muted hover:text-white hover:bg-white/5'}`}>
                    {f}
                 </button>
               ))}
            </div>
         </div>
 
         {/* Grid */}
         <AnimatePresence mode="wait">
            {filteredPhotos.length === 0 ? (
               <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="py-32 text-center glass-panel">
                  <div className="text-6xl mb-6 opacity-20">✨</div>
                  <h2 className="text-2xl font-bold mb-2">All Caught Up!</h2>
                  <p className="text-text-secondary">No {filter !== 'all' ? filter : ''} photos to moderate right now.</p>
               </motion.div>
            ) : (
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredPhotos.map((photo, i) => (
                    <motion.div key={photo.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: (i % 8) * 0.05 }} className={`relative group aspect-[3/4] rounded-3xl overflow-hidden border ${!photo.approved ? 'border-primary/50 shadow-[0_0_30px_rgba(99,102,241,0.2)]' : 'border-white/5'} bg-white/5`}>
                       {photo.media_type === 'video' ? (
                          <video src={getPublicUrl(photo.storage_path)} className="w-full h-full object-cover" muted playsInline />
                       ) : (
                          <img src={getPublicUrl(photo.storage_path)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                       )}
                       
                       <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end">
                          <div className="flex items-center justify-between mb-3">
                             <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-0.5">{photo.uploader_name}</p>
                                <p className="text-[10px] text-text-muted">{new Date(photo.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                             </div>
                             {photo.approved && <div className="px-2 py-1 rounded bg-green-500/20 text-green-500 text-[8px] font-black uppercase tracking-widest border border-green-500/20">Approved</div>}
                          </div>
                          
                          {photo.caption && <p className="text-xs text-white italic mb-4 line-clamp-2">&quot;{photo.caption}&quot;</p>}
                          
                          <div className="flex gap-2">
                             {!photo.approved && (
                               <button onClick={() => approvePhoto(photo.id)} className="flex-1 py-2.5 rounded-xl bg-primary text-white text-[10px] font-bold uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2">
                                  <Check size={14} /> Approve
                               </button>
                             )}
                             <button onClick={() => rejectPhoto(photo)} className="flex-1 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-bold uppercase tracking-widest hover:bg-red-500/20 transition-all flex items-center justify-center gap-2">
                                <Trash2 size={14} /> Reject
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
      <footer className="fixed bottom-0 left-0 right-0 h-20 border-t border-white/5 backdrop-blur-xl z-[100] px-10 flex items-center justify-center">
         <Link href={`/wall/${slug}`} className="flex items-center gap-3 text-sm font-bold text-text-muted hover:text-primary transition-all">
            <Layout size={18} /> Direct to Wall View
         </Link>
      </footer>
    </div>
  );
}
