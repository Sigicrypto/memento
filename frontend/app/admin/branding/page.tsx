"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AnimatedLogo from '@/components/AnimatedLogo';

export default function BrandingPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const [brandLogoFile, setBrandLogoFile] = useState<File | null>(null);
  const [brandLogoPreview, setBrandLogoPreview] = useState<string | null>(null);
  const [primaryColor, setPrimaryColor] = useState('#f59e0b');
  const [secondaryColor, setSecondaryColor] = useState('#f472b6');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoading) return;
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
  }, [user, isLoading, router]);

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

  if (loading || isLoading) {
    return (
      <div className="lp min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="lp min-h-screen relative overflow-hidden flex flex-col pt-24 pb-12 px-4">
      <div className="aurora-bg fixed inset-0 z-0" />
      <div className="grain fixed inset-0 z-1 opacity-[0.04] pointer-events-none" />

      <div className="relative z-10 max-w-2xl w-full mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link href="/admin" className="btn-outline">
            ← Back to Admin
          </Link>
          <AnimatedLogo width={140} height={45} />
        </div>

        <div className="gcard cinematic-glow shadow-2xl">
          <div className="gcard-border" />
          <div className="gcard-inner p-8 lg:p-12">
            <h1 className="text-3xl font-black mb-8 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              White-Label Branding
            </h1>
            <form onSubmit={handleUpdate} className="space-y-8">
              <div className="p-6 rounded-2xl bg-bg-subtle border border-border">
                <label className="block text-xs font-bold mb-4 uppercase tracking-widest text-text-secondary">Brand Logo</label>
                <input type="file" accept="image/png, image/jpeg" onChange={(e) => setBrandLogoFile(e.target.files?.[0] || null)} 
                  className="w-full text-xs text-slate-600 dark:text-slate-600 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-amber-500/10 file:text-amber-400 hover:file:bg-amber-500/20 cursor-pointer transition-all" />
                {brandLogoPreview && <img src={brandLogoPreview} alt="Logo preview" className="w-32 h-auto object-contain mt-6 mx-auto rounded-xl /40 p-4 border border-black/5 dark:border-black/20 dark:border-black/10 dark:border-white/5 shadow-inner" />}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="p-6 rounded-2xl bg-bg-subtle border border-border">
                  <label className="block text-[10px] font-bold mb-3 uppercase tracking-widest text-text-secondary">Primary Color</label>
                  <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-bg-subtle border border-border">
                    <input type="color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-none" />
                    <span className="text-xs font-mono font-bold tracking-widest">{primaryColor.toUpperCase()}</span>
                  </div>
                </div>
                <div className="p-6 rounded-2xl bg-bg-subtle border border-border">
                  <label className="block text-[10px] font-bold mb-4 uppercase tracking-widest text-text-secondary">Secondary Color</label>
                  <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-bg-subtle border border-border">
                    <input type="color" value={secondaryColor} onChange={e => setSecondaryColor(e.target.value)} className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-none" />
                    <span className="text-xs font-mono font-bold tracking-widest">{secondaryColor.toUpperCase()}</span>
                  </div>
                </div>
              </div>
              <div className="pt-6">
                <button type="submit" className="btn-glow w-full py-4 font-black uppercase tracking-[0.2em] shadow-amber-500/20">
                  Save Branding Settings
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

