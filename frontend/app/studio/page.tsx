"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  PlusCircle,
  Calendar,
  Users,
  Image,
  TrendingUp,
  Search,
  Filter,
  ExternalLink,
  Copy,
  Radio,
  FileEdit,
  ChevronRight,
  Sparkles,
  Share2,
} from 'lucide-react';
import { getStatusConfig, type StudioEvent } from '@/lib/studio';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';

type FilterTab = 'all' | 'live' | 'upcoming' | 'past';

export default function StudioDashboard() {
  const { user, isAdmin, isSuperAdmin } = useAuth();
  const [filter, setFilter] = useState<FilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [events, setEvents] = useState<StudioEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);

  // Load real events from Supabase
  useEffect(() => {
    async function loadEvents() {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        let query = supabase.from('events').select('*').order('created_at', { ascending: false });
        if (!isAdmin && !isSuperAdmin) {
          query = query.eq('owner_id', user.id);
        }
        const { data, error } = await query;
        if (data && data.length > 0) {
          const mapped: StudioEvent[] = data.map((e) => {
            const tier = (e.guest_tier || (e.plan_type === 'PREMIUM' ? 'LARGE' : e.plan_type === 'STANDARD' ? 'MEDIUM' : 'SMALL')) as 'SMALL' | 'MEDIUM' | 'LARGE';
            const limit = e.guest_limit || (tier === 'LARGE' ? 1000 : tier === 'MEDIUM' ? 300 : 100);
            return {
              id: e.id,
              studio_id: e.studio_id || 'studio-1',
              event_name: e.event_name || e.name || 'Untitled Event',
              event_date: e.event_date || e.created_at?.split('T')[0] || null,
              venue: e.venue || null,
              client_name: e.client_name || e.owner_email || null,
              client_email: e.client_email || e.owner_email || null,
              client_phone: e.client_phone || null,
              guest_tier: tier,
              guest_limit: limit,
              current_guest_count: e.current_guest_count || 0,
              status: (e.status || 'ACTIVE') as 'DRAFT' | 'ACTIVE' | 'CLOSED',
              is_white_labeled: Boolean(e.is_white_labeled),
              slug: e.slug || 'event',
              created_at: e.created_at || new Date().toISOString(),
            };
          });
          setEvents(mapped);
        } else {
          setEvents([]);
        }
      } catch (err) {
        console.error('Error fetching studio events:', err);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    }
    loadEvents();
  }, [user, isAdmin, isSuperAdmin]);

  const handleDuplicate = async (eventToClone: StudioEvent) => {
    setDuplicatingId(eventToClone.id);
    try {
      const res = await fetch('/api/studio/events/duplicate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: eventToClone.id,
          newEventName: `${eventToClone.event_name || 'Event'} (Copy)`,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.event) {
          setEvents((prev) => [data.event, ...prev]);
        }
      }
    } catch (err) {
      console.error('Error duplicating event:', err);
    } finally {
      setDuplicatingId(null);
    }
  };

  const filteredEvents = events.filter((event) => {
    // Filter by tab
    if (filter === 'live' && event.status !== 'ACTIVE') return false;
    if (filter === 'upcoming' && event.status !== 'DRAFT') return false;
    if (filter === 'past' && event.status !== 'CLOSED') return false;

    // Filter by search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        event.event_name?.toLowerCase().includes(q) ||
        event.client_name?.toLowerCase().includes(q) ||
        event.venue?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Calculate real metrics
  const totalGuests = events.reduce((sum, e) => sum + e.current_guest_count, 0);
  const activeEvents = events.filter((e) => e.status === 'ACTIVE').length;
  const totalEvents = events.length;

  const METRICS = [
    { label: 'Total Events', value: totalEvents, icon: Calendar, color: 'text-accent' },
    { label: 'Active Now', value: activeEvents, icon: Radio, color: 'text-green-600' },
    { label: 'Total Guests', value: totalGuests.toLocaleString(), icon: Users, color: 'text-primary' },
    { label: 'Live Walls', value: activeEvents, icon: Image, color: 'text-purple-600' },
  ];

  const FILTER_TABS: { key: FilterTab; label: string; count: number }[] = [
    { key: 'all', label: 'All Events', count: events.length },
    { key: 'live', label: 'Live', count: events.filter((e) => e.status === 'ACTIVE').length },
    { key: 'upcoming', label: 'Upcoming', count: events.filter((e) => e.status === 'DRAFT').length },
    { key: 'past', label: 'Past', count: events.filter((e) => e.status === 'CLOSED').length },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col items-center">
      {/* ── CONTAINER 1: HEADER SECTION ── */}
      <section className="w-full flex flex-col items-center text-center py-8 sm:py-10 border-b border-border/60">
        <div className="flex items-center justify-center gap-2.5 flex-wrap">
          <h1 className="text-3xl sm:text-4xl font-black text-text-primary tracking-tight font-display text-center">
            Studio Dashboard
          </h1>
          {(isAdmin || isSuperAdmin) && (
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-700 border border-amber-500/30 hover:bg-amber-500/20 transition-colors"
              title="Go to Super Admin Command Center"
            >
              <span>⚡ Admin Command</span>
            </Link>
          )}
        </div>
        <p className="text-text-secondary text-sm sm:text-base mt-2.5 text-center max-w-lg">
          Manage client events, monitor guest engagement, and white-label live walls.
        </p>
        <div className="mt-6 flex justify-center">
          <Link
            href="/studio/new-event"
            className="inline-flex items-center gap-2 bg-accent hover:bg-[#D9932B] text-white font-bold text-sm px-7 py-3.5 rounded-full shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
          >
            <PlusCircle size={18} />
            Create New Event
          </Link>
        </div>
      </section>

      {/* ── CONTAINER 2: METRICS KPI SECTION ── */}
      <section className="w-full py-8 sm:py-10 border-b border-border/60 flex flex-col items-center">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 w-full">
          {METRICS.map((metric) => {
            const Icon = metric.icon;
            return (
              <div
                key={metric.label}
                className="rounded-2xl border border-border bg-surface p-5 sm:p-6 shadow-card flex flex-col items-center text-center"
              >
                <div className="flex flex-col items-center gap-2 mb-3">
                  <div className="w-11 h-11 rounded-xl bg-bg-subtle border border-border flex items-center justify-center mx-auto">
                    <Icon size={20} className={metric.color} />
                  </div>
                  <span className="text-text-secondary text-xs font-bold uppercase tracking-wider text-center">
                    {metric.label}
                  </span>
                </div>
                <p className="text-2xl lg:text-3xl font-black text-text-primary tracking-tight font-display text-center">
                  {metric.value}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── CONTAINER 3: EVENTS MANAGEMENT SECTION ── */}
      <section className="w-full py-8 sm:py-10 border-b border-border/60 space-y-6">
        {/* Filter Tabs + Search - Aligned */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full">
          <div className="flex items-center justify-center sm:justify-start gap-1 bg-bg-subtle p-1 rounded-xl border border-border overflow-x-auto max-w-full no-scrollbar flex-nowrap shrink-0">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`px-3.5 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer whitespace-nowrap shrink-0 ${
                  filter === tab.key
                    ? 'bg-surface text-text-primary shadow-sm border border-border'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {tab.label}
                <span className="ml-1.5 text-text-muted">({tab.count})</span>
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Search events, clients, venues..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2.5 rounded-xl border border-border bg-surface text-text-primary text-sm w-full focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all placeholder:text-text-muted"
            />
          </div>
        </div>

        {/* Events List / Empty State */}
        <div className="w-full space-y-4">
          {loading ? (
            <div className="rounded-2xl border border-border bg-surface p-12 text-center flex flex-col items-center justify-center w-full">
              <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-text-secondary text-sm">Loading studio events...</p>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="rounded-2xl border border-border bg-surface p-12 text-center flex flex-col items-center justify-center w-full">
              <div className="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-4 text-accent">
                <Calendar size={28} />
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-2 text-center font-display">
                {filter !== 'all' ? `No ${filter} Events Found` : 'No Events Created Yet'}
              </h3>
              <p className="text-text-secondary text-sm mb-6 text-center max-w-sm">
                {filter !== 'all'
                  ? `There are no ${filter} events matching your criteria. Try another filter or create a new event.`
                  : 'Create your first client event to launch an interactive live photo wall, generate table QR cards, and track guest uploads.'}
              </p>
              <Link
                href="/studio/new-event"
                className="inline-flex items-center gap-2 bg-accent hover:bg-[#D9932B] text-white font-bold text-sm px-6 py-3 rounded-full shadow-sm transition-all cursor-pointer"
              >
                <PlusCircle size={16} />
                Create Your First Event
              </Link>
            </div>
          ) : (
            filteredEvents.map((event) => {
              const statusConfig = getStatusConfig(event.status);
              const guestPercent =
                event.guest_limit > 0
                  ? Math.min(100, Math.round((event.current_guest_count / event.guest_limit) * 100))
                  : 0;
              const isNearLimit = guestPercent >= 80;

              return (
                <div
                  key={event.id}
                  className="rounded-2xl border border-border bg-surface p-5 sm:p-6 shadow-card hover:shadow-card-hover transition-all duration-300 group w-full"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* Event Info */}
                    <div className="flex-grow min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <h3 className="text-base font-bold text-text-primary truncate">
                          {event.event_name || 'Untitled Event'}
                        </h3>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusConfig.bgColor} ${statusConfig.color}`}
                        >
                          {event.status === 'ACTIVE' && (
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5 animate-pulse" />
                          )}
                          {statusConfig.label}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-secondary">
                        {event.client_name && (
                          <span className="flex items-center gap-1">
                            <Users size={12} />
                            {event.client_name}
                          </span>
                        )}
                        {event.event_date && (
                          <span className="flex items-center gap-1">
                            <Calendar size={12} />
                            {new Date(event.event_date).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        )}
                        {event.venue && (
                          <span className="truncate max-w-[200px]">📍 {event.venue}</span>
                        )}
                      </div>
                    </div>

                    {/* Guest Count + Tier + Actions */}
                    <div className="flex items-center gap-4 sm:gap-6 shrink-0">
                      <div className="text-right">
                        <div className="flex items-baseline gap-1 justify-end">
                          <span className={`text-lg font-black tracking-tight ${isNearLimit ? 'text-amber-600' : 'text-text-primary'}`}>
                            {event.current_guest_count}
                          </span>
                          <span className="text-text-muted text-xs">/ {event.guest_limit}</span>
                        </div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                          guests
                        </div>
                        {/* Progress bar */}
                        <div className="w-24 h-1.5 rounded-full bg-bg-subtle mt-1.5">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              guestPercent >= 100
                                ? 'bg-red-500'
                                : guestPercent >= 80
                                ? 'bg-amber-500'
                                : 'bg-accent'
                            }`}
                            style={{ width: `${Math.min(100, guestPercent)}%` }}
                          />
                        </div>
                      </div>

                      {/* Tier badge */}
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-accent/10 text-accent border border-accent/20">
                        {event.guest_tier}
                      </span>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleDuplicate(event)}
                          disabled={duplicatingId === event.id}
                          title="Duplicate event settings"
                          className="flex items-center gap-1 text-[11px] font-bold text-text-secondary hover:text-text-primary px-2.5 py-1.5 rounded-lg hover:bg-bg-subtle border border-transparent hover:border-border transition-colors cursor-pointer"
                        >
                          <Copy size={13} />
                          <span className="hidden md:inline">{duplicatingId === event.id ? 'Cloning...' : 'Copy'}</span>
                        </button>
                        <Link
                          href={`/studio/events/${event.id}`}
                          className="flex items-center gap-1 text-xs font-bold text-accent hover:text-[#B8882F] px-3 py-1.5 rounded-lg bg-accent/10 hover:bg-accent/20 border border-accent/20 transition-all cursor-pointer"
                        >
                          Manage <ChevronRight size={14} />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* ── CONTAINER 4: QUICK ACTIONS FOOTER ── */}
      <section className="w-full py-8 sm:py-10 flex flex-col items-center text-center">
        <div className="w-full rounded-2xl border border-border bg-surface p-6 sm:p-8 flex flex-col items-center text-center">
          <h3 className="text-lg font-bold text-text-primary mb-6 font-display text-center">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 w-full">
            <Link
              href="/studio/new-event"
              className="flex flex-col items-center text-center gap-3 p-5 rounded-xl border border-border hover:border-accent/30 hover:bg-accent/5 transition-all group/action justify-center cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                <PlusCircle size={22} className="text-accent" />
              </div>
              <div>
                <p className="text-sm font-bold text-text-primary text-center">Create Event</p>
                <p className="text-xs text-text-secondary text-center mt-0.5">Set up a new client event</p>
              </div>
            </Link>
            <Link
              href="/studio/settings"
              className="flex flex-col items-center text-center gap-3 p-5 rounded-xl border border-border hover:border-accent/30 hover:bg-accent/5 transition-all justify-center cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                <FileEdit size={22} className="text-accent" />
              </div>
              <div>
                <p className="text-sm font-bold text-text-primary text-center">Studio Branding</p>
                <p className="text-xs text-text-secondary text-center mt-0.5">Logo, colors & defaults</p>
              </div>
            </Link>
            <Link
              href="/dashboard/branding"
              className="flex flex-col items-center text-center gap-3 p-5 rounded-xl border border-border hover:border-accent/30 hover:bg-accent/5 transition-all justify-center cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                <Sparkles size={22} className="text-accent" />
              </div>
              <div>
                <p className="text-sm font-bold text-text-primary text-center">White-Label Suite</p>
                <p className="text-xs text-text-secondary text-center mt-0.5">Live previews & custom domain</p>
              </div>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
