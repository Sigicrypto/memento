"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AnimatedLogo from '@/components/AnimatedLogo';
import ThemeToggle from '@/components/ThemeToggle';

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

interface PaymentRequest {
  id: string;
  user_id: string;
  user_email: string;
  plan: string;
  amount: string;
  currency: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  notes?: string;
}

interface Stats {
  totalUsers: number;
  totalEvents: number;
  totalPhotos: number;
  activeToday: number;
  pendingApprovals: number;
  paidUsers: number;
}

type Tab = 'overview' | 'users' | 'events' | 'payments' | 'settings';

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
      console.error('Stats error:', err);
    }
  }, []);

  useEffect(() => { if (isAdmin) fetchStats(); }, [isAdmin, fetchStats]);

  // ── Fetch Users ──
  useEffect(() => {
    if (!isAdmin || activeTab !== 'users') return;
    const fetchUsers = async () => {
      setLoading(true);
      const { data: profiles } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      const { data: eventCounts } = await supabase.from('events').select('owner_id');
      const countsMap: Record<string, number> = {};
      eventCounts?.forEach(e => { countsMap[e.owner_id] = (countsMap[e.owner_id] || 0) + 1; });
      if (profiles) {
        setUsers(profiles.map(p => ({ ...p, events_count: countsMap[p.id] || 0, plan: (p.plan || 'starter').toUpperCase() })));
      }
      setLoading(false);
    };
    fetchUsers();
  }, [isAdmin, activeTab]);

  // ── Fetch Events ──
  useEffect(() => {
    if (!isAdmin || activeTab !== 'events') return;
    const fetchEvents = async () => {
      setLoading(true);
      const { data: eventsData } = await supabase.from('events').select('*').order('created_at', { ascending: false });
      if (eventsData) {
        // Fetch owner emails
        const ownerIds = [...new Set(eventsData.map(e => e.owner_id))];
        const { data: ownerProfiles } = await supabase.from('profiles').select('id, email').in('id', ownerIds);
        const emailMap: Record<string, string> = {};
        ownerProfiles?.forEach(p => { emailMap[p.id] = p.email; });

        const eventsWithCounts = await Promise.all(
          eventsData.map(async (event) => {
            const { count } = await supabase.from('photos').select('*', { count: 'exact', head: true }).eq('event_id', event.id);
            return { ...event, owner_email: emailMap[event.owner_id] || 'Unknown', photo_count: count || 0 };
          })
        );
        setEvents(eventsWithCounts);
      }
      setLoading(false);
    };
    fetchEvents();
  }, [isAdmin, activeTab]);

  // ── Actions ──
  const updateUserProfile = async (userId: string, updates: Record<string, any>) => {
    try {
      const res = await fetch('/api/admin/update-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, updates }),
      });
      
      if (res.ok) {
        return null;
      }

      // Fallback: direct supabase client update
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

  // ── Render ──

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!hasAdminAccess) {
    return (
      <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="text-5xl mb-6 drop-shadow-[0_0_15px_rgba(244,63,94,0.3)]">🚫</div>
          <h1 className="text-3xl font-black mb-3 tracking-tight">Access Denied</h1>
          <p className="text-slate-600 dark:text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
            This workspace is for administrators only. Please sign in with an authorized account or return to the main site.
          </p>
          <div className="flex flex-col gap-3">
            <Link href="/auth" className="w-full px-6 py-3.5 bg-amber-500 text-black font-black rounded-xl hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/20">
              🔐 Login as Admin
            </Link>
            <Link href="/" className="w-full px-6 py-3.5 bg-bg-subtle border border-border text-text-primary font-bold rounded-xl hover:bg-border transition-all">
              🏠 Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Styles ──
  const cardClass = "gcard cinematic-glow relative group overflow-hidden transition-all duration-300 hover:scale-[1.02]";
  const statCard = (icon: string, label: string, value: number, accent: string) => (
    <div className={cardClass}>
      <div className="gcard-border" />
      <div className="gcard-inner p-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-2xl filter drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]">{icon}</span>
          <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md" style={{color: accent, background: `${accent}15`, border: `1px solid ${accent}30`}}>Live</span>
        </div>
        <p className="text-3xl font-black tracking-tight">{value.toLocaleString()}</p>
        <p className="text-xs text-text-secondary mt-1 font-medium">{label}</p>
      </div>
    </div>
  );

  const tabs: {id: Tab; label: string; icon: string}[] = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'users', label: 'Users', icon: '👥' },
    { id: 'events', label: 'Events', icon: '🎉' },
    { id: 'payments', label: 'Payments', icon: '💳' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <div className="lp min-h-screen relative overflow-hidden">
      <div className="aurora-bg fixed inset-0 z-0" />
      <div className="grain fixed inset-0 z-1 opacity-[0.04] pointer-events-none" />

      {/* ── Toast ── */}
      {toast.show && (
        <div className={`fixed top-6 right-6 z-[9999] px-5 py-3 rounded-xl text-sm font-bold shadow-2xl transition-all ${toast.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
          {toast.message}
        </div>
      )}

      {/* ── Confirm Dialog ── */}
      {confirmDialog.open && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4" style={{background:'rgba(0,0,0,0.7)', backdropFilter:'blur(8px)'}}>
          <div className="gcard cinematic-glow p-8 max-w-md w-full text-center relative overflow-hidden">
            <div className="gcard-border" />
            <div className="gcard-inner relative z-10">
              <div className="text-4xl mb-4">⚠️</div>
              <p className="text-sm text-text-primary mb-6 leading-relaxed">{confirmDialog.message}</p>
              <div className="flex gap-3">
                <button onClick={closeConfirm} className="flex-1 py-3 rounded-xl text-sm font-bold bg-bg-subtle border border-border hover:bg-border transition">Cancel</button>
                <button onClick={confirmDialog.onConfirm} className="flex-1 py-3 rounded-xl text-sm font-bold bg-red-500/20 text-red-400 border border-red-500/20 hover:bg-red-500/30 transition">Confirm Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Sidebar + Content Layout ── */}
      <div className="flex min-h-screen relative z-10">

        {/* ── Sidebar ── */}
        <aside className="w-64 border-r border-black/20 dark:border-white/[0.08] bg-[#0d1117]/40 backdrop-blur-2xl flex flex-col shrink-0 sticky top-0 h-screen">
          {/* Brand */}
          <div className="p-6 border-b border-black/20 dark:border-white/[0.08] flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-all">
              <AnimatedLogo width={140} height={40} />
            </Link>
            <ThemeToggle />
          </div>

          {/* Nav */}
          <nav className="flex-1 p-4 space-y-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setSearchTerm(''); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-subtle'
                }`}
              >
                <span className="text-lg">{tab.icon}</span>
                {tab.label}
                {tab.id === 'users' && stats.pendingApprovals > 0 && (
                  <span className="ml-auto text-[10px] font-black bg-red-500 px-1.5 py-0.5 rounded-full">{stats.pendingApprovals}</span>
                )}
              </button>
            ))}
          </nav>

          {/* Profile chip */}
          <div className="p-4 border-t border-black/20 dark:border-white/[0.06]">
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-rose-500 flex items-center justify-center text-xs font-black ">S</div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold truncate">{user?.email}</p>
                <p className="text-[10px] text-amber-500 font-bold">{isSuperAdmin ? '⚡ Super Admin' : 'Admin'}</p>
              </div>
            </div>
            <Link href="/" className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs text-text-secondary hover:text-black dark:hover:text-text-primary hover:bg-bg-subtle transition">
              ← Back to Site
            </Link>
          </div>
        </aside>

        {/* ── Main Content ── */}
        <main className="flex-1 p-8 lg:p-12 overflow-y-auto">

          {/* ── Search Bar (for users/events) ── */}
          {(activeTab === 'users' || activeTab === 'events') && (
            <div className="mb-6">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={`Search ${activeTab}...`}
                className="w-full max-w-md px-5 py-3 rounded-xl bg-bg-subtle border border-border text-sm placeholder-slate-500 outline-none focus:border-amber-500/40 transition"
              />
            </div>
          )}

          {/* ═══════════════════ OVERVIEW ═══════════════════ */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-black tracking-tight mb-1">Dashboard</h2>
                <p className="text-sm text-text-secondary">Platform overview at a glance</p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {statCard('👤', 'Total Users', stats.totalUsers, '#3b82f6')}
                {statCard('🎉', 'Total Events', stats.totalEvents, '#f59e0b')}
                {statCard('📸', 'Total Photos', stats.totalPhotos, '#a855f7')}
                {statCard('⚡', 'Active Today', stats.activeToday, '#22c55e')}
                {statCard('⏳', 'Pending Approvals', stats.pendingApprovals, '#ef4444')}
                {statCard('💎', 'Paid Users', stats.paidUsers, '#06b6d4')}
              </div>

              {/* Quick Actions */}
              <div className={cardClass}>
                <div className="gcard-border" />
                <div className="gcard-inner p-6">
                  <h3 className="text-sm font-black uppercase tracking-widest text-slate-600 dark:text-slate-600 dark:text-slate-400 mb-4">Quick Actions</h3>
                  <div className="flex flex-wrap gap-3">
                    <button onClick={() => setActiveTab('users')} className="px-5 py-2.5 rounded-xl text-sm font-bold bg-bg-subtle border border-border hover:bg-border transition">👥 Manage Users</button>
                    <button onClick={() => setActiveTab('events')} className="px-5 py-2.5 rounded-xl text-sm font-bold bg-bg-subtle border border-border hover:bg-border transition">🎉 Manage Events</button>
                    <button onClick={handleBulkApproveAll} className="px-5 py-2.5 rounded-xl text-sm font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition">✅ Approve All Pending</button>
                    <Link href="/create" className="px-5 py-2.5 rounded-xl text-sm font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition">✨ Create Event</Link>
                    <button onClick={() => { fetchStats(); showToast('Stats refreshed'); }} className="px-5 py-2.5 rounded-xl text-sm font-bold bg-bg-subtle border border-border hover:bg-border transition">🔄 Refresh Stats</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════ USERS ═══════════════════ */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black tracking-tight mb-1">User Management</h2>
                  <p className="text-sm text-text-secondary">{filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''}</p>
                </div>
                {stats.pendingApprovals > 0 && (
                  <button onClick={handleBulkApproveAll} className="px-5 py-2.5 rounded-xl text-sm font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition">
                    ✅ Approve All ({stats.pendingApprovals})
                  </button>
                )}
              </div>

              {loading ? (
                <div className="py-20 text-center text-text-secondary">Loading users...</div>
              ) : filteredUsers.length === 0 ? (
                <div className={`${cardClass} text-center py-16 text-text-secondary`}>No users found</div>
              ) : (
                <div className="space-y-2">
                  {filteredUsers.map(u => (
                    <div key={u.id} className={cardClass}>
                      <div className="gcard-border" />
                      <div className="gcard-inner p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500/20 to-rose-500/20 border border-amber-500/20 flex items-center justify-center text-sm font-black text-amber-400 shrink-0">
                            {u.email.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold truncate">{u.email}</p>
                            <p className="text-[11px] text-text-secondary">
                              {u.full_name || 'No name'} • Joined {new Date(u.created_at).toLocaleDateString()} • 
                              <span className="text-amber-400 ml-1">{u.events_count} event{u.events_count !== 1 ? 's' : ''}</span>
                              {u.payment_status === 'paid' && <span className="text-emerald-400 ml-2">💎 Paid</span>}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 flex-wrap">
                          {/* Role Selector */}
                          <select
                            className="text-[11px] bg-bg-subtle border border-border rounded-lg px-2 py-1.5 text-text-primary outline-none font-bold cursor-pointer"
                            value={u.role || 'user'}
                            onChange={(e) => handleUpdateRole(u.id, e.target.value)}
                          >
                            <option value="user">👤 User</option>
                            <option value="admin">🔐 Admin</option>
                          </select>

                          {/* Plan Selector */}
                          <select
                            className="text-[11px] bg-amber-500/10 border border-amber-500/20 rounded-lg px-2 py-1.5 text-amber-400 outline-none font-bold uppercase cursor-pointer"
                            value={(u.plan || 'STARTER').toUpperCase()}
                            onChange={(e) => handleUpdatePlan(u.id, e.target.value)}
                          >
                            <option value="STARTER">Starter</option>
                            <option value="STANDARD">Standard</option>
                            <option value="PREMIUM">Premium</option>
                            <option value="WHITELABEL">White Label</option>
                          </select>

                          {/* Approve/Unapprove */}
                          <button
                            onClick={() => handleToggleApproval(u.id, u.is_approved)}
                            className={`text-[10px] px-3 py-1.5 rounded-lg font-black transition ${
                              u.is_approved
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-red-500/10 text-red-400 border border-red-500/20 animate-pulse'
                            }`}
                          >
                            {u.is_approved ? '✓ APPROVED' : '⚡ APPROVE'}
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => handleDeleteUser(u.id, u.email)}
                            className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center justify-center hover:bg-red-500/20 transition"
                            title="Delete user"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ═══════════════════ EVENTS ═══════════════════ */}
          {activeTab === 'events' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-black tracking-tight mb-1">Event Management</h2>
                <p className="text-sm text-text-secondary">{filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''}</p>
              </div>

              {loading ? (
                <div className="py-20 text-center text-text-secondary">Loading events...</div>
              ) : filteredEvents.length === 0 ? (
                <div className={`${cardClass} text-center py-16 text-text-secondary`}>No events found</div>
              ) : (
                <div className="space-y-2">
                  {filteredEvents.map(event => (
                    <div key={event.id} className={cardClass}>
                      <div className="gcard-border" />
                      <div className="gcard-inner p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-sm font-bold ">{event.name}</h3>
                            <p className="text-[11px] text-text-secondary">
                              By <span className="text-amber-400">{event.owner_email}</span> • {new Date(event.created_at).toLocaleDateString()}
                              {event.plan_type && <span className="ml-2 text-slate-600 dark:text-slate-600 dark:text-slate-400">({event.plan_type})</span>}
                            </p>
                          </div>
                          <button
                            onClick={() => handleDeleteEvent(event.id, event.name)}
                            className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center justify-center hover:bg-red-500/20 transition shrink-0"
                            title="Delete event"
                          >
                            🗑️
                          </button>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[11px] px-2.5 py-1 rounded-lg bg-bg-subtle border border-border text-slate-600 dark:text-slate-600 dark:text-slate-400 font-bold">📸 {event.photo_count} photos</span>
                          <span className="text-[11px] px-2.5 py-1 rounded-lg bg-bg-subtle border border-border text-slate-600 dark:text-slate-600 dark:text-slate-400 font-mono">/{event.slug}</span>
                          <Link href={`/wall/${event.slug}`} target="_blank" className="text-[11px] px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold hover:bg-amber-500/20 transition">🖼️ Wall</Link>
                          <Link href={`/mobile/${event.slug}`} target="_blank" className="text-[11px] px-3 py-1 rounded-lg bg-bg-subtle border border-border text-slate-600 dark:text-slate-600 dark:text-slate-400 font-bold hover:bg-border transition">📱 Upload</Link>
                          <Link href={`/moderate/${event.slug}`} target="_blank" className="text-[11px] px-3 py-1 rounded-lg bg-bg-subtle border border-border text-slate-600 dark:text-slate-600 dark:text-slate-400 font-bold hover:bg-border transition">🛡️ Moderate</Link>
                          <Link href={`/admin/edit-event/${event.slug}`} className="text-[11px] px-3 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold hover:bg-indigo-500/20 transition">✏️ Edit</Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ═══════════════════ PAYMENTS ═══════════════════ */}
          {activeTab === 'payments' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-black tracking-tight mb-1">Payment Management</h2>
                <p className="text-sm text-text-secondary">Manual payment approvals for WhatsApp-based purchases</p>
              </div>

              <div className={cardClass}>
                <div className="gcard-border" />
                <div className="gcard-inner p-6">
                  <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4">How It Works</h3>
                  <div className="space-y-3 text-sm text-slate-400">
                    <p>1. Users select a plan on the landing page and are redirected to WhatsApp to confirm their purchase.</p>
                    <p>2. Once you receive confirmation and verify the payment, go to the <button onClick={() => setActiveTab('users')} className="text-amber-400 underline font-bold">Users tab</button>.</p>
                    <p>3. Find the user, set their <strong>Plan</strong> to the tier they paid for, and click <strong className="text-emerald-400">✓ APPROVE</strong>.</p>
                    <p>4. The user will automatically gain access to all features of their plan.</p>
                  </div>
                </div>
              </div>

              <div className={cardClass}>
                <div className="gcard-border" />
                <div className="gcard-inner p-6">
                  <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4">Pricing Reference</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-text-secondary border-b border-black/10 dark:border-border">
                          <th className="pb-3 font-bold">Plan</th>
                          <th className="pb-3 font-bold text-right">🇮🇳 Price (INR)</th>
                        </tr>
                      </thead>
                      <tbody className="text-text-primary">
                        <tr className="border-b border-white/5"><td className="py-3 font-bold">Starter</td><td className="text-right font-mono font-bold">₹2,499</td></tr>
                        <tr className="border-b border-white/5"><td className="py-3 font-bold">Standard <span className="text-amber-400 text-xs">⭐</span></td><td className="text-right font-mono font-bold">₹4,999</td></tr>
                        <tr className="border-b border-white/5"><td className="py-3 font-bold">Premium <span className="text-red-400 text-xs">🔥</span></td><td className="text-right font-mono font-bold">₹7,499</td></tr>
                        <tr><td className="py-3 font-bold">White Label</td><td className="text-right font-mono font-bold">₹9,999</td></tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════ SETTINGS ═══════════════════ */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-black tracking-tight mb-1">System Settings</h2>
                <p className="text-sm text-text-secondary">Platform configuration and environment info</p>
              </div>

              {/* Super Admin Info */}
              <div className={cardClass}>
                <div className="gcard-border" />
                <div className="gcard-inner p-6">
                  <h3 className="text-sm font-black uppercase tracking-widest text-amber-400 mb-4">⚡ Super Admin</h3>
                  <div className="space-y-2 text-sm text-slate-600 dark:text-slate-600 dark:text-slate-400">
                    <p><span className="text-text-secondary w-28 inline-block">Email:</span> <span className="font-bold">sagarfalcon@gmail.com</span></p>
                    <p><span className="text-text-secondary w-28 inline-block">Plan Override:</span> <span className="text-amber-400 font-bold">White Label (All Features)</span></p>
                    <p><span className="text-text-secondary w-28 inline-block">Walls:</span> <span className="text-emerald-400 font-bold">Unlimited</span></p>
                    <p><span className="text-text-secondary w-28 inline-block">Status:</span> <span className="text-emerald-400 font-bold">Always Approved, Always Paid</span></p>
                  </div>
                </div>
              </div>

              {/* Environment */}
              <div className={cardClass}>
                <div className="gcard-border" />
                <div className="gcard-inner p-6">
                  <h3 className="text-sm font-black uppercase tracking-widest text-slate-600 dark:text-slate-600 dark:text-slate-400 mb-4">🔑 Environment</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between py-2 border-b border-black/5 dark:border-black/20 dark:border-black/10 dark:border-white/5">
                      <span className="text-text-secondary">Supabase URL</span>
                      <span className="text-text-primary font-mono text-xs truncate max-w-[300px]">{process.env.NEXT_PUBLIC_SUPABASE_URL || '—'}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-black/5 dark:border-black/20 dark:border-black/10 dark:border-white/5">
                      <span className="text-text-secondary">Supabase Anon Key</span>
                      <span className="text-text-primary font-mono text-xs">{process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '••••' + process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.slice(-8) : '—'}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-black/5 dark:border-black/20 dark:border-black/10 dark:border-white/5">
                      <span className="text-text-secondary">Node Env</span>
                      <span className="text-text-primary font-mono text-xs">{process.env.NODE_ENV}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Useful Links */}
              <div className={cardClass}>
                <div className="gcard-border" />
                <div className="gcard-inner p-6">
                  <h3 className="text-sm font-black uppercase tracking-widest text-slate-600 dark:text-slate-600 dark:text-slate-400 mb-4">🔗 Quick Links</h3>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {[
                      { label: 'Supabase Dashboard', url: process.env.NEXT_PUBLIC_SUPABASE_URL?.replace('.supabase.co', '.supabase.co') || '#', icon: '🗄️' },
                      { label: 'Vercel Dashboard', url: 'https://vercel.com', icon: '▲' },
                      { label: 'Razorpay Dashboard', url: 'https://dashboard.razorpay.com', icon: '💳' },
                      { label: 'WhatsApp Business', url: 'https://wa.me/96896095692', icon: '💬' },
                    ].map(link => (
                      <a key={link.label} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 rounded-xl bg-bg-subtle border border-border hover:bg-border transition text-sm text-text-primary font-medium">
                        <span className="text-lg">{link.icon}</span>
                        {link.label}
                        <span className="ml-auto text-text-secondary">↗</span>
                      </a>
                    ))}
                  </div>
                </div>
              </div>

              {/* Platform Info */}
              <div className={cardClass}>
                <div className="gcard-border" />
                <div className="gcard-inner p-6">
                  <h3 className="text-sm font-black uppercase tracking-widest text-slate-600 dark:text-slate-600 dark:text-slate-400 mb-4">ℹ️ Platform</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between py-2 border-b border-black/5 dark:border-black/20 dark:border-black/10 dark:border-white/5">
                      <span className="text-text-secondary">Framework</span>
                      <span className="text-text-primary">Next.js 16 (Turbopack)</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-black/5 dark:border-black/20 dark:border-black/10 dark:border-white/5">
                      <span className="text-text-secondary">Database</span>
                      <span className="text-text-primary">Supabase (PostgreSQL)</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-black/5 dark:border-black/20 dark:border-black/10 dark:border-white/5">
                      <span className="text-text-secondary">Storage</span>
                      <span className="text-text-primary">Supabase Storage (S3)</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-black/5 dark:border-black/20 dark:border-black/10 dark:border-white/5">
                      <span className="text-text-secondary">Auth</span>
                      <span className="text-text-primary">Supabase Auth + Google OAuth</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-black/5 dark:border-black/20 dark:border-black/10 dark:border-white/5">
                      <span className="text-text-secondary">AI Engine</span>
                      <span className="text-text-primary">face-api.js (TensorFlow)</span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-text-secondary">Payments</span>
                      <span className="text-text-primary">Razorpay (IN) / Manual (OM)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
