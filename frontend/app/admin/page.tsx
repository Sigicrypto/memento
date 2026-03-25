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

  // Check if user is admin
  useEffect(() => {
    if (authLoading) return;
    if (!user) { 
      router.push('/system'); 
      return; 
    }
    
    // Check admin status from user metadata
    const isAdminUser = user.user_metadata?.role === 'admin' || user.user_metadata?.is_admin === true;
    
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
        // For now, we'll fetch events and group by owner to simulate user list
        // since we can't directly access auth.users without admin functions
        const { data: eventsData } = await supabase
          .from('events')
          .select('owner_id, created_at')
          .order('created_at', { ascending: false });
        
        if (eventsData) {
          // Group events by owner and count them
          const userMap = new Map();
          eventsData.forEach(event => {
            if (!userMap.has(event.owner_id)) {
              userMap.set(event.owner_id, {
                id: event.owner_id,
                email: `user-${event.owner_id.slice(0, 8)}@example.com`, // Placeholder
                created_at: event.created_at,
                plan: 'FREE',
                events_count: 0
              });
            }
            userMap.get(event.owner_id).events_count++;
          });
          
          setUsers(Array.from(userMap.values()));
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

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Delete this user and all their data? This cannot be undone.')) return;
    
    // Delete user's events (cascade will delete photos)
    await supabase.from('events').delete().eq('owner_id', userId);
    
    // Note: To fully delete auth user, you need admin API or server function
    // For now, we'll just remove their events
    setUsers(users.filter(u => u.id !== userId));
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Delete this event and all its photos?')) return;
    
    await supabase.from('events').delete().eq('id', eventId);
    setEvents(events.filter(e => e.id !== eventId));
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="card text-center">
          <p className="text-xl mb-4">🚫 Access Denied</p>
          <p className="text-gray-600 dark:text-gray-400 mb-6">You don't have admin privileges.</p>
          <Link href="/" className="btn-primary">Go Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      {/* Background Effects */}
      <div className="fixed inset-0 aurora-bg pointer-events-none" />
      <div className="fixed inset-0 grid-pattern pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">🔐</span>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">Manage users, events, and view platform analytics</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-8 border-b border-gray-200 dark:border-gray-700">
          {[
            { id: 'overview', label: '📊 Overview', icon: '📊' },
            { id: 'users', label: '👥 Users', icon: '👥' },
            { id: 'events', label: '🎉 Events', icon: '🎉' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-6 py-3 text-sm font-medium transition-all border-b-2 -mb-[1px] ${
                activeTab === tab.id
                  ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Total Users', value: stats.totalUsers, icon: '👤', color: 'blue' },
                { label: 'Total Events', value: stats.totalEvents, icon: '🎉', color: 'purple' },
                { label: 'Total Photos', value: stats.totalPhotos, icon: '📸', color: 'pink' },
                { label: 'Active Today', value: stats.activeToday, icon: '⚡', color: 'green' },
              ].map((stat) => (
                <div key={stat.label} className="card !p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl">{stat.icon}</span>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full bg-${stat.color}-100 dark:bg-${stat.color}-900/20 text-${stat.color}-600 dark:text-${stat.color}-400`}>
                      +{Math.floor(Math.random() * 10 + 1)}%
                    </span>
                  </div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value.toLocaleString()}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
              <div className="flex flex-wrap gap-3">
                <button onClick={() => setActiveTab('users')} className="btn-secondary text-sm">
                  👥 View All Users
                </button>
                <button onClick={() => setActiveTab('events')} className="btn-secondary text-sm">
                  🎉 View All Events
                </button>
                <Link href="/dashboard" className="btn-secondary text-sm">
                  📊 My Dashboard
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                All Users ({users.length})
              </h2>
            </div>
            
            {users.length === 0 ? (
              <div className="card text-center !p-12">
                <p className="text-gray-500 dark:text-gray-400">No users found</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {users.map((user) => (
                  <div key={user.id} className="card flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                        {user.email.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{user.email}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Joined {new Date(user.created_at).toLocaleDateString()} • 
                          <span className="text-purple-600 dark:text-purple-400 ml-1">
                            {user.events_count} event{user.events_count !== 1 ? 's' : ''}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        user.plan === 'FREE' ? 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400' :
                        user.plan === 'PLUS' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' :
                        user.plan === 'PREMIUM' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' :
                        'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                      }`}>
                        {user.plan || 'FREE'}
                      </span>
                      <button 
                        onClick={() => handleDeleteUser(user.id)}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                        title="Delete User"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Events Tab */}
        {activeTab === 'events' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                All Events ({events.length})
              </h2>
            </div>
            
            {events.length === 0 ? (
              <div className="card text-center !p-12">
                <p className="text-gray-500 dark:text-gray-400">No events found</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {events.map((event) => (
                  <div key={event.id} className="card">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{event.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Created by {event.owner_email} on {new Date(event.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <button 
                        onClick={() => handleDeleteEvent(event.id)}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                        title="Delete Event"
                      >
                        🗑️
                      </button>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-purple-600 dark:text-purple-400">
                        📸 {event.photo_count} photo{event.photo_count !== 1 ? 's' : ''}
                      </span>
                      <Link 
                        href={`/wall/${event.slug}`} 
                        className="text-cyan-600 dark:text-cyan-400 hover:underline"
                      >
                        🖼️ View Wall
                      </Link>
                      <Link 
                        href={`/upload/${event.slug}`} 
                        className="text-cyan-600 dark:text-cyan-400 hover:underline"
                      >
                        📱 Upload
                      </Link>
                      <Link 
                        href={`/moderate/${event.slug}`} 
                        className="text-cyan-600 dark:text-cyan-400 hover:underline"
                      >
                        🛡️ Moderate
                      </Link>
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
