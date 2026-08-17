import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseServiceKey) return null;
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    db: { schema: 'public' }
  });
}

async function verifyAdmin(request: NextRequest, supabaseAdmin: any) {
  const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
  if (!token) return false;

  const { data: { user } } = await supabaseAdmin.auth.getUser(token);
  if (!user) return false;

  const SUPER_ADMIN_EMAIL = process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL || 'sagarfalcon@gmail.com';
  if (user.email?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()) return true;

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  return profile?.role === 'admin';
}

export async function GET(request: NextRequest) {
  try {
    const supabaseAdmin = getAdminClient();
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Supabase configuration missing' }, { status: 503 });
    }

    const isAdmin = await verifyAdmin(request, supabaseAdmin);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId parameter' }, { status: 400 });
    }

    const { data: targetUserData, error } = await supabaseAdmin.auth.admin.getUserById(userId);
    if (error || !targetUserData?.user) {
      return NextResponse.json({ error: error?.message || 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      metadata: targetUserData.user.user_metadata || {},
      email: targetUserData.user.email
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = getAdminClient();
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Supabase configuration missing' }, { status: 503 });
    }

    const isAdmin = await verifyAdmin(request, supabaseAdmin);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { userId, metadata } = await request.json();

    if (!userId || !metadata) {
      return NextResponse.json({ error: 'Missing userId or metadata payload' }, { status: 400 });
    }

    const { data: targetUserData, error: fetchErr } = await supabaseAdmin.auth.admin.getUserById(userId);
    if (fetchErr || !targetUserData?.user) {
      return NextResponse.json({ error: fetchErr?.message || 'User not found' }, { status: 404 });
    }

    const existingMetadata = targetUserData.user.user_metadata || {};
    const updatedMetadata = {
      ...existingMetadata,
      ...metadata
    };

    const { data: updatedUser, error: updateErr } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      user_metadata: updatedMetadata
    });

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Branding metadata updated successfully',
      metadata: updatedUser.user.user_metadata
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
