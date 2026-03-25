import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

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

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/system/:path*']
};
