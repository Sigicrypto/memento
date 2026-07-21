import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { updateSession } from './lib/supabase/middleware';

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

  // 1. Initialize Supabase SSR client and get the response object
  // This automatically refreshes the session if needed and sets updated cookies on supabaseResponse
  const { supabase, supabaseResponse } = updateSession(request);

  // 2. Handle Region cookie
  const countryCode = detectCountryCode(request);
  const region = countryCode === 'IN' ? 'IN' : 'GLOBAL';
  const existingRegion = request.cookies.get(REGION_COOKIE)?.value;

  if (!existingRegion || existingRegion !== region) {
    supabaseResponse.cookies.set(REGION_COOKIE, region, {
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      sameSite: 'lax',
    });
  }

  // 3. Protect admin routes
  if (pathname.startsWith('/admin')) {
    try {
      // getUser() securely validates the token with the Supabase Auth server
      const { data: { user }, error } = await supabase.auth.getUser();
      
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

  // If everything is fine, return the supabaseResponse to ensure cookies are updated
  return supabaseResponse;
}

export const config = {
  // Apply to the whole site so pricing/checkout can read region reliably.
  // Exclude static assets and common files.
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|api).*)',
  ],
};
