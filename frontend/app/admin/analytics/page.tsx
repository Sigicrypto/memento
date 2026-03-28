"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface DownloadStat {
  photo_id: string;
  storage_path: string;
  download_count: number;
}

export default function AnalyticsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DownloadStat[]>([]);
  const [totalDownloads, setTotalDownloads] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/system');
      return;
    }
    const isAdminUser = user.user_metadata?.role === 'admin';
    if (!isAdminUser) {
      router.push('/system');
    } else {
      setIsAdmin(true);
    }
  }, [user, authLoading, router]);

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

  if (loading || authLoading || !isAdmin) {
    return <div className="nm-page flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="nm-page px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link href="/admin" className="nm-btn text-sm">← Back to Admin</Link>
        </div>
        <div className="nm-card p-8 mb-8">
          <h1 className="text-2xl font-bold mb-2" style={{color: '#e2e8f0'}}>Download Analytics</h1>
          <p className="text-sm" style={{color:'#7f849c'}}>Total Downloads: {totalDownloads}</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {stats.map(stat => (
            <div key={stat.photo_id} className="nm-card p-4 text-center">
              <img src={getPublicUrl(stat.storage_path)} alt="Photo" className="w-full h-auto object-cover rounded-lg mb-2" />
              <p className="text-lg font-bold" style={{color: '#e2e8f0'}}>{stat.download_count}</p>
              <p className="text-xs" style={{color: '#7f849c'}}>Downloads</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
