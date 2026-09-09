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
  MoreVertical,
  ExternalLink,
  Copy,
  Radio,
  Archive,
  FileEdit,
  ChevronRight,
} from 'lucide-react';
import { getStatusConfig, type StudioEvent } from '@/lib/studio';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';

type FilterTab = 'all' | 'live' | 'upcoming' | 'past';

// Demo data — displayed if no database events exist yet
const DEMO_EVENTS: StudioEvent[] = [
  {
    id: '1',
    studio_id: 'demo-studio',
    event_name: 'Sharma-Patel Wedding Reception',
    event_date: '2025-02-14',
    venue: 'Taj Palace, New Delhi',
    client_name: 'Priya Sharma',
    client_email: 'priya@email.com',
    client_phone: '+919876543210',
    guest_tier: 'MEDIUM',
    guest_limit: 300,
    current_guest_count: 187,
    status: 'ACTIVE',
    is_white_labeled: true,
    slug: 'sharma-patel-reception',
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    studio_id: 'demo-studio',
    event_name: 'Gupta 50th Anniversary',
    event_date: '2025-03-20',
    venue: 'ITC Grand, Mumbai',
    client_name: 'Rahul Gupta',
    client_email: 'rahul@email.com',
    client_phone: '+919876543211',
    guest_tier: 'SMALL',
    guest_limit: 100,
    current_guest_count: 0,
    status: 'DRAFT',
    is_white_labeled: false,
    slug: 'gupta-anniversary',
    created_at: new Date().toISOString(),
  },
  {
    id: '3',
    studio_id: 'demo-studio',
    event_name: 'Reddy-Nair Wedding',
    event_date: '2025-01-10',
    venue: 'Leela Palace, Bangalore',
    client_name: 'Sneha Reddy',
    client_email: 'sneha@email.com',
    client_phone: '+919876543212',
    guest_tier: 'LARGE',
    guest_limit: 1000,
    current_guest_count: 456,
    status: 'CLOSED',
    is_white_labeled: true,
    slug: 'reddy-nair-wedding',
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export default function StudioDashboard() {
  const { user, isAdmin, isSuperAdmin } = useAuth();
  const [filter, setFilter] = useState<FilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [events, setEvents] = useState<StudioEvent[]>(DEMO_EVENTS);
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);

  // Load real events from Supabase
  useEffect(() => {
    async function loadEvents() {
      if (!user) return;
      try {
        let query = supabase.from('events').select('*').order('created_at', { ascending: false });
        if (!isAdmin && !isSuperAdmin) {
          query = query.eq('owner_id', user.id);
        }
        const { data } = await query;
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
        }
      } catch (err) {
        console.error('Error fetching studio events:', err);
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
      } else {
        // Fallback local clone for demo
        const cloned: StudioEvent = {
          ...eventToClone,
          id: `clone-${Date.now()}`,
          event_name: `${eventToClone.event_name || 'Event'} (Copy)`,
          current_guest_count: 0,
          status: 'DRAFT',
          slug: `${eventToClone.slug}-copy-${Math.random().toString(36).substring(2, 5)}`,
          created_at: new Date().toISOString(),
        };
        setEvents((prev) => [cloned, ...prev]);
      }
    } catch {
      // Local fallback
      const cloned: StudioEvent = {
        ...eventToClone,
        id: `clone-${Date.now()}`,
        event_name: `${eventToClone.event_name || 'Event'} (Copy)`,
        current_guest_count: 0,
        status: 'DRAFT',
        slug: `${eventToClone.slug}-copy-${Math.random().toString(36).substring(2, 5)}`,
        created_at: new Date().toISOString(),
      };
      setEvents((prev) => [cloned, ...prev]);
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

  // Calculate metrics
  const totalGuests = events.reduce((sum, e) => sum + e.current_guest_count, 0);
  const activeEvents = events.filter((e) => e.status === 'ACTIVE').length;
  const totalEvents = events.length;

  const METRICS = [
    { label: 'Total Events', value: totalEvents, icon: Calendar, color: 'text-accent' },
    { label: 'Active Now', value: activeEvents, icon: Radio, color: 'text-green-600' },
    { label: 'Total Guests', value: totalGuests.toLocaleString(), icon: Users, color: 'text-primary' },
    { label: 'Photos Collected', value: '2,847', icon: Image, color: 'text-purple-600' },
  ];

  const FILTER_TABS: { key: FilterTab; label: string; count: number }[] = [
    { key: 'all', label: 'All Events', count: events.length },
    { key: 'live', label: 'Live', count: events.filter((e) => e.status === 'ACTIVE').length },
    { key: 'upcoming', label: 'Upcoming', count: events.filter((e) => e.status === 'DRAFT').length },
    { key: 'past', label: 'Past', count: events.filter((e) => e.status === 'CLOSED').length },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-black text-text-primary tracking-tight font-display">
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
          <p className="text-text-secondary text-sm mt-1">
            Manage your client events, track guest engagement, and deliver memories.
          </p>
        </div>
        <Link
          href="/studio/new-event"
          className="inline-flex items-center gap-2 bg-accent hover:bg-[#D9932B] text-white font-bold text-sm px-5 py-3 rounded-full shadow-sm transition-all duration-200"
        >
          <PlusCircle size={18} />
          Create New Event
        </Link>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {METRICS.map((metric) => {
          const Icon = metric.icon;
          return (
            <div
              key={metric.label}
              className="rounded-2xl border border-border bg-surface p-5 shadow-card flex flex-col items-center text-center"
            >
              <div className="flex flex-col items-center gap-2 mb-3">
                <div className="w-10 h-10 rounded-xl bg-bg-subtle border border-border flex items-center justify-center mx-auto">
                  <Icon size={18} className={metric.color} />
                </div>
                <span className="text-text-secondary text-xs font-semibold uppercase tracking-wider text-center">
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

      {/* Filter Tabs + Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-1 bg-bg-subtle p-1 rounded-xl border border-border overflow-x-auto max-w-full no-scrollbar flex-nowrap shrink-0">
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

        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-4 py-2.5 rounded-xl border border-border bg-surface text-text-primary text-sm w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all placeholder:text-text-muted"
          />
        </div>
      </div>

      {/* Events List */}
      <div className="space-y-3">
        {filteredEvents.length === 0 ? (
          <div className="rounded-2xl border border-border bg-surface p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-bg-subtle border border-border flex items-center justify-center mx-auto mb-4">
              <Calendar size={24} className="text-text-muted" />
            </div>
            <h3 className="text-lg font-bold text-text-primary mb-2">No events found</h3>
            <p className="text-text-secondary text-sm mb-6">
              {filter !== 'all'
                ? `No ${filter} events. Try a different filter.`
                : 'Create your first event to get started.'}
            </p>
            <Link
              href="/studio/new-event"
              className="inline-flex items-center gap-2 bg-accent hover:bg-[#B8882F] text-white font-bold text-sm px-5 py-3 rounded-full shadow-sm transition-all"
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
                className="rounded-2xl border border-border bg-surface p-5 sm:p-6 shadow-card hover:shadow-card-hover transition-all duration-300 group"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Event Info */}
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center gap-2 mb-1">
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
                        <span className="truncate max-w-[200px]">{event.venue}</span>
                      )}
                    </div>
                  </div>

                  {/* Guest Count + Tier */}
                  <div className="flex items-center gap-4 sm:gap-6">
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
                    <div className="flex items-center gap-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => handleDuplicate(event)}
                        disabled={duplicatingId === event.id}
                        title="Duplicate event settings"
                        className="flex items-center gap-1 text-[11px] font-bold text-text-secondary hover:text-text-primary px-2 py-1 rounded-md hover:bg-bg-subtle transition-colors cursor-pointer"
                      >
                        <Copy size={13} />
                        <span className="hidden md:inline">{duplicatingId === event.id ? 'Cloning...' : 'Copy'}</span>
                      </button>
                      <Link
                        href={`/studio/events/${event.id}`}
                        className="flex items-center gap-1 text-xs font-bold text-accent hover:text-[#B8882F] transition-colors"
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

      {/* Quick Actions Footer */}
      <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8">
        <h3 className="text-lg font-bold text-text-primary mb-4 font-display">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link
            href="/studio/new-event"
            className="flex items-center gap-3 p-4 rounded-xl border border-border hover:border-accent/30 hover:bg-accent/5 transition-all group/action"
          >
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <PlusCircle size={18} className="text-accent" />
            </div>
            <div>
              <p className="text-sm font-bold text-text-primary">Create Event</p>
              <p className="text-xs text-text-secondary">Set up a new client event</p>
            </div>
          </Link>
          <Link
            href="/studio/settings"
            className="flex items-center gap-3 p-4 rounded-xl border border-border hover:border-accent/30 hover:bg-accent/5 transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <FileEdit size={18} className="text-accent" />
            </div>
            <div>
              <p className="text-sm font-bold text-text-primary">Studio Branding</p>
              <p className="text-xs text-text-secondary">Logo, colors & defaults</p>
            </div>
          </Link>
          <a
            href="https://api.whatsapp.com/send?phone=919866161775&text=Hi%2C%20I%20need%20help%20with%20my%20Memento%20studio%20account."
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-4 rounded-xl border border-border hover:border-green-300 hover:bg-green-50 transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
              <ExternalLink size={18} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-text-primary">Get Support</p>
              <p className="text-xs text-text-secondary">WhatsApp concierge</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
