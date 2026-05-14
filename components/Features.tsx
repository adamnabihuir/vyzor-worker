const FEATURES = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /><path d="M11 8v3l2 2" />
      </svg>
    ),
    label: 'Asset Discovery',
    title: 'See Everything Before Attackers Do',
    description: 'Vanguard automatically maps your entire external attack surface — every subdomain, IP, API endpoint, and cloud asset — using passive OSINT and active enumeration. No blind spots.',
    points: [
      'Subdomain enumeration via 15+ data sources',
      'Cloud asset discovery (AWS, GCP, Azure)',
      'Continuous monitoring — new assets flagged instantly',
      'Historical asset timeline tracking',
    ],
    accent: '#6366f1',
    mockBg: '#f5f3ff',
    Mock: AssetDiscoveryMock,
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18" />
      </svg>
    ),
    label: 'Port & Service Scanning',
    title: 'Know Every Open Door on Your Perimeter',
    description: 'High-speed port scanning across your entire discovered attack surface. Every open port, running service, and software version is fingerprinted and tracked over time.',
    points: [
      'Full TCP/UDP port range scanning',
      'Service and version fingerprinting',
      'Exposed admin panels and dev environments',
      'Change detection and alerting',
    ],
    accent: '#0ea5e9',
    mockBg: '#f0f9ff',
    Mock: PortScanMock,
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="m12 22 4-4H8l4 4Z" /><path d="M12 2a10 10 0 0 1 7.38 16.75" /><path d="M4.62 18.75A10 10 0 0 1 12 2" /><circle cx="12" cy="12" r="3" />
      </svg>
    ),
    label: 'Vulnerability Detection',
    title: 'CVEs Found, Prioritised, and Explained',
    description: 'Deep vulnerability scanning powered by 9,000+ Nuclei templates, correlated with NVD/CVE databases. Every finding comes with a CVSS score, business context, and remediation guidance.',
    points: [
      '9,000+ vulnerability templates (updated daily)',
      'CVSS scoring + business impact assessment',
      'Web app scanning: XSS, SQLi, SSRF, and more',
      'SSL/TLS misconfiguration detection',
    ],
    accent: '#a855f7',
    mockBg: '#faf5ff',
    Mock: VulnMock,
  },
];

export default function Features() {
  return (
    <section id="features" className="py-28 relative" style={{ background: '#ffffff' }}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <span className="badge mb-5">Core Platform</span>
          <h2 className="font-black tracking-tight mb-5" style={{ fontSize: 'clamp(2rem, 4vw, 3.2rem)', color: '#0f172a', lineHeight: '1.1' }}>
            Three Pillars of{' '}
            <span className="gradient-text">Complete Visibility</span>
          </h2>
          <p className="mx-auto" style={{ maxWidth: '560px', color: '#64748b', fontSize: '1.05rem', lineHeight: '1.7' }}>
            From the first domain you enter to the full picture of your security posture —
            Vanguard does the heavy lifting automatically.
          </p>
        </div>

        <div className="space-y-8">
          {FEATURES.map((feature, i) => (
            <div key={i} className="card-glass rounded-2xl p-8 md:p-10 grid md:grid-cols-2 gap-10 items-center">
              <div className={i % 2 === 1 ? 'md:order-2' : ''}>
                <div className="flex items-center gap-3 mb-5">
                  <div
                    className="feature-icon-wrap"
                    style={{ background: `${feature.accent}14`, border: `1px solid ${feature.accent}28`, color: feature.accent }}
                  >
                    {feature.icon}
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest" style={{ color: feature.accent }}>
                    {feature.label}
                  </span>
                </div>
                <h3 className="font-bold mb-4" style={{ fontSize: 'clamp(1.3rem, 2.5vw, 1.75rem)', color: '#0f172a', lineHeight: '1.25' }}>
                  {feature.title}
                </h3>
                <p className="mb-6 leading-relaxed" style={{ color: '#64748b', fontSize: '0.95rem' }}>
                  {feature.description}
                </p>
                <ul className="space-y-2.5">
                  {feature.points.map((point, j) => (
                    <li key={j} className="flex items-start gap-3" style={{ fontSize: '0.88rem', color: '#475569' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={feature.accent} strokeWidth="2.5" className="mt-0.5 flex-shrink-0">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>

              <div className={`relative ${i % 2 === 1 ? 'md:order-1' : ''}`}>
                <div
                  className="rounded-xl overflow-hidden p-6"
                  style={{ background: feature.mockBg, border: `1px solid ${feature.accent}18`, minHeight: '220px' }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 rounded-full" style={{ background: feature.accent }} />
                    <span style={{ color: '#94a3b8', fontSize: '0.72rem', fontFamily: 'monospace' }}>
                      vanguard — {feature.label.toLowerCase()}
                    </span>
                  </div>
                  <feature.Mock accent={feature.accent} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AssetDiscoveryMock({ accent }: { accent: string }) {
  const assets = [
    { name: 'api.example.com', type: 'API', status: 'new', ip: '104.21.8.1' },
    { name: 'admin.example.com', type: 'Admin', status: 'warn', ip: '104.21.8.2' },
    { name: 'staging.example.com', type: 'Dev', status: 'warn', ip: '104.21.8.3' },
    { name: 'cdn.example.com', type: 'CDN', status: 'ok', ip: '104.21.8.4' },
    { name: 'mail.example.com', type: 'Mail', status: 'ok', ip: '104.21.8.5' },
  ];
  return (
    <div className="space-y-2">
      {assets.map((a, i) => (
        <div key={i} className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-white" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: a.status === 'ok' ? '#22c55e' : a.status === 'warn' ? '#f59e0b' : accent }} />
            <span style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: '#334155' }}>{a.name}</span>
          </div>
          <div className="flex items-center gap-3">
            <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>{a.ip}</span>
            <span className="px-2 py-0.5 rounded text-xs font-mono" style={{
              background: a.type === 'Admin' ? 'rgba(239,68,68,0.08)' : `${accent}14`,
              color: a.type === 'Admin' ? '#ef4444' : accent,
              fontSize: '0.65rem',
            }}>{a.type}</span>
          </div>
        </div>
      ))}
      <p style={{ color: '#94a3b8', fontSize: '0.72rem', paddingTop: '0.5rem', fontFamily: 'monospace' }}>
        + 142 more assets discovered
      </p>
    </div>
  );
}

function PortScanMock({ accent }: { accent: string }) {
  const ports = [
    { port: 80, service: 'HTTP', risk: 'low' },
    { port: 443, service: 'HTTPS', risk: 'low' },
    { port: 8080, service: 'HTTP-Alt', risk: 'medium' },
    { port: 3389, service: 'RDP', risk: 'critical' },
    { port: 22, service: 'SSH', risk: 'medium' },
  ];
  return (
    <div>
      <div className="flex justify-between mb-3 px-3" style={{ fontSize: '0.68rem', color: '#94a3b8', fontFamily: 'monospace' }}>
        <span>PORT</span><span>SERVICE</span><span>RISK</span>
      </div>
      <div className="space-y-1.5">
        {ports.map((p, i) => (
          <div key={i} className="flex items-center justify-between py-1.5 px-3 rounded bg-white" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <span style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: accent }}>{p.port}</span>
            <span style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: '#334155' }}>{p.service}</span>
            <span style={{
              fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
              color: p.risk === 'critical' ? '#ef4444' : p.risk === 'medium' ? '#f59e0b' : '#22c55e',
            }}>{p.risk}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function VulnMock({ accent }: { accent: string }) {
  const vulns = [
    { cve: 'CVE-2024-1234', severity: 'CRITICAL', cvss: '9.8', title: 'Remote Code Execution' },
    { cve: 'CVE-2024-5678', severity: 'HIGH', cvss: '8.1', title: 'SQL Injection' },
    { cve: 'CVE-2023-9012', severity: 'HIGH', cvss: '7.5', title: 'Authentication Bypass' },
    { cve: 'CVE-2024-3456', severity: 'MEDIUM', cvss: '5.4', title: 'XSS Reflected' },
  ];
  return (
    <div className="space-y-2">
      {vulns.map((v, i) => (
        <div key={i} className="flex items-center justify-between py-2 px-3 rounded-lg bg-white" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div>
            <span style={{ fontFamily: 'monospace', fontSize: '0.7rem', color: '#94a3b8' }}>{v.cve}</span>
            <p style={{ fontSize: '0.78rem', color: '#334155', marginTop: '1px' }}>{v.title}</p>
          </div>
          <div className="flex items-center gap-2">
            <span style={{ fontFamily: 'monospace', fontSize: '0.7rem', color: '#94a3b8' }}>CVSS {v.cvss}</span>
            <span style={{
              fontSize: '0.62rem', fontWeight: 800, padding: '2px 7px', borderRadius: '4px',
              background: v.severity === 'CRITICAL' ? 'rgba(239,68,68,0.1)' : v.severity === 'HIGH' ? 'rgba(245,158,11,0.1)' : `${accent}14`,
              color: v.severity === 'CRITICAL' ? '#ef4444' : v.severity === 'HIGH' ? '#f59e0b' : accent,
              letterSpacing: '0.05em',
            }}>{v.severity}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
