-- Add Theme and Music Track columns to the events table
ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS theme text DEFAULT 'light',
ADD COLUMN IF NOT EXISTS music_track text,
ADD COLUMN IF NOT EXISTS enable_auto_album boolean DEFAULT false;

-- pg_cron job logic to purge old photos automatically (Run this directly in Postgres Query Editor)
-- Ensure pg_cron extension is enabled 
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create an edge function trigger or cleanup function to safely delete rows and storage objects
-- NOTE: In Supabase, deleting storage objects via SQL triggers requires edge functions or the pg_net extension since storage API is external.
-- The simplest pure SQL DB approach is to delete the pg table rows (photos), but actual file chunks might remain in Storage buckets unless CASCADE deletes are used in `storage.objects` linking.
-- For Memento market release, we will schedule a cron job to set an "is_expired" boolean that hides them from UI until manual bucket purging or edge function sweeps happen.

ALTER TABLE public.photos
ADD COLUMN IF NOT EXISTS is_expired boolean DEFAULT false;

CREATE OR REPLACE FUNCTION expire_old_photos()
RETURNS void AS $$
BEGIN
  -- 1 Month for Starter/Free
  UPDATE public.photos
  SET is_expired = true
  FROM public.events e
  WHERE e.id = photos.event_id
    AND e.plan_type IN ('FREE', 'Starter')
    AND photos.created_at < NOW() - INTERVAL '1 month'
    AND photos.is_expired = false;

  -- 3 Months for Standard
  UPDATE public.photos
  SET is_expired = true
  FROM public.events e
  WHERE e.id = photos.event_id
    AND e.plan_type = 'Standard'
    AND photos.created_at < NOW() - INTERVAL '3 months'
    AND photos.is_expired = false;

  -- 6 Months for Premium/White Label
  UPDATE public.photos
  SET is_expired = true
  FROM public.events e
  WHERE e.id = photos.event_id
    AND e.plan_type IN ('Premium', 'White Label')
    AND photos.created_at < NOW() - INTERVAL '6 months'
    AND photos.is_expired = false;
END;
$$ LANGUAGE plpgsql;

-- Schedule it to run daily at midnight
SELECT cron.schedule('expire-old-photos-daily', '0 0 * * *', 'SELECT expire_old_photos()');
