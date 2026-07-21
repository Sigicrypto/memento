"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import AnimatedLogo from '@/components/AnimatedLogo';

interface DownloadStat {
  photo_id: string;
  storage_path: string;
  download_count: number;
}

export default function AnalyticsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DownloadStat[]>([]);
  const [totalDownloads, setTotalDownloads] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.push('/system');
      return;
    }
    const isAdminUser = user.user_metadata?.role === 'admin' || user.email === 'sagarfalcon@gmail.com';
    if (!isAdminUser) {
      router.push('/system');
    } else {
      setIsAdmin(true);
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (!isAdmin) return;

    const fetchAnalytics = async () => {
      setLoading(true);
      const { data, error } = await supabase.rpc('get_download_analytics');

      if (error) {
        console.error('Error fetching download analytics:', error);
      } else {
        setStats(data || []);
        const total = data?.reduce((acc: number, stat: DownloadStat) => acc + stat.download_count, 0) || 0;
        setTotalDownloads(total);
      }
      setLoading(false);
    };

    fetchAnalytics();
  }, [isAdmin]);

  const getPublicUrl = (path: string) => {
    const { data } = supabase.storage.from('photos').getPublicUrl(path);
    return data.publicUrl;
  };

  if (loading || isLoading || !isAdmin) {
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

      <div className="relative z-10 max-w-5xl w-full mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link href="/admin" className="btn-outline">
            ← Back to Admin
          </Link>
          <AnimatedLogo width={140} height={45} />
        </div>

        <div className="gcard cinematic-glow mb-8 overflow-hidden">
          <div className="gcard-border" />
          <div className="gcard-inner p-8 lg:p-12">
            <h1 className="text-3xl font-black mb-2 tracking-tight">Download Analytics</h1>
            <p className="text-sm font-bold uppercase tracking-widest text-amber-500">
              Total Community Downloads: <span className="text-xl ml-2">{totalDownloads.toLocaleString()}</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {stats.map(stat => (
            <div key={stat.photo_id} className="gcard cinematic-glow group overflow-hidden transition-all duration-300 hover:scale-[1.05]">
              <div className="gcard-border" />
              <div className="gcard-inner">
                <div className="relative aspect-square rounded-2xl overflow-hidden border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 group">
                  <Image src={getPublicUrl(stat.storage_path)} alt="Photo" fill sizes="(max-width: 768px) 50vw, 20vw" className="object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end">
                    <p className="text-2xl font-black ">{stat.download_count}</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Downloads</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

