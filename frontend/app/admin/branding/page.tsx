"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function BrandingPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [brandLogoFile, setBrandLogoFile] = useState<File | null>(null);
  const [brandLogoPreview, setBrandLogoPreview] = useState<string | null>(null);
  const [primaryColor, setPrimaryColor] = useState('#f59e0b');
  const [secondaryColor, setSecondaryColor] = useState('#f472b6');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/auth');
      return;
    }

    const fetchBranding = async () => {
      setLoading(true);
      // In a real app, you'd fetch this from a 'profiles' or 'accounts' table
      // linked to the user. We'll use user_metadata for this demo.
      const { data: { user } } = await supabase.auth.getUser();
      const metadata = user?.user_metadata;
      if (metadata) {
        setBrandLogoPreview(metadata.brand_logo_url || null);
        setPrimaryColor(metadata.brand_colors?.primary || '#f59e0b');
        setSecondaryColor(metadata.brand_colors?.secondary || '#f472b6');
      }
      setLoading(false);
    };

    fetchBranding();
  }, [user, authLoading, router]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    let logoUrl = user.user_metadata.brand_logo_url;
    if (brandLogoFile) {
      const filePath = `branding/${user.id}/logo`;
      await supabase.storage.from('photos').upload(filePath, brandLogoFile, { upsert: true });
      logoUrl = supabase.storage.from('photos').getPublicUrl(filePath).data.publicUrl;
    }

    const { error } = await supabase.auth.updateUser({
      data: {
        ...user.user_metadata,
        brand_logo_url: logoUrl,
        brand_colors: { primary: primaryColor, secondary: secondaryColor },
      },
    });

    if (error) {
      alert('Failed to update branding.');
    } else {
      alert('Branding updated successfully!');
    }
  };

  if (loading || authLoading) {
    return <div className="nm-page flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="nm-page px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <Link href="/admin" className="nm-btn text-sm">← Back to Admin</Link>
        </div>
        <div className="nm-card p-8">
          <h1 className="text-2xl font-bold mb-6" style={{color: '#e2e8f0'}}>White-Label Branding</h1>
          <form onSubmit={handleUpdate} className="space-y-6">
            <div>
              <label className="block text-xs font-semibold mb-2" style={{color:'#7f849c'}}>Brand Logo</label>
              <input type="file" accept="image/png, image/jpeg" onChange={(e) => setBrandLogoFile(e.target.files?.[0] || null)} className="nm-input" />
              {brandLogoPreview && <img src={brandLogoPreview} alt="Logo preview" className="w-32 h-auto object-contain mt-4" />}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-2" style={{color:'#7f849c'}}>Primary Color</label>
                <div className="flex items-center gap-2 nm-input p-2">
                  <input type="color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} className="w-8 h-8" />
                  <span>{primaryColor}</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-2" style={{color:'#7f849c'}}>Secondary Color</label>
                <div className="flex items-center gap-2 nm-input p-2">
                  <input type="color" value={secondaryColor} onChange={e => setSecondaryColor(e.target.value)} className="w-8 h-8" />
                  <span>{secondaryColor}</span>
                </div>
              </div>
            </div>
            <div>
              <button type="submit" className="nm-btn nm-btn-accent w-full py-3 font-bold">Save Branding</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
