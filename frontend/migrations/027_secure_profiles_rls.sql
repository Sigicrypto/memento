-- ═══════════════════════════════════════════════════════════════
-- SECURE PROFILES RLS (UPDATED FOR ADMIN PLAN OVERRIDES)
-- Run this in Supabase SQL Editor to allow Admins to upgrade plans while restricting standard users
-- ═══════════════════════════════════════════════════════════════

-- Ensure the existing update policy is restrictive
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (auth.uid() = id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Create a trigger function to prevent modification of sensitive columns by standard users
CREATE OR REPLACE FUNCTION public.prevent_profile_escalation()
RETURNS TRIGGER AS $$
DECLARE
  executor_role text;
BEGIN
  -- Fetch current executor's role
  SELECT role INTO executor_role FROM public.profiles WHERE id = auth.uid();

  -- If the user executing this is authenticated AND NOT an admin, enforce restrictions
  IF current_setting('request.jwt.claims', true)::jsonb->>'role' = 'authenticated' AND executor_role IS DISTINCT FROM 'admin' THEN
    
    -- An authenticated standard user cannot change their own role, plan, payment_status, or approval status
    IF NEW.role IS DISTINCT FROM OLD.role THEN
      RAISE EXCEPTION 'Unauthorized: You cannot modify your role.';
    END IF;
    
    IF NEW.plan IS DISTINCT FROM OLD.plan THEN
      RAISE EXCEPTION 'Unauthorized: You cannot modify your plan directly.';
    END IF;

    IF NEW.payment_status IS DISTINCT FROM OLD.payment_status THEN
      RAISE EXCEPTION 'Unauthorized: You cannot modify your payment status.';
    END IF;

  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the trigger if it exists
DROP TRIGGER IF EXISTS enforce_profile_security ON public.profiles;

-- Create the trigger on UPDATE
CREATE TRIGGER enforce_profile_security
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_profile_escalation();
