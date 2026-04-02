"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

interface Event {
  id: string;
  name: string;
  slug: string;
  theme_primary_color: string | null;
  theme_secondary_color: string | null;
  enable_safety_filter: boolean;
  expires_at: string | null;
  enable_ai_album: boolean;
  enable_smart_privacy: boolean;
  watermark_url: string | null;
  google_drive_sync_enabled: boolean;
  plan_type: string;
}

export default function EditEventPage() {
  const { user, isLoading } = useAuth();
  const params = useParams();
  const slug = params.slug as string;
  const router = useRouter();

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [name, setName] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#f59e0b');
  const [secondaryColor, setSecondaryColor] = useState('#f472b6');
  const [enableSafetyFilter, setEnableSafetyFilter] = useState(false);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [enableAiAlbum, setEnableAiAlbum] = useState(false);
  const [enableSmartPrivacy, setEnableSmartPrivacy] = useState(false);
  const [watermarkFile, setWatermarkFile] = useState<File | null>(null);
  const [watermarkPreview, setWatermarkPreview] = useState<string | null>(null);
  const [googleDriveSync, setGoogleDriveSync] = useState(false);

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.push('/system');
      return;
    }
    const isAdminUser = user.user_metadata?.role === 'admin' || user.email === 'sagarfalcon@gmail.com';
    if (!isAdminUser) {
      router.push('/system');
    } else {
      setIsAdmin(true);
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (!isAdmin || !slug) return;

    const fetchEvent = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error || !data) {
        console.error('Error fetching event');
        router.push('/admin');
      } else {
        setEvent(data);
        setName(data.name);
        setPrimaryColor(data.theme_primary_color || '#f59e0b');
        setSecondaryColor(data.theme_secondary_color || '#f472b6');
        setEnableSafetyFilter(data.enable_safety_filter || false);
        setExpiresAt(data.expires_at ? new Date(data.expires_at).toISOString().split('T')[0] : null);
        setEnableAiAlbum(data.enable_ai_album || false);
        setEnableSmartPrivacy(data.enable_smart_privacy || false);
        setWatermarkPreview(data.watermark_url || null);
        setGoogleDriveSync(data.google_drive_sync_enabled || false);
      }
      setLoading(false);
    };

    fetchEvent();
  }, [isAdmin, slug, router]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event) return;

    let watermarkUrl = event.watermark_url;
    if (watermarkFile) {
      const filePath = `watermarks/${event.id}`;
      const { error: uploadError } = await supabase.storage.from('photos').upload(filePath, watermarkFile, { upsert: true });
      if (uploadError) {
        alert('Failed to upload watermark: ' + uploadError.message);
        return;
      }
      watermarkUrl = supabase.storage.from('photos').getPublicUrl(filePath).data.publicUrl;
    }

    const { error } = await supabase
      .from('events')
      .update({
        name,
        theme_primary_color: primaryColor,
        theme_secondary_color: secondaryColor,
        enable_safety_filter: enableSafetyFilter,
        expires_at: expiresAt,
        enable_ai_album: enableAiAlbum,
        enable_smart_privacy: enableSmartPrivacy,
        watermark_url: watermarkUrl,
        google_drive_sync_enabled: googleDriveSync,
      })
      .eq('id', event.id);

    if (error) {
      alert('Failed to update event: ' + error.message);
    } else {
      alert('Event updated successfully!');
      router.push('/admin?tab=events');
    }
  };

  if (loading || isLoading || !isAdmin) {
    return <div className="nm-page flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="nm-page px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <Link href="/admin?tab=events" className="nm-btn text-sm">← Back to Events</Link>
        </div>
        <div className="nm-card p-8">
          <h1 className="text-2xl font-bold mb-6" style={{color: 'var(--text1)'}}>Edit Event: {event?.name}</h1>
          <form onSubmit={handleUpdate} className="space-y-6">
            <div>
              <label className="block text-xs font-semibold mb-2" style={{color:'var(--text2)'}}>Event Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} className="nm-input" />
            </div>
            {/* Branding - White Label Only */}
            <div className={`p-4 rounded-2xl ${event?.plan_type === 'WHITE_LABEL' ? 'nm-inset' : 'opacity-50 grayscale pointer-events-none'}`}>
              <div className="flex items-center justify-between mb-4">
                <label className="text-xs font-bold uppercase tracking-widest" style={{color:'var(--text2)'}}>🎨 Custom Branding</label>
                {event?.plan_type !== 'WHITE_LABEL' && <span className="nm-badge text-[10px] bg-amber-500/20 text-amber-500">Upgrade to White Label</span>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold mb-2" style={{color:'var(--text2)'}}>Primary Color</label>
                  <div className="flex items-center gap-2 nm-input p-2">
                    <input type="color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} className="w-8 h-8" disabled={event?.plan_type !== 'WHITE_LABEL'} />
                    <span className="text-xs">{primaryColor}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold mb-2" style={{color:'var(--text2)'}}>Secondary Color</label>
                  <div className="flex items-center gap-2 nm-input p-2">
                    <input type="color" value={secondaryColor} onChange={e => setSecondaryColor(e.target.value)} className="w-8 h-8" disabled={event?.plan_type !== 'WHITE_LABEL'} />
                    <span className="text-xs">{secondaryColor}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className={`p-4 rounded-2xl ${event?.plan_type === 'WHITE_LABEL' ? 'nm-inset' : 'opacity-50 grayscale pointer-events-none'}`}>
              <div className="flex items-center justify-between mb-4">
                <label className="text-xs font-bold uppercase tracking-widest" style={{color:'var(--text2)'}}>💧 Custom Watermark</label>
                {event?.plan_type !== 'WHITE_LABEL' && <span className="nm-badge text-[10px] bg-amber-500/20 text-amber-500">Locked</span>}
              </div>
              <input type="file" accept="image/png, image/jpeg" onChange={(e) => setWatermarkFile(e.target.files?.[0] || null)} className="nm-input text-xs" disabled={event?.plan_type !== 'WHITE_LABEL'} />
              {watermarkPreview && <img src={watermarkPreview} alt="Watermark preview" className="w-24 h-24 object-contain mt-4 mx-auto" />}
            </div>
            <div>
              <label className="flex items-center justify-between nm-input p-4">
                <span className="font-semibold text-sm" style={{color:'var(--text1)'}}>🛡️ Automatic Safety Filter</span>
                <div onClick={() => setEnableSafetyFilter(!enableSafetyFilter)} className={`w-12 h-6 rounded-full flex items-center transition-colors cursor-pointer ${enableSafetyFilter ? 'bg-green-400' : 'bg-gray-600'}`}>
                  <span className={`w-5 h-5 bg-white rounded-full transition-transform ${enableSafetyFilter ? 'translate-x-6' : 'translate-x-1'}`} />
                </div>
              </label>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-2" style={{color:'var(--text2)'}}>Expiration Date</label>
              <input type="date" value={expiresAt || ''} onChange={e => setExpiresAt(e.target.value)} className="nm-input" />
            </div>
            <div>
              <label className="flex items-center justify-between nm-input p-4">
                <span className="font-semibold text-sm" style={{color:'var(--text1)'}}>🤖 AI Auto Album</span>
                <div onClick={() => setEnableAiAlbum(!enableAiAlbum)} className={`w-12 h-6 rounded-full flex items-center transition-colors cursor-pointer ${enableAiAlbum ? 'bg-green-400' : 'bg-gray-600'}`}>
                  <span className={`w-5 h-5 bg-white rounded-full transition-transform ${enableAiAlbum ? 'translate-x-6' : 'translate-x-1'}`} />
                </div>
              </label>
            </div>
            <div>
              <label className="flex items-center justify-between nm-input p-4">
                <span className="font-semibold text-sm" style={{color:'var(--text1)'}}>🔒 Smart Privacy Downloads</span>
                <div onClick={() => setEnableSmartPrivacy(!enableSmartPrivacy)} className={`w-12 h-6 rounded-full flex items-center transition-colors cursor-pointer ${enableSmartPrivacy ? 'bg-green-400' : 'bg-gray-600'}`}>
                  <span className={`w-5 h-5 bg-white rounded-full transition-transform ${enableSmartPrivacy ? 'translate-x-6' : 'translate-x-1'}`} />
                </div>
              </label>
            </div>
            <div>
              <label className="flex items-center justify-between nm-input p-4">
                <span className="font-semibold text-sm" style={{color:'var(--text1)'}}>☁️ Google Drive Sync</span>
                <div onClick={() => setGoogleDriveSync(!googleDriveSync)} className={`w-12 h-6 rounded-full flex items-center transition-colors cursor-pointer ${googleDriveSync ? 'bg-green-400' : 'bg-gray-600'}`}>
                  <span className={`w-5 h-5 bg-white rounded-full transition-transform ${googleDriveSync ? 'translate-x-6' : 'translate-x-1'}`} />
                </div>
              </label>
            </div>
            <div>
              <button type="submit" className="nm-btn nm-btn-accent w-full py-3 font-bold">Save Changes</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
