-- Migration: social_posts_queue
-- Description: Stores scheduled daily social media posts for automated publishing via Meta Graph API.

CREATE TABLE IF NOT EXISTS public.social_posts_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platform TEXT NOT NULL CHECK (platform IN ('facebook', 'instagram', 'both')),
    caption TEXT NOT NULL,
    image_url TEXT NOT NULL,
    scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'published', 'failed')),
    published_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for cron lookup query
CREATE INDEX IF NOT EXISTS idx_social_posts_pending ON public.social_posts_queue (scheduled_for, status);

-- Enable RLS
ALTER TABLE public.social_posts_queue ENABLE ROW LEVEL SECURITY;

-- Allow service role full access
CREATE POLICY "Service Role Full Access" ON public.social_posts_queue
    FOR ALL USING (auth.role() = 'service_role');
