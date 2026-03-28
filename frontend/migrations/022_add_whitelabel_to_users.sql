ALTER TABLE auth.users
ADD COLUMN plan_tier TEXT DEFAULT 'free',
ADD COLUMN brand_logo_url TEXT,
ADD COLUMN brand_colors JSONB;
