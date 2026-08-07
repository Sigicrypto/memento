"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AnimatedLogo from '@/components/AnimatedLogo';
import ThemeToggle from '@/components/ThemeToggle';
import SocialCampaignStudio from './social-campaign/page';
import LeadOutreachStudio from './lead-outreach/page';

// ── Types ─────────────────────────────────────────────────────
interface UserRow {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  plan: string;
  payment_status: string;
  is_approved: boolean;
  role: string;
  events_count?: number;
  phone?: string;
}

interface EventRow {
  id: string;
  name: string;
  slug: string;
  created_at: string;
  owner_id: string;
  owner_email?: string;
  photo_count?: number;
  plan_type?: string;
  expires_at?: string;
}

interface Stats {
  totalUsers: number;
  totalEvents: number;
  totalPhotos: number;
  activeToday: number;
  pendingApprovals: number;
  paidUsers: number;
}

type Tab = 'overview' | 'events' | 'users' | 'social' | 'leads' | 'meta';

// ── Component ─────────────────────────────────────────────────
export default function AdminPage() {
  const { user, profile, isLoading, isAdmin, isSuperAdmin } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [stats, setStats] = useState<Stats>({ totalUsers: 0, totalEvents: 0, totalPhotos: 0, activeToday: 0, pendingApprovals: 0, paidUsers: 0 });
  const [users, setUsers] = useState<UserRow[]>([]);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmDialog, setConfirmDialog] = useState<{open: boolean; message: string; onConfirm: () => void}>({open: false, message: '', onConfirm: () => {}});
  const [toast, setToast] = useState<{show: boolean; message: string; type: 'success' | 'error'}>({show: false, message: '', type: 'success'});

  // PWA Installation prompt state
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallPWA = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        showToast('Memento Command Center Installed! 🎉');
      }
      setDeferredPrompt(null);
    } else {
      alert(
        '📲 To install Memento Command Center app:\n\n' +
        '• iPhone (Safari): Tap Share icon ➔ "Add to Home Screen"\n' +
        '• Android (Chrome): Tap 3 dots ➔ "Install App"\n' +
        '• PC / Mac (Chrome): Click the Install icon in browser address bar'
      );
    }
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({show: true, message, type});
    setTimeout(() => setToast(prev => ({...prev, show: false})), 3000);
  };
  const showConfirm = (message: string, onConfirm: () => void) => setConfirmDialog({open: true, message, onConfirm});
  const closeConfirm = () => setConfirmDialog(prev => ({...prev, open: false}));

  const isSuperUser = user?.email?.toLowerCase() === 'sagarfalcon@gmail.com';
  const hasAdminAccess = isAdmin || isSuperAdmin || isSuperUser || profile?.role === 'admin';

  // ── Auth Gate ──
  useEffect(() => {
    if (isLoading) return;
    if (!user) { router.push('/auth'); return; }
    if (profile && !hasAdminAccess) { router.push('/'); }
  }, [user, profile, isLoading, hasAdminAccess, router]);

  // ── Fetch Stats ──
  const fetchStats = useCallback(async () => {
    try {
      const [
        { count: eventsCount },
        { count: photosCount },
        { data: profiles },
      ] = await Promise.all([
        supabase.from('events').select('*', { count: 'exact', head: true }),
        supabase.from('photos').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('id, payment_status, is_approved'),
      ]);

      const today = new Date().toISOString().split('T')[0];
      const { data: todayEvents } = await supabase.from('events').select('owner_id').gte('created_at', today);

      const totalUsers = profiles?.length || 0;
      const paidUsers = profiles?.filter(p => p.payment_status === 'paid').length || 0;
      const pendingApprovals = profiles?.filter(p => !p.is_approved).length || 0;
      const activeToday = new Set(todayEvents?.map(e => e.owner_id)).size;

      setStats({
        totalUsers,
        totalEvents: eventsCount || 0,
        totalPhotos: photosCount || 0,
        activeToday,
        pendingApprovals,
        paidUsers,
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  }, []);

  // ── Fetch Users ──
  const fetchUsers = useCallback(async () => {
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const { data: eventsData } = await supabase
        .from('events')
        .select('owner_id');

      const userEventCounts: Record<string, number> = {};
      eventsData?.forEach(e => {
        userEventCounts[e.owner_id] = (userEventCounts[e.owner_id] || 0) + 1;
      });

      const formatted: UserRow[] = (profiles || []).map(p => ({
        id: p.id,
        email: p.email || 'No email',
        full_name: p.full_name || '',
        created_at: p.created_at,
        plan: (p.plan || 'STARTER').toUpperCase(),
        payment_status: p.payment_status || 'unpaid',
        is_approved: p.is_approved ?? false,
        role: p.role || 'user',
        events_count: userEventCounts[p.id] || 0,
        phone: p.phone,
      }));

      setUsers(formatted);
    } catch (err: any) {
      console.error('Error fetching users:', err);
      showToast('Error loading users', 'error');
    }
  }, []);

  // ── Fetch Events ──
  const fetchEvents = useCallback(async () => {
    try {
      const { data: eventsData, error } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const { data: photosData } = await supabase
        .from('photos')
        .select('event_id');

      const photoCounts: Record<string, number> = {};
      photosData?.forEach(p => {
        photoCounts[p.event_id] = (photoCounts[p.event_id] || 0) + 1;
      });

      const ownerIds = Array.from(new Set((eventsData || []).map(e => e.owner_id)));
      const { data: owners } = await supabase
        .from('profiles')
        .select('id, email')
        .in('id', ownerIds.length > 0 ? ownerIds : ['none']);

      const ownerMap: Record<string, string> = {};
      owners?.forEach(o => { ownerMap[o.id] = o.email; });

      const formatted: EventRow[] = (eventsData || []).map(e => ({
        id: e.id,
        name: e.name || 'Unnamed Event',
        slug: e.slug || '',
        created_at: e.created_at,
        owner_id: e.owner_id,
        owner_email: ownerMap[e.owner_id] || 'Unknown',
        photo_count: photoCounts[e.id] || 0,
        plan_type: (e.plan_type || 'FREE').toUpperCase(),
        expires_at: e.expires_at,
      }));

      setEvents(formatted);
    } catch (err: any) {
      console.error('Error fetching events:', err);
      showToast('Error loading events', 'error');
    }
  }, []);

  useEffect(() => {
    if (hasAdminAccess) {
      setLoading(true);
      Promise.all([fetchStats(), fetchUsers(), fetchEvents()]).finally(() => setLoading(false));
    }
  }, [hasAdminAccess, fetchStats, fetchUsers, fetchEvents]);

  // ── User Management Actions ──
  const updateUserProfile = async (userId: string, updates: Partial<UserRow>) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, updates }),
      });

      if (res.ok) {
        return null;
      }

      const { error: clientError } = await supabase.from('profiles').update(updates).eq('id', userId);
      if (!clientError) {
        return null;
      }

      const data = await res.json().catch(() => ({}));
      return clientError.message || data.error || 'Failed to update user profile';
    } catch (err: any) {
      return err.message || 'Network error updating user';
    }
  };

  const handleToggleApproval = async (userId: string, current: boolean) => {
    const err = await updateUserProfile(userId, { is_approved: !current });
    if (err) { showToast('Failed: ' + err, 'error'); return; }
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_approved: !current } : u));
    showToast(!current ? 'User approved ✅' : 'User unapproved');
    fetchStats();
  };

  const handleUpdatePlan = async (userId: string, newPlan: string) => {
    const err = await updateUserProfile(userId, { plan: newPlan.toLowerCase(), payment_status: 'paid' });
    if (err) { showToast('Failed: ' + err, 'error'); return; }
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, plan: newPlan.toUpperCase(), payment_status: 'paid' } : u));
    showToast(`Plan upgraded to ${newPlan} ✅`);
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    const err = await updateUserProfile(userId, { role: newRole });
    if (err) { showToast('Failed: ' + err, 'error'); return; }
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    showToast(`Role updated to ${newRole} ✅`);
  };

  const handleDeleteUser = (userId: string, email: string) => {
    showConfirm(`Delete user "${email}" and ALL their events/photos? This cannot be undone.`, async () => {
      await supabase.from('events').delete().eq('owner_id', userId);
      await supabase.from('profiles').delete().eq('id', userId);
      setUsers(prev => prev.filter(u => u.id !== userId));
      showToast('User deleted');
      closeConfirm();
      fetchStats();
    });
  };

  const handleDeleteEvent = (eventId: string, eventName: string) => {
    showConfirm(`Delete event "${eventName}" and all its photos?`, async () => {
      await supabase.from('photos').delete().eq('event_id', eventId);
      await supabase.from('events').delete().eq('id', eventId);
      setEvents(prev => prev.filter(e => e.id !== eventId));
      showToast('Event deleted');
      closeConfirm();
      fetchStats();
    });
  };

  const handleBulkApproveAll = async () => {
    showConfirm('Approve ALL pending users?', async () => {
      const { error } = await supabase.from('profiles').update({ is_approved: true }).eq('is_approved', false);
      if (error) { showToast('Failed: ' + error.message, 'error'); closeConfirm(); return; }
      setUsers(prev => prev.map(u => ({ ...u, is_approved: true })));
      showToast('All users approved ✅');
      closeConfirm();
      fetchStats();
    });
  };

  // ── Filter ──
  const filteredUsers = users.filter(u =>
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.full_name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredEvents = events.filter(e =>
    e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (e.owner_email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const tabs: { id: Tab; label: string; icon: string; badge?: string }[] = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'events', label: 'Live Events', icon: '🎉' },
    { id: 'users', label: 'Users & Access', icon: '👥' },
    { id: 'social', label: 'Social Auto-Pilot', icon: '📣', badge: 'Meta' },
    { id: 'leads', label: 'B2B Leads & WhatsApp', icon: '💬', badge: 'Google' },
    { id: 'meta', label: 'Meta Key Setup', icon: '🔑' },
  ];

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-[#07090E] flex items-center justify-center text-slate-300 font-sans">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <span>Authenticating Command Hub...</span>
        </div>
      </div>
    );
  }

  if (!hasAdminAccess) {
    return null;
  }

  const cardClass = "relative rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl overflow-hidden shadow-xl";

  const statCard = (icon: string, label: string, val: number, color: string) => (
    <div className={cardClass}>
      <div className="p-5 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
          <p className="text-3xl font-black mt-1 text-white tracking-tight">{val}</p>
        </div>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-inner" style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
          {icon}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 font-sans selection:bg-amber-500/30">
      
      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-xl text-xs font-bold shadow-2xl flex items-center gap-2 border animate-in fade-in slide-in-from-top-3 ${
          toast.type === 'success' ? 'bg-emerald-950 border-emerald-500/40 text-emerald-300' : 'bg-red-950 border-red-500/40 text-red-300'
        }`}>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Confirm Dialog */}
      {confirmDialog.open && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Confirm Action</h3>
            <p className="text-xs text-slate-400 leading-relaxed">{confirmDialog.message}</p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button onClick={closeConfirm} className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300">Cancel</button>
              <button onClick={confirmDialog.onConfirm} className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-500 text-white">Confirm</button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar + Main Layout */}
      <div className="flex min-h-screen relative z-10 pb-20 md:pb-0">

        {/* Desktop Sidebar */}
        <aside className="w-64 border-r border-slate-800/80 bg-slate-950/90 backdrop-blur-2xl flex-col shrink-0 sticky top-0 h-screen hidden md:flex">
          <div className="p-6 border-b border-slate-800/80 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <AnimatedLogo width={130} height={36} />
            </Link>
            <ThemeToggle />
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setSearchTerm(''); }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-amber-500/20 to-purple-500/20 text-white border border-amber-500/40 shadow-lg shadow-amber-500/5'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                }`}
              >
                <span className="flex items-center gap-3">
                  <span className="text-base">{tab.icon}</span>
                  <span>{tab.label}</span>
                </span>
                {tab.badge && (
                  <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>

          {/* PWA Install Button & Profile Chip */}
          <div className="p-4 border-t border-slate-800/80 space-y-3">
            <button
              onClick={handleInstallPWA}
              className="w-full py-2.5 px-3 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
            >
              <span>📲 Install Command App</span>
            </button>

            <div className="flex items-center gap-3 px-3 py-2 bg-slate-900/80 border border-slate-800 rounded-xl">
              <div className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center text-xs font-black">S</div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold truncate text-slate-200">{user?.email}</p>
                <p className="text-[10px] text-amber-400 font-bold">⚡ Command Center Owner</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Body */}
        <main className="flex-1 p-4 md:p-8 lg:p-10 overflow-y-auto">

          {/* Top Mobile Bar */}
          <div className="md:hidden flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
            <Link href="/">
              <AnimatedLogo width={120} height={32} />
            </Link>
            <div className="flex items-center gap-2">
              <button
                onClick={handleInstallPWA}
                className="px-3 py-1.5 bg-emerald-600 text-white text-[11px] font-bold rounded-lg"
              >
                📲 Install App
              </button>
              <ThemeToggle />
            </div>
          </div>

          {/* Search Bar for Users/Events */}
          {(activeTab === 'users' || activeTab === 'events') && (
            <div className="mb-6">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={`Search ${activeTab}...`}
                className="w-full max-w-md px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 outline-none focus:border-amber-500/40 transition shadow-inner"
              />
            </div>
          )}

          {/* ═══════════════════ 1. OVERVIEW TAB ═══════════════════ */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-black tracking-tight text-white mb-1">Master Command Center</h2>
                <p className="text-xs text-slate-400">Live platform operations and stats at a glance.</p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {statCard('👤', 'Total Users', stats.totalUsers, '#3b82f6')}
                {statCard('🎉', 'Total Events', stats.totalEvents, '#f59e0b')}
                {statCard('📸', 'Total Photos Uploaded', stats.totalPhotos, '#a855f7')}
                {statCard('⚡', 'Active Hosts Today', stats.activeToday, '#22c55e')}
                {statCard('⏳', 'Pending Approvals', stats.pendingApprovals, '#ef4444')}
                {statCard('💎', 'Paid Subscribers', stats.paidUsers, '#06b6d4')}
              </div>

              {/* Quick Hub Launchers */}
              <div className={cardClass}>
                <div className="p-6 space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Command Hub Launchers</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <button
                      onClick={() => setActiveTab('social')}
                      className="p-4 bg-purple-950/30 border border-purple-500/30 hover:border-purple-500/60 rounded-xl text-left transition-all group"
                    >
                      <span className="text-xl block mb-1">📣</span>
                      <p className="text-xs font-bold text-white group-hover:text-purple-300">Social Auto-Pilot Studio</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Automated Facebook & Instagram marketing broadcasts.</p>
                    </button>

                    <button
                      onClick={() => setActiveTab('leads')}
                      className="p-4 bg-emerald-950/30 border border-emerald-500/30 hover:border-emerald-500/60 rounded-xl text-left transition-all group"
                    >
                      <span className="text-xl block mb-1">💬</span>
                      <p className="text-xs font-bold text-white group-hover:text-emerald-300">B2B Leads & WhatsApp</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Google Places lead search & WhatsApp outreach launcher.</p>
                    </button>

                    <button
                      onClick={() => setActiveTab('events')}
                      className="p-4 bg-amber-950/30 border border-amber-500/30 hover:border-amber-500/60 rounded-xl text-left transition-all group"
                    >
                      <span className="text-xl block mb-1">🎉</span>
                      <p className="text-xs font-bold text-white group-hover:text-amber-300">Live Photo Walls</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Manage live event streams, lock/unlock feeds.</p>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════ 2. EVENTS TAB ═══════════════════ */}
          {activeTab === 'events' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black tracking-tight text-white mb-1">Live Events & Photo Walls</h2>
                  <p className="text-xs text-slate-400">{filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''}</p>
                </div>
                <Link href="/create" className="px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 transition">
                  ✨ Create Event
                </Link>
              </div>

              {loading ? (
                <div className="py-20 text-center text-slate-400 text-xs">Loading events...</div>
              ) : filteredEvents.length === 0 ? (
                <div className={`${cardClass} text-center py-16 text-slate-500 text-xs`}>No events found</div>
              ) : (
                <div className="space-y-3">
                  {filteredEvents.map(e => (
                    <div key={e.id} className={cardClass}>
                      <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white">{e.name}</span>
                            <span className="text-[10px] font-semibold px-2 py-0.5 bg-slate-800 text-amber-300 border border-slate-700 rounded-full font-mono">
                              /{e.slug}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400">
                            Owner: <span className="text-slate-200">{e.owner_email}</span> • 
                            <span className="text-purple-400 font-bold ml-1">{e.photo_count} photos</span>
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <a
                            href={`/wall/${e.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-1.5 bg-blue-600/20 text-blue-300 text-xs font-semibold rounded-lg border border-blue-500/30 hover:bg-blue-600/30 transition"
                          >
                            Live Wall ➔
                          </a>
                          <button
                            onClick={() => handleDeleteEvent(e.id, e.name)}
                            className="px-3 py-1.5 bg-red-600/20 text-red-300 text-xs font-semibold rounded-lg border border-red-500/30 hover:bg-red-600/30 transition"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ═══════════════════ 3. USERS TAB ═══════════════════ */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black tracking-tight text-white mb-1">User & Access Control</h2>
                  <p className="text-xs text-slate-400">{filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''}</p>
                </div>
                {stats.pendingApprovals > 0 && (
                  <button onClick={handleBulkApproveAll} className="px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 transition">
                    ✅ Approve All Pending ({stats.pendingApprovals})
                  </button>
                )}
              </div>

              {loading ? (
                <div className="py-20 text-center text-slate-400 text-xs">Loading users...</div>
              ) : filteredUsers.length === 0 ? (
                <div className={`${cardClass} text-center py-16 text-slate-500 text-xs`}>No users found</div>
              ) : (
                <div className="space-y-3">
                  {filteredUsers.map(u => (
                    <div key={u.id} className={cardClass}>
                      <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-500/20 to-purple-500/20 border border-amber-500/30 flex items-center justify-center text-xs font-black text-amber-300">
                            {u.email.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-white">{u.email}</p>
                            <p className="text-[11px] text-slate-400">
                              {u.full_name || 'No name'} • <span className="text-amber-400">{u.events_count} events</span>
                              {u.payment_status === 'paid' && <span className="text-emerald-400 ml-2">💎 Paid Subscriber</span>}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleApproval(u.id, u.is_approved)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                              u.is_approved ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                            }`}
                          >
                            {u.is_approved ? 'Approved ✅' : 'Approve User'}
                          </button>

                          <button
                            onClick={() => handleDeleteUser(u.id, u.email)}
                            className="px-3 py-1.5 bg-red-600/20 text-red-300 text-xs font-semibold rounded-lg border border-red-500/30 hover:bg-red-600/30 transition"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ═══════════════════ 4. SOCIAL AUTO-PILOT TAB ═══════════════════ */}
          {activeTab === 'social' && (
            <div className="space-y-4">
              <SocialCampaignStudio />
            </div>
          )}

          {/* ═══════════════════ 5. B2B LEADS TAB ═══════════════════ */}
          {activeTab === 'leads' && (
            <div className="space-y-4">
              <LeadOutreachStudio />
            </div>
          )}

          {/* ═══════════════════ 6. META SETUP TAB ═══════════════════ */}
          {activeTab === 'meta' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black tracking-tight text-white mb-1">Meta Credentials & System Setup</h2>
                  <p className="text-xs text-slate-400">Configure Meta Graph API tokens and Instagram Business connections.</p>
                </div>
                <a
                  href="/admin/meta-setup"
                  className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-500 transition"
                >
                  Open Meta Setup Helper ➔
                </a>
              </div>

              <div className={cardClass}>
                <div className="p-6 space-y-4">
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Active System Status</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-1 font-mono text-xs">
                      <span className="text-slate-400 block text-[10px]">META PAGE ACCESS TOKEN STATUS:</span>
                      <span className="text-emerald-400 font-bold">Active System User Token</span>
                    </div>

                    <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-1 font-mono text-xs">
                      <span className="text-slate-400 block text-[10px]">INSTAGRAM BUSINESS ACCOUNT ID:</span>
                      <span className="text-pink-400 font-bold">17841473910587567 (@my_memento_app)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* Mobile Bottom Navigation Bar for One-Thumb Switching */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 border-t border-slate-800 backdrop-blur-xl px-2 py-2 flex items-center justify-around">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center gap-1 p-2 rounded-lg text-center transition-all ${
              activeTab === tab.id ? 'text-amber-400 font-bold' : 'text-slate-400'
            }`}
          >
            <span className="text-lg">{tab.icon}</span>
            <span className="text-[10px] truncate max-w-[56px]">{tab.label.split(' ')[0]}</span>
          </button>
        ))}
      </nav>

    </div>
  );
}
