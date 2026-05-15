'use client';

import { use, useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ScanResult, getScan, getRiskColor, getRiskLabel, getSeverityColor } from '@/lib/scans';
import { ScanRow } from '@/lib/supabase';

const GLASS: React.CSSProperties = {
  background: 'rgba(255,255,255,0.07)',
  backdropFilter: 'blur(18px)',
  WebkitBackdropFilter: 'blur(18px)',
  border: '1px solid rgba(255,255,255,0.13)',
  boxShadow: '0 4px 28px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.1)',
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const SEV_COLOR: Record<string, string> = {
  critical: '#ef4444', high: '#f59e0b', medium: '#6366f1', low: '#22c55e', info: '#94a3b8',
};

// ─── Progress screen (while scan is running) ──────────────────────────────────

function ScanProgress({ row }: { row: ScanRow }) {
  const steps = [
    { label: 'Subdomain discovery', pct: 25, tool: 'subfinder' },
    { label: 'Port scanning', pct: 55, tool: 'nmap' },
    { label: 'Vulnerability scanning', pct: 88, tool: 'nuclei' },
    { label: 'Compiling results', pct: 100, tool: '' },
  ];

  const currentStepIndex = steps.findIndex((s) => row.progress < s.pct);
  const activeIndex = currentStepIndex === -1 ? steps.length - 1 : currentStepIndex;

  return (
    <div className="p-8 max-w-2xl mx-auto mt-16">
      <div className="rounded-2xl p-8" style={GLASS}>
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-3 h-3 rounded-full animate-pulse" style={{ background: '#34d399' }} />
          <h1 className="font-black text-xl" style={{ color: '#f0fdf4' }}>
            Deep Scan in Progress
          </h1>
          <span className="ml-auto text-xs font-mono px-2 py-1 rounded"
            style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(167,243,208,0.6)' }}>
            {row.domain}
          </span>
        </div>

        {/* Progress bar */}
        <div className="relative h-2 rounded-full mb-6 overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.08)' }}>
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{
              width: `${row.progress}%`,
              background: 'linear-gradient(90deg, #34d399, #6366f1)',
            }}
          />
        </div>
        <p className="text-sm mb-8" style={{ color: 'rgba(167,243,208,0.6)' }}>
          {row.current_step}
        </p>

        {/* Steps */}
        <div className="space-y-4">
          {steps.map((step, i) => {
            const done = row.progress >= step.pct;
            const active = i === activeIndex && !done;
            return (
              <div key={i} className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    background: done
                      ? 'rgba(52,211,153,0.15)'
                      : active
                      ? 'rgba(99,102,241,0.15)'
                      : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${done ? 'rgba(52,211,153,0.4)' : active ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.1)'}`,
                  }}>
                  {done ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : active ? (
                    <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2.5">
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                  ) : (
                    <div className="w-2 h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.2)' }} />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold" style={{ color: done ? '#34d399' : active ? '#f0fdf4' : 'rgba(167,243,208,0.35)' }}>
                    {step.label}
                  </p>
                  {step.tool && (
                    <p className="text-xs font-mono" style={{ color: 'rgba(167,243,208,0.3)' }}>{step.tool}</p>
                  )}
                </div>
                <span className="text-xs font-mono" style={{ color: 'rgba(167,243,208,0.35)' }}>
                  {step.pct}%
                </span>
              </div>
            );
          })}
        </div>

        {row.status === 'queued' && (
          <div className="mt-6 px-4 py-3 rounded-xl text-sm"
            style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', color: 'rgba(167,243,208,0.6)' }}>
            Scan is queued. The worker will pick it up in a few seconds...
          </div>
        )}
      </div>

      <p className="text-center text-xs mt-4" style={{ color: 'rgba(167,243,208,0.3)' }}>
        This page auto-refreshes. Deep scans typically take 5–15 minutes.
      </p>
    </div>
  );
}

// ─── Results screen ───────────────────────────────────────────────────────────

function ScanResults({ scan }: { scan: ScanResult }) {
  const [activeFilter, setActiveFilter] = useState('All');
  const totalFindings = Object.values(scan.stats.vulnerabilities).reduce((a, b) => a + b, 0);
  const riskColor = getRiskColor(scan.stats.riskScore);

  const filteredFindings = activeFilter === 'All'
    ? scan.findings
    : scan.findings.filter((f) => f.severity === activeFilter.toLowerCase());

  const FILTERS = [
    { label: 'All', count: scan.findings.length },
    { label: 'Critical', count: scan.stats.vulnerabilities.critical, color: '#ef4444' },
    { label: 'High', count: scan.stats.vulnerabilities.high, color: '#f59e0b' },
    { label: 'Medium', count: scan.stats.vulnerabilities.medium, color: '#6366f1' },
    { label: 'Low', count: scan.stats.vulnerabilities.low, color: '#22c55e' },
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard" className="text-sm font-medium flex items-center gap-1"
          style={{ color: 'rgba(167,243,208,0.55)' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Dashboard
        </Link>
        <span style={{ color: 'rgba(167,243,208,0.35)' }}>/</span>
        <span className="text-sm" style={{ color: 'rgba(167,243,208,0.55)' }}>Scan Results</span>
      </div>

      <div className="flex items-start justify-between mb-8 gap-6">
        <div>
          <h1 className="font-black text-3xl mb-2" style={{ color: '#f0fdf4' }}>{scan.domain}</h1>
          <p className="text-sm" style={{ color: 'rgba(167,243,208,0.55)' }}>
            Completed {new Date(scan.completedAt!).toLocaleString()} · {scan.stats.assetsDiscovered} assets · {totalFindings} findings
          </p>
          <div className="flex items-center gap-2 mt-2">
            {scan.id.startsWith('real_') && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
                style={{ background: 'rgba(52,211,153,0.12)', color: '#34d399', border: '1px solid rgba(52,211,153,0.25)' }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#34d399' }} />
                Quick Scan
              </span>
            )}
            {UUID_RE.test(scan.id) && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
                style={{ background: 'rgba(99,102,241,0.12)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.25)' }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#818cf8' }} />
                Deep Scan — nmap + nuclei + subfinder
              </span>
            )}
          </div>
        </div>
        <div className="px-4 py-2 rounded-xl text-sm font-bold flex-shrink-0"
          style={{ background: `${riskColor}15`, color: riskColor, border: `1px solid ${riskColor}30` }}>
          Risk: {scan.stats.riskScore} — {getRiskLabel(scan.stats.riskScore)}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Assets', value: scan.stats.assetsDiscovered, color: '#6366f1' },
          { label: 'Open Ports', value: scan.stats.portsScanned, color: '#0ea5e9' },
          { label: 'Critical', value: scan.stats.vulnerabilities.critical, color: '#ef4444' },
          { label: 'High', value: scan.stats.vulnerabilities.high, color: '#f59e0b' },
        ].map((s, i) => (
          <div key={i} className="rounded-2xl p-5" style={GLASS}>
            <p className="font-black text-3xl mb-1" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgba(167,243,208,0.55)' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Severity bar */}
      {totalFindings > 0 && (
        <div className="rounded-2xl p-5 mb-6 flex items-center gap-6 flex-wrap" style={GLASS}>
          {[
            { label: 'Critical', count: scan.stats.vulnerabilities.critical, color: '#ef4444' },
            { label: 'High', count: scan.stats.vulnerabilities.high, color: '#f59e0b' },
            { label: 'Medium', count: scan.stats.vulnerabilities.medium, color: '#6366f1' },
            { label: 'Low', count: scan.stats.vulnerabilities.low, color: '#22c55e' },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ background: s.color }} />
              <span className="font-black text-lg" style={{ color: s.color }}>{s.count}</span>
              <span className="text-sm" style={{ color: 'rgba(167,243,208,0.55)' }}>{s.label}</span>
            </div>
          ))}
          <div className="flex-1 h-2 rounded-full overflow-hidden ml-2" style={{ background: 'rgba(255,255,255,0.08)', minWidth: 120 }}>
            <div className="h-full flex">
              {[
                { c: scan.stats.vulnerabilities.critical, color: '#ef4444' },
                { c: scan.stats.vulnerabilities.high, color: '#f59e0b' },
                { c: scan.stats.vulnerabilities.medium, color: '#6366f1' },
                { c: scan.stats.vulnerabilities.low, color: '#22c55e' },
              ].filter((s) => s.c > 0).map((s, i) => (
                <div key={i} style={{ width: `${(s.c / totalFindings) * 100}%`, background: s.color }} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Findings table */}
      <div className="rounded-2xl overflow-hidden" style={GLASS}>
        <div className="flex items-center justify-between px-6 py-5"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <h2 className="font-bold text-base" style={{ color: '#f0fdf4' }}>
            Findings
            <span className="ml-2 text-sm font-normal" style={{ color: 'rgba(167,243,208,0.55)' }}>
              {filteredFindings.length} {activeFilter !== 'All' ? activeFilter.toLowerCase() : 'total'}
            </span>
          </h2>
          <div className="flex items-center gap-2 flex-wrap">
            {FILTERS.map((f) => (
              <button key={f.label} onClick={() => setActiveFilter(f.label)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                style={{
                  background: activeFilter === f.label ? 'rgba(52,211,153,0.15)' : 'rgba(255,255,255,0.06)',
                  color: activeFilter === f.label ? '#34d399' : 'rgba(167,243,208,0.55)',
                  border: activeFilter === f.label ? '1px solid rgba(52,211,153,0.3)' : '1px solid transparent',
                }}>
                {f.label} {f.count > 0 && <span style={{ opacity: 0.7 }}>({f.count})</span>}
              </button>
            ))}
          </div>
        </div>

        {filteredFindings.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p style={{ color: 'rgba(167,243,208,0.4)' }}>No {activeFilter.toLowerCase()} findings.</p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
            {filteredFindings.map((finding) => {
              const sc = getSeverityColor(finding.severity);
              // @ts-ignore — source field exists on deep scan findings
              const source: string | undefined = (finding as { source?: string }).source;
              return (
                <div key={finding.id} className="px-6 py-5 transition-colors"
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide"
                        style={{ background: `${sc}15`, color: sc }}>
                        {finding.severity}
                      </span>
                      {finding.cve && (
                        <span className="text-xs font-mono px-2 py-0.5 rounded"
                          style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(167,243,208,0.7)' }}>
                          {finding.cve}
                        </span>
                      )}
                      {finding.cvss !== undefined && (
                        <span className="text-xs font-semibold" style={{ color: 'rgba(167,243,208,0.55)' }}>
                          CVSS {finding.cvss}
                        </span>
                      )}
                      {source && (
                        <span className="text-xs px-2 py-0.5 rounded font-mono"
                          style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8' }}>
                          {source}
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-sm mb-1" style={{ color: '#f0fdf4' }}>{finding.title}</h3>
                    <p className="text-xs mb-3" style={{ color: 'rgba(167,243,208,0.55)' }}>
                      <span style={{ fontFamily: 'monospace' }}>{finding.asset}</span>
                      {finding.port !== undefined && <span> · Port {finding.port}</span>}
                    </p>
                    <p className="text-sm leading-relaxed mb-3" style={{ color: 'rgba(167,243,208,0.55)' }}>
                      {finding.description}
                    </p>
                    <div className="flex items-start gap-2 p-3 rounded-xl"
                      style={{ background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.15)' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2" className="flex-shrink-0 mt-0.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span style={{ color: 'rgba(167,243,208,0.7)', fontSize: '0.82rem' }}>
                        <strong style={{ color: '#34d399' }}>Fix: </strong>{finding.remediation}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ScanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const isDeepScan = UUID_RE.test(id);

  // For quick scans (legacy localStorage)
  const [quickScan, setQuickScan] = useState<ScanResult | undefined>(
    !isDeepScan ? getScan(id) : undefined
  );

  // For deep scans (Supabase polling)
  const [deepRow, setDeepRow] = useState<ScanRow | null>(null);
  const [pollError, setPollError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Quick scan: check localStorage on mount
  useEffect(() => {
    if (isDeepScan) return;
    try {
      const stored = localStorage.getItem(`scan_${id}`);
      if (stored) setQuickScan(JSON.parse(stored));
    } catch { /* ignore */ }
  }, [id, isDeepScan]);

  // Deep scan: poll API every 3 seconds until done
  useEffect(() => {
    if (!isDeepScan) return;

    const poll = async () => {
      try {
        const res = await fetch(`/api/scan/${id}`);
        if (!res.ok) {
          if (res.status === 404) setPollError('Scan not found.');
          return;
        }
        const row: ScanRow = await res.json();
        setDeepRow(row);
        if (row.status === 'completed' || row.status === 'failed') {
          if (intervalRef.current) clearInterval(intervalRef.current);
        }
      } catch {
        // network blip — keep polling
      }
    };

    poll();
    intervalRef.current = setInterval(poll, 3000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [id, isDeepScan]);

  // ── Error states ────────────────────────────────────────────────────────────

  if (pollError) {
    return (
      <div className="p-8 text-center mt-16">
        <p className="text-lg font-semibold mb-2" style={{ color: 'rgba(167,243,208,0.7)' }}>{pollError}</p>
        <Link href="/dashboard" className="px-5 py-2.5 rounded-xl font-bold text-sm" style={{ background: '#34d399', color: '#021a12' }}>
          ← Back
        </Link>
      </div>
    );
  }

  // ── Quick scan ──────────────────────────────────────────────────────────────

  if (!isDeepScan) {
    if (!quickScan) {
      return (
        <div className="p-8 text-center mt-16">
          <p style={{ color: 'rgba(167,243,208,0.55)' }}>Scan not found.</p>
          <Link href="/dashboard" style={{ color: '#34d399' }}>← Dashboard</Link>
        </div>
      );
    }
    return <ScanResults scan={quickScan} />;
  }

  // ── Deep scan ───────────────────────────────────────────────────────────────

  if (!deepRow) {
    return (
      <div className="p-8 text-center mt-16">
        <div className="animate-spin w-6 h-6 rounded-full border-2 mx-auto mb-3"
          style={{ borderColor: '#34d399', borderTopColor: 'transparent' }} />
        <p style={{ color: 'rgba(167,243,208,0.55)' }}>Loading scan...</p>
      </div>
    );
  }

  if (deepRow.status === 'failed') {
    return (
      <div className="p-8 max-w-xl mx-auto mt-16">
        <div className="rounded-2xl p-8 text-center" style={GLASS}>
          <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h2 className="font-bold text-lg mb-2" style={{ color: '#f0fdf4' }}>Scan Failed</h2>
          <p className="text-sm mb-4" style={{ color: 'rgba(167,243,208,0.55)' }}>
            {deepRow.error_message || 'An unexpected error occurred.'}
          </p>
          <Link href="/dashboard" className="px-5 py-2.5 rounded-xl font-bold text-sm inline-block"
            style={{ background: '#34d399', color: '#021a12' }}>
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (deepRow.status !== 'completed') {
    return <ScanProgress row={deepRow} />;
  }

  // Completed deep scan — convert DB row to ScanResult shape for reuse
  const completedScan: ScanResult = {
    id: deepRow.id,
    domain: deepRow.domain,
    status: 'completed',
    startedAt: deepRow.started_at ?? deepRow.created_at,
    completedAt: deepRow.completed_at ?? undefined,
    stats: deepRow.stats as ScanResult['stats'],
    findings: deepRow.findings as ScanResult['findings'],
  };

  return <ScanResults scan={completedScan} />;
}
