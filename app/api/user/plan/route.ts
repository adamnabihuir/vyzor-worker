import { NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { getSupabaseAdmin } from '@/lib/supabase';

const PLAN_LIMITS: Record<string, number> = {
  starter: 20,
  growth:  50,
};

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const clerk = await clerkClient();
    const user  = await clerk.users.getUser(userId);
    const sub   = (user.publicMetadata?.subscription ?? {}) as { plan?: string; status?: string };
    const plan  = sub.plan ?? 'trial';
    const limit = PLAN_LIMITS[plan] ?? 3;

    const supabase = getSupabaseAdmin();
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { count } = await supabase
      .from('scans')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', startOfMonth.toISOString());

    return NextResponse.json({ plan, limit, used: count ?? 0, status: sub.status });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
