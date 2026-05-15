const FEATURES = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/><path d="M11 8v3l2 2"/>
      </svg>
    ),
    label: 'Asset Discovery',
    title: 'See everything before attackers do',
    description: 'Vyzor automatically maps your entire external attack surface — every subdomain, IP, API endpoint, and cloud asset — using passive OSINT and active enumeration. No blind spots.',
    points: [
      'Subdomain enumeration via 15+ data sources',
      'Cloud asset discovery (AWS, GCP, Azure)',
      'Continuous monitoring — new assets flagged instantly',
      'Historical asset timeline tracking',
    ],
    accent: '#34d399',
    Mock: AssetDiscoveryMock,
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18"/>
      </svg>
    ),
    label: 'Port & Service Scanning',
    title: 'Know every open door on your perimeter',
    description: 'High-speed port scanning across your entire discovered attack surface. Every open port, running service, and software version is fingerprinted and tracked over time.',
    points: [
      'Full TCP/UDP port range scanning',
      'Service and version fingerprinting',
      'Exposed admin panels and dev environments',
      'Change detection and instant alerting',
    ],
    accent: '#7dd3fc',
    Mock: PortScanMock,
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="m12 22 4-4H8l4 4Z"/><path d="M12 2a10 10 0 0 1 7.38 16.75"/><path d="M4.62 18.75A10 10 0 0 1 12 2"/><circle cx="12" cy="12" r="3"/>
      </svg>
    ),
    label: 'Vulnerability Detection',
    title: 'CVEs found, prioritised, and explained',
    description: 'Deep vulnerability scanning powered by 9,000+ templates, correlated with NVD/CVE databases. Every finding comes with CVSS score, business context, and remediation guidance.',
    points: [
      '9,000+ vulnerability templates (updated daily)',
      'CVSS scoring + business impact assessment',
      'Web app scanning: XSS, SQLi, SSRF, and more',
      'SSL/TLS misconfiguration detection',
    ],
    accent: '#a78bfa',
    Mock: VulnMock,
  },
];

export default function Features() {
  return (
    <section id="features" className="py-28 relative" style={{ background: 'var(--bg)' }}>
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-20">
          <span className="badge mb-5">Core platform</span>
          <h2 className="font-black tracking-tight mb-5"
            style={{ fontSize: 'clamp(1.9rem, 4vw, 3rem)', color: 'var(--text-pri)', lineHeight: '1.1' }}>
            Three pillars of{' '}
            <span className="gradient-text">complete visibility</span>
          </h2>
          <p className="mx-auto" style={{ maxWidth: '540px', color: 'var(--text-sec)', fontSize: '1.05rem', lineHeight: '1.7' }}>
            From the first domain you enter to the full picture of your security posture —
            Vyzor does the heavy lifting automatically.
          </p>
        </div>

        {/* Feature rows */}
        <div className="space-y-6">
          {FEATURES.map((feature, i) => (
            <div key={i} className="card-dark rounded-2xl p-8 md:p-10 grid md:grid-cols-2 gap-10 items-center">
              {/* Copy */}
              <div className={i % 2 === 1 ? 'md:order-2' : ''}>
                <div className="flex items-center gap-3 mb-5">
                  <div className="feature-icon-wrap"
                    style={{ background: `${feature.accent}14`, border: `1px solid ${feature.accent}25`, color: feature.accent }}>
                    {feature.icon}
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest" style={{ color: feature.accent }}>
                    {feature.label}
                  </span>
                </div>
                <h3 className="font-bold mb-4"
                  style={{ fontSize: 'clamp(1.2rem, 2.5vw, 1.65rem)', color: 'var(--text-pri)', lineHeight: '1.25' }}>
                  {feature.title}
                </h3>
                <p className="mb-6 leading-relaxed" style={{ color: 'var(--text-sec)', fontSize: '0.94rem' }}>
                  {feature.description}
                </p>
                <ul className="space-y-2.5">
                  {feature.points.map((point, j) => (
                    <li key={j} className="flex items-start gap-3" style={{ fontSize: '0.875rem', color: 'var(--text-sec)' }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={feature.accent} strokeWidth="2.5" className="mt-0.5 flex-shrink-0">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Mock */}
              <div className={i % 2 === 1 ? 'md:order-1' : ''}>
                <div className="rounded-xl overflow-hidden p-5"
                  style={{ background: 'rgba(2,16,10,0.7)', border: `1px solid ${feature.accent}18`, minHeight: '210px' }}>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 rounded-full" style={{ background: feature.accent }} />
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem', fontFamily: 'monospace' }}>
                      vyzor — {feature.label.toLowerCase()}
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
        <div key={i} className="flex items-center justify-between py-1.5 px-3 rounded-lg"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(52,211,153,0.08)' }}>
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full"
              style={{ background: a.status === 'ok' ? '#34d399' : a.status === 'warn' ? '#fbbf24' : accent }} />
            <span style={{ fontFamily: 'monospace', fontSize: '0.77rem', color: 'rgba(167,243,208,0.7)' }}>{a.name}</span>
          </div>
          <div className="flex items-center gap-3">
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{a.ip}</span>
            <span className="px-2 py-0.5 rounded text-xs font-mono" style={{
              background: a.type === 'Admin' ? 'rgba(248,113,113,0.12)' : `${accent}12`,
              color: a.type === 'Admin' ? '#f87171' : accent,
              fontSize: '0.64rem',
            }}>{a.type}</span>
          </div>
        </div>
      ))}
      <p style={{ color: 'var(--text-muted)', fontSize: '0.71rem', paddingTop: '0.4rem', fontFamily: 'monospace' }}>
        + 142 more assets discovered
      </p>
    </div>
  );
}

function PortScanMock({ accent }: { accent: string }) {
  const ports = [
    { port: 80,   service: 'HTTP',     risk: 'low' },
    { port: 443,  service: 'HTTPS',    risk: 'low' },
    { port: 8080, service: 'HTTP-Alt', risk: 'medium' },
    { port: 3389, service: 'RDP',      risk: 'critical' },
    { port: 22,   service: 'SSH',      risk: 'medium' },
  ];
  return (
    <div>
      <div className="flex justify-between mb-3 px-3"
        style={{ fontSize: '0.67rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
        <span>PORT</span><span>SERVICE</span><span>RISK</span>
      </div>
      <div className="space-y-1.5">
        {ports.map((p, i) => (
          <div key={i} className="flex items-center justify-between py-1.5 px-3 rounded"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(125,211,252,0.08)' }}>
            <span style={{ fontFamily: 'monospace', fontSize: '0.77rem', color: accent }}>{p.port}</span>
            <span style={{ fontFamily: 'monospace', fontSize: '0.77rem', color: 'rgba(167,243,208,0.6)' }}>{p.service}</span>
            <span style={{
              fontSize: '0.64rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
              color: p.risk === 'critical' ? '#f87171' : p.risk === 'medium' ? '#fbbf24' : '#34d399',
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
    { cve: 'CVE-2024-5678', severity: 'HIGH',     cvss: '8.1', title: 'SQL Injection' },
    { cve: 'CVE-2023-9012', severity: 'HIGH',     cvss: '7.5', title: 'Authentication Bypass' },
    { cve: 'CVE-2024-3456', severity: 'MEDIUM',   cvss: '5.4', title: 'XSS Reflected' },
  ];
  return (
    <div className="space-y-2">
      {vulns.map((v, i) => (
        <div key={i} className="flex items-center justify-between py-2 px-3 rounded-lg"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(167,139,250,0.08)' }}>
          <div>
            <span style={{ fontFamily: 'monospace', fontSize: '0.69rem', color: 'var(--text-muted)' }}>{v.cve}</span>
            <p style={{ fontSize: '0.77rem', color: 'rgba(167,243,208,0.7)', marginTop: '1px' }}>{v.title}</p>
          </div>
          <div className="flex items-center gap-2">
            <span style={{ fontFamily: 'monospace', fontSize: '0.69rem', color: 'var(--text-muted)' }}>CVSS {v.cvss}</span>
            <span style={{
              fontSize: '0.61rem', fontWeight: 800, padding: '2px 6px', borderRadius: '4px', letterSpacing: '0.04em',
              background: v.severity === 'CRITICAL' ? 'rgba(248,113,113,0.12)' : v.severity === 'HIGH' ? 'rgba(251,191,36,0.12)' : `${accent}12`,
              color: v.severity === 'CRITICAL' ? '#f87171' : v.severity === 'HIGH' ? '#fbbf24' : accent,
            }}>{v.severity}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
