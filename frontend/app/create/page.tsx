"use client";

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
import jsPDF from 'jspdf';
import Link from 'next/link';
import '../landing.css';

function generateSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    + '-' + Math.random().toString(36).substring(2, 7);
}

export default function CreateEventPage() {
  const { user, profile, isLoading, plan, isPaid, isApproved } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [customSlug, setCustomSlug] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [createdSlug, setCreatedSlug] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isLoading) return;
    if (!user) { router.push('/'); return; }
    if (!isApproved) { router.push('/pending'); return; }
  }, [user, isLoading, isApproved, router]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("[create] user:", user?.id);
    console.log("[create] name:", name);
    console.log("[create] customSlug:", customSlug);
    
    if (!user) { console.log("[create] no user, redirecting to auth"); router.push('/auth'); return; }
    if (!isApproved) { router.push('/pending'); return; }
    if (!isPaid) { router.push('/dashboard'); return; }
    setLoading(true);
    setError('');

    const slug = customSlug.trim() || generateSlug(name);
    console.log("[create] final slug:", slug);
    
    // If custom slug provided, check if it's already taken
    if (customSlug) {
      console.log("[create] checking custom slug availability");
      const { data: existing, error: checkError } = await supabase.from('events').select('id').eq('slug', slug).single();
      console.log("[create] slug check result:", { existing, checkError });
      if (existing) {
        setError('This custom link is already taken. Please try another.');
        setLoading(false);
        return;
      }
    }

    console.log("[create] inserting event:", { name, slug, owner_id: user.id, owner_email: user.email });
    const { error: dbError } = await supabase.from('events').insert({
      name, slug, owner_id: user.id, owner_email: user.email, created_at: new Date().toISOString(),
      password: password || null,
      plan_type: (plan || 'STARTER').toUpperCase(),
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    });

    console.log("[create] insert error:", dbError);
    if (dbError) { setError(dbError.message); setLoading(false); return; }
    
    setCreatedSlug(slug);
    console.log("[create] created slug:", slug);
    const uploadUrl = createdSlug
      ? `${typeof window !== 'undefined' ? window.location.origin : ''}/mobile/${createdSlug}` : '';
    console.log("[create] upload URL:", uploadUrl);
    
    setLoading(false);
  };

  const uploadUrl = createdSlug
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/mobile/${createdSlug}` : '';
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);

  if (isLoading) {
    return (
      <div className="lp" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="orbs"><div className="orb orb1" /><div className="orb orb2" /><div className="orb orb3" /></div>
        <div className="grain" />
        <div style={{ width: 40, height: 40, border: '3px solid rgba(245,158,11,0.2)', borderTopColor: '#f59e0b', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // ── Success: show QR ──
  if (createdSlug) {
    return (
    <div className="lp" style={{ minHeight: '100vh', paddingTop: '140px' }}>
      <div className="orbs"><div className="orb orb1" /><div className="orb orb2" /><div className="orb orb3" /></div>
      <div className="grain" />
      <div className="flex items-center justify-center px-4 py-12 pb-40">
        <div className="w-full max-w-md">
          <div className="nm-card p-8 text-center">
            <div className="nm-badge mx-auto mb-4 text-[10px]">✨ Wall Created!</div>
            <div className="text-3xl mb-3">🎉</div>
            <h1 className="text-2xl font-bold mb-1" style={{color:'var(--text1)'}}>Wall Ready!</h1>
            <p className="text-sm mb-6" style={{color:'var(--text2)'}}>Share this QR code with your guests</p>

            <div className="nm-inset p-4 inline-block mx-auto mb-6 rounded-2xl">
              <QRCodeSVG value={uploadUrl} size={160} bgColor="var(--surface)" fgColor="var(--text1)" />
            </div>
            <div style={{display:'none'}}>
              <QRCodeCanvas ref={qrCanvasRef} value={uploadUrl} size={600} bgColor="#ffffff" fgColor="#000000" />
            </div>

            <p className="text-[10px] mb-6 break-all font-mono" style={{color:'var(--text2)'}}>{uploadUrl}</p>


            <div className="flex flex-col gap-3">
              <button onClick={() => navigator.clipboard.writeText(uploadUrl)} className="nm-btn w-full py-3">
                📋 Copy Link
              </button>
              <button onClick={() => {
                const canvas = qrCanvasRef.current;
                if (!canvas) return;
                canvas.toBlob((blob) => {
                  if (blob) { const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `memento-${createdSlug}-qr.png`; a.click(); URL.revokeObjectURL(url); }
                });
              }} className="nm-btn w-full py-3" style={{ background: 'rgba(255,255,255,0.05)' }}>
                🖼️ Save QR Image
              </button>
              <button 
                onClick={async () => {
                  const qrCanvas = qrCanvasRef.current;
                  if (!qrCanvas) return;
                  const qrDataUrl = qrCanvas.toDataURL('image/png');
                  
                  const container = document.createElement('div');
                  container.style.width = '794px';
                  container.style.height = '1123px';
                  container.style.background = '#0a0a0c'; // Midnight theme
                  container.style.color = '#fff';
                  container.style.display = 'flex';
                  container.style.flexDirection = 'column';
                  container.style.alignItems = 'center';
                  container.style.justifyContent = 'center';
                  container.style.padding = '40px';
                  container.style.fontFamily = 'system-ui, sans-serif';
                  container.style.position = 'fixed';
                  container.style.left = '-9999px';
                  container.style.top = '0';
                  
                  container.innerHTML = `
                    <div style="flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; width: 100%; border: 2px solid rgba(255,255,255,0.1); border-radius: 40px; padding: 60px; box-sizing: border-box; background: linear-gradient(180deg, rgba(20,20,26,0.6) 0%, rgba(10,10,12,0.8) 100%);">
                      <h1 style="font-size: 64px; font-weight: 900; background: linear-gradient(135deg, #06b6d4, #ec4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 24px; text-align: center; line-height: 1.2;">
                        ${name || 'Event Photo Wall'}
                      </h1>
                      <p style="font-size: 28px; color: #94a3b8; font-weight: 500; margin-bottom: 80px; text-align: center; max-width: 600px; line-height: 1.4;">
                        Point your phone's camera at the code below to share your favorite moments with everyone!
                      </p>
                      
                      <div style="background: white; padding: 48px; border-radius: 36px; margin-bottom: 80px; box-shadow: 0 40px 100px rgba(0,0,0,0.8);">
                          <img src="${qrDataUrl}" style="width: 400px; height: 400px; display: block;" />
                      </div>
                      
                      <h2 style="font-size: 42px; font-weight: 800; margin-bottom: 16px; color: #f8fafc;">Scan to Join</h2>
                      <p style="font-size: 24px; color: #64748b; font-family: monospace; letter-spacing: 1px;">${uploadUrl}</p>
                      
                      <div style="margin-top: auto; padding-top: 40px;">
                         <p style="font-size: 16px; color: #475569; font-weight: 600; text-transform: uppercase; letter-spacing: 3px;">Powered by Memento</p>
                      </div>
                    </div>
                  `;
                  
                  document.body.appendChild(container);
                  
                  try {
                    const html2canvas = (await import('html2canvas')).default;
                    const canvas = await html2canvas(container, { scale: 2 });
                    const imgData = canvas.toDataURL('image/jpeg', 0.95);
                    
                    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
                    doc.addImage(imgData, 'JPEG', 0, 0, 210, 297);
                    doc.save(`Memento-Sign-${createdSlug}.pdf`);
                  } catch (err) {
                    console.error('PDF generation failed:', err);
                    alert('Failed to generate PDF. Please use the Save QR Image button instead.');
                  } finally {
                    document.body.removeChild(container);
                  }
                }} 
                className="nm-btn w-full py-3 border-amber-500/30 text-amber-500 font-bold hover:bg-amber-500/10 transition-colors"
                title="Download an A4 poster for your event tables"
              >
                🖨️ Download Printable Sign (PDF)
              </button>
              <button onClick={() => router.push(`/wall/${createdSlug}`)} className="nm-btn nm-btn-accent w-full py-3 font-bold">
                🖼️ Open Live Wall
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    );
  }

  // ── Form ──
  return (
    <div className="lp" style={{ minHeight: '100vh', paddingTop: '140px' }}>
      <div className="orbs"><div className="orb orb1" /><div className="orb orb2" /><div className="orb orb3" /></div>
      <div className="grain" />
      <div className="flex items-center justify-center px-4 py-12 pb-40">
      <div className="w-full max-w-md">
        <div className="nm-card p-8">
          <div className="flex justify-center mb-6">
            <div className="nm-circle w-16 h-16 text-2xl">🎉</div>
          </div>
          <div className="text-center mb-4">
            <span className="nm-badge px-4 py-1 text-[10px]">Launch your event wall</span>
          </div>
          <h1 className="text-2xl font-bold text-center mb-2" style={{color:'var(--text1)'}}>Create a Photo Wall</h1>
          <p className="text-sm text-center mb-6 leading-relaxed max-w-xs mx-auto" style={{color:'var(--text2)'}}>
            Name your event and get a QR code guests can scan to share photos.
          </p>

          {/* Sample Photo Gallery */}
          <div className="mb-8">
            <p className="text-xs text-center mb-4" style={{color:'var(--text2)'}}>Sample Event Photos</p>
            <div className="grid grid-cols-3 gap-2">
              <div className="nm-inset p-1 rounded-lg">
                <img src="/sample-photos/birthday-party.jpg" alt="Birthday Party" className="w-full h-16 object-cover rounded" />
              </div>
              <div className="nm-inset p-1 rounded-lg">
                <img src="/sample-photos/wedding-day.jpg" alt="Wedding" className="w-full h-16 object-cover rounded" />
              </div>
              <div className="nm-inset p-1 rounded-lg">
                <img src="/sample-photos/corporate-event.jpg" alt="Corporate Event" className="w-full h-16 object-cover rounded" />
              </div>
              <div className="nm-inset p-1 rounded-lg">
                <img src="/sample-photos/graduation-day.jpg" alt="Graduation" className="w-full h-16 object-cover rounded" />
              </div>
              <div className="nm-inset p-1 rounded-lg">
                <img src="/sample-photos/family-reunion.jpg" alt="Family Reunion" className="w-full h-16 object-cover rounded" />
              </div>
              <div className="nm-inset p-1 rounded-lg">
                <img src="/sample-photos/music-festival.jpg" alt="Music Festival" className="w-full h-16 object-cover rounded" />
              </div>
            </div>
          </div>

          {!user && (
            <div className="nm-inset p-4 mb-8 flex items-center justify-center gap-3 text-sm" style={{color:'#f59e0b'}}>
              <span className="text-lg">🔐</span> <a href="/auth" className="underline font-bold hover:text-amber-300 transition-colors">Sign in</a> to create a wall.
            </div>
          )}

          <form onSubmit={handleCreate} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-xs font-semibold ml-1" style={{color:'var(--text1)'}}>Event Name</label>
              <input type="text" className="nm-input py-3 text-sm" value={name} onChange={(e) => setName(e.target.value)} placeholder="My Awesome Party…" required autoFocus />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between ml-1">
                <label className="text-xs font-semibold" style={{color:'var(--text1)'}}>Custom Link (URL)</label>
                {plan === 'starter' && (
                  <Link href="/#pricing" className="text-xs font-bold px-3 py-1.5 rounded-full" style={{color:'#f59e0b',background:'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)'}}>✨ Upgrade to Standard</Link>
                )}
              </div>
              <div className="relative">
                <span className="absolute left-7 top-1/2 -translate-y-1/2 text-base pointer-events-none" style={{color:'var(--text2)'}}>/mobile/</span>
                <input type="text" className={`nm-input py-3 text-sm !pl-20 ${plan === 'starter' ? 'opacity-50' : ''}`}
                  value={customSlug} disabled={plan === 'starter'}
                  onChange={(e) => setCustomSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  placeholder={plan === 'starter' ? 'Standard Plan required' : 'my-cool-party'} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold ml-1" style={{color:'var(--text1)'}}>Guest Password <span style={{color:'var(--text2)',fontWeight:'400'}}>(optional)</span></label>
              <input type="password" className="nm-input py-3 text-sm" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Leave blank for open access…" />
            </div>

            {/* Premium Features Upsell */}
            <div className="nm-inset p-6 rounded-3xl space-y-5 bg-white/5 border border-white/5">
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-black uppercase tracking-widest" style={{color:'var(--text2)'}}>Premium Experience</h3>
                {(plan === 'starter' || !plan) && (
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-500 border border-amber-500/20">LOCKED</span>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4">
                {/* Feature: Slideshow Music */}
                <div className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${plan === 'starter' ? 'opacity-40 grayscale-[0.5] border-transparent' : 'border-white/5 bg-white/5'}`}>
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🎵</span>
                    <div>
                      <p className="text-xs font-bold" style={{color:'var(--text1)'}}>Cinematic Music</p>
                      <p className="text-[10px]" style={{color:'var(--text2)'}}>Curated tracks for your wall</p>
                    </div>
                  </div>
                  {plan === 'starter' && <span className="text-[9px] font-black text-amber-500/80">STANDARD+</span>}
                </div>

                {/* Feature: Video Uploads */}
                <div className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${plan === 'starter' ? 'opacity-40 grayscale-[0.5] border-transparent' : 'border-white/5 bg-white/5'}`}>
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🎬</span>
                    <div>
                      <p className="text-xs font-bold" style={{color:'var(--text1)'}}>Video Support</p>
                      <p className="text-[10px]" style={{color:'var(--text2)'}}>Capture motion & sound</p>
                    </div>
                  </div>
                  {plan === 'starter' && <span className="text-[9px] font-black text-rose-500/80">PREMIUM+</span>}
                </div>

                {/* Feature: Watermark Removal */}
                <div className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${plan !== 'whitelabel' ? 'opacity-40 grayscale-[0.5] border-transparent' : 'border-white/5 bg-white/5'}`}>
                  <div className="flex items-center gap-3">
                    <span className="text-xl">✨</span>
                    <div>
                      <p className="text-xs font-bold" style={{color:'var(--text1)'}}>White Label</p>
                      <p className="text-[10px]" style={{color:'var(--text2)'}}>Remove all Memento branding</p>
                    </div>
                  </div>
                  {plan !== 'whitelabel' && <span className="text-[9px] font-black text-indigo-500/80">PARTNER</span>}
                </div>
              </div>

              {(plan === 'starter' || !plan) && (
                <Link href="/#pricing" className="block text-center p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] font-bold text-amber-500 hover:bg-amber-500/20 transition-all">
                  ✨ SCALE TO UNLOCK PREMIUM FEATURES
                </Link>
              )}
            </div>

            {error && (
              <div className="nm-inset p-4 flex items-center gap-3 text-sm" style={{color:'#f472b6'}}>
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <button type="submit" className="nm-btn nm-btn-accent w-full py-4 font-bold text-lg shadow-xl mt-4 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]" disabled={loading || !user}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-5 h-5 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                  Creating Wall…
                </span>
              ) : '✨ Create Photo Wall'}
            </button>
          </form>
        </div>
      </div>
      </div>
    </div>
  );
}

