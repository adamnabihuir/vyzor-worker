'use client';

import { useState, useEffect } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

type Issue = {
  id: string | number;
  title: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low' | 'Info';
  occurrences: number;
  target: string;
  hygiene: boolean;
  cvss: number;
  epss: number;
  cve?: string;
  status: string;
  discovered: string;
  description: string;
  remediation: string;
  references: string[];
  source?: 'nmap' | 'nuclei';
  isDemo?: boolean;
};

// ─── Demo data (shown when no real scans yet) ─────────────────────────────────

const DEMO_ISSUES: Issue[] = [
  { id: 1, title: 'Apache Log4j Remote Code Execution (Log4Shell)', severity: 'Critical', occurrences: 2, target: 'api.acmecorp.com', hygiene: false, cvss: 10.0, epss: 0.974, cve: 'CVE-2021-44228', status: 'open', discovered: '14 May 2025', description: 'A critical vulnerability in Apache Log4j allows unauthenticated remote code execution via specially crafted JNDI lookup strings.', remediation: 'Upgrade Log4j to version 2.17.1 or later. Apply the JVM flag `-Dlog4j2.formatMsgNoLookups=true` as a temporary mitigation.', references: ['https://nvd.nist.gov/vuln/detail/CVE-2021-44228', 'https://logging.apache.org/log4j/2.x/security.html'], isDemo: true },
  { id: 2, title: 'Exposed RDP Port (3389) Without MFA', severity: 'Critical', occurrences: 1, target: 'admin.acmecorp.com', hygiene: false, cvss: 9.8, epss: 0.423, status: 'open', discovered: '14 May 2025', description: 'RDP port 3389 is exposed to the public internet without multi-factor authentication, making it vulnerable to brute-force attacks.', remediation: 'Restrict RDP access via firewall rules to trusted IPs only, or place behind a VPN. Enable NLA and MFA.', references: [], isDemo: true },
  { id: 3, title: 'SQL Injection in Login Endpoint', severity: 'Critical', occurrences: 1, target: 'app.acmecorp.com', hygiene: false, cvss: 9.1, epss: 0.189, status: 'open', discovered: '13 May 2025', description: 'The /api/auth/login endpoint is vulnerable to SQL injection, allowing an attacker to bypass authentication or extract the full database.', remediation: 'Use parameterized queries or prepared statements. Implement a WAF rule to block SQL injection patterns.', references: ['https://owasp.org/www-community/attacks/SQL_Injection'], isDemo: true },
  { id: 4, title: 'SSL Certificate Expiring in 7 Days', severity: 'High', occurrences: 1, target: 'mail.acmecorp.com', hygiene: false, cvss: 7.5, epss: 0.05, status: 'open', discovered: '12 May 2025', description: 'The SSL/TLS certificate for mail.acmecorp.com expires in 7 days.', remediation: "Renew the certificate immediately. Consider enabling auto-renewal via Let's Encrypt.", references: [], isDemo: true },
  { id: 5, title: 'Open RDP Port Exposed', severity: 'High', occurrences: 1, target: 'techstart.io', hygiene: false, cvss: 7.4, epss: 0.12, status: 'open', discovered: '12 May 2025', description: 'TCP port 3389 (RDP) is exposed publicly without access controls.', remediation: 'Close the port or restrict via firewall to specific IPs. Use a VPN for remote access.', references: [], isDemo: true },
  { id: 6, title: 'Missing HTTP Security Headers', severity: 'Medium', occurrences: 5, target: 'www.acmecorp.com', hygiene: true, cvss: 5.4, epss: 0.003, status: 'open', discovered: '11 May 2025', description: 'The server does not return critical security headers: Content-Security-Policy, X-Frame-Options, and Strict-Transport-Security.', remediation: 'Add the missing headers in your web server configuration (nginx/Apache) or application middleware.', references: ['https://securityheaders.com'], isDemo: true },
  { id: 7, title: 'Insecure TLS 1.0 / 1.1 Enabled', severity: 'Medium', occurrences: 3, target: 'www.acmecorp.com', hygiene: true, cvss: 5.3, epss: 0.002, status: 'open', discovered: '11 May 2025', description: 'The server accepts connections using deprecated TLS 1.0 and TLS 1.1 protocols, which have known vulnerabilities.', remediation: 'Disable TLS 1.0 and 1.1 in your server configuration. Enforce TLS 1.2 minimum, prefer TLS 1.3.', references: [], isDemo: true },
  { id: 8, title: 'Insecure SSH Ciphers Accepted', severity: 'Medium', occurrences: 6, target: 'api.acmecorp.com', hygiene: true, cvss: 5.3, epss: 0.001, status: 'open', discovered: '10 May 2025', description: 'The SSH server accepts weak cipher suites including arcfour and 3des-cbc which are considered cryptographically insecure.', remediation: 'Update /etc/ssh/sshd_config to remove deprecated ciphers. Allow only modern ciphers like chacha20-poly1305 and aes256-gcm.', references: [], isDemo: true },
  { id: 9, title: 'Directory Listing Enabled', severity: 'Low', occurrences: 2, target: 'cdn.acmecorp.com', hygiene: false, cvss: 3.7, epss: 0.001, status: 'open', discovered: '10 May 2025', description: 'The web server has directory listing enabled, exposing file and folder structures to unauthenticated users.', remediation: 'Disable directory listing in your nginx/Apache configuration with `Options -Indexes`.', references: [], isDemo: true },
  { id: 10, title: 'Weak SSH Key Exchange Algorithms', severity: 'Low', occurrences: 1, target: 'api.acmecorp.com:22', hygiene: true, cvss: 3.1, epss: 0.001, status: 'open', discovered: '10 May 2025', description: 'The SSH server supports diffie-hellman-group1-sha1 (Logjam/FREAK vulnerable) for key exchange.', remediation: 'Remove weak KEX algorithms from the SSH server configuration and use only curve25519-sha256 or diffie-hellman-group14-sha256.', references: [], isDemo: true },
];

const NOISE_ITEMS = [
  'Web Application Scanning Consolidation / Info Reporting', 'CPE Inventory', 'Host Summary',
  'Hostname Determination Reporting', 'OS Detection Consolidation and Reporting', 'Services',
  'TCP Timestamps Information Disclosure', 'Traceroute', 'SSL/TLS: Report Non Weak Cipher Suites',
  'SSL/TLS: Report Medium Cipher Suites',
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const SEV_COLOR: Record<string, string> = {
  Critical: '#ef4444', High: '#f59e0b', Medium: '#3b82f6', Low: '#34d399', Info: '#94a3b8',
};

const DEFAULT_CVSS: Record<string, number> = {
  critical: 9.0, high: 7.5, medium: 5.0, low: 3.0, info: 0,
};

const GLASS: React.CSSProperties = {
  background: 'rgba(255,255,255,0.07)',
  backdropFilter: 'blur(18px)',
  WebkitBackdropFilter: 'blur(18px)',
  border: '1px solid rgba(255,255,255,0.13)',
  boxShadow: '0 4px 28px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.1)',
};

function capitalize(s: string): Issue['severity'] {
  return (s.charAt(0).toUpperCase() + s.slice(1)) as Issue['severity'];
}

function fmtDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapFinding(f: any, idx: number): Issue {
  const sev = capitalize(f.severity ?? 'low');
  return {
    id: f.id ?? `real-${idx}`,
    title: f.title ?? 'Unknown finding',
    severity: sev,
    occurrences: 1,
    target: f.asset ?? f.scanDomain ?? '',
    hygiene: false,
    cvss: typeof f.cvss === 'number' ? f.cvss : DEFAULT_CVSS[f.severity?.toLowerCase() ?? 'low'] ?? 0,
    epss: 0,
    cve: f.cve ?? undefined,
    status: 'open',
    discovered: f.discovered ? fmtDate(f.discovered) : '—',
    description: f.description ?? '',
    remediation: f.remediation ?? '',
    references: [],
    source: f.source,
    isDemo: false,
  };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SeverityBadge({ severity }: { severity: string }) {
  const color = SEV_COLOR[severity] ?? '#94a3b8';
  return (
    <span className="text-xs font-bold px-2 py-0.5 rounded-full"
      style={{ background: `${color}18`, color, border: `1px solid ${color}30` }}>
      {severity}
    </span>
  );
}

function EpssBar({ value }: { value: number }) {
  const color = value > 0.5 ? '#ef4444' : value > 0.1 ? '#f59e0b' : '#34d399';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 rounded-full h-1.5" style={{ background: 'rgba(255,255,255,0.1)' }}>
        <div className="h-1.5 rounded-full transition-all" style={{ width: `${value * 100}%`, background: color }} />
      </div>
      <span className="text-xs font-mono font-semibold" style={{ color }}>{(value * 100).toFixed(1)}%</span>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function VulnerabilitiesPage() {
  const [tab, setTab] = useState<'current' | 'fixed' | 'snoozed' | 'noise'>('current');
  const [selected, setSelected] = useState<Issue | null>(null);
  const [severityFilter, setSeverityFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/vulnerabilities')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setIssues(data.filter((f: { severity?: string }) => f.severity !== 'info').map(mapFinding));
        } else {
          setIssues(DEMO_ISSUES);
        }
      })
      .catch(() => setIssues(DEMO_ISSUES))
      .finally(() => setLoading(false));
  }, []);

  const displayIssues = loading ? [] : issues;

  const filtered = displayIssues.filter(i => {
    const matchSev = severityFilter === 'All' || i.severity === severityFilter;
    const matchSearch = !search || i.title.toLowerCase().includes(search.toLowerCase()) || i.target.toLowerCase().includes(search.toLowerCase());
    return matchSev && matchSearch;
  });

  const counts = {
    Critical: displayIssues.filter(i => i.severity === 'Critical').length,
    High: displayIssues.filter(i => i.severity === 'High').length,
    Medium: displayIssues.filter(i => i.severity === 'Medium').length,
    Low: displayIssues.filter(i => i.severity === 'Low').length,
  };

  const hasRealData = issues.length > 0 && !issues[0]?.isDemo;

  return (
    <div className="p-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-black text-2xl mb-1" style={{ color: '#f0fdf4' }}>Issues</h1>
          <p className="text-sm" style={{ color: 'rgba(167,243,208,0.5)' }}>
            {hasRealData ? `Real findings from your scans` : 'Security findings across all your targets'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="text-xs font-semibold px-3 py-2 rounded-lg flex items-center gap-1.5"
            style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(167,243,208,0.6)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            View all checks
          </button>
          <button className="text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2"
            style={{ background: '#34d399', color: '#021a12' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m14.5 2-8.5 8.5 1.5 1.5 8.5-8.5-1.5-1.5z"/><path d="m7 14-5 5"/><path d="m15.5 4.5 4 4"/></svg>
            New pentest
          </button>
        </div>
      </div>

      {/* Severity summary strip */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {(['Critical', 'High', 'Medium', 'Low'] as const).map(sev => (
          <button key={sev} onClick={() => setSeverityFilter(s => s === sev ? 'All' : sev)}
            className="rounded-2xl px-4 py-3 text-left transition-all"
            style={{ ...GLASS, border: severityFilter === sev ? `1px solid ${SEV_COLOR[sev]}50` : GLASS.border, background: severityFilter === sev ? `${SEV_COLOR[sev]}10` : GLASS.background }}>
            <p className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: SEV_COLOR[sev] }}>{sev}</p>
            <p className="font-black text-2xl" style={{ color: SEV_COLOR[sev] }}>
              {loading ? '—' : counts[sev]}
            </p>
            <p className="text-xs mt-1" style={{ color: 'rgba(167,243,208,0.45)' }}>
              {loading ? 'loading…' : counts[sev] === 1 ? 'issue' : 'issues'}
            </p>
          </button>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-0 mb-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        {([
          { key: 'current', label: 'Current', count: displayIssues.length },
          { key: 'fixed', label: 'Fixed', count: null },
          { key: 'snoozed', label: 'Snoozed', count: null },
          { key: 'noise', label: 'Noise', count: NOISE_ITEMS.length },
        ] as const).map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className="px-4 py-2.5 text-sm font-semibold flex items-center gap-1.5 transition-all"
            style={{ color: tab === t.key ? '#34d399' : 'rgba(167,243,208,0.5)', borderBottom: tab === t.key ? '2px solid #34d399' : '2px solid transparent', marginBottom: '-1px' }}>
            {t.label}
            {t.count !== null && (
              <span className="text-xs font-bold px-1.5 py-0.5 rounded-full"
                style={{ background: tab === t.key ? 'rgba(52,211,153,0.15)' : 'rgba(255,255,255,0.07)', color: tab === t.key ? '#34d399' : 'rgba(167,243,208,0.5)' }}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* CURRENT TAB */}
      {tab === 'current' && (
        <>
          {/* Demo notice */}
          {!hasRealData && !loading && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl mb-4 text-sm"
              style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <span style={{ color: 'rgba(167,243,208,0.7)' }}>
                Showing <strong style={{ color: '#f0fdf4' }}>demo data</strong> — run a deep scan to see your real findings here.
              </span>
            </div>
          )}

          {/* Source badge for real data */}
          {hasRealData && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl mb-4 text-sm"
              style={{ background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.18)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
              <span style={{ color: 'rgba(167,243,208,0.7)' }}>
                <strong style={{ color: '#34d399' }}>{displayIssues.length} real findings</strong> from your scans — powered by nmap + nuclei.
              </span>
            </div>
          )}

          {/* Filter bar */}
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <span className="text-xs font-semibold" style={{ color: 'rgba(167,243,208,0.5)' }}>
              {filtered.length} issues · {filtered.reduce((a, i) => a + i.occurrences, 0)} occurrences
            </span>
            <div className="ml-auto flex items-center gap-2">
              <div className="relative">
                <svg className="absolute left-2.5 top-1/2 -translate-y-1/2" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(167,243,208,0.4)" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                <input type="text" placeholder="Search issues…" value={search} onChange={e => setSearch(e.target.value)}
                  className="scan-input rounded-lg pl-8 pr-3 py-1.5 text-xs" style={{ width: '170px' }} />
              </div>
              {(['All', 'Critical', 'High', 'Medium', 'Low'] as const).map(s => (
                <button key={s} onClick={() => setSeverityFilter(s)}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
                  style={{ background: severityFilter === s ? (s === 'All' ? 'rgba(52,211,153,0.15)' : `${SEV_COLOR[s]}18`) : 'rgba(255,255,255,0.06)', color: severityFilter === s ? (s === 'All' ? '#34d399' : SEV_COLOR[s]) : 'rgba(167,243,208,0.5)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  {s}
                </button>
              ))}
              <button className="text-xs font-semibold px-3 py-1.5 rounded-lg"
                style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(167,243,208,0.5)', border: '1px solid rgba(255,255,255,0.08)' }}>
                Export
              </button>
            </div>
          </div>

          {/* Issue list + detail panel */}
          <div className="flex gap-4 min-h-0">
            <div className="rounded-2xl overflow-hidden flex-shrink-0 transition-all"
              style={{ ...GLASS, width: selected ? '50%' : '100%' }}>

              <div className="px-5 py-3 flex items-center gap-4 text-xs font-bold uppercase tracking-wide"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', color: 'rgba(167,243,208,0.4)' }}>
                <span className="flex-1">Issue</span>
                <span style={{ width: '80px' }}>Severity</span>
                <span style={{ width: '50px', textAlign: 'right' }}>CVSS</span>
                <span style={{ width: '24px' }} />
              </div>

              {loading ? (
                <div className="px-5 py-12 text-center">
                  <p className="text-sm" style={{ color: 'rgba(167,243,208,0.4)' }}>Loading findings…</p>
                </div>
              ) : filtered.length === 0 ? (
                <div className="px-5 py-12 text-center">
                  <p className="text-sm" style={{ color: 'rgba(167,243,208,0.4)' }}>No issues match the current filters.</p>
                </div>
              ) : (
                filtered.map((issue, i) => (
                  <div key={String(issue.id)} onClick={() => setSelected(s => s?.id === issue.id ? null : issue)}
                    className="px-5 py-4 cursor-pointer transition-all"
                    style={{ borderBottom: i < filtered.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none', background: selected?.id === issue.id ? 'rgba(52,211,153,0.08)' : 'transparent', borderLeft: selected?.id === issue.id ? '3px solid #34d399' : '3px solid transparent' }}
                    onMouseEnter={e => { if (selected?.id !== issue.id) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                    onMouseLeave={e => { if (selected?.id !== issue.id) e.currentTarget.style.background = 'transparent'; }}>
                    <div className="flex items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          {issue.cve && <span className="text-xs font-mono" style={{ color: '#a78bfa' }}>{issue.cve}</span>}
                          {issue.source && (
                            <span className="text-xs font-bold px-1.5 rounded" style={{ background: issue.source === 'nuclei' ? 'rgba(167,139,250,0.12)' : 'rgba(59,130,246,0.12)', color: issue.source === 'nuclei' ? '#a78bfa' : '#3b82f6' }}>
                              {issue.source}
                            </span>
                          )}
                          {issue.epss > 0.1 && <span className="text-xs font-bold px-1.5 rounded" style={{ background: 'rgba(239,68,68,0.12)', color: '#ef4444' }}>EXPLOIT</span>}
                        </div>
                        <p className="font-semibold text-sm truncate" style={{ color: '#f0fdf4' }}>{issue.title}</p>
                        <p className="text-xs mt-0.5 font-mono truncate" style={{ color: 'rgba(167,243,208,0.45)' }}>
                          {issue.target} · {issue.occurrences} occurrence{issue.occurrences !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <div style={{ width: '80px', flexShrink: 0 }}>
                        <SeverityBadge severity={issue.severity} />
                      </div>
                      <div style={{ width: '50px', flexShrink: 0, textAlign: 'right' }}>
                        <span className="text-sm font-bold" style={{ color: SEV_COLOR[issue.severity] }}>{issue.cvss.toFixed(1)}</span>
                      </div>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(167,243,208,0.3)" strokeWidth="1.5"
                        style={{ flexShrink: 0, transform: selected?.id === issue.id ? 'rotate(90deg)' : undefined, transition: 'transform 0.2s' }}>
                        <polyline points="9 18 15 12 9 6"/>
                      </svg>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Detail panel */}
            {selected && (
              <div className="rounded-2xl overflow-hidden flex-1 min-w-0" style={GLASS}>
                <div className="px-6 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2 flex-wrap">
                      <SeverityBadge severity={selected.severity} />
                      {selected.cve && <span className="text-xs font-mono px-2 py-0.5 rounded-full" style={{ background: 'rgba(167,139,250,0.12)', color: '#a78bfa' }}>{selected.cve}</span>}
                      {selected.source && <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: selected.source === 'nuclei' ? 'rgba(167,139,250,0.12)' : 'rgba(59,130,246,0.12)', color: selected.source === 'nuclei' ? '#a78bfa' : '#3b82f6' }}>{selected.source}</span>}
                    </div>
                    <button onClick={() => setSelected(null)} style={{ color: 'rgba(167,243,208,0.4)' }}
                      onMouseEnter={e => e.currentTarget.style.color = '#f0fdf4'}
                      onMouseLeave={e => e.currentTarget.style.color = 'rgba(167,243,208,0.4)'}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                  </div>
                  <h3 className="font-black text-base mt-3" style={{ color: '#f0fdf4' }}>{selected.title}</h3>
                </div>

                <div className="px-6 py-4 space-y-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 280px)' }}>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: 'Target', value: selected.target, mono: true },
                      { label: 'Occurrences', value: String(selected.occurrences), mono: false },
                      { label: 'Discovered', value: selected.discovered, mono: false },
                      { label: 'CVSS Score', value: selected.cvss.toFixed(1), mono: false },
                    ].map(({ label, value, mono }) => (
                      <div key={label} className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.05)' }}>
                        <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: 'rgba(167,243,208,0.4)' }}>{label}</p>
                        <p className="text-sm font-semibold truncate" style={{ color: '#f0fdf4', fontFamily: mono ? 'monospace' : undefined }}>{value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'rgba(167,243,208,0.4)' }}>EPSS — Exploit Probability</p>
                    <EpssBar value={selected.epss} />
                    <p className="text-xs mt-1.5" style={{ color: 'rgba(167,243,208,0.4)' }}>
                      {selected.epss > 0.5 ? '⚠️ High likelihood of active exploitation' : selected.epss > 0.1 ? 'Moderate exploit activity observed' : 'Low exploitation probability'}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: 'rgba(167,243,208,0.4)' }}>Description</p>
                    <p className="text-sm leading-relaxed" style={{ color: 'rgba(167,243,208,0.75)' }}>{selected.description || '—'}</p>
                  </div>

                  <div className="rounded-xl p-4" style={{ background: 'rgba(52,211,153,0.07)', border: '1px solid rgba(52,211,153,0.2)' }}>
                    <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: '#34d399' }}>Recommended Remediation</p>
                    <p className="text-sm leading-relaxed" style={{ color: 'rgba(167,243,208,0.75)' }}>{selected.remediation || '—'}</p>
                  </div>

                  {selected.references.length > 0 && (
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: 'rgba(167,243,208,0.4)' }}>References</p>
                      <div className="space-y-1">
                        {selected.references.map((ref, i) => (
                          <a key={i} href={ref} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-2 text-xs break-all" style={{ color: '#34d399' }}>
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                            {ref}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <button className="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all"
                      style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(167,243,208,0.6)', border: '1px solid rgba(255,255,255,0.1)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}>
                      Snooze
                    </button>
                    <button className="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all"
                      style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.18)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}>
                      Mark as risk accepted
                    </button>
                    <button className="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all"
                      style={{ background: '#34d399', color: '#021a12' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#6ee7b7'}
                      onMouseLeave={e => e.currentTarget.style.background = '#34d399'}>
                      Start pentest →
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* FIXED TAB */}
      {tab === 'fixed' && (
        <div className="rounded-2xl p-16 text-center" style={GLASS}>
          <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
            style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <p className="font-bold text-base mb-1" style={{ color: '#f0fdf4' }}>Any fixed issues will appear here</p>
          <p className="text-sm mb-5" style={{ color: 'rgba(167,243,208,0.5)', maxWidth: '360px', margin: '0 auto 20px' }}>
            Once an issue is resolved and confirmed in a rescan, it moves here automatically.
          </p>
          <button className="text-sm font-bold px-6 py-2.5 rounded-xl" style={{ background: '#34d399', color: '#021a12' }}>
            Go to Scans →
          </button>
        </div>
      )}

      {/* SNOOZED TAB */}
      {tab === 'snoozed' && (
        <div className="rounded-2xl p-16 text-center" style={GLASS}>
          <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(167,243,208,0.4)" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/><line x1="9" y1="9" x2="15" y2="9"/></svg>
          </div>
          <p className="font-bold text-base mb-1" style={{ color: '#f0fdf4' }}>No snoozed issues</p>
          <p className="text-sm" style={{ color: 'rgba(167,243,208,0.5)' }}>
            Snooze issues you&apos;ve accepted as a known risk. They won&apos;t appear in your current count.
          </p>
        </div>
      )}

      {/* NOISE TAB */}
      {tab === 'noise' && (
        <>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm font-semibold" style={{ color: 'rgba(167,243,208,0.5)' }}>{NOISE_ITEMS.length} noise items</span>
            <div className="ml-auto flex gap-2">
              <select className="scan-input rounded-lg px-3 py-1.5 text-xs">
                <option>All targets</option>
              </select>
              <button className="text-xs font-semibold px-3 py-1.5 rounded-lg"
                style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(167,243,208,0.5)', border: '1px solid rgba(255,255,255,0.08)' }}>
                What is noise?
              </button>
            </div>
          </div>
          <div className="rounded-2xl overflow-hidden" style={GLASS}>
            {NOISE_ITEMS.map((item, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-4 cursor-pointer transition-colors"
                style={{ borderBottom: i < NOISE_ITEMS.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: 'rgba(167,243,208,0.25)' }} />
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'rgba(167,243,208,0.75)' }}>{item}</p>
                  <p className="text-xs mt-0.5 font-mono" style={{ color: 'rgba(167,243,208,0.35)' }}>Noise · detected in recent scan</p>
                </div>
                <svg className="ml-auto" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(167,243,208,0.25)" strokeWidth="1.5"><polyline points="9 18 15 12 9 6"/></svg>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
