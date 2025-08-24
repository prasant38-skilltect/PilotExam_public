
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Rewrite API requests to the Express server
  if (request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.rewrite(new URL(request.nextUrl.pathname, 'http://localhost:5000'));
  }
}

export const config = {
  matcher: '/api/:path*',
};
