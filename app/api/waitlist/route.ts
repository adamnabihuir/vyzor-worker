import { NextRequest, NextResponse } from 'next/server';

const NOTIFY_EMAIL = process.env.NOTIFY_EMAIL ?? 'adam@vanguard.io';
const FROM_EMAIL   = process.env.FROM_EMAIL   ?? 'hello@vektorasm.me';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    const trimmed = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 422 });
    }

    if (!process.env.RESEND_API_KEY) {
      console.log(`[waitlist] No RESEND_API_KEY — skipping send. Email: ${trimmed}`);
      return NextResponse.json({ ok: true });
    }

    const { Resend } = await import('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);

    await Promise.all([
      /* Notify founder */
      resend.emails.send({
        from: FROM_EMAIL,
        to: NOTIFY_EMAIL,
        subject: `🎯 New Vyzor waitlist signup: ${trimmed}`,
        html: `<p><strong>${trimmed}</strong> just joined the Vyzor waitlist.</p>`,
      }),

      /* Welcome the signup */
      resend.emails.send({
        from: FROM_EMAIL,
        to: trimmed,
        subject: "You're on the Vyzor waitlist 🔒",
        html: `
          <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px">
            <h2 style="color:#021a12;font-weight:900;margin-bottom:8px">You're in.</h2>
            <p style="color:#475569;line-height:1.7">
              Thanks for joining the Vyzor early access list. We're onboarding security teams
              in batches — you'll hear from us soon with next steps.
            </p>
            <p style="color:#475569;line-height:1.7;margin-top:16px">
              In the meantime, reply to this email with any questions.
            </p>
            <p style="color:#94a3b8;font-size:0.85rem;margin-top:32px">
              — The Vyzor team
            </p>
          </div>
        `,
      }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[waitlist] error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
