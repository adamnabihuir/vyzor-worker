'use client';

import { useState } from 'react';
import Link from 'next/link';

const TARGETS = [
  { id: 't1', domain: 'acmecorp.com', type: 'External', status: 'active', issues: { critical: 3, high: 8 }, lastScan: '14 May 2025', assets: 147 },
  { id: 't2', domain: 'techstart.io', type: 'External', status: 'active', issues: { critical: 1, high: 3 }, lastScan: '13 May 2025', assets: 43 },
];

export default function TargetsPage() {
  const [showAdd, setShowAdd] = useState(false);
  const [newDomain, setNewDomain] = useState('');
  const [filter, setFilter] = useState('All');

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-black text-2xl mb-1" style={{ color: '#0f172a' }}>Targets</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>{TARGETS.length} targets configured</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="btn-primary text-white text-sm font-bold px-4 py-2.5 rounded-xl flex items-center gap-2"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add target
        </button>
      </div>

      {/* Add target modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(4px)' }}>
          <div className="card-glass rounded-2xl p-8 w-full max-w-md mx-4">
            <h2 className="font-black text-xl mb-2" style={{ color: '#0f172a' }}>Add New Target</h2>
            <p className="text-sm mb-6" style={{ color: '#64748b' }}>Enter the domain or IP you want Vyzor to monitor.</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#374151' }}>Domain or IP</label>
                <input type="text" placeholder="example.com or 192.168.1.1" value={newDomain} onChange={e => setNewDomain(e.target.value)}
                  className="scan-input w-full rounded-xl px-4 py-3 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#374151' }}>Target type</label>
                <select className="scan-input w-full rounded-xl px-4 py-3 text-sm" style={{ color: '#475569' }}>
                  <option>External</option><option>Internal</option><option>Web app</option><option>Cloud account</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowAdd(false)} className="btn-secondary flex-1 py-3 rounded-xl text-sm font-bold">Cancel</button>
              <button onClick={() => setShowAdd(false)} className="btn-primary flex-1 py-3 rounded-xl text-sm font-bold text-white">Add & Scan</button>
            </div>
          </div>
        </div>
      )}

      {/* Tabs + filters */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: '#f1f5f9' }}>
          {['All', 'Active', 'Not scanned', 'Unresponsive'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className="px-4 py-1.5 rounded-lg text-sm font-medium transition-all"
              style={{ background: filter === f ? '#fff' : 'transparent', color: filter === f ? '#0f172a' : '#94a3b8', boxShadow: filter === f ? '0 1px 3px rgba(0,0,0,0.08)' : 'none' }}>
              {f} {f === 'All' && <span className="ml-1 text-xs font-bold" style={{ color: '#6366f1' }}>{TARGETS.length}</span>}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <input type="text" placeholder="Search targets..." className="scan-input rounded-xl px-3 py-2 text-sm" style={{ width: '200px' }} />
        </div>
      </div>

      {/* Targets table */}
      <div className="card-glass rounded-2xl overflow-hidden">
        <div className="px-6 py-4 flex items-center gap-4" style={{ borderBottom: '1px solid #f1f5f9', background: '#fafafa' }}>
          <input type="checkbox" className="rounded" />
          <span className="text-xs font-bold uppercase tracking-wide" style={{ color: '#94a3b8', flex: 3 }}>Target</span>
          <span className="text-xs font-bold uppercase tracking-wide" style={{ color: '#94a3b8', flex: 1 }}>Type</span>
          <span className="text-xs font-bold uppercase tracking-wide" style={{ color: '#94a3b8', flex: 1 }}>Status</span>
          <span className="text-xs font-bold uppercase tracking-wide" style={{ color: '#94a3b8', flex: 1 }}>Issues</span>
          <span className="text-xs font-bold uppercase tracking-wide" style={{ color: '#94a3b8', flex: 2 }}>Last Activity</span>
          <span className="text-xs font-bold uppercase tracking-wide" style={{ color: '#94a3b8', flex: 1 }}>Actions</span>
        </div>

        {TARGETS.map((target, i) => (
          <div key={target.id} className="px-6 py-5 flex items-center gap-4 hover:bg-gray-50 transition-colors"
            style={{ borderBottom: i < TARGETS.length - 1 ? '1px solid #f8fafc' : 'none' }}>
            <input type="checkbox" className="rounded" />

            {/* Target info */}
            <div style={{ flex: 3 }} className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.08)' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                </svg>
              </div>
              <div>
                <Link href={`/dashboard/scans/scan_00${i + 1}`} className="font-semibold text-sm hover:underline" style={{ color: '#0f172a' }}>
                  {target.domain}
                </Link>
                <p className="text-xs" style={{ color: '#94a3b8' }}>{target.assets} assets discovered</p>
              </div>
            </div>

            <div style={{ flex: 1 }}>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: '#f1f5f9', color: '#475569' }}>{target.type}</span>
            </div>

            <div style={{ flex: 1 }} className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ background: '#22c55e' }} />
              <span className="text-sm capitalize" style={{ color: '#475569' }}>{target.status}</span>
            </div>

            <div style={{ flex: 1 }} className="flex items-center gap-1.5">
              {target.issues.critical > 0 && (
                <span className="text-xs font-bold px-1.5 py-0.5 rounded" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>{target.issues.critical}</span>
              )}
              {target.issues.high > 0 && (
                <span className="text-xs font-bold px-1.5 py-0.5 rounded" style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b' }}>{target.issues.high}</span>
              )}
            </div>

            <div style={{ flex: 2 }}>
              <p className="text-sm" style={{ color: '#475569' }}>Scan · {target.lastScan}</p>
            </div>

            <div style={{ flex: 1 }} className="flex items-center gap-2">
              <button className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
                style={{ background: 'rgba(99,102,241,0.08)', color: '#6366f1' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.15)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(99,102,241,0.08)'}>
                Scan
              </button>
              <button style={{ color: '#94a3b8' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
