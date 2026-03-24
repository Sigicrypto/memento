-- 🚨 ULTIMATE DIAGNOSTIC STEP
-- Run this to DISABLE Row Level Security completely on the photos table.
-- This will rule out if it's a conflict between multiple policies.

ALTER TABLE photos DISABLE ROW LEVEL SECURITY;

-- 👉 INSTRUCTIONS:
-- 1. Run the above command in your SQL editor.
-- 2. Try to upload a photo again from Vercel/Localhost.
--
-- 🟢 IF IT WORKS NOW:
-- It means you had other existing policies (e.g. restrictive or owner-only) 
-- that are colliding with the new one. 
-- To fix permanently while keeping RLS enabled:
--   Run: DROP POLICY IF EXISTS "Enable insert for everyone" ON photos;
--   And make sure NO other restrictive policies are targeting 'anon' inserts!
--
-- 🔴 IF IT STILL FAILS WITH THE SAME ERROR:
-- It means the error is NOT caused by RLS! 
-- It is likely inside a Database Trigger (Trigger Function) 
-- or constraint on the 'photos' table throwing that specific Exception string.
