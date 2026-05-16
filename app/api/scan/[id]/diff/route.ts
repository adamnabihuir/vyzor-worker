import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import type { DeepFinding } from '@/lib/supabase';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) return NextResponse.json({ error: 'Invalid scan ID' }, { status: 400 });

  const supabase = getSupabaseAdmin();

  const { data: current } = await supabase
    .from('scans')
    .select('domain, findings, stats, created_at')
    .eq('id', id)
    .eq('user_id', userId)
    .single();

  if (!current) return NextResponse.json({ error: 'Scan not found' }, { status: 404 });

  // Previous completed scan for the same domain
  const { data: previous } = await supabase
    .from('scans')
    .select('findings, stats, created_at')
    .eq('domain', current.domain)
    .eq('user_id', userId)
    .eq('status', 'completed')
    .lt('created_at', current.created_at)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (!previous) return NextResponse.json({ hasPrevious: false });

  const currFindings = (current.findings ?? []) as DeepFinding[];
  const prevFindings = (previous.findings ?? []) as DeepFinding[];

  const key = (f: DeepFinding) => `${f.title}|${f.asset}`;
  const prevKeys = new Set(prevFindings.map(key));
  const currKeys = new Set(currFindings.map(key));

  const newFindings   = currFindings.filter(f => !prevKeys.has(key(f)));
  const fixedFindings = prevFindings.filter(f => !currKeys.has(key(f)));

  return NextResponse.json({
    hasPrevious:       true,
    previousDate:      previous.created_at,
    previousRiskScore: (previous.stats as { riskScore?: number })?.riskScore ?? 0,
    currentRiskScore:  (current.stats  as { riskScore?: number })?.riskScore ?? 0,
    newTotal:          newFindings.length,
    fixedTotal:        fixedFindings.length,
    newCritical:       newFindings.filter(f => f.severity === 'critical').length,
    newHigh:           newFindings.filter(f => f.severity === 'high').length,
  });
}
