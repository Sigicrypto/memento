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
  created_at: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (data) setProfile(data as UserProfile);
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
      setLoading(false); // Set loading false immediately
      if (currentUser) fetchProfile(currentUser.id);
      else setProfile(null);
    });

    return () => subscription.unsubscribe();
  }, []);

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
  const isAdmin = profile?.role === 'admin';

  return { user, profile, loading, signIn, signUp, signOut, plan, isPaid, isAdmin };
};
