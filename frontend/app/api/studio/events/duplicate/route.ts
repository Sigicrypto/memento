import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy_key_for_build'
);

export async function POST(req: NextRequest) {
  try {
    const { eventId, newEventName } = await req.json();

    if (!eventId) {
      return NextResponse.json({ error: 'Missing eventId' }, { status: 400 });
    }

    // Fetch original event
    const { data: original, error: fetchErr } = await supabaseAdmin
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();

    if (fetchErr || !original) {
      return NextResponse.json({ error: 'Original event not found' }, { status: 404 });
    }

    // Generate unique slug
    const baseSlug = (newEventName || `${original.event_name || 'event'} copy`)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 35);
    const uniqueSlug = `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`;

    // Clone event settings without photo data
    const { data: cloned, error: insertErr } = await supabaseAdmin
      .from('events')
      .insert({
        studio_id: original.studio_id,
        owner_user_id: original.owner_user_id,
        owner_id: original.owner_id,
        event_name: newEventName || `${original.event_name || 'Event'} (Copy)`,
        event_date: original.event_date,
        venue: original.venue,
        client_name: original.client_name,
        client_email: original.client_email,
        client_phone: original.client_phone,
        guest_tier: original.guest_tier || 'SMALL',
        guest_limit: original.guest_limit || 100,
        current_guest_count: 0,
        status: 'DRAFT',
        is_white_labeled: original.is_white_labeled,
        branding: original.branding,
        slug: uniqueSlug,
      })
      .select()
      .single();

    if (insertErr) throw insertErr;

    return NextResponse.json({ success: true, event: cloned });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Duplication failed' }, { status: 500 });
  }
}
