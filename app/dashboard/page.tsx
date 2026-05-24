'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getRiskColor, getRiskLabel } from '@/lib/scans';
import type { ScanRow } from '@/lib/supabase';
import WelcomeModal from '@/components/dashboard/WelcomeModal';


const SEVERITY_COLOR: Record<string, string> = {
  critical: '#ef4444', high: '#f59e0b', medium: '#6366f1', low: '#22c55e',
};

function RiskTrendChart({ points }: { points: { domain: string; date: string; riskScore: number }[] }) {
  const W = 600, H = 110, PAD_X = 8, PAD_Y = 14;
  const isEmpty = points.length === 0;

  // When empty: 7 flat zero-points across last 7 days
  const displayPoints = isEmpty
    ? Array.from({ length: 7 }, (_, i) => ({
        domain: '',
        date: new Date(Date.now() - (6 - i) * 86400000).toISOString(),
        riskScore: 0,
      }))
    : points.length === 1
    ? [{ ...points[0], riskScore: 0 }, points[0]]
    : points;

  const toX = (i: number) => PAD_X + (i / (displayPoints.length - 1)) * (W - PAD_X * 2);
  const toY = (s: number) => PAD_Y + (1 - s / 100) * (H - PAD_Y * 2);

  const lineColor = isEmpty ? 'rgba(0,255,65,0.25)' :
    displayPoints[displayPoints.length - 1].riskScore >= 75 ? '#ef4444' :
    displayPoints[displayPoints.length - 1].riskScore >= 50 ? '#f59e0b' :
    displayPoints[displayPoints.length - 1].riskScore >= 25 ? '#6366f1' : '#00ff41';

  const polylinePts = displayPoints.map((p, i) => `${toX(i)},${toY(p.riskScore)}`).join(' ');
  const areaPath = `M${toX(0)},${toY(displayPoints[0].riskScore)} ` +
    displayPoints.slice(1).map((p, i) => `L${toX(i + 1)},${toY(p.riskScore)}`).join(' ') +
    ` L${toX(displayPoints.length - 1)},${H - PAD_Y} L${toX(0)},${H - PAD_Y} Z`;

  return (
    <div style={{ position: 'relative' }}>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ display: 'block' }}>
        <defs>
          <linearGradient id="chart-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={lineColor} stopOpacity={isEmpty ? '0.06' : '0.18'} />
            <stop offset="100%" stopColor={lineColor} stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map(v => (
          <line key={v} x1={PAD_X} y1={toY(v)} x2={W - PAD_X} y2={toY(v)}
            stroke="rgba(255,255,255,0.05)" strokeWidth="1"
            strokeDasharray={v === 0 ? 'none' : '3 4'} />
        ))}
        {/* Area */}
        <path d={areaPath} fill="url(#chart-grad)" />
        {/* Line */}
        <polyline points={polylinePts} fill="none"
          stroke={lineColor} strokeWidth="2"
          strokeDasharray={isEmpty ? '6 4' : 'none'}
          strokeLinejoin="round" strokeLinecap="round" />
        {/* Dots — only when real data */}
        {!isEmpty && displayPoints.map((p, i) => (
          <circle key={i} cx={toX(i)} cy={toY(p.riskScore)} r="3.5"
            fill={lineColor} stroke="#0a0a0a" strokeWidth="2">
            <title>{p.domain} — {p.riskScore}/100 ({new Date(p.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })})</title>
          </circle>
        ))}
      </svg>
      {/* Empty overlay label */}
      {isEmpty && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4,
          pointerEvents: 'none',
        }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'rgba(0,255,65,0.3)' }}>
            No scans yet — run your first scan to see the trend
          </span>
        </div>
      )}
    </div>
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
      .then(data => setRecentScans(Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : [])))
      .catch(() => {})
      .finally(() => setLoadingScans(false));

    fetch('/api/risk-trend')
      .then(r => r.json())
      .then(data => Array.isArray(data) && setTrendPoints(data))
      .catch(() => {});

    fetch('/api/dashboard/summary')
      .then(r => r.json())
      .then(data => !data.error && setSummary(data))
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

  // Top issues — fetched from findings table when available
  const [topIssues, setTopIssues] = useState<{ title: string; severity: string; asset: string }[]>([]);

  useEffect(() => {
    fetch('/api/vulnerabilities?status=open&severity=critical&limit=5')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setTopIssues(data.slice(0, 5).map((f: { title?: string; severity?: string; asset?: string; scanDomain?: string }) => ({
            title:    f.title    ?? '',
            severity: f.severity ?? 'high',
            asset:    f.asset    ?? f.scanDomain ?? '',
          })));
        } else {
          // fallback: top critical/high from JSONB scans
          const fallback = completedScans
            .flatMap(s => (s.findings ?? []).map(f => ({ ...f, domain: s.domain })))
            .filter(f => f.severity === 'critical' || f.severity === 'high')
            .slice(0, 5);
          setTopIssues(fallback);
        }
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingScans]);

  // Activity feed from real scans
  const activity = recentScans.slice(0, 5).map(s => ({
    icon: s.status === 'completed' ? '✅' : s.status === 'failed' ? '❌' : '🔍',
    title: s.status === 'completed' ? 'Scan completed' : s.status === 'failed' ? 'Scan failed' : 'Scan in progress',
    sub: `${s.domain}${s.stats?.vulnerabilities ? ` · ${(s.stats.vulnerabilities.critical ?? 0) + (s.stats.vulnerabilities.high ?? 0) + (s.stats.vulnerabilities.medium ?? 0) + (s.stats.vulnerabilities.low ?? 0)} findings` : ''}`,
    time: timeAgo(s.created_at),
    color: s.status === 'completed' ? '#34d399' : s.status === 'failed' ? '#ef4444' : '#6366f1',
  }));

  const [summary, setSummary] = useState<{
    openFindings: number; criticalHigh: number;
    bySeverity: { critical: number; high: number; medium: number; low: number };
    totalAssets: number; subdomains: number; openPorts: number;
    avgRisk: number; inProgress: number; totalScans: number; completedScans: number;
    hasNormalizedData: boolean;
  } | null>(null);

  const [notVerified, setNotVerified] = useState<string | null>(null);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!domain.trim() || scanning) return;
    setScanning(true); setScanError(null); setNotVerified(null);
    try {
      const res = await fetch('/api/scan/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: domain.trim() }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Failed to queue scan' }));
        if (err.notVerified) {
          setNotVerified(err.domain ?? domain.trim());
          setScanning(false);
          return;
        }
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

  return (
    <div className="p-8">

      {/* Welcome modal — shown once after signup via ?welcome=true */}
      <Suspense fallback={null}>
        <WelcomeModal />
      </Suspense>


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

      {/* ── New Scan hero bar ── */}
      <div className="mb-6 rounded-2xl overflow-hidden" style={{
        background: 'linear-gradient(135deg, #0d1f14 0%, #0a1a10 60%, #060f09 100%)',
        border: '1px solid rgba(0,255,65,0.12)',
        boxShadow: '0 0 60px rgba(0,255,65,0.04), 0 8px 32px rgba(0,0,0,0.4)',
        position: 'relative',
      }}>
        {/* Subtle grid background */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.04,
          backgroundImage: 'linear-gradient(rgba(0,255,65,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,65,0.6) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          pointerEvents: 'none',
        }} />
        {/* Glow top-left */}
        <div style={{
          position: 'absolute', top: -40, left: -40, width: 200, height: 200,
          background: 'radial-gradient(circle, rgba(0,255,65,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', padding: '28px 32px' }}>
          {/* Top row */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 10,
                  background: 'rgba(0,255,65,0.1)', border: '1px solid rgba(0,255,65,0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#00ff41" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                  </svg>
                </div>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#f0fdf4', margin: 0, letterSpacing: '-0.01em' }}>
                  Scan a target
                </h2>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'rgba(167,243,208,0.4)', margin: 0 }}>
                Subfinder &nbsp;·&nbsp; Nmap &nbsp;·&nbsp; Nuclei &nbsp;·&nbsp; Full CVE detection in ~60s
              </p>
            </div>
            {/* Live indicator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '6px 12px', borderRadius: 999,
              background: inProgressScans.length > 0 ? 'rgba(0,255,65,0.08)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${inProgressScans.length > 0 ? 'rgba(0,255,65,0.25)' : 'rgba(255,255,255,0.07)'}`,
            }}>
              <div style={{
                width: 7, height: 7, borderRadius: '50%',
                background: inProgressScans.length > 0 ? '#00ff41' : 'rgba(167,243,208,0.25)',
                boxShadow: inProgressScans.length > 0 ? '0 0 8px rgba(0,255,65,0.6)' : 'none',
                animation: inProgressScans.length > 0 ? 'pulse 2s infinite' : 'none',
              }} />
              <span style={{ fontSize: '0.72rem', fontWeight: 600, color: inProgressScans.length > 0 ? '#00ff41' : 'rgba(167,243,208,0.4)' }}>
                {inProgressScans.length > 0 ? `${inProgressScans.length} running` : 'Ready'}
              </span>
            </div>
          </div>

          {/* Input row */}
          <form onSubmit={handleScan} style={{ display: 'flex', gap: 10 }}>
            <div style={{ position: 'relative', flex: 1 }}>
              {/* Terminal prefix */}
              <span style={{
                position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                fontFamily: 'monospace', fontSize: '0.85rem', fontWeight: 700,
                color: 'rgba(0,255,65,0.5)', pointerEvents: 'none', userSelect: 'none',
              }}>$</span>
              <input
                type="text"
                placeholder="target.com"
                value={domain}
                onChange={e => setDomain(e.target.value)}
                style={{
                  width: '100%', boxSizing: 'border-box',
                  padding: '14px 16px 14px 32px',
                  borderRadius: 12,
                  background: 'rgba(0,0,0,0.4)',
                  border: '1px solid rgba(0,255,65,0.15)',
                  color: '#f0fdf4', fontSize: '0.95rem', fontFamily: 'monospace',
                  outline: 'none', transition: 'border-color 0.15s',
                  letterSpacing: '0.02em',
                }}
                onFocus={e => e.currentTarget.style.borderColor = 'rgba(0,255,65,0.45)'}
                onBlur={e => e.currentTarget.style.borderColor = 'rgba(0,255,65,0.15)'}
              />
            </div>
            <button
              type="submit"
              disabled={scanning}
              style={{
                padding: '14px 28px', borderRadius: 12, border: 'none',
                background: scanning ? 'rgba(0,255,65,0.3)' : '#00ff41',
                color: '#020d04', fontSize: '0.9rem', fontWeight: 800,
                cursor: scanning ? 'default' : 'pointer',
                display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap',
                boxShadow: scanning ? 'none' : '0 0 24px rgba(0,255,65,0.25)',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { if (!scanning) { e.currentTarget.style.background = '#39ff6e'; e.currentTarget.style.boxShadow = '0 0 36px rgba(0,255,65,0.4)'; } }}
              onMouseLeave={e => { if (!scanning) { e.currentTarget.style.background = '#00ff41'; e.currentTarget.style.boxShadow = '0 0 24px rgba(0,255,65,0.25)'; } }}
            >
              {scanning ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: 'spin 0.8s linear infinite' }}>
                    <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/>
                  </svg>
                  Queuing…
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polygon points="5 3 19 12 5 21 5 3"/>
                  </svg>
                  Scan now
                </>
              )}
            </button>
          </form>

          {/* Alerts */}
          {notVerified && (
            <div style={{ marginTop: 12, padding: '10px 16px', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
              background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#fbbf24', fontFamily: 'monospace' }}>{notVerified}</span>
                <span style={{ fontSize: '0.78rem', color: 'rgba(251,191,36,0.7)' }}>not verified — prove ownership first</span>
              </div>
              <Link href="/dashboard/domains/add" style={{ fontSize: '0.72rem', fontWeight: 700, padding: '5px 12px', borderRadius: 8,
                background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.25)', color: '#fbbf24', textDecoration: 'none', whiteSpace: 'nowrap' }}>
                Verify →
              </Link>
            </div>
          )}
          {scanError && (
            <div style={{ marginTop: 12, padding: '10px 16px', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 9,
              background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#ef4444' }}>{scanError}</span>
            </div>
          )}
        </div>

        <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
      </div>

      {/* Top stat strip */}
      {(() => {
        const s = summary;
        const loading = loadingScans && !s;
        const openFindings   = s?.openFindings   ?? totalFindings;
        const critHigh       = s?.criticalHigh   ?? totalCriticalHigh;
        const assets         = s?.totalAssets    ?? 0;
        const inProg         = s?.inProgress     ?? inProgressScans.length;
        const riskScore      = s?.avgRisk        ?? avgRisk;
        return (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            {[
              { label: 'Total Scans',    value: loading ? '—' : String(recentScans.length), sub: `${completedScans.length} completed`,                           color: '#a78bfa' },
              { label: 'Open Findings',  value: loading ? '—' : String(openFindings),       sub: s?.hasNormalizedData ? 'From findings table' : 'Across all scans', color: '#f59e0b' },
              { label: 'Critical & High', value: loading ? '—' : String(critHigh),          sub: critHigh > 0 ? 'Act immediately' : 'None critical',               color: critHigh > 0 ? '#ef4444' : '#34d399' },
              { label: 'Assets Found',   value: loading ? '—' : String(assets),             sub: assets > 0 ? `${s?.subdomains ?? 0} subdomains` : 'Run a scan',   color: '#34d399' },
              { label: 'Avg Risk Score', value: loading ? '—' : String(riskScore),          sub: getRiskLabel(riskScore) + (inProg > 0 ? ` · ${inProg} running` : ' risk'), color: getRiskColor(riskScore) },
            ].map((card, i) => (
              <div key={i} className="rounded-2xl px-5 py-4" style={GLASS}>
                <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: 'rgba(167,243,208,0.5)' }}>{card.label}</p>
                <p className="font-black text-2xl mb-0.5" style={{ color: card.color }}>{card.value}</p>
                <p className="text-xs" style={{ color: 'rgba(167,243,208,0.4)' }}>{card.sub}</p>
              </div>
            ))}
          </div>
        );
      })()}

      {/* Risk trend chart — always visible */}
      <div className="rounded-2xl p-5 mb-6" style={GLASS}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div>
            <h2 className="font-bold text-sm" style={{ color: '#f0fdf4', margin: 0 }}>Risk Score Trend</h2>
            <p style={{ color: 'rgba(167,243,208,0.35)', fontSize: '0.72rem', marginTop: '2px' }}>
              {trendPoints.length > 0
                ? `${trendPoints.length} scan${trendPoints.length > 1 ? 's' : ''} · hover dots for details`
                : 'Risk score over time'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '18px' }}>
            {trendPoints.length > 0 ? (
              [
                { label: 'Latest', value: trendPoints[trendPoints.length - 1].riskScore },
                { label: 'Peak',   value: Math.max(...trendPoints.map(p => p.riskScore)) },
                { label: 'Best',   value: Math.min(...trendPoints.map(p => p.riskScore)) },
              ].map(s => (
                <div key={s.label} style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '0.62rem', color: 'rgba(167,243,208,0.35)', margin: 0 }}>{s.label}</p>
                  <p style={{ fontSize: '1rem', fontWeight: 900, color: getRiskColor(s.value), margin: 0 }}>{s.value}</p>
                </div>
              ))
            ) : (
              ['Latest', 'Peak', 'Best'].map(label => (
                <div key={label} style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '0.62rem', color: 'rgba(167,243,208,0.25)', margin: 0 }}>{label}</p>
                  <p style={{ fontSize: '1rem', fontWeight: 900, color: 'rgba(0,255,65,0.2)', margin: 0 }}>0</p>
                </div>
              ))
            )}
          </div>
        </div>
        <RiskTrendChart points={trendPoints} />
        {/* X-axis labels */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
          {trendPoints.length >= 2 ? (
            <>
              <span style={{ fontSize: '0.62rem', color: 'rgba(167,243,208,0.25)' }}>
                {new Date(trendPoints[0].date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
              </span>
              <span style={{ fontSize: '0.62rem', color: 'rgba(167,243,208,0.25)' }}>
                {new Date(trendPoints[trendPoints.length - 1].date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
              </span>
            </>
          ) : (
            <>
              <span style={{ fontSize: '0.62rem', color: 'rgba(167,243,208,0.18)' }}>7 days ago</span>
              <span style={{ fontSize: '0.62rem', color: 'rgba(167,243,208,0.18)' }}>Today</span>
            </>
          )}
        </div>
      </div>

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
              {(() => {
                const bySev = summary?.bySeverity ?? (hasRealData ? {
                  critical: completedScans.reduce((a, s) => a + (s.stats?.vulnerabilities?.critical ?? 0), 0),
                  high:     completedScans.reduce((a, s) => a + (s.stats?.vulnerabilities?.high     ?? 0), 0),
                  medium:   completedScans.reduce((a, s) => a + (s.stats?.vulnerabilities?.medium   ?? 0), 0),
                  low:      completedScans.reduce((a, s) => a + (s.stats?.vulnerabilities?.low      ?? 0), 0),
                } : null);
                const total = bySev ? bySev.critical + bySev.high + bySev.medium + bySev.low : 0;
                if (!bySev || total === 0) return (
                  <div className="flex flex-col items-center justify-center py-8">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center mb-3 font-black text-2xl"
                      style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(167,243,208,0.3)' }}>?</div>
                    <p className="text-xs text-center" style={{ color: 'rgba(167,243,208,0.5)' }}>Run your first scan to see the breakdown.</p>
                  </div>
                );
                return (
                  <div className="space-y-3">
                    {(['critical', 'high', 'medium', 'low'] as const).map(sev => {
                      const count = bySev[sev];
                      const pct = Math.round((count / Math.max(1, total)) * 100);
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
                );
              })()}
            </div>
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
