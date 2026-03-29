-- 1. Create 'reactions' table if it doesn't exist
-- This table stores guest likes/reactions for photos.
CREATE TABLE IF NOT EXISTS reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  photo_id UUID REFERENCES photos(id) ON DELETE CASCADE,
  guest_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster reaction counting
CREATE INDEX IF NOT EXISTS idx_reactions_photo_id ON reactions(photo_id);

-- 2. Enable Realtime for 'photos' and 'reactions' tables
-- This is required for the "Live Wall" to update automatically.
BEGIN;
  -- Remove existing publication if any to avoid errors
  DROP PUBLICATION IF EXISTS supabase_realtime;
  
  -- Create publication for the tables we want to track
  CREATE PUBLICATION supabase_realtime FOR TABLE photos, reactions;
COMMIT;

-- 3. Ensure get_photos_with_reactions RPC exists
-- This function fetches photos along with their like counts and event info.
CREATE OR REPLACE FUNCTION get_photos_with_reactions(event_uuid UUID)
RETURNS TABLE (
  id UUID,
  storage_path TEXT,
  uploader_name TEXT,
  created_at TIMESTAMPTZ,
  caption TEXT,
  event_id UUID,
  media_type TEXT,
  reaction_count BIGINT,
  is_best_shot BOOLEAN,
  approved BOOLEAN,
  watermark_url TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.storage_path,
    p.uploader_name,
    p.created_at,
    p.caption,
    p.event_id,
    p.media_type,
    COUNT(r.id) as reaction_count,
    p.is_best_shot,
    p.approved,
    e.watermark_url
  FROM
    photos p
  LEFT JOIN
    reactions r ON p.id = r.photo_id
  JOIN
    events e ON p.event_id = e.id
  WHERE
    p.event_id = event_uuid
  GROUP BY
    p.id, e.watermark_url
  ORDER BY
    p.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- 4. Verify Storage Bucket 'photos' exists and is public
-- (Run this if you get 403 errors on images)
INSERT INTO storage.buckets (id, name, public)
VALUES ('photos', 'photos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

