'use client';

import { useState, useEffect } from 'react';

const GLASS: React.CSSProperties = {
  background: 'rgba(255,255,255,0.07)',
  backdropFilter: 'blur(18px)',
  WebkitBackdropFilter: 'blur(18px)',
  border: '1px solid rgba(255,255,255,0.13)',
  boxShadow: '0 4px 28px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.1)',
};

const SEV_COLOR: Record<string, string> = {
  critical: '#ef4444',
  high:     '#f59e0b',
  medium:   '#6366f1',
  low:      '#34d399',
  info:     '#94a3b8',
};

type Asset = { host: string; scanDomain: string; firstSeen: string };
type Port  = { host: string; port: number; service: string; severity: string };
type Finding = {
  id: string; title: string; severity: string; asset: string;
  port?: number; source: string; scanDomain: string; discovered: string;
};
type Stats = { assetsDiscovered: number; portsScanned: number; riskScore: number; vulnerabilities: { critical: number; high: number; medium: number; low: number } };
type SurfaceData = {
  assets: Asset[]; ports: Port[];
  stats: Stats; totalVulns: { critical: number; high: number; medium: number; low: number };
  recentFindings: Finding[]; totalScans: number;
};

function riskLabel(score: number) {
  if (score <= 20) return { label: 'Low Risk',      color: '#34d399' };
  if (score <= 40) return { label: 'Medium Risk',   color: '#6366f1' };
  if (score <= 60) return { label: 'Elevated Risk', color: '#f59e0b' };
  if (score <= 80) return { label: 'High Risk',     color: '#f59e0b' };
  return                  { label: 'Critical Risk', color: '#ef4444' };
}

function fmtAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return 'Just now';
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return d === 1 ? '1d ago' : `${d}d ago`;
}

function GaugeArc({ score }: { score: number }) {
  const pct = score / 100;
  const r = 54, cx = 70, cy = 70;
  const startAngle = Math.PI;
  const endAngle = startAngle + pct * Math.PI;
  const x1 = cx + r * Math.cos(startAngle);
  const y1 = cy + r * Math.sin(startAngle);
  const x2 = cx + r * Math.cos(endAngle);
  const y2 = cy + r * Math.sin(endAngle);
  const largeArc = pct > 0.5 ? 1 : 0;
  const { color } = riskLabel(score);

  return (
    <svg width="140" height="80" viewBox="0 0 140 80">
      <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
        fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" strokeLinecap="round" />
      <path d={`M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`}
        fill="none" stroke={color} strokeWidth="10" strokeLinecap="round" />
      <text x={cx} y={cy - 6} textAnchor="middle" fill="#f0fdf4" fontSize="22" fontWeight="900">{score}</text>
      <text x={cx} y={cy + 10} textAnchor="middle" fill="rgba(167,243,208,0.55)" fontSize="10">/100</text>
    </svg>
  );
}

export default function AttackSurfacePage() {
  const [data, setData] = useState<SurfaceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'assets' | 'ports'>('assets');

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/attack-surface');
      if (res.ok) setData(await res.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const score = data?.stats?.riskScore ?? 0;
  const { label: rLabel, color: rColor } = riskLabel(score);
  const totalAssets = data?.assets.length ?? 0;
  const totalPorts  = data?.ports.length  ?? 0;
  const v = data?.totalVulns ?? { critical: 0, high: 0, medium: 0, low: 0 };
  const totalIssues = v.critical + v.high + v.medium + v.low;

  const filteredAssets = (data?.assets ?? []).filter(a =>
    a.host.toLowerCase().includes(search.toLowerCase())
  );
  const filteredPorts = (data?.ports ?? []).filter(p =>
    p.host.toLowerCase().includes(search.toLowerCase()) ||
    String(p.port).includes(search) ||
    p.service.toLowerCase().includes(search.toLowerCase())
  );

  const isEmpty = !loading && data && totalAssets === 0 && totalPorts === 0;

  return (
    <div style={{ padding: '32px', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#f0fdf4', margin: 0 }}>Attack Surface</h1>
          <p style={{ color: 'rgba(167,243,208,0.55)', fontSize: '0.875rem', marginTop: '4px' }}>
            {loading ? 'Loading…' : data ? `${totalAssets} assets · ${totalPorts} open ports · ${data.totalScans} scans` : 'Monitor your external attack surface'}
          </p>
        </div>
        <button
          onClick={load}
          style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '9px 18px', borderRadius: '10px', background: '#34d399', color: '#021a12', fontWeight: 700, fontSize: '0.85rem', border: 'none', cursor: 'pointer' }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.1"/>
          </svg>
          Refresh
        </button>
      </div>

      {isEmpty && (
        <div style={{ ...GLASS, borderRadius: '16px', padding: '48px', textAlign: 'center', marginBottom: '24px' }}>
          <p style={{ fontSize: '2rem', marginBottom: '12px' }}>🔍</p>
          <p style={{ color: '#f0fdf4', fontWeight: 700, marginBottom: '6px' }}>No data yet</p>
          <p style={{ color: 'rgba(167,243,208,0.5)', fontSize: '0.85rem' }}>Run a scan first — your attack surface will appear here automatically.</p>
        </div>
      )}

      {/* Risk overview */}
      {!isEmpty && (
        <div style={{ ...GLASS, borderRadius: '16px', padding: '24px', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'rgba(167,243,208,0.4)', marginBottom: '20px' }}>Risk Overview</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr 1fr', gap: '32px' }}>
            {/* Gauge */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {loading ? (
                <div style={{ width: 140, height: 80, background: 'rgba(255,255,255,0.04)', borderRadius: '8px' }} />
              ) : (
                <GaugeArc score={score} />
              )}
              <div style={{ marginTop: '8px', textAlign: 'center' }}>
                <p style={{ fontWeight: 900, fontSize: '1rem', color: rColor, margin: 0 }}>{rLabel}</p>
                <p style={{ color: 'rgba(167,243,208,0.55)', fontSize: '0.75rem' }}>Overall score: {score}/100</p>
              </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '10px' }}>
              {[
                { label: 'Subdomains discovered', value: totalAssets, color: '#f0fdf4' },
                { label: 'Open ports',            value: totalPorts,  color: '#f0fdf4' },
                { label: 'Total findings',         value: totalIssues, color: totalIssues > 0 ? '#f59e0b' : '#34d399' },
              ].map(s => (
                <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: 'rgba(167,243,208,0.6)' }}>{s.label}</span>
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: s.color }}>{loading ? '—' : s.value}</span>
                </div>
              ))}
            </div>

            {/* Severity counts */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '8px', paddingLeft: '24px', borderLeft: '1px solid rgba(255,255,255,0.08)' }}>
              {(['critical', 'high', 'medium', 'low'] as const).map(sev => {
                const count = v[sev];
                const total = totalIssues || 1;
                return (
                  <div key={sev} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: SEV_COLOR[sev], width: '56px' }}>{sev}</span>
                    <div style={{ flex: 1, height: 5, borderRadius: 999, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${Math.round(count / total * 100)}%`, background: SEV_COLOR[sev], borderRadius: 999 }} />
                    </div>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: count > 0 ? SEV_COLOR[sev] : 'rgba(167,243,208,0.3)', width: '24px', textAlign: 'right' }}>{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      {!isEmpty && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '20px' }}>
          {/* Assets / Ports table */}
          <div style={{ ...GLASS, borderRadius: '16px', overflow: 'hidden' }}>
            {/* Tabs + search */}
            <div style={{ display: 'flex', alignItems: 'center', padding: '14px 20px', gap: '16px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              {(['assets', 'ports'] as const).map(t => (
                <button key={t} onClick={() => setTab(t)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0', fontSize: '0.875rem', fontWeight: 700, color: tab === t ? '#34d399' : 'rgba(167,243,208,0.45)', borderBottom: tab === t ? '2px solid #34d399' : '2px solid transparent', paddingBottom: '4px' }}>
                  {t === 'assets' ? `Subdomains (${totalAssets})` : `Open Ports (${totalPorts})`}
                </button>
              ))}
              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(167,243,208,0.4)" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search…"
                  style={{ background: 'none', border: 'none', outline: 'none', color: '#f0fdf4', fontSize: '0.8rem', width: '140px' }}
                />
              </div>
            </div>

            {/* Table header */}
            {tab === 'assets' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 160px 120px', padding: '8px 20px', background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {['Host', 'Root domain', 'First seen'].map(h => (
                  <span key={h} style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'rgba(167,243,208,0.4)' }}>{h}</span>
                ))}
              </div>
            )}
            {tab === 'ports' && (
              <div style={{ display: 'grid', gridTemplateColumns: '70px 1fr 160px 90px', padding: '8px 20px', background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {['Port', 'Service', 'Host', 'Severity'].map(h => (
                  <span key={h} style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'rgba(167,243,208,0.4)' }}>{h}</span>
                ))}
              </div>
            )}

            {/* Rows */}
            <div style={{ maxHeight: '460px', overflowY: 'auto' }}>
              {loading && (
                <div style={{ padding: '32px', textAlign: 'center' }}>
                  <p style={{ color: 'rgba(167,243,208,0.4)', fontSize: '0.85rem' }}>Loading…</p>
                </div>
              )}

              {tab === 'assets' && !loading && filteredAssets.map((a, i) => (
                <div key={a.host} style={{ display: 'grid', gridTemplateColumns: '1fr 160px 120px', padding: '10px 20px', borderBottom: i < filteredAssets.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', alignItems: 'center', background: 'rgba(255,255,255,0.018)' }}>
                  <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#f0fdf4', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.host}</span>
                  <span style={{ fontSize: '0.75rem', color: 'rgba(167,243,208,0.55)' }}>{a.scanDomain}</span>
                  <span style={{ fontSize: '0.72rem', color: 'rgba(167,243,208,0.4)' }}>{fmtAgo(a.firstSeen)}</span>
                </div>
              ))}

              {tab === 'ports' && !loading && filteredPorts.map((p, i) => (
                <div key={`${p.host}:${p.port}`} style={{ display: 'grid', gridTemplateColumns: '70px 1fr 160px 90px', padding: '10px 20px', borderBottom: i < filteredPorts.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', alignItems: 'center', background: 'rgba(255,255,255,0.018)' }}>
                  <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', fontWeight: 700, color: '#f0fdf4' }}>{p.port}/tcp</span>
                  <span style={{ fontSize: '0.8rem', color: 'rgba(167,243,208,0.7)' }}>{p.service}</span>
                  <span style={{ fontFamily: 'monospace', fontSize: '0.72rem', color: 'rgba(167,243,208,0.5)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.host}</span>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: '999px', background: `${SEV_COLOR[p.severity] ?? SEV_COLOR.info}20`, color: SEV_COLOR[p.severity] ?? SEV_COLOR.info, display: 'inline-block' }}>
                    {p.severity.charAt(0).toUpperCase() + p.severity.slice(1)}
                  </span>
                </div>
              ))}

              {!loading && tab === 'assets' && filteredAssets.length === 0 && (
                <div style={{ padding: '28px', textAlign: 'center' }}>
                  <p style={{ color: 'rgba(167,243,208,0.4)', fontSize: '0.85rem' }}>No assets found</p>
                </div>
              )}
              {!loading && tab === 'ports' && filteredPorts.length === 0 && (
                <div style={{ padding: '28px', textAlign: 'center' }}>
                  <p style={{ color: 'rgba(167,243,208,0.4)', fontSize: '0.85rem' }}>No open ports found</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent changes feed */}
          <div style={{ ...GLASS, borderRadius: '16px', overflow: 'hidden' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <h2 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#f0fdf4', margin: 0 }}>Recent Findings</h2>
            </div>
            <div style={{ overflowY: 'auto', maxHeight: '520px' }}>
              {loading && (
                <div style={{ padding: '28px', textAlign: 'center' }}>
                  <p style={{ color: 'rgba(167,243,208,0.4)', fontSize: '0.85rem' }}>Loading…</p>
                </div>
              )}
              {!loading && (data?.recentFindings ?? []).length === 0 && (
                <div style={{ padding: '28px', textAlign: 'center' }}>
                  <p style={{ color: 'rgba(167,243,208,0.4)', fontSize: '0.85rem' }}>No findings yet</p>
                </div>
              )}
              {!loading && (data?.recentFindings ?? []).map((f, i) => (
                <div key={f.id ?? i} style={{ display: 'flex', gap: '12px', padding: '12px 18px', borderBottom: i < (data?.recentFindings.length ?? 0) - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: SEV_COLOR[f.severity] ?? SEV_COLOR.info, flexShrink: 0, marginTop: '4px' }} />
                    {i < (data?.recentFindings.length ?? 0) - 1 && (
                      <div style={{ width: 1, flex: 1, background: 'rgba(255,255,255,0.07)', marginTop: '4px' }} />
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '0.78rem', color: 'rgba(167,243,208,0.85)', lineHeight: 1.4, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.title}</p>
                    <p style={{ fontSize: '0.68rem', color: 'rgba(167,243,208,0.4)', marginTop: '2px' }}>{f.asset} · {fmtAgo(f.discovered)}</p>
                  </div>
                  <span style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', color: SEV_COLOR[f.severity] ?? SEV_COLOR.info, flexShrink: 0 }}>
                    {f.severity}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
