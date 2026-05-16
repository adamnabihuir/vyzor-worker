import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import type { ScanStats, DeepFinding } from '@/lib/supabase';

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = getSupabaseAdmin();

  const { data: targets, error } = await supabase
    .from('targets')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Enrich each target with latest scan data
  const enriched = await Promise.all(
    (targets ?? []).map(async (target) => {
      const { data: scans } = await supabase
        .from('scans')
        .select('id, status, stats, findings, created_at, completed_at')
        .eq('domain', target.domain)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(3);

      const latestCompleted = (scans ?? []).find(s => s.status === 'completed');
      const latestScan      = (scans ?? [])[0];

      const stats    = (latestCompleted?.stats ?? {}) as Partial<ScanStats>;
      const findings = (latestCompleted?.findings ?? []) as DeepFinding[];
      const vulns    = stats.vulnerabilities ?? { critical: 0, high: 0, medium: 0, low: 0 };

      return {
        ...target,
        scanId:        latestScan?.id ?? null,
        scanStatus:    latestScan?.status ?? 'never',
        riskScore:     stats.riskScore ?? 0,
        assets:        stats.assetsDiscovered ?? 0,
        ports:         stats.portsScanned ?? 0,
        issues:        vulns,
        totalFindings: findings.length,
        lastScan:      latestCompleted?.created_at ?? null,
        recentScans:   scans?.length ?? 0,
      };
    })
  );

  return NextResponse.json(enriched);
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const domain = typeof body.domain === 'string' ? body.domain.trim() : '';
  const label  = typeof body.label  === 'string' ? body.label.trim()  : undefined;

  if (!domain) return NextResponse.json({ error: 'domain is required' }, { status: 400 });

  const clean = domain
    .replace(/^https?:\/\//, '')
    .replace(/\/.*/, '')
    .replace(/:\d+$/, '')
    .toLowerCase();

  if (!/^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z]{2,})+$/.test(clean)) {
    return NextResponse.json({ error: 'Invalid domain format' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from('targets')
    .upsert({ user_id: userId, domain: clean, label: label ?? null }, { onConflict: 'user_id,domain' })
    .select('*')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
