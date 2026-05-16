import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { getSupabaseAdmin } from '@/lib/supabase';

const PLAN_LIMITS: Record<string, number> = {
  starter: 20,
  growth:  50,
};

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // ── Plan quota check ──────────────────────────────────────────────────────
    const clerk   = await clerkClient();
    const user    = await clerk.users.getUser(userId);
    const sub     = (user.publicMetadata?.subscription ?? {}) as { plan?: string };
    const plan    = sub.plan ?? 'trial';
    const limit   = PLAN_LIMITS[plan] ?? 3;

    const supabase = getSupabaseAdmin();
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { count } = await supabase
      .from('scans')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', startOfMonth.toISOString());

    if ((count ?? 0) >= limit) {
      return NextResponse.json(
        { error: `Scan limit reached (${count}/${limit} on ${plan} plan). Please upgrade your plan.`, limitReached: true },
        { status: 429 }
      );
    }
    // ─────────────────────────────────────────────────────────────────────────

    const body = await req.json().catch(() => ({}));
    const domain = typeof body.domain === 'string' ? body.domain.trim() : '';

    if (!domain) {
      return NextResponse.json({ error: 'Domain is required' }, { status: 400 });
    }

    const clean = domain
      .replace(/^https?:\/\//, '')
      .replace(/\/.*/, '')
      .replace(/:\d+$/, '')
      .toLowerCase();

    if (!/^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z]{2,})+$/.test(clean)) {
      return NextResponse.json({ error: 'Invalid domain format' }, { status: 400 });
    }

    // ── Domain ownership verification gate ────────────────────────────────────
    const { data: verifiedDomains } = await supabase
      .from('domain_verifications')
      .select('domain')
      .eq('user_id', userId)
      .eq('status', 'verified')
      .gt('expires_at', new Date().toISOString());

    const isVerified = (verifiedDomains ?? []).some(
      (v) => clean === v.domain || clean.endsWith(`.${v.domain}`)
    );

    if (!isVerified) {
      return NextResponse.json(
        {
          error: 'Domain not verified. You must prove ownership before scanning.',
          verifyUrl: '/dashboard/domains/add',
          domain: clean,
          notVerified: true,
        },
        { status: 403 }
      );
    }
    // ─────────────────────────────────────────────────────────────────────────

    const { data, error } = await supabase
      .from('scans')
      .insert({ domain: clean, user_id: userId })
      .select('id')
      .single();

    if (error || !data) {
      console.error('[scan/start] Supabase error:', JSON.stringify(error));
      return NextResponse.json({ error: 'Supabase error', detail: error?.message }, { status: 500 });
    }

    return NextResponse.json({ scanId: data.id });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[scan/start]', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
