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
    <div className="aurora-bg min-h-screen">
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-bold">My Events</h1>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                plan === 'FREE' ? 'bg-gray-500/10 text-gray-400 border-gray-500/20' :
                plan === 'PLUS' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                plan === 'PREMIUM' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                'bg-amber-500/10 text-amber-400 border-amber-500/20'
              }`}>
                {plan} PLAN
              </span>
            </div>
            <p className="text-dark-text text-sm">{events.length} event{events.length !== 1 ? 's' : ''}</p>
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
                    <h3 className="text-lg font-semibold text-white group-hover:text-primary-light transition">
                      {event.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-dark-text/60 text-[10px]">
                        {new Date(event.created_at).toLocaleDateString()}
                      </p>
                      <span className="text-dark-text/30">•</span>
                      <p className="text-primary-light text-[10px] font-semibold">
                        📸 {event.photo_count} photo{event.photo_count !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/dashboard/edit/${event.id}`} className="text-dark-text/40 hover:text-white transition text-sm p-1">
                      ⚙️
                    </Link>
                    <button onClick={() => handleDelete(event.id)}
                      className="text-dark-text/40 hover:text-red-400 transition text-sm p-1">
                      🗑️
                    </button>
                  </div>
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
                
                {/* Enhanced Sharing Options */}
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Sharing Options</span>
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
                    <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                      <span className="font-medium">Custom Domain:</span> {event.custom_domain}
                    </div>
                  )}
                  
                  {/* Upload URL Display */}
                  <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-mono break-all">
                      {typeof window !== 'undefined' ? `${window.location.origin}/upload/${event.slug}` : `/upload/${event.slug}`}
                    </p>
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
