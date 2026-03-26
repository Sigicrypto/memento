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
}

export default function ModeratePage() {
  const params = useParams();
  const slug = params.slug as string;
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [eventName, setEventName] = useState('');
  const [eventId, setEventId] = useState<string | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
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
  }, [slug, user, authLoading, router]);

  const getPublicUrl = (path: string) => {
    const { data } = supabase.storage.from('photos').getPublicUrl(path);
    return data.publicUrl;
  };

  const deletePhoto = async (photo: Photo) => {
    if (!confirm('Delete this photo permanently?')) return;
    await supabase.storage.from('photos').remove([photo.storage_path]);
    await supabase.from('photos').delete().eq('id', photo.id);
    setPhotos((prev) => prev.filter((p) => p.id !== photo.id));
  };

  if (authLoading || loading) {
    return (
      <div className="nm-page flex items-center justify-center">
        <div className="nm-circle w-14 h-14">
          <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{borderColor:'#252c46',borderTopColor:'#f59e0b'}} />
        </div>
      </div>
    );
  }

  return (
    <div className="nm-page">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="nm-card p-6 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold" style={{color:'#e2e8f0'}}>🛡️ Moderate: {eventName}</h1>
            <p className="text-sm mt-1" style={{color:'#7f849c'}}>{photos.length} photo{photos.length !== 1 ? 's' : ''} — hover to delete</p>
          </div>
          <button onClick={() => router.push(`/wall/${slug}`)} className="nm-btn px-4 py-2 font-semibold">
            ← Back to Wall
          </button>
        </div>

        {photos.length === 0 ? (
          <div className="nm-card p-16 text-center">
            <div className="text-5xl mb-4">✅</div>
            <p style={{color:'#7f849c'}}>No photos to moderate.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map((photo) => (
              <div key={photo.id} className="nm-card overflow-hidden group relative">
                <div className="overflow-hidden rounded-[14px]">
                  <img src={getPublicUrl(photo.storage_path)} alt="" className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#14182a]/90 via-[#14182a]/30 to-transparent opacity-0 group-hover:opacity-100 transition-all flex flex-col justify-between p-3 rounded-[18px]">
                  <div className="text-xs" style={{color:'#e2e8f0'}}>
                    <p className="font-semibold">{photo.uploader_name}</p>
                    {photo.caption && <p className="italic mt-0.5 text-[10px]" style={{color:'#7f849c'}}>{photo.caption}</p>}
                  </div>
                  <button onClick={() => deletePhoto(photo)}
                    className="nm-btn w-full text-xs py-2" style={{color:'#f87171',background:'rgba(248,113,113,0.15)'}}>
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
