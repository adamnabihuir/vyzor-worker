import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { validateEmail } from '@/lib/auth/email-validation';

export async function POST(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { email } = await req.json().catch(() => ({}));

  if (!email || typeof email !== 'string') {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }

  const result = validateEmail(email);

  if (!result.valid) {
    return NextResponse.json({ valid: false, reason: result.reason, type: result.type }, { status: 200 });
  }

  // Block only fully verified accounts (clerk_id set = account exists in Clerk)
  const { data: existing } = await supabase
    .from('users')
    .select('id, clerk_id, email_verified_at')
    .eq('email', email.trim().toLowerCase())
    .not('clerk_id', 'is', null)
    .not('email_verified_at', 'is', null)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({
      valid: false,
      reason: 'This email is already registered. Sign in instead.',
      type: 'duplicate',
    }, { status: 200 });
  }

  return NextResponse.json({ valid: true, type: result.type });
}
