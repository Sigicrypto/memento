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
  const [confirmDialog, setConfirmDialog] = useState<{open: boolean; message: string; onConfirm: () => void}>({open: false, message: '', onConfirm: () => {}});

  const showConfirm = (message: string, onConfirm: () => void) => setConfirmDialog({open: true, message, onConfirm});
  const closeConfirm = () => setConfirmDialog(prev => ({...prev, open: false}));

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

  const handleDelete = (id: string) => {
    showConfirm('Delete this event and all its photos?', async () => {
      await supabase.from('events').delete().eq('id', id);
      setEvents((prev) => prev.filter((e) => e.id !== id));
      closeConfirm();
    });
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
    if (!newSlug) return;
    
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
      <div className="nm-page flex items-center justify-center">
        <div className="nm-circle w-14 h-14">
          <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{borderColor:'#252c46',borderTopColor:'#f59e0b'}} />
        </div>
      </div>
    );
  }

  return (
    <div className="nm-page">
      {/* Confirm Dialog */}
      {confirmDialog.open && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center px-4" style={{background:'rgba(14,18,40,0.7)', backdropFilter:'blur(4px)'}}>
          <div className="nm-card p-8 max-w-sm w-full text-center">
            <div className="text-3xl mb-4">⚠️</div>
            <p className="text-sm mb-6" style={{color:'#e2e8f0'}}>{confirmDialog.message}</p>
            <div className="flex gap-3">
              <button onClick={closeConfirm} className="nm-btn flex-1 py-2.5 text-sm">Cancel</button>
              <button onClick={confirmDialog.onConfirm} className="nm-btn flex-1 py-2.5 text-sm font-bold" style={{color:'#f87171',background:'rgba(248,113,113,0.1)'}}>Delete</button>
            </div>
          </div>
        </div>
      )}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="nm-card p-6 sm:p-8 mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="nm-badge mb-3">● Host Dashboard</div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-3xl font-bold" style={{color:'#e2e8f0'}}>My Events</h1>
                <span className="nm-badge">{plan}</span>
              </div>
              <p className="text-sm" style={{color:'#7f849c'}}>{events.length} event{events.length !== 1 ? 's' : ''}</p>
            </div>
            <Link href="/create" className="nm-btn nm-btn-accent px-5 py-2.5 text-sm font-bold">✨ Create New</Link>
          </div>
        </div>

        <div className="mb-5">
          <h2 className="text-lg font-semibold mb-1" style={{color:'#e2e8f0'}}>Your walls</h2>
          <p className="text-xs" style={{color:'#7f849c'}}>Manage sharing links, downloads, and moderation.</p>
        </div>

        {events.length === 0 ? (
          <div className="nm-card p-16 text-center">
            <div className="text-5xl mb-4">🎈</div>
            <h2 className="text-xl font-bold mb-2" style={{color:'#e2e8f0'}}>No Events Yet</h2>
            <p className="text-sm mb-8" style={{color:'#7f849c'}}>Create your first photo wall and start collecting memories!</p>
            <Link href="/create" className="nm-btn nm-btn-accent px-6 py-3 font-bold">Create Your First Wall</Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {events.map((event) => (
              <div key={event.id} className="nm-card p-4 group">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-semibold transition-colors group-hover:text-[#f59e0b]" style={{color:'#e2e8f0'}}>
                      {event.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-[10px]" style={{color:'#7f849c'}}>{new Date(event.created_at).toLocaleDateString()}</p>
                      <span style={{color:'#4a4f6a'}}>•</span>
                      <p className="text-[10px] font-semibold" style={{color:'#f59e0b'}}>📸 {event.photo_count} photo{event.photo_count !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Link href={`/dashboard/edit/${event.id}`} className="nm-circle w-8 h-8 text-sm">⚙️</Link>
                    <button onClick={() => handleDelete(event.id)} className="nm-circle w-8 h-8 text-sm">🗑️</button>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap mb-3">
                  <Link href={`/wall/${event.slug}`} className="nm-btn flex-1 text-center text-xs py-2 px-3" style={{color:'#f59e0b'}}>🖼️ Wall</Link>
                  <Link href={`/upload/${event.slug}`} className="nm-btn flex-1 text-center text-xs py-2 px-3" style={{color:'#f472b6'}}>📱 Upload</Link>
                  <Link href={`/moderate/${event.slug}`} className="nm-btn flex-1 text-center text-xs py-2 px-3" style={{color:'#a78bfa'}}>🛡️ Moderate</Link>
                </div>

                {/* Sharing Options */}
                <div className="nm-inset p-3">
                  <p className="text-[10px] font-semibold mb-2" style={{color:'#7f849c'}}>Sharing Options</p>
                  <div className="flex gap-2 flex-wrap mb-2">
                    <button onClick={() => downloadPrintablePDF(event)} className="nm-btn flex-1 text-[10px] py-1.5 px-2" style={{color:'#4ade80'}}>📄 PDF</button>
                    <button onClick={() => { const s = prompt('New slug:', event.slug); if (s && s !== event.slug) updateSlug(event.id, s); }} className="nm-btn flex-1 text-[10px] py-1.5 px-2" style={{color:'#60a5fa'}}>✏️ Slug</button>
                    <button onClick={() => { const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/upload/${event.slug}`; navigator.clipboard.writeText(url); alert('Copied!'); }} className="nm-btn flex-1 text-[10px] py-1.5 px-2" style={{color:'#a78bfa'}}>📋 Copy</button>
                  </div>
                  {event.custom_domain && <p className="text-[10px] mb-1" style={{color:'#7f849c'}}><span className="font-medium">Domain:</span> {event.custom_domain}</p>}
                  <p className="text-[10px] font-mono break-all" style={{color:'#4a4f6a'}}>
                    {typeof window !== 'undefined' ? `${window.location.origin}/upload/${event.slug}` : `/upload/${event.slug}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
