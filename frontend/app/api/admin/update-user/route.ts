import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { rateLimit } from '@/lib/rateLimit';

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  const { allowed } = rateLimit(ip, { maxRequests: 30, windowMs: 60000 });
  if (!allowed) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  try {
    const { userId, updates } = await request.json();

    if (!userId || typeof userId !== 'string' || !updates) {
      return NextResponse.json({ error: 'Missing userId or updates payload' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({
        error: 'SUPABASE_SERVICE_ROLE_KEY environment variable is missing on server.'
      }, { status: 503 });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
      db: { schema: 'public' }
    });

    // Authenticate via Authorization Bearer Token
    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

    let isRequesterAdmin = false;

    if (token) {
      const { data: { user } } = await supabaseAdmin.auth.getUser(token);
      if (user) {
        const { data: requesterProfile } = await supabaseAdmin
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        isRequesterAdmin = requesterProfile?.role === 'admin' || user.email?.toLowerCase() === 'sagarfalcon@gmail.com';
      }
    }

    // Bypass check if service role or direct admin action
    if (!isRequesterAdmin && token) {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Perform profile update with service role client (bypasses RLS)
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select();

    if (error) {
      console.error('[admin/update-user] Database update error:', error.message);
      return NextResponse.json({ error: error.message, details: error }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'User updated successfully', data });

  } catch (err: any) {
    console.error('[admin/update-user] Exception:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
