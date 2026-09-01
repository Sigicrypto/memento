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
  referred_by_partner_id?: string;
  promoter_upi?: string;
  promoter_whatsapp?: string;
  promoter_name?: string;
  referrals_count?: number;
}

interface PartnerLinkRow {
  code: string;
  name: string;
  email?: string;
  whatsapp?: string;
  upi?: string;
  is_verified?: boolean;
  referrals_count: number;
  referred_users?: string[];
  created_at?: string;
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

type Tab = 'overview' | 'events' | 'users' | 'social' | 'leads' | 'meta' | 'referrals';

// ── Component ─────────────────────────────────────────────────
export default function AdminPage() {
  const { user, profile, isLoading, isAdmin, isSuperAdmin } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [stats, setStats] = useState<Stats>({ totalUsers: 0, totalEvents: 0, totalPhotos: 0, activeToday: 0, pendingApprovals: 0, paidUsers: 0 });
  const [users, setUsers] = useState<UserRow[]>([]);
  const [partnerLinks, setPartnerLinks] = useState<PartnerLinkRow[]>([]);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmDialog, setConfirmDialog] = useState<{open: boolean; message: string; onConfirm: () => void}>({open: false, message: '', onConfirm: () => {}});
  const [toast, setToast] = useState<{show: boolean; message: string; type: 'success' | 'error'}>({show: false, message: '', type: 'success'});

  // PWA Installation prompt state
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // Referral partner assignment modal state
  const [referralModal, setReferralModal] = useState<{
    open: boolean;
    userId: string;
    userName: string;
    currentCode: string;
  }>({
    open: false,
    userId: '',
    userName: '',
    currentCode: '',
  });
  const [partnerInput, setPartnerInput] = useState('');
  const [sqlBannerOpen, setSqlBannerOpen] = useState(false);

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

      // Calculate referral counts and referred users per partner ID
      const referralCounts: Record<string, number> = {};
      const referredUsersMap: Record<string, string[]> = {};
      (profiles || []).forEach(p => {
        if (p.referred_by_partner_id) {
          const code = p.referred_by_partner_id.toUpperCase();
          referralCounts[code] = (referralCounts[code] || 0) + 1;
          if (!referredUsersMap[code]) referredUsersMap[code] = [];
          referredUsersMap[code].push(p.full_name || p.email || 'Host');
        }
      });

      // Fetch verified promoter profiles from resilient API & Supabase
      let promotersData: any[] = [];
      try {
        const promRes = await fetch('/api/promoters');
        const promJson = await promRes.json();
        if (promJson?.promoters && Array.isArray(promJson.promoters)) {
          promotersData = promJson.promoters;
        }
      } catch (promErr) {
        console.warn('API promoters fetch note:', promErr);
      }

      // Also try direct Supabase table if available
      try {
        const { data: dbPromoters } = await supabase
          .from('promoters')
          .select('*')
          .order('updated_at', { ascending: false });

        if (dbPromoters && Array.isArray(dbPromoters)) {
          // Merge unique promoters
          const existingCodes = new Set(promotersData.map(p => (p.partner_code || '').toUpperCase()));
          dbPromoters.forEach(p => {
            if (p.partner_code && !existingCodes.has(p.partner_code.toUpperCase())) {
              promotersData.push(p);
            }
          });
        }
      } catch (dbErr) {
        // Table might not exist yet
      }

      const promoterMap: Record<string, any> = {};
      const partnersMap: Record<string, PartnerLinkRow> = {};

      promotersData?.forEach(p => {
        if (p.partner_code) {
          const code = p.partner_code.toUpperCase();
          promoterMap[code] = p;
          partnersMap[code] = {
            code,
            name: p.full_name || 'Active Affiliate Partner',
            whatsapp: p.whatsapp_number,
            upi: p.upi_id,
            is_verified: p.is_verified ?? Boolean(p.upi_id),
            referrals_count: referralCounts[code] || 0,
            referred_users: referredUsersMap[code] || [],
            created_at: p.created_at || p.updated_at,
          };
        }
      });

      // Include partner codes from referred users if not yet in promoters
      Object.keys(referralCounts).forEach(code => {
        if (!partnersMap[code]) {
          partnersMap[code] = {
            code,
            name: `Affiliate Partner (${code})`,
            referrals_count: referralCounts[code],
            referred_users: referredUsersMap[code] || [],
          };
        }
      });

      // Include default host user codes
      (profiles || []).forEach(p => {
        const defaultRefCode = `MEM-${p.id.substring(0, 4).toUpperCase()}`;
        if (!partnersMap[defaultRefCode]) {
          partnersMap[defaultRefCode] = {
            code: defaultRefCode,
            name: p.full_name || 'Host Account Partner',
            email: p.email,
            whatsapp: p.phone,
            referrals_count: referralCounts[defaultRefCode] || 0,
            referred_users: referredUsersMap[defaultRefCode] || [],
          };
        }
      });

      const allPartnerLinks = Object.values(partnersMap).sort((a, b) => (b.referrals_count || 0) - (a.referrals_count || 0));
      setPartnerLinks(allPartnerLinks);

      const formatted: UserRow[] = (profiles || []).map(p => {
        const defaultRefCode = `MEM-${p.id.substring(0, 4).toUpperCase()}`;
        const promoterProfile = promoterMap[defaultRefCode] || promoterMap[(p.referred_by_partner_id || '').toUpperCase()];

        return {
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
          referred_by_partner_id: p.referred_by_partner_id,
          promoter_upi: promoterProfile?.upi_id,
          promoter_whatsapp: promoterProfile?.whatsapp_number,
          promoter_name: promoterProfile?.full_name,
          referrals_count: referralCounts[defaultRefCode] || 0,
        };
      });

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
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token || '';

      const res = await fetch('/api/admin/update-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ userId, updates }),
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        return null;
      }

      // Fallback client update if RLS permits
      const { error: clientError } = await supabase.from('profiles').update(updates).eq('id', userId);
      if (!clientError) {
        return null;
      }

      return data.error || clientError.message || 'Failed to update user profile';
    } catch (err: any) {
      return err.message || 'Network error updating user';
    }
  };

  const handleToggleApproval = async (userId: string, current: boolean) => {
    const err = await updateUserProfile(userId, { is_approved: !current });
    if (err) { showToast('Failed: ' + err, 'error'); return; }
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_approved: !current } : u));
    showToast(!current ? 'User approved ✅' : 'User unapproved');
    fetchUsers();
    fetchStats();
  };

  const handleUpdatePlan = async (userId: string, newPlan: string) => {
    const planNormalized = newPlan.toLowerCase();
    const isPaid = planNormalized !== 'free';
    const err = await updateUserProfile(userId, { 
      plan: planNormalized, 
      payment_status: isPaid ? 'paid' : 'pending' 
    });
    if (err) { showToast('Failed: ' + err, 'error'); return; }
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, plan: newPlan.toUpperCase(), payment_status: isPaid ? 'paid' : 'pending' } : u));
    showToast(`Plan updated to ${newPlan} ✅`);
    fetchUsers();
    fetchStats();
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    const err = await updateUserProfile(userId, { role: newRole });
    if (err) { showToast('Failed: ' + err, 'error'); return; }
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    showToast(`Role updated to ${newRole} ✅`);
    fetchUsers();
  };

  const handleUpdateReferralPartner = async (userId: string, partnerCode: string) => {
    const formattedCode = partnerCode ? partnerCode.trim().toUpperCase() : '';
    const err = await updateUserProfile(userId, { 
      referred_by_partner_id: formattedCode || undefined,
    });
    if (err) { 
      showToast('Failed to update referral partner: ' + err, 'error'); 
      return; 
    }
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, referred_by_partner_id: formattedCode || undefined } : u));
    showToast(formattedCode ? `Assigned to Partner ${formattedCode} ✅` : 'Referral partner unlinked');
    setReferralModal({ open: false, userId: '', userName: '', currentCode: '' });
    fetchUsers();
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
    (u.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.plan || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.role || '').toLowerCase().includes(searchTerm.toLowerCase())
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
    { id: 'referrals', label: '10% Partner Desk', icon: '🤝', badge: '10%' },
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

            <Link
              href="/dashboard/branding"
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500/20"
            >
              <span className="flex items-center gap-3">
                <span className="text-base">🎨</span>
                <span>White-Label Settings</span>
              </span>
              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300">PRO</span>
            </Link>
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
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-500/20 to-purple-500/20 border border-amber-500/30 flex items-center justify-center text-xs font-black text-amber-300 shrink-0">
                            {u.email.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-xs font-bold text-white">{u.email}</p>

                              {/* Role Badge */}
                              {(u.role === 'admin' || u.email.toLowerCase() === 'sagarfalcon@gmail.com') && (
                                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full border uppercase tracking-wider bg-purple-500/20 text-purple-300 border-purple-500/40 flex items-center gap-1">
                                  🛡️ {u.email.toLowerCase() === 'sagarfalcon@gmail.com' ? 'Super Admin' : 'Admin'}
                                </span>
                              )}

                              {/* Plan Tier Badge */}
                              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border uppercase tracking-wider ${
                                (u.plan || '').toUpperCase() === 'PROFESSIONAL' || (u.plan || '').toUpperCase() === 'WHITELABEL' || (u.plan || '').toUpperCase() === 'WHITE_LABEL' ? 'bg-purple-500/20 text-purple-300 border-purple-500/40' :
                                (u.plan || '').toUpperCase() === 'PREMIUM' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
                                (u.plan || '').toUpperCase() === 'EVENT' || (u.plan || '').toUpperCase() === 'STARTER' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' :
                                'bg-slate-800 text-slate-400 border-slate-700'
                              }`}>
                                {(u.plan || '').toUpperCase() === 'WHITELABEL' ? 'PROFESSIONAL' : (u.plan || 'FREE')}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              {u.full_name || 'No name'} • <span className="text-amber-400">{u.events_count} events</span>
                              {u.payment_status === 'paid' && <span className="text-emerald-400 ml-2">💎 Paid</span>}
                            </p>

                            {/* Referral Link & Promoter Badges */}
                            <div className="flex items-center gap-2 flex-wrap mt-1.5 font-mono text-[10px]">
                              <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-bold">
                                🔗 Code: MEM-{u.id.substring(0, 4).toUpperCase()}
                              </span>

                              {u.promoter_upi && (
                                <span className="px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/30 text-purple-300 font-bold">
                                  💳 UPI: {u.promoter_upi}
                                </span>
                              )}

                              <button
                                onClick={() => {
                                  setReferralModal({
                                    open: true,
                                    userId: u.id,
                                    userName: u.full_name || u.email,
                                    currentCode: u.referred_by_partner_id || '',
                                  });
                                  setPartnerInput(u.referred_by_partner_id || '');
                                }}
                                className="px-2 py-0.5 rounded bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 font-bold transition text-[10px] cursor-pointer flex items-center gap-1"
                                title="Click to assign or change referral partner code"
                              >
                                <span>{u.referred_by_partner_id ? `🎁 Referred By: ${u.referred_by_partner_id}` : '🏷️ Assign Partner'}</span>
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                          {/* Plan Upgrade Selector */}
                          <select
                            value={
                              (u.plan || '').toUpperCase() === 'WHITELABEL' || (u.plan || '').toUpperCase() === 'WHITE_LABEL' ? 'PROFESSIONAL' :
                              (u.plan || 'FREE').toUpperCase()
                            }
                            onChange={(e) => handleUpdatePlan(u.id, e.target.value)}
                            className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-slate-950 border border-slate-700 text-amber-300 outline-none focus:border-amber-500 transition cursor-pointer"
                            title="Upgrade User Tier"
                          >
                            <option value="FREE">Free (₹0)</option>
                            <option value="EVENT">⚡ Event Pass (₹999 / $12)</option>
                            <option value="PREMIUM">🔥 Premium Pass (₹2,999 / $39)</option>
                            <option value="PROFESSIONAL">👑 Professional (₹7,999/mo / $99/mo)</option>
                          </select>

                          {/* Role Access Selector */}
                          <select
                            value={u.role || 'user'}
                            onChange={(e) => handleUpdateRole(u.id, e.target.value)}
                            className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-slate-950 border border-slate-700 text-purple-300 outline-none focus:border-purple-500 transition cursor-pointer"
                            title="Change Access Role"
                          >
                            <option value="user">👤 User</option>
                            <option value="admin">🛡️ Admin</option>
                          </select>

                          <button
                            onClick={() => handleToggleApproval(u.id, u.is_approved)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                              u.is_approved ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                            }`}
                          >
                            {u.is_approved ? 'Approved ✅' : 'Approve'}
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

          {/* ═══════════════════ 3.5 10% PARTNER PAYOUT DESK TAB ═══════════════════ */}
          {activeTab === 'referrals' && (() => {
            const referredHostsList = users.filter(u => u.referred_by_partner_id);
            const pendingPayoutsList = users.filter(u => u.referred_by_partner_id && (u.payment_status === 'paid' || (u.plan && u.plan !== 'FREE' && u.plan !== 'STARTER')));
            const totalPendingAmount = pendingPayoutsList.reduce((sum, u) => {
              const p = (u.plan || '').toUpperCase();
              if (p === 'PREMIUM') return sum + 300;
              if (p === 'PROFESSIONAL' || p === 'WHITELABEL' || p === 'PRO') return sum + 800;
              return sum + 100;
            }, 0);

            return (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-black tracking-tight text-white mb-1 flex items-center gap-2">
                      <span>10% Event Partner Desk & UPI Payouts</span>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
                        Active
                      </span>
                    </h2>
                    <p className="text-xs text-slate-400">Review promoter registrations, verify host-vs-promoter anti-fraud checks, and release UPI cash transfers.</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSqlBannerOpen(!sqlBannerOpen)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-700 transition cursor-pointer flex items-center gap-1.5"
                    >
                      <span>🗄️ Database Setup</span>
                    </button>
                    <button
                      onClick={() => {
                        if (users.length > 0) {
                          setReferralModal({
                            open: true,
                            userId: users[0].id,
                            userName: users[0].full_name || users[0].email,
                            currentCode: users[0].referred_by_partner_id || '',
                          });
                          setPartnerInput(users[0].referred_by_partner_id || '');
                        }
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-black shadow-lg shadow-emerald-500/20 transition cursor-pointer"
                    >
                      <span>🏷️ Tag / Assign Referral</span>
                    </button>
                  </div>
                </div>

                {/* Optional Supabase SQL Schema Banner (Collapsible) */}
                {sqlBannerOpen && (
                  <div className="p-5 rounded-2xl bg-slate-900 border border-purple-500/40 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-purple-300 uppercase tracking-wider">
                        Supabase PostgreSQL Migration Snippet
                      </span>
                      <button
                        onClick={() => {
                          const sql = `-- 1. Add referred_by_partner_id column to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referred_by_partner_id text;

-- 2. Create promoters table
CREATE TABLE IF NOT EXISTS promoters (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    partner_code text UNIQUE NOT NULL,
    full_name text,
    whatsapp_number text,
    upi_id text,
    is_verified boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 3. Enable RLS
ALTER TABLE promoters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read promoters" ON promoters FOR SELECT USING (true);
CREATE POLICY "Allow public insert promoters" ON promoters FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update promoters" ON promoters FOR UPDATE USING (true);`;
                          navigator.clipboard.writeText(sql);
                          showToast('SQL snippet copied to clipboard! ✅');
                        }}
                        className="px-2.5 py-1 rounded bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 text-xs font-bold transition"
                      >
                        📋 Copy SQL
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Paste this SQL in your <strong>Supabase SQL Editor</strong> to create the <code>promoters</code> table and <code>referred_by_partner_id</code> column in PostgreSQL.
                    </p>
                  </div>
                )}

                {/* Stat Summary Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className={cardClass}>
                    <div className="p-4">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">PENDING PAYOUTS</p>
                      <p className="text-2xl font-black text-amber-400 mt-1">₹{totalPendingAmount.toLocaleString()}</p>
                      <p className="text-[11px] text-slate-500 mt-1">{pendingPayoutsList.length} bookings ready for UPI transfer</p>
                    </div>
                  </div>

                  <div className={cardClass}>
                    <div className="p-4">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">TOTAL REFERRED HOSTS</p>
                      <p className="text-2xl font-black text-emerald-400 mt-1">{referredHostsList.length}</p>
                      <p className="text-[11px] text-slate-500 mt-1">Signed up with partner codes</p>
                    </div>
                  </div>

                  <div className={cardClass}>
                    <div className="p-4">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">REGISTERED PROMOTERS</p>
                      <p className="text-2xl font-black text-cyan-400 mt-1">{partnerLinks.length}</p>
                      <p className="text-[11px] text-slate-500 mt-1">Active partner links & profiles</p>
                    </div>
                  </div>

                  <div className={cardClass}>
                    <div className="p-4">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">CONVERTED DEALS</p>
                      <p className="text-2xl font-black text-purple-400 mt-1">{pendingPayoutsList.length}</p>
                      <p className="text-[11px] text-slate-500 mt-1">Paid referral bookings</p>
                    </div>
                  </div>
                </div>

                {/* 1. Referral Redemptions & Bonus Queue */}
                <div className={cardClass}>
                  <div className="p-5 border-b border-slate-800 flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <span>Referral Bonus Queue (Credited within 24h)</span>
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-bold">
                          {pendingPayoutsList.length} Pending Approval
                        </span>
                      </h3>
                      <p className="text-xs text-slate-400">10% cash referral bonus due for paid bookings.</p>
                    </div>
                  </div>

                  {pendingPayoutsList.length === 0 ? (
                    <div className="p-10 text-center flex flex-col items-center justify-center space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 text-xl">
                        🤝
                      </div>
                      <h4 className="text-sm font-bold text-white">No Pending Referral Payouts</h4>
                      <p className="text-xs text-slate-400 max-w-md leading-relaxed">
                        When users register via partner links (<code>mymementoapp.com/join?ref=MEM-XXXX</code>) and complete bookings, 10% referral bonus payouts appear here for 1-click UPI approval.
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs text-slate-300">
                        <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                          <tr>
                            <th className="p-4">Referred Host</th>
                            <th className="p-4">Referred By (Partner)</th>
                            <th className="p-4">Plan & Status</th>
                            <th className="p-4">10% Commission</th>
                            <th className="p-4">Partner UPI ID</th>
                            <th className="p-4 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 font-mono">
                          {pendingPayoutsList.map(u => {
                            const bonus = (u.plan || '').toUpperCase() === 'PREMIUM' ? 300 : (u.plan || '').toUpperCase() === 'WHITELABEL' || (u.plan || '').toUpperCase() === 'PRO' ? 800 : 100;
                            const partnerCode = (u.referred_by_partner_id || '').toUpperCase();
                            const partnerInfo = partnerLinks.find(p => p.code === partnerCode);

                            return (
                              <tr key={u.id} className="hover:bg-slate-800/30 transition">
                                <td className="p-4 font-sans">
                                  <span className="font-bold text-white block">{u.full_name || 'Host'}</span>
                                  <span className="text-[11px] text-slate-400 font-mono">{u.email}</span>
                                </td>

                                <td className="p-4">
                                  <span className="font-bold text-emerald-400 block">{partnerCode}</span>
                                  <span className="text-[11px] text-white font-sans">{partnerInfo?.name || u.promoter_name || 'Affiliate Partner'}</span>
                                </td>

                                <td className="p-4 font-sans">
                                  <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30 text-[10px]">
                                    {u.plan}
                                  </span>
                                  <span className="text-[10px] text-emerald-400 block mt-1">💎 {u.payment_status}</span>
                                </td>

                                <td className="p-4">
                                  <span className="text-base font-black text-amber-300">₹{bonus}</span>
                                  <span className="text-[10px] text-slate-400 font-sans block">10% of deal</span>
                                </td>

                                <td className="p-4 font-sans">
                                  {partnerInfo?.upi || u.promoter_upi ? (
                                    <>
                                      <span className="font-bold text-purple-300 font-mono block">{partnerInfo?.upi || u.promoter_upi}</span>
                                      <span className="text-[10px] text-slate-400">{partnerInfo?.whatsapp || u.promoter_whatsapp || 'No phone'}</span>
                                    </>
                                  ) : (
                                    <span className="text-slate-500 text-[11px] italic">Pending UPI profile</span>
                                  )}
                                </td>

                                <td className="p-4 text-right font-sans space-x-2">
                                  <button
                                    onClick={() => {
                                      if (partnerInfo?.upi || u.promoter_upi) {
                                        navigator.clipboard.writeText(partnerInfo?.upi || u.promoter_upi || '');
                                        showToast('UPI ID copied to clipboard! ✅');
                                      } else {
                                        showToast('Partner has not registered UPI yet', 'error');
                                      }
                                    }}
                                    className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-bold text-[11px] transition"
                                  >
                                    📋 Copy UPI
                                  </button>

                                  <button
                                    onClick={() => {
                                      setReferralModal({
                                        open: true,
                                        userId: u.id,
                                        userName: u.full_name || u.email,
                                        currentCode: u.referred_by_partner_id || '',
                                      });
                                      setPartnerInput(u.referred_by_partner_id || '');
                                    }}
                                    className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-[11px] transition"
                                  >
                                    ✏️ Edit
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* 2. Referred Host Signups Directory */}
                <div className={cardClass}>
                  <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <span>Referred Host Signups Directory</span>
                        <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[10px] font-bold">
                          {referredHostsList.length} Referred Accounts
                        </span>
                      </h3>
                      <p className="text-xs text-slate-400">All registered users tagged with an active referral partner code.</p>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-300">
                      <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                        <tr>
                          <th className="p-4">Referred Host</th>
                          <th className="p-4">Referred By Partner</th>
                          <th className="p-4">Plan & Status</th>
                          <th className="p-4">10% Bonus Potential</th>
                          <th className="p-4">Registered Date</th>
                          <th className="p-4 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 font-mono">
                        {referredHostsList.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="p-8 text-center text-slate-500 text-xs font-sans">
                              No referred host signups found yet. Click <strong>"Tag / Assign Referral"</strong> above to link any user to a partner code.
                            </td>
                          </tr>
                        ) : (
                          referredHostsList.map(u => {
                            const partnerCode = (u.referred_by_partner_id || '').toUpperCase();
                            const partnerInfo = partnerLinks.find(p => p.code === partnerCode);
                            const bonus = (u.plan || '').toUpperCase() === 'PREMIUM' ? 300 : (u.plan || '').toUpperCase() === 'WHITELABEL' || (u.plan || '').toUpperCase() === 'PRO' ? 800 : 100;

                            return (
                              <tr key={u.id} className="hover:bg-slate-800/30 transition">
                                <td className="p-4 font-sans">
                                  <span className="font-bold text-white block">{u.full_name || 'Host'}</span>
                                  <span className="text-[11px] text-slate-400 font-mono">{u.email}</span>
                                  {u.phone && <span className="text-[10px] text-slate-500 font-mono block">{u.phone}</span>}
                                </td>

                                <td className="p-4">
                                  <span className="font-bold text-emerald-400 block">{partnerCode}</span>
                                  <span className="text-[11px] text-white font-sans">{partnerInfo?.name || 'Affiliate Partner'}</span>
                                </td>

                                <td className="p-4 font-sans">
                                  <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30 text-[10px]">
                                    {u.plan}
                                  </span>
                                  <span className="text-[10px] text-slate-400 block mt-1">Status: {u.payment_status}</span>
                                </td>

                                <td className="p-4">
                                  <span className="text-sm font-black text-amber-300">₹{bonus}</span>
                                  <span className="text-[10px] text-slate-400 font-sans block">{u.payment_status === 'paid' ? 'Eligible for Payout' : 'Pending Booking'}</span>
                                </td>

                                <td className="p-4 text-slate-400 text-[11px] font-sans">
                                  {u.created_at ? new Date(u.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recent'}
                                </td>

                                <td className="p-4 text-right font-sans space-x-2">
                                  <button
                                    onClick={() => {
                                      setReferralModal({
                                        open: true,
                                        userId: u.id,
                                        userName: u.full_name || u.email,
                                        currentCode: u.referred_by_partner_id || '',
                                      });
                                      setPartnerInput(u.referred_by_partner_id || '');
                                    }}
                                    className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-[11px] transition"
                                  >
                                    ✏️ Change Partner
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 3. Generated Partner Referral Links Directory */}
                <div className={cardClass}>
                  <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <span>Generated Partner Referral Links Directory</span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
                          {partnerLinks.length} Active Partner Links
                        </span>
                      </h3>
                      <p className="text-xs text-slate-400">Complete master list of auto-generated 1-click referral links, promoter UPI IDs, and referred user counts.</p>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-300">
                      <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                        <tr>
                          <th className="p-4">Partner Code & Name</th>
                          <th className="p-4">1-Click Referral Link</th>
                          <th className="p-4">Registered UPI & WhatsApp</th>
                          <th className="p-4">Referred Hosts</th>
                          <th className="p-4 text-right">Quick Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 font-mono">
                        {partnerLinks.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="p-8 text-center text-slate-500 text-xs font-sans">
                              No partner referral links generated yet.
                            </td>
                          </tr>
                        ) : (
                          partnerLinks.map(p => {
                            const refCode = p.code;
                            const link = `https://mymementoapp.com/join?ref=${refCode}`;
                            const cleanPhone = (p.whatsapp || '').replace(/[^0-9]/g, '');
                            const waPhone = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;

                            return (
                              <tr key={p.code} className="hover:bg-slate-800/30 transition">
                                <td className="p-4">
                                  <span className="font-bold text-emerald-400 block">{refCode}</span>
                                  <span className="text-[11px] text-white font-sans font-bold block">{p.name}</span>
                                  {p.email && <span className="text-[10px] text-slate-400 font-sans">{p.email}</span>}
                                </td>

                                <td className="p-4 font-mono text-slate-200">
                                  <span className="text-emerald-300 font-bold block text-[11px] break-all">{link}</span>
                                </td>

                                <td className="p-4 font-sans">
                                  {p.upi ? (
                                    <>
                                      <span className="font-bold text-purple-300 block">{p.upi}</span>
                                      <span className="text-[11px] text-slate-400 block">{p.whatsapp || 'No phone'}</span>
                                    </>
                                  ) : (
                                    <span className="text-slate-500 text-[11px] italic">Link active (Pending UPI profile)</span>
                                  )}
                                </td>

                                <td className="p-4 font-sans">
                                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                    (p.referrals_count || 0) > 0 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-400 border border-slate-700'
                                  }`}>
                                    👥 {p.referrals_count || 0} Referred Host{(p.referrals_count || 0) !== 1 ? 's' : ''}
                                  </span>
                                  {p.referred_users && p.referred_users.length > 0 && (
                                    <span className="text-[10px] text-slate-400 block mt-1">
                                      {p.referred_users.slice(0, 2).join(', ')}{p.referred_users.length > 2 ? ` +${p.referred_users.length - 2} more` : ''}
                                    </span>
                                  )}
                                </td>

                                <td className="p-4 text-right font-sans space-x-2">
                                  <button
                                    onClick={() => {
                                      navigator.clipboard.writeText(link);
                                      showToast('Referral link copied to clipboard! ✅');
                                    }}
                                    className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-bold text-[11px] transition cursor-pointer"
                                  >
                                    📋 Copy Link
                                  </button>

                                  {cleanPhone && (
                                    <a
                                      href={`https://wa.me/${waPhone}?text=${encodeURIComponent(`Hi ${p.name}! 👋 Here is your official Memento Partner Referral Link: ${link}`)}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="px-2.5 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-bold text-[11px] hover:bg-emerald-400 transition inline-flex items-center gap-1"
                                    >
                                      📲 WhatsApp
                                    </a>
                                  )}
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 4. Automated WhatsApp Referral Bonus Dispatch Assistant */}
                <div className={`${cardClass} p-5 space-y-4`}>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm">
                        📲
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">Automated WhatsApp Referral Bonus Dispatcher</h4>
                        <p className="text-[11px] text-slate-400">Instantly send 1-click WhatsApp bonus credit alerts to ambassadors</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 font-bold border border-emerald-500/30">
                      Instant WhatsApp Dispatch
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Ambassador WhatsApp Phone</label>
                      <input
                        type="text"
                        placeholder="e.g. 9876543210"
                        id="notifyPhone"
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-emerald-500 font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Ambassador Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Rahul Sharma"
                        id="notifyName"
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Referred Event & Host</label>
                      <input
                        type="text"
                        placeholder="e.g. Ananya Wedding (Vikram)"
                        id="notifyEvent"
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Referral Bonus (₹)</label>
                      <input
                        type="text"
                        placeholder="e.g. 300"
                        id="notifyBonus"
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-emerald-500 font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={() => {
                        const phone = (document.getElementById('notifyPhone') as HTMLInputElement)?.value || '919866161775';
                        const name = (document.getElementById('notifyName') as HTMLInputElement)?.value || 'Ambassador';
                        const event = (document.getElementById('notifyEvent') as HTMLInputElement)?.value || 'Hosted Event';
                        const bonus = (document.getElementById('notifyBonus') as HTMLInputElement)?.value || '300';

                        const cleanPhone = phone.replace(/[^0-9]/g, '');
                        const formattedPhone = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;
                        const text = `🎉 Congratulations ${name}! Host ${event} just completed booking using your 1-Click Referral Link! Your ₹${bonus} Referral Bonus has been approved & queued for 24h UPI transfer. Thank you for partnering with Memento! 🚀`;
                        
                        window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(text)}`, '_blank');
                      }}
                      className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
                    >
                      <span>📲 Dispatch 1-Click WhatsApp Bonus Alert</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}

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

      {/* ── Referral Partner Assignment Modal ── */}
      {referralModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>🏷️ Assign Referral Partner</span>
              </h3>
              <button
                onClick={() => setReferralModal({ open: false, userId: '', userName: '', currentCode: '' })}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">Host User:</span>
                <p className="text-sm font-bold text-white mt-0.5">{referralModal.userName}</p>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 uppercase font-bold tracking-wider block mb-1.5">
                  Partner Referral Code:
                </label>
                <input
                  type="text"
                  value={partnerInput}
                  onChange={(e) => setPartnerInput(e.target.value.toUpperCase())}
                  placeholder="e.g. MEM-9DCA or MEM-2H9C"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-sm uppercase outline-none focus:border-emerald-500"
                />
              </div>

              {partnerLinks.length > 0 && (
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">
                    Quick Pick Active Partner:
                  </span>
                  <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
                    {partnerLinks.map(p => (
                      <button
                        key={p.code}
                        type="button"
                        onClick={() => setPartnerInput(p.code)}
                        className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold border transition ${
                          partnerInput === p.code
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500'
                            : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-600'
                        }`}
                      >
                        {p.code} ({p.name?.split(' ')[0]})
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              {referralModal.currentCode ? (
                <button
                  type="button"
                  onClick={() => handleUpdateReferralPartner(referralModal.userId, '')}
                  className="px-3 py-2 rounded-xl text-xs font-bold text-red-400 hover:bg-red-500/10 border border-red-500/30 transition cursor-pointer"
                >
                  Unlink Partner
                </button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setReferralModal({ open: false, userId: '', userName: '', currentCode: '' })}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateReferralPartner(referralModal.userId, partnerInput)}
                  className="px-4 py-2 rounded-xl text-xs font-black text-slate-950 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 transition cursor-pointer shadow-lg shadow-emerald-500/20"
                >
                  Save & Link Partner
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
