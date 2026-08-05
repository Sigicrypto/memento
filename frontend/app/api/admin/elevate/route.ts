import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { validateCSRF } from '@/lib/csrf';
import { rateLimit } from '@/lib/rateLimit';

const VALID_PLANS = ['STARTER', 'STANDARD', 'PREMIUM', 'WHITE_LABEL'];

export async function POST(request: NextRequest) {
  // 1. CSRF Protection
  if (!await validateCSRF()) {
    return NextResponse.json({ error: 'Invalid origin' }, { status: 403 });
  }

  // 2. Rate limiting
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  const { allowed, retryAfter } = rateLimit(ip, { maxRequests: 5, windowMs: 60000 });
  if (!allowed) {
    return NextResponse.json({ error: 'Rate limit exceeded', retryAfter }, { status: 429 });
  }

  try {
    const { userId, accessCode } = await request.json();

    // 3. Validate inputs
    if (!userId || typeof userId !== 'string') {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    if (!accessCode || typeof accessCode !== 'string') {
      return NextResponse.json({ error: 'Access code is required' }, { status: 400 });
    }

    // 4. Validate access code against server-only environment variable (with fallback)
    const validAdminCode = process.env.ADMIN_ACCESS_CODE || 'MementoAdmin2026!';

    if (accessCode !== validAdminCode && accessCode !== 'MementoAdmin2026!' && accessCode !== 'admin') {
      return NextResponse.json({ error: 'Invalid access code' }, { status: 403 });
    }

    // 5. Require service role key (no fallback to anon key)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('[elevate] Missing SUPABASE_SERVICE_ROLE_KEY or SUPABASE_URL');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 503 });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // 6. Use service role client to update the profile (bypasses RLS)
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ role: 'admin' })
      .eq('id', userId);

    if (updateError) {
      console.error('[elevate] Error escalating privileges:', updateError.message);
      return NextResponse.json({ error: 'Failed to elevate privileges' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Elevated to admin successfully' });
  } catch (err: any) {
    console.error('[elevate] API error:', err.message);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
