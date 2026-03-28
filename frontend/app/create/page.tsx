"use client";

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
import { useRef } from 'react';
import Link from 'next/link';

function generateSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    + '-' + Math.random().toString(36).substring(2, 7);
}

export default function CreateEventPage() {
  const { user, loading: authLoading, plan } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [customSlug, setCustomSlug] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [createdSlug, setCreatedSlug] = useState<string | null>(null);
  const [error, setError] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { router.push('/auth'); return; }
    setLoading(true);
    setError('');

    const slug = customSlug.trim() || generateSlug(name);
    
    // If custom slug provided, check if it's already taken
    if (customSlug) {
      const { data: existing } = await supabase.from('events').select('id').eq('slug', slug).single();
      if (existing) {
        setError('This custom link is already taken. Please try another.');
        setLoading(false);
        return;
      }
    }

    const { error: dbError } = await supabase.from('events').insert({
      name, slug, owner_id: user.id, created_at: new Date().toISOString(),
      password: password || null,
    });

    if (dbError) { setError(dbError.message); setLoading(false); return; }
    setCreatedSlug(slug);
    setLoading(false);
  };

  const uploadUrl = createdSlug
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/upload/${createdSlug}` : '';
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);

  if (authLoading) {
    return (
      <div className="nm-page flex items-center justify-center">
        <div className="nm-circle w-14 h-14">
          <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{borderColor:'#252c46',borderTopColor:'#f59e0b'}} />
        </div>
      </div>
    );
  }

  // ── Success: show QR ──
  if (createdSlug) {
    return (
    <div className="nm-page flex items-center justify-center px-4 py-12 pb-40">
        <div className="w-full max-w-md">
          <div className="nm-card p-8 text-center">
            <div className="nm-badge mx-auto mb-4 text-[10px]">✨ Wall Created!</div>
            <div className="text-3xl mb-3">🎉</div>
            <h1 className="text-2xl font-bold mb-1" style={{color:'#e2e8f0'}}>Wall Ready!</h1>
            <p className="text-sm mb-6" style={{color:'#7f849c'}}>Share this QR code with your guests</p>

            <div className="nm-inset p-4 inline-block mx-auto mb-6 rounded-2xl">
              <QRCodeSVG value={uploadUrl} size={160} bgColor="#1e2235" fgColor="#e2e8f0" />
            </div>
            <div style={{display:'none'}}>
              <QRCodeCanvas ref={qrCanvasRef} value={uploadUrl} size={600} bgColor="#ffffff" fgColor="#000000" />
            </div>

            <p className="text-[10px] mb-6 break-all font-mono" style={{color:'#7f849c'}}>{uploadUrl}</p>


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
              }} className="nm-btn w-full py-3">
                📱 Download QR Code
              </button>
              <button onClick={() => router.push(`/wall/${createdSlug}`)} className="nm-btn nm-btn-accent w-full py-3 font-bold">
                🖼️ Open Live Wall
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Form ──
  return (
    <div className="nm-page flex items-center justify-center px-4 py-12 pb-40">
      <div className="w-full max-w-md">
        <div className="nm-card p-8">
          <div className="flex justify-center mb-6">
            <div className="nm-circle w-16 h-16 text-2xl">🎉</div>
          </div>
          <div className="text-center mb-4">
            <span className="nm-badge px-4 py-1 text-[10px]">Launch your event wall</span>
          </div>
          <h1 className="text-2xl font-bold text-center mb-2" style={{color:'#e2e8f0'}}>Create a Photo Wall</h1>
          <p className="text-sm text-center mb-6 leading-relaxed max-w-xs mx-auto" style={{color:'#7f849c'}}>
            Name your event and get a QR code guests can scan to share photos.
          </p>

          {/* Sample Photo Gallery */}
          <div className="mb-8">
            <p className="text-xs text-center mb-4" style={{color:'#7f849c'}}>Sample Event Photos</p>
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
              <label className="block text-xs font-semibold ml-1" style={{color:'#e2e8f0'}}>Event Name</label>
              <input type="text" className="nm-input py-3 text-sm" value={name} onChange={(e) => setName(e.target.value)} placeholder="My Awesome Party…" required autoFocus />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between ml-1">
                <label className="text-xs font-semibold" style={{color:'#e2e8f0'}}>Custom Link (URL)</label>
                {plan === 'FREE' && (
                  <Link href="/pricing" className="text-xs font-bold px-3 py-1.5 rounded-full" style={{color:'#f59e0b',background:'rgba(245,158,11,0.1)'}}>✨ UPGRADE</Link>
                )}
              </div>
              <div className="relative">
                <span className="absolute left-7 top-1/2 -translate-y-1/2 text-base pointer-events-none" style={{color:'#7f849c'}}>/upload/</span>
                <input type="text" className={`nm-input py-3 text-sm !pl-20 ${plan === 'FREE' ? 'opacity-50 cursor-not-allowed' : ''}`}
                  value={customSlug} disabled={plan === 'FREE'}
                  onChange={(e) => setCustomSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  placeholder={plan === 'FREE' ? 'Auto-generated' : 'my-cool-party'} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold ml-1" style={{color:'#e2e8f0'}}>Guest Password <span style={{color:'#7f849c',fontWeight:'400'}}>(optional)</span></label>
              <input type="password" className="nm-input py-3 text-sm" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Leave blank for open access…" />
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
  );
}
