'use client';

import { useState } from 'react';

const GLASS: React.CSSProperties = {
  background: 'rgba(255,255,255,0.07)',
  backdropFilter: 'blur(18px)',
  WebkitBackdropFilter: 'blur(18px)',
  border: '1px solid rgba(255,255,255,0.13)',
  boxShadow: '0 4px 28px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.1)',
};

const C = {
  text: '#f0fdf4',
  muted: 'rgba(167,243,208,0.55)',
  veryMuted: 'rgba(167,243,208,0.4)',
  accent: '#34d399',
  bg: '#021a12',
  rowBg: 'rgba(255,255,255,0.04)',
  innerBorder: 'rgba(255,255,255,0.08)',
};

/* ── Data ──────────────────────────────────────────────── */
const REPORTS = [
  {
    id: 1,
    name: 'Full Security Report — acmecorp.com',
    target: 'acmecorp.com',
    date: '14 May 2025',
    type: 'Full Security',
    findings: { critical: 3, high: 8 },
    format: 'PDF',
  },
  {
    id: 2,
    name: 'Executive Summary Q2 2025',
    target: 'acmecorp.com',
    date: '10 May 2025',
    type: 'Executive Summary',
    findings: { critical: 0, high: 2 },
    format: 'PDF',
  },
  {
    id: 3,
    name: 'Weekly Scan Report',
    target: 'All targets',
    date: '7 May 2025',
    type: 'Full Security',
    findings: { critical: 1, high: 3 },
    format: 'CSV',
  },
  {
    id: 4,
    name: 'Compliance Report — NIS2',
    target: 'acmecorp.com',
    date: '1 May 2025',
    type: 'Compliance',
    findings: { critical: 0, high: 1 },
    format: 'PDF',
  },
  {
    id: 5,
    name: 'Full Security Report — techstart.io',
    target: 'techstart.io',
    date: '28 Apr 2025',
    type: 'Full Security',
    findings: { critical: 2, high: 5 },
    format: 'PDF',
  },
  {
    id: 6,
    name: 'Pentest Summary',
    target: 'All targets',
    date: '15 Apr 2025',
    type: 'Executive Summary',
    findings: { critical: 1, high: 2 },
    format: 'PDF',
  },
];

/* ── Stat card ─────────────────────────────────────────── */
function StatCard({ title, value, sub }: { title: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded-2xl p-5" style={GLASS}>
      <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: C.muted }}>{title}</p>
      <p className="font-black text-3xl" style={{ color: C.text }}>{value}</p>
      {sub && <p className="text-xs mt-1" style={{ color: C.muted }}>{sub}</p>}
    </div>
  );
}

/* ── Report icon ───────────────────────────────────────── */
function ReportIcon({ type }: { type: string }) {
  const color = type === 'Compliance' ? '#a78bfa' : type === 'Executive Summary' ? '#0ea5e9' : C.accent;
  return (
    <div
      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
      style={{ background: `${color}18`, border: `1px solid ${color}30` }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
        <polyline points="10 9 9 9 8 9"/>
      </svg>
    </div>
  );
}

/* ── Format badge ──────────────────────────────────────── */
function FormatBadge({ fmt }: { fmt: string }) {
  const isPdf = fmt === 'PDF';
  return (
    <span
      className="text-xs font-bold px-2 py-0.5 rounded"
      style={{
        background: isPdf ? 'rgba(239,68,68,0.12)' : 'rgba(52,211,153,0.1)',
        color: isPdf ? '#f87171' : C.accent,
      }}
    >
      {fmt}
    </span>
  );
}

/* ── Generate modal ────────────────────────────────────── */
function GenerateModal({ onClose }: { onClose: () => void }) {
  const [target, setTarget] = useState('All targets');
  const [reportType, setReportType] = useState('Full security report');
  const [format, setFormat] = useState('PDF');
  const [range, setRange] = useState('Last 30 days');

  const sel: React.CSSProperties = {
    width: '100%', padding: '10px 14px', borderRadius: 10,
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
    color: C.text, fontSize: 14, outline: 'none',
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ background: 'rgba(2,26,18,0.88)', backdropFilter: 'blur(6px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="rounded-2xl p-6 w-full max-w-md" style={GLASS}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-base" style={{ color: C.text }}>Generate report</h3>
          <button onClick={onClose} style={{ color: C.muted }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: C.muted }}>Target</label>
            <select value={target} onChange={e => setTarget(e.target.value)} style={sel}>
              <option>All targets</option>
              <option>acmecorp.com</option>
              <option>techstart.io</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: C.muted }}>Report type</label>
            <select value={reportType} onChange={e => setReportType(e.target.value)} style={sel}>
              <option>Full security report</option>
              <option>Executive summary</option>
              <option>Compliance report</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: C.muted }}>Format</label>
            <div className="flex gap-2">
              {['PDF', 'CSV'].map(f => (
                <button
                  key={f}
                  onClick={() => setFormat(f)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
                  style={{
                    background: format === f ? C.accent : 'rgba(255,255,255,0.06)',
                    color: format === f ? '#021a12' : C.muted,
                    border: format === f ? 'none' : '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: C.muted }}>Date range</label>
            <select value={range} onChange={e => setRange(e.target.value)} style={sel}>
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 90 days</option>
              <option>Custom</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            className="flex-1 text-sm font-bold py-2.5 rounded-xl"
            style={{ background: C.accent, color: '#021a12' }}
            onClick={onClose}
          >
            Generate
          </button>
          <button
            className="flex-1 text-sm font-bold py-2.5 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.06)', color: C.muted, border: '1px solid rgba(255,255,255,0.1)' }}
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Page ──────────────────────────────────────────────── */
export default function ReportsPage() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-black text-2xl" style={{ color: C.text }}>Reports</h1>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 text-sm font-bold px-4 py-2.5 rounded-xl"
          style={{ background: C.accent, color: '#021a12' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Generate report
        </button>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total reports" value={14} />
        <StatCard title="Last generated" value="Today" />
        <StatCard title="Avg findings / report" value={23} />
        <StatCard title="Reports this month" value={3} />
      </div>

      {/* Reports table */}
      <div className="rounded-2xl overflow-hidden" style={GLASS}>
        {/* Table header */}
        <div
          className="px-6 py-3 text-xs font-bold uppercase tracking-wider grid items-center"
          style={{
            gridTemplateColumns: '2.5fr 1fr 1fr 1fr auto auto',
            gap: 12,
            background: C.rowBg,
            borderBottom: `1px solid ${C.innerBorder}`,
            color: C.muted,
          }}
        >
          <span>Report</span>
          <span>Date</span>
          <span>Findings</span>
          <span>Type</span>
          <span>Format</span>
          <span></span>
        </div>

        {REPORTS.map((r, i) => (
          <div
            key={r.id}
            className="px-6 py-4 grid items-center"
            style={{
              gridTemplateColumns: '2.5fr 1fr 1fr 1fr auto auto',
              gap: 12,
              borderBottom: i < REPORTS.length - 1 ? `1px solid ${C.innerBorder}` : 'none',
              background: i % 2 === 0 ? 'transparent' : C.rowBg,
            }}
          >
            {/* Name + icon */}
            <div className="flex items-center gap-3 min-w-0">
              <ReportIcon type={r.type} />
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: C.text }}>{r.name}</p>
                <p className="text-xs" style={{ color: C.muted }}>{r.target}</p>
              </div>
            </div>

            {/* Date */}
            <p className="text-xs" style={{ color: C.muted }}>{r.date}</p>

            {/* Findings */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {r.findings.critical > 0 && (
                <span className="text-xs font-bold px-1.5 py-0.5 rounded" style={{ background: 'rgba(239,68,68,0.12)', color: '#f87171' }}>
                  {r.findings.critical}C
                </span>
              )}
              {r.findings.high > 0 && (
                <span className="text-xs font-bold px-1.5 py-0.5 rounded" style={{ background: 'rgba(245,158,11,0.12)', color: '#fbbf24' }}>
                  {r.findings.high}H
                </span>
              )}
            </div>

            {/* Type */}
            <p className="text-xs" style={{ color: C.muted }}>{r.type}</p>

            {/* Format */}
            <FormatBadge fmt={r.format} />

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                title="Download"
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                style={{ background: 'rgba(52,211,153,0.08)', color: C.accent }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
              </button>
              <button
                title="More options"
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ color: C.muted }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {modalOpen && <GenerateModal onClose={() => setModalOpen(false)} />}
    </div>
  );
}
