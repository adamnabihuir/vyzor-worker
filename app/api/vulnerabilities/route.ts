import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('scans')
      .select('domain, findings, created_at')
      .eq('status', 'completed')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const findings = (data ?? []).flatMap(scan =>
      (scan.findings ?? []).map((f: Record<string, unknown>) => ({
        ...f,
        scanDomain: scan.domain,
        discovered: scan.created_at,
      }))
    );

    return NextResponse.json(findings);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
