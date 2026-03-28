"use client";

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

interface Photo {
  id: string;
  storage_path: string;
  uploader_name: string;
  caption?: string;
  media_type?: 'image' | 'video';
}

export default function TVModePage() {
  const params = useParams();
  const slug = params.slug as string;

  const [eventName, setEventName] = useState('');
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const getPublicUrl = (path: string) => {
    const { data } = supabase.storage.from('photos').getPublicUrl(path);
    return data.publicUrl;
  };

  useEffect(() => {
    if (!slug) return;

    const fetchEventAndPhotos = async () => {
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('id, name')
        .eq('slug', slug)
        .single();

      if (eventError || !eventData) {
        console.error('Event not found');
        return;
      }

      setEventName(eventData.name);

      const { data: photosData, error: photosError } = await supabase
        .rpc('get_photos_with_reactions', { event_uuid: eventData.id });

      if (photosError) {
        console.error('Error fetching photos:', photosError);
      } else {
        setPhotos(photosData as Photo[]);
      }
    };

    fetchEventAndPhotos();

    const channel = supabase
      .channel(`tv-mode-photos-${slug}`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'photos' },
        () => fetchEventAndPhotos()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [slug]);

  useEffect(() => {
    if (photos.length === 0) return;

    const timer = setInterval(() => {
      setCurrentPhotoIndex(prevIndex => (prevIndex + 1) % photos.length);
    }, 5000); // Change photo every 5 seconds

    return () => clearInterval(timer);
  }, [photos]);

  const currentPhoto = photos[currentPhotoIndex];

  if (!currentPhoto) {
    return (
      <div className="fixed inset-0 bg-[#14182a] flex items-center justify-center text-white">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">{eventName}</h1>
          <p>Waiting for photos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[#14182a] text-white flex flex-col items-center justify-center overflow-hidden">
      <div className="absolute top-4 right-4 z-10">
        <Link href={`/wall/${slug}`} className="nm-btn px-4 py-2 text-sm">✕ Exit TV Mode</Link>
      </div>

      <div className="w-full h-full flex items-center justify-center">
        {currentPhoto.media_type === 'video' ? (
          <video key={currentPhoto.id} src={getPublicUrl(currentPhoto.storage_path)} autoPlay muted loop playsInline className="max-h-full max-w-full object-contain" />
        ) : (
          <img key={currentPhoto.id} src={getPublicUrl(currentPhoto.storage_path)} alt="" className="max-h-full max-w-full object-contain" />
        )}
      </div>

      {(currentPhoto.caption || currentPhoto.uploader_name) && (
        <div className="absolute bottom-10 left-10 right-10 bg-black/50 p-4 rounded-lg text-center">
          {currentPhoto.caption && <p className="text-xl italic mb-2">\"{currentPhoto.caption}\"</p>}
          <p className="text-lg font-bold">— {currentPhoto.uploader_name}</p>
        </div>
      )}
    </div>
  );
}
