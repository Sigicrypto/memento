import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { validateCSRF } from '@/lib/csrf';
import { rateLimit } from '@/lib/rateLimit';

export async function POST(request: NextRequest) {
  if (!await validateCSRF()) {
    return NextResponse.json({ error: 'Invalid origin' }, { status: 403 });
  }

  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  const { allowed } = rateLimit(ip, { maxRequests: 20, windowMs: 60000 });
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
        error: 'SUPABASE_SERVICE_ROLE_KEY environment variable is not configured.'
      }, { status: 503 });
    }

    // Verify session & admin role using SSR server client
    let response = NextResponse.next();
    const supabaseUserClient = createServerClient(
      supabaseUrl,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return request.cookies.getAll(); },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          },
        },
      }
    );

    const { data: { user } } = await supabaseUserClient.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized: Authentication required' }, { status: 401 });
    }

    // Check if authenticated user is admin or superadmin
    const { data: requesterProfile } = await supabaseUserClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const isRequesterAdmin = requesterProfile?.role === 'admin' || user.email?.toLowerCase() === 'sagarfalcon@gmail.com';
    if (!isRequesterAdmin) {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
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
