import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const { userId, updates } = await request.json();

    if (!userId || typeof userId !== 'string' || !updates) {
      return NextResponse.json({ error: 'Missing userId or updates payload' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    console.log('[admin/update-user] URL exists:', !!supabaseUrl, 'ServiceKey exists:', !!supabaseServiceKey);
    console.log('[admin/update-user] userId:', userId, 'updates:', JSON.stringify(updates));

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({
        error: 'SUPABASE_SERVICE_ROLE_KEY environment variable is not configured.'
      }, { status: 503 });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
      db: { schema: 'public' }
    });

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select();

    console.log('[admin/update-user] result:', JSON.stringify({ data, error }));

    if (error) {
      return NextResponse.json({ error: error.message, details: error }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'User updated successfully', data });

  } catch (err: any) {
    console.error('[admin/update-user] Error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
