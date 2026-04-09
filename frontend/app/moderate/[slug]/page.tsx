"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

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
      const { data, error } = await supabase.from('events')
        .select('id, name, owner_id').eq('slug', slug).single();

      if (error || !data) { router.push('/dashboard'); return; }
      setEventName(data.name);
      setEventId(data.id);

      if (user?.id !== data.owner_id) { router.push('/dashboard'); return; }

      const { data: photoData } = await supabase.from('photos')
        .select('*').eq('event_id', data.id).order('created_at', { ascending: false });
      if (photoData) setPhotos(photoData);
      setLoading(false);
    };
    fetchEvent();
  }, [slug, user, isLoading, router]);

  const getPublicUrl = (path: string) => {
    const { data } = supabase.storage.from('photos').getPublicUrl(path);
    return data.publicUrl;
  };

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
      <div className="lp min-h-screen relative overflow-hidden flex items-center justify-center">
        <div className="aurora-bg fixed inset-0 z-0" />
        <div className="grain fixed inset-0 z-1 opacity-[0.03] pointer-events-none" />
        <div className="relative z-10 w-14 h-14 border-4 rounded-full border-white/10 border-t-amber-500 animate-spin" />
      </div>
    );
  }

  const filteredPhotos = photos.filter(p => filter === 'all' ? true : filter === 'pending' ? !p.approved : p.approved);

  return (
    <main className="lp min-h-screen relative overflow-hidden px-4 py-12 pb-40">
      <div className="aurora-bg fixed inset-0 z-0" />
      <div className="grain fixed inset-0 z-1 opacity-[0.03] pointer-events-none" />
      <div className="orbs fixed inset-0 z-0 pointer-events-none">
        <div className="orb orb1" />
        <div className="orb orb2" />
        <div className="orb orb3" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        <header className="flex items-center justify-between mb-12">
           <button onClick={() => router.push(`/wall/${slug}`)} className="btn-outline flex items-center gap-2 group px-6">
            <svg className="group-hover:-translate-x-1 transition-transform" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            Back to Wall
          </button>
          <img src="/CC logo.png" alt="Memento" className="h-8 md:h-10 w-auto" />
        </header>

        <div className="gcard cinematic-glow mb-8 p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 overflow-hidden">
          <div className="gcard-border" />
          <div className="relative z-10 w-full flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-xl">🛡️</span>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Moderation Portal</span>
              </div>
              <h1 className="text-3xl font-black text-white tracking-tight">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">{eventName}</span>
              </h1>
              <p className="text-sm mt-3 text-slate-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full animate-pulse bg-amber-500" />
                {photos.filter(p => !p.approved).length} pending photos awaiting approval
              </p>
            </div>

            <div className="flex flex-col items-end gap-4">
              <div className="flex gap-1 bg-white/5 p-1.5 rounded-2xl border border-white/10 backdrop-blur-2xl">
                <button onClick={() => setFilter('pending')} className={`text-[10px] px-6 py-2.5 rounded-xl font-black uppercase tracking-widest transition-all ${filter === 'pending' ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>Pending</button>
                <button onClick={() => setFilter('approved')} className={`text-[10px] px-6 py-2.5 rounded-xl font-black uppercase tracking-widest transition-all ${filter === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>Approved</button>
                <button onClick={() => setFilter('all')} className={`text-[10px] px-6 py-2.5 rounded-xl font-black uppercase tracking-widest transition-all ${filter === 'all' ? 'bg-white/10 text-white shadow-[0_0_10px_rgba(255,255,255,0.1)]' : 'text-slate-400 hover:text-white'}`}>All</button>
              </div>
            </div>
          </div>
        </div>

        {filteredPhotos.length === 0 ? (
          <div className="gcard cinematic-glow p-20 text-center">
            <div className="gcard-border" />
            <div className="relative z-10">
              <div className="text-6xl mb-6">✨</div>
              <h3 className="text-2xl font-bold text-white mb-2">All Caught Up!</h3>
              <p className="text-slate-400">No {filter !== 'all' ? filter : ''} photos to moderate right now.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {filteredPhotos.map((photo) => (
              <div key={photo.id} className={`gcard p-0 cinematic-glow overflow-hidden group ${!photo.approved ? 'ring-2 ring-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.15)]' : ''}`}>
                <div className="gcard-border" />
                <div className="relative z-10 h-full w-full">
                  <div className="overflow-hidden bg-[#0a0a1a]">
                    {photo.media_type === 'video' ? (
                       <video src={getPublicUrl(photo.storage_path)} className="w-full h-56 object-cover opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500" controls={false} autoPlay loop muted playsInline />
                    ) : (
                       <img src={getPublicUrl(photo.storage_path)} alt="" className="w-full h-56 object-cover opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500" loading="lazy" />
                    )}
                  </div>
                  
                  {/* Persistent overlay for pending, hover for approved */}
                  <div className={`absolute inset-0 bg-gradient-to-t from-[#050510] via-transparent to-transparent flex flex-col justify-between p-4 transition-opacity duration-300 ${!photo.approved ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 bg-[#050510]/60'}`}>
                    
                    {/* Status badge */}
                    <div className="flex justify-end">
                      {photo.approved ? (
                        <span className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20 backdrop-blur-md">Approved</span>
                      ) : (
                        <span className="px-2 py-1 rounded bg-amber-500/20 text-amber-400 text-[10px] font-black uppercase tracking-widest border border-amber-500/20 backdrop-blur-md animate-pulse">Pending Review</span>
                      )}
                    </div>
                    
                    <div className="mt-auto">
                      <div className="mb-3 drop-shadow-md">
                        <p className="font-bold text-white text-sm">{photo.uploader_name}</p>
                        {photo.caption && <p className="italic mt-1 text-xs text-slate-300 line-clamp-2">{photo.caption}</p>}
                      </div>
                      
                      <div className="flex gap-2">
                        {!photo.approved && (
                          <button onClick={() => approvePhoto(photo.id)} className="flex-1 py-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold hover:bg-emerald-500/30 transition-colors backdrop-blur-md">
                            Approve
                          </button>
                        )}
                        <button onClick={() => rejectPhoto(photo)} className="flex-1 py-2 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold hover:bg-rose-500/30 transition-colors backdrop-blur-md">
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
