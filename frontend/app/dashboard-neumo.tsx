"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import '../styles/neumorphic.css';

interface Event {
  id: string;
  name: string;
  slug: string;
  created_at: string;
  photo_count?: number;
  custom_domain?: string;
}

export default function NeumorphicDashboardPage() {
  const { user, loading: authLoading, plan } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push('/auth-neumo'); return; }

    const fetchEvents = async () => {
      const { data: eventData } = await supabase.from('events').select('*')
        .eq('owner_id', user.id).order('created_at', { ascending: false });
      
      if (eventData) {
        const eventsWithCounts = await Promise.all(eventData.map(async (event) => {
          const { count } = await supabase
            .from('photos')
            .select('*', { count: 'exact', head: true })
            .eq('event_id', event.id);
          return { ...event, photo_count: count || 0 };
        }));
        setEvents(eventsWithCounts);
      }
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
      <div className="neumo-dark min-h-screen flex items-center justify-center">
        <div className="neumo-icon neumo-icon-dark w-16 h-16">
          <div className="w-8 h-8 border-2 border-gray-400 border-t-gray-200 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="neumo-dark min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 py-4 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/page-neumo" className="flex items-center gap-2">
                <div className="neumo-icon neumo-icon-dark w-10 h-10">
                  📷
                </div>
                <span className="text-xl font-bold text-gray-200">Memento</span>
              </Link>
            </div>
            
            <div className="flex items-center gap-4">
              <Link href="/pricing" className="text-gray-400 hover:text-gray-200 transition-colors">Pricing</Link>
              <Link href="/demo" className="text-gray-400 hover:text-gray-200 transition-colors">Demo</Link>
              <button 
                onClick={() => { supabase.auth.signOut(); router.push('/auth-neumo'); }}
                className="neumo-btn neumo-btn-dark px-4 py-2"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-20 px-6 pb-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="neumo-container neumo-container-dark mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-400 mb-4">
                  Host Dashboard
                </div>
                <h1 className="text-3xl font-bold text-gray-200 mb-2">My Events</h1>
                <p className="text-gray-400">
                  {events.length} event{events.length !== 1 ? 's' : ''} • {plan} plan
                </p>
              </div>
              <Link href="/create" className="neumo-btn neumo-btn-dark px-6 py-3 font-semibold bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                ✨ Create New
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
            <div className="neumo-card neumo-card-dark p-6 text-center">
              <div className="neumo-icon neumo-icon-dark w-16 h-16 mx-auto mb-4">
                🎉
              </div>
              <h3 className="text-2xl font-bold text-gray-200">{events.length}</h3>
              <p className="text-gray-400 text-sm">Total Events</p>
            </div>
            <div className="neumo-card neumo-card-dark p-6 text-center">
              <div className="neumo-icon neumo-icon-dark w-16 h-16 mx-auto mb-4">
                📸
              </div>
              <h3 className="text-2xl font-bold text-gray-200">
                {events.reduce((sum, e) => sum + (e.photo_count || 0), 0)}
              </h3>
              <p className="text-gray-400 text-sm">Total Photos</p>
            </div>
            <div className="neumo-card neumo-card-dark p-6 text-center">
              <div className="neumo-icon neumo-icon-dark w-16 h-16 mx-auto mb-4">
                💎
              </div>
              <h3 className="text-2xl font-bold text-gray-200">{plan}</h3>
              <p className="text-gray-400 text-sm">Current Plan</p>
            </div>
          </div>

          {/* Events Grid */}
          {events.length === 0 ? (
            <div className="neumo-container neumo-container-dark text-center py-16">
              <div className="neumo-icon neumo-icon-dark w-24 h-24 text-5xl mx-auto mb-6 neumo-float">
                🎈
              </div>
              <h2 className="text-2xl font-bold text-gray-200 mb-4">No Events Yet</h2>
              <p className="text-gray-400 mb-8">
                Create your first photo wall and start collecting memories!
              </p>
              <Link href="/create" className="neumo-btn neumo-btn-dark px-8 py-4 font-semibold bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                Create Your First Wall
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <div key={event.id} className="neumo-card neumo-card-dark p-6 hover:scale-105 transition-transform">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-200 mb-1">{event.name}</h3>
                      <p className="text-gray-400 text-sm">
                        {new Date(event.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/dashboard/edit/${event.id}`} className="neumo-icon neumo-icon-dark w-8 h-8 text-sm">
                        ⚙️
                      </Link>
                      <button 
                        onClick={() => handleDelete(event.id)}
                        className="neumo-icon neumo-icon-dark w-8 h-8 text-sm hover:bg-red-500/20"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 mb-6">
                    <div className="neumo-icon neumo-icon-dark w-12 h-12">
                      📸
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-200">{event.photo_count}</p>
                      <p className="text-gray-400 text-sm">Photos</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <Link href={`/wall/${event.slug}`} className="neumo-btn neumo-btn-dark w-full py-2 text-sm">
                      🖼️ View Wall
                    </Link>
                    <Link href={`/upload/${event.slug}`} className="neumo-btn neumo-btn-dark w-full py-2 text-sm">
                      📱 Upload
                    </Link>
                    <Link href={`/moderate/${event.slug}`} className="neumo-btn neumo-btn-dark w-full py-2 text-sm">
                      🛡️ Moderate
                    </Link>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <p className="text-gray-400 text-xs font-mono break-all">
                      /upload/{event.slug}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
