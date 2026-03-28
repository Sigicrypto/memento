ALTER TABLE photos
ADD COLUMN guest_id TEXT;

CREATE INDEX IF NOT EXISTS idx_photos_guest_id ON photos(guest_id);
