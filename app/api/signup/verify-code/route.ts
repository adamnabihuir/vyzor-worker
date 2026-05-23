import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const MAX_ATTEMPTS = 5;

export async function POST(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { email, code } = await req.json().catch(() => ({}));

  if (!email || !code) {
    return NextResponse.json({ error: 'email and code are required' }, { status: 400 });
  }

  // Find the latest unused, unexpired code for this email
  const { data: record } = await supabase
    .from('email_verification_codes')
    .select('id, code, attempts, expires_at, user_id')
    .eq('email', email.trim().toLowerCase())
    .is('used_at', null)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!record) {
    return NextResponse.json({ error: 'Code expired or not found. Request a new one.' }, { status: 400 });
  }

  if (record.attempts >= MAX_ATTEMPTS) {
    return NextResponse.json({ error: 'Too many attempts. Request a new code.' }, { status: 429 });
  }

  // Increment attempt counter
  await supabase
    .from('email_verification_codes')
    .update({ attempts: record.attempts + 1 })
    .eq('id', record.id);

  if (record.code !== code.trim()) {
    const remaining = MAX_ATTEMPTS - (record.attempts + 1);
    return NextResponse.json({
      error: `Incorrect code. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`,
    }, { status: 400 });
  }

  // Mark code as used
  await supabase
    .from('email_verification_codes')
    .update({ used_at: new Date().toISOString() })
    .eq('id', record.id);

  // Mark user email as verified
  await supabase
    .from('users')
    .update({
      email_verified_at: new Date().toISOString(),
      onboarding_step: 'profile',
    })
    .eq('id', record.user_id);

  // Log trial event
  await supabase.from('trial_events').insert({
    user_id: record.user_id,
    event_type: 'email_verified',
  });

  return NextResponse.json({ success: true, userId: record.user_id });
}
