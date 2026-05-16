import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import type { PortResult, DeepFinding } from '@/lib/supabase';

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('scans')
      .select('id, domain, subdomains, ports, findings, stats, created_at, completed_at')
      .eq('status', 'completed')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const scans = data ?? [];

    // Unique subdomains across all scans
    const assetMap = new Map<string, { host: string; scanDomain: string; firstSeen: string }>();
    scans.forEach(scan => {
      (scan.subdomains ?? []).forEach((sub: string) => {
        if (!assetMap.has(sub)) {
          assetMap.set(sub, { host: sub, scanDomain: scan.domain, firstSeen: scan.created_at });
        }
      });
      // Also add the root domain
      if (!assetMap.has(scan.domain)) {
        assetMap.set(scan.domain, { host: scan.domain, scanDomain: scan.domain, firstSeen: scan.created_at });
      }
    });

    // Open ports — from ports array and nmap findings
    const portMap = new Map<string, { host: string; port: number; service: string; severity: string }>();
    scans.forEach(scan => {
      (scan.ports ?? []).forEach((p: PortResult) => {
        const key = `${p.host}:${p.port}`;
        if (!portMap.has(key)) {
          portMap.set(key, { host: p.host, port: p.port, service: p.service || p.product || 'unknown', severity: 'info' });
        }
      });
      (scan.findings ?? []).forEach((f: DeepFinding) => {
        if (f.source === 'nmap' && f.port) {
          const key = `${f.asset}:${f.port}`;
          if (!portMap.has(key)) {
            portMap.set(key, { host: f.asset, port: f.port, service: f.title, severity: f.severity });
          }
        }
      });
    });

    // Stats from latest scan
    const latestStats = scans[0]?.stats ?? { assetsDiscovered: 0, portsScanned: 0, vulnerabilities: { critical: 0, high: 0, medium: 0, low: 0 }, riskScore: 0 };

    // All findings sorted by date for "recent changes" feed
    const recentFindings = scans
      .flatMap(scan =>
        (scan.findings ?? []).map((f: DeepFinding) => ({
          ...f,
          scanDomain: scan.domain,
          discovered: scan.created_at,
        }))
      )
      .sort((a, b) => new Date(b.discovered).getTime() - new Date(a.discovered).getTime())
      .slice(0, 12);

    // Severity counts aggregated across all scans
    const totalVulns = scans.reduce(
      (acc, scan) => {
        const v = scan.stats?.vulnerabilities ?? { critical: 0, high: 0, medium: 0, low: 0 };
        return {
          critical: acc.critical + (v.critical ?? 0),
          high:     acc.high     + (v.high     ?? 0),
          medium:   acc.medium   + (v.medium   ?? 0),
          low:      acc.low      + (v.low      ?? 0),
        };
      },
      { critical: 0, high: 0, medium: 0, low: 0 }
    );

    return NextResponse.json({
      assets:         Array.from(assetMap.values()),
      ports:          Array.from(portMap.values()),
      stats:          latestStats,
      totalVulns,
      recentFindings,
      totalScans:     scans.length,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
