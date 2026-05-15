'use client';

import { useState } from 'react';

const ISSUES = [
  { id: 1, title: 'Insecure TLS Ciphers', severity: 'Medium', occurrences: 3, target: 'www.uir.ac.ma', hygiene: true, cvss: 5.3, epss: 0.002 },
  { id: 2, title: 'Insecure SSH Ciphers', severity: 'Medium', occurrences: 6, target: 'www.uir.ac.ma', hygiene: true, cvss: 5.3, epss: 0.001 },
  { id: 3, title: 'Insecure SSH Integrity Settings', severity: 'Low', occurrences: 2, target: 'www.uir.ac.ma', hygiene: true, cvss: 3.7, epss: 0.001 },
  { id: 4, title: 'Weak SSH Key Exchange Algorithms Supported', severity: 'Low', occurrences: 1, target: 'www.uir.ac.ma:22', hygiene: true, cvss: 3.1, epss: 0.001 },
  { id: 5, title: 'Open RDP Port Exposed', severity: 'High', occurrences: 1, target: 'acmecorp.com', hygiene: false, cvss: 7.4, epss: 0.12 },
  { id: 6, title: 'Apache Log4j RCE (Log4Shell)', severity: 'Critical', occurrences: 2, target: 'techstart.io', hygiene: false, cvss: 10.0, epss: 0.97, cve: 'CVE-2021-44228' },
];

const NOISE_ITEMS = [
  'Web Application Scanning Consolidation / Info Reporting',
  'CPE Inventory',
  'Host Summary',
  'Hostname Determination Reporting',
  'OS Detection Consolidation and Reporting',
  'Services',
  'TCP Timestamps Information Disclosure',
  'Traceroute',
  'SSL/TLS: Report Non Weak Cipher Suites',
  'SSL/TLS: Report Medium Cipher Suites',
];

const SEV_COLOR: Record<string, string> = {
  Critical: '#ef4444',
  High: '#f59e0b',
  Medium: '#3b82f6',
  Low: '#22c55e',
};

function SeverityBadge({ severity }: { severity: string }) {
  const color = SEV_COLOR[severity] ?? '#94a3b8';
  return (
    <span className="text-xs font-bold px-2 py-0.5 rounded-full"
      style={{ background: `${color}15`, color }}>
      {severity}
    </span>
  );
}

export default function VulnerabilitiesPage() {
  const [tab, setTab] = useState<'current' | 'fixed' | 'snoozed' | 'noise'>('current');
  const [selected, setSelected] = useState<typeof ISSUES[0] | null>(null);
  const [severityFilter, setSeverityFilter] = useState('All');

  const filtered = ISSUES.filter(i => severityFilter === 'All' || i.severity === severityFilter);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-black text-2xl" style={{ color: '#0f172a' }}>Issues</h1>
        <div className="flex items-center gap-2">
          <button className="text-xs font-semibold px-3 py-2 rounded-lg flex items-center gap-1.5"
            style={{ background: '#f1f5f9', color: '#475569' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            View all checks
          </button>
          <button className="text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2"
            style={{ background: '#6366f1', color: '#fff' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m14.5 2-8.5 8.5 1.5 1.5 8.5-8.5-1.5-1.5z"/><path d="m7 14-5 5"/><path d="m15.5 4.5 4 4"/></svg>
            New pentest
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-0 mb-6" style={{ borderBottom: '1px solid #f1f5f9' }}>
        {([
          { key: 'current', label: 'Current', count: ISSUES.length },
          { key: 'fixed', label: 'Fixed', count: null },
          { key: 'snoozed', label: 'Snoozed', count: null },
          { key: 'noise', label: 'Noise', count: NOISE_ITEMS.length },
        ] as const).map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className="px-4 py-2.5 text-sm font-semibold flex items-center gap-1.5 transition-all"
            style={{
              color: tab === t.key ? '#6366f1' : '#64748b',
              borderBottom: tab === t.key ? '2px solid #6366f1' : '2px solid transparent',
              marginBottom: '-1px',
            }}>
            {t.label}
            {t.count !== null && (
              <span className="text-xs font-bold px-1.5 py-0.5 rounded-full"
                style={{ background: tab === t.key ? 'rgba(99,102,241,0.1)' : '#f1f5f9', color: tab === t.key ? '#6366f1' : '#94a3b8' }}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === 'current' && (
        <>
          {/* Noise notice */}
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl mb-4 text-sm"
            style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <span style={{ color: '#475569' }}>We detected <strong style={{ color: '#0f172a' }}>23 more items</strong> but filtered these as noise. <span style={{ color: '#6366f1', cursor: 'pointer' }}>Learn more about noise filtering</span></span>
          </div>

          {/* Filter bar */}
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <span className="text-xs font-semibold" style={{ color: '#64748b' }}>{filtered.length} issues · {filtered.reduce((a, i) => a + i.occurrences, 0)} occurrences</span>
            <div className="ml-auto flex items-center gap-2">
              <input type="text" placeholder="Search" className="scan-input rounded-lg px-3 py-1.5 text-xs" style={{ width: '160px' }} />
              {['All', 'Critical', 'High', 'Medium', 'Low'].map(s => (
                <button key={s} onClick={() => setSeverityFilter(s)}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
                  style={{
                    background: severityFilter === s ? (s === 'All' ? 'rgba(99,102,241,0.1)' : `${SEV_COLOR[s]}15`) : '#f1f5f9',
                    color: severityFilter === s ? (s === 'All' ? '#6366f1' : SEV_COLOR[s]) : '#64748b',
                  }}>
                  {s}
                </button>
              ))}
              <button className="text-xs font-semibold px-3 py-1.5 rounded-lg" style={{ background: '#f1f5f9', color: '#64748b' }}>Export</button>
            </div>
          </div>

          {/* Issue list + detail panel */}
          <div className="flex gap-4">
            <div className="card-glass rounded-2xl overflow-hidden" style={{ flex: selected ? '0 0 55%' : '1' }}>
              {filtered.map((issue, i) => (
                <div key={issue.id} onClick={() => setSelected(issue)}
                  className="px-5 py-4 cursor-pointer transition-colors hover:bg-gray-50"
                  style={{
                    borderBottom: i < filtered.length - 1 ? '1px solid #f8fafc' : 'none',
                    background: selected?.id === issue.id ? 'rgba(99,102,241,0.04)' : undefined,
                    borderLeft: selected?.id === issue.id ? '3px solid #6366f1' : '3px solid transparent',
                  }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ flexShrink: 0, color: '#94a3b8' }}><polyline points="9 18 15 12 9 6"/></svg>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm truncate" style={{ color: '#0f172a' }}>{issue.title}</p>
                        <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>
                          {issue.occurrences} occurrence{issue.occurrences !== 1 ? 's' : ''} · <span style={{ fontFamily: 'monospace' }}>{issue.target}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                      <SeverityBadge severity={issue.severity} />
                      {issue.cvss && <span className="text-xs" style={{ color: '#94a3b8' }}>CVSS {issue.cvss}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Detail panel */}
            {selected && (
              <div className="card-glass rounded-2xl p-6 flex-1 min-w-0">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <SeverityBadge severity={selected.severity} />
                      {selected.cve && <span className="text-xs font-mono" style={{ color: '#94a3b8' }}>{selected.cve}</span>}
                      {selected.cvss && <span className="text-xs font-semibold" style={{ color: '#94a3b8' }}>CVSS {selected.cvss}</span>}
                    </div>
                    <h3 className="font-black text-base" style={{ color: '#0f172a' }}>{selected.title}</h3>
                  </div>
                  <button onClick={() => setSelected(null)} style={{ color: '#94a3b8' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Target', value: selected.target },
                      { label: 'Occurrences', value: selected.occurrences.toString() },
                      { label: 'CVSS Score', value: selected.cvss?.toString() ?? '—' },
                      { label: 'EPSS', value: selected.epss ? `${(selected.epss * 100).toFixed(1)}%` : '—' },
                    ].map(({ label, value }) => (
                      <div key={label} className="rounded-xl p-3" style={{ background: '#f8fafc' }}>
                        <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: '#94a3b8' }}>{label}</p>
                        <p className="text-sm font-semibold" style={{ color: '#0f172a', fontFamily: label === 'Target' ? 'monospace' : undefined }}>{value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 rounded-xl" style={{ background: 'rgba(99,102,241,0.04)', border: '1px solid rgba(99,102,241,0.1)' }}>
                    <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: '#6366f1' }}>Remediation</p>
                    <p className="text-sm" style={{ color: '#475569' }}>
                      Update your server configuration to disable weak cipher suites. Ensure TLS 1.2+ is enforced and remove any deprecated algorithms from the accepted cipher list.
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button className="flex-1 py-2 rounded-xl text-xs font-bold transition-all"
                      style={{ background: 'rgba(99,102,241,0.08)', color: '#6366f1' }}>
                      Snooze
                    </button>
                    <button className="flex-1 py-2 rounded-xl text-xs font-bold text-white"
                      style={{ background: '#6366f1' }}>
                      Start pentest
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {tab === 'fixed' && (
        <div className="card-glass rounded-2xl p-16 text-center">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: '#f1f5f9' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <p className="font-bold text-base mb-1" style={{ color: '#0f172a' }}>Any fixed issues will appear here</p>
          <p className="text-sm mb-4" style={{ color: '#94a3b8' }}>Once an issue is resolved and confirmed in a new scan, it moves here.</p>
          <button className="btn-primary text-white text-sm font-bold px-6 py-2.5 rounded-xl">
            Take me to the Scans page →
          </button>
        </div>
      )}

      {tab === 'snoozed' && (
        <div className="card-glass rounded-2xl p-16 text-center">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: '#f1f5f9' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/><line x1="9" y1="9" x2="15" y2="9"/></svg>
          </div>
          <p className="font-bold text-base mb-1" style={{ color: '#0f172a' }}>No snoozed issues</p>
          <p className="text-sm" style={{ color: '#94a3b8' }}>You can optionally snooze issues that you don't consider a problem.</p>
        </div>
      )}

      {tab === 'noise' && (
        <>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm font-semibold" style={{ color: '#64748b' }}>{NOISE_ITEMS.length} noise items</span>
            <div className="ml-auto flex gap-2">
              <select className="scan-input rounded-lg px-3 py-1.5 text-xs" style={{ color: '#475569' }}>
                <option>Tag</option>
              </select>
              <select className="scan-input rounded-lg px-3 py-1.5 text-xs" style={{ color: '#475569' }}>
                <option>Target</option>
              </select>
              <button className="text-xs font-semibold px-2 py-1.5" style={{ color: '#94a3b8' }}>What is noise?</button>
            </div>
          </div>
          <div className="card-glass rounded-2xl overflow-hidden">
            {NOISE_ITEMS.map((item, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-4 hover:bg-gray-50 transition-colors cursor-pointer"
                style={{ borderBottom: i < NOISE_ITEMS.length - 1 ? '1px solid #f8fafc' : 'none' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: '#94a3b8', flexShrink: 0 }}><polyline points="9 18 15 12 9 6"/></svg>
                <div>
                  <p className="text-sm font-semibold" style={{ color: '#0f172a' }}>{item}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#94a3b8', fontFamily: 'monospace' }}>Noise · www.uir.ac.ma</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
