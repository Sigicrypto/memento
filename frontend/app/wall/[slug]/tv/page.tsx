"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import Image from 'next/image';
import { QRCode } from 'react-qrcode-logo';
import { MessageCircle, Upload, X } from 'lucide-react';

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
  const [uploadUrl, setUploadUrl] = useState('');
  const [isViewOnly, setIsViewOnly] = useState(false);

  const getPublicUrl = (path: string) => {
    const { data } = supabase.storage.from('photos').getPublicUrl(path);
    return data.publicUrl;
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && slug) {
      setUploadUrl(`${window.location.origin}/mobile/${slug}`);
    }
  }, [slug]);

  useEffect(() => {
    if (!slug) return;

    const fetchEventAndPhotos = async () => {
      const { data: dbEventData, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('slug', slug)
        .single();

      if (eventError || !dbEventData) {
        console.error('Event not found or fetch error:', eventError);
        return;
      }

      setEventName(dbEventData.name);
      setEventData(dbEventData);

      const closed = dbEventData.is_closed || (dbEventData.expires_at && new Date(dbEventData.expires_at) < new Date());
      setIsViewOnly(!!closed);

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
        className="lp min-h-screen relative flex items-center justify-center cursor-pointer overflow-hidden group bg-black"
        onClick={() => setHasInteracted(true)}
      >
        <div className="aurora-bg fixed inset-0 z-0 transition-transform duration-1000 group-hover:scale-105" />
        <div className="grain fixed inset-0 z-1 opacity-[0.03] pointer-events-none" />
        <div className="relative z-10 text-center flex flex-col items-center p-8">
          <div className="w-20 h-20 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center mb-6 shadow-[0_0_50px_rgba(255,255,255,0.1)] group-hover:bg-white/20 transition-all">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 ml-1 text-white"><path d="M8 5v14l11-7z"/></svg>
          </div>
          <h1 className="text-4xl md:text-6xl font-black mb-4 text-white tracking-tight drop-shadow-xl">{eventName || 'Event Wall'}</h1>
          <p className="text-amber-400 text-lg uppercase tracking-widest font-bold animate-pulse">Click anywhere to start TV Mode</p>
        </div>
      </div>
    );
  }

  if (!currentPhoto) {
    return (
      <div className="lp min-h-screen relative overflow-hidden flex items-center justify-center bg-black">
        <div className="aurora-bg fixed inset-0 z-0" />
        <div className="grain fixed inset-0 z-1 opacity-[0.03] pointer-events-none" />
        
        <div className="relative z-10 text-center flex flex-col items-center p-8">
          <div className="w-16 h-16 border-4 rounded-full border-white/10 border-t-amber-400 animate-spin mb-6" />
          <h1 className="text-4xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-rose-400">{eventName}</h1>
          <p className="text-white/70 text-lg uppercase tracking-widest font-bold animate-pulse">Waiting for guest photos...</p>

          {/* Bottom Left — Mobile Upload QR Code */}
          {!isViewOnly && uploadUrl && (
            <div className="fixed bottom-8 left-8 z-50 hidden sm:flex flex-col items-center">
              <div className="p-4 bg-black/70 backdrop-blur-2xl rounded-2xl border border-white/15 shadow-2xl flex flex-col items-center gap-2 text-center group hover:bg-black/90 transition-all">
                <div className="p-3 bg-white/10 rounded-xl border border-white/10">
                  <QRCode value={uploadUrl} size={110} bgColor="transparent" fgColor="#ffffff" qrStyle="dots" eyeRadius={10} />
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-white/60 mb-0.5">SCAN TO UPLOAD</p>
                  <p className="text-xs font-extrabold text-amber-400 flex items-center justify-center gap-1">
                    <Upload size={12} /> Share Photos
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Bottom Right — WhatsApp Support & Queries QR Code */}
          <div className="fixed bottom-8 right-8 z-50 hidden sm:flex flex-col items-center">
            <a href="https://wa.me/919866161775" target="_blank" rel="noopener noreferrer" className="p-4 bg-black/70 backdrop-blur-2xl rounded-2xl border border-white/15 hover:border-emerald-500/40 shadow-2xl flex flex-col items-center gap-2 text-center group hover:bg-black/90 transition-all">
              <div className="p-3 bg-white/10 rounded-xl border border-white/10">
                <QRCode value="https://wa.me/919866161775" size={110} bgColor="transparent" fgColor="#ffffff" qrStyle="dots" eyeRadius={10} />
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-white/60 mb-0.5">NEED HELP / QUERIES?</p>
                <p className="text-xs font-extrabold text-emerald-400 flex items-center justify-center gap-1">
                  <MessageCircle size={12} /> WhatsApp Support
                </p>
              </div>
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="lp min-h-screen relative overflow-hidden flex flex-col items-center justify-center bg-black">
      <div className="aurora-bg fixed inset-0 z-0" />
      <div className="grain fixed inset-0 z-1 opacity-[0.03] pointer-events-none" />
      
      {/* Audio Player */}
      {eventData?.music_track && eventData.music_track !== 'none' && (
        <audio autoPlay loop src={`/audio/${eventData.music_track}.mp3`} />
      )}

      {/* Top Left Header / Branding */}
      <div className="fixed top-6 left-6 z-50">
        {eventData?.plan_type === 'WHITE_LABEL' ? (
          eventData.brand_logo_url ? (
            <img src={eventData.brand_logo_url} alt="Logo" className="h-10 object-contain drop-shadow-md" />
          ) : null
        ) : (
          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10">
            <span className="text-xl font-black tracking-tighter text-white">memento</span>
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">• {eventName}</span>
          </div>
        )}
      </div>
      
      {/* Top Right Exit TV Mode */}
      <div className="fixed top-6 right-6 z-50">
        <Link href={`/wall/${slug}`} className="px-5 py-3 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 hover:bg-black/70 transition-all font-bold text-sm text-white flex items-center gap-2 shadow-lg">
          <X size={16} /> Exit TV Mode
        </Link>
      </div>

      {/* Main Slideshow Media Display */}
      <div className="relative z-10 w-full h-full flex items-center justify-center p-8 md:p-16">
        <div className="relative w-full h-[82vh] flex items-center justify-center">
          {currentPhoto.media_type === 'video' ? (
            <video key={currentPhoto.id} src={getPublicUrl(currentPhoto.storage_path)} autoPlay muted loop playsInline className="max-h-full max-w-full object-contain rounded-3xl shadow-[0_0_80px_rgba(0,0,0,0.8)] border border-white/10" />
          ) : (
            <div className="relative w-full h-full">
              <Image key={currentPhoto.id} src={getPublicUrl(currentPhoto.storage_path)} alt="" fill className="object-contain rounded-3xl shadow-[0_0_80px_rgba(0,0,0,0.8)] border border-white/10" priority />
            </div>
          )}
        </div>
      </div>

      {/* Bottom Center Photo Caption & Uploader Badge */}
      {(currentPhoto.caption || currentPhoto.uploader_name) && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 w-full max-w-xl px-6">
          <div className="bg-black/60 backdrop-blur-2xl border border-white/15 p-5 rounded-2xl text-center shadow-2xl relative overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />
            
            {currentPhoto.caption && <p className="text-xl md:text-2xl font-medium mb-2 leading-relaxed tracking-wide text-white drop-shadow-md">&quot;{currentPhoto.caption}&quot;</p>}
            <div className="inline-block px-4 py-1.5 rounded-full bg-white/10 border border-white/10">
              <p className="text-xs font-bold text-amber-400 uppercase tracking-widest flex items-center justify-center gap-2">
                {eventData?.plan_type === 'WHITE_LABEL' ? '' : 'SHARED BY'} {currentPhoto.uploader_name}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Left — Mobile Upload QR Code */}
      {!isViewOnly && uploadUrl && (
        <div className="fixed bottom-8 left-8 z-50 hidden sm:flex flex-col items-center">
          <div className="p-4 bg-black/70 backdrop-blur-2xl rounded-2xl border border-white/15 shadow-2xl flex flex-col items-center gap-2 text-center group hover:bg-black/90 transition-all">
            <div className="p-3 bg-white/10 rounded-xl border border-white/10">
              <QRCode value={uploadUrl} size={110} bgColor="transparent" fgColor="#ffffff" qrStyle="dots" eyeRadius={10} />
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-white/60 mb-0.5">SCAN TO UPLOAD</p>
              <p className="text-xs font-extrabold text-amber-400 flex items-center justify-center gap-1">
                <Upload size={12} /> Share Photos
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Right — WhatsApp Support & Queries QR Code */}
      <div className="fixed bottom-8 right-8 z-50 hidden sm:flex flex-col items-center">
        <a href="https://wa.me/919866161775" target="_blank" rel="noopener noreferrer" className="p-4 bg-black/70 backdrop-blur-2xl rounded-2xl border border-white/15 hover:border-emerald-500/40 shadow-2xl flex flex-col items-center gap-2 text-center group hover:bg-black/90 transition-all">
          <div className="p-3 bg-white/10 rounded-xl border border-white/10">
            <QRCode value="https://wa.me/919866161775" size={110} bgColor="transparent" fgColor="#ffffff" qrStyle="dots" eyeRadius={10} />
          </div>
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-white/60 mb-0.5">NEED HELP / QUERIES?</p>
            <p className="text-xs font-extrabold text-emerald-400 flex items-center justify-center gap-1">
              <MessageCircle size={12} /> WhatsApp Support
            </p>
          </div>
        </a>
      </div>
    </div>
  );
}
