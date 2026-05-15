'use client';

import { useState } from 'react';
import Link from 'next/link';

const TARGETS = [
  {
    id: 't1', domain: 'acmecorp.com', type: 'External', status: 'active',
    issues: { critical: 3, high: 8, medium: 12, low: 5 },
    lastScan: '14 May 2025 09:30', nextScan: '15 May 2025 02:00',
    assets: 147, riskScore: 82, riskLabel: 'High',
    tags: ['Production', 'Priority'],
    subdomains: 34, openPorts: 12, ips: ['104.21.8.1', '104.21.8.2', '172.67.182.51'],
  },
  {
    id: 't2', domain: 'techstart.io', type: 'External', status: 'active',
    issues: { critical: 1, high: 3, medium: 7, low: 2 },
    lastScan: '13 May 2025 16:16', nextScan: '15 May 2025 02:00',
    assets: 43, riskScore: 61, riskLabel: 'Medium',
    tags: ['Production'],
    subdomains: 11, openPorts: 5, ips: ['185.53.177.10', '185.53.177.11'],
  },
  {
    id: 't3', domain: 'staging.acmecorp.com', type: 'External', status: 'active',
    issues: { critical: 0, high: 2, medium: 4, low: 8 },
    lastScan: '12 May 2025 10:00', nextScan: '15 May 2025 02:00',
    assets: 18, riskScore: 38, riskLabel: 'Low',
    tags: ['Staging'],
    subdomains: 4, openPorts: 3, ips: ['192.0.2.44'],
  },
  {
    id: 't4', domain: 'api.acmecorp.com', type: 'Web app', status: 'active',
    issues: { critical: 2, high: 5, medium: 3, low: 1 },
    lastScan: '14 May 2025 08:00', nextScan: '15 May 2025 02:00',
    assets: 8, riskScore: 74, riskLabel: 'High',
    tags: ['Production', 'API'],
    subdomains: 0, openPorts: 2, ips: ['104.21.9.5'],
  },
];

const SEV: Record<string, string> = { critical: '#ef4444', high: '#f59e0b', medium: '#3b82f6', low: '#34d399' };
const RISK_COLOR = (s: number) => s >= 75 ? '#ef4444' : s >= 50 ? '#f59e0b' : s >= 25 ? '#3b82f6' : '#34d399';

const GLASS: React.CSSProperties = {
  background: 'rgba(255,255,255,0.07)',
  backdropFilter: 'blur(18px)',
  WebkitBackdropFilter: 'blur(18px)',
  border: '1px solid rgba(255,255,255,0.13)',
  boxShadow: '0 4px 28px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.1)',
};

function RiskRing({ score }: { score: number }) {
  const color = RISK_COLOR(score);
  const r = 18, circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <svg width="44" height="44" viewBox="0 0 44 44">
      <circle cx="22" cy="22" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="4" />
      <circle cx="22" cy="22" r={r} fill="none" stroke={color} strokeWidth="4"
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        transform="rotate(-90 22 22)" style={{ filter: `drop-shadow(0 0 4px ${color}80)` }} />
      <text x="22" y="26" textAnchor="middle" fontSize="10" fontWeight="800" fill={color}>{score}</text>
    </svg>
  );
}

export default function TargetsPage() {
  const [showAdd, setShowAdd] = useState(false);
  const [newDomain, setNewDomain] = useState('');
  const [newType, setNewType] = useState('External');
  const [filter, setFilter] = useState('All');
  const [selected, setSelected] = useState<typeof TARGETS[0] | null>(null);
  const [search, setSearch] = useState('');

  const filtered = TARGETS.filter(t => {
    const matchFilter = filter === 'All' || t.status === filter.toLowerCase();
    const matchSearch = !search || t.domain.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const totalCritical = TARGETS.reduce((a, t) => a + t.issues.critical, 0);
  const totalAssets = TARGETS.reduce((a, t) => a + t.assets, 0);

  return (
    <div className="p-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-black text-2xl mb-1" style={{ color: '#f0fdf4' }}>Targets</h1>
          <p className="text-sm" style={{ color: 'rgba(167,243,208,0.5)' }}>
            {TARGETS.length} targets · {totalAssets} assets monitored
          </p>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="text-sm font-bold px-4 py-2.5 rounded-xl flex items-center gap-2"
          style={{ background: '#34d399', color: '#021a12' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add target
        </button>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total targets', value: TARGETS.length, color: '#34d399', sub: 'all active' },
          { label: 'Total assets', value: totalAssets, color: '#7dd3fc', sub: 'across all targets' },
          { label: 'Critical issues', value: totalCritical, color: '#ef4444', sub: 'need immediate action' },
          { label: 'Avg risk score', value: Math.round(TARGETS.reduce((a, t) => a + t.riskScore, 0) / TARGETS.length), color: '#f59e0b', sub: 'across all targets' },
        ].map((s, i) => (
          <div key={i} className="rounded-2xl px-5 py-4" style={GLASS}>
            <p className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: 'rgba(167,243,208,0.45)' }}>{s.label}</p>
            <p className="font-black text-2xl" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs mt-1" style={{ color: 'rgba(167,243,208,0.4)' }}>{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Add target modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(2,26,18,0.85)', backdropFilter: 'blur(6px)' }}>
          <div className="rounded-2xl p-8 w-full max-w-md mx-4" style={GLASS}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-black text-xl" style={{ color: '#f0fdf4' }}>Add New Target</h2>
                <p className="text-sm mt-1" style={{ color: 'rgba(167,243,208,0.5)' }}>Vyzor will start monitoring immediately.</p>
              </div>
              <button onClick={() => setShowAdd(false)} style={{ color: 'rgba(167,243,208,0.4)' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'rgba(167,243,208,0.7)' }}>Domain or IP address</label>
                <input type="text" placeholder="example.com or 192.168.1.1"
                  value={newDomain} onChange={e => setNewDomain(e.target.value)}
                  className="scan-input w-full rounded-xl px-4 py-3 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'rgba(167,243,208,0.7)' }}>Target type</label>
                <select value={newType} onChange={e => setNewType(e.target.value)}
                  className="scan-input w-full rounded-xl px-4 py-3 text-sm">
                  <option>External</option><option>Internal</option><option>Web app</option><option>Cloud account</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'rgba(167,243,208,0.7)' }}>Tags (optional)</label>
                <input type="text" placeholder="Production, API, Priority…"
                  className="scan-input w-full rounded-xl px-4 py-3 text-sm" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowAdd(false)}
                className="flex-1 py-3 rounded-xl text-sm font-bold"
                style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(167,243,208,0.6)', border: '1px solid rgba(255,255,255,0.1)' }}>
                Cancel
              </button>
              <button onClick={() => { setShowAdd(false); setNewDomain(''); }}
                className="flex-1 py-3 rounded-xl text-sm font-bold"
                style={{ background: '#34d399', color: '#021a12' }}>
                Add &amp; Scan now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
          {['All', 'Active', 'Not scanned', 'Unresponsive'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className="px-4 py-1.5 rounded-lg text-sm font-medium transition-all"
              style={{
                background: filter === f ? 'rgba(52,211,153,0.12)' : 'transparent',
                color: filter === f ? '#34d399' : 'rgba(167,243,208,0.5)',
              }}>
              {f} {f === 'All' && <span className="ml-1 text-xs font-bold" style={{ color: '#34d399' }}>{TARGETS.length}</span>}
            </button>
          ))}
        </div>
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(167,243,208,0.4)" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input type="text" placeholder="Search targets…" value={search} onChange={e => setSearch(e.target.value)}
            className="scan-input rounded-xl pl-9 pr-4 py-2 text-sm" style={{ width: '200px' }} />
        </div>
      </div>

      {/* Main layout: table + detail */}
      <div className="flex gap-4">

        {/* Table */}
        <div className="rounded-2xl overflow-hidden flex-1 min-w-0" style={GLASS}>

          {/* Header row */}
          <div className="px-6 py-3 grid text-xs font-bold uppercase tracking-wide"
            style={{
              gridTemplateColumns: '2fr 1fr 1fr 1.5fr 1.5fr 120px',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              background: 'rgba(255,255,255,0.04)',
              color: 'rgba(167,243,208,0.4)',
            }}>
            <span>Target</span>
            <span>Type</span>
            <span>Risk</span>
            <span>Issues</span>
            <span>Last scan</span>
            <span>Actions</span>
          </div>

          {filtered.map((target, i) => (
            <div key={target.id}
              className="px-6 py-4 grid items-center cursor-pointer transition-all"
              style={{
                gridTemplateColumns: '2fr 1fr 1fr 1.5fr 1.5fr 120px',
                borderBottom: i < filtered.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                background: selected?.id === target.id ? 'rgba(52,211,153,0.07)' : 'transparent',
                borderLeft: selected?.id === target.id ? '3px solid #34d399' : '3px solid transparent',
              }}
              onClick={() => setSelected(s => s?.id === target.id ? null : target)}
              onMouseEnter={e => { if (selected?.id !== target.id) e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
              onMouseLeave={e => { if (selected?.id !== target.id) e.currentTarget.style.background = 'transparent'; }}
            >
              {/* Target */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.15)' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="1.8">
                    <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm" style={{ color: '#f0fdf4' }}>{target.domain}</p>
                  <p className="text-xs font-mono mt-0.5" style={{ color: 'rgba(167,243,208,0.4)' }}>{target.assets} assets · {target.subdomains} subdomains</p>
                </div>
              </div>

              {/* Type */}
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full w-fit"
                style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(167,243,208,0.6)' }}>
                {target.type}
              </span>

              {/* Risk */}
              <div className="flex items-center gap-2">
                <RiskRing score={target.riskScore} />
                <span className="text-xs font-semibold" style={{ color: RISK_COLOR(target.riskScore) }}>{target.riskLabel}</span>
              </div>

              {/* Issues */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {(Object.entries(target.issues) as [string, number][])
                  .filter(([, v]) => v > 0)
                  .map(([k, v]) => (
                    <span key={k} className="text-xs font-bold px-1.5 py-0.5 rounded"
                      style={{ background: `${SEV[k]}15`, color: SEV[k] }}>
                      {v} {k.charAt(0).toUpperCase()}
                    </span>
                  ))}
              </div>

              {/* Last scan */}
              <div>
                <p className="text-xs" style={{ color: 'rgba(167,243,208,0.55)' }}>{target.lastScan}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#34d399' }} />
                  <p className="text-xs" style={{ color: 'rgba(167,243,208,0.4)' }}>Next: {target.nextScan.split(' ').slice(-1)}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                <button className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
                  style={{ background: 'rgba(52,211,153,0.08)', color: '#34d399', border: '1px solid rgba(52,211,153,0.2)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(52,211,153,0.15)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(52,211,153,0.08)'}>
                  Scan
                </button>
                <button style={{ color: 'rgba(167,243,208,0.4)' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#f0fdf4'}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(167,243,208,0.4)'}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Detail panel */}
        {selected && (
          <div className="rounded-2xl overflow-hidden flex-shrink-0" style={{ ...GLASS, width: '300px' }}>
            <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wide" style={{ color: 'rgba(167,243,208,0.4)' }}>Target details</span>
                <button onClick={() => setSelected(null)} style={{ color: 'rgba(167,243,208,0.4)' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="1.8">
                    <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                  </svg>
                </div>
                <div>
                  <p className="font-bold text-sm" style={{ color: '#f0fdf4' }}>{selected.domain}</p>
                  <p className="text-xs" style={{ color: 'rgba(167,243,208,0.45)' }}>{selected.type}</p>
                </div>
              </div>
            </div>

            <div className="px-5 py-4 space-y-4">
              {/* Risk score */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: 'rgba(167,243,208,0.4)' }}>Risk Score</p>
                  <p className="font-black text-3xl" style={{ color: RISK_COLOR(selected.riskScore) }}>{selected.riskScore}</p>
                  <p className="text-xs font-semibold" style={{ color: RISK_COLOR(selected.riskScore) }}>{selected.riskLabel} Risk</p>
                </div>
                <RiskRing score={selected.riskScore} />
              </div>

              {/* Issues breakdown */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'rgba(167,243,208,0.4)' }}>Issues</p>
                <div className="space-y-2">
                  {(Object.entries(selected.issues) as [string, number][]).map(([sev, count]) => (
                    <div key={sev} className="flex items-center gap-2">
                      <span className="text-xs font-semibold capitalize w-16" style={{ color: SEV[sev] }}>{sev}</span>
                      <div className="flex-1 rounded-full h-1.5" style={{ background: 'rgba(255,255,255,0.08)' }}>
                        <div className="h-1.5 rounded-full" style={{
                          width: `${(count / (selected.issues.critical + selected.issues.high + selected.issues.medium + selected.issues.low || 1)) * 100}%`,
                          background: SEV[sev],
                        }} />
                      </div>
                      <span className="text-xs font-bold w-5 text-right" style={{ color: 'rgba(167,243,208,0.6)' }}>{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Assets', value: selected.assets },
                  { label: 'Subdomains', value: selected.subdomains },
                  { label: 'Open ports', value: selected.openPorts },
                  { label: 'IPs', value: selected.ips.length },
                ].map(s => (
                  <div key={s.label} className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <p className="text-xs" style={{ color: 'rgba(167,243,208,0.4)' }}>{s.label}</p>
                    <p className="font-black text-lg" style={{ color: '#f0fdf4' }}>{s.value}</p>
                  </div>
                ))}
              </div>

              {/* IPs */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'rgba(167,243,208,0.4)' }}>IP Addresses</p>
                <div className="space-y-1">
                  {selected.ips.map(ip => (
                    <p key={ip} className="text-xs font-mono px-2 py-1 rounded-lg"
                      style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(167,243,208,0.65)' }}>{ip}</p>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5">
                {selected.tags.map(tag => (
                  <span key={tag} className="text-xs font-semibold px-2.5 py-1 rounded-full"
                    style={{ background: 'rgba(52,211,153,0.08)', color: '#34d399', border: '1px solid rgba(52,211,153,0.2)' }}>
                    {tag}
                  </span>
                ))}
              </div>

              {/* Actions */}
              <div className="space-y-2 pt-1">
                <Link href="/dashboard/scans"
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-bold"
                  style={{ background: '#34d399', color: '#021a12' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polygon points="5 3 19 12 5 21 5 3"/>
                  </svg>
                  Scan now
                </Link>
                <Link href="/dashboard/vulnerabilities"
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-bold"
                  style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(167,243,208,0.7)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  View all issues →
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
