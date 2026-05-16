import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('scans')
    .select('domain, stats, created_at')
    .eq('status', 'completed')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })
    .limit(30);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const points = (data ?? []).map(s => ({
    domain:    s.domain,
    date:      s.created_at,
    riskScore: (s.stats as { riskScore?: number })?.riskScore ?? 0,
  }));

  return NextResponse.json(points);
}
