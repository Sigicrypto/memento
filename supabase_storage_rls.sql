-- Supabase Storage RLS Policies for Photo Uploads
-- This file defines Row Level Security policies for the photos bucket

-- Drop existing policies (if they exist)
DROP POLICY IF EXISTS "Users can upload photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can view photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their photos" ON storage.objects;

-- Create policies for photo uploads

-- 1. Users can upload photos to event folders
CREATE POLICY "Users can upload photos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'photos' AND
    (
      -- Allow uploads to demo folder freely
      (storage.foldername(name))[1] = 'demo' OR
      -- Existing check for event folders
      (storage.foldername(name))[1] IN (
        SELECT id::text FROM events
      )
    )
  );

-- 2. Users can view photos from events they have access to
CREATE POLICY "Users can view photos" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'photos' AND
    (
      -- Allow viewing demo photos
      (storage.foldername(name))[1] = 'demo' OR
      -- Allow viewing photos from existing events
      (storage.foldername(name))[1] IN (
        SELECT id::text FROM events
      )
    )
  );

-- 3. Users can update their own uploaded photos
CREATE POLICY "Users can update their photos" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'photos' AND
    auth.uid() IS NOT NULL
  );

-- 4. Event owners can delete photos from their events
CREATE POLICY "Users can delete their photos" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'photos' AND
    auth.uid() IN (
      SELECT owner_id FROM events 
      WHERE id = (storage.foldername(name))[1]
    )
  );

-- 5. Admins can manage all photos (optional)
CREATE POLICY "Admins can manage all photos" ON storage.objects
  FOR ALL USING (
    bucket_id = 'photos' AND
    auth.jwt() ->> 'role' = 'admin'
  );

-- Helper function to extract folder name from storage path
-- This function helps extract the event_id from paths like "event_id/filename"
CREATE OR REPLACE FUNCTION storage.foldername(path text)
RETURNS text[] AS $$
BEGIN
  RETURN string_to_array(path, '/');
END;
$$ LANGUAGE plpgsql;

-- Additional security: Enable RLS on storage
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Comments for documentation
COMMENT ON POLICY "Users can upload photos" IS 'Allows users to upload photos to event folders';
COMMENT ON POLICY "Users can view photos" IS 'Allows users to view photos from accessible events';
COMMENT ON POLICY "Users can update their photos" IS 'Allows users to update their own photos';
COMMENT ON POLICY "Users can delete their photos" IS 'Allows event owners to delete photos from their events';
COMMENT ON POLICY "Admins can manage all photos" IS 'Allows admins full access to all photos';

-- Index for better performance
CREATE INDEX IF NOT EXISTS idx_storage_objects_bucket_id ON storage.objects(bucket_id);
CREATE INDEX IF NOT EXISTS idx_storage_objects_name ON storage.objects(name);
