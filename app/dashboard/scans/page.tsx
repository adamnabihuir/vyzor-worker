'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

const GLASS: React.CSSProperties = {
  background: 'rgba(255,255,255,0.07)',
  backdropFilter: 'blur(18px)',
  WebkitBackdropFilter: 'blur(18px)',
  border: '1px solid rgba(255,255,255,0.13)',
  boxShadow: '0 4px 28px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.1)',
};

type RealScan = {
  id: string;
  domain: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  progress: number;
  current_step: string;
  findings: { severity: string }[];
  stats: {
    assetsDiscovered?: number;
    portsScanned?: number;
    vulnerabilities?: { critical: number; high: number; medium: number; low: number };
    riskScore?: number;
  };
  created_at: string;
  completed_at: string | null;
};

type DemoScan = {
  id: string;
  name: string;
  type: string;
  targets: string;
  issues: number | null;
  critical?: number;
  clean?: boolean;
  date: string;
};

const DEMO_SCANS: DemoScan[] = [
  { id: 'scan_001', name: 'Full scan — acmecorp.com', type: 'Balanced', targets: '2 targets', issues: 11, date: '14 May 09:30' },
  { id: 'scan_002', name: 'Quick scan — techstart.io', type: 'Quick', targets: '1 target', issues: 4, date: '12 May 16:16' },
  { id: 'scan_003', name: 'Weekly scheduled scan', type: 'Balanced', targets: '4 targets', issues: 0, clean: true, date: '5 May 02:00' },
  { id: 'scan_004', name: 'Emerging threat: Log4Shell', type: 'ETS', targets: 'All targets', issues: 2, critical: 2, date: '3 May 14:22' },
  { id: 'scan_005', name: 'API surface scan', type: 'Balanced', targets: '1 target', issues: 7, date: '28 Apr 10:00' },
  { id: 'scan_006', name: 'Monthly full scan', type: 'Balanced', targets: '4 targets', issues: 23, date: '1 Apr 02:00' },
];

type Schedule = {
  id: string;
  domain: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  next_run: string;
  created_at: string;
};

const ETS_CHECKS = [
  { cve: 'CVE-2021-44228', name: 'Log4Shell', date: '3 May 2026', result: '2 critical', critical: true },
  { cve: 'CVE-2023-44487', name: 'HTTP/2 Rapid Reset', date: '15 Apr 2026', result: 'Clean', critical: false },
  { cve: 'CVE-2024-3400', name: 'PAN-OS Command Injection', date: '10 Apr 2026', result: 'Clean', critical: false },
];

function totalIssues(scan: RealScan) {
  const v = scan.stats?.vulnerabilities;
  if (!v) return scan.findings?.length ?? 0;
  return (v.critical ?? 0) + (v.high ?? 0) + (v.medium ?? 0) + (v.low ?? 0);
}

function fmtDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      style={{
        position: 'relative', width: '44px', height: '24px', borderRadius: '999px',
        background: checked ? '#34d399' : 'rgba(255,255,255,0.15)', border: 'none',
        cursor: 'pointer', flexShrink: 0, transition: 'background 0.2s',
      }}
    >
      <span
        style={{
          position: 'absolute', top: '3px', left: checked ? '23px' : '3px',
          width: '18px', height: '18px', borderRadius: '50%', background: '#fff',
          boxShadow: '0 1px 3px rgba(0,0,0,0.3)', transition: 'left 0.2s', display: 'block',
        }}
      />
    </button>
  );
}

type Tab = 'team' | 'ets' | 'settings';

export default function ScansPage() {
  const [tab, setTab] = useState<Tab>('team');
  const [etsDismissed, setEtsDismissed] = useState(false);
  const [monitoring, setMonitoring] = useState({ ets: true, network: true, newService: false });
  const [scanPriority, setScanPriority] = useState('balanced');
  const [copied, setCopied] = useState(false);
  const [realScans, setRealScans] = useState<RealScan[]>([]);
  const [loadingScans, setLoadingScans] = useState(true);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [sched, setSched] = useState({ domain: '', frequency: 'weekly' });
  const [saving, setSaving] = useState(false);
  const [diffs, setDiffs] = useState<Record<string, { newTotal: number; fixedTotal: number; newCritical: number }>>({});
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const IPS = '18.98.162.96/29, 64.52.19.0/24, 18.168.180.128/25, 18.168.224.128/25';

  const fetchScans = async () => {
    try {
      const res = await fetch('/api/scans');
      if (res.ok) {
        const data: RealScan[] = await res.json();
        setRealScans(data);
        // Fetch diffs for completed scans in background
        const completed = data.filter(s => s.status === 'completed');
        completed.forEach(async (scan) => {
          try {
            const dr = await fetch(`/api/scan/${scan.id}/diff`);
            if (dr.ok) {
              const d = await dr.json();
              if (d.hasPrevious) {
                setDiffs(prev => ({ ...prev, [scan.id]: { newTotal: d.newTotal, fixedTotal: d.fixedTotal, newCritical: d.newCritical } }));
              }
            }
          } catch { /* ignore */ }
        });
      }
    } catch { /* ignore */ } finally {
      setLoadingScans(false);
    }
  };

  const fetchSchedules = async () => {
    try {
      const res = await fetch('/api/schedules');
      if (res.ok) setSchedules(await res.json());
    } catch { /* ignore */ }
  };

  const createSchedule = async () => {
    if (!sched.domain) return;
    setSaving(true);
    try {
      const res = await fetch('/api/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: sched.domain, frequency: sched.frequency }),
      });
      if (res.ok) {
        await fetchSchedules();
        setShowModal(false);
        setSched({ domain: '', frequency: 'weekly' });
      }
    } finally {
      setSaving(false);
    }
  };

  const deleteSchedule = async (id: string) => {
    await fetch(`/api/schedules/${id}`, { method: 'DELETE' });
    setSchedules(prev => prev.filter(s => s.id !== id));
  };

  useEffect(() => {
    fetchScans();
    fetchSchedules();
    intervalRef.current = setInterval(fetchScans, 5000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const inProgressScans = realScans.filter(s => s.status === 'queued' || s.status === 'running');
  const completedScans = realScans.filter(s => s.status === 'completed' || s.status === 'failed');
  const hasRealCompleted = completedScans.length > 0;

  // Stats
  const totalScans = realScans.length > 0 ? realScans.length : 47;
  const lastScan = realScans[0] ? fmtDate(realScans[0].created_at) : 'Today';

  const copyIPs = () => {
    navigator.clipboard.writeText(IPS).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div style={{ padding: '32px', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#f0fdf4', margin: 0 }}>Scans</h1>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button onClick={() => setShowModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '9px 16px', borderRadius: '10px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(167,243,208,0.7)', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            Schedule scan
          </button>
          <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '9px 16px', borderRadius: '10px', background: '#34d399', color: '#021a12', fontWeight: 700, fontSize: '0.85rem', border: 'none', cursor: 'pointer', textDecoration: 'none' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            Scan now
          </Link>
        </div>
      </div>

      {/* Stats strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '26px' }}>
        {[
          { label: 'Total scans', value: String(totalScans), sub: 'All time' },
          { label: 'In progress', value: String(inProgressScans.length), sub: inProgressScans.length === 1 ? '1 active' : `${inProgressScans.length} active` },
          { label: 'Completed', value: String(completedScans.length || DEMO_SCANS.length), sub: 'Total results' },
          { label: 'Last scan', value: realScans.length > 0 ? lastScan.split(' ').slice(0, 2).join(' ') : 'Today', sub: realScans.length > 0 ? lastScan.split(' ').slice(2).join(' ') : '09:30' },
        ].map((s, i) => (
          <div key={i} style={{ ...GLASS, borderRadius: '14px', padding: '16px 20px' }}>
            <p style={{ fontSize: '0.75rem', color: 'rgba(167,243,208,0.55)', fontWeight: 500, marginBottom: '6px' }}>{s.label}</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 900, color: '#f0fdf4', margin: 0, lineHeight: 1 }}>{s.value}</p>
            <p style={{ fontSize: '0.7rem', color: 'rgba(167,243,208,0.4)', marginTop: '4px' }}>{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: '22px' }}>
        {([{ key: 'team', label: 'Team' }, { key: 'ets', label: 'Emerging Threats' }, { key: 'settings', label: 'Settings' }] as { key: Tab; label: string }[]).map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{ padding: '10px 18px', fontSize: '0.875rem', fontWeight: 600, color: tab === t.key ? '#34d399' : 'rgba(167,243,208,0.5)', background: 'none', border: 'none', borderBottom: tab === t.key ? '2px solid #34d399' : '2px solid transparent', marginBottom: '-1px', cursor: 'pointer' }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ─── TEAM TAB ─── */}
      {tab === 'team' && (
        <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '18px' }}>

            {/* In Progress */}
            <div style={{ ...GLASS, borderRadius: '16px', overflow: 'hidden' }}>
              <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: inProgressScans.length > 0 ? '#34d399' : 'rgba(167,243,208,0.3)', animation: inProgressScans.length > 0 ? 'pulse 2s infinite' : 'none' }} />
                <h2 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#f0fdf4', margin: 0 }}>In Progress</h2>
                {inProgressScans.length > 0 && (
                  <span style={{ marginLeft: 'auto', fontSize: '0.72rem', fontWeight: 700, background: 'rgba(52,211,153,0.12)', color: '#34d399', padding: '2px 8px', borderRadius: '999px' }}>
                    {inProgressScans.length} running
                  </span>
                )}
              </div>
              {inProgressScans.length === 0 ? (
                <div style={{ padding: '28px', textAlign: 'center' }}>
                  <p style={{ fontSize: '0.85rem', color: 'rgba(167,243,208,0.4)' }}>No scans currently running</p>
                </div>
              ) : (
                inProgressScans.map((scan, i) => (
                  <Link
                    key={scan.id}
                    href={`/dashboard/scans/${scan.id}`}
                    style={{
                      display: 'block', padding: '16px 20px', textDecoration: 'none',
                      borderBottom: i < inProgressScans.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                      background: 'rgba(255,255,255,0.018)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div>
                        <p style={{ fontSize: '0.86rem', fontWeight: 700, color: '#f0fdf4', margin: 0 }}>{scan.domain}</p>
                        <p style={{ fontSize: '0.72rem', color: 'rgba(167,243,208,0.5)', marginTop: '2px' }}>{scan.current_step}</p>
                      </div>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, background: scan.status === 'running' ? 'rgba(52,211,153,0.12)' : 'rgba(255,255,255,0.08)', color: scan.status === 'running' ? '#34d399' : 'rgba(167,243,208,0.5)', padding: '3px 10px', borderRadius: '999px' }}>
                        {scan.status === 'running' ? 'Running' : 'Queued'}
                      </span>
                    </div>
                    <div style={{ height: '4px', borderRadius: '999px', background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${scan.progress}%`, background: 'linear-gradient(90deg, #34d399, #059669)', borderRadius: '999px', transition: 'width 0.5s ease' }} />
                    </div>
                    <p style={{ fontSize: '0.68rem', color: 'rgba(167,243,208,0.4)', marginTop: '5px', textAlign: 'right' }}>{scan.progress}%</p>
                  </Link>
                ))
              )}
            </div>

            {/* Completed */}
            <div style={{ ...GLASS, borderRadius: '16px', overflow: 'hidden' }}>
              <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h2 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#f0fdf4', margin: 0 }}>Completed</h2>
                <span style={{ fontSize: '0.75rem', color: 'rgba(167,243,208,0.4)' }}>
                  {hasRealCompleted ? `${completedScans.length} scan${completedScans.length !== 1 ? 's' : ''}` : `${DEMO_SCANS.length} scans`}
                </span>
              </div>

              {/* Table header */}
              <div style={{ display: 'grid', gridTemplateColumns: hasRealCompleted ? '2fr 80px 80px 80px 130px 80px' : '2.5fr 100px 80px 80px 120px 80px', padding: '10px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.04)' }}>
                {(hasRealCompleted ? ['Domain', 'Status', 'Subdomains', 'Issues', 'Date', ''] : ['Scan', 'Type', 'Targets', 'Issues', 'Date', '']).map(h => (
                  <span key={h} style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'rgba(167,243,208,0.4)' }}>{h}</span>
                ))}
              </div>

              {/* Real scans */}
              {hasRealCompleted && completedScans.map((scan, i) => {
                const issues = totalIssues(scan);
                const critCount = scan.stats?.vulnerabilities?.critical ?? 0;
                const subdomains = scan.stats?.assetsDiscovered ?? 0;
                return (
                  <div
                    key={scan.id}
                    style={{ display: 'grid', gridTemplateColumns: '2fr 80px 80px 80px 130px 80px', padding: '14px 20px', borderBottom: i < completedScans.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', alignItems: 'center', background: 'rgba(255,255,255,0.018)', transition: 'background 0.12s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.04)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.018)'; }}
                  >
                    <p style={{ fontSize: '0.86rem', fontWeight: 600, color: '#f0fdf4', margin: 0 }}>{scan.domain}</p>

                    <span style={{ fontSize: '0.72rem', fontWeight: 600, padding: '3px 8px', borderRadius: '999px', background: scan.status === 'completed' ? 'rgba(52,211,153,0.1)' : 'rgba(239,68,68,0.1)', color: scan.status === 'completed' ? '#34d399' : '#ef4444', display: 'inline-block' }}>
                      {scan.status === 'completed' ? 'Done' : 'Failed'}
                    </span>

                    <span style={{ fontSize: '0.8rem', color: 'rgba(167,243,208,0.6)' }}>{subdomains}</span>

                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      {issues === 0 ? (
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#34d399', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                          Clean
                        </span>
                      ) : critCount > 0 ? (
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#ef4444' }}>{critCount} critical</span>
                      ) : (
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#f0fdf4' }}>{issues}</span>
                      )}
                      {diffs[scan.id]?.newTotal > 0 && (
                        <span title={`${diffs[scan.id].newTotal} new vs previous scan`} style={{ fontSize: '0.65rem', fontWeight: 700, color: '#f59e0b', background: 'rgba(245,158,11,0.12)', padding: '1px 6px', borderRadius: '999px', border: '1px solid rgba(245,158,11,0.2)' }}>
                          +{diffs[scan.id].newTotal} new
                        </span>
                      )}
                      {diffs[scan.id]?.fixedTotal > 0 && (
                        <span title={`${diffs[scan.id].fixedTotal} fixed vs previous scan`} style={{ fontSize: '0.65rem', fontWeight: 700, color: '#34d399', background: 'rgba(52,211,153,0.1)', padding: '1px 6px', borderRadius: '999px', border: '1px solid rgba(52,211,153,0.2)' }}>
                          -{diffs[scan.id].fixedTotal} fixed
                        </span>
                      )}
                    </span>

                    <span style={{ fontSize: '0.75rem', color: 'rgba(167,243,208,0.5)' }}>{fmtDate(scan.created_at)}</span>

                    <Link href={`/dashboard/scans/${scan.id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '5px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(167,243,208,0.7)', fontSize: '0.75rem', fontWeight: 600, textDecoration: 'none' }}>
                      View
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
                    </Link>
                  </div>
                );
              })}

              {/* Demo scans (shown when no real scans yet) */}
              {!hasRealCompleted && (
                <>
                  {loadingScans ? (
                    <div style={{ padding: '28px', textAlign: 'center' }}>
                      <p style={{ fontSize: '0.85rem', color: 'rgba(167,243,208,0.4)' }}>Loading scans…</p>
                    </div>
                  ) : (
                    DEMO_SCANS.map((scan, i) => (
                      <div
                        key={scan.id}
                        style={{ display: 'grid', gridTemplateColumns: '2.5fr 100px 80px 80px 120px 80px', padding: '14px 20px', borderBottom: i < DEMO_SCANS.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', alignItems: 'center', background: 'rgba(255,255,255,0.018)', transition: 'background 0.12s' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.04)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.018)'; }}
                      >
                        <p style={{ fontSize: '0.86rem', fontWeight: 600, color: '#f0fdf4', margin: 0 }}>{scan.name}</p>
                        <span style={{ fontSize: '0.72rem', fontWeight: 600, padding: '3px 8px', borderRadius: '999px', background: scan.type === 'ETS' ? 'rgba(167,139,250,0.15)' : scan.type === 'Quick' ? 'rgba(59,130,246,0.12)' : 'rgba(52,211,153,0.1)', color: scan.type === 'ETS' ? '#a78bfa' : scan.type === 'Quick' ? '#3b82f6' : '#34d399', display: 'inline-block' }}>
                          {scan.type}
                        </span>
                        <span style={{ fontSize: '0.8rem', color: 'rgba(167,243,208,0.6)' }}>{scan.targets}</span>
                        <span>
                          {scan.clean ? (
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#34d399', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                              Clean
                            </span>
                          ) : scan.critical ? (
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#ef4444' }}>{scan.critical} critical</span>
                          ) : (
                            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#f0fdf4' }}>{scan.issues}</span>
                          )}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'rgba(167,243,208,0.5)' }}>{scan.date}</span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '5px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', color: 'rgba(167,243,208,0.3)', fontSize: '0.75rem', fontWeight: 600 }}>Demo</span>
                      </div>
                    ))
                  )}
                </>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div style={{ width: '260px', flexShrink: 0 }}>
            <div style={{ ...GLASS, borderRadius: '16px', overflow: 'hidden' }}>
              <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h2 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#f0fdf4', margin: 0 }}>Scheduled</h2>
                <span style={{ fontSize: '0.68rem', fontWeight: 700, background: 'rgba(52,211,153,0.12)', color: '#34d399', padding: '2px 8px', borderRadius: '999px' }}>{schedules.length}</span>
              </div>
              {schedules.length === 0 ? (
                <div style={{ padding: '20px 18px', textAlign: 'center' }}>
                  <p style={{ fontSize: '0.8rem', color: 'rgba(167,243,208,0.35)', margin: 0 }}>No schedules yet</p>
                  <button onClick={() => setShowModal(true)} style={{ marginTop: '10px', fontSize: '0.75rem', fontWeight: 600, color: '#34d399', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
                    + Add one
                  </button>
                </div>
              ) : schedules.map((s, i) => (
                <div key={s.id} style={{ padding: '13px 18px', borderBottom: i < schedules.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f0fdf4', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.domain}</p>
                      <p style={{ fontSize: '0.72rem', color: 'rgba(167,243,208,0.5)', margin: '0 0 2px', textTransform: 'capitalize' }}>Repeats {s.frequency}</p>
                      <p style={{ fontSize: '0.68rem', color: 'rgba(167,243,208,0.4)', margin: 0 }}>
                        Next: {new Date(s.next_run).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <button onClick={() => deleteSchedule(s.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(239,68,68,0.5)', padding: '2px', flexShrink: 0 }}
                      title="Delete schedule"
                      onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'rgba(239,68,68,0.5)')}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── EMERGING THREATS TAB ─── */}
      {tab === 'ets' && (
        <div>
          {!etsDismissed && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', padding: '16px 20px', borderRadius: '14px', background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.2)', marginBottom: '20px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" style={{ flexShrink: 0, marginTop: '1px' }}><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 700, fontSize: '0.875rem', color: '#f0fdf4', marginBottom: '4px' }}>Emerging Threat Scans (ETS)</p>
                <p style={{ fontSize: '0.82rem', color: 'rgba(167,243,208,0.55)', lineHeight: 1.6 }}>
                  When Vyzor discovers a new critical threat, we automatically scan all your licensed targets within hours — before attackers can exploit them. ETS checks run silently in the background and only notify you if a threat is detected.
                </p>
              </div>
              <button onClick={() => setEtsDismissed(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(167,243,208,0.4)', flexShrink: 0 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>
          )}
          <div style={{ ...GLASS, borderRadius: '16px', overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <h2 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#f0fdf4', margin: 0 }}>Recent ETS checks</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '160px 1.5fr 1fr 1fr', padding: '10px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.04)' }}>
              {['CVE', 'Vulnerability', 'Date', 'Result'].map(h => (
                <span key={h} style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'rgba(167,243,208,0.4)' }}>{h}</span>
              ))}
            </div>
            {ETS_CHECKS.map((c, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '160px 1.5fr 1fr 1fr', padding: '14px 20px', borderBottom: i < ETS_CHECKS.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, fontFamily: 'monospace', color: '#a78bfa', background: 'rgba(167,139,250,0.1)', padding: '3px 9px', borderRadius: '6px', display: 'inline-block' }}>{c.cve}</span>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#f0fdf4' }}>{c.name}</span>
                <span style={{ fontSize: '0.8rem', color: 'rgba(167,243,208,0.55)' }}>{c.date}</span>
                <span>
                  {c.critical ? (
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#ef4444', background: 'rgba(239,68,68,0.12)', padding: '3px 10px', borderRadius: '999px', border: '1px solid rgba(239,68,68,0.2)' }}>{c.result}</span>
                  ) : (
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#34d399', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                      Clean
                    </span>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── SETTINGS TAB ─── */}
      {tab === 'settings' && (
        <div style={{ maxWidth: '680px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div style={{ ...GLASS, borderRadius: '16px', overflow: 'hidden' }}>
            <div style={{ padding: '16px 22px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <h2 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#f0fdf4', margin: 0 }}>Monitoring features</h2>
              <p style={{ fontSize: '0.78rem', color: 'rgba(167,243,208,0.55)', marginTop: '4px' }}>Automatic scans that keep your targets monitored 24/7</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginTop: '8px' }}>
                <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#34d399' }} />
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#34d399' }}>{Object.values(monitoring).filter(Boolean).length}/3 features enabled</span>
              </div>
            </div>
            <div style={{ padding: '16px 22px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { key: 'ets' as keyof typeof monitoring, label: 'Emerging threat scans', desc: 'Auto-scan all targets when a new critical CVE is discovered', icon: '⚡' },
                { key: 'network' as keyof typeof monitoring, label: 'Network scans', desc: 'Continuous network scanning — required for Smart Recon to function', icon: '🌐' },
                { key: 'newService' as keyof typeof monitoring, label: 'New service scans', desc: 'Trigger a scan automatically when a new service is detected on a target', icon: '🔍' },
              ].map(feat => (
                <div key={feat.key} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px', borderRadius: '12px', background: monitoring[feat.key] ? 'rgba(52,211,153,0.06)' : 'rgba(255,255,255,0.04)', border: `1px solid ${monitoring[feat.key] ? 'rgba(52,211,153,0.15)' : 'rgba(255,255,255,0.08)'}` }}>
                  <span style={{ fontSize: '1.2rem' }}>{feat.icon}</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#f0fdf4', margin: 0 }}>{feat.label}</p>
                    <p style={{ fontSize: '0.75rem', color: 'rgba(167,243,208,0.5)', marginTop: '3px' }}>{feat.desc}</p>
                  </div>
                  <Toggle checked={monitoring[feat.key]} onChange={() => setMonitoring(p => ({ ...p, [feat.key]: !p[feat.key] }))} />
                </div>
              ))}
            </div>
          </div>

          <div style={{ ...GLASS, borderRadius: '16px', overflow: 'hidden' }}>
            <div style={{ padding: '16px 22px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <h2 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#f0fdf4', margin: 0 }}>Scanner access</h2>
              <p style={{ fontSize: '0.78rem', color: 'rgba(167,243,208,0.55)', marginTop: '4px' }}>Ensure Vyzor's scanners can reach all your targets</p>
            </div>
            <div style={{ padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'rgba(167,243,208,0.7)', marginBottom: '6px' }}>Scan region</label>
                <p style={{ fontSize: '0.75rem', color: 'rgba(167,243,208,0.4)', marginBottom: '8px' }}>Choose the region closest to your targets for faster scan times</p>
                <select style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', color: '#f0fdf4', fontSize: '0.875rem', outline: 'none' }}>
                  <option>Europe (London)</option>
                  <option>US East (Virginia)</option>
                  <option>US West (Oregon)</option>
                  <option>Asia Pacific (Singapore)</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'rgba(167,243,208,0.7)', marginBottom: '6px' }}>Allowlist IPs</label>
                <p style={{ fontSize: '0.75rem', color: 'rgba(167,243,208,0.4)', marginBottom: '8px' }}>Add these IPs to your firewall or WAF allowlist to allow scanner traffic</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <span style={{ flex: 1, fontSize: '0.75rem', fontFamily: 'monospace', color: 'rgba(167,243,208,0.7)', wordBreak: 'break-all' }}>{IPS}</span>
                  <button onClick={copyIPs} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 10px', borderRadius: '7px', background: copied ? 'rgba(52,211,153,0.15)' : 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: copied ? '#34d399' : 'rgba(167,243,208,0.7)', fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer', flexShrink: 0 }}>
                    {copied ? (
                      <><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>Copied</>
                    ) : (
                      <><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>Copy</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div style={{ ...GLASS, borderRadius: '16px', overflow: 'hidden' }}>
            <div style={{ padding: '16px 22px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <h2 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#f0fdf4', margin: 0 }}>Scan priority</h2>
              <p style={{ fontSize: '0.78rem', color: 'rgba(167,243,208,0.55)', marginTop: '4px' }}>Prioritise scan speed or detection depth</p>
            </div>
            <div style={{ padding: '16px 22px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { value: 'balanced', label: 'Balanced (recommended)', desc: 'Best balance of scan time and vulnerability detection coverage' },
                { value: 'quick', label: 'Quick scans', desc: 'Shorter scan time — may not detect all vulnerabilities' },
              ].map(opt => (
                <label key={opt.value} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '14px 16px', borderRadius: '12px', background: scanPriority === opt.value ? 'rgba(52,211,153,0.07)' : 'rgba(255,255,255,0.04)', border: `1px solid ${scanPriority === opt.value ? 'rgba(52,211,153,0.2)' : 'rgba(255,255,255,0.08)'}`, cursor: 'pointer' }}>
                  <input type="radio" name="scanPriority" value={opt.value} checked={scanPriority === opt.value} onChange={() => setScanPriority(opt.value)} style={{ accentColor: '#34d399', marginTop: '2px' }} />
                  <div>
                    <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#f0fdf4', margin: 0 }}>{opt.label}</p>
                    <p style={{ fontSize: '0.75rem', color: 'rgba(167,243,208,0.5)', marginTop: '3px' }}>{opt.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── Schedule Modal ─── */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setShowModal(false)}>
          <div style={{ ...GLASS, borderRadius: '20px', padding: '28px', width: '380px', maxWidth: '90vw' }} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f0fdf4', margin: '0 0 6px' }}>Schedule a scan</h2>
            <p style={{ fontSize: '0.8rem', color: 'rgba(167,243,208,0.5)', margin: '0 0 22px' }}>Vyzor will automatically scan this domain on your chosen schedule.</p>

            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'rgba(167,243,208,0.7)', marginBottom: '6px' }}>Domain</label>
            <input
              value={sched.domain}
              onChange={e => setSched(p => ({ ...p, domain: e.target.value }))}
              placeholder="example.com"
              style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: '#f0fdf4', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box', marginBottom: '16px' }}
            />

            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'rgba(167,243,208,0.7)', marginBottom: '8px' }}>Frequency</label>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
              {(['daily', 'weekly', 'monthly'] as const).map(f => (
                <button key={f} onClick={() => setSched(p => ({ ...p, frequency: f }))} style={{ flex: 1, padding: '8px 0', borderRadius: '9px', border: `1px solid ${sched.frequency === f ? '#34d399' : 'rgba(255,255,255,0.12)'}`, background: sched.frequency === f ? 'rgba(52,211,153,0.12)' : 'rgba(255,255,255,0.04)', color: sched.frequency === f ? '#34d399' : 'rgba(167,243,208,0.6)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize' }}>
                  {f}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setShowModal(false)} style={{ flex: 1, padding: '10px', borderRadius: '10px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(167,243,208,0.6)', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={createSchedule} disabled={saving || !sched.domain} style={{ flex: 1, padding: '10px', borderRadius: '10px', background: sched.domain && !saving ? '#34d399' : 'rgba(52,211,153,0.3)', color: '#021a12', fontSize: '0.875rem', fontWeight: 700, cursor: sched.domain && !saving ? 'pointer' : 'default', border: 'none' }}>
                {saving ? 'Saving…' : 'Create schedule'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}
