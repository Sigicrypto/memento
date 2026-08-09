"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { hasFeature } from '@/lib/permissions';
import ProCamera from '@/components/ProCamera';

interface EventData {
  id: string;
  name: string;
  plan_type?: string;
  slug: string;
}

export default function EventCameraPage() {
  const params = useParams();
  const slug = params.slug as string;
  const router = useRouter();
  const { user, profile, isSuperAdmin } = useAuth();

  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      const { data, error } = await supabase
        .from('events')
        .select('id, name, plan_type, slug')
        .eq('slug', slug)
        .single();

      if (error || !data) {
        router.push('/');
        return;
      }
      setEvent(data as EventData);
      setLoading(false);
    };

    fetchEvent();
  }, [slug, router]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center text-white">
        <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs text-zinc-400 font-mono">Initializing Memento Pro Camera...</p>
      </div>
    );
  }

  // Check if Pro Camera feature is unlocked by user profile or event plan
  const userPlan = profile?.plan || 'starter';
  const eventPlan = event?.plan_type || 'starter';
  const userEmail = user?.email || profile?.email || null;

  const isProUser = isSuperAdmin || hasFeature(userPlan, 'PRO_CAMERA', userEmail) || hasFeature(eventPlan, 'PRO_CAMERA', userEmail);

  return (
    <ProCamera 
      eventId={event?.id}
      eventSlug={event?.slug}
      eventName={event?.name}
      isProUser={isProUser}
      onClose={() => router.push(`/mobile/${slug}`)}
      onPhotoUploaded={() => {
        router.push(`/mobile/${slug}`);
      }}
    />
  );
}
