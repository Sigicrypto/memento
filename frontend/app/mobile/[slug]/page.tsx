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
      const { data } = await supabase
        .from('photos')
        .select('*')
        .eq('event_id', eventId)
        .eq('uploader_name', uploaderName)
        .order('created_at', { ascending: false });
      if (data) setPhotos(data);
    };
    fetchPhotos();

    const channel = supabase
      .channel(`user-photos-${eventId}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'photos'
      }, (payload) => {
        const newPhoto = payload.new as Photo;
        if (newPhoto.event_id === eventId && newPhoto.uploader_name === uploaderName) {
          setPhotos((prev) => {
            if (prev.some(p => p.id === newPhoto.id)) return prev;
            return [newPhoto, ...prev];
          });
          setSuccessMessage('Photo uploaded successfully!');
          setTimeout(() => setSuccessMessage(''), 3000);
        }
      })
      .subscribe((status) => {
        setRealtimeStatus(status);
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">{eventName}</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Your Uploaded Photos</p>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                realtimeStatus === 'SUBSCRIBED' ? 'bg-green-500' : 'bg-yellow-500'
              }`} />
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {realtimeStatus === 'SUBSCRIBED' ? 'Live' : 'Connecting...'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="max-w-4xl mx-auto px-4 mt-4">
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <p className="text-green-700 dark:text-green-300 text-center font-medium">
              ✅ {successMessage}
            </p>
          </div>
        </div>
      )}

      {/* Photos Grid */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {photos.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-purple-100 to-cyan-100 dark:from-purple-900/30 dark:to-cyan-900/30 rounded-full flex items-center justify-center">
              <span className="text-3xl">📸</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No photos yet
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Your uploaded photos will appear here in real-time
            </p>
            <Link 
              href={`/upload/${slug}`}
              className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              📱 Upload More Photos
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {photos.map((photo) => (
              <div key={photo.id} className="relative group">
                <div className="aspect-square overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800">
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
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="max-w-4xl mx-auto flex gap-3">
          <Link
            href={`/upload/${slug}`}
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg font-medium transition-colors text-center"
          >
            📸 Upload More
          </Link>
          <Link
            href={`/wall/${slug}`}
            className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white px-4 py-3 rounded-lg font-medium transition-colors text-center"
          >
            🖼️ View Wall
          </Link>
        </div>
      </div>
    </div>
  );
}
