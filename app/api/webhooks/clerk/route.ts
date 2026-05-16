import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: 'No webhook secret' }, { status: 500 });
  }

  const headerPayload = await headers();
  const svixId = headerPayload.get('svix-id');
  const svixTimestamp = headerPayload.get('svix-timestamp');
  const svixSignature = headerPayload.get('svix-signature');

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: 'Missing svix headers' }, { status: 400 });
  }

  const body = await req.text();
  const wh = new Webhook(webhookSecret);

  let event: { type: string; data: { id: string; email_addresses: { email_address: string }[]; first_name?: string } };
  try {
    event = wh.verify(body, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as typeof event;
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (event.type === 'user.created') {
    const email = event.data.email_addresses?.[0]?.email_address;
    const name = event.data.first_name ?? 'there';

    if (email) {
      await resend.emails.send({
        from: 'Vyzor <hello@vyzor.io>',
        to: email,
        subject: 'Welcome to Vyzor — your free trial starts now',
        html: `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#021a12;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:48px 24px;">
    <div style="margin-bottom:32px;">
      <span style="font-size:1.4rem;font-weight:900;color:#34d399;letter-spacing:-0.02em;">Vyzor</span>
    </div>

    <h1 style="font-size:1.6rem;font-weight:900;color:#f0fdf4;margin-bottom:12px;line-height:1.2;">
      Welcome, ${name} 👋
    </h1>
    <p style="color:rgba(167,243,208,0.75);font-size:0.95rem;line-height:1.7;margin-bottom:24px;">
      Your 14-day free trial is now active. You have full access to everything — automated scans, vulnerability detection, attack surface mapping, and AI-powered analysis.
    </p>

    <div style="background:rgba(52,211,153,0.08);border:1px solid rgba(52,211,153,0.2);border-radius:16px;padding:24px;margin-bottom:28px;">
      <p style="color:#f0fdf4;font-weight:700;font-size:0.95rem;margin-bottom:16px;">Get started in 3 steps:</p>
      <div style="display:flex;flex-direction:column;gap:12px;">
        <div style="display:flex;align-items:flex-start;gap:12px;">
          <span style="background:#34d399;color:#021a12;font-weight:900;font-size:0.7rem;width:20px;height:20px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;line-height:20px;text-align:center;">1</span>
          <p style="color:rgba(167,243,208,0.8);font-size:0.875rem;margin:0;line-height:1.5;">Go to your <a href="${process.env.NEXT_PUBLIC_APP_URL ?? 'https://vyzor.io'}/dashboard" style="color:#34d399;">dashboard</a> and enter your domain</p>
        </div>
        <div style="display:flex;align-items:flex-start;gap:12px;">
          <span style="background:#34d399;color:#021a12;font-weight:900;font-size:0.7rem;width:20px;height:20px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;line-height:20px;text-align:center;">2</span>
          <p style="color:rgba(167,243,208,0.8);font-size:0.875rem;margin:0;line-height:1.5;">Click <strong style="color:#f0fdf4;">Scan now</strong> — results appear in under 60 seconds</p>
        </div>
        <div style="display:flex;align-items:flex-start;gap:12px;">
          <span style="background:#34d399;color:#021a12;font-weight:900;font-size:0.7rem;width:20px;height:20px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;line-height:20px;text-align:center;">3</span>
          <p style="color:rgba(167,243,208,0.8);font-size:0.875rem;margin:0;line-height:1.5;">Review your vulnerabilities and connect Slack for instant alerts</p>
        </div>
      </div>
    </div>

    <a href="${process.env.NEXT_PUBLIC_APP_URL ?? 'https://vyzor.io'}/dashboard"
      style="display:inline-block;background:#34d399;color:#021a12;font-weight:800;font-size:0.9rem;padding:14px 28px;border-radius:12px;text-decoration:none;">
      Go to Dashboard →
    </a>

    <p style="color:rgba(167,243,208,0.4);font-size:0.78rem;margin-top:32px;line-height:1.6;">
      Questions? Reply to this email or contact us at <a href="mailto:hello@vyzor.io" style="color:#34d399;">hello@vyzor.io</a><br/>
      Vyzor Security · Your trial ends in 14 days
    </p>
  </div>
</body>
</html>`,
      }).catch(err => console.error('[webhook] Failed to send welcome email:', err));
    }
  }

  return NextResponse.json({ received: true });
}
