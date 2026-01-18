import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decrypt } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  // 1. List of protected zones
  const protectedPaths = ['/dashboard', '/cms', '/planner', '/brain', '/career', '/learning'];
  const path = request.nextUrl.pathname;
  const isProtected = protectedPaths.some(prefix => path.startsWith(prefix));

  if (isProtected) {
    // 2. Get the cookie
    const cookie = request.cookies.get('session')?.value;

    // 3. CRITICAL: Verify the encryption
    // If cookie is missing OR decryption fails, redirect to login
    if (!cookie) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    const session = await decrypt(cookie);
    
    if (!session) {
      // Cookie existed but was fake/tampered
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*', 
    '/cms/:path*', 
    '/planner/:path*',
    '/brain/:path*',
    '/career/:path*',
    '/learning/:path*',
    '/arsenal/:path*'
  ],
};