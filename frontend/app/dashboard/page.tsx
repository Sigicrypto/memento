"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import { createRoot } from 'react-dom/client';

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
    const { default: jsPDF } = await import('jspdf');
    const { default: html2canvas } = await import('html2canvas');

    const uploadUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/upload/${event.slug}`;
    
    // Create a temporary container for the PDF content
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '-9999px';
    document.body.appendChild(container);

    // Render the Tabletop Sign Template
    const root = createRoot(container);
    
    const TabletopTemplate = () => (
      <div id="tabletop-sign" style={{
        width: '1122px', // A4 Landscape at 96 DPI
        height: '794px',
        background: '#09090b',
        color: '#f4f4f5',
        display: 'flex',
        padding: '0',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        overflow: 'hidden',
        position: 'relative'
      }}>
        {/* Background Ambient Glows */}
        <div style={{position:'absolute', top:'-100px', left:'-100px', width:'400px', height:'400px', background:'radial-gradient(circle, rgba(147, 51, 234, 0.15) 0%, transparent 70%)', filter:'blur(50px)'}}></div>
        <div style={{position:'absolute', bottom:'-100px', right:'-100px', width:'500px', height:'500px', background:'radial-gradient(circle, rgba(37, 99, 235, 0.15) 0%, transparent 70%)', filter:'blur(60px)'}}></div>

        {/* Vertical Center Fold Line (Visual indicator for host) */}
        <div style={{position:'absolute', left:'50%', top:'10%', bottom:'10%', width:'1px', background:'rgba(255,255,255,0.05)', borderLeft:'1px dashed rgba(255,255,255,0.2)'}}></div>
        
        {/* Left Side - Instructions (Back of the stand) */}
        <div style={{flex:1, display:'flex', flexDirection:'column', justifyContent:'center', padding:'60px', borderRight:'1px solid rgba(255,255,255,0.03)'}}>
           <div style={{display:'inline-flex', padding:'8px 16px', borderRadius:'100px', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', fontSize:'12px', fontWeight:'700', color:'#a1a1aa', marginBottom:'24px', alignSelf:'flex-start'}}>
             STEP-BY-STEP GUIDE
           </div>
           <h2 style={{fontSize:'36px', fontWeight:'800', marginBottom:'40px', background:'linear-gradient(135deg, #fff 0%, #a1a1aa 100%)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent'}}>Capture every angle 📸</h2>
           <div style={{display:'flex', flexDirection:'column', gap:'32px'}}>
             {[
               { i: '1', t: 'Scan', d: 'Point your camera at the QR code on the front.' },
               { i: '2', t: 'Upload', d: 'Select your favorite photos or videos.' },
               { i: '3', t: 'See it live', d: 'Watch as your moments hit the big screen!' }
             ].map((step) => (
               <div key={step.i} style={{display:'flex', gap:'20px', alignItems:'flex-start'}}>
                 <div style={{width:'40px', height:'40px', borderRadius:'12px', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px', fontWeight:'800', color:'#9333ea', flexShrink:0}}>{step.i}</div>
                 <div>
                   <h4 style={{fontSize:'18px', fontWeight:'700', marginBottom:'4px', color:'#fff'}}>{step.t}</h4>
                   <p style={{fontSize:'14px', color:'#a1a1aa', lineHeight:'1.5'}}>{step.d}</p>
                 </div>
               </div>
             ))}
           </div>
           <div style={{marginTop:'auto', fontSize:'12px', color:'#71717a'}}>
             No apps to download. Pure magic. <span style={{color:'#9333ea', marginLeft:'8px'}}>memento.events</span>
           </div>
        </div>

        {/* Right Side - Call to Action (Front of the stand) */}
        <div style={{flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'60px', textAlign:'center'}}>
           <div style={{width:'100%', maxWidth:'400px'}}>
             <div style={{marginBottom:'24px'}}>
               <span style={{fontSize:'12px', fontWeight:'700', letterSpacing:'2px', color:'#9333ea', textTransform:'uppercase'}}>Welcome to</span>
               <h1 style={{fontSize:'48px', fontWeight:'800', marginTop:'8px', marginBottom:'40px', wordBreak:'break-word'}}>{event.name}</h1>
             </div>
             
             {/* QR Code Container */}
             <div style={{
               background: '#fff',
               padding: '24px',
               borderRadius: '32px',
               boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
               display: 'inline-block',
               marginBottom: '32px',
               position: 'relative'
             }}>
               <QRCodeSVG value={uploadUrl} size={240} level="H" />
             </div>

             <div style={{fontSize:'20px', fontWeight:'700', color:'#fff', marginBottom:'12px'}}>Scan to Upload</div>
             <div style={{fontSize:'14px', fontFamily:'monospace', color:'#71717a', background:'rgba(255,255,255,0.03)', padding:'8px 16px', borderRadius:'100px', display:'inline-block'}}>
               {uploadUrl.replace(/https?:\/\//, '')}
             </div>
           </div>
        </div>
      </div>
    );

    // Wait a moment for the content to render
    setTimeout(async () => {
      try {
        const element = document.getElementById('tabletop-sign');
        if (!element) throw new Error('Template not found');
        
        const canvas = await html2canvas(element, { 
          scale: 3, // Higher resolution
          useCORS: true,
          backgroundColor: '#09090b'
        });
        
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('l', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`${event.slug}-tabletop-sign.pdf`);
      } catch (err) {
        console.error('PDF Generation failed:', err);
        alert('Failed to generate PDF. Check console for details.');
      } finally {
        root.unmount();
        document.body.removeChild(container);
      }
    }, 1000);
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
    <div className="nm-page px-4 py-12 pb-40">
      {/* Confirm Dialog */}
      {confirmDialog.open && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center px-4" style={{background:'rgba(14,18,40,0.7)', backdropFilter:'blur(4px)'}}>
          <div className="nm-card p-8 max-w-md w-full text-center">
            <div className="text-3xl mb-4">⚠️</div>
            <p className="text-sm mb-6" style={{color:'var(--text1)'}}>{confirmDialog.message}</p>
            <div className="flex gap-3">
              <button onClick={closeConfirm} className="nm-btn flex-1 py-3 text-sm">Cancel</button>
              <button onClick={confirmDialog.onConfirm} className="nm-btn flex-1 py-3 text-sm font-bold" style={{color:'#f87171',background:'rgba(248,113,113,0.1)'}}>Delete</button>
            </div>
          </div>
        </div>
      )}
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="nm-card p-8 mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="nm-badge mb-3 text-[10px]">● Host Dashboard</div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold" style={{color:'var(--text1)'}}>My Events</h1>
                <span className="nm-badge text-[10px]">{plan}</span>
              </div>
              <p className="text-sm" style={{color:'var(--text2)'}}>{events.length} event{events.length !== 1 ? 's' : ''}</p>
            </div>
            <Link href="/create" className="nm-btn nm-btn-accent px-5 py-3 text-sm font-bold">✨ Create New</Link>
          </div>
        </div>

        <div className="mb-5">
          <h2 className="text-lg font-semibold mb-1" style={{color:'var(--text1)'}}>Your walls</h2>
          <p className="text-xs" style={{color:'var(--text2)'}}>Manage sharing links, downloads, and moderation.</p>
        </div>

        {events.length === 0 ? (
        <div className="nm-card p-12 text-center">
            <div className="text-3xl mb-4">🎈</div>
            <h2 className="text-xl font-bold mb-2" style={{color:'var(--text1)'}}>No Events Yet</h2>
            <p className="text-sm mb-6" style={{color:'var(--text2)'}}>Create your first photo wall and start collecting memories!</p>
            <Link href="/create" className="nm-btn nm-btn-accent px-6 py-3 text-sm font-bold">Create Your First Wall</Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {events.map((event) => (
              <div key={event.id} className="nm-card p-4 group">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-semibold transition-colors group-hover:text-[#f59e0b]" style={{color:'var(--text1)'}}>
                      {event.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-[10px]" style={{color:'var(--text2)'}}>{new Date(event.created_at).toLocaleDateString()}</p>
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
                  <p className="text-[10px] font-semibold mb-2" style={{color:'var(--text2)'}}>Sharing Options</p>
                  <div className="flex gap-2 flex-wrap mb-2">
                    <button onClick={() => downloadPrintablePDF(event)} className="nm-btn flex-1 text-[10px] py-1.5 px-2" style={{color:'#4ade80'}}>📄 PDF</button>
                    <button onClick={() => { const s = prompt('New slug:', event.slug); if (s && s !== event.slug) updateSlug(event.id, s); }} className="nm-btn flex-1 text-[10px] py-1.5 px-2" style={{color:'#60a5fa'}}>✏️ Slug</button>
                    <button onClick={() => { const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/upload/${event.slug}`; navigator.clipboard.writeText(url); alert('Copied!'); }} className="nm-btn flex-1 text-[10px] py-1.5 px-2" style={{color:'#a78bfa'}}>📋 Copy</button>
                  </div>
                  {event.custom_domain && <p className="text-[10px] mb-1" style={{color:'var(--text2)'}}><span className="font-medium">Domain:</span> {event.custom_domain}</p>}
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

