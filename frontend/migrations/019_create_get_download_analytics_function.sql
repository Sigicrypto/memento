CREATE OR REPLACE FUNCTION get_download_analytics()
RETURNS TABLE (
  photo_id UUID,
  storage_path TEXT,
  download_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    d.photo_id,
    p.storage_path,
    COUNT(d.id) as download_count
  FROM
    downloads d
  JOIN
    photos p ON d.photo_id = p.id
  GROUP BY
    d.photo_id, p.storage_path
  ORDER BY
    download_count DESC;
END;
$$ LANGUAGE plpgsql;
