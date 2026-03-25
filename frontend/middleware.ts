import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

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

export function middleware(request: NextRequest) {
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

  // Protect admin routes
  if (pathname.startsWith('/admin') || pathname.startsWith('/system')) {
    // Check for admin access code in headers (for API calls)
    const adminCode = request.headers.get('x-admin-code');
    const expectedCode = process.env.ADMIN_ACCESS_CODE || 'memento-admin-2024';
    
    // For direct browser access, we'll rely on the page-level authentication
    // But you can add IP whitelisting here if needed
    const clientIP = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    
    // Optional: Add IP whitelisting
    const allowedIPs = process.env.ALLOWED_ADMIN_IPS?.split(',') || [];
    
    if (allowedIPs.length > 0 && !allowedIPs.includes(clientIP || '')) {
      // Log the attempt
      console.warn(`Unauthorized admin access attempt from IP: ${clientIP}`);
      
      // Don't block for now, but you can uncomment to enable IP protection
      // return new NextResponse('Access Denied', { status: 403 });
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
