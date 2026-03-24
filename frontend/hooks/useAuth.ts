"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
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

  return { user, loading, signIn, signUp, signOut };
};
