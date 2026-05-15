'use client';

import { useState } from 'react';

function MetricCard({ title, value, sub, color, chart }: { title: string; value: string | number; sub?: string; color?: string; chart?: React.ReactNode }) {
  return (
    <div className="card-glass rounded-2xl p-5">
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-bold uppercase tracking-wide" style={{ color: '#94a3b8' }}>{title}</p>
        <button style={{ color: '#94a3b8' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        </button>
      </div>
      <p className="font-black text-3xl mb-1" style={{ color: color ?? '#0f172a' }}>{value}</p>
      {sub && <p className="text-xs" style={{ color: '#94a3b8' }}>{sub}</p>}
      {chart}
    </div>
  );
}

function MiniBar({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-xs font-semibold w-16" style={{ color }}>{label}</span>
      <div className="flex-1 mx-3 h-1.5 rounded-full" style={{ background: '#f1f5f9' }}>
        <div className="h-1.5 rounded-full" style={{ background: color, width: count > 0 ? `${Math.max(count * 15, 4)}%` : '0%' }} />
      </div>
      <span className="text-xs font-bold w-6 text-right" style={{ color: '#64748b' }}>{count}</span>
    </div>
  );
}

export default function ReportsPage() {
  const [groupByIssue, setGroupByIssue] = useState(true);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-black text-2xl" style={{ color: '#0f172a' }}>Reports</h1>
        <button className="btn-primary text-white text-sm font-bold px-4 py-2.5 rounded-xl flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Download
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-8 flex-wrap">
        <div>
          <label className="text-xs font-semibold block mb-1" style={{ color: '#94a3b8' }}>Tags</label>
          <select className="scan-input rounded-xl px-3 py-2 text-sm" style={{ color: '#475569' }}>
            <option>All</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold block mb-1" style={{ color: '#94a3b8' }}>Targets</label>
          <select className="scan-input rounded-xl px-3 py-2 text-sm" style={{ color: '#475569' }}>
            <option>All</option><option>acmecorp.com</option><option>techstart.io</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold block mb-1" style={{ color: '#94a3b8' }}>From</label>
          <input type="date" defaultValue="2026-04-12" className="scan-input rounded-xl px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs font-semibold block mb-1" style={{ color: '#94a3b8' }}>To</label>
          <input type="date" defaultValue="2026-05-12" className="scan-input rounded-xl px-3 py-2 text-sm" />
        </div>
        <div className="ml-2 flex items-center gap-2 mt-5">
          <button onClick={() => setGroupByIssue(p => !p)}
            className="relative w-11 h-6 rounded-full transition-all"
            style={{ background: groupByIssue ? '#6366f1' : '#e2e8f0' }}>
            <span className="absolute top-1 transition-all w-4 h-4 rounded-full bg-white shadow"
              style={{ left: groupByIssue ? '24px' : '4px' }} />
          </button>
          <span className="text-sm font-semibold" style={{ color: '#475569' }}>Group by issue</span>
        </div>
      </div>

      {/* Issues section */}
      <div className="mb-8">
        <h2 className="font-bold text-base mb-4" style={{ color: '#0f172a' }}>Issues</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card-glass rounded-2xl p-5">
            <div className="flex items-start justify-between mb-3">
              <p className="text-xs font-bold uppercase tracking-wide" style={{ color: '#94a3b8' }}>Open issues</p>
              <button style={{ color: '#94a3b8' }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg></button>
            </div>
            <p className="font-black text-3xl mb-2" style={{ color: '#0f172a' }}>11</p>
            <p className="text-xs mb-3" style={{ color: '#94a3b8' }}>Medium threat level</p>
            <MiniBar label="Critical" count={4} color="#ef4444" />
            <MiniBar label="High" count={3} color="#f59e0b" />
            <MiniBar label="Medium" count={2} color="#3b82f6" />
            <MiniBar label="Low" count={2} color="#22c55e" />
          </div>

          <div className="card-glass rounded-2xl p-5">
            <div className="flex items-start justify-between mb-3">
              <p className="text-xs font-bold uppercase tracking-wide" style={{ color: '#94a3b8' }}>New issues</p>
              <button style={{ color: '#94a3b8' }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg></button>
            </div>
            <p className="font-black text-3xl mb-1" style={{ color: '#0f172a' }}>11</p>
            <p className="text-xs mb-3" style={{ color: '#94a3b8' }}>0 Critical or High issues</p>
            {/* Mini bar chart */}
            <div className="flex items-end gap-1 h-12 mt-2">
              {[0, 0, 2, 4, 4, 1].map((v, i) => (
                <div key={i} className="flex-1 rounded-sm transition-all"
                  style={{ height: `${v * 12}px`, background: i % 2 === 0 ? '#e2e8f0' : '#6366f1', minHeight: v > 0 ? '4px' : '0' }} />
              ))}
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-xs" style={{ color: '#94a3b8' }}>Prev period</span>
              <span className="text-xs" style={{ color: '#6366f1' }}>This period</span>
            </div>
          </div>

          <div className="card-glass rounded-2xl p-5">
            <div className="flex items-start justify-between mb-3">
              <p className="text-xs font-bold uppercase tracking-wide" style={{ color: '#94a3b8' }}>Fixed issues</p>
              <button style={{ color: '#94a3b8' }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg></button>
            </div>
            <p className="font-black text-3xl mb-2" style={{ color: '#22c55e' }}>0%</p>
            <MiniBar label="Critical" count={0} color="#ef4444" />
            <MiniBar label="High" count={0} color="#f59e0b" />
            <MiniBar label="Medium" count={0} color="#3b82f6" />
            <MiniBar label="Low" count={0} color="#22c55e" />
          </div>

          <div className="card-glass rounded-2xl p-5">
            <div className="flex items-start justify-between mb-3">
              <p className="text-xs font-bold uppercase tracking-wide" style={{ color: '#94a3b8' }}>Days to fix</p>
              <button style={{ color: '#94a3b8' }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg></button>
            </div>
            <p className="font-black text-3xl mb-2" style={{ color: '#0f172a' }}>0</p>
            <MiniBar label="Critical" count={0} color="#ef4444" />
            <MiniBar label="High" count={0} color="#f59e0b" />
            <MiniBar label="Medium" count={0} color="#3b82f6" />
            <MiniBar label="Low" count={0} color="#22c55e" />
          </div>
        </div>
      </div>

      {/* Monitor performance */}
      <div className="mb-8">
        <h2 className="font-bold text-base mb-4" style={{ color: '#0f172a' }}>Monitor performance</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {/* Emerging threats */}
          <div className="card-glass rounded-2xl p-5">
            <div className="flex items-start justify-between mb-3">
              <p className="text-xs font-bold uppercase tracking-wide" style={{ color: '#94a3b8' }}>Emerging threats</p>
              <button style={{ color: '#94a3b8' }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg></button>
            </div>
            <p className="font-black text-3xl mb-1" style={{ color: '#22c55e' }}>0 / 0</p>
            <p className="text-xs mb-3" style={{ color: '#94a3b8' }}>Passed</p>
            <div className="space-y-2">
              {[{ label: 'Critical', v: '0/0' }, { label: 'High', v: '0/0' }].map(({ label, v }) => (
                <div key={label} className="flex items-center justify-between text-xs">
                  <span className="font-semibold px-2 py-0.5 rounded-full" style={{ background: label === 'Critical' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)', color: label === 'Critical' ? '#ef4444' : '#f59e0b' }}>{label}</span>
                  <span style={{ color: '#64748b' }}>{v}</span>
                  <span className="flex items-center gap-1 text-xs font-semibold" style={{ color: '#22c55e' }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    All clear
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Days between scans */}
          <div className="card-glass rounded-2xl p-5">
            <div className="flex items-start justify-between mb-3">
              <p className="text-xs font-bold uppercase tracking-wide" style={{ color: '#94a3b8' }}>Days between scans</p>
              <button style={{ color: '#94a3b8' }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg></button>
            </div>
            <p className="font-black text-3xl mb-1" style={{ color: '#0f172a' }}>7.0</p>
            <p className="text-xs mb-4" style={{ color: '#94a3b8' }}>3 scans total in this period</p>
            <button className="text-xs font-semibold" style={{ color: '#6366f1' }}>View scans →</button>
          </div>

          {/* Cyber hygiene score */}
          <div className="card-glass rounded-2xl p-5">
            <div className="flex items-start justify-between mb-3">
              <p className="text-xs font-bold uppercase tracking-wide" style={{ color: '#94a3b8' }}>Cyber hygiene score</p>
              <button style={{ color: '#94a3b8' }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg></button>
            </div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-full flex items-center justify-center font-black text-lg"
                style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: '#fff' }}>
                A+
              </div>
              <div>
                <p className="font-black text-2xl" style={{ color: '#0f172a' }}>A+</p>
                <p className="text-xs font-semibold" style={{ color: '#22c55e' }}>Excellent</p>
              </div>
            </div>
            <p className="text-xs" style={{ color: '#94a3b8' }}>Measures your time to fix against industry best practice</p>
          </div>
        </div>
      </div>

      {/* Attack surface */}
      <div>
        <h2 className="font-bold text-base mb-4" style={{ color: '#0f172a' }}>Attack surface</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {/* Most vulnerable targets */}
          <div className="card-glass rounded-2xl p-5">
            <div className="flex items-start justify-between mb-3">
              <p className="text-xs font-bold uppercase tracking-wide" style={{ color: '#94a3b8' }}>Most vulnerable targets</p>
              <button style={{ color: '#94a3b8' }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg></button>
            </div>
            {[
              { rank: 1, domain: 'acmecorp.com', issues: 7 },
              { rank: 2, domain: 'techstart.io', issues: 4 },
            ].map(t => (
              <div key={t.rank} className="flex items-center gap-3 py-2" style={{ borderBottom: '1px solid #f1f5f9' }}>
                <span className="w-5 text-xs font-bold" style={{ color: '#94a3b8' }}>{t.rank}</span>
                <span className="flex-1 text-sm font-semibold" style={{ color: '#0f172a', fontFamily: 'monospace' }}>{t.domain}</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>{t.issues} issues</span>
              </div>
            ))}
          </div>

          {/* Scanned targets */}
          <div className="card-glass rounded-2xl p-5">
            <div className="flex items-start justify-between mb-3">
              <p className="text-xs font-bold uppercase tracking-wide" style={{ color: '#94a3b8' }}>Scanned targets</p>
              <button style={{ color: '#94a3b8' }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg></button>
            </div>
            <p className="font-black text-3xl mb-2" style={{ color: '#6366f1' }}>2 / 2</p>
            <div className="space-y-1">
              {[{ label: 'External', count: 2 }, { label: 'Internal', count: 0 }, { label: 'Web app', count: 0 }].map(({ label, count }) => (
                <div key={label} className="flex items-center justify-between text-xs">
                  <span style={{ color: '#64748b' }}>{label}</span>
                  <span className="font-bold" style={{ color: '#0f172a' }}>{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* New services */}
          <div className="card-glass rounded-2xl p-5">
            <div className="flex items-start justify-between mb-3">
              <p className="text-xs font-bold uppercase tracking-wide" style={{ color: '#94a3b8' }}>New services</p>
              <button style={{ color: '#94a3b8' }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg></button>
            </div>
            <p className="font-black text-3xl mb-2" style={{ color: '#0ea5e9' }}>35</p>
            <p className="text-xs" style={{ color: '#94a3b8' }}>Services discovered in this period across all targets</p>
          </div>
        </div>
      </div>
    </div>
  );
}
