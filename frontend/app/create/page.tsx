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
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  // ── Success: show QR ──
  if (createdSlug) {
    return (
      <div className="aurora-bg min-h-[90vh] flex items-center justify-center px-4 py-10">
        <div className="relative z-10 w-full max-w-lg">
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-primary/20 to-accent/20 blur-xl pointer-events-none" />
          <div className="card relative !p-10 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-purple-500/10 border border-purple-500/20 text-purple-500 mb-5">
              Signature Experience
            </div>
            <div className="text-5xl mb-4">🎉</div>
            <h1 className="text-3xl font-bold mb-2">Wall Created!</h1>
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-8">Share this QR code with your guests</p>

            <div className="bg-white p-5 rounded-2xl inline-block mx-auto mb-6 glow-purple">
              <QRCodeSVG value={uploadUrl} size={200} />
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-300/80 mb-6 break-all font-mono">{uploadUrl}</p>

            <div className="flex flex-col gap-3">
              <button onClick={() => navigator.clipboard.writeText(uploadUrl)} className="btn-secondary w-full">
                📋 Copy Link
              </button>
              <button onClick={() => router.push(`/wall/${createdSlug}`)} className="btn-primary w-full">
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
    <div className="aurora-bg min-h-[90vh] flex items-center justify-center px-4 py-10">
      <div className="relative z-10 w-full max-w-lg">
        <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-primary/15 to-accent/10 blur-xl pointer-events-none" />
        <div className="card relative !p-10">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent2 flex items-center justify-center text-2xl glow-purple">
              🎉
            </div>
          </div>
          <div className="text-center mb-5">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-purple-500/10 border border-purple-500/20 text-purple-500">
              Launch your event wall
            </span>
          </div>

          <h1 className="text-3xl font-bold text-center mb-1">Create a Photo Wall</h1>
          <p className="text-gray-600 dark:text-gray-300 text-sm text-center mb-6">
            Name your event and get a QR code guests can scan to share photos.
          </p>

          {!user && (
            <div className="flex items-center gap-2 text-primary-light text-sm bg-primary/10 border border-primary/15 p-3 rounded-xl mb-4">
              <span>🔐</span> <a href="/auth" className="underline font-medium">Sign in</a> to create a wall.
            </div>
          )}

          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1.5">Event Name</label>
              <input type="text" className="input" value={name}
                onChange={(e) => setName(e.target.value)} required
                placeholder="e.g. Sarah & Tom's Wedding" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-300">Custom Link (URL)</label>
                {plan === 'FREE' && (
                  <Link href="/pricing" className="text-[9px] font-bold text-amber-500 hover:underline">✨ UPGRADE TO UNLOCK</Link>
                )}
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">/upload/</span>
                <input 
                  type="text" 
                  className={`input !pl-16 ${plan === 'FREE' ? 'opacity-50 cursor-not-allowed' : ''}`} 
                  value={customSlug}
                  disabled={plan === 'FREE'}
                  onChange={(e) => setCustomSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  placeholder={plan === 'FREE' ? 'Auto-generated' : 'my-cool-party'} 
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1.5">
                Password <span className="text-gray-400">(optional — leave blank for open access)</span>
              </label>
              <input type="password" className="input" value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Set a guest password…" />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/15 p-3 rounded-xl">
                <span>⚠️</span> {error}
              </div>
            )}

            <button type="submit" className="btn-primary w-full !py-3" disabled={loading || !user}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
