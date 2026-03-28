CREATE OR REPLACE FUNCTION trigger_ai_best_shot() 
RETURNS TRIGGER AS $$
BEGIN
  PERFORM http_request(
    'https://<YOUR_PROJECT_REF>.supabase.co/functions/v1/ai-best-shot',
    'POST',
    '{"Content-Type": "application/json", "Authorization": "Bearer <YOUR_SUPABASE_ANON_KEY>"}',
    json_build_object('record', NEW)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_photo_insert
  AFTER INSERT ON photos
  FOR EACH ROW
  EXECUTE PROCEDURE trigger_ai_best_shot();

-- NOTE: Replace <YOUR_PROJECT_REF> and <YOUR_SUPABASE_ANON_KEY> with your actual Supabase project details.
