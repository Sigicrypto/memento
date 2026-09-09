CREATE TABLE IF NOT EXISTS studios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_user_id UUID REFERENCES auth.users(id),
    studio_name TEXT,
    logo_url TEXT,
    brand_colors JSONB DEFAULT '{"primary": "#C8963E", "secondary": "#0891A8"}'::jsonb,
    default_currency TEXT CHECK (default_currency IN ('INR','USD')) DEFAULT 'INR',
    multi_event_discount_percent NUMERIC DEFAULT 15.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE events 
ADD COLUMN IF NOT EXISTS studio_id UUID REFERENCES studios(id),
ADD COLUMN IF NOT EXISTS owner_user_id UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS client_name TEXT,
ADD COLUMN IF NOT EXISTS client_email TEXT,
ADD COLUMN IF NOT EXISTS client_phone TEXT,
ADD COLUMN IF NOT EXISTS event_name TEXT,
ADD COLUMN IF NOT EXISTS event_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS venue TEXT,
ADD COLUMN IF NOT EXISTS guest_tier TEXT CHECK (guest_tier IN ('SMALL','MEDIUM','LARGE')) DEFAULT 'SMALL',
ADD COLUMN IF NOT EXISTS guest_limit INT DEFAULT 100,
ADD COLUMN IF NOT EXISTS current_guest_count INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS pricing_tier_price NUMERIC DEFAULT 999,
ADD COLUMN IF NOT EXISTS status TEXT CHECK (status IN ('DRAFT','ACTIVE','CLOSED')) DEFAULT 'DRAFT',
ADD COLUMN IF NOT EXISTS is_white_labeled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS branding JSONB;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='events' AND column_name='owner_id') THEN
        EXECUTE 'UPDATE events SET owner_user_id = owner_id WHERE owner_user_id IS NULL AND owner_id IS NOT NULL';
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS uploads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES events(id),
    guest_device_id TEXT,
    media_type TEXT CHECK (media_type IN ('photo','video')),
    storage_path TEXT,
    is_approved BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    studio_id UUID REFERENCES studios(id),
    event_id UUID REFERENCES events(id),
    tier TEXT CHECK (tier IN ('SMALL','MEDIUM','LARGE')),
    amount NUMERIC,
    currency TEXT DEFAULT 'INR',
    status TEXT CHECK (status IN ('pending','paid','failed','refunded')),
    multi_event_bundle_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_events_studio_id ON events(studio_id);
CREATE INDEX IF NOT EXISTS idx_events_owner_user_id ON events(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_uploads_event_guest ON uploads(event_id, guest_device_id);
CREATE INDEX IF NOT EXISTS idx_orders_studio_id ON orders(studio_id);
CREATE INDEX IF NOT EXISTS idx_orders_event_id ON orders(event_id);

ALTER TABLE studios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Studios are viewable by owner" ON studios FOR SELECT USING (auth.uid() = owner_user_id);
CREATE POLICY "Studios can be inserted by owner" ON studios FOR INSERT WITH CHECK (auth.uid() = owner_user_id);
CREATE POLICY "Studios can be updated by owner" ON studios FOR UPDATE USING (auth.uid() = owner_user_id);
CREATE POLICY "Studios can be deleted by owner" ON studios FOR DELETE USING (auth.uid() = owner_user_id);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Events owner+studio-owner" ON events FOR ALL USING (auth.uid() = owner_user_id OR (studio_id IS NOT NULL AND auth.uid() IN (SELECT owner_user_id FROM studios WHERE id = studio_id)));

ALTER TABLE uploads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Uploads public read" ON uploads FOR SELECT USING (true);
CREATE POLICY "Uploads public insert" ON uploads FOR INSERT WITH CHECK (true);
CREATE POLICY "Uploads manage by owner" ON uploads FOR ALL USING (
    auth.uid() IN (SELECT owner_user_id FROM events WHERE events.id = uploads.event_id)
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Orders studio owner read" ON orders FOR SELECT USING (
    auth.uid() IN (SELECT owner_user_id FROM studios WHERE studios.id = orders.studio_id)
);

CREATE OR REPLACE FUNCTION increment_guest_count_if_new(p_event_id UUID, p_guest_device_id TEXT)
RETURNS TABLE (new_guest_count INT, guest_limit INT, is_exceeded BOOLEAN) AS $$
DECLARE
    v_has_uploaded BOOLEAN;
    v_event_record RECORD;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM uploads 
        WHERE event_id = p_event_id AND guest_device_id = p_guest_device_id
    ) INTO v_has_uploaded;
    
    SELECT * INTO v_event_record 
    FROM events 
    WHERE id = p_event_id 
    FOR UPDATE;
    
    IF NOT v_has_uploaded THEN
        UPDATE events 
        SET current_guest_count = current_guest_count + 1 
        WHERE id = p_event_id 
        RETURNING current_guest_count, events.guest_limit INTO new_guest_count, guest_limit;
    ELSE
        new_guest_count := v_event_record.current_guest_count;
        guest_limit := v_event_record.guest_limit;
    END IF;
    
    is_exceeded := (new_guest_count > guest_limit);
    
    RETURN NEXT;
END;
$$ LANGUAGE plpgsql;
