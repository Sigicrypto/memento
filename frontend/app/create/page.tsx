"use client";

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
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
      <div className="nm-page flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-lg">
          <div className="nm-card p-10 text-center">
            <div className="nm-badge mx-auto mb-5">✨ Wall Created!</div>
            <div className="text-5xl mb-4">🎉</div>
            <h1 className="text-3xl font-bold mb-2" style={{color:'#e2e8f0'}}>Wall Ready!</h1>
            <p className="text-sm mb-8" style={{color:'#7f849c'}}>Share this QR code with your guests</p>

            <div className="nm-inset p-5 inline-block mx-auto mb-6 rounded-2xl">
              <QRCodeSVG value={uploadUrl} size={200} bgColor="#1e2235" fgColor="#e2e8f0" />
            </div>

            <p className="text-xs mb-6 break-all font-mono" style={{color:'#7f849c'}}>{uploadUrl}</p>

            <div className="flex flex-col gap-3">
              <button onClick={() => navigator.clipboard.writeText(uploadUrl)} className="nm-btn w-full py-3">
                📋 Copy Link
              </button>
              <button onClick={() => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                const size = 400;
                canvas.width = size; canvas.height = size;
                if (!ctx) return;
                ctx.fillStyle = '#1e2235'; ctx.fillRect(0, 0, size, size);
                ctx.fillStyle = '#e2e8f0';
                const cellSize = 10; const modules = 37;
                for (let i = 0; i < modules; i++) for (let j = 0; j < modules; j++) {
                  if ((i + j) % 2 === 0 || (i < 7 && j < 7) || (i > modules - 8 && j < 7) || (i < 7 && j > modules - 8))
                    ctx.fillRect(i * cellSize, j * cellSize, cellSize, cellSize);
                }
                ctx.fillStyle = '#f59e0b'; ctx.font = '16px Arial'; ctx.textAlign = 'center';
                ctx.fillText(`Memento: ${createdSlug}`, size/2, size - 20);
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
    <div className="nm-page flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg">
        <div className="nm-card p-10">
          <div className="flex justify-center mb-4">
            <div className="nm-circle w-14 h-14 text-2xl">🎉</div>
          </div>
          <div className="text-center mb-5">
            <span className="nm-badge">Launch your event wall</span>
          </div>
          <h1 className="text-3xl font-bold text-center mb-1" style={{color:'#e2e8f0'}}>Create a Photo Wall</h1>
          <p className="text-sm text-center mb-6" style={{color:'#7f849c'}}>
            Name your event and get a QR code guests can scan to share photos.
          </p>

          {!user && (
            <div className="nm-inset p-3 mb-4 flex items-center gap-2 text-sm" style={{color:'#f59e0b'}}>
              <span>🔐</span> <a href="/auth" className="underline font-medium">Sign in</a> to create a wall.
            </div>
          )}

          <form onSubmit={handleCreate} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold mb-2" style={{color:'#7f849c'}}>Event Name</label>
              <input type="text" className="nm-input" value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. Sarah & Tom's Wedding" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold" style={{color:'#7f849c'}}>Custom Link (URL)</label>
                {plan === 'FREE' && (
                  <Link href="/pricing" className="text-[9px] font-bold" style={{color:'#f59e0b'}}>✨ UPGRADE</Link>
                )}
              </div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs pointer-events-none" style={{color:'#7f849c'}}>/upload/</span>
                <input type="text" className={`nm-input !pl-16 ${plan === 'FREE' ? 'opacity-50 cursor-not-allowed' : ''}`}
                  value={customSlug} disabled={plan === 'FREE'}
                  onChange={(e) => setCustomSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  placeholder={plan === 'FREE' ? 'Auto-generated' : 'my-cool-party'} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-2" style={{color:'#7f849c'}}>Guest Password <span style={{color:'#4a4f6a'}}>(optional)</span></label>
              <input type="password" className="nm-input" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Leave blank for open access…" />
            </div>

            {error && (
              <div className="nm-inset p-3 flex items-center gap-2 text-sm" style={{color:'#f472b6'}}>
                <span>⚠️</span> {error}
              </div>
            )}

            <button type="submit" className="nm-btn nm-btn-accent w-full py-3 font-bold" disabled={loading || !user}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                  Creating…
                </span>
              ) : '✨ Create Wall'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
