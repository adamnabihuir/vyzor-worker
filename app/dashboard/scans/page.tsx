'use client';

import { useState } from 'react';
import Link from 'next/link';

const COMPLETED_SCANS = [
  { id: 'scan_001', name: 'Team scan', type: 'Balanced scan', targets: '2 of 2 targets scanned', result: 'issues', issues: 11, date: '14 May 2026 09:30' },
  { id: 'scan_002', name: 'One-off scan', type: 'Balanced scan', targets: '1 of 1 target scanned', result: 'issues', issues: 4, date: '12 May 2026 16:16' },
  { id: 'scan_003', name: 'Weekly scan', type: 'Quick scan', targets: '2 of 2 targets scanned', result: 'clean', issues: 0, date: '5 May 2026 02:00' },
];

const SCHEDULED = [
  { name: 'Weekly scan', cron: 'Repeats weekly', targets: 'All targets', next: '15 May 2026 02:00' },
];

export default function ScansPage() {
  const [tab, setTab] = useState<'team' | 'ets' | 'settings'>('team');
  const [etsDismissed, setEtsDismissed] = useState(false);
  const [monitoringFeatures, setMonitoringFeatures] = useState({ ets: true, network: true, newService: false });

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-black text-2xl" style={{ color: '#0f172a' }}>Scans</h1>
        <div className="flex items-center gap-2">
          <button className="text-sm font-bold px-4 py-2.5 rounded-xl flex items-center gap-2"
            style={{ background: '#f1f5f9', color: '#475569' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            Schedule scan
          </button>
          <button className="btn-primary text-white text-sm font-bold px-4 py-2.5 rounded-xl flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            Scan now
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-0 mb-6" style={{ borderBottom: '1px solid #f1f5f9' }}>
        {[
          { key: 'team', label: 'Team' },
          { key: 'ets', label: 'Emerging threats' },
          { key: 'settings', label: 'Settings' },
        ].map((t: { key: string; label: string }) => (
          <button key={t.key} onClick={() => setTab(t.key as typeof tab)}
            className="px-4 py-2.5 text-sm font-semibold transition-all"
            style={{
              color: tab === t.key ? '#6366f1' : '#64748b',
              borderBottom: tab === t.key ? '2px solid #6366f1' : '2px solid transparent',
              marginBottom: '-1px',
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'team' && (
        <div className="flex gap-6">
          {/* Main content */}
          <div className="flex-1 min-w-0 space-y-6">
            {/* In Progress */}
            <div className="card-glass rounded-2xl overflow-hidden">
              <div className="px-6 py-4" style={{ borderBottom: '1px solid #f1f5f9' }}>
                <h2 className="font-bold text-sm" style={{ color: '#0f172a' }}>In progress</h2>
              </div>
              <div className="px-6 py-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold uppercase tracking-wide" style={{ color: '#94a3b8', flex: 1 }}>Scan</span>
                </div>
                <span className="text-xs font-bold uppercase tracking-wide" style={{ color: '#94a3b8' }}>Progress</span>
              </div>
              <div className="px-6 py-8 text-center" style={{ borderTop: '1px solid #f8fafc' }}>
                <p className="text-sm" style={{ color: '#94a3b8' }}>No items</p>
              </div>
            </div>

            {/* Completed */}
            <div className="card-glass rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid #f1f5f9' }}>
                <h2 className="font-bold text-sm" style={{ color: '#0f172a' }}>Completed</h2>
              </div>
              {/* Filters */}
              <div className="px-6 py-3 flex items-center gap-2" style={{ borderBottom: '1px solid #f8fafc', background: '#fafafa' }}>
                <input type="text" placeholder="Search" className="scan-input rounded-lg px-3 py-1.5 text-xs" style={{ width: '160px' }} />
                <select className="scan-input rounded-lg px-3 py-1.5 text-xs" style={{ color: '#475569' }}>
                  <option>Scan type</option><option>Balanced scan</option><option>Quick scan</option>
                </select>
                <select className="scan-input rounded-lg px-3 py-1.5 text-xs" style={{ color: '#475569' }}>
                  <option>Result</option><option>Issues found</option><option>Clean</option>
                </select>
                <input type="date" className="scan-input rounded-lg px-3 py-1.5 text-xs" placeholder="From" />
                <input type="date" className="scan-input rounded-lg px-3 py-1.5 text-xs" placeholder="To" />
              </div>

              {/* Table header */}
              <div className="px-6 py-3 flex items-center gap-4" style={{ borderBottom: '1px solid #f8fafc', background: '#fafafa' }}>
                <span className="text-xs font-bold uppercase tracking-wide flex-1" style={{ color: '#94a3b8' }}>Scan</span>
                <span className="text-xs font-bold uppercase tracking-wide" style={{ color: '#94a3b8', width: '120px' }}>Result</span>
              </div>

              {COMPLETED_SCANS.map((scan, i) => (
                <div key={scan.id} className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors"
                  style={{ borderBottom: i < COMPLETED_SCANS.length - 1 ? '1px solid #f8fafc' : 'none' }}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                      <Link href={`/dashboard/scans/${scan.id}`} className="text-sm font-semibold hover:underline" style={{ color: '#0f172a' }}>
                        {scan.name}
                      </Link>
                    </div>
                    <p className="text-xs" style={{ color: '#94a3b8' }}>
                      <span className="font-medium" style={{ color: '#6366f1' }}>{scan.type}</span> · {scan.targets} · {scan.date}
                    </p>
                  </div>
                  <div className="flex items-center gap-2" style={{ width: '120px' }}>
                    {scan.result === 'issues' ? (
                      <span className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: '#f59e0b' }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                        {scan.issues} issues found
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: '#22c55e' }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                        Clean
                      </span>
                    )}
                    <button style={{ color: '#94a3b8', marginLeft: 'auto' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Scheduled sidebar */}
          <div style={{ width: '280px', flexShrink: 0 }}>
            <div className="card-glass rounded-2xl overflow-hidden">
              <div className="px-5 py-4" style={{ borderBottom: '1px solid #f1f5f9' }}>
                <h2 className="font-bold text-sm" style={{ color: '#0f172a' }}>Scheduled</h2>
              </div>
              {SCHEDULED.map((s, i) => (
                <div key={i} className="px-5 py-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                        <span className="text-xs" style={{ color: '#94a3b8' }}>{s.next}</span>
                      </div>
                      <p className="font-semibold text-sm mb-1" style={{ color: '#0f172a' }}>{s.name}</p>
                      <div className="flex items-center gap-1">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>
                        <span className="text-xs" style={{ color: '#94a3b8' }}>{s.cron}</span>
                        <span className="text-xs" style={{ color: '#94a3b8' }}>· {s.targets}</span>
                      </div>
                    </div>
                    <button style={{ color: '#94a3b8' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'ets' && (
        <div>
          {!etsDismissed && (
            <div className="flex items-start gap-3 px-5 py-4 rounded-xl mb-6 text-sm"
              style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" className="flex-shrink-0 mt-0.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <div className="flex-1">
                <p className="font-semibold mb-0.5" style={{ color: '#0f172a' }}>What is an Emerging Threat Scan (ETS)?</p>
                <p style={{ color: '#475569' }}>When Vyzor discovers a new threat, we'll automatically scan all your licensed targets.</p>
                <span className="text-xs font-semibold" style={{ color: '#6366f1', cursor: 'pointer' }}>Learn more about ETS</span>
              </div>
              <button onClick={() => setEtsDismissed(true)} style={{ color: '#94a3b8', flexShrink: 0 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
          )}
          <div className="card-glass rounded-2xl p-16 text-center">
            <div className="text-5xl mb-4">🛡️</div>
            <p className="font-bold text-base mb-2" style={{ color: '#0f172a' }}>No new vulnerabilities</p>
            <p className="text-sm mb-4" style={{ color: '#94a3b8', maxWidth: '400px', margin: '0 auto 16px' }}>
              As soon as we identify a new vulnerability that could critically affect your systems, we'll automatically scan all your external targets.
            </p>
            <span className="text-xs font-semibold" style={{ color: '#6366f1', cursor: 'pointer' }}>Learn more about ETS</span>
          </div>
        </div>
      )}

      {tab === 'settings' && (
        <div className="max-w-2xl space-y-6">
          {/* Monitoring features */}
          <div className="card-glass rounded-2xl overflow-hidden">
            <div className="px-6 py-5" style={{ borderBottom: '1px solid #f1f5f9' }}>
              <h2 className="font-bold text-sm" style={{ color: '#0f172a' }}>Monitoring features</h2>
              <p className="text-xs mt-1" style={{ color: '#94a3b8' }}>Automatic scans that keep your targets monitored</p>
              <div className="flex items-center gap-2 mt-2">
                <div className="w-2 h-2 rounded-full" style={{ background: '#22c55e' }} />
                <span className="text-xs font-semibold" style={{ color: '#22c55e' }}>2/2 monitoring features enabled</span>
              </div>
            </div>
            <div className="px-6 py-5 space-y-4">
              {[
                { key: 'ets', icon: '⚡', label: 'Emerging threat scans', desc: 'Automatically scan all targets for newly discovered threats' },
                { key: 'network', icon: '🖥️', label: 'Network scans', desc: 'Network scanning is recommended and essential for Smart Recon to function' },
                { key: 'newService', icon: '🔍', label: 'New service scans', desc: 'Automated scans when new services are detected. Changes to existing services will not trigger this' },
              ].map(feat => (
                <div key={feat.key} className="flex items-start justify-between gap-4 p-4 rounded-xl"
                  style={{ background: monitoringFeatures[feat.key as keyof typeof monitoringFeatures] ? 'rgba(99,102,241,0.04)' : '#fafafa', border: '1px solid #f1f5f9' }}>
                  <div className="flex items-start gap-3">
                    <span className="text-lg">{feat.icon}</span>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: '#0f172a' }}>{feat.label}</p>
                      <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>{feat.desc}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setMonitoringFeatures(p => ({ ...p, [feat.key]: !p[feat.key as keyof typeof p] }))}
                    className="relative flex-shrink-0 w-11 h-6 rounded-full transition-all"
                    style={{ background: monitoringFeatures[feat.key as keyof typeof monitoringFeatures] ? '#6366f1' : '#e2e8f0' }}>
                    <span className="absolute top-1 transition-all w-4 h-4 rounded-full bg-white shadow"
                      style={{ left: monitoringFeatures[feat.key as keyof typeof monitoringFeatures] ? '24px' : '4px' }} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Scanner access */}
          <div className="card-glass rounded-2xl overflow-hidden">
            <div className="px-6 py-5" style={{ borderBottom: '1px solid #f1f5f9' }}>
              <h2 className="font-bold text-sm" style={{ color: '#0f172a' }}>Scanner access</h2>
              <p className="text-xs mt-1" style={{ color: '#94a3b8' }}>Ensure Vyzor's scanners can reach all your targets</p>
            </div>
            <div className="px-6 py-5 space-y-5">
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#374151' }}>Scan region</label>
                <p className="text-xs mb-2" style={{ color: '#94a3b8' }}>Select a region close to your targets for faster scans</p>
                <select className="scan-input w-full rounded-xl px-4 py-3 text-sm" style={{ color: '#475569' }}>
                  <option>Europe (London)</option>
                  <option>US East (Virginia)</option>
                  <option>US West (Oregon)</option>
                  <option>Asia Pacific (Singapore)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#374151' }}>Allowlist IPs</label>
                <p className="text-xs mb-2" style={{ color: '#94a3b8' }}>Add these IPs to your firewall or WAF allowlist</p>
                <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background: '#f8fafc', border: '1px solid #e2e8f0', fontFamily: 'monospace', fontSize: '0.75rem', color: '#475569' }}>
                  <span className="flex-1">18.98.162.96/29, 64.52.19.0/24, 18.168.180.128/25, 18.168.224.128/25</span>
                  <button style={{ color: '#6366f1' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Scan prioritisation */}
          <div className="card-glass rounded-2xl overflow-hidden">
            <div className="px-6 py-5" style={{ borderBottom: '1px solid #f1f5f9' }}>
              <h2 className="font-bold text-sm" style={{ color: '#0f172a' }}>Scan prioritisation</h2>
              <p className="text-xs mt-1" style={{ color: '#94a3b8' }}>Prioritise scan speed or depth</p>
            </div>
            <div className="px-6 py-5 space-y-3">
              {[
                { value: 'balanced', label: 'Balanced scans (recommended)', desc: 'Strike the balance between scan time and detecting more vulnerabilities' },
                { value: 'quick', label: 'Quick scans', desc: 'Shorter scan time but may not find all vulnerabilities' },
              ].map(opt => (
                <label key={opt.value} className="flex items-start gap-3 p-4 rounded-xl cursor-pointer"
                  style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <input type="radio" name="priority" defaultChecked={opt.value === 'balanced'} className="mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold" style={{ color: '#0f172a' }}>{opt.label}</p>
                    <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>{opt.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
