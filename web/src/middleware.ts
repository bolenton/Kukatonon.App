import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon)
     * - public files (icons, manifest, etc.)
     * - api routes (handle their own auth)
     */
    '/((?!_next/static|_next/image|favicon\\.ico|icons|manifest\\.json|api/).*)',
  ],
};
