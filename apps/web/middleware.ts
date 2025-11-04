import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') || '';
  const hostname = host.split(':')[0];
  const parts = hostname.split('.');

  // Extract subdomain
  let subdomain: string | null = null;

  // Handle localhost and local testing
  if (hostname === 'localhost' || hostname.includes('127.0.0.1')) {
    return NextResponse.next();
  }

  // For production domains (e.g., brand.com)
  if (parts.length >= 3) {
    // Check if it's a known domain like www, admin, api, etc.
    const firstPart = parts[0];
    if (!['www', 'admin', 'api', 'brand'].includes(firstPart)) {
      subdomain = firstPart;
    }
  }

  // If subdomain found, attach it to request headers for use in route handlers
  if (subdomain) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-subdomain', subdomain);
    
    // Clone the request with new headers
    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
