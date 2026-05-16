'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getRiskColor, getRiskLabel } from '@/lib/scans';
import type { ScanRow } from '@/lib/supabase';

const TRENDING_CVES = [
  { id: 'CVE-2025-1234', score: 9.8, label: 'Critical', product: 'Apache Log4j', exploited: true },
  { id: 'CVE-2025-0987', score: 8.6, label: 'High', product: 'OpenSSL 3.x', exploited: false },
  { id: 'CVE-2024-9876', score: 7.5, label: 'High', product: 'nginx < 1.25', exploited: false },
];

const SEVERITY_COLOR: Record<string, string> = {
  critical: '#ef4444', high: '#f59e0b', medium: '#6366f1', low: '#22c55e',
};

function RiskTrendChart({ points }: { points: { domain: string; date: string; riskScore: number }[] }) {
  if (points.length < 2) return null;

  const W = 600, H = 90, PAD = 12;
  const scores = points.map(p => p.riskScore);
  const minS = 0, maxS = 100;
  const toX = (i: number) => PAD + (i / (points.length - 1)) * (W - PAD * 2);
  const toY = (s: number) => PAD + (1 - (s - minS) / (maxS - minS)) * (H - PAD * 2);

  const polyline = points.map((p, i) => `${toX(i)},${toY(p.riskScore)}`).join(' ');
  const area = `M${toX(0)},${toY(points[0].riskScore)} ` +
    points.slice(1).map((p, i) => `L${toX(i + 1)},${toY(p.riskScore)}`).join(' ') +
    ` L${toX(points.length - 1)},${H} L${toX(0)},${H} Z`;

  const last = points[points.length - 1];
  const lineColor = last.riskScore >= 75 ? '#ef4444' : last.riskScore >= 50 ? '#f59e0b' : last.riskScore >= 25 ? '#6366f1' : '#34d399';
  const areaColor = last.riskScore >= 75 ? 'rgba(239,68,68,0.08)' : last.riskScore >= 50 ? 'rgba(245,158,11,0.08)' : 'rgba(52,211,153,0.08)';

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ display: 'block' }}>
      <defs>
        <linearGradient id="trend-area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={lineColor} stopOpacity="0.15" />
          <stop offset="100%" stopColor={lineColor} stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Y grid lines */}
      {[25, 50, 75].map(v => (
        <line key={v} x1={PAD} y1={toY(v)} x2={W - PAD} y2={toY(v)}
          stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray="3 3" />
      ))}
      {/* Area fill */}
      <path d={area} fill="url(#trend-area)" />
      {/* Line */}
      <polyline points={polyline} fill="none" stroke={lineColor} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      {/* Dots */}
      {points.map((p, i) => (
        <circle key={i} cx={toX(i)} cy={toY(p.riskScore)} r="3" fill={lineColor} stroke="rgba(2,26,18,0.8)" strokeWidth="1.5">
          <title>{p.domain} — {p.riskScore}/100 ({new Date(p.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })})</title>
        </circle>
      ))}
      {/* Last value label */}
      <text x={toX(points.length - 1)} y={toY(last.riskScore) - 7}
        textAnchor="middle" fontSize="10" fontWeight="700" fill={lineColor}>
        {last.riskScore}
      </text>
    </svg>
  );
}

const GLASS: React.CSSProperties = {
  background: 'rgba(255,255,255,0.07)',
  backdropFilter: 'blur(18px)',
  WebkitBackdropFilter: 'blur(18px)',
  border: '1px solid rgba(255,255,255,0.13)',
  boxShadow: '0 4px 28px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.1)',
};

type ScanSummary = {
  id: string;
  domain: string;
  status: string;
  created_at: string;
  stats: {
    assetsDiscovered?: number;
    portsScanned?: number;
    vulnerabilities?: { critical: number; high: number; medium: number; low: number };
    riskScore?: number;
  };
  findings: { severity: string; title: string; asset: string }[];
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (h < 1) return 'Just now';
  if (h < 24) return `${h}h ago`;
  return `${d}d ago`;
}

export default function DashboardPage() {
  const router = useRouter();
  const [domain, setDomain] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [recentScans, setRecentScans] = useState<ScanSummary[]>([]);
  const [loadingScans, setLoadingScans] = useState(true);
  const [trendPoints, setTrendPoints] = useState<{ domain: string; date: string; riskScore: number }[]>([]);

  useEffect(() => {
    fetch('/api/scans')
      .then(r => r.json())
      .then(data => setRecentScans(data ?? []))
      .catch(() => {})
      .finally(() => setLoadingScans(false));

    fetch('/api/risk-trend')
      .then(r => r.json())
      .then(data => Array.isArray(data) && setTrendPoints(data))
      .catch(() => {});
  }, []);

  // Aggregate stats from real scans
  const completedScans = recentScans.filter(s => s.status === 'completed');
  const inProgressScans = recentScans.filter(s => s.status === 'queued' || s.status === 'running');

  const totalFindings = completedScans.reduce((acc, s) => {
    const v = s.stats?.vulnerabilities ?? { critical: 0, high: 0, medium: 0, low: 0 };
    return acc + v.critical + v.high + v.medium + v.low;
  }, 0);

  const totalCriticalHigh = completedScans.reduce((acc, s) => {
    const v = s.stats?.vulnerabilities ?? { critical: 0, high: 0 };
    return acc + (v.critical ?? 0) + (v.high ?? 0);
  }, 0);

  const avgRisk = completedScans.length
    ? Math.round(completedScans.reduce((acc, s) => acc + (s.stats?.riskScore ?? 0), 0) / completedScans.length)
    : 0;

  // Top issues to fix from real findings
  const topIssues = completedScans
    .flatMap(s => (s.findings ?? []).map(f => ({ ...f, domain: s.domain })))
    .filter(f => f.severity === 'critical' || f.severity === 'high')
    .slice(0, 5);

  // Activity feed from real scans
  const activity = recentScans.slice(0, 5).map(s => ({
    icon: s.status === 'completed' ? '✅' : s.status === 'failed' ? '❌' : '🔍',
    title: s.status === 'completed' ? 'Scan completed' : s.status === 'failed' ? 'Scan failed' : 'Scan in progress',
    sub: `${s.domain}${s.stats?.vulnerabilities ? ` · ${(s.stats.vulnerabilities.critical ?? 0) + (s.stats.vulnerabilities.high ?? 0) + (s.stats.vulnerabilities.medium ?? 0) + (s.stats.vulnerabilities.low ?? 0)} findings` : ''}`,
    time: timeAgo(s.created_at),
    color: s.status === 'completed' ? '#34d399' : s.status === 'failed' ? '#ef4444' : '#6366f1',
  }));

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!domain.trim() || scanning) return;
    setScanning(true); setScanError(null);
    try {
      const res = await fetch('/api/scan/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: domain.trim() }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Failed to queue scan' }));
        throw new Error(err.error ?? 'Failed to queue scan');
      }
      const { scanId } = await res.json();
      router.push(`/dashboard/scans/${scanId}`);
    } catch (err) {
      setScanError(err instanceof Error ? err.message : 'Failed to start scan');
      setScanning(false);
    }
  };

  const hasRealData = completedScans.length > 0;
  const isNewUser = !loadingScans && recentScans.length === 0;

  return (
    <div className="p-8">

      {/* Onboarding banner for new users */}
      {isNewUser && (
        <div className="mb-8 rounded-2xl p-6" style={{ background: 'linear-gradient(135deg, rgba(52,211,153,0.1) 0%, rgba(16,185,129,0.05) 100%)', border: '1px solid rgba(52,211,153,0.25)' }}>
          <div className="flex items-start gap-4 mb-5">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.3)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <div>
              <h2 className="font-black text-lg mb-1" style={{ color: '#f0fdf4' }}>Welcome to Vyzor — let&apos;s secure your first domain</h2>
              <p style={{ color: 'rgba(167,243,208,0.65)', fontSize: '0.875rem' }}>Your trial is active. Run your first scan below to discover exposed assets and vulnerabilities.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { step: '1', title: 'Enter your domain', desc: 'Type example.com in the scan box below and click Scan now', icon: '🔍' },
              { step: '2', title: 'Get your results', desc: 'Assets, open ports, and vulnerabilities found in under 60s', icon: '⚡' },
              { step: '3', title: 'Connect Slack', desc: 'Go to Integrations to receive instant alerts on new findings', icon: '🔔' },
            ].map(s => (
              <div key={s.step} className="flex items-start gap-3 p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <span className="text-xl flex-shrink-0">{s.icon}</span>
                <div>
                  <p className="font-bold text-sm mb-0.5" style={{ color: '#f0fdf4' }}>{s.title}</p>
                  <p className="text-xs" style={{ color: 'rgba(167,243,208,0.55)' }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-black text-2xl mb-1" style={{ color: '#f0fdf4' }}>Dashboard</h1>
          <p style={{ color: 'rgba(167,243,208,0.5)', fontSize: '0.875rem' }}>
            {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="text-sm font-bold px-4 py-2 rounded-xl flex items-center gap-2"
            style={{ background: '#34d399', color: '#021a12' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Export
          </button>
        </div>
      </div>

      {/* Top stat strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        {[
          { label: 'Total Scans', value: loadingScans ? '—' : String(recentScans.length), sub: `${completedScans.length} completed`, color: '#a78bfa' },
          { label: 'Total Findings', value: loadingScans ? '—' : String(totalFindings), sub: hasRealData ? 'Across all scans' : 'No data yet', color: '#f59e0b' },
          { label: 'Critical & High', value: loadingScans ? '—' : String(totalCriticalHigh), sub: 'Act immediately', color: '#ef4444' },
          { label: 'In Progress', value: loadingScans ? '—' : String(inProgressScans.length), sub: inProgressScans.length > 0 ? 'Running now' : 'All idle', color: '#34d399' },
          { label: 'Avg Risk Score', value: loadingScans ? '—' : String(avgRisk), sub: getRiskLabel(avgRisk) + ' risk', color: getRiskColor(avgRisk) },
        ].map((s, i) => (
          <div key={i} className="rounded-2xl px-5 py-4" style={GLASS}>
            <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: 'rgba(167,243,208,0.5)' }}>{s.label}</p>
            <p className="font-black text-2xl mb-0.5" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs" style={{ color: 'rgba(167,243,208,0.4)' }}>{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Risk trend chart */}
      {trendPoints.length >= 2 && (
        <div className="rounded-2xl p-5 mb-6" style={GLASS}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div>
              <h2 className="font-bold text-sm" style={{ color: '#f0fdf4', margin: 0 }}>Risk Score Trend</h2>
              <p style={{ color: 'rgba(167,243,208,0.45)', fontSize: '0.75rem', marginTop: '2px' }}>
                {trendPoints.length} completed scans · hover dots for details
              </p>
            </div>
            <div style={{ display: 'flex', gap: '14px' }}>
              {[
                { label: 'Latest', value: trendPoints[trendPoints.length - 1].riskScore },
                { label: 'Peak',   value: Math.max(...trendPoints.map(p => p.riskScore)) },
                { label: 'Best',   value: Math.min(...trendPoints.map(p => p.riskScore)) },
              ].map(s => (
                <div key={s.label} style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '0.65rem', color: 'rgba(167,243,208,0.4)', margin: 0 }}>{s.label}</p>
                  <p style={{ fontSize: '1rem', fontWeight: 900, color: getRiskColor(s.value), margin: 0 }}>{s.value}</p>
                </div>
              ))}
            </div>
          </div>
          <RiskTrendChart points={trendPoints} />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
            <span style={{ fontSize: '0.65rem', color: 'rgba(167,243,208,0.3)' }}>
              {new Date(trendPoints[0].date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
            </span>
            <span style={{ fontSize: '0.65rem', color: 'rgba(167,243,208,0.3)' }}>
              {new Date(trendPoints[trendPoints.length - 1].date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
            </span>
          </div>
        </div>
      )}

      <div className="grid xl:grid-cols-3 gap-6">
        {/* LEFT COLUMN */}
        <div className="xl:col-span-2 space-y-6">

          {/* Threat level + Hygiene */}
          <div className="grid md:grid-cols-2 gap-5">
            {/* Threat Level */}
            <div className="rounded-2xl p-6" style={GLASS}>
              <h2 className="font-bold text-sm mb-4" style={{ color: '#f0fdf4' }}>Threat Level</h2>
              <ThreatGauge score={avgRisk} />
              <p className="text-center text-xs mt-3" style={{ color: 'rgba(167,243,208,0.5)' }}>
                {avgRisk === 0 ? 'Run a scan to compute your threat level.' : avgRisk >= 75 ? 'Critical — immediate action required.' : avgRisk >= 50 ? 'High risk — fix critical issues soon.' : 'Risk is manageable — keep monitoring.'}
              </p>
            </div>

            {/* Summary stats */}
            <div className="rounded-2xl p-6" style={GLASS}>
              <h2 className="font-bold text-sm mb-4" style={{ color: '#f0fdf4' }}>Severity Breakdown</h2>
              {hasRealData ? (
                <div className="space-y-3">
                  {(['critical', 'high', 'medium', 'low'] as const).map(sev => {
                    const count = completedScans.reduce((a, s) => a + (s.stats?.vulnerabilities?.[sev] ?? 0), 0);
                    const max = Math.max(1, totalFindings);
                    const pct = Math.round((count / max) * 100);
                    const color = SEVERITY_COLOR[sev];
                    return (
                      <div key={sev}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="font-bold uppercase" style={{ color }}>{sev}</span>
                          <span style={{ color: 'rgba(167,243,208,0.6)' }}>{count}</span>
                        </div>
                        <div className="h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
                          <div className="h-2 rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mb-3 font-black text-2xl"
                    style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(167,243,208,0.3)' }}>?</div>
                  <p className="text-xs text-center" style={{ color: 'rgba(167,243,208,0.5)' }}>
                    Run your first scan to see the breakdown.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* New scan */}
          <div className="rounded-2xl p-6" style={GLASS}>
            <div className="flex items-center justify-between mb-1">
              <h2 className="font-bold text-base" style={{ color: '#f0fdf4' }}>New Scan</h2>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ background: inProgressScans.length > 0 ? '#34d399' : 'rgba(167,243,208,0.3)', animation: inProgressScans.length > 0 ? 'pulse 2s infinite' : 'none' }} />
                <span className="text-xs font-semibold" style={{ color: '#34d399' }}>
                  {inProgressScans.length} scan{inProgressScans.length !== 1 ? 's' : ''} in progress
                </span>
              </div>
            </div>
            <p className="text-sm mb-5" style={{ color: 'rgba(167,243,208,0.5)' }}>Powered by subfinder · nmap · nuclei</p>
            <form onSubmit={handleScan} className="flex gap-3">
              <div className="relative flex-1">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'rgba(167,243,208,0.4)' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                </div>
                <input type="text" placeholder="example.com" value={domain} onChange={e => setDomain(e.target.value)} className="scan-input w-full rounded-xl pl-10 pr-4 py-3 text-sm" />
              </div>
              <button type="submit" disabled={scanning}
                className="font-bold rounded-xl px-6 py-3 text-sm whitespace-nowrap"
                style={{ background: '#34d399', color: '#021a12' }}>
                {scanning
                  ? <span className="flex items-center gap-2"><svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>Queuing…</span>
                  : 'Scan now'}
              </button>
            </form>
            {scanError && (
              <div className="mt-4 px-4 py-3 rounded-xl flex items-center gap-3" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                <span className="text-sm font-semibold" style={{ color: '#ef4444' }}>{scanError}</span>
              </div>
            )}
          </div>

          {/* Recent scans */}
          <div className="rounded-2xl p-6" style={GLASS}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-base" style={{ color: '#f0fdf4' }}>Recent Scans</h2>
              <Link href="/dashboard/scans" className="text-sm font-medium" style={{ color: '#34d399' }}>View all →</Link>
            </div>
            {loadingScans ? (
              <p className="text-sm" style={{ color: 'rgba(167,243,208,0.4)' }}>Loading…</p>
            ) : recentScans.length === 0 ? (
              <p className="text-sm" style={{ color: 'rgba(167,243,208,0.4)' }}>No scans yet — run one above.</p>
            ) : (
              <div className="space-y-3">
                {recentScans.slice(0, 5).map(scan => {
                  const v = scan.stats?.vulnerabilities ?? { critical: 0, high: 0, medium: 0, low: 0 };
                  const total = v.critical + v.high + v.medium + v.low;
                  const riskScore = scan.stats?.riskScore ?? 0;
                  const isActive = scan.status === 'queued' || scan.status === 'running';
                  return (
                    <Link key={scan.id} href={`/dashboard/scans/${scan.id}`}
                      className="flex items-center justify-between p-4 rounded-xl transition-all"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(52,211,153,0.3)'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}>
                      <div className="flex items-center gap-4">
                        <div className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ background: isActive ? '#34d399' : scan.status === 'failed' ? '#ef4444' : 'rgba(52,211,153,0.4)', animation: isActive ? 'pulse 2s infinite' : 'none' }} />
                        <div>
                          <p className="font-semibold text-sm" style={{ color: '#f0fdf4' }}>{scan.domain}</p>
                          <p className="text-xs" style={{ color: 'rgba(167,243,208,0.5)' }}>
                            {isActive ? scan.status : `${scan.stats?.assetsDiscovered ?? 0} assets · ${total} findings`}
                            {' · '}{timeAgo(scan.created_at)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {v.critical > 0 && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>{v.critical} CRIT</span>
                        )}
                        {!isActive && riskScore > 0 && (
                          <>
                            <p className="font-black text-base" style={{ color: getRiskColor(riskScore) }}>{riskScore}</p>
                            <span className="text-xs font-semibold" style={{ color: getRiskColor(riskScore) }}>{getRiskLabel(riskScore)}</span>
                          </>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-5">
          {/* Trending CVEs */}
          <div className="rounded-2xl p-6" style={GLASS}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-sm" style={{ color: '#f0fdf4' }}>Top Trending CVEs</h2>
              <span className="text-xs font-semibold px-2 py-1 rounded-full" style={{ background: 'rgba(239,68,68,0.08)', color: '#ef4444' }}>LIVE</span>
            </div>
            <div className="space-y-3">
              {TRENDING_CVES.map((cve, i) => (
                <div key={i} className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-mono font-semibold" style={{ color: '#f0fdf4' }}>{cve.id}</span>
                    <div className="flex items-center gap-1.5">
                      {cve.exploited && <span className="text-xs font-bold px-1.5 py-0.5 rounded" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>EXPLOIT</span>}
                      <span className="font-bold text-sm" style={{ color: SEVERITY_COLOR[cve.label.toLowerCase()] }}>{cve.score}</span>
                    </div>
                  </div>
                  <p className="text-xs" style={{ color: 'rgba(167,243,208,0.5)' }}>{cve.product}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Issues to fix */}
          <div className="rounded-2xl p-6" style={GLASS}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-sm" style={{ color: '#f0fdf4' }}>Issues to Fix</h2>
              <Link href="/dashboard/vulnerabilities" className="text-xs font-medium" style={{ color: '#34d399' }}>View all →</Link>
            </div>
            {topIssues.length === 0 ? (
              <p className="text-xs" style={{ color: 'rgba(167,243,208,0.4)' }}>
                {hasRealData ? 'No critical/high issues found — great work!' : 'Run a scan to see issues here.'}
              </p>
            ) : (
              <div className="space-y-2.5">
                {topIssues.map((issue, i) => (
                  <div key={i} className="flex items-start justify-between gap-3 py-2.5"
                    style={{ borderBottom: i < topIssues.length - 1 ? '1px solid rgba(255,255,255,0.07)' : 'none' }}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-bold uppercase" style={{ color: SEVERITY_COLOR[issue.severity] }}>{issue.severity}</span>
                      </div>
                      <p className="text-xs font-semibold truncate" style={{ color: '#f0fdf4' }}>{issue.title}</p>
                      <p className="text-xs font-mono" style={{ color: 'rgba(167,243,208,0.5)' }}>{issue.asset}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Activity feed */}
          <div className="rounded-2xl p-6" style={GLASS}>
            <h2 className="font-bold text-sm mb-4" style={{ color: '#f0fdf4' }}>Activity</h2>
            {activity.length === 0 ? (
              <p className="text-xs" style={{ color: 'rgba(167,243,208,0.4)' }}>No activity yet.</p>
            ) : (
              <div className="space-y-3">
                {activity.map((a, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-sm flex-shrink-0"
                      style={{ background: `${a.color}18` }}>{a.icon}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold" style={{ color: '#f0fdf4' }}>{a.title}</p>
                      <p className="text-xs truncate" style={{ color: 'rgba(167,243,208,0.5)' }}>{a.sub}</p>
                    </div>
                    <p className="text-xs flex-shrink-0" style={{ color: 'rgba(167,243,208,0.3)' }}>{a.time}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
      `}</style>
    </div>
  );
}

function ThreatGauge({ score }: { score: number }) {
  const color = getRiskColor(score);
  const label = getRiskLabel(score);
  const radius = 54;
  const circ = Math.PI * radius;
  const dash = (score / 100) * circ;
  return (
    <div className="flex flex-col items-center">
      <svg width="140" height="80" viewBox="0 0 140 80">
        <path d="M 10 70 A 60 60 0 0 1 130 70" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="12" strokeLinecap="round"/>
        <path d="M 10 70 A 60 60 0 0 1 130 70" fill="none" stroke={color} strokeWidth="12" strokeLinecap="round"
          strokeDasharray={`${dash * 1.05} ${circ}`} style={{ filter: `drop-shadow(0 0 6px ${color}60)` }}/>
      </svg>
      <div className="-mt-2 text-center">
        <p className="font-black text-3xl" style={{ color }}>{score}</p>
        <p className="text-sm font-bold" style={{ color }}>{label} Risk</p>
      </div>
    </div>
  );
}
