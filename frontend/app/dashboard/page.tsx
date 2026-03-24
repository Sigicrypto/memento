"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Event {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push('/auth'); return; }

    const fetchEvents = async () => {
      const { data } = await supabase.from('events').select('*')
        .eq('owner_id', user.id).order('created_at', { ascending: false });
      if (data) setEvents(data);
      setLoading(false);
    };
    fetchEvents();
  }, [user, authLoading, router]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this event and all its photos?')) return;
    await supabase.from('events').delete().eq('id', id);
    setEvents((prev) => prev.filter((e) => e.id !== id));
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="aurora-bg min-h-screen">
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">My Events</h1>
            <p className="text-dark-text text-sm mt-1">{events.length} event{events.length !== 1 ? 's' : ''}</p>
          </div>
          <Link href="/create" className="btn-primary text-sm">
            ✨ Create New
          </Link>
        </div>

        {events.length === 0 ? (
          <div className="card text-center !p-16">
            <div className="text-5xl mb-4 float">🎈</div>
            <h2 className="text-xl font-bold mb-2">No Events Yet</h2>
            <p className="text-dark-text text-sm mb-8">
              Create your first photo wall and start collecting memories!
            </p>
            <Link href="/create" className="btn-primary">
              Create Your First Wall
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {events.map((event) => (
              <div key={event.id} className="card group">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-white group-hover:text-primary-light transition">{event.name}</h3>
                    <p className="text-dark-text/60 text-xs">
                      {new Date(event.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  <button onClick={() => handleDelete(event.id)}
                    className="text-dark-text/40 hover:text-red-400 transition text-sm p-1">
                    🗑️
                  </button>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Link href={`/wall/${event.slug}`}
                    className="flex-1 text-center text-xs font-medium py-2 px-3 rounded-lg bg-primary/10 text-primary-light border border-primary/15 hover:bg-primary/20 transition">
                    🖼️ Wall
                  </Link>
                  <Link href={`/upload/${event.slug}`}
                    className="flex-1 text-center text-xs font-medium py-2 px-3 rounded-lg bg-accent/10 text-accent border border-accent/15 hover:bg-accent/20 transition">
                    📱 Upload
                  </Link>
                  <Link href={`/moderate/${event.slug}`}
                    className="flex-1 text-center text-xs font-medium py-2 px-3 rounded-lg bg-accent2/10 text-accent2 border border-accent2/15 hover:bg-accent2/20 transition">
                    🛡️ Moderate
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
