"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  plan: 'starter' | 'standard' | 'premium' | 'whitelabel';
  payment_status: 'pending' | 'paid' | 'trial';
  role: 'user' | 'admin';
  is_approved: boolean;
  approval_status: 'PENDING' | 'APPROVED' | 'REJECTED';
  created_at: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }
      
      if (data) setProfile(data as UserProfile);
    } catch (err) {
      console.error('Unexpected error in fetchProfile:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        fetchProfile(currentUser.id);
      } else {
        setIsLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        fetchProfile(currentUser.id);
      } else {
        setProfile(null);
        setIsLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []); // Run once on mount

  useEffect(() => {
    // Real-time profile subscription
    let profileChannel: any;
    if (user?.id) {
      // Append a random string to the channel name to prevent "already subscribed" errors 
      // in React Strict Mode or when multiple components call useAuth concurrently.
      const uniqueChannelId = `profile-${user.id}-${Math.random().toString(36).substring(2, 9)}`;
      profileChannel = supabase
        .channel(uniqueChannelId)
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${user.id}` },
          (payload) => {
            console.log('Real-time profile update:', payload.new);
            setProfile(payload.new as UserProfile);
          }
        )
        .subscribe();
    }

    return () => {
      if (profileChannel) supabase.removeChannel(profileChannel);
    };
  }, [user?.id]); // Re-subscribe if user ID changes

  const signIn = (email: string, password: string) =>
    supabase.auth.signInWithPassword({ email, password });

  const signUp = (email: string, password: string, phone?: string, fullName?: string) =>
    supabase.auth.signUp({ 
      email, 
      password, 
      options: { 
        data: { phone: phone || '', full_name: fullName || '' },
        emailRedirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`
      } 
    });

  const signInWithGoogle = () =>
    supabase.auth.signInWithOAuth({ 
      provider: 'google',
      options: {
        redirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`
      }
    });

  const signOut = () => {
    setIsLoading(true);
    return supabase.auth.signOut();
  };

  // ── Super Admin Override ──────────────────────────────────
  const SUPER_ADMIN_EMAIL = process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL || '';
  const isSuperAdmin = !!(SUPER_ADMIN_EMAIL && user?.email?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase());

  // The plan is now derived from the database profile
  // Super admin always gets whitelabel (max tier) with full access
  const plan = isSuperAdmin ? 'whitelabel' : (profile?.plan || 'starter');
  const isPaid = isSuperAdmin ? true : (profile?.payment_status === 'paid');
  const isApproved = isSuperAdmin ? true : (profile?.is_approved === true);
  const isAdmin = isSuperAdmin ? true : (profile?.role === 'admin');

  return { user, profile, isLoading, signIn, signUp, signInWithGoogle, signOut, plan, isPaid, isApproved, isAdmin, isSuperAdmin };
};
