import { clerkMiddleware } from '@clerk/nextjs/server';
import createIntlMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';
import { routing } from './i18n/routing';

const intlMiddleware = createIntlMiddleware(routing);

const SKIP_INTL_PREFIXES = [
  '/dashboard',
  '/admin',
  '/api',
  '/auth',
  '/onboarding',
  '/signup',
  '/sign-in',
  '/sign-up',
  '/terms',
  '/privacy',
  '/about',
  '/checkout',
  '/auth/force-password',
];

// Routes that bypass corporate email check — redirect to /signup instead
const REGISTER_BYPASS_PATHS = ['/auth/register', '/auth/sign-up', '/sign-up'];

export const proxy = clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl;

  // ── Redirect Clerk's default pages → our custom pages ─────────
  if (REGISTER_BYPASS_PATHS.some((p) => pathname.startsWith(p))) {
    const url = req.nextUrl.clone();
    url.pathname = '/signup';
    return NextResponse.redirect(url);
  }

  // ── Dashboard protection — Level 1 (middleware) ───────────────
  // Any unauthenticated request to /dashboard/* → /auth/login
  if (pathname.startsWith('/dashboard')) {
    const { userId } = await auth();
    if (!userId) {
      const url = req.nextUrl.clone();
      url.pathname = '/auth/login';
      url.searchParams.set('redirect_url', pathname);
      return NextResponse.redirect(url);
    }
  }

  // ── Admin protection — Level 1 (middleware) ───────────────────
  // Silent redirect — attacker learns nothing about /admin existence
  if (pathname.startsWith('/admin')) {
    const { userId, sessionClaims } = await auth();
    if (!userId) {
      const url = req.nextUrl.clone();
      url.pathname = '/auth/login';
      return NextResponse.redirect(url);
    }
    const role = (sessionClaims?.metadata as { role?: string } | undefined)?.role;
    if (role !== 'admin') {
      const url = req.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }
  }

  const skipIntl = SKIP_INTL_PREFIXES.some((p) => pathname.startsWith(p));
  if (!skipIntl) {
    return intlMiddleware(req);
  }
});

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|webmanifest)$).*)',
  ],
};
