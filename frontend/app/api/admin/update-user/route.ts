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

    // Use Service Role Client if configured (bypasses RLS & triggers safely)
    if (supabaseUrl && supabaseServiceKey) {
      const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
        auth: { autoRefreshToken: false, persistSession: false }
      });

      const { error } = await supabaseAdmin
        .from('profiles')
        .update(updates)
        .eq('id', userId);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      return NextResponse.json({ success: true, message: 'User updated successfully' });
    }

    // Fallback: If service role key is missing, return error guiding config
    return NextResponse.json({
      error: 'SUPABASE_SERVICE_ROLE_KEY environment variable is required to update user subscriptions on production.'
    }, { status: 503 });

  } catch (err: any) {
    console.error('Update user API error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
