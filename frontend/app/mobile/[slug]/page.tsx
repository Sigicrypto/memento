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
      // If uploader name exists, filter by it, otherwise show all event photos
      let query = supabase
        .from('photos')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false });
      
      // Only filter by uploader name if it exists and is not empty
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
        // Show photo if it matches event AND (no name filter OR matches uploader name)
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-amber-900 to-gray-900">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <div className="relative z-10 bg-gray-800/50 backdrop-blur-md border-b border-amber-500/20">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-white">{eventName}</h1>
              <p className="text-sm text-gray-400">
                {uploaderName ? `Photos by: ${uploaderName}` : 'All Event Photos'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                realtimeStatus === 'SUBSCRIBED' ? 'bg-green-400' : 'bg-yellow-400'
              }`} />
              <span className="text-xs text-gray-400">
                {realtimeStatus === 'SUBSCRIBED' ? 'Live' : 'Connecting...'}
              </span>
            </div>
          </div>
          
          {/* Name Filter */}
          <div className="mt-4 flex gap-2">
            <input
              type="text"
              value={uploaderName}
              onChange={(e) => setUploaderName(e.target.value)}
              placeholder="Enter your name to filter your photos..."
              className="flex-1 px-4 py-2 rounded-lg border border-gray-600 bg-gray-700/50 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all"
            />
            <button
              onClick={() => {
                localStorage.setItem('memento_guest_name', uploaderName);
                // Refetch photos
                window.location.reload();
              }}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white rounded-lg text-sm font-medium transition-all"
            >
              Filter
            </button>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="max-w-4xl mx-auto px-4 mt-4">
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 backdrop-blur-sm">
            <p className="text-green-400 text-center font-medium">
              ✅ {successMessage}
            </p>
          </div>
        </div>
      )}

      {/* Photos Grid */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 py-6">
        {photos.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-amber-500/20 to-rose-500/20 rounded-full flex items-center justify-center border border-amber-500/30">
              <span className="text-3xl">📸</span>
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">
              {uploaderName ? `No photos found for "${uploaderName}"` : 'No photos yet'}
            </h2>
            <p className="text-gray-400 mb-4">
              {uploaderName 
                ? 'Try clearing the name filter to see all photos, or upload new photos with this name.'
                : 'Upload photos to see them appear here in real-time.'}
            </p>
            
            {uploaderName && (
              <button
                onClick={() => {
                  setUploaderName('');
                  localStorage.removeItem('memento_guest_name');
                  window.location.reload();
                }}
                className="mb-4 text-amber-400 hover:text-amber-300 text-sm font-medium transition-colors"
              >
                Clear filter & show all photos
              </button>
            )}
            
            <div className="mt-4">
              <Link 
                href={`/upload/${slug}`}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white px-6 py-3 rounded-lg font-medium transition-all"
              >
                📱 Upload Photos
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {photos.map((photo) => (
              <div key={photo.id} className="relative group">
                <div className="aspect-square overflow-hidden rounded-lg border border-gray-700 bg-gray-800/50">
                  <img
                    src={getPublicUrl(photo.storage_path)}
                    alt={`Uploaded by ${photo.uploader_name}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
                
                {/* Overlay with info */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg">
                  <div className="absolute bottom-0 left-0 right-0 p-2">
                    <div className="flex items-center justify-between">
                      <p className="text-white text-xs font-medium truncate">
                        {photo.uploader_name}
                      </p>
                      <button
                        onClick={() => downloadPhoto(photo)}
                        className="text-white/80 hover:text-white p-1 rounded transition-colors"
                        title="Download"
                      >
                        ⬇
                      </button>
                    </div>
                    {photo.caption && (
                      <p className="text-white/80 text-xs truncate mt-1">
                        "{photo.caption}"
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-800/50 backdrop-blur-md border-t border-amber-500/20 p-4 z-20">
        <div className="max-w-4xl mx-auto flex gap-3">
          <Link
            href={`/upload/${slug}`}
            className="flex-1 bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white px-4 py-3 rounded-lg font-medium transition-all text-center"
          >
            📸 Upload More
          </Link>
          <Link
            href={`/wall/${slug}`}
            className="flex-1 bg-gray-700/50 hover:bg-gray-700 text-white px-4 py-3 rounded-lg font-medium transition-all text-center border border-gray-600"
          >
            🖼️ View Wall
          </Link>
        </div>
      </div>
    </div>
  );
}
