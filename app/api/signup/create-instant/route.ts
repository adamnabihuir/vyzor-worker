import { NextResponse } from 'next/server';

/**
 * DISABLED — This endpoint bypassed email verification by using the Clerk admin API
 * to create users with auto-verified emails and instant sign-in tokens.
 *
 * Signup now uses the email link verification flow:
 *   /signup → email link → /auth/verify-email → /auth/set-password
 */
export async function POST() {
  return NextResponse.json(
    { error: 'This endpoint is disabled. Use the email link signup flow.' },
    { status: 410 },
  );
}
