import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dummy.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy_key_for_build'
);

export async function POST(req: NextRequest) {
  try {
    const { eventId, guestDeviceId, mediaType, storagePath } = await req.json();

    if (!eventId || !guestDeviceId || !storagePath) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // 1. Transactionally check/increment guest counter
    const { data: counterData, error: rpcError } = await supabaseAdmin.rpc(
      'increment_guest_count_if_new',
      { p_event_id: eventId, p_guest_device_id: guestDeviceId }
    );

    if (rpcError) throw rpcError;

    const { new_guest_count, guest_limit, is_exceeded } = counterData[0] || {};

    // 2. Soft enforcement with 10% grace buffer before hard block
    if (is_exceeded && new_guest_count > guest_limit * 1.1) {
      return NextResponse.json(
        { 
          error: 'Event guest limit reached. Host must upgrade tier to allow more attendees.', 
          code: 'TIER_LIMIT_EXCEEDED' 
        }, 
        { status: 403 }
      );
    }

    // 3. Insert record into uploads
    const { data: upload, error: uploadError } = await supabaseAdmin
      .from('uploads')
      .insert({
        event_id: eventId,
        guest_device_id: guestDeviceId,
        media_type: mediaType || 'photo',
        storage_path: storagePath,
        is_approved: true,
      })
      .select()
      .single();

    if (uploadError) throw uploadError;

    return NextResponse.json({ 
      success: true, 
      upload, 
      currentGuestCount: new_guest_count,
      isExceeded: is_exceeded 
    });
  } catch (err: any) {
    console.error('Upload API error:', err);
    return NextResponse.json({ error: err.message || 'Upload failed' }, { status: 500 });
  }
}
