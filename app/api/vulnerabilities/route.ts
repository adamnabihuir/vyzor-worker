import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('scans')
      .select('domain, findings, created_at')
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Flatten findings from all scans, tagged with source domain
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
