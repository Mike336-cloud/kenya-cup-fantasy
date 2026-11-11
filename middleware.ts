import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/auth/adminToken';

// ─────────────────────────────────────────────────────────────────────────────
// EDGE SECURITY MIDDLEWARE
// Intercepts all administrative routes before pages or APIs are rendered.
// Unauthorized attempts to access /admin are immediately deflected to '/'.
// ─────────────────────────────────────────────────────────────────────────────

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only intercept /admin routes
  if (pathname.startsWith('/admin')) {
    // Allow public access ONLY to the admin login page
    if (pathname === '/admin/login' || pathname.startsWith('/admin/login/')) {
      return NextResponse.next();
    }

    // 1. Verify our secure HttpOnly signed admin token
    const adminToken = req.cookies.get('kc_admin_token')?.value;
    if (adminToken) {
      const { valid, payload } = await verifyAdminToken(adminToken);
      if (valid && payload?.role === 'ADMIN') {
        return NextResponse.next();
      }
    }

    // 2. Check for standard Supabase JWT session cookie
    // Supabase stores access tokens in cookies like sb-<project>-auth-token or sb-access-token
    const cookies = req.cookies.getAll();
    const supabaseAuthCookie = cookies.find(
      c => c.name.startsWith('sb-') && (c.name.endsWith('-auth-token') || c.name.includes('access-token'))
    );

    if (supabaseAuthCookie) {
      try {
        let rawValue = supabaseAuthCookie.value;
        // In some Supabase versions, cookie is JSON array or base64
        if (rawValue.startsWith('base64-')) {
          rawValue = atob(rawValue.replace('base64-', ''));
        }
        if (rawValue.startsWith('[')) {
          const parsed = JSON.parse(rawValue);
          rawValue = parsed[0] || '';
        }

        // Decode JWT payload without verification for role check (or full payload check)
        const parts = rawValue.split('.');
        if (parts.length === 3) {
          const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
          const payload = JSON.parse(atob(base64));

          const userRole = payload.role || payload.app_metadata?.role || payload.user_metadata?.role;
          const isAdmin = userRole === 'ADMIN' || userRole === 'admin' || payload.app_metadata?.is_admin === true;

          if (isAdmin) {
            return NextResponse.next();
          }
        }
      } catch {
        // Fall through to deflection
      }
    }

    // Unauthorized access: Deflect immediately to the homepage (Edge blocking)
    const url = req.nextUrl.clone();
    url.pathname = '/';
    url.search = '';
    return NextResponse.redirect(url, { status: 302 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin', '/admin/:path*'],
};

