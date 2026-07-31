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
  const [eventData, setEventData] = useState<any>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [hasInteracted, setHasInteracted] = useState(false);

  const getPublicUrl = (path: string) => {
    const { data } = supabase.storage.from('photos').getPublicUrl(path);
    return data.publicUrl;
  };

  useEffect(() => {
    if (!slug) return;

    const fetchEventAndPhotos = async () => {
      const { data: dbEventData, error: eventError } = await supabase
        .from('events')
        .select('id, name, music_track, plan_type, brand_logo_url')
        .eq('slug', slug)
        .single();

      if (eventError || !dbEventData) {
        console.error('Event not found');
        return;
      }

      setEventName(dbEventData.name);
      setEventData(dbEventData);

      const { data: photosData, error: photosError } = await supabase
        .rpc('get_photos_with_reactions', { event_uuid: dbEventData.id });

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

  if (!hasInteracted) {
    return (
      <div 
        className="lp min-h-screen relative flex items-center justify-center cursor-pointer overflow-hidden group"
        onClick={() => setHasInteracted(true)}
      >
        <div className="aurora-bg fixed inset-0 z-0 transition-transform duration-1000 group-hover:scale-105" />
        <div className="grain fixed inset-0 z-1 opacity-[0.03] pointer-events-none" />
        <div className="relative z-10 text-center flex flex-col items-center">
          <div className="w-20 h-20 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center mb-6 shadow-[0_0_50px_rgba(255,255,255,0.1)] group-hover:bg-white/20 transition-all">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 ml-1 text-white"><path d="M8 5v14l11-7z"/></svg>
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4 text-white tracking-tight drop-shadow-xl">{eventName}</h1>
          <p className="text-white/70 text-lg uppercase tracking-widest font-bold">Click anywhere to start TV Mode</p>
        </div>
      </div>
    );
  }

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
      
      {/* Audio Player */}
      {eventData?.music_track && eventData.music_track !== 'none' && (
        <audio autoPlay loop src={`/audio/${eventData.music_track}.mp3`} />
      )}

      <div className="absolute top-6 left-6 z-50">
        {eventData?.plan_type === 'WHITE_LABEL' ? (
          eventData.brand_logo_url ? (
            <img src={eventData.brand_logo_url} alt="Logo" className="h-8 object-contain drop-shadow-md" />
          ) : null
        ) : (
          <div className="text-2xl font-bold tracking-tighter text-white drop-shadow-md">memento</div>
        )}
      </div>
      
      <div className="absolute top-6 right-6 z-50">
        <Link href={`/wall/${slug}`} className="px-5 py-3 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 hover:bg-black/60 transition-all font-bold text-sm text-white flex items-center gap-2 shadow-lg">
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
            
            {currentPhoto.caption && <p className="text-2xl md:text-3xl font-medium mb-3 leading-relaxed tracking-wide text-white drop-shadow-md">"{currentPhoto.caption}"</p>}
            <div className="inline-block px-4 py-1.5 rounded-full bg-black/40 border border-white/10">
              <p className="text-base font-bold text-amber-400 uppercase tracking-widest flex items-center gap-2">
                {eventData?.plan_type === 'WHITE_LABEL' ? '' : 'MEMENTO BY'} {currentPhoto.uploader_name}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
