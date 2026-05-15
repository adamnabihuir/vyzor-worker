'use client';

import { useState, useEffect } from 'react';
import type { ScanRow } from '@/lib/supabase';

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
  rowBg: 'rgba(255,255,255,0.04)',
  innerBorder: 'rgba(255,255,255,0.08)',
};

type ScanWithFindings = ScanRow & {
  findings: { severity: string }[];
  stats: { vulnerabilities?: { critical: number; high: number; medium: number; low: number }; riskScore?: number; assetsDiscovered?: number; portsScanned?: number };
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function totalFindings(scan: ScanWithFindings) {
  const v = scan.stats?.vulnerabilities;
  if (!v) return scan.findings?.length ?? 0;
  return (v.critical ?? 0) + (v.high ?? 0) + (v.medium ?? 0) + (v.low ?? 0);
}

function ReportIcon({ riskScore }: { riskScore: number }) {
  const color = riskScore >= 75 ? '#ef4444' : riskScore >= 50 ? '#f59e0b' : '#34d399';
  return (
    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
      style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
      </svg>
    </div>
  );
}

export default function ReportsPage() {
  const [scans, setScans] = useState<ScanWithFindings[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/scans')
      .then(r => r.json())
      .then(data => setScans((data ?? []).filter((s: ScanWithFindings) => s.status === 'completed')))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleDownload = async (scan: ScanWithFindings) => {
    setGenerating(scan.id);
    try {
      // Fetch full scan data (with all findings)
      const res = await fetch(`/api/scan/${scan.id}`);
      const full = await res.json();
      // Dynamically import jsPDF to avoid SSR issues
      const { generateScanPdf } = await import('@/lib/generatePdf');
      generateScanPdf(full);
    } catch (e) {
      console.error('PDF generation failed:', e);
    } finally {
      setGenerating(null);
    }
  };

  const totalReports = scans.length;
  const lastDate = scans[0] ? fmtDate(scans[0].created_at) : '—';
  const avgFindings = scans.length
    ? Math.round(scans.reduce((a, s) => a + totalFindings(s), 0) / scans.length)
    : 0;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-black text-2xl" style={{ color: C.text }}>Reports</h1>
        <p className="text-sm" style={{ color: C.muted }}>Download PDF reports for each completed scan</p>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { title: 'Total reports', value: loading ? '—' : totalReports },
          { title: 'Last generated', value: loading ? '—' : lastDate },
          { title: 'Avg findings / scan', value: loading ? '—' : avgFindings },
          { title: 'Format', value: 'PDF' },
        ].map((s, i) => (
          <div key={i} className="rounded-2xl p-5" style={GLASS}>
            <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: C.muted }}>{s.title}</p>
            <p className="font-black text-3xl" style={{ color: C.text }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Reports table */}
      <div className="rounded-2xl overflow-hidden" style={GLASS}>
        {/* Table header */}
        <div className="px-6 py-3 text-xs font-bold uppercase tracking-wider grid items-center"
          style={{ gridTemplateColumns: '2.5fr 1fr 1fr 1fr auto auto', gap: 12, background: C.rowBg, borderBottom: `1px solid ${C.innerBorder}`, color: C.muted }}>
          <span>Domain</span>
          <span>Date</span>
          <span>Findings</span>
          <span>Risk</span>
          <span>Format</span>
          <span></span>
        </div>

        {loading && (
          <div className="px-6 py-12 text-center">
            <p className="text-sm" style={{ color: C.muted }}>Loading reports…</p>
          </div>
        )}

        {!loading && scans.length === 0 && (
          <div className="px-6 py-16 text-center">
            <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
              style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.15)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="1.5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
            </div>
            <p className="font-semibold text-sm mb-1" style={{ color: C.text }}>No completed scans yet</p>
            <p className="text-xs" style={{ color: C.muted }}>Run a scan from the Dashboard — reports appear here automatically.</p>
          </div>
        )}

        {scans.map((scan, i) => {
          const v = scan.stats?.vulnerabilities ?? { critical: 0, high: 0, medium: 0, low: 0 };
          const riskScore = scan.stats?.riskScore ?? 0;
          const riskLabel = riskScore >= 75 ? 'Critical' : riskScore >= 50 ? 'High' : riskScore >= 25 ? 'Medium' : 'Low';
          const riskColor = riskScore >= 75 ? '#ef4444' : riskScore >= 50 ? '#f59e0b' : riskScore >= 25 ? '#6366f1' : '#34d399';
          const isGenerating = generating === scan.id;

          return (
            <div key={scan.id} className="px-6 py-4 grid items-center"
              style={{ gridTemplateColumns: '2.5fr 1fr 1fr 1fr auto auto', gap: 12, borderBottom: i < scans.length - 1 ? `1px solid ${C.innerBorder}` : 'none', background: i % 2 === 0 ? 'transparent' : C.rowBg }}>

              {/* Domain + icon */}
              <div className="flex items-center gap-3 min-w-0">
                <ReportIcon riskScore={riskScore} />
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: C.text }}>{scan.domain}</p>
                  <p className="text-xs" style={{ color: C.muted }}>Deep Scan · nmap + nuclei</p>
                </div>
              </div>

              {/* Date */}
              <p className="text-xs" style={{ color: C.muted }}>{fmtDate(scan.created_at)}</p>

              {/* Findings */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {v.critical > 0 && (
                  <span className="text-xs font-bold px-1.5 py-0.5 rounded" style={{ background: 'rgba(239,68,68,0.12)', color: '#f87171' }}>{v.critical}C</span>
                )}
                {v.high > 0 && (
                  <span className="text-xs font-bold px-1.5 py-0.5 rounded" style={{ background: 'rgba(245,158,11,0.12)', color: '#fbbf24' }}>{v.high}H</span>
                )}
                {v.medium > 0 && (
                  <span className="text-xs font-bold px-1.5 py-0.5 rounded" style={{ background: 'rgba(59,130,246,0.12)', color: '#60a5fa' }}>{v.medium}M</span>
                )}
                {v.critical === 0 && v.high === 0 && v.medium === 0 && (
                  <span className="text-xs font-bold" style={{ color: '#34d399' }}>✓ Clean</span>
                )}
              </div>

              {/* Risk */}
              <span className="text-xs font-bold" style={{ color: riskColor }}>{riskScore} — {riskLabel}</span>

              {/* Format */}
              <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ background: 'rgba(239,68,68,0.12)', color: '#f87171' }}>PDF</span>

              {/* Download button */}
              <button
                onClick={() => handleDownload(scan)}
                disabled={isGenerating}
                title="Download PDF"
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                style={{ background: isGenerating ? 'rgba(52,211,153,0.15)' : 'rgba(52,211,153,0.08)', color: '#34d399' }}
              >
                {isGenerating ? (
                  <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
