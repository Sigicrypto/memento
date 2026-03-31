-- Create demo_uploads table for reliable real-time demo wall updates
create table if not exists public.demo_uploads (
  id          uuid primary key default gen_random_uuid(),
  demo_id     text not null,
  url         text not null,
  type        text not null default 'image', -- 'image' | 'video'
  caption     text not null default '',
  uploader    text not null default 'Demo Guest',
  created_at  timestamptz not null default now()
);

-- Index for fast queries by demo_id
create index if not exists demo_uploads_demo_id_idx on public.demo_uploads (demo_id);

-- Auto-delete rows older than 1 hour to keep table clean
-- (run as a scheduled job or handle TTL via RLS)
alter table public.demo_uploads enable row level security;

-- Allow anyone to insert (upload page)
create policy "Anyone can insert demo uploads"
  on public.demo_uploads for insert
  with check (true);

-- Allow anyone to select (wall page)
create policy "Anyone can read demo uploads"
  on public.demo_uploads for select
  using (true);

-- Enable Realtime for this table
alter publication supabase_realtime add table public.demo_uploads;
