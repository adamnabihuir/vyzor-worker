'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

const GLASS: React.CSSProperties = {
  background: 'rgba(255,255,255,0.07)',
  backdropFilter: 'blur(18px)',
  WebkitBackdropFilter: 'blur(18px)',
  border: '1px solid rgba(255,255,255,0.13)',
  boxShadow: '0 4px 28px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.1)',
};

const SEV: Record<string, string> = {
  critical: '#ef4444', high: '#f59e0b', medium: '#3b82f6', low: '#34d399',
};

const RISK_COLOR = (s: number) =>
  s >= 75 ? '#ef4444' : s >= 50 ? '#f59e0b' : s >= 25 ? '#3b82f6' : '#34d399';

const RISK_LABEL = (s: number) =>
  s >= 75 ? 'High' : s >= 50 ? 'Medium' : s >= 25 ? 'Low' : 'Minimal';

type Issues = { critical: number; high: number; medium: number; low: number };

type Target = {
  id: string;
  domain: string;
  label: string | null;
  created_at: string;
  scanId: string | null;
  scanStatus: 'queued' | 'running' | 'completed' | 'failed' | 'never';
  riskScore: number;
  assets: number;
  ports: number;
  issues: Issues;
  totalFindings: number;
  lastScan: string | null;
  recentScans: number;
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function fmtAgo(iso: string) {
  const h = Math.floor((Date.now() - new Date(iso).getTime()) / 3600000);
  if (h < 1) return 'Just now';
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return d === 1 ? '1d ago' : `${d}d ago`;
}

function RiskRing({ score }: { score: number }) {
  const color = RISK_COLOR(score);
  const r = 18, circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <svg width="44" height="44" viewBox="0 0 44 44">
      <circle cx="22" cy="22" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="4" />
      <circle cx="22" cy="22" r={r} fill="none" stroke={color} strokeWidth="4"
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        transform="rotate(-90 22 22)" />
      <text x="22" y="26" textAnchor="middle" fontSize="10" fontWeight="800" fill={color}>{score}</text>
    </svg>
  );
}

function StatusBadge({ status }: { status: Target['scanStatus'] }) {
  const map: Record<string, { label: string; color: string; bg: string }> = {
    completed: { label: 'Scanned',  color: '#34d399', bg: 'rgba(52,211,153,0.1)' },
    running:   { label: 'Running',  color: '#34d399', bg: 'rgba(52,211,153,0.08)' },
    queued:    { label: 'Queued',   color: '#94a3b8', bg: 'rgba(148,163,184,0.1)' },
    failed:    { label: 'Failed',   color: '#ef4444', bg: 'rgba(239,68,68,0.1)'   },
    never:     { label: 'No scans', color: '#94a3b8', bg: 'rgba(148,163,184,0.08)' },
  };
  const s = map[status] ?? map.never;
  return (
    <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: '999px', background: s.bg, color: s.color }}>
      {s.label}
    </span>
  );
}

export default function TargetsPage() {
  const router = useRouter();
  const [targets, setTargets]     = useState<Target[]>([]);
  const [loading, setLoading]     = useState(true);
  const [selected, setSelected]   = useState<Target | null>(null);
  const [search, setSearch]       = useState('');
  const [showAdd, setShowAdd]     = useState(false);
  const [newDomain, setNewDomain] = useState('');
  const [newLabel, setNewLabel]   = useState('');
  const [adding, setAdding]       = useState(false);
  const [addErr, setAddErr]       = useState('');
  const [scanning, setScanning]   = useState<string | null>(null);
  const [deleting, setDeleting]   = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/targets');
      if (res.ok) {
        const data: Target[] = await res.json();
        setTargets(data);
        setSelected(prev => prev ? (data.find(t => t.id === prev.id) ?? null) : null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const addTarget = async (scanNow: boolean) => {
    if (!newDomain.trim()) return;
    setAdding(true);
    setAddErr('');
    try {
      const res = await fetch('/api/targets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: newDomain.trim(), label: newLabel.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) { setAddErr(data.error ?? 'Error'); return; }

      setShowAdd(false);
      setNewDomain('');
      setNewLabel('');

      if (scanNow) {
        const sr = await fetch('/api/scan/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ domain: data.domain }),
        });
        const sd = await sr.json();
        if (sr.ok && sd.scanId) {
          router.push(`/dashboard/scans/${sd.scanId}`);
          return;
        }
        if (!sr.ok) setAddErr(sd.error ?? 'Scan failed to start');
      }
      await load();
    } finally {
      setAdding(false);
    }
  };

  const scanTarget = async (domain: string) => {
    setScanning(domain);
    try {
      const res = await fetch('/api/scan/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain }),
      });
      const data = await res.json();
      if (res.ok && data.scanId) router.push(`/dashboard/scans/${data.scanId}`);
    } finally {
      setScanning(null);
    }
  };

  const deleteTarget = async (id: string) => {
    setDeleting(id);
    try {
      await fetch(`/api/targets/${id}`, { method: 'DELETE' });
      setTargets(prev => prev.filter(t => t.id !== id));
      if (selected?.id === id) setSelected(null);
    } finally {
      setDeleting(null);
    }
  };

  const filtered = targets.filter(t =>
    !search || t.domain.toLowerCase().includes(search.toLowerCase()) ||
    (t.label ?? '').toLowerCase().includes(search.toLowerCase())
  );

  const totalCritical = targets.reduce((a, t) => a + t.issues.critical, 0);
  const totalAssets   = targets.reduce((a, t) => a + t.assets, 0);
  const avgRisk       = targets.length ? Math.round(targets.reduce((a, t) => a + t.riskScore, 0) / targets.length) : 0;

  return (
    <div style={{ padding: '32px', minHeight: '100vh' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#f0fdf4', margin: 0 }}>Targets</h1>
          <p style={{ color: 'rgba(167,243,208,0.55)', fontSize: '0.875rem', marginTop: '4px' }}>
            {loading ? 'Loading…' : `${targets.length} target${targets.length !== 1 ? 's' : ''} · ${totalAssets} assets monitored`}
          </p>
        </div>
        <button onClick={() => setShowAdd(true)} style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '9px 18px', borderRadius: '10px', background: '#34d399', color: '#021a12', fontWeight: 700, fontSize: '0.85rem', border: 'none', cursor: 'pointer' }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add target
        </button>
      </div>

      {/* Stats strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '14px', marginBottom: '24px' }}>
        {[
          { label: 'Total targets',  value: targets.length,  color: '#34d399', sub: 'monitored domains' },
          { label: 'Total assets',   value: totalAssets,     color: '#7dd3fc', sub: 'across all targets' },
          { label: 'Critical issues',value: totalCritical,   color: '#ef4444', sub: 'need immediate action' },
          { label: 'Avg risk score', value: avgRisk,         color: '#f59e0b', sub: 'across all targets' },
        ].map((s, i) => (
          <div key={i} style={{ ...GLASS, borderRadius: '14px', padding: '16px 20px' }}>
            <p style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'rgba(167,243,208,0.45)', marginBottom: '6px' }}>{s.label}</p>
            <p style={{ fontSize: '1.6rem', fontWeight: 900, color: loading ? 'rgba(167,243,208,0.3)' : s.color, margin: 0, lineHeight: 1 }}>{loading ? '—' : s.value}</p>
            <p style={{ fontSize: '0.7rem', color: 'rgba(167,243,208,0.4)', marginTop: '4px' }}>{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', flex: 1, maxWidth: '300px' }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(167,243,208,0.4)" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search targets…"
            style={{ background: 'none', border: 'none', outline: 'none', color: '#f0fdf4', fontSize: '0.85rem', flex: 1 }} />
        </div>
      </div>

      {/* Empty state */}
      {!loading && targets.length === 0 && (
        <div style={{ ...GLASS, borderRadius: '16px', padding: '56px', textAlign: 'center' }}>
          <p style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🎯</p>
          <p style={{ color: '#f0fdf4', fontWeight: 700, fontSize: '1rem', marginBottom: '6px' }}>No targets yet</p>
          <p style={{ color: 'rgba(167,243,208,0.5)', fontSize: '0.85rem', marginBottom: '20px' }}>Add a domain to start monitoring your attack surface.</p>
          <button onClick={() => setShowAdd(true)} style={{ padding: '10px 22px', borderRadius: '10px', background: '#34d399', color: '#021a12', fontWeight: 700, fontSize: '0.875rem', border: 'none', cursor: 'pointer' }}>
            Add your first target
          </button>
        </div>
      )}

      {/* Main layout */}
      {(loading || targets.length > 0) && (
        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>

          {/* Table */}
          <div style={{ ...GLASS, borderRadius: '16px', overflow: 'hidden', flex: 1, minWidth: 0 }}>
            {/* Header */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1.4fr 1.2fr 110px', padding: '10px 20px', background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              {['Target', 'Status', 'Risk', 'Issues', 'Last scan', 'Actions'].map(h => (
                <span key={h} style={{ fontSize: '0.63rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'rgba(167,243,208,0.4)' }}>{h}</span>
              ))}
            </div>

            {loading && Array.from({ length: 3 }).map((_, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1.4fr 1.2fr 110px', padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', gap: '12px', alignItems: 'center' }}>
                {Array.from({ length: 6 }).map((_, j) => (
                  <div key={j} style={{ height: '12px', borderRadius: '6px', background: 'rgba(255,255,255,0.06)', width: j === 0 ? '80%' : '60%' }} />
                ))}
              </div>
            ))}

            {!loading && filtered.map((target, i) => {
              const isSelected = selected?.id === target.id;
              const totalIssues = target.issues.critical + target.issues.high + target.issues.medium + target.issues.low;
              return (
                <div
                  key={target.id}
                  onClick={() => setSelected(s => s?.id === target.id ? null : target)}
                  style={{
                    display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1.4fr 1.2fr 110px',
                    padding: '14px 20px', alignItems: 'center', cursor: 'pointer',
                    borderBottom: i < filtered.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                    background: isSelected ? 'rgba(52,211,153,0.06)' : 'rgba(255,255,255,0.018)',
                    borderLeft: isSelected ? '3px solid #34d399' : '3px solid transparent',
                    transition: 'background 0.12s',
                  }}
                  onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                  onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.018)'; }}
                >
                  {/* Domain */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                    <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#f0fdf4', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{target.domain}</p>
                      <p style={{ fontSize: '0.7rem', color: 'rgba(167,243,208,0.4)', margin: '2px 0 0', fontFamily: 'monospace' }}>
                        {target.assets} assets · {target.ports} ports
                      </p>
                    </div>
                  </div>

                  {/* Status */}
                  <StatusBadge status={target.scanStatus} />

                  {/* Risk */}
                  {target.scanStatus === 'completed' ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <RiskRing score={target.riskScore} />
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: RISK_COLOR(target.riskScore) }}>{RISK_LABEL(target.riskScore)}</span>
                    </div>
                  ) : (
                    <span style={{ fontSize: '0.75rem', color: 'rgba(167,243,208,0.3)' }}>—</span>
                  )}

                  {/* Issues */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap' }}>
                    {totalIssues === 0 ? (
                      target.scanStatus === 'completed' ? (
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#34d399', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>Clean
                        </span>
                      ) : <span style={{ fontSize: '0.75rem', color: 'rgba(167,243,208,0.3)' }}>—</span>
                    ) : (
                      (['critical', 'high', 'medium', 'low'] as const).filter(k => target.issues[k] > 0).map(k => (
                        <span key={k} style={{ fontSize: '0.68rem', fontWeight: 700, padding: '1px 6px', borderRadius: '4px', background: `${SEV[k]}18`, color: SEV[k] }}>
                          {target.issues[k]}{k.charAt(0).toUpperCase()}
                        </span>
                      ))
                    )}
                  </div>

                  {/* Last scan */}
                  <span style={{ fontSize: '0.75rem', color: 'rgba(167,243,208,0.5)' }}>
                    {target.lastScan ? fmtAgo(target.lastScan) : 'Never'}
                  </span>

                  {/* Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }} onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => scanTarget(target.domain)}
                      disabled={scanning === target.domain}
                      style={{ fontSize: '0.72rem', fontWeight: 700, padding: '4px 10px', borderRadius: '7px', background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)', color: '#34d399', cursor: scanning === target.domain ? 'default' : 'pointer', opacity: scanning === target.domain ? 0.6 : 1 }}
                    >
                      {scanning === target.domain ? '…' : 'Scan'}
                    </button>
                    <button
                      onClick={() => deleteTarget(target.id)}
                      disabled={deleting === target.id}
                      title="Remove target"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(239,68,68,0.4)', padding: '4px', opacity: deleting === target.id ? 0.4 : 1 }}
                      onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                      onMouseLeave={e => e.currentTarget.style.color = 'rgba(239,68,68,0.4)'}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                    </button>
                  </div>
                </div>
              );
            })}

            {!loading && filtered.length === 0 && targets.length > 0 && (
              <div style={{ padding: '32px', textAlign: 'center' }}>
                <p style={{ color: 'rgba(167,243,208,0.4)', fontSize: '0.85rem' }}>No targets match your search.</p>
              </div>
            )}
          </div>

          {/* Detail panel */}
          {selected && (
            <div style={{ ...GLASS, borderRadius: '16px', overflow: 'hidden', width: '280px', flexShrink: 0 }}>
              <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'rgba(167,243,208,0.4)' }}>Target details</span>
                <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(167,243,208,0.4)' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>

              <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Domain */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f0fdf4', margin: 0 }}>{selected.domain}</p>
                    <p style={{ fontSize: '0.72rem', color: 'rgba(167,243,208,0.45)', margin: '2px 0 0' }}>Added {fmtDate(selected.created_at)}</p>
                  </div>
                </div>

                {/* Risk */}
                {selected.scanStatus === 'completed' && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: '12px', background: 'rgba(255,255,255,0.04)' }}>
                    <div>
                      <p style={{ fontSize: '0.7rem', color: 'rgba(167,243,208,0.45)', margin: '0 0 4px' }}>Risk Score</p>
                      <p style={{ fontSize: '2rem', fontWeight: 900, color: RISK_COLOR(selected.riskScore), margin: 0, lineHeight: 1 }}>{selected.riskScore}</p>
                      <p style={{ fontSize: '0.72rem', fontWeight: 600, color: RISK_COLOR(selected.riskScore), margin: '2px 0 0' }}>{RISK_LABEL(selected.riskScore)} Risk</p>
                    </div>
                    <RiskRing score={selected.riskScore} />
                  </div>
                )}

                {/* Issues breakdown */}
                {selected.scanStatus === 'completed' && (
                  <div>
                    <p style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgba(167,243,208,0.4)', marginBottom: '10px' }}>Issues</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                      {(['critical', 'high', 'medium', 'low'] as const).map(sev => {
                        const count = selected.issues[sev];
                        const total = selected.issues.critical + selected.issues.high + selected.issues.medium + selected.issues.low || 1;
                        return (
                          <div key={sev} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'capitalize', color: SEV[sev], width: '48px' }}>{sev}</span>
                            <div style={{ flex: 1, height: '4px', borderRadius: 999, background: 'rgba(255,255,255,0.08)' }}>
                              <div style={{ height: '100%', width: `${(count / total) * 100}%`, background: SEV[sev], borderRadius: 999 }} />
                            </div>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: count > 0 ? SEV[sev] : 'rgba(167,243,208,0.3)', width: '20px', textAlign: 'right' }}>{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Stats grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {[
                    { label: 'Assets',    value: selected.assets },
                    { label: 'Ports',     value: selected.ports },
                    { label: 'Findings',  value: selected.totalFindings },
                    { label: 'Scans run', value: selected.recentScans },
                  ].map(s => (
                    <div key={s.label} style={{ padding: '10px 12px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)' }}>
                      <p style={{ fontSize: '0.68rem', color: 'rgba(167,243,208,0.4)', margin: '0 0 3px' }}>{s.label}</p>
                      <p style={{ fontSize: '1.2rem', fontWeight: 900, color: '#f0fdf4', margin: 0 }}>{s.value}</p>
                    </div>
                  ))}
                </div>

                {/* Last scan */}
                {selected.lastScan && (
                  <p style={{ fontSize: '0.72rem', color: 'rgba(167,243,208,0.4)', margin: 0 }}>
                    Last scanned: {fmtDate(selected.lastScan)}
                  </p>
                )}

                {/* CTA buttons */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button
                    onClick={() => scanTarget(selected.domain)}
                    disabled={scanning === selected.domain}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', padding: '10px', borderRadius: '10px', background: '#34d399', color: '#021a12', fontWeight: 700, fontSize: '0.875rem', border: 'none', cursor: 'pointer', opacity: scanning === selected.domain ? 0.7 : 1 }}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                    {scanning === selected.domain ? 'Starting…' : 'Scan now'}
                  </button>
                  <button
                    onClick={() => deleteTarget(selected.id)}
                    disabled={deleting === selected.id}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', padding: '10px', borderRadius: '10px', background: 'rgba(239,68,68,0.08)', color: '#ef4444', fontWeight: 600, fontSize: '0.875rem', border: '1px solid rgba(239,68,68,0.2)', cursor: 'pointer' }}
                  >
                    {deleting === selected.id ? 'Removing…' : 'Remove target'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add target modal */}
      {showAdd && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => { setShowAdd(false); setAddErr(''); }}>
          <div style={{ ...GLASS, borderRadius: '20px', padding: '28px', width: '400px', maxWidth: '90vw' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f0fdf4', margin: 0 }}>Add New Target</h2>
                <p style={{ fontSize: '0.8rem', color: 'rgba(167,243,208,0.5)', margin: '4px 0 0' }}>Vyzor will start monitoring this domain.</p>
              </div>
              <button onClick={() => { setShowAdd(false); setAddErr(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(167,243,208,0.4)' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '22px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'rgba(167,243,208,0.7)', marginBottom: '6px' }}>Domain *</label>
                <input
                  value={newDomain}
                  onChange={e => setNewDomain(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addTarget(true)}
                  placeholder="example.com"
                  autoFocus
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.06)', border: `1px solid ${addErr ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.15)'}`, color: '#f0fdf4', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'rgba(167,243,208,0.7)', marginBottom: '6px' }}>Label <span style={{ color: 'rgba(167,243,208,0.35)', fontWeight: 400 }}>(optional)</span></label>
                <input
                  value={newLabel}
                  onChange={e => setNewLabel(e.target.value)}
                  placeholder="e.g. Production, Staging, API…"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: '#f0fdf4', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
              {addErr && (
                <p style={{ fontSize: '0.78rem', color: '#ef4444', margin: 0 }}>{addErr}</p>
              )}
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => addTarget(false)} disabled={adding || !newDomain.trim()} style={{ flex: 1, padding: '10px', borderRadius: '10px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(167,243,208,0.7)', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', opacity: !newDomain.trim() || adding ? 0.5 : 1 }}>
                Add only
              </button>
              <button onClick={() => addTarget(true)} disabled={adding || !newDomain.trim()} style={{ flex: 1, padding: '10px', borderRadius: '10px', background: newDomain.trim() && !adding ? '#34d399' : 'rgba(52,211,153,0.3)', color: '#021a12', fontSize: '0.875rem', fontWeight: 700, border: 'none', cursor: newDomain.trim() && !adding ? 'pointer' : 'default' }}>
                {adding ? 'Starting…' : 'Add & Scan now'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
