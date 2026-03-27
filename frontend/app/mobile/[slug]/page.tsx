"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

interface Photo {
  id: string;
  storage_path: string;
  uploader_name: string;
  created_at: string;
  caption?: string;
  event_id: string;
}

export default function MobileUploadPage() {
  const params = useParams();
  const slug = params.slug as string;
  const router = useRouter();

  const [eventName, setEventName] = useState('');
  const [eventId, setEventId] = useState<string | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [uploaderName, setUploaderName] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [realtimeStatus, setRealtimeStatus] = useState<string>('connecting');

  // Load cached guest name
  useEffect(() => {
    const cachedName = localStorage.getItem('memento_guest_name');
    if (cachedName) {
      setUploaderName(cachedName);
    }
  }, []);

  // Fetch event info
  useEffect(() => {
    const fetchEvent = async () => {
      const { data, error } = await supabase
        .from('events')
        .select('id, name')
        .eq('slug', slug)
        .single();

      if (error || !data) {
        router.push('/404');
        return;
      }
      setEventName(data.name);
      setEventId(data.id);
    };
    fetchEvent();
  }, [slug, router]);

  // Fetch photos + realtime
  useEffect(() => {
    if (!eventId) return;

    const fetchPhotos = async () => {
      let query = supabase
        .from('photos')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false });
      
      if (uploaderName && uploaderName.trim()) {
        query = query.eq('uploader_name', uploaderName.trim());
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching photos:', error);
        return;
      }
      
      if (data) {
        console.log(`Found ${data.length} photos for ${uploaderName || 'all users'}`);
        setPhotos(data);
      }
    };
    fetchPhotos();

    const channel = supabase
      .channel(`user-photos-${eventId}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'photos'
      }, (payload) => {
        const newPhoto = payload.new as Photo;
        if (newPhoto.event_id === eventId) {
          if (!uploaderName || !uploaderName.trim() || newPhoto.uploader_name === uploaderName.trim()) {
            setPhotos((prev) => {
              if (prev.some(p => p.id === newPhoto.id)) return prev;
              return [newPhoto, ...prev];
            });
            setSuccessMessage('Photo uploaded successfully!');
            setTimeout(() => setSuccessMessage(''), 3000);
          }
        }
      })
      .subscribe((status) => {
        setRealtimeStatus(status);
        console.log('Mobile page realtime status:', status);
      });

    return () => { supabase.removeChannel(channel); };
  }, [eventId, uploaderName]);

  const getPublicUrl = (path: string) => {
    const { data } = supabase.storage.from('photos').getPublicUrl(path);
    return data.publicUrl;
  };

  const downloadPhoto = async (photo: Photo) => {
    const url = getPublicUrl(photo.storage_path);
    const res = await fetch(url);
    const blob = await res.blob();
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `memento-${photo.uploader_name}-${photo.id.slice(0, 6)}.jpg`;
    link.click();
  };

  return (
    <div className="nm-page pb-24">
      {/* Header — mt-12 pushes it clear of the top nav */}
      <div className="nm-card mx-4 pt-20 pb-4 px-4">
        <div className="flex items-center justify-between mb-3">
          <div className="space-y-1">
            <h1 className="text-xl font-bold leading-tight" style={{color:'#e2e8f0'}}>
              {eventName}
            </h1>
            <p className="text-sm leading-relaxed" style={{color:'#7f849c'}}>
              {uploaderName ? `Photos by: ${uploaderName}` : 'All Event Photos'}
            </p>
          </div>
          <div className="nm-badge flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${realtimeStatus === 'SUBSCRIBED' ? 'bg-green-400' : 'bg-yellow-400'}`} />
            {realtimeStatus === 'SUBSCRIBED' ? 'Live' : 'Connecting...'}
          </div>
        </div>
        <div className="flex gap-2 mt-3">
          <input type="text" value={uploaderName} onChange={(e) => setUploaderName(e.target.value)}
            placeholder="Enter your name to filter..." className="nm-input flex-1 text-sm py-2" />
          <button onClick={() => { localStorage.setItem('memento_guest_name', uploaderName); window.location.reload(); }}
            className="nm-btn nm-btn-accent px-4 py-2 text-sm font-semibold">Filter</button>
        </div>
      </div>

      {successMessage && (
        <div className="mx-4 mt-4">
          <div className="nm-inset p-3 text-center text-sm font-medium" style={{color:'#4ade80'}}>
            ✅ {successMessage}
          </div>
        </div>
      )}

      {/* Photos Grid — pt-10 pushes it down a bit more */}
      <div className="max-w-4xl mx-auto px-4 pt-6 pb-10">
        {photos.length === 0 ? (
          <div className="text-center py-12">
            <div className="nm-circle w-20 h-20 mx-auto mb-4 text-3xl">📸</div>
            <h2 className="text-xl font-semibold mb-2" style={{color:'#e2e8f0'}}>
              {uploaderName ? `No photos for "${uploaderName}"` : 'No photos yet'}
            </h2>
            <p className="text-sm mb-4" style={{color:'#7f849c'}}>
              {uploaderName ? 'Clear the filter to see all photos.' : 'Upload photos to see them appear here.'}
            </p>
            {uploaderName && (
              <button onClick={() => { setUploaderName(''); localStorage.removeItem('memento_guest_name'); window.location.reload(); }}
                className="nm-btn mb-4 text-sm px-4 py-2" style={{color:'#f59e0b'}}>
                Clear filter & show all
              </button>
            )}
            <div className="mt-4">
              <Link href={`/upload/${slug}`} className="nm-btn nm-btn-accent px-6 py-3 font-semibold">
                📱 Upload Photos
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {photos.map((photo) => (
              <div key={photo.id} className="nm-card overflow-hidden group relative">
                <div className="aspect-square overflow-hidden rounded-[14px]">
                  <img src={getPublicUrl(photo.storage_path)} alt={`Uploaded by ${photo.uploader_name}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#14182a]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-[18px]">
                  <div className="absolute bottom-0 left-0 right-0 p-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium truncate" style={{color:'#e2e8f0'}}>{photo.uploader_name}</p>
                      <button onClick={() => downloadPhoto(photo)} className="nm-circle w-7 h-7 text-xs" title="Download">⬇</button>
                    </div>
                    {photo.caption && <p className="text-xs truncate mt-1" style={{color:'#7f849c'}}>"{photo.caption}"</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 p-4 z-20" style={{background:'#1e2235',boxShadow:'0 -4px 20px #14182a, 0 -1px 8px #252c46'}}>
        <div className="max-w-4xl mx-auto flex gap-3">
          <Link href={`/upload/${slug}`} className="nm-btn nm-btn-accent flex-1 py-3 font-semibold text-center">📸 Upload More</Link>
          <Link href={`/wall/${slug}`} className="nm-btn flex-1 py-3 font-semibold text-center">🖼️ View Wall</Link>
        </div>
      </div>
    </div>
  );
}