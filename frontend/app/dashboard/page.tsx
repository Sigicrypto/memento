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
  photo_count?: number;
  custom_domain?: string;
}

export default function DashboardPage() {
  const { user, loading: authLoading, plan } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push('/auth'); return; }

    const fetchEvents = async () => {
      const { data: eventData } = await supabase.from('events').select('*')
        .eq('owner_id', user.id).order('created_at', { ascending: false });
      
      if (eventData) {
        // Fetch photo counts for each event
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

  const downloadPrintablePDF = async (event: Event) => {
    const uploadUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/upload/${event.slug}`;
    
    // Simple print functionality
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>${event.name} - Upload Guide</title>
            <style>
              body { font-family: Arial, sans-serif; text-align: center; padding: 40px; }
              h1 { color: #333; margin-bottom: 30px; font-size: 24px; }
              h2 { color: #666; margin-bottom: 20px; }
              .url { font-family: monospace; background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px auto; max-width: 500px; font-size: 14px; word-break: break-all; }
              .instructions { margin: 30px auto; max-width: 500px; text-align: left; }
              .instructions h3 { color: #333; margin-bottom: 15px; }
              .instructions ol { line-height: 1.6; }
              .border { border: 2px solid #9333ea; border-radius: 10px; padding: 30px; margin: 20px auto; max-width: 600px; }
              @media print { body { padding: 20px; } .border { margin: 0; } }
            </style>
          </head>
          <body>
            <div class="border">
              <h1>${event.name}</h1>
              <h2>Scan to Upload Photos</h2>
              <div class="url">${uploadUrl}</div>
              <div class="instructions">
                <h3>How to Upload:</h3>
                <ol>
                  <li>Open your phone camera</li>
                  <li>Point at the QR code on the wall</li>
                  <li>Tap the link that appears</li>
                  <li>Upload your photos!</li>
                </ol>
              </div>
            </div>
            <script>window.onload = () => window.print();</script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const updateSlug = async (eventId: string, newSlug: string) => {
    if (!confirm('Update the event slug? This will change all sharing links.')) return;
    
    try {
      const { error } = await supabase
        .from('events')
        .update({ slug: newSlug })
        .eq('id', eventId);
      
      if (error) throw error;
      
      // Refresh events
      const { data: eventData } = await supabase.from('events').select('*')
        .eq('owner_id', user!.id).order('created_at', { ascending: false });
      
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
    } catch (error) {
      alert('Failed to update slug. Please try again.');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-amber-900 to-gray-900">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8 rounded-2xl bg-gray-800/50 backdrop-blur-md border border-amber-500/20 p-6 sm:p-8 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-amber-500/10 border border-amber-500/20 text-amber-400 mb-3">
                Host Dashboard
              </div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-3xl font-bold text-white">My Events</h1>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                  plan === 'FREE' ? 'bg-gray-500/10 text-gray-400 border-gray-500/20' :
                  plan === 'PLUS' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                  plan === 'PREMIUM' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                  'bg-amber-500/10 text-amber-400 border-amber-500/20'
                }`}>
                  {plan} PLAN
                </span>
              </div>
              <p className="text-gray-400 text-sm">{events.length} event{events.length !== 1 ? 's' : ''}</p>
            </div>
            <Link href="/create" className="px-4 py-2 bg-gradient-to-r from-amber-500 to-rose-500 text-white font-semibold rounded-lg hover:from-amber-600 hover:to-rose-600 transition-all">
              ✨ Create New
            </Link>
          </div>
        </div>

        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-semibold text-white">Your walls</h2>
            <p className="text-xs text-gray-400">Manage sharing links, downloads, and moderation.</p>
          </div>
        </div>

        {events.length === 0 ? (
          <div className="bg-gray-800/50 backdrop-blur-md rounded-2xl p-16 text-center border border-amber-500/20">
            <div className="text-5xl mb-4">🎈</div>
            <h2 className="text-xl font-bold text-white mb-2">No Events Yet</h2>
            <p className="text-gray-400 text-sm mb-8">
              Create your first photo wall and start collecting memories!
            </p>
            <Link href="/create" className="px-6 py-3 bg-gradient-to-r from-amber-500 to-rose-500 text-white font-semibold rounded-lg hover:from-amber-600 hover:to-rose-600 transition-all">
              Create Your First Wall
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {events.map((event) => (
              <div key={event.id} className="bg-gray-800/50 backdrop-blur-md rounded-xl border border-gray-700 hover:border-amber-500/30 transition-all group">
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-white group-hover:text-amber-400 transition">
                        {event.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-gray-500 text-[10px]">
                          {new Date(event.created_at).toLocaleDateString()}
                        </p>
                        <span className="text-gray-600">•</span>
                        <p className="text-amber-400 text-[10px] font-semibold">
                          📸 {event.photo_count} photo{event.photo_count !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link href={`/dashboard/edit/${event.id}`} className="text-gray-400 hover:text-amber-400 transition text-sm p-1">
                        ⚙️
                      </Link>
                      <button onClick={() => handleDelete(event.id)}
                        className="text-gray-400 hover:text-red-400 transition text-sm p-1">
                        🗑️
                      </button>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Link href={`/wall/${event.slug}`}
                      className="flex-1 text-center text-xs font-medium py-2 px-3 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition">
                      🖼️ Wall
                    </Link>
                    <Link href={`/upload/${event.slug}`}
                      className="flex-1 text-center text-xs font-medium py-2 px-3 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition">
                      📱 Upload
                    </Link>
                    <Link href={`/moderate/${event.slug}`}
                      className="flex-1 text-center text-xs font-medium py-2 px-3 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 hover:bg-purple-500/20 transition">
                      🛡️ Moderate
                    </Link>
                  </div>
                  
                  {/* Enhanced Sharing Options */}
                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-medium text-gray-400">Sharing Options</span>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => downloadPrintablePDF(event)}
                        className="flex-1 text-center text-xs font-medium py-2 px-2 rounded-lg bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20 transition"
                      >
                        📄 PDF Guide
                      </button>
                      <button
                        onClick={() => {
                          const newSlug = prompt('Enter new slug:', event.slug);
                          if (newSlug && newSlug !== event.slug) {
                            updateSlug(event.id, newSlug);
                          }
                        }}
                        className="flex-1 text-center text-xs font-medium py-2 px-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition"
                      >
                        ✏️ Edit Slug
                      </button>
                      <button
                        onClick={() => {
                          const uploadUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/upload/${event.slug}`;
                          navigator.clipboard.writeText(uploadUrl);
                          alert('Upload link copied!');
                        }}
                        className="flex-1 text-center text-xs font-medium py-2 px-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 hover:bg-purple-500/20 transition"
                      >
                        📋 Copy Link
                      </button>
                    </div>
                    
                    {/* Custom Domain Display */}
                    {event.custom_domain && (
                      <div className="mt-3 text-xs text-gray-400">
                        <span className="font-medium">Custom Domain:</span> {event.custom_domain}
                      </div>
                    )}
                    
                    {/* Upload URL Display */}
                    <div className="mt-2 p-2 bg-gray-700/50 rounded-lg">
                      <p className="text-xs text-gray-400 font-mono break-all">
                        {typeof window !== 'undefined' ? `${window.location.origin}/upload/${event.slug}` : `/upload/${event.slug}`}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
