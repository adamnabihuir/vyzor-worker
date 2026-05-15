'use client';

import { useState } from 'react';
import Link from 'next/link';
import { DEMO_SCANS, getRiskColor, getRiskLabel } from '@/lib/scans';

const TRENDING_CVES = [
  { id: 'CVE-2025-1234', score: 9.8, label: 'Critical', product: 'Apache Log4j', exploited: true },
  { id: 'CVE-2025-0987', score: 8.6, label: 'High', product: 'OpenSSL 3.x', exploited: false },
  { id: 'CVE-2024-9876', score: 7.5, label: 'High', product: 'nginx < 1.25', exploited: false },
];

const ACTIVITY = [
  { type: 'scan', icon: '🔍', title: 'Team scan completed', sub: 'acmecorp.com · 23 findings', time: '2h ago', color: '#6366f1' },
  { type: 'alert', icon: '⚠️', title: 'New critical CVE detected', sub: 'CVE-2025-1234 affects 2 targets', time: '5h ago', color: '#ef4444' },
  { type: 'asset', icon: '🌐', title: 'Network update', sub: '3 new subdomains discovered', time: '1d ago', color: '#0ea5e9' },
  { type: 'scan', icon: '🔍', title: 'Scheduled scan started', sub: 'techstart.io', time: '2d ago', color: '#6366f1' },
  { type: 'fix', icon: '✅', title: 'Issue resolved', sub: 'SSL misconfiguration on mail server', time: '3d ago', color: '#22c55e' },
];

const ISSUES_TO_FIX = [
  { title: 'Remote Code Execution via Log4Shell', severity: 'critical', target: 'api.acmecorp.com', due: '11 Jun 2025' },
  { title: 'Exposed RDP Port (3389)', severity: 'critical', target: 'admin.acmecorp.com', due: '11 Jun 2025' },
  { title: 'SQL Injection in Login', severity: 'critical', target: 'app.acmecorp.com', due: '18 Jun 2025' },
  { title: 'Outdated TLS 1.0', severity: 'high', target: 'mail.acmecorp.com', due: '09 Jul 2025' },
  { title: 'Missing Security Headers', severity: 'medium', target: 'www.acmecorp.com', due: '09 Sep 2025' },
];

const SEVERITY_COLOR: Record<string, string> = {
  critical: '#ef4444', high: '#f59e0b', medium: '#6366f1', low: '#22c55e',
};

export default function DashboardPage() {
  const [domain, setDomain] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scanDone, setScanDone] = useState(false);
  const [scanStep, setScanStep] = useState(0);

  const STEPS = ['Asset Discovery', 'Port Scanning', 'Vulnerability Detection', 'Generating Report'];

  const handleScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!domain.trim()) return;
    setScanning(true); setScanDone(false); setScanStep(0);
    let step = 0;
    const iv = setInterval(() => { step++; setScanStep(step); if (step >= STEPS.length) { clearInterval(iv); setScanning(false); setScanDone(true); } }, 900);
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-black text-2xl mb-1" style={{ color: '#0f172a' }}>Dashboard</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Wednesday, 14 May 2025 · Growth Plan</p>
        </div>
        <div className="flex items-center gap-3">
          <select className="text-sm px-3 py-2 rounded-xl border font-medium" style={{ borderColor: '#e2e8f0', color: '#475569', background: '#fff' }}>
            <option>All tags</option><option>Production</option><option>Staging</option>
          </select>
          <button className="btn-primary text-white text-sm font-bold px-4 py-2 rounded-xl flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Export
          </button>
        </div>
      </div>

      {/* Top stat strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        {[
          { label: 'Findings', value: '47', sub: 'Includes 12 noise items', color: '#6366f1' },
          { label: 'Issues', value: '11', sub: '↑ 2 since last scan', color: '#f59e0b' },
          { label: 'Critical & High', value: '4', sub: '3 exploitable', color: '#ef4444' },
          { label: 'Exploit Known', value: '3', sub: 'Act immediately', color: '#ef4444' },
          { label: 'Checks Available', value: '49,177', sub: '+2,357 last 30 days', color: '#22c55e' },
        ].map((s, i) => (
          <div key={i} className="card-glass rounded-2xl px-5 py-4">
            <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#94a3b8' }}>{s.label}</p>
            <p className="font-black text-2xl mb-0.5" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs" style={{ color: '#94a3b8' }}>{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid xl:grid-cols-3 gap-6">
        {/* LEFT COLUMN */}
        <div className="xl:col-span-2 space-y-6">

          {/* Threat level + Cyber Hygiene */}
          <div className="grid md:grid-cols-2 gap-5">
            {/* Threat Level */}
            <div className="card-glass rounded-2xl p-6">
              <h2 className="font-bold text-sm mb-4" style={{ color: '#0f172a' }}>Threat Level</h2>
              <ThreatGauge score={74} />
              <p className="text-center text-xs mt-3" style={{ color: '#64748b' }}>
                A breach is unlikely but fix high severity issues soon to minimise your risk.
              </p>
            </div>

            {/* Cyber Hygiene */}
            <div className="card-glass rounded-2xl p-6">
              <h2 className="font-bold text-sm mb-4" style={{ color: '#0f172a' }}>Cyber Hygiene</h2>
              <div className="flex flex-col items-center justify-center flex-1 py-4">
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center mb-3 font-black text-2xl text-white"
                  style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }}
                >
                  B+
                </div>
                <p className="font-bold text-base mb-1" style={{ color: '#0f172a' }}>Needs Attention</p>
                <p className="text-xs text-center" style={{ color: '#94a3b8' }}>
                  3 critical issues slow down your score. Fix them to reach A.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-3">
                {[{ g: 'A+', l: 'SSL/TLS', ok: true }, { g: 'B', l: 'Headers', ok: false }, { g: 'A', l: 'Ports', ok: true }].map((item, i) => (
                  <div key={i} className="text-center rounded-xl py-2" style={{ background: '#f8fafc' }}>
                    <p className="font-black text-sm" style={{ color: item.ok ? '#22c55e' : '#f59e0b' }}>{item.g}</p>
                    <p className="text-xs" style={{ color: '#94a3b8' }}>{item.l}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* New scan */}
          <div className="card-glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-1">
              <h2 className="font-bold text-base" style={{ color: '#0f172a' }}>New Scan</h2>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ background: '#22c55e' }} />
                <span className="text-xs font-semibold" style={{ color: '#22c55e' }}>0 scans in progress</span>
              </div>
            </div>
            <p className="text-sm mb-5" style={{ color: '#94a3b8' }}>Next scheduled scan: Tomorrow 02:00</p>
            <form onSubmit={handleScan} className="flex gap-3">
              <div className="relative flex-1">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#94a3b8' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                </div>
                <input type="text" placeholder="example.com" value={domain} onChange={e => setDomain(e.target.value)} className="scan-input w-full rounded-xl pl-10 pr-4 py-3 text-sm" />
              </div>
              <button type="submit" disabled={scanning} className="btn-primary text-white font-bold rounded-xl px-6 py-3 text-sm whitespace-nowrap">
                {scanning ? <span className="flex items-center gap-2"><svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>Scanning...</span> : 'Scan now'}
              </button>
            </form>
            {scanning && (
              <div className="mt-4 space-y-2">
                {STEPS.map((step, i) => (
                  <div key={i} className="flex items-center gap-3">
                    {i < scanStep ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    ) : i === scanStep ? (
                      <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full border-2" style={{ borderColor: '#e2e8f0' }} />
                    )}
                    <span className="text-sm" style={{ color: i <= scanStep ? '#0f172a' : '#94a3b8' }}>{step}</span>
                  </div>
                ))}
              </div>
            )}
            {scanDone && (
              <div className="mt-4 px-4 py-3 rounded-xl flex items-center gap-3" style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                <span className="text-sm font-semibold" style={{ color: '#16a34a' }}>Scan of {domain} complete — <Link href="/dashboard/scans/scan_001" style={{ color: '#6366f1' }}>View results →</Link></span>
              </div>
            )}
          </div>

          {/* Recent scans */}
          <div className="card-glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-base" style={{ color: '#0f172a' }}>Recent Scans</h2>
              <Link href="/dashboard/scans" className="text-sm font-medium" style={{ color: '#6366f1' }}>View all →</Link>
            </div>
            <div className="space-y-3">
              {DEMO_SCANS.map((scan) => (
                <Link key={scan.id} href={`/dashboard/scans/${scan.id}`}
                  className="flex items-center justify-between p-4 rounded-xl transition-all"
                  style={{ background: '#f8fafc', border: '1px solid #f1f5f9' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.2)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#f1f5f9'; }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-2 h-2 rounded-full" style={{ background: '#22c55e' }} />
                    <div>
                      <p className="font-semibold text-sm" style={{ color: '#0f172a' }}>{scan.domain}</p>
                      <p className="text-xs" style={{ color: '#94a3b8' }}>{scan.stats.assetsDiscovered} assets · {Object.values(scan.stats.vulnerabilities).reduce((a, b) => a + b, 0)} findings</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {scan.stats.vulnerabilities.critical > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>{scan.stats.vulnerabilities.critical} CRIT</span>
                    )}
                    <p className="font-black text-base" style={{ color: getRiskColor(scan.stats.riskScore) }}>{scan.stats.riskScore}</p>
                    <span className="text-xs font-semibold" style={{ color: getRiskColor(scan.stats.riskScore) }}>{getRiskLabel(scan.stats.riskScore)}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-5">
          {/* Trending CVE */}
          <div className="card-glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-sm" style={{ color: '#0f172a' }}>Top Trending CVEs</h2>
              <span className="text-xs font-semibold px-2 py-1 rounded-full" style={{ background: 'rgba(239,68,68,0.08)', color: '#ef4444' }}>LIVE</span>
            </div>
            <div className="space-y-3">
              {TRENDING_CVES.map((cve, i) => (
                <div key={i} className="p-3 rounded-xl" style={{ background: '#f8fafc', border: '1px solid #f1f5f9' }}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-mono font-semibold" style={{ color: '#0f172a' }}>{cve.id}</span>
                    <div className="flex items-center gap-1.5">
                      {cve.exploited && <span className="text-xs font-bold px-1.5 py-0.5 rounded" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>EXPLOIT</span>}
                      <span className="font-bold text-sm" style={{ color: SEVERITY_COLOR[cve.label.toLowerCase()] }}>{cve.score}</span>
                    </div>
                  </div>
                  <p className="text-xs" style={{ color: '#64748b' }}>{cve.product}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Issues to fix */}
          <div className="card-glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-sm" style={{ color: '#0f172a' }}>Issues to Fix</h2>
              <Link href="/dashboard/vulnerabilities" className="text-xs font-medium" style={{ color: '#6366f1' }}>View all →</Link>
            </div>
            <div className="space-y-2.5">
              {ISSUES_TO_FIX.map((issue, i) => (
                <div key={i} className="flex items-start justify-between gap-3 py-2.5" style={{ borderBottom: i < ISSUES_TO_FIX.length - 1 ? '1px solid #f8fafc' : 'none' }}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-bold uppercase" style={{ color: SEVERITY_COLOR[issue.severity] }}>{issue.severity}</span>
                    </div>
                    <p className="text-xs font-semibold truncate" style={{ color: '#0f172a' }}>{issue.title}</p>
                    <p className="text-xs font-mono" style={{ color: '#94a3b8' }}>{issue.target}</p>
                  </div>
                  <p className="text-xs whitespace-nowrap flex-shrink-0 mt-1" style={{ color: '#94a3b8' }}>Due {issue.due}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Activity feed */}
          <div className="card-glass rounded-2xl p-6">
            <h2 className="font-bold text-sm mb-4" style={{ color: '#0f172a' }}>Activity</h2>
            <div className="space-y-3">
              {ACTIVITY.map((a, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-sm flex-shrink-0" style={{ background: `${a.color}12` }}>
                    {a.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold" style={{ color: '#0f172a' }}>{a.title}</p>
                    <p className="text-xs truncate" style={{ color: '#94a3b8' }}>{a.sub}</p>
                  </div>
                  <p className="text-xs flex-shrink-0" style={{ color: '#cbd5e1' }}>{a.time}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ThreatGauge({ score }: { score: number }) {
  const color = getRiskColor(score);
  const label = getRiskLabel(score);
  const radius = 54;
  const circ = Math.PI * radius;
  const dash = (score / 100) * circ;

  return (
    <div className="flex flex-col items-center">
      <svg width="140" height="80" viewBox="0 0 140 80">
        <path d="M 10 70 A 60 60 0 0 1 130 70" fill="none" stroke="#f1f5f9" strokeWidth="12" strokeLinecap="round" />
        <path d="M 10 70 A 60 60 0 0 1 130 70" fill="none" stroke={color} strokeWidth="12" strokeLinecap="round"
          strokeDasharray={`${dash * 1.05} ${circ}`} style={{ filter: `drop-shadow(0 0 6px ${color}60)` }} />
      </svg>
      <div className="-mt-2 text-center">
        <p className="font-black text-3xl" style={{ color }}>{score}</p>
        <p className="text-sm font-bold" style={{ color }}>{label} Risk</p>
      </div>
    </div>
  );
}
