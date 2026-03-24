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
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="aurora-bg min-h-screen">
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold">🛡️ Moderate: {eventName}</h1>
            <p className="text-dark-text text-sm mt-1">{photos.length} photo{photos.length !== 1 ? 's' : ''} — hover any to delete</p>
          </div>
          <button onClick={() => router.push(`/wall/${slug}`)} className="btn-secondary text-sm">
            ← Back to Wall
          </button>
        </div>

        {photos.length === 0 ? (
          <div className="card text-center !p-16">
            <div className="text-5xl mb-4">✅</div>
            <p className="text-dark-text">No photos to moderate.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map((photo) => (
              <div key={photo.id} className="group relative rounded-2xl overflow-hidden border border-dark-border hover:border-red-500/30 transition-all">
                <img src={getPublicUrl(photo.storage_path)} alt="" className="w-full h-44 object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-all flex flex-col justify-between p-3">
                  <div className="text-white text-xs">
                    <p className="font-semibold">{photo.uploader_name}</p>
                    {photo.caption && <p className="italic mt-0.5 text-gray-300 text-[10px]">{photo.caption}</p>}
                  </div>
                  <button onClick={() => deletePhoto(photo)}
                    className="bg-red-500/90 hover:bg-red-600 text-white text-xs font-semibold px-3 py-2 rounded-lg transition w-full">
                    🗑️ Delete Photo
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
