import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const REGION_COOKIE = 'livewall_region';

function detectCountryCode(request: NextRequest): string | undefined {
  // Prefer Next.js geo (works in some deployments), then common platform headers.
  const geoCountry = (request as any).geo?.country;
  if (geoCountry) return geoCountry;

  return (
    request.headers.get('x-vercel-ip-country') ||
    request.headers.get('cf-ipcountry') ||
    request.headers.get('x-country') ||
    undefined
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // -------- Region cookie (India vs Global) --------
  const countryCode = detectCountryCode(request);
  const region = countryCode === 'IN' ? 'IN' : 'GLOBAL';
  const existingRegion = request.cookies.get(REGION_COOKIE)?.value;

  const response = NextResponse.next();
  if (!existingRegion || existingRegion !== region) {
    response.cookies.set(REGION_COOKIE, region, {
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      sameSite: 'lax',
    });
  }

  // Protect admin routes with server-side session verification
  if (pathname.startsWith('/admin')) {
    // Get Supabase session from cookies
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    
    const projectId = supabaseUrl.split('//')[1].split('.')[0];
    const cookieName = `sb-${projectId}-auth-token`;
    let tokenStr = request.cookies.get('sb-access-token')?.value || request.cookies.get(cookieName)?.value;
    
    if (!tokenStr) {
      const chunk0 = request.cookies.get(`${cookieName}.0`)?.value;
      const chunk1 = request.cookies.get(`${cookieName}.1`)?.value;
      if (chunk0) tokenStr = chunk0 + (chunk1 || '');
    }

    let accessToken = tokenStr;
    if (tokenStr && tokenStr.startsWith('[')) {
      try {
        const parsed = JSON.parse(tokenStr);
        accessToken = parsed[0];
      } catch (e) {}
    }
    
    if (!accessToken) {
      // No session, redirect to system login
      return NextResponse.redirect(new URL('/system', request.url));
    }

    // Verify session and check admin role
    try {
      const supabase = createClient(supabaseUrl, supabaseKey, {
        global: {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      });
      const { data: { user }, error } = await supabase.auth.getUser(accessToken);
      
      if (error || !user) {
        return NextResponse.redirect(new URL('/system', request.url));
      }

      // Check if user has admin role in profiles table
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile?.role !== 'admin') {
        // Not an admin, redirect to system login
        return NextResponse.redirect(new URL('/system', request.url));
      }
    } catch (err) {
      console.error('Admin auth check failed:', err);
      return NextResponse.redirect(new URL('/system', request.url));
    }
  }

  return response;
}

export const config = {
  // Apply to the whole site so pricing/checkout can read region reliably.
  // Exclude static assets and common files.
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|api).*)',
  ],
};
