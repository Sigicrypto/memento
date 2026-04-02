-- ═══════════════════════════════════════════════════════════════
-- 026: CONSOLIDATED SCHEMA AND RLS FIXES
-- Resolves: 
-- 1. Recursive RLS in Profiles (500 Error)
-- 2. Missing columns in Events (400 Error on watermark_url, music_track)
-- 3. Missing columns in Photos (400 Error on media_type, is_best_shot, approved)
-- 4. Forbidden client-side admin call (403 Error) -> Fix requires RLS change below
-- ═══════════════════════════════════════════════════════════════

-- A. Fix recursive RLS on profiles using a Security Definer function
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

-- B. Allow public read on event owner profiles (needed for branding)
DROP POLICY IF EXISTS "Anyone can view event owner profiles" ON public.profiles;
CREATE POLICY "Anyone can view event owner profiles"
  ON public.profiles FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.events WHERE events.owner_id = public.profiles.id));

-- C. Add missing columns to help the wall page load
DO $$ 
BEGIN
  -- 1. Events Table
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'music_track') THEN
    ALTER TABLE public.events ADD COLUMN music_track TEXT DEFAULT 'none';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'watermark_url') THEN
    ALTER TABLE public.events ADD COLUMN watermark_url TEXT;
  END IF;
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

  -- 2. Photos Table
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'photos' AND column_name = 'media_type') THEN
    ALTER TABLE public.photos ADD COLUMN media_type TEXT DEFAULT 'image';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'photos' AND column_name = 'is_best_shot') THEN
    ALTER TABLE public.photos ADD COLUMN is_best_shot BOOLEAN DEFAULT FALSE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'photos' AND column_name = 'approved') THEN
    ALTER TABLE public.photos ADD COLUMN approved BOOLEAN DEFAULT TRUE;
  END IF;
END $$;
