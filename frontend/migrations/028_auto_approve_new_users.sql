-- ═══════════════════════════════════════════════════════════════
-- MIGRATION 028: AUTO-APPROVE NEW USERS FOR STARTER FREE TIER
-- Run this script in the Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- 1. Set default value of is_approved to TRUE for public.profiles
ALTER TABLE public.profiles 
  ALTER COLUMN is_approved SET DEFAULT TRUE;

-- 2. Update trigger function to insert is_approved = true on new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, plan, is_approved)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'plan_type', 'starter'),
    TRUE
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    email = COALESCE(EXCLUDED.email, profiles.email),
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Auto-approve existing pending accounts
UPDATE public.profiles 
SET is_approved = TRUE 
WHERE is_approved IS FALSE OR is_approved IS NULL;
