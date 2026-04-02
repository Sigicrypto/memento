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
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);

  const fetchProfile = async (userId: string) => {
    setProfileLoading(true);
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
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      setLoading(false); // Set loading false immediately after getting session
      if (currentUser) fetchProfile(currentUser.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      setLoading(false);
      if (currentUser) fetchProfile(currentUser.id);
      else setProfile(null);
    });

    // Real-time profile subscription
    let profileChannel: any;
    if (user) {
      profileChannel = supabase
        .channel(`profile-${user.id}`)
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
      subscription.unsubscribe();
      if (profileChannel) supabase.removeChannel(profileChannel);
    };
  }, [user?.id]); // Re-subscribe if user ID changes

  const signIn = (email: string, password: string) =>
    supabase.auth.signInWithPassword({ email, password });

  const signUp = (email: string, password: string, phone?: string) =>
    supabase.auth.signUp({ 
      email, 
      password, 
      options: { 
        data: { phone: phone || '' },
        emailRedirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`
      } 
    });

  const signOut = () => supabase.auth.signOut();

  // The plan is now derived from the database profile
  const plan = profile?.plan || 'starter';
  const isPaid = profile?.payment_status === 'paid';
  const isApproved = profile?.is_approved === true;
  const isAdmin = profile?.role === 'admin';

  return { user, profile, loading, profileLoading, signIn, signUp, signOut, plan, isPaid, isApproved, isAdmin };
};
