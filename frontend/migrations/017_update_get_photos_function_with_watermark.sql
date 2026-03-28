CREATE OR REPLACE FUNCTION get_photos_with_reactions(event_uuid UUID)
RETURNS TABLE (
  id UUID,
  storage_path TEXT,
  uploader_name TEXT,
  created_at TIMESTAMPTZ,
  caption TEXT,
  event_id UUID,
  media_type TEXT,
  reaction_count BIGINT,
  is_best_shot BOOLEAN,
  approved BOOLEAN,
  watermark_url TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.storage_path,
    p.uploader_name,
    p.created_at,
    p.caption,
    p.event_id,
    p.media_type,
    COUNT(r.id) as reaction_count,
    p.is_best_shot,
    p.approved,
    e.watermark_url
  FROM
    photos p
  LEFT JOIN
    reactions r ON p.id = r.photo_id
  JOIN
    events e ON p.event_id = e.id
  WHERE
    p.event_id = event_uuid
  GROUP BY
    p.id, e.watermark_url
  ORDER BY
    p.created_at DESC;
END;
$$ LANGUAGE plpgsql;
