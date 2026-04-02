-- ═══════════════════════════════════════════════════════════════
-- 026: FIX RLS RECURSION AND ADD MISSING COLUMNS
-- This resolves the 500 (Profiles Recursion) and 400 (Missing Fields) errors
-- Run this in the Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- 1. Fix recursive RLS on profiles by using a SECURITY DEFINER function
-- This allows admins to bypass RLS for the role check itself
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the admin policy to use this function
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.is_admin());

-- 2. Add missing columns to help the wall page load
-- Add music_track if it doesn't already exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'events' AND column_name = 'music_track'
  ) THEN
    ALTER TABLE public.events ADD COLUMN music_track TEXT DEFAULT 'none';
  END IF;
END $$;

-- 3. Ensure other expected columns exist (defensive)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'theme_primary_color') THEN
    ALTER TABLE public.events ADD COLUMN theme_primary_color TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'theme_secondary_color') THEN
    ALTER TABLE public.events ADD COLUMN theme_secondary_color TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'enable_safety_filter') THEN
    ALTER TABLE public.events ADD COLUMN enable_safety_filter BOOLEAN DEFAULT FALSE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'expires_at') THEN
    ALTER TABLE public.events ADD COLUMN expires_at TIMESTAMPTZ;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'plan_type') THEN
    ALTER TABLE public.events ADD COLUMN plan_type TEXT DEFAULT 'STARTER';
  END IF;
END $$;
