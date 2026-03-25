-- Simple Real-time Test and Fix for Photos Table
-- Run this in your Supabase SQL Editor

-- Step 1: Check if realtime is enabled for photos table
SELECT * FROM pg_publication_tables WHERE tablename = 'photos';

-- Step 2: If no results, add photos to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE photos;

-- Step 3: Verify it was added
SELECT * FROM pg_publication_tables WHERE tablename = 'photos';

-- Step 4: Check RLS is enabled (must be true for realtime)
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'photos';

-- Step 5: If RLS is disabled, enable it
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

-- Step 6: Check existing RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'photos' AND schemaname = 'public';

-- Step 7: Create a simple RLS policy for realtime if none exists
-- This allows authenticated users to see photos from events they have access to
CREATE POLICY "Enable realtime for photos" ON photos
  FOR SELECT USING (
    -- Allow access to photos from public events
    event_id IN (
      SELECT id FROM events WHERE password IS NULL
      -- You can add more complex access logic here
    )
    OR
    -- Allow access if user is authenticated (you can refine this)
    auth.role() = 'authenticated'
  );

-- Step 8: Grant necessary permissions
GRANT SELECT ON photos TO authenticated;
GRANT SELECT ON photos TO anon;

-- Step 9: Test with a simple insert
-- This should trigger realtime events
INSERT INTO photos (event_id, storage_path, uploader_name, caption)
VALUES (
  'test-event-id',
  'test/path.jpg',
  'Test User',
  'Test caption'
);

-- Step 10: Clean up test data
DELETE FROM photos WHERE uploader_name = 'Test User';

-- After running this, your realtime should work!
-- Check browser console for subscription status logs.
