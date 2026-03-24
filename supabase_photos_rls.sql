-- 1. Enable RLS on the photos table (usually enabled by default)
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

-- 2. CREATE POLICY to allow Anyone (Anon) to INSERT photo metadata rows
-- Without this, guests cannot upload and create timeline items.
CREATE POLICY "Enable insert for everyone" 
ON photos 
FOR INSERT 
WITH CHECK (true);

-- 3. CREATE POLICY to allow Anyone to SELECT/READ photos to view the stream
CREATE POLICY "Enable select for everyone" 
ON photos 
FOR SELECT 
USING (true);

-- ----------------------------------------------------
-- ⚠️ IMPORTANT: Also ensure Storage Bucket has policies!
-- ----------------------------------------------------
-- If you experience a storage Upload error next, run these:
-- (Uncomment and run if Bucket "photos" has RLS enabled)

-- CREATE POLICY "Enable insert to photos bucket for anon"
-- ON storage.objects FOR INSERT TO anon WITH CHECK (bucket_id = 'photos');

-- CREATE POLICY "Enable select from photos bucket for anon"
-- ON storage.objects FOR SELECT TO anon USING (bucket_id = 'photos');
