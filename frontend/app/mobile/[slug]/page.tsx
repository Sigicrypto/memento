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

interface Event {
  id: string;
  name: string;
  enable_smart_privacy?: boolean;
  plan_type?: string;
}

export default function MobileUploadPage() {
  const params = useParams();
  const slug = params.slug as string;
  const router = useRouter();

  const [event, setEvent] = useState<Event | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [uploaderName, setUploaderName] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [realtimeStatus, setRealtimeStatus] = useState<string>('connecting');
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [matchedPhotoIds, setMatchedPhotoIds] = useState<string[] | null>(null);

  const handleFindMyPhotos = async () => {
    if (!selfieFile || !event) return;

    setIsSearching(true);
    try {
      // 1. Upload selfie to a temporary location
      const selfiePath = `selfies/${event.id}-${Date.now()}`;
      const { error: uploadError } = await supabase.storage.from('photos').upload(selfiePath, selfieFile);
      if (uploadError) throw uploadError;

      // 2. Get public URL
      const { data: urlData } = supabase.storage.from('photos').getPublicUrl(selfiePath);
      const imageUrl = urlData.publicUrl;

      // 3. Invoke edge function
      const { data, error: functionError } = await supabase.functions.invoke('find-my-photos', {
        body: { eventId: event.id, imageUrl },
      });

      if (functionError) throw functionError;

      setMatchedPhotoIds(data.photoIds || []);

      // 4. Clean up the uploaded selfie
      await supabase.storage.from('photos').remove([selfiePath]);

    } catch (error: any) {
      console.error('Error finding photos:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsSearching(false);
    }
  };

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
        .select('id, name, enable_smart_privacy, plan_type')
        .eq('slug', slug)
        .single();

      if (error || !data) {
        router.push('/404');
        return;
      }
      setEvent(data as Event);
    };
    fetchEvent();
  }, [slug, router]);

  // Fetch photos + realtime
  useEffect(() => {
    if (!event?.id) return;

    const fetchPhotos = async () => {
      let query = supabase
        .from('photos')
        .select('*')
        .eq('event_id', event.id)
        .order('created_at', { ascending: false });
      
      if (matchedPhotoIds) {
        query = query.in('id', matchedPhotoIds);
      } else if (uploaderName && uploaderName.trim()) {
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
      .channel(`user-photos-${event.id}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'photos'
      }, (payload) => {
        const newPhoto = payload.new as Photo;
        if (newPhoto.event_id === event.id) {
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
  }, [event, uploaderName]);

  const getPublicUrl = (path: string) => {
    const { data } = supabase.storage.from('photos').getPublicUrl(path);
    return data.publicUrl;
  };

  const downloadPhoto = async (photo: Photo) => {
    if (event?.enable_smart_privacy && matchedPhotoIds && !matchedPhotoIds.includes(photo.id)) {
      alert("This photo hasn't been matched to your selfie. You can only download matched photos.");
      return;
    }

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
              {event?.name}
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

      {event?.enable_smart_privacy && (event.plan_type === 'Premium' || event.plan_type === 'White Label') && (
        <div className="mx-4 mt-4 nm-card p-4">
          <h2 className="text-lg font-bold text-center mb-2" style={{color:'#e2e8f0'}}>Find My Photos</h2>
          <p className="text-sm text-center mb-4" style={{color:'#7f849c'}}>Upload a selfie to find photos you're in.</p>
          <input type="file" accept="image/*" onChange={(e) => { setSelfieFile(e.target.files?.[0] || null); setSelfiePreview(URL.createObjectURL(e.target.files?.[0]!)); }} className="hidden" id="selfie-upload" />
          <label htmlFor="selfie-upload" className="nm-btn w-full text-center py-3">Upload Selfie</label>
          {selfiePreview && (
            <div className="mt-4 text-center">
              <img src={selfiePreview} alt="Selfie preview" className="w-32 h-32 object-cover rounded-lg mx-auto mb-4" />
              <button onClick={handleFindMyPhotos} className="nm-btn nm-btn-accent px-6 py-2" disabled={isSearching}>
                {isSearching ? 'Searching...' : 'Find My Photos'}
              </button>
            </div>
          )}
        </div>
      )}

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