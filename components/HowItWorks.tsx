const STEPS = [
  {
    number: '01',
    title: 'Enter Your Domain',
    description: "Type your organization's domain name. Vanguard automatically discovers all associated IPs, subdomains, and cloud infrastructure.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
  },
  {
    number: '02',
    title: 'Automated Scanning',
    description: 'Our distributed scan engine simultaneously runs asset discovery, port scanning, and vulnerability detection across your entire attack surface.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
  {
    number: '03',
    title: 'Prioritised Findings',
    description: 'Every vulnerability is scored by CVSS, enriched with business context, and prioritised so your team knows exactly what to fix first.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    number: '04',
    title: 'Continuous Monitoring',
    description: 'Vanguard keeps scanning 24/7. New assets and vulnerabilities trigger instant alerts via Slack, email, or webhook to your SIEM.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    ),
  },
];

export default function HowItWorks() {
  return (
    <section id="product" className="py-28 relative" style={{ background: '#f8fafc' }}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <span className="badge mb-5">How It Works</span>
          <h2 className="font-black tracking-tight mb-5" style={{ fontSize: 'clamp(2rem, 4vw, 3.2rem)', color: '#0f172a', lineHeight: '1.1' }}>
            From Domain to{' '}
            <span className="gradient-text">Security Intelligence</span>
            <br />in Under 60 Seconds
          </h2>
          <p className="mx-auto" style={{ maxWidth: '520px', color: '#64748b', fontSize: '1rem', lineHeight: '1.7' }}>
            No agents to install, no complex configuration. Just point Vanguard at your domain
            and watch your attack surface map itself.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((step, i) => (
            <div key={i} className="card-glass rounded-2xl p-7 h-full relative">
              <div className="text-xs font-black mb-5" style={{ color: '#6366f1', fontFamily: 'monospace', letterSpacing: '0.15em', opacity: 0.6 }}>
                {step.number}
              </div>
              <div className="mb-5" style={{ color: '#6366f1' }}>{step.icon}</div>
              <h3 className="font-bold mb-3" style={{ color: '#0f172a', fontSize: '1.05rem', lineHeight: '1.3' }}>
                {step.title}
              </h3>
              <p style={{ color: '#64748b', fontSize: '0.875rem', lineHeight: '1.65' }}>
                {step.description}
              </p>
            </div>
          ))}
        </div>

        {/* Integrations */}
        <div className="mt-16 card-glass rounded-2xl p-8 text-center">
          <p className="font-semibold mb-6" style={{ color: '#94a3b8', fontSize: '0.78rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Integrates with your existing stack
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {['Slack', 'Jira', 'PagerDuty', 'Splunk', 'Microsoft Teams', 'ServiceNow', 'Webhook API'].map((name) => (
              <div
                key={name}
                className="px-4 py-2 rounded-lg text-sm font-medium"
                style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', color: '#475569' }}
              >
                {name}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
