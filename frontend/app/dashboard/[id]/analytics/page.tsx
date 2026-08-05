"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import {
  BarChart3, Users, Image as ImageIcon, Heart, ArrowLeft,
  Download, TrendingUp, Sparkles, Calendar, Clock
} from 'lucide-react';
import AnimatedLogo from '@/components/AnimatedLogo';
import ThemeToggle from '@/components/ThemeToggle';

interface EventDetails {
  id: string;
  name: string;
  slug: string;
}

export default function AnalyticsPage() {
  const { id } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [eventDetails, setEventDetails] = useState<EventDetails | null>(null);
  const [stats, setStats] = useState({
    totalPhotos: 0,
    uniqueGuests: 0,
    totalReactions: 0,
    peakHour: 'N/A'
  });
  const [hourlyData, setHourlyData] = useState<{ hour: string; count: number }[]>([]);

  useEffect(() => {
    async function fetchAnalytics() {
      if (!id) return;
      setLoading(true);

      // Fetch Event info
      const { data: eventData } = await supabase
        .from('events')
        .select('id, name, slug')
        .eq('id', id)
        .single();

      if (eventData) {
        setEventDetails(eventData);
      }

      // Fetch Photos
      const { data: photos } = await supabase
        .from('photos')
        .select('id, created_at, uploader_name')
        .eq('event_id', id);

      if (!photos) {
        setLoading(false);
        return;
      }

      // Fetch Reactions
      let totalReactionsCount = 0;
      if (photos.length > 0) {
        const { data: reactions } = await supabase
          .from('reactions')
          .select('id')
          .in('photo_id', photos.map(p => p.id));
        totalReactionsCount = reactions?.length || 0;
      }

      const guests = new Set(photos.map(p => (p.uploader_name || '').toLowerCase().trim()));

      const hourlyCounts: Record<string, number> = {};
      photos.forEach(p => {
        const d = new Date(p.created_at);
        const hr = d.toLocaleTimeString([], { hour: '2-digit', hour12: true });
        hourlyCounts[hr] = (hourlyCounts[hr] || 0) + 1;
      });

      const chartData = Object.entries(hourlyCounts)
        .map(([hour, count]) => ({ hour, count }))
        .sort((a, b) => a.hour.localeCompare(b.hour));

      let peak = 'N/A';
      let max = 0;
      chartData.forEach(d => {
        if (d.count > max) {
          max = d.count;
          peak = d.hour;
        }
      });

      setStats({
        totalPhotos: photos.length,
        uniqueGuests: guests.size,
        totalReactions: totalReactionsCount,
        peakHour: peak
      });
      setHourlyData(chartData);
      setLoading(false);
    }

    fetchAnalytics();
  }, [id]);

  const handleExportCSV = () => {
    if (hourlyData.length === 0) return;
    const headers = 'Hour,Photos Uploaded\n';
    const rows = hourlyData.map(d => `"${d.hour}",${d.count}`).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics_${eventDetails?.slug || 'event'}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
        <div className="w-10 h-10 border-2 border-border border-t-accent-cyan rounded-full animate-spin" />
      </div>
    );
  }

  const maxCount = Math.max(...hourlyData.map(d => d.count), 1);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 32px 64px' }}>
        
        {/* ── TOP NAV BAR ── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '32px',
            paddingBottom: '20px',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
              <AnimatedLogo width={130} height={32} />
            </Link>
            <span style={{ color: 'var(--border)', fontSize: '18px' }}>/</span>
            <button
              onClick={() => router.push('/dashboard')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '13px',
                fontWeight: 700,
                color: 'var(--text-secondary)',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <ArrowLeft size={16} /> Back to Dashboard
            </button>
          </div>

          <ThemeToggle />
        </div>

        {/* ── HEADER TITLE BLOCK ── */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '20px',
            marginBottom: '40px',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 900,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  padding: '3px 10px',
                  borderRadius: '999px',
                  background: 'color-mix(in srgb, var(--accent-cyan) 12%, transparent)',
                  border: '1px solid color-mix(in srgb, var(--accent-cyan) 25%, transparent)',
                  color: 'var(--accent-cyan)',
                }}
              >
                Engagement Analytics
              </span>
            </div>
            <h1
              style={{
                fontSize: 'clamp(1.5rem, 3.5vw, 2.25rem)',
                fontWeight: 800,
                color: 'var(--text-primary)',
                letterSpacing: '-0.02em',
                margin: 0,
              }}
            >
              {eventDetails?.name || 'Event Analytics'}
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Track guest participation, reactions, and peak upload activity for this wall.
            </p>
          </div>

          <button
            onClick={handleExportCSV}
            className="btn btn-secondary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 20px',
              fontSize: '13px',
              fontWeight: 700,
              borderRadius: '12px',
              cursor: 'pointer',
            }}
          >
            <Download size={16} />
            <span>Export CSV</span>
          </button>
        </div>

        {/* ── KPI STAT CARDS GRID ── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '24px',
            marginBottom: '40px',
          }}
        >
          {[
            { label: 'Total Memories', value: stats.totalPhotos, icon: ImageIcon, color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' },
            { label: 'Active Guests', value: stats.uniqueGuests, icon: Users, color: '#22c55e', bg: 'rgba(34, 197, 94, 0.1)' },
            { label: 'Total Reactions', value: stats.totalReactions, icon: Heart, color: '#ec4899', bg: 'rgba(236, 72, 153, 0.1)' },
            { label: 'Peak Upload Time', value: stats.peakHour, icon: TrendingUp, color: '#f97316', bg: 'rgba(249, 115, 22, 0.1)' },
          ].map((stat, i) => (
            <div
              key={i}
              style={{
                padding: '24px',
                borderRadius: '20px',
                border: '1px solid var(--border)',
                background: 'var(--surface)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-secondary)' }}>
                  {stat.label}
                </span>
                <div style={{ padding: '10px', borderRadius: '12px', background: stat.bg, color: stat.color }}>
                  <stat.icon size={18} />
                </div>
              </div>
              <p style={{ fontSize: '36px', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em', margin: 0 }}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* ── UPLOAD TIMELINE CHART ── */}
        <div
          style={{
            padding: '32px',
            borderRadius: '24px',
            border: '1px solid var(--border)',
            background: 'var(--surface)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ padding: '8px', borderRadius: '10px', background: 'color-mix(in srgb, var(--accent-cyan) 12%, transparent)', color: 'var(--accent-cyan)' }}>
                <BarChart3 size={18} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                Upload Timeline
              </h3>
            </div>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Hourly distribution
            </span>
          </div>

          {hourlyData.length === 0 ? (
            <div style={{ height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
              No upload activity recorded for this wall yet.
            </div>
          ) : (
            <div
              style={{
                height: '240px',
                display: 'flex',
                alignItems: 'flex-end',
                gap: '16px',
                paddingBottom: '24px',
                borderBottom: '1px solid var(--border)',
              }}
            >
              {hourlyData.map((d, i) => {
                const height = (d.count / maxCount) * 100;
                return (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '8px',
                      height: '100%',
                      justifyContent: 'flex-end',
                    }}
                    className="group relative"
                  >
                    {/* Tooltip */}
                    <div
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{
                        position: 'absolute',
                        top: '-32px',
                        background: 'var(--text-primary)',
                        color: 'var(--bg)',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 700,
                        whiteSpace: 'nowrap',
                        pointerEvents: 'none',
                      }}
                    >
                      {d.count} photos ({d.hour})
                    </div>

                    <div
                      style={{
                        width: '100%',
                        maxWidth: '48px',
                        height: `${Math.max(height, 8)}%`,
                        background: 'linear-gradient(to top, #a855f7, var(--accent-cyan))',
                        borderRadius: '6px 6px 0 0',
                        transition: 'opacity 0.2s',
                      }}
                      className="group-hover:opacity-80"
                    />

                    <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                      {d.hour}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
