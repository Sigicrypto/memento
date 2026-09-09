"use client";

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  Users,
  Image,
  Tv,
  Smartphone,
  ShieldCheck,
  Download,
  Share2,
  Sparkles,
  AlertTriangle,
  ExternalLink,
  CheckCircle2,
  RefreshCw,
  Lock,
  KeyRound,
} from 'lucide-react';
import { GUEST_TIERS, getTierById } from '@/lib/plans';
import { getStatusConfig, getGuestStatus, getGuestUsagePercent, type StudioEvent } from '@/lib/studio';
import TierUpgradeModal from '@/components/studio/TierUpgradeModal';
import ClientHandoffModal from '@/components/studio/ClientHandoffModal';
import { supabase } from '@/lib/supabase';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function StudioEventDetail({ params }: PageProps) {
  const resolvedParams = use(params);
  const eventId = resolvedParams.id;

  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  const [isHandoffOpen, setIsHandoffOpen] = useState(false);
  const [currency, setCurrency] = useState<'INR' | 'USD'>('INR');
  const [downloadingZip, setDownloadingZip] = useState(false);

  // Fallback demo event if fetching from supabase is empty/local
  const [event, setEvent] = useState<StudioEvent>({
    id: eventId,
    studio_id: 'studio-1',
    event_name: 'Sharma-Patel Wedding Reception',
    event_date: '2025-02-14',
    venue: 'Taj Palace, New Delhi',
    client_name: 'Priya & Arjun Sharma',
    client_email: 'priya@example.com',
    client_phone: '+919876543210',
    guest_tier: 'SMALL',
    guest_limit: 100,
    current_guest_count: 84, // 84% usage for demoing soft threshold
    status: 'ACTIVE',
    is_white_labeled: true,
    slug: 'sharma-patel-reception',
    created_at: new Date().toISOString(),
  });

  useEffect(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz && !tz.includes('Asia/Calcutta') && !tz.includes('Asia/Kolkata')) {
        setCurrency('USD');
      }
    } catch {}
  }, []);

  // Fetch real event data if not demo IDs
  useEffect(() => {
    async function fetchEvent() {
      if (!eventId || eventId === '1' || eventId === '2' || eventId === '3') return;
      try {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .or(`id.eq.${eventId},slug.eq.${eventId}`)
          .single();

        if (data) {
          const tier = (data.guest_tier || (data.plan_type === 'PREMIUM' ? 'LARGE' : data.plan_type === 'STANDARD' ? 'MEDIUM' : 'SMALL')) as 'SMALL' | 'MEDIUM' | 'LARGE';
          const limit = data.guest_limit || (tier === 'LARGE' ? 1000 : tier === 'MEDIUM' ? 300 : 100);
          setEvent({
            id: data.id,
            studio_id: data.studio_id || 'studio-1',
            event_name: data.event_name || data.name || 'Untitled Event',
            event_date: data.event_date || data.created_at?.split('T')[0] || null,
            venue: data.venue || null,
            client_name: data.client_name || data.owner_email || null,
            client_email: data.client_email || data.owner_email || null,
            client_phone: data.client_phone || null,
            guest_tier: tier,
            guest_limit: limit,
            current_guest_count: data.current_guest_count || 0,
            status: (data.status || 'ACTIVE') as any,
            is_white_labeled: Boolean(data.is_white_labeled),
            slug: data.slug || 'event',
            created_at: data.created_at || new Date().toISOString(),
          });
        }
      } catch (err) {
        console.warn('Could not fetch specific event:', err);
      }
    }
    fetchEvent();
  }, [eventId]);

  const handleDownloadZip = async () => {
    setDownloadingZip(true);
    try {
      const { data: photos, error } = await supabase
        .from('photos')
        .select('*')
        .eq('event_id', event.id);

      if (!photos || photos.length === 0) {
        alert('No photos uploaded to this event gallery yet.');
        setDownloadingZip(false);
        return;
      }

      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();
      const folder = zip.folder(`${event.slug}-photos`);

      for (const p of photos) {
        try {
          const publicUrl = supabase.storage.from('photos').getPublicUrl(p.storage_path).data.publicUrl;
          const res = await fetch(publicUrl);
          const blob = await res.blob();
          folder?.file(`${p.uploader_name || 'guest'}-${p.id.slice(0, 6)}.jpg`, blob);
        } catch (e) {
          console.error('Error fetching photo for zip:', e);
        }
      }

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${event.slug}-memento-4k.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert('Error downloading album ZIP: ' + (err?.message || 'Failed'));
    } finally {
      setDownloadingZip(false);
    }
  };

  const currentTier = getTierById(event.guest_tier) || GUEST_TIERS[0];
  const usagePercent = getGuestUsagePercent(event.current_guest_count, event.guest_limit);
  const guestStatus = getGuestStatus(event.current_guest_count, event.guest_limit);
  const statusConfig = getStatusConfig(event.status);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Top Bar Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          href="/studio"
          className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsHandoffOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-surface hover:bg-bg-subtle text-text-primary text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <Share2 size={14} className="text-accent" />
            <span>Client Handoff Kit</span>
          </button>

          <button
            onClick={() => setIsUpgradeOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-accent hover:bg-[#D9932B] text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <Sparkles size={14} />
            <span>Upgrade Tier</span>
          </button>
        </div>
      </div>

      {/* Header Info */}
      <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-black text-text-primary tracking-tight font-display">
                {event.event_name}
              </h1>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusConfig.bgColor} ${statusConfig.color}`}
              >
                {event.status === 'ACTIVE' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5 animate-pulse" />
                )}
                {statusConfig.label}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs sm:text-sm text-text-secondary">
              {event.client_name && (
                <span className="flex items-center gap-1.5">
                  <Users size={14} /> {event.client_name}
                </span>
              )}
              {event.event_date && (
                <span className="flex items-center gap-1.5">
                  <Calendar size={14} /> {event.event_date}
                </span>
              )}
              {event.venue && <span>📍 {event.venue}</span>}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block">Tier</span>
              <span className="text-sm font-bold text-accent">{currentTier.name}</span>
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block">Co-Host PIN</span>
              <span className="text-sm font-mono font-bold text-primary">8421</span>
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block">White-Label</span>
              <span className="text-xs font-bold text-green-600">Enabled</span>
            </div>
          </div>
        </div>
      </div>

      {/* Post-Event Reconciliation Gate Notice (Active when event exceeded purchased tier) */}
      {guestStatus === 'exceeded' && (
        <div className="rounded-2xl border-2 border-accent bg-amber-50/80 p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-accent text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 className="font-bold text-text-primary text-base">
                  Post-Event Tier Reconciliation Required
                </h3>
                <p className="text-text-secondary text-sm mt-1 leading-relaxed max-w-2xl">
                  {event.event_name} hosted <strong>{event.current_guest_count} guests</strong> ({currentTier.name} limit: {event.guest_limit}). 
                  During the wedding, our 15% soft grace buffer allowed all photos smoothly without interrupting the couple. Settle the tier difference to unlock the 4K ZIP album download.
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsUpgradeOpen(true)}
              className="px-5 py-2.5 rounded-full bg-accent hover:bg-[#D9932B] text-white text-xs font-bold transition-all shadow-sm shrink-0 flex items-center gap-2 cursor-pointer"
            >
              <Sparkles size={14} />
              <span>Settle Difference & Unlock ZIP</span>
            </button>
          </div>
        </div>
      )}

      {/* Realtime Guest Capacity & Alerts */}
      <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-text-primary">Guest Engagement & Tier Capacity</h2>
            <p className="text-xs text-text-secondary">Track unique guest mobile cameras uploading to this event</p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-text-primary tracking-tight font-display">
              {event.current_guest_count}
            </span>
            <span className="text-text-muted text-sm ml-1 font-medium">/ {event.guest_limit} guests</span>
          </div>
        </div>

        {/* Capacity Bar */}
        <div className="w-full h-3 rounded-full bg-bg-subtle overflow-hidden mb-3">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              guestStatus === 'exceeded'
                ? 'bg-red-500'
                : guestStatus === 'warning'
                ? 'bg-amber-500'
                : 'bg-accent'
            }`}
            style={{ width: `${Math.min(100, usagePercent)}%` }}
          />
        </div>

        {/* Status Callout */}
        {guestStatus === 'warning' && (
          <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} className="text-amber-600 shrink-0" />
              <span>Event is at {usagePercent}% capacity. Upgrade before guests exceed the limit.</span>
            </div>
            <button
              onClick={() => setIsUpgradeOpen(true)}
              className="font-bold underline hover:opacity-80 shrink-0 ml-2 cursor-pointer"
            >
              Upgrade Now
            </button>
          </div>
        )}

        {guestStatus === 'exceeded' && (
          <div className="flex items-center justify-between p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs">
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} className="text-red-600 shrink-0" />
              <span>Guest limit exceeded ({event.current_guest_count}/{event.guest_limit}). Soft buffer active. Settle tier difference post-event to unlock 4K download.</span>
            </div>
            <button
              onClick={() => setIsUpgradeOpen(true)}
              className="font-bold underline hover:opacity-80 shrink-0 ml-2 cursor-pointer"
            >
              Upgrade Now
            </button>
          </div>
        )}

        {guestStatus === 'ok' && (
          <p className="text-xs text-text-muted">
            ✓ Normal load. {event.guest_limit - event.current_guest_count} guest slots remaining.
          </p>
        )}
      </div>

      {/* Quick Launch Console */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Live Wall */}
        <a
          href={`/wall/${event.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-2xl border border-border bg-surface p-5 shadow-card hover:shadow-card-hover transition-all group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <Tv size={20} />
          </div>
          <h3 className="font-bold text-text-primary text-sm mb-1 flex items-center justify-between">
            <span>Live Photo Wall</span>
            <ExternalLink size={14} className="text-text-muted group-hover:text-primary" />
          </h3>
          <p className="text-xs text-text-secondary">Project on venue screens & TVs</p>
        </a>

        {/* Guest Camera */}
        <a
          href={`/mobile/${event.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-2xl border border-border bg-surface p-5 shadow-card hover:shadow-card-hover transition-all group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-green-500/10 text-green-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <Smartphone size={20} />
          </div>
          <h3 className="font-bold text-text-primary text-sm mb-1 flex items-center justify-between">
            <span>Guest Camera App</span>
            <ExternalLink size={14} className="text-text-muted group-hover:text-primary" />
          </h3>
          <p className="text-xs text-text-secondary">Test browser scan & snap flow</p>
        </a>

        {/* Host Moderation */}
        <a
          href={`/moderate/${event.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-2xl border border-border bg-surface p-5 shadow-card hover:shadow-card-hover transition-all group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <ShieldCheck size={20} />
          </div>
          <h3 className="font-bold text-text-primary text-sm mb-1 flex items-center justify-between">
            <span>Moderation Panel</span>
            <ExternalLink size={14} className="text-text-muted group-hover:text-primary" />
          </h3>
          <p className="text-xs text-text-secondary">Approve/hide incoming photos</p>
        </a>

        {/* Download ZIP with Post-Event Reconciliation Gate */}
        {guestStatus === 'exceeded' ? (
          <button
            onClick={() => setIsUpgradeOpen(true)}
            className="rounded-2xl border-2 border-amber-300 bg-amber-50/40 p-5 shadow-card hover:shadow-card-hover transition-all text-left group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-accent/20 text-accent flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Lock size={20} />
            </div>
            <h3 className="font-bold text-text-primary text-sm mb-1 flex items-center justify-between">
              <span>Full 4K ZIP</span>
              <span className="text-[10px] font-bold text-accent px-2 py-0.5 rounded bg-white border border-amber-200">Locked</span>
            </h3>
            <p className="text-xs text-text-secondary">Settle overage to unlock download</p>
          </button>
        ) : (
          <button
            onClick={handleDownloadZip}
            disabled={downloadingZip}
            className="rounded-2xl border border-border bg-surface p-5 shadow-card hover:shadow-card-hover transition-all text-left group cursor-pointer disabled:opacity-50"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              {downloadingZip ? (
                <div className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Download size={20} />
              )}
            </div>
            <h3 className="font-bold text-text-primary text-sm mb-1 flex items-center justify-between">
              <span>{downloadingZip ? 'Bundling ZIP...' : 'Full 4K ZIP'}</span>
              <Download size={14} className="text-text-muted group-hover:text-primary" />
            </h3>
            <p className="text-xs text-text-secondary">
              {downloadingZip ? 'Fetching high-res originals...' : 'Download complete high-res album'}
            </p>
          </button>
        )}
      </div>

      {/* Modals */}
      <TierUpgradeModal
        isOpen={isUpgradeOpen}
        onClose={() => setIsUpgradeOpen(false)}
        currentTierId={event.guest_tier}
        currency={currency}
        eventName={event.event_name || 'Event'}
        eventId={event.id}
        currentGuestCount={event.current_guest_count}
      />

      <ClientHandoffModal
        isOpen={isHandoffOpen}
        onClose={() => setIsHandoffOpen(false)}
        eventName={event.event_name || 'Event'}
        clientName={event.client_name}
        clientPhone={event.client_phone}
        clientEmail={event.client_email}
        slug={event.slug}
      />
    </div>
  );
}
