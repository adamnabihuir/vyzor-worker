'use client';

import { useState, useEffect, useCallback } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

type FindingStatus = 'open' | 'acknowledged' | 'fixed' | 'false_positive' | 'wont_fix';

type Issue = {
  id: string;
  title: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low' | 'Info';
  target: string;
  port?: number;
  cvss: number;
  cve?: string;
  status: FindingStatus;
  discovered: string;
  lastSeen?: string;
  description: string;
  remediation: string;
  references: string[];
  service?: string;
  scanId?: string;
  isDemo?: boolean;
};


const NOISE_ITEMS = [
  'Web Application Scanning Consolidation / Info Reporting', 'CPE Inventory', 'Host Summary',
  'Hostname Determination Reporting', 'OS Detection Consolidation and Reporting', 'Services',
  'TCP Timestamps Information Disclosure', 'Traceroute', 'SSL/TLS: Report Non Weak Cipher Suites',
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const SEV_COLOR: Record<string, string> = {
  Critical: '#ef4444', High: '#f59e0b', Medium: '#3b82f6', Low: '#34d399', Info: '#94a3b8',
};

const DEFAULT_CVSS: Record<string, number> = {
  critical: 9.0, high: 7.5, medium: 5.0, low: 3.0, info: 0,
};

const GLASS: React.CSSProperties = {
  background: 'rgba(255,255,255,0.07)',
  backdropFilter: 'blur(18px)',
  WebkitBackdropFilter: 'blur(18px)',
  border: '1px solid rgba(255,255,255,0.13)',
  boxShadow: '0 4px 28px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.1)',
};

function capitalize(s: string): Issue['severity'] {
  return (s.charAt(0).toUpperCase() + s.slice(1)) as Issue['severity'];
}

function fmtDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch { return '—'; }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapFinding(f: any): Issue {
  const sev = capitalize(f.severity ?? 'low');
  return {
    id:          String(f.id ?? crypto.randomUUID()),
    title:       f.title ?? 'Unknown finding',
    severity:    sev,
    target:      f.asset ?? f.scanDomain ?? '',
    port:        f.port ?? undefined,
    cvss:        typeof f.cvss === 'number' ? f.cvss : (DEFAULT_CVSS[String(f.severity).toLowerCase()] ?? 0),
    cve:         f.cve ?? undefined,
    status:      (f.status as FindingStatus) ?? 'open',
    discovered:  f.discovered ?? f.first_seen_at ?? '',
    lastSeen:    f.lastSeen ?? f.last_seen_at ?? undefined,
    description: f.description ?? '',
    remediation: f.remediation ?? '',
    references:  Array.isArray(f.references) ? f.references : [],
    service:     f.service ?? f.template ?? undefined,
    scanId:      f.scanId ?? undefined,
    isDemo:      undefined,
  };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SeverityBadge({ severity }: { severity: string }) {
  const color = SEV_COLOR[severity] ?? '#94a3b8';
  return (
    <span className="text-xs font-bold px-2 py-0.5 rounded-full"
      style={{ background: `${color}18`, color, border: `1px solid ${color}30` }}>
      {severity}
    </span>
  );
}

function StatusBadge({ status }: { status: FindingStatus }) {
  const MAP: Record<FindingStatus, { label: string; color: string }> = {
    open:           { label: 'Open',          color: '#ef4444' },
    acknowledged:   { label: 'Acknowledged',  color: '#f59e0b' },
    fixed:          { label: 'Fixed',         color: '#34d399' },
    false_positive: { label: 'False Positive', color: '#94a3b8' },
    wont_fix:       { label: "Won't Fix",     color: '#64748b' },
  };
  const { label, color } = MAP[status] ?? MAP.open;
  return (
    <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
      style={{ background: `${color}18`, color, border: `1px solid ${color}30` }}>
      {label}
    </span>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function VulnerabilitiesPage() {
  const [tab, setTab] = useState<'current' | 'fixed' | 'snoozed' | 'noise'>('current');
  const [selected, setSelected] = useState<Issue | null>(null);
  const [severityFilter, setSeverityFilter] = useState('All');
  const [targetFilter, setTargetFilter] = useState('All');
  const [sortBy, setSortBy] = useState<'severity' | 'cvss' | 'date'>('severity');
  const [search, setSearch] = useState('');

  const [issues, setIssues]         = useState<Issue[]>([]);
  const [fixedIssues, setFixed]     = useState<Issue[]>([]);
  const [snoozedIssues, setSnoozed] = useState<Issue[]>([]);
  const [loading, setLoading]       = useState(true);
  const [updating, setUpdating]     = useState<string | null>(null);

  const hasRealData = issues.length > 0;

  // ── Fetch helpers ──────────────────────────────────────────────────────────
  const fetchTab = useCallback(async (statusParam: string): Promise<Issue[]> => {
    const res = await fetch(`/api/vulnerabilities?status=${statusParam}`);
    const data = await res.json();
    return Array.isArray(data) ? data.map(mapFinding) : [];
  }, []);

  // Open issues on mount
  useEffect(() => {
    setLoading(true);
    fetch('/api/vulnerabilities?status=open')
      .then(r => r.json())
      .then(data => {
        setIssues(Array.isArray(data) ? data.map(mapFinding) : []);
      })
      .catch(() => setIssues([]))
      .finally(() => setLoading(false));
  }, []);

  // Lazy-load fixed / snoozed when those tabs are first opened
  useEffect(() => {
    if (tab === 'fixed' && fixedIssues.length === 0) {
      fetchTab('fixed').then(setFixed);
    }
    if (tab === 'snoozed' && snoozedIssues.length === 0) {
      fetchTab('wont_fix').then(setSnoozed);
    }
  }, [tab, fetchTab, fixedIssues.length, snoozedIssues.length]);

  // ── Status update ──────────────────────────────────────────────────────────
  async function updateStatus(issue: Issue, newStatus: FindingStatus) {
    if (issue.isDemo) return;
    setUpdating(issue.id);
    try {
      const res = await fetch(`/api/vulnerabilities/${issue.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) return;

      // Remove from current list, update selected
      setIssues(prev => prev.filter(i => i.id !== issue.id));
      if (newStatus === 'fixed') setFixed(prev => [{ ...issue, status: 'fixed' }, ...prev]);
      if (newStatus === 'wont_fix') setSnoozed(prev => [{ ...issue, status: 'wont_fix' }, ...prev]);
      setSelected(null);
    } finally {
      setUpdating(null);
    }
  }

  // ── Filtered + sorted view ─────────────────────────────────────────────────
  const displayIssues = loading ? [] : issues;

  const uniqueTargets = [...new Set(displayIssues.map(i => i.target))].sort();

  const SEV_ORDER: Record<string, number> = { Critical: 0, High: 1, Medium: 2, Low: 3, Info: 4 };

  const filtered = displayIssues
    .filter(i => {
      const matchSev    = severityFilter === 'All' || i.severity === severityFilter;
      const matchTarget = targetFilter === 'All' || i.target === targetFilter;
      const matchSearch = !search || i.title.toLowerCase().includes(search.toLowerCase()) || i.target.toLowerCase().includes(search.toLowerCase()) || (i.cve ?? '').toLowerCase().includes(search.toLowerCase());
      return matchSev && matchTarget && matchSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'cvss')     return b.cvss - a.cvss;
      if (sortBy === 'date')     return new Date(b.discovered).getTime() - new Date(a.discovered).getTime();
      return (SEV_ORDER[a.severity] ?? 9) - (SEV_ORDER[b.severity] ?? 9);
    });

  const counts = {
    Critical: displayIssues.filter(i => i.severity === 'Critical').length,
    High:     displayIssues.filter(i => i.severity === 'High').length,
    Medium:   displayIssues.filter(i => i.severity === 'Medium').length,
    Low:      displayIssues.filter(i => i.severity === 'Low').length,
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="p-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-black text-2xl mb-1" style={{ color: '#f0fdf4' }}>Issues</h1>
          <p className="text-sm" style={{ color: 'rgba(167,243,208,0.5)' }}>
            {hasRealData ? `${issues.length} finding${issues.length !== 1 ? 's' : ''} from your scans` : 'Security findings from your scans will appear here'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="text-xs font-semibold px-3 py-2 rounded-lg flex items-center gap-1.5"
            style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(167,243,208,0.6)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            View all checks
          </button>
          <button className="text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2"
            style={{ background: '#34d399', color: '#021a12' }}
            onClick={() => window.location.href = '/dashboard/pentests'}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m14.5 2-8.5 8.5 1.5 1.5 8.5-8.5-1.5-1.5z"/><path d="m7 14-5 5"/><path d="m15.5 4.5 4 4"/></svg>
            New pentest
          </button>
        </div>
      </div>

      {/* Severity summary strip */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {(['Critical', 'High', 'Medium', 'Low'] as const).map(sev => (
          <button key={sev} onClick={() => setSeverityFilter(s => s === sev ? 'All' : sev)}
            className="rounded-2xl px-4 py-3 text-left transition-all"
            style={{ ...GLASS, border: severityFilter === sev ? `1px solid ${SEV_COLOR[sev]}50` : GLASS.border, background: severityFilter === sev ? `${SEV_COLOR[sev]}10` : GLASS.background }}>
            <p className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: SEV_COLOR[sev] }}>{sev}</p>
            <p className="font-black text-2xl" style={{ color: SEV_COLOR[sev] }}>
              {loading ? '—' : counts[sev]}
            </p>
            <p className="text-xs mt-1" style={{ color: 'rgba(167,243,208,0.45)' }}>
              {loading ? 'loading…' : counts[sev] === 1 ? 'issue' : 'issues'}
            </p>
          </button>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-0 mb-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        {([
          { key: 'current', label: 'Current',  count: displayIssues.length },
          { key: 'fixed',   label: 'Fixed',    count: fixedIssues.length || null },
          { key: 'snoozed', label: "Won't Fix", count: snoozedIssues.length || null },
          { key: 'noise',   label: 'Noise',    count: NOISE_ITEMS.length },
        ] as const).map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className="px-4 py-2.5 text-sm font-semibold flex items-center gap-1.5 transition-all"
            style={{ color: tab === t.key ? '#34d399' : 'rgba(167,243,208,0.5)', borderBottom: tab === t.key ? '2px solid #34d399' : '2px solid transparent', marginBottom: '-1px' }}>
            {t.label}
            {t.count !== null && (
              <span className="text-xs font-bold px-1.5 py-0.5 rounded-full"
                style={{ background: tab === t.key ? 'rgba(52,211,153,0.15)' : 'rgba(255,255,255,0.07)', color: tab === t.key ? '#34d399' : 'rgba(167,243,208,0.5)' }}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* CURRENT TAB */}
      {tab === 'current' && (
        <>
          {hasRealData && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl mb-4 text-sm"
              style={{ background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.18)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
              <span style={{ color: 'rgba(167,243,208,0.7)' }}>
                <strong style={{ color: '#34d399' }}>{displayIssues.length} real findings</strong> from your scans — powered by nmap + nuclei.
              </span>
            </div>
          )}

          {/* Filter bar */}
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <span className="text-xs font-semibold" style={{ color: 'rgba(167,243,208,0.5)' }}>
              {filtered.length} issue{filtered.length !== 1 ? 's' : ''}
            </span>
            <div className="ml-auto flex items-center gap-2 flex-wrap">
              {/* Search */}
              <div className="relative">
                <svg className="absolute left-2.5 top-1/2 -translate-y-1/2" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(167,243,208,0.4)" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                <input type="text" placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)}
                  className="scan-input rounded-lg pl-8 pr-3 py-1.5 text-xs" style={{ width: '140px' }} />
              </div>
              {/* Target filter */}
              {uniqueTargets.length > 1 && (
                <select value={targetFilter} onChange={e => setTargetFilter(e.target.value)}
                  className="text-xs font-semibold rounded-lg px-2 py-1.5"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: targetFilter !== 'All' ? '#34d399' : 'rgba(167,243,208,0.6)', outline: 'none', maxWidth: '160px' }}>
                  <option value="All">All targets</option>
                  {uniqueTargets.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              )}
              {/* Sort */}
              <select value={sortBy} onChange={e => setSortBy(e.target.value as typeof sortBy)}
                className="text-xs font-semibold rounded-lg px-2 py-1.5"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(167,243,208,0.6)', outline: 'none' }}>
                <option value="severity">Sort: Severity</option>
                <option value="cvss">Sort: CVSS</option>
                <option value="date">Sort: Newest</option>
              </select>
              {/* Severity filters */}
              {(['All', 'Critical', 'High', 'Medium', 'Low'] as const).map(s => (
                <button key={s} onClick={() => setSeverityFilter(s)}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
                  style={{ background: severityFilter === s ? (s === 'All' ? 'rgba(52,211,153,0.15)' : `${SEV_COLOR[s]}18`) : 'rgba(255,255,255,0.06)', color: severityFilter === s ? (s === 'All' ? '#34d399' : SEV_COLOR[s]) : 'rgba(167,243,208,0.5)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Issue list + detail panel */}
          <div className="flex gap-4 min-h-0">
            <div className="rounded-2xl overflow-hidden flex-shrink-0 transition-all"
              style={{ ...GLASS, width: selected ? '50%' : '100%' }}>

              <div className="px-5 py-3 flex items-center gap-4 text-xs font-bold uppercase tracking-wide"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', color: 'rgba(167,243,208,0.4)' }}>
                <span className="flex-1">Issue</span>
                <span style={{ width: '80px' }}>Severity</span>
                <span style={{ width: '50px', textAlign: 'right' }}>CVSS</span>
                <span style={{ width: '24px' }} />
              </div>

              {loading ? (
                <div className="px-5 py-12 text-center">
                  <p className="text-sm" style={{ color: 'rgba(167,243,208,0.4)' }}>Loading findings…</p>
                </div>
              ) : filtered.length === 0 && issues.length === 0 ? (
                <div className="px-5 py-16 text-center flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(52,211,153,0.07)', border: '1px solid rgba(52,211,153,0.15)' }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(52,211,153,0.5)" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  </div>
                  <p className="font-bold text-base" style={{ color: 'rgba(240,253,244,0.7)' }}>No vulnerabilities found</p>
                  <p className="text-sm" style={{ color: 'rgba(167,243,208,0.4)' }}>Run a scan to start discovering security issues</p>
                </div>
              ) : filtered.length === 0 ? (
                <div className="px-5 py-12 text-center">
                  <p className="text-sm" style={{ color: 'rgba(167,243,208,0.4)' }}>No issues match the current filters.</p>
                </div>
              ) : (
                filtered.map((issue, i) => (
                  <div key={issue.id} onClick={() => setSelected(s => s?.id === issue.id ? null : issue)}
                    className="px-5 py-4 cursor-pointer transition-all"
                    style={{ borderBottom: i < filtered.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none', background: selected?.id === issue.id ? 'rgba(52,211,153,0.08)' : 'transparent', borderLeft: selected?.id === issue.id ? '3px solid #34d399' : '3px solid transparent' }}
                    onMouseEnter={e => { if (selected?.id !== issue.id) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                    onMouseLeave={e => { if (selected?.id !== issue.id) e.currentTarget.style.background = 'transparent'; }}>
                    <div className="flex items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          {issue.cve && <span className="text-xs font-mono" style={{ color: '#a78bfa' }}>{issue.cve}</span>}
                          {issue.service && (
                            <span className="text-xs font-bold px-1.5 rounded" style={{ background: 'rgba(167,139,250,0.12)', color: '#a78bfa' }}>
                              {issue.service}
                            </span>
                          )}
                        </div>
                        <p className="font-semibold text-sm truncate" style={{ color: '#f0fdf4' }}>{issue.title}</p>
                        <p className="text-xs mt-0.5 font-mono truncate" style={{ color: 'rgba(167,243,208,0.45)' }}>
                          {issue.target}{issue.port ? `:${issue.port}` : ''} · {fmtDate(issue.discovered)}
                        </p>
                      </div>
                      <div style={{ width: '80px', flexShrink: 0 }}>
                        <SeverityBadge severity={issue.severity} />
                      </div>
                      <div style={{ width: '50px', flexShrink: 0, textAlign: 'right' }}>
                        <span className="text-sm font-bold" style={{ color: SEV_COLOR[issue.severity] }}>
                          {issue.cvss > 0 ? issue.cvss.toFixed(1) : '—'}
                        </span>
                      </div>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(167,243,208,0.3)" strokeWidth="1.5"
                        style={{ flexShrink: 0, transform: selected?.id === issue.id ? 'rotate(90deg)' : undefined, transition: 'transform 0.2s' }}>
                        <polyline points="9 18 15 12 9 6"/>
                      </svg>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Detail panel */}
            {selected && (
              <div className="rounded-2xl overflow-hidden flex-1 min-w-0" style={GLASS}>
                <div className="px-6 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2 flex-wrap">
                      <SeverityBadge severity={selected.severity} />
                      <StatusBadge status={selected.status} />
                      {selected.cve && <span className="text-xs font-mono px-2 py-0.5 rounded-full" style={{ background: 'rgba(167,139,250,0.12)', color: '#a78bfa' }}>{selected.cve}</span>}
                    </div>
                    <button onClick={() => setSelected(null)} style={{ color: 'rgba(167,243,208,0.4)' }}
                      onMouseEnter={e => e.currentTarget.style.color = '#f0fdf4'}
                      onMouseLeave={e => e.currentTarget.style.color = 'rgba(167,243,208,0.4)'}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                  </div>
                  <h3 className="font-black text-base mt-3" style={{ color: '#f0fdf4' }}>{selected.title}</h3>
                </div>

                <div className="px-6 py-4 space-y-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 280px)' }}>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: 'Target',     value: `${selected.target}${selected.port ? `:${selected.port}` : ''}`, mono: true },
                      { label: 'CVSS Score', value: selected.cvss > 0 ? selected.cvss.toFixed(1) : '—', mono: false },
                      { label: 'First seen', value: fmtDate(selected.discovered), mono: false },
                      { label: 'Last seen',  value: selected.lastSeen ? fmtDate(selected.lastSeen) : '—', mono: false },
                    ].map(({ label, value, mono }) => (
                      <div key={label} className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.05)' }}>
                        <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: 'rgba(167,243,208,0.4)' }}>{label}</p>
                        <p className="text-sm font-semibold truncate" style={{ color: '#f0fdf4', fontFamily: mono ? 'monospace' : undefined }}>{value}</p>
                      </div>
                    ))}
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: 'rgba(167,243,208,0.4)' }}>Description</p>
                    <p className="text-sm leading-relaxed" style={{ color: 'rgba(167,243,208,0.75)' }}>{selected.description || '—'}</p>
                  </div>

                  <div className="rounded-xl p-4" style={{ background: 'rgba(52,211,153,0.07)', border: '1px solid rgba(52,211,153,0.2)' }}>
                    <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: '#34d399' }}>Recommended Remediation</p>
                    <p className="text-sm leading-relaxed" style={{ color: 'rgba(167,243,208,0.75)' }}>{selected.remediation || '—'}</p>
                  </div>

                  {selected.references.length > 0 && (
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: 'rgba(167,243,208,0.4)' }}>References</p>
                      <div className="space-y-1">
                        {selected.references.map((ref, i) => (
                          <a key={i} href={String(ref)} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-2 text-xs break-all" style={{ color: '#34d399' }}>
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                            {String(ref)}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action buttons */}
                  {!selected.isDemo && (
                    <div className="flex gap-2 pt-2">
                      <button
                        disabled={!!updating}
                        onClick={() => updateStatus(selected, 'wont_fix')}
                        className="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                        style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(167,243,208,0.6)', border: '1px solid rgba(255,255,255,0.1)' }}>
                        {updating === selected.id ? '…' : "Won't Fix"}
                      </button>
                      <button
                        disabled={!!updating}
                        onClick={() => updateStatus(selected, 'false_positive')}
                        className="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                        style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
                        {updating === selected.id ? '…' : 'False Positive'}
                      </button>
                      <button
                        disabled={!!updating}
                        onClick={() => updateStatus(selected, 'fixed')}
                        className="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                        style={{ background: '#34d399', color: '#021a12' }}>
                        {updating === selected.id ? '…' : 'Mark Fixed ✓'}
                      </button>
                    </div>
                  )}
                  {selected.isDemo && (
                    <p className="text-xs text-center pt-2" style={{ color: 'rgba(167,243,208,0.35)' }}>
                      Run a real scan to enable status tracking
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* FIXED TAB */}
      {tab === 'fixed' && (
        fixedIssues.length === 0 ? (
          <div className="rounded-2xl p-16 text-center" style={GLASS}>
            <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
              style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <p className="font-bold text-base mb-1" style={{ color: '#f0fdf4' }}>Any fixed issues will appear here</p>
            <p className="text-sm" style={{ color: 'rgba(167,243,208,0.5)', maxWidth: '360px', margin: '0 auto' }}>
              Once you mark an issue as fixed, it moves here automatically.
            </p>
          </div>
        ) : (
          <div className="rounded-2xl overflow-hidden" style={GLASS}>
            {fixedIssues.map((issue, i) => (
              <div key={issue.id} className="px-5 py-4 flex items-center gap-4"
                style={{ borderBottom: i < fixedIssues.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate" style={{ color: 'rgba(167,243,208,0.6)', textDecoration: 'line-through' }}>{issue.title}</p>
                  <p className="text-xs mt-0.5 font-mono" style={{ color: 'rgba(167,243,208,0.35)' }}>{issue.target} · Fixed {fmtDate(issue.discovered)}</p>
                </div>
                <SeverityBadge severity={issue.severity} />
                <StatusBadge status="fixed" />
              </div>
            ))}
          </div>
        )
      )}

      {/* WON'T FIX / SNOOZED TAB */}
      {tab === 'snoozed' && (
        snoozedIssues.length === 0 ? (
          <div className="rounded-2xl p-16 text-center" style={GLASS}>
            <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(167,243,208,0.4)" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            </div>
            <p className="font-bold text-base mb-1" style={{ color: '#f0fdf4' }}>No accepted risks</p>
            <p className="text-sm" style={{ color: 'rgba(167,243,208,0.5)' }}>
              Issues you mark as &quot;Won&apos;t Fix&quot; appear here and don&apos;t count toward your risk score.
            </p>
          </div>
        ) : (
          <div className="rounded-2xl overflow-hidden" style={GLASS}>
            {snoozedIssues.map((issue, i) => (
              <div key={issue.id} className="px-5 py-4 flex items-center gap-4"
                style={{ borderBottom: i < snoozedIssues.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate" style={{ color: 'rgba(167,243,208,0.6)' }}>{issue.title}</p>
                  <p className="text-xs mt-0.5 font-mono" style={{ color: 'rgba(167,243,208,0.35)' }}>{issue.target}</p>
                </div>
                <SeverityBadge severity={issue.severity} />
                <StatusBadge status="wont_fix" />
              </div>
            ))}
          </div>
        )
      )}

      {/* NOISE TAB */}
      {tab === 'noise' && (
        <>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm font-semibold" style={{ color: 'rgba(167,243,208,0.5)' }}>{NOISE_ITEMS.length} noise items</span>
            <div className="ml-auto">
              <button className="text-xs font-semibold px-3 py-1.5 rounded-lg"
                style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(167,243,208,0.5)', border: '1px solid rgba(255,255,255,0.08)' }}>
                What is noise?
              </button>
            </div>
          </div>
          <div className="rounded-2xl overflow-hidden" style={GLASS}>
            {NOISE_ITEMS.map((item, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-4 cursor-pointer transition-colors"
                style={{ borderBottom: i < NOISE_ITEMS.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: 'rgba(167,243,208,0.25)' }} />
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'rgba(167,243,208,0.75)' }}>{item}</p>
                  <p className="text-xs mt-0.5 font-mono" style={{ color: 'rgba(167,243,208,0.35)' }}>Noise · detected in recent scan</p>
                </div>
                <svg className="ml-auto" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(167,243,208,0.25)" strokeWidth="1.5"><polyline points="9 18 15 12 9 6"/></svg>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
