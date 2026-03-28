import { serve } from 'https://deno.land/std@0.131.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const { record: photo } = await req.json()

    if (!photo || !photo.event_id) {
      throw new Error('Missing photo or event_id in payload')
    }

    // 1. Check if AI album is enabled for the event
    const { data: event, error: eventError } = await supabaseClient
      .from('events')
      .select('enable_ai_album')
      .eq('id', photo.event_id)
      .single()

    if (eventError) throw eventError
    if (!event?.enable_ai_album) {
      return new Response(JSON.stringify({ message: 'AI album not enabled for this event' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    // 2. Placeholder AI logic: randomly mark 20% of photos as best shots
    const isBestShot = Math.random() < 0.2;

    if (isBestShot) {
      // 3. Update the photo record
      const { error: updateError } = await supabaseClient
        .from('photos')
        .update({ is_best_shot: true })
        .eq('id', photo.id)

      if (updateError) throw updateError

      return new Response(JSON.stringify({ message: `Photo ${photo.id} marked as a best shot.` }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    return new Response(JSON.stringify({ message: `Photo ${photo.id} was not selected as a best shot.` }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
