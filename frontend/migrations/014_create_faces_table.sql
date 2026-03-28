CREATE TABLE faces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  photo_id UUID REFERENCES photos(id) ON DELETE CASCADE,
  -- In a real implementation with pg_vector, this would be `vector(128)`
  face_encoding TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_faces_photo_id ON faces(photo_id);
