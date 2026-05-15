import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { Resend } from 'resend';

const NOTIFY_SECRET = process.env.NOTIFY_SECRET ?? '';

export async function POST(req: NextRequest) {
  // Worker must send X-Notify-Secret header to prevent abuse
  const secret = req.headers.get('x-notify-secret') ?? '';
  if (!NOTIFY_SECRET || secret !== NOTIFY_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { scanId } = await req.json().catch(() => ({}));
  if (!scanId) return NextResponse.json({ error: 'scanId required' }, { status: 400 });

  const supabase = getSupabaseAdmin();
  const { data: scan, error } = await supabase
    .from('scans')
    .select('domain, status, stats, findings')
    .eq('id', scanId)
    .single();

  if (error || !scan) return NextResponse.json({ error: 'Scan not found' }, { status: 404 });

  const toEmail = process.env.NOTIFY_EMAIL;
  const apiKey = process.env.RESEND_API_KEY;

  if (!toEmail || !apiKey) {
    return NextResponse.json({ skipped: true, reason: 'NOTIFY_EMAIL or RESEND_API_KEY not set' });
  }

  const stats = scan.stats as { vulnerabilities?: { critical: number; high: number; medium: number; low: number }; riskScore?: number } | null;
  const v = stats?.vulnerabilities ?? { critical: 0, high: 0, medium: 0, low: 0 };
  const total = v.critical + v.high + v.medium + v.low;
  const riskScore = stats?.riskScore ?? 0;

  const statusLine = scan.status === 'completed'
    ? `Scan completed — ${total} findings (${v.critical} critical, ${v.high} high)`
    : `Scan failed for ${scan.domain}`;

  const resend = new Resend(apiKey);

  const { error: emailErr } = await resend.emails.send({
    from: 'Vyzor <notifications@vyzor.io>',
    to: toEmail,
    subject: `[Vyzor] ${statusLine}`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="background:#0a1a12;color:#f0fdf4;font-family:system-ui,sans-serif;margin:0;padding:0;">
  <div style="max-width:560px;margin:0 auto;padding:40px 24px;">
    <div style="margin-bottom:28px;">
      <span style="font-size:1.4rem;font-weight:900;color:#34d399;">Vyzor</span>
    </div>

    <h1 style="font-size:1.3rem;font-weight:800;margin:0 0 8px;color:#f0fdf4;">
      ${scan.status === 'completed' ? '✅ Scan complete' : '❌ Scan failed'}
    </h1>
    <p style="color:rgba(167,243,208,0.6);margin:0 0 28px;font-size:0.95rem;">
      <strong style="color:#f0fdf4;">${scan.domain}</strong>
    </p>

    ${scan.status === 'completed' ? `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:28px;">
      ${v.critical > 0 ? `<div style="background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.25);border-radius:12px;padding:16px;">
        <p style="font-size:0.7rem;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:#ef4444;margin:0 0 6px;">Critical</p>
        <p style="font-size:2rem;font-weight:900;color:#ef4444;margin:0;">${v.critical}</p>
      </div>` : ''}
      ${v.high > 0 ? `<div style="background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.25);border-radius:12px;padding:16px;">
        <p style="font-size:0.7rem;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:#f59e0b;margin:0 0 6px;">High</p>
        <p style="font-size:2rem;font-weight:900;color:#f59e0b;margin:0;">${v.high}</p>
      </div>` : ''}
      <div style="background:rgba(59,130,246,0.1);border:1px solid rgba(59,130,246,0.25);border-radius:12px;padding:16px;">
        <p style="font-size:0.7rem;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:#3b82f6;margin:0 0 6px;">Medium</p>
        <p style="font-size:2rem;font-weight:900;color:#3b82f6;margin:0;">${v.medium}</p>
      </div>
      <div style="background:rgba(52,211,153,0.1);border:1px solid rgba(52,211,153,0.25);border-radius:12px;padding:16px;">
        <p style="font-size:0.7rem;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:#34d399;margin:0 0 6px;">Risk Score</p>
        <p style="font-size:2rem;font-weight:900;color:#34d399;margin:0;">${riskScore}</p>
      </div>
    </div>

    <a href="https://vanguard-blond-delta.vercel.app/dashboard/scans/${scanId}"
      style="display:inline-block;background:#34d399;color:#021a12;font-weight:700;font-size:0.9rem;padding:12px 24px;border-radius:10px;text-decoration:none;margin-bottom:32px;">
      View full report →
    </a>
    ` : `
    <p style="color:rgba(167,243,208,0.6);margin:0 0 28px;">
      The scan encountered an error. Please retry from the dashboard.
    </p>
    `}

    <hr style="border:none;border-top:1px solid rgba(255,255,255,0.08);margin-bottom:24px;">
    <p style="font-size:0.75rem;color:rgba(167,243,208,0.3);">
      You're receiving this because you have scan notifications enabled on Vyzor.
    </p>
  </div>
</body>
</html>`,
  });

  if (emailErr) {
    console.error('[notify] Resend error:', emailErr);
    return NextResponse.json({ error: 'Email send failed', detail: String(emailErr) }, { status: 500 });
  }

  return NextResponse.json({ sent: true, to: toEmail });
}
