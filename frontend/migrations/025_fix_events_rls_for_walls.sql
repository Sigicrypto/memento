-- ═══════════════════════════════════════════════════════════════
-- FIX: Allow public read access to events so walls can be viewed
-- The wall page uses the anon client, so RLS must allow public SELECT
-- Run this in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- Enable RLS (idempotent)
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Allow anyone (including anonymous/unauthenticated) to read events
-- This is needed for /wall/[slug] and /mobile/[slug] pages
DROP POLICY IF EXISTS "Anyone can view events" ON public.events;
CREATE POLICY "Anyone can view events"
  ON public.events FOR SELECT
  USING (true);

-- Owners can insert their own events
DROP POLICY IF EXISTS "Owners can insert events" ON public.events;
CREATE POLICY "Owners can insert events"
  ON public.events FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

-- Owners can update their own events
DROP POLICY IF EXISTS "Owners can update own events" ON public.events;
CREATE POLICY "Owners can update own events"
  ON public.events FOR UPDATE
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- Owners can delete their own events
DROP POLICY IF EXISTS "Owners can delete own events" ON public.events;
CREATE POLICY "Owners can delete own events"
  ON public.events FOR DELETE
  USING (auth.uid() = owner_id);

-- Also allow public read on photos so wall viewers can see photos
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view photos" ON public.photos;
CREATE POLICY "Anyone can view photos"
  ON public.photos FOR SELECT
  USING (true);

-- Allow anyone to insert photos (guests upload without auth)
DROP POLICY IF EXISTS "Anyone can insert photos" ON public.photos;
CREATE POLICY "Anyone can insert photos"
  ON public.photos FOR INSERT
  WITH CHECK (true);

-- Owners can update photos in their events
DROP POLICY IF EXISTS "Event owners can update photos" ON public.photos;
CREATE POLICY "Event owners can update photos"
  ON public.photos FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE events.id = photos.event_id AND events.owner_id = auth.uid()
    )
  );

-- Owners can delete photos in their events
DROP POLICY IF EXISTS "Event owners can delete photos" ON public.photos;
CREATE POLICY "Event owners can delete photos"
  ON public.photos FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE events.id = photos.event_id AND events.owner_id = auth.uid()
    )
  );
