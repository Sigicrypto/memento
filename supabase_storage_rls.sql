-- 🟢 FIX FOR STORAGE BUCKET UPLOADS
-- The error "new row violates row-level security policy" can ALSO come from 
-- trying to upload files to Storage without permission!

-- Run these to allow Guests to upload and read from the 'photos' bucket:

CREATE POLICY "Enable insert on photos bucket for anon"
ON storage.objects FOR INSERT TO anon 
WITH CHECK (bucket_id = 'photos');

CREATE POLICY "Enable select on photos bucket for anon"
ON storage.objects FOR SELECT TO anon 
USING (bucket_id = 'photos');

-- -------------------------------------------------------------------
-- 👉 INSTRUCTIONS:
-- 1. Run the above command in your Supabase SQL Editor.
-- 2. Retry your upload.
-- 3. (Optional) Re-enable table RLS to stay secure:
--    ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
