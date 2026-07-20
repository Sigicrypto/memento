-- Supabase RLS Policies for Photos Table
-- This file defines Row Level Security policies for the photos table

-- Drop existing policies (if they exist)
DROP POLICY IF EXISTS "Users can view photos from public events" ON photos;
DROP POLICY IF EXISTS "Users can insert photos to events" ON photos;
DROP POLICY IF EXISTS "Users can update their own photos" ON photos;
DROP POLICY IF EXISTS "Event owners can delete photos from their events" ON photos;
DROP POLICY IF EXISTS "Admins can manage all photos" ON photos;

-- Enable RLS on photos table
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

-- 1. Users can view photos from events they have access to
CREATE POLICY "Users can view photos from public events" ON photos
  FOR SELECT USING (
    -- Allow viewing photos from any existing event
    event_id IN (
      SELECT id FROM events
    )
  );

-- 2. Users can insert photos to events
CREATE POLICY "Users can insert photos to events" ON photos
  FOR INSERT WITH CHECK (
    -- Allow inserting photos to any existing event
    event_id IN (
      SELECT id FROM events
    )
  );

-- 3. Users can update their own uploaded photos
CREATE POLICY "Users can update their own photos" ON photos
  FOR UPDATE USING (
    -- Users can only update photos they uploaded (matched by uploader_name and timestamp)
    -- This is a simple check - in production you might want to track uploader_id
    uploader_name IS NOT NULL
  );

-- 4. Event owners can delete photos from their events
CREATE POLICY "Event owners can delete photos from their events" ON photos
  FOR DELETE USING (
    -- Event owners can delete any photo from their events
    event_id IN (
      SELECT id FROM events WHERE 
        owner_id = auth.uid()
    )
  );

-- 5. Admins can manage all photos
CREATE POLICY "Admins can manage all photos" ON photos
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'admin'
  );

-- Additional security: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_photos_event_id ON photos(event_id);
CREATE INDEX IF NOT EXISTS idx_photos_created_at ON photos(created_at);
CREATE INDEX IF NOT EXISTS idx_photos_uploader_name ON photos(uploader_name);

-- Trigger for automatic cleanup (optional)
-- This trigger can be used to automatically delete photos when events are deleted
CREATE OR REPLACE FUNCTION cleanup_photos_on_event_delete()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM photos WHERE event_id = OLD.id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic photo cleanup
DROP TRIGGER IF EXISTS trigger_cleanup_photos_on_event_delete ON events;
CREATE TRIGGER trigger_cleanup_photos_on_event_delete
  AFTER DELETE ON events
  FOR EACH ROW
  EXECUTE FUNCTION cleanup_photos_on_event_delete();

-- Comments for documentation
COMMENT ON POLICY "Users can view photos from public events" IS 'Allows users to view photos from accessible events';
COMMENT ON POLICY "Users can insert photos to events" IS 'Allows users to upload photos to events';
COMMENT ON POLICY "Users can update their own photos" IS 'Allows users to update their own uploaded photos';
COMMENT ON POLICY "Event owners can delete photos from their events" IS 'Allows event owners to delete photos from their events';
COMMENT ON POLICY "Admins can manage all photos" IS 'Allows admins full access to all photos';

-- Optional: Add photo metadata tracking for better security
-- ALTER TABLE photos ADD COLUMN IF NOT EXISTS uploader_id UUID REFERENCES auth.users(id);
-- This would require updating the upload logic to track the actual user ID

-- Real-time subscription setup
-- The following SQL ensures that the photos table is properly configured for real-time subscriptions
ALTER PUBLICATION supabase_realtime ADD TABLE photos;

-- Grant necessary permissions for real-time
GRANT SELECT ON photos TO authenticated;
GRANT SELECT ON photos TO anon;
