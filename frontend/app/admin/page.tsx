"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  created_at: string;
  plan: string;
  events_count?: number;
}

interface Event {
  id: string;
  name: string;
  slug: string;
  created_at: string;
  owner_id: string;
  owner_email?: string;
  photo_count?: number;
}

interface Stats {
  totalUsers: number;
  totalEvents: number;
  totalPhotos: number;
  activeToday: number;
}

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'events'>('overview');
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalEvents: 0,
    totalPhotos: 0,
    activeToday: 0
  });
  const [users, setUsers] = useState<User[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{open: boolean; message: string; onConfirm: () => void}>({open: false, message: '', onConfirm: () => {}});

  const showConfirm = (message: string, onConfirm: () => void) => setConfirmDialog({open: true, message, onConfirm});
  const closeConfirm = () => setConfirmDialog(prev => ({...prev, open: false}));

  // Check if user is admin
  useEffect(() => {
    if (authLoading) return;
    if (!user) { 
      router.push('/system'); 
      return; 
    }
    
    // Check admin status from user metadata or explicit admin email
    const isAdminUser = 
      user.user_metadata?.role === 'admin' || 
      user.user_metadata?.is_admin === true || 
      user.email === 'sagarfalcon@gmail.com';
    
    if (isAdminUser) {
      setIsAdmin(true);
    } else {
      // Redirect to system login if not admin
      router.push('/system');
    }
  }, [user, authLoading, router]);

  // Fetch stats
  useEffect(() => {
    if (!isAdmin) return;
    
    const fetchStats = async () => {
      try {
        // Get total events count
        const { count: eventsCount } = await supabase
          .from('events')
          .select('*', { count: 'exact', head: true });
        
        // Get total photos count
        const { count: photosCount } = await supabase
          .from('photos')
          .select('*', { count: 'exact', head: true });
        
        // Get today's active users (unique users who created events today)
        const today = new Date().toISOString().split('T')[0];
        const { data: todayEvents } = await supabase
          .from('events')
          .select('owner_id')
          .gte('created_at', today);
        
        const uniqueUsersToday = new Set(todayEvents?.map(e => e.owner_id)).size;
        
        // Get total unique users (unique owners)
        const { data: allEvents } = await supabase
          .from('events')
          .select('owner_id');
        
        const totalUniqueUsers = new Set(allEvents?.map(e => e.owner_id)).size;
        
        setStats({
          totalUsers: totalUniqueUsers,
          totalEvents: eventsCount || 0,
          totalPhotos: photosCount || 0,
          activeToday: uniqueUsersToday
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };
    
    fetchStats();
  }, [isAdmin]);

  // Fetch users with event counts
  useEffect(() => {
    if (!isAdmin || activeTab !== 'users') return;
    
    const fetchUsers = async () => {
      setLoading(true);
      try {
        // Fetch all profiles
        const { data: profiles, error: profError } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });

        if (profError) throw profError;

        // Fetch counts for each profile
        const { data: eventCounts } = await supabase
          .from('events')
          .select('owner_id');

        const countsMap: { [key: string]: number } = {};
        eventCounts?.forEach(e => {
          countsMap[e.owner_id] = (countsMap[e.owner_id] || 0) + 1;
        });

        if (profiles) {
          const usersWithCounts = profiles.map(p => ({
            ...p,
            events_count: countsMap[p.id] || 0,
            plan: p.plan.toUpperCase()
          }));
          setUsers(usersWithCounts);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      }
      setLoading(false);
    };
    
    fetchUsers();
  }, [isAdmin, activeTab]);

  // Fetch all events
  useEffect(() => {
    if (!isAdmin || activeTab !== 'events') return;
    
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const { data: eventsData } = await supabase
          .from('events')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (eventsData) {
          // Get photo counts for each event
          const eventsWithCounts = await Promise.all(
            eventsData.map(async (event) => {
              const { count } = await supabase
                .from('photos')
                .select('*', { count: 'exact', head: true })
                .eq('event_id', event.id);
              
              return {
                ...event,
                owner_email: `user-${event.owner_id.slice(0, 8)}@example.com`, // Placeholder
                photo_count: count || 0
              };
            })
          );
          setEvents(eventsWithCounts);
        }
      } catch (error) {
        console.error('Error fetching events:', error);
      }
      setLoading(false);
    };
    
    fetchEvents();
  }, [isAdmin, activeTab]);

  const handleUpdatePlan = async (userId: string, newPlan: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ plan: newPlan.toLowerCase(), payment_status: 'paid' })
        .eq('id', userId);

      if (error) throw error;
      
      setUsers(users.map(u => u.id === userId ? { ...u, plan: newPlan.toUpperCase() } : u));
    } catch (error: any) {
      alert('Failed to update plan: ' + error.message);
    }
  };

  const handleDeleteUser = (userId: string) => {
    showConfirm('Delete this user and all their data? This cannot be undone.', async () => {
    
      // Delete user's events (cascade will delete photos)
      await supabase.from('events').delete().eq('owner_id', userId);
    
    // Note: To fully delete auth user, you need admin API or server function
    // For now, we'll just remove their events
    setUsers(users.filter(u => u.id !== userId));
      closeConfirm();
    });
  };

  const handleDeleteEvent = (eventId: string) => {
    showConfirm('Delete this event and all its photos?', async () => {
      await supabase.from('events').delete().eq('id', eventId);
      setEvents(events.filter(e => e.id !== eventId));
      closeConfirm();
    });
  };

  if (authLoading || loading) {
    return (
      <div className="nm-page flex items-center justify-center">
        <div className="nm-circle w-14 h-14">
          <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{borderColor:'#252c46',borderTopColor:'#f59e0b'}} />
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="nm-page flex items-center justify-center px-4">
        <div className="nm-card text-center p-10">
          <p className="text-xl mb-4">🚫 Access Denied</p>
          <p className="text-sm mb-6" style={{color:'var(--text2)'}}>You don't have admin privileges.</p>
          <Link href="/" className="nm-btn nm-btn-accent px-6 py-2.5 font-bold">Go Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="nm-page px-4 py-12 pb-40">
      {/* Confirm Dialog */}
      {confirmDialog.open && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center px-4" style={{background:'rgba(14,18,40,0.7)', backdropFilter:'blur(4px)'}}>
          <div className="nm-card p-8 max-w-md w-full text-center">
            <div className="text-3xl mb-4">⚠️</div>
            <p className="text-sm mb-6" style={{color:'var(--text1)'}}>{confirmDialog.message}</p>
            <div className="flex gap-3">
              <button onClick={closeConfirm} className="nm-btn flex-1 py-3 text-sm">Cancel</button>
              <button onClick={confirmDialog.onConfirm} className="nm-btn flex-1 py-3 text-sm font-bold" style={{color:'#f87171',background:'rgba(248,113,113,0.1)'}}>Delete</button>
            </div>
          </div>
        </div>
      )}
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="nm-card p-8 mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-2xl">🔐</span>
              <h1 className="text-2xl font-bold" style={{color:'var(--text1)'}}>Admin Dashboard</h1>
            </div>
            <p className="text-sm" style={{color:'var(--text2)'}}>Manage users, events, and view platform analytics</p>
          </div>
          <Link href="/dashboard" className="nm-btn px-5 py-3 text-xs" style={{color:'var(--text2)'}}>📊 My Dashboard</Link>
        </div>

        {/* Navigation Tabs */}
        <div className="nm-inset p-1.5 rounded-2xl flex gap-1 mb-8 max-w-sm">
          {[
            { id: 'overview', label: '📊 Overview' },
            { id: 'users', label: '👥 Users' },
            { id: 'events', label: '🎉 Events' },
          ].map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className="flex-1 px-4 py-2.5 text-sm font-medium rounded-xl transition"
              style={{
                background: activeTab === tab.id ? 'linear-gradient(135deg,#f59e0b,#f472b6)' : 'transparent',
                color: activeTab === tab.id ? 'var(--surface)' : 'var(--text2)'
              }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total Users', value: stats.totalUsers, icon: '👤' },
                { label: 'Total Events', value: stats.totalEvents, icon: '🎉' },
                { label: 'Total Photos', value: stats.totalPhotos, icon: '📸' },
                { label: 'Active Today', value: stats.activeToday, icon: '⚡' },
              ].map((stat) => (
                <div key={stat.label} className="nm-card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="nm-circle w-12 h-12 text-2xl">{stat.icon}</div>
                    <span className="nm-badge text-xs">Live</span>
                  </div>
                  <p className="text-3xl font-bold" style={{color:'var(--text1)'}}>{stat.value.toLocaleString()}</p>
                  <p className="text-sm mt-1" style={{color:'var(--text2)'}}>{stat.label}</p>
                </div>
              ))}
            </div>

            <div className="nm-card p-6">
              <h3 className="text-lg font-semibold mb-4" style={{color:'var(--text1)'}}>Quick Actions</h3>
              <div className="flex flex-wrap gap-3">
                <button onClick={() => setActiveTab('users')} className="nm-btn px-5 py-2.5 text-sm" style={{color:'var(--text2)'}}>👥 View Users</button>
                <button onClick={() => setActiveTab('events')} className="nm-btn px-5 py-2.5 text-sm" style={{color:'var(--text2)'}}>🎉 View Events</button>
                <Link href="/admin/analytics" className="nm-btn px-5 py-2.5 text-sm" style={{color:'var(--text2)'}}>📊 View Analytics</Link>
                <Link href="/admin/branding" className="nm-btn px-5 py-2.5 text-sm" style={{color:'var(--text2)'}}>🎨 Branding</Link>
                <Link href="/create" className="nm-btn nm-btn-accent px-5 py-2.5 text-sm">✨ Create New Event</Link>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold" style={{color:'var(--text1)'}}>All Users ({users.length})</h2>
            {users.length === 0 ? (
              <div className="nm-card text-center p-12" style={{color:'var(--text2)'}}>No users found</div>
            ) : (
              <div className="grid gap-3">
                {users.map((u) => (
                  <div key={u.id} className="nm-card p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="nm-circle w-10 h-10 font-bold" style={{color:'#f59e0b'}}>{u.email.charAt(0).toUpperCase()}</div>
                      <div>
                        <p className="font-medium text-sm" style={{color:'var(--text1)'}}>{u.email}</p>
                        <p className="text-xs" style={{color:'var(--text2)'}}>
                          Joined {new Date(u.created_at).toLocaleDateString()} &bull;
                          <span className="ml-1" style={{color:'#f59e0b'}}>{u.events_count} event{u.events_count !== 1 ? 's' : ''}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <select 
                        className="nm-badge text-[11px] bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-1 cursor-pointer outline-none font-bold uppercase"
                        value={u.plan || 'STARTER'}
                        onChange={(e) => handleUpdatePlan(u.id, e.target.value)}
                      >
                        <option value="STARTER">Starter</option>
                        <option value="STANDARD">Standard</option>
                        <option value="PREMIUM">Premium</option>
                        <option value="WHITE_LABEL">Partner</option>
                      </select>
                      <button onClick={() => handleDeleteUser(u.id)} className="nm-circle w-8 h-8 text-sm" style={{color:'#f87171'}} title="Delete">🗑️</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Events Tab */}
        {activeTab === 'events' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold" style={{color:'var(--text1)'}}>All Events ({events.length})</h2>
            {events.length === 0 ? (
              <div className="nm-card text-center p-12" style={{color:'var(--text2)'}}>No events found</div>
            ) : (
              <div className="grid gap-3">
                {events.map((event) => (
                  <div key={event.id} className="nm-card p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold" style={{color:'var(--text1)'}}>{event.name}</h3>
                        <p className="text-xs" style={{color:'var(--text2)'}}>
                          By {event.owner_email} on {new Date(event.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <button onClick={() => handleDeleteEvent(event.id)} className="nm-circle w-8 h-8 text-sm" style={{color:'#f87171'}} title="Delete">🗑️</button>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs">
                      <span className="nm-badge">📸 {event.photo_count} photo{event.photo_count !== 1 ? 's' : ''}</span>
                      <Link href={`/wall/${event.slug}`} className="nm-btn px-3 py-1" style={{color:'#f59e0b'}}>🖼️ Wall</Link>
                      <Link href={`/upload/${event.slug}`} className="nm-btn px-3 py-1" style={{color:'var(--text2)'}}>📱 Upload</Link>
                      <Link href={`/moderate/${event.slug}`} className="nm-btn px-3 py-1" style={{color:'var(--text2)'}}>🛡️ Moderate</Link>
                      <Link href={`/admin/edit-event/${event.slug}`} className="nm-btn px-3 py-1" style={{color:'#818cf8'}}>✏️ Edit</Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

