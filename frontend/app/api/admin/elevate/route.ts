import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const { userId, accessCode } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const validAdminCode = process.env.NEXT_PUBLIC_ADMIN_ACCESS_CODE || 'memento-admin-2024';

    if (accessCode !== validAdminCode) {
      return NextResponse.json({ error: 'Invalid access code' }, { status: 403 });
    }

    // Use service role client to update the profile (bypasses RLS triggers restricting role changes)
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ role: 'admin' })
      .eq('id', userId);

    if (updateError) {
      console.error('Error escalating privileges:', updateError);
      return NextResponse.json({ error: 'Failed to elevate privileges' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Elevated to admin successfully' });
  } catch (err: any) {
    console.error('Elevate API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
