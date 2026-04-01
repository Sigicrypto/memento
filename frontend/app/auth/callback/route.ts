import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const plan = searchParams.get('plan') || 'starter';
  const origin = new URL(request.url).origin;

  if (code) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Upsert profile with plan from OAuth redirect
      await supabase.from('profiles').upsert({
        id: data.user.id,
        full_name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || '',
        email: data.user.email || '',
        plan: plan,
      });
    }
  }

  // Redirect to dashboard after auth
  return NextResponse.redirect(`${origin}/dashboard`);
}
