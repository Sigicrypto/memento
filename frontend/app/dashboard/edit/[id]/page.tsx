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
      <div className="nm-page flex items-center justify-center">
        <div className="nm-circle w-14 h-14">
          <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{borderColor:'#252c46',borderTopColor:'#f59e0b'}} />
        </div>
      </div>
    );
  }

  return (
    <div className="nm-page flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="nm-card p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold" style={{color:'#e2e8f0'}}>Edit Event</h1>
            <button onClick={() => router.back()} className="nm-circle w-9 h-9 text-sm" style={{color:'#7f849c'}}>✕</button>
          </div>

          <form onSubmit={handleUpdate} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold mb-2" style={{color:'#7f849c'}}>Event Name</label>
              <input type="text" className="nm-input" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-2" style={{color:'#7f849c'}}>Custom Slug (URL)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs pointer-events-none" style={{color:'#4a4f6a'}}>/wall/</span>
                <input type="text" className="nm-input !pl-14" value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))} required />
              </div>
              {slugError && <p className="text-[10px] mt-1" style={{color:'#f87171'}}>{slugError}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold mb-2" style={{color:'#7f849c'}}>Password</label>
              <input type="password" className="nm-input" value={password}
                onChange={(e) => setPassword(e.target.value)} placeholder="Leave blank for public access" />
            </div>

            {error && (
              <div className="nm-inset p-3 flex items-center gap-2 text-sm" style={{color:'#f87171'}}>
                <span>⚠️</span> {error}
              </div>
            )}

            <button type="submit" className="nm-btn nm-btn-accent w-full py-3 font-bold" disabled={saving}>
              {saving ? 'Saving changes…' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
