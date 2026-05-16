import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getSupabaseAdmin } from '@/lib/supabase';

type Finding = { severity: string; title: string; asset?: string; cve?: string };

type Notif = {
  id: string;
  type: 'critical' | 'scan' | 'asset' | 'fixed' | 'system';
  title: string;
  subtitle: string;
  time: string;
  read: boolean;
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d === 1) return 'Yesterday';
  if (d < 7) return `${d} days ago`;
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = getSupabaseAdmin();
  const { data: scans } = await supabase
    .from('scans')
    .select('id, domain, status, stats, findings, created_at, completed_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20);

  const notifs: Notif[] = [];

  for (const scan of scans ?? []) {
    const stats = scan.stats as { vulnerabilities?: { critical: number; high: number; medium: number; low: number }; assetsDiscovered?: number } | null;
    const findings = (scan.findings ?? []) as Finding[];
    const v = stats?.vulnerabilities ?? { critical: 0, high: 0, medium: 0, low: 0 };
    const total = v.critical + v.high + v.medium + v.low;
    const ts = scan.completed_at ?? scan.created_at;

    if (scan.status === 'completed') {
      // Scan completed notification
      notifs.push({
        id: `scan-${scan.id}`,
        type: 'scan',
        title: `Scan of ${scan.domain} completed — ${total} finding${total !== 1 ? 's' : ''}`,
        subtitle: `${v.critical} critical · ${v.high} high · ${v.medium} medium`,
        time: timeAgo(ts),
        read: false,
      });

      // Critical findings notifications
      const crits = findings.filter(f => f.severity === 'critical').slice(0, 2);
      for (const f of crits) {
        notifs.push({
          id: `crit-${scan.id}-${f.title}`,
          type: 'critical',
          title: `${f.title} on ${f.asset ?? scan.domain}`,
          subtitle: `${f.cve ? `${f.cve} · ` : ''}Critical severity · immediate action required`,
          time: timeAgo(ts),
          read: false,
        });
      }

      // New assets discovered
      const assets = stats?.assetsDiscovered ?? 0;
      if (assets > 1) {
        notifs.push({
          id: `assets-${scan.id}`,
          type: 'asset',
          title: `${assets} assets discovered on ${scan.domain}`,
          subtitle: `Subdomains and hosts enumerated during scan`,
          time: timeAgo(ts),
          read: false,
        });
      }
    } else if (scan.status === 'failed') {
      notifs.push({
        id: `fail-${scan.id}`,
        type: 'system',
        title: `Scan of ${scan.domain} failed`,
        subtitle: 'An error occurred during the scan — retry from the dashboard',
        time: timeAgo(scan.created_at),
        read: false,
      });
    }
  }

  // Deduplicate and sort by recency (most recent first)
  const seen = new Set<string>();
  const unique = notifs.filter(n => {
    if (seen.has(n.id)) return false;
    seen.add(n.id);
    return true;
  });

  return NextResponse.json(unique.slice(0, 30));
}
