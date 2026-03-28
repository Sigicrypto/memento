import { serve } from 'https://deno.land/std@0.131.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// IMPORTANT: In a real application, API keys should be stored securely
// and not hardcoded. This is a placeholder.
const API_KEY = 'YOUR_SECRET_API_KEY';

serve(async (req) => {
  try {
    const url = new URL(req.url);
    const eventSlug = url.searchParams.get('event_slug');
    const apiKey = req.headers.get('X-API-Key');

    if (apiKey !== API_KEY) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    if (!eventSlug) {
      return new Response(JSON.stringify({ error: 'Missing event_slug parameter' }), { status: 400 });
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const { data: event, error } = await supabaseClient
      .from('events')
      .select('*')
      .eq('slug', eventSlug)
      .single();

    if (error) throw error;

    return new Response(JSON.stringify(event), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
