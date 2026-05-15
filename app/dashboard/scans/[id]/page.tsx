'use client';

import { use } from 'react';
import Link from 'next/link';
import { getScan, getRiskColor, getRiskLabel, getSeverityColor } from '@/lib/scans';

export default function ScanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const scan = getScan(id);

  if (!scan) {
    return (
      <div className="p-8 text-center">
        <p style={{ color: '#94a3b8' }}>Scan not found.</p>
        <Link href="/dashboard" style={{ color: '#6366f1' }}>← Back to dashboard</Link>
      </div>
    );
  }

  const totalFindings = Object.values(scan.stats.vulnerabilities).reduce((a, b) => a + b, 0);
  const riskColor = getRiskColor(scan.stats.riskScore);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <Link href="/dashboard" className="text-sm font-medium flex items-center gap-1" style={{ color: '#94a3b8' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
          Dashboard
        </Link>
        <span style={{ color: '#e2e8f0' }}>/</span>
        <span className="text-sm font-medium" style={{ color: '#64748b' }}>Scan Results</span>
      </div>

      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-black text-2xl mb-1" style={{ color: '#0f172a' }}>{scan.domain}</h1>
          <p className="text-sm" style={{ color: '#94a3b8' }}>
            Completed {new Date(scan.completedAt!).toLocaleString()} · {scan.stats.assetsDiscovered} assets · {totalFindings} findings
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div
            className="px-4 py-2 rounded-xl text-sm font-bold"
            style={{ background: `${riskColor}10`, color: riskColor, border: `1px solid ${riskColor}25` }}
          >
            Risk Score: {scan.stats.riskScore} — {getRiskLabel(scan.stats.riskScore)}
          </div>
          <button className="btn-primary text-white text-sm font-bold px-4 py-2 rounded-xl">
            Download PDF
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Assets Discovered', value: scan.stats.assetsDiscovered, color: '#6366f1' },
          { label: 'Ports Scanned', value: scan.stats.portsScanned.toLocaleString(), color: '#0ea5e9' },
          { label: 'Critical', value: scan.stats.vulnerabilities.critical, color: '#ef4444' },
          { label: 'High', value: scan.stats.vulnerabilities.high, color: '#f59e0b' },
        ].map((s, i) => (
          <div key={i} className="card-glass rounded-2xl p-5">
            <p className="font-black text-3xl mb-1" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#94a3b8' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Findings table */}
      <div className="card-glass rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: '1px solid #f1f5f9' }}>
          <h2 className="font-bold text-base" style={{ color: '#0f172a' }}>
            Findings <span className="ml-2 text-sm font-normal" style={{ color: '#94a3b8' }}>{scan.findings.length} total</span>
          </h2>
          <div className="flex items-center gap-2">
            {['All', 'Critical', 'High', 'Medium'].map(f => (
              <button
                key={f}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                style={{ background: f === 'All' ? 'rgba(99,102,241,0.1)' : '#f1f5f9', color: f === 'All' ? '#6366f1' : '#64748b' }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="divide-y" style={{ borderColor: '#f8fafc' }}>
          {scan.findings.map((finding) => {
            const sc = getSeverityColor(finding.severity);
            return (
              <div key={finding.id} className="px-6 py-5 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span
                        className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide"
                        style={{ background: `${sc}12`, color: sc }}
                      >
                        {finding.severity}
                      </span>
                      {finding.cve && (
                        <span className="text-xs font-mono" style={{ color: '#94a3b8' }}>{finding.cve}</span>
                      )}
                      {finding.cvss && (
                        <span className="text-xs font-semibold" style={{ color: '#94a3b8' }}>CVSS {finding.cvss}</span>
                      )}
                    </div>
                    <h3 className="font-bold text-sm mb-1" style={{ color: '#0f172a' }}>{finding.title}</h3>
                    <p className="text-xs mb-3" style={{ color: '#94a3b8' }}>
                      <span style={{ fontFamily: 'monospace' }}>{finding.asset}</span>
                      {finding.port && <span> · Port {finding.port}</span>}
                    </p>
                    <p className="text-sm leading-relaxed mb-3" style={{ color: '#64748b' }}>{finding.description}</p>

                    <div className="flex items-start gap-2 p-3 rounded-xl text-sm" style={{ background: 'rgba(99,102,241,0.04)', border: '1px solid rgba(99,102,241,0.08)' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" className="flex-shrink-0 mt-0.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span style={{ color: '#475569', fontSize: '0.82rem' }}><strong style={{ color: '#0f172a' }}>Fix: </strong>{finding.remediation}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
