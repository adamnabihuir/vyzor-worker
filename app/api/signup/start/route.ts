import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { validateEmail } from '@/lib/auth/email-validation';

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const body = await req.json().catch(() => ({}));
  const { email, clerkId } = body;

  if (!email || !clerkId) {
    return NextResponse.json({ error: 'email and clerkId are required' }, { status: 400 });
  }

  const emailResult = validateEmail(email);
  if (!emailResult.valid) {
    return NextResponse.json({ error: emailResult.reason }, { status: 400 });
  }

  // Upsert user record (Clerk already created the auth account)
  const { data: user, error: upsertError } = await supabase
    .from('users')
    .upsert(
      {
        clerk_id: clerkId,
        email: email.trim().toLowerCase(),
        email_type: emailResult.type,
        signup_ip: req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? null,
        signup_user_agent: req.headers.get('user-agent') ?? null,
        onboarding_step: 'email',
      },
      { onConflict: 'clerk_id' }
    )
    .select('id')
    .single();

  if (upsertError || !user) {
    console.error('[signup/start] upsert error:', upsertError);
    return NextResponse.json({ error: 'Failed to create user record' }, { status: 500 });
  }

  // Generate and store OTP
  const code = generateOTP();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  // Invalidate any previous unused codes for this email
  await supabase
    .from('email_verification_codes')
    .update({ used_at: new Date().toISOString() })
    .eq('user_id', user.id)
    .is('used_at', null);

  await supabase.from('email_verification_codes').insert({
    user_id: user.id,
    email: email.trim().toLowerCase(),
    code,
    expires_at: expiresAt,
  });

  // Send OTP via Resend
  if (process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: 'Vyzor <hello@vektorasm.me>',
      to: email,
      subject: `Your Vyzor verification code: ${code}`,
      html: `
<!DOCTYPE html>
<html>
<body style="font-family:sans-serif;background:#0f172a;padding:40px;color:#f1f5f9">
  <div style="max-width:480px;margin:0 auto;background:#1e293b;border-radius:16px;padding:40px;border:1px solid #334155">
    <h1 style="font-size:18px;font-weight:900;color:#f1f5f9;margin:0 0 8px">Vyzor</h1>
    <p style="color:#64748b;font-size:13px;margin:0 0 32px">Attack Surface Management</p>

    <h2 style="font-size:16px;font-weight:600;color:#94a3b8;margin:0 0 24px">Your verification code</h2>

    <div style="background:#0f172a;border:1px solid #334155;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px">
      <div style="font-size:40px;font-weight:900;letter-spacing:16px;color:#10b981;font-family:monospace">${code}</div>
    </div>

    <p style="color:#64748b;font-size:13px;margin:0 0 8px">This code expires in <strong style="color:#f1f5f9">10 minutes</strong>.</p>
    <p style="color:#475569;font-size:12px;margin:0">If you didn't request this, you can safely ignore this email.</p>

    <p style="font-size:12px;color:#334155;margin-top:32px;padding-top:16px;border-top:1px solid #1e293b">
      © 2026 Vyzor
    </p>
  </div>
</body>
</html>`,
    });
  }

  // Log attempt
  await supabase.from('signup_attempts').insert({
    email: email.trim().toLowerCase(),
    ip_address: req.headers.get('x-forwarded-for') ?? null,
    user_agent: req.headers.get('user-agent') ?? null,
    email_type: emailResult.type,
    result: 'success',
  });

  return NextResponse.json({ success: true, userId: user.id });
}
