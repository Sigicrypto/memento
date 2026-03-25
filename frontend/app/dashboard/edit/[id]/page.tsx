"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

export default function EditEventPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [slugError, setSlugError] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push('/auth'); return; }

    const fetchEvent = async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        router.push('/dashboard');
        return;
      }

      if (data.owner_id !== user.id) {
        router.push('/dashboard');
        return;
      }

      setName(data.name);
      setSlug(data.slug);
      setPassword(data.password || '');
      setLoading(false);
    };

    fetchEvent();
  }, [id, user, authLoading, router]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    // Update event
    const { error: updateError } = await supabase
      .from('events')
      .update({
        name,
        slug,
        password: password || null,
      })
      .eq('id', id);

    if (updateError) {
      setError(updateError.message);
      setSaving(false);
      return;
    }

    router.push('/dashboard');
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="aurora-bg min-h-[85vh] flex items-center justify-center px-4">
      <div className="relative z-10 w-full max-w-md">
        <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-primary/15 to-accent/10 blur-xl pointer-events-none" />
        <div className="card relative !p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Edit Event</h1>
            <button onClick={() => router.back()} className="text-dark-text hover:text-white transition text-sm">✕</button>
          </div>

          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-dark-text mb-1.5">Event Name</label>
              <input type="text" className="input" value={name}
                onChange={(e) => setName(e.target.value)} required />
            </div>

            <div>
              <label className="block text-xs font-medium text-dark-text mb-1.5">Custom Slug (URL)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-text/40 text-xs">/wall/</span>
                <input type="text" className="input !pl-14" value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))} required />
              </div>
              {slugError && <p className="text-red-400 text-[10px] mt-1">{slugError}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-dark-text mb-1.5">Password</label>
              <input type="password" className="input" value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Leave blank for public access" />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/15 p-3 rounded-xl">
                <span>⚠️</span> {error}
              </div>
            )}

            <button type="submit" className="btn-primary w-full !py-3" disabled={saving}>
              {saving ? 'Saving changes…' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
