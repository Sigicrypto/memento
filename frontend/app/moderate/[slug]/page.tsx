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
      <div className="nm-page flex items-center justify-center">
        <div className="nm-circle w-14 h-14">
          <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{borderColor:'#252c46',borderTopColor:'#f59e0b'}} />
        </div>
      </div>
    );
  }

  return (
    <div className="nm-page px-4 py-12 pb-40">
      <div className="max-w-5xl mx-auto">
        <div className="nm-card p-8 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold" style={{color:'var(--text1)'}}>🛡️ Moderate: {eventName}</h1>
            <p className="text-sm mt-1" style={{color:'var(--text2)'}}>{photos.filter(p => !p.approved).length} pending photos</p>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setFilter('pending')} className={`nm-btn text-xs px-3 py-1 ${filter === 'pending' ? 'nm-btn-accent' : ''}`}>Pending</button>
              <button onClick={() => setFilter('approved')} className={`nm-btn text-xs px-3 py-1 ${filter === 'approved' ? 'nm-btn-accent' : ''}`}>Approved</button>
              <button onClick={() => setFilter('all')} className={`nm-btn text-xs px-3 py-1 ${filter === 'all' ? 'nm-btn-accent' : ''}`}>All</button>
            </div>
          </div>
          <button onClick={() => router.push(`/wall/${slug}`)} className="nm-btn px-4 py-3 text-xs font-bold">
            ← Back to Wall
          </button>
        </div>

        {photos.filter(p => filter === 'all' ? true : filter === 'pending' ? !p.approved : p.approved).length === 0 ? (
          <div className="nm-card p-16 text-center">
            <div className="text-5xl mb-4">✅</div>
            <p style={{color:'var(--text2)'}}>No photos to moderate.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.filter(p => filter === 'all' ? true : filter === 'pending' ? !p.approved : p.approved).map((photo) => (
              <div key={photo.id} className={`nm-card overflow-hidden group relative ${!photo.approved ? 'ring-2 ring-yellow-500' : ''}`}>
                <div className="overflow-hidden rounded-[14px]">
                  {photo.media_type === 'video' ? (
                     <video src={getPublicUrl(photo.storage_path)} className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300" controls={false} autoPlay loop muted playsInline />
                  ) : (
                     <img src={getPublicUrl(photo.storage_path)} alt="" className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300" />
                  )}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#14182a]/90 via-[#14182a]/30 to-transparent opacity-0 group-hover:opacity-100 transition-all flex flex-col justify-between p-3 rounded-[18px]">
                  <div className="text-xs" style={{color:'var(--text1)'}}>
                    <p className="font-semibold">{photo.uploader_name}</p>
                    {photo.caption && <p className="italic mt-0.5 text-[10px]" style={{color:'var(--text2)'}}>{photo.caption}</p>}
                  </div>
                  <div className="flex gap-2">
                    {!photo.approved && <button onClick={() => approvePhoto(photo.id)} className="nm-btn flex-1 text-xs py-2" style={{color:'#4ade80',background:'rgba(74,222,128,0.15)'}}>Approve</button>}
                    <button onClick={() => rejectPhoto(photo)} className="nm-btn flex-1 text-xs py-2" style={{color:'#f87171',background:'rgba(248,113,113,0.15)'}}>Reject</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
