"use client";

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import Image from 'next/image';

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
      <div className="lp min-h-screen relative overflow-hidden flex items-center justify-center ">
        <div className="aurora-bg fixed inset-0 z-0" />
        <div className="grain fixed inset-0 z-1 opacity-[0.03] pointer-events-none" />
        
        <div className="relative z-10 text-center flex flex-col items-center">
          <div className="w-16 h-16 border-4 rounded-full border-black/10 dark:border-border border-t-amber-500 animate-spin mb-6" />
          <h1 className="text-4xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-rose-400">{eventName}</h1>
          <p className="text-slate-600 dark:text-slate-600 dark:text-slate-400 text-lg uppercase tracking-widest font-bold animate-pulse">Waiting for photos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="lp min-h-screen relative overflow-hidden flex flex-col items-center justify-center">
      <div className="aurora-bg fixed inset-0 z-0" />
      <div className="grain fixed inset-0 z-1 opacity-[0.03] pointer-events-none" />
      
      <div className="absolute top-6 right-6 z-50">
        <Link href={`/wall/${slug}`} className="px-5 py-3 rounded-xl /40 backdrop-blur-md border border-border hover:bg-border transition-all font-bold text-sm text-text-primary hover:text-black dark:hover:text-text-primary flex items-center gap-2">
          ✕ Exit TV Mode
        </Link>
      </div>

      <div className="relative z-10 w-full h-full flex items-center justify-center p-8">
        <div className="relative w-full h-full flex items-center justify-center">
          {currentPhoto.media_type === 'video' ? (
            <video key={currentPhoto.id} src={getPublicUrl(currentPhoto.storage_path)} autoPlay muted loop playsInline className="max-h-full max-w-full object-contain rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-border" />
          ) : (
            <div className="relative w-full h-full"><Image key={currentPhoto.id} src={getPublicUrl(currentPhoto.storage_path)} alt="" fill className="object-contain rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-border" priority /></div>
          )}
        </div>
      </div>

      {(currentPhoto.caption || currentPhoto.uploader_name) && (
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 w-full max-w-4xl px-6">
          <div className="/40 backdrop-blur-xl border border-border p-6 rounded-2xl text-center shadow-2xl relative overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
            
            {currentPhoto.caption && <p className="text-2xl md:text-3xl font-medium mb-3 leading-relaxed tracking-wide">"{currentPhoto.caption}"</p>}
            <div className="inline-block px-4 py-1.5 rounded-full bg-bg-subtle border border-border">
              <p className="text-base font-bold text-amber-400 uppercase tracking-widest">{currentPhoto.uploader_name}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
