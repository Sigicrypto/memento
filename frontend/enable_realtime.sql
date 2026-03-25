-- Enable Real-time for Photos Table
-- This SQL ensures that the photos table is properly configured for real-time subscriptions

-- First, check if the publication exists
SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';

-- Add photos table to the realtime publication if not already added
-- This command may show an error if it's already added, which is fine
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND schemaname = 'public' 
        AND tablename = 'photos'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE photos;
        RAISE NOTICE 'Added photos table to realtime publication';
    ELSE
        RAISE NOTICE 'Photos table already in realtime publication';
    END IF;
END $$;

-- Grant necessary permissions for realtime
GRANT SELECT ON photos TO authenticated;
GRANT SELECT ON photos TO anon;

-- Verify the setup
SELECT 
    schemaname, 
    tablename, 
    pubname 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' 
AND tablename = 'photos';

-- Check RLS is enabled (required for realtime)
SELECT 
    schemaname, 
    tablename, 
    rowsecurity 
FROM pg_tables 
WHERE tablename = 'photos' 
AND schemaname = 'public';

-- If RLS is not enabled, enable it
-- Uncomment the line below if RLS is disabled
-- ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

-- Show current RLS policies for photos
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd, 
    qual 
FROM pg_policies 
WHERE tablename = 'photos' 
AND schemaname = 'public';
