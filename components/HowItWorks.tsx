const STEPS = [
  {
    number: '01',
    title: 'Enter your domain',
    description: "Type your organization's domain. Vyzor automatically discovers all associated IPs, subdomains, and cloud infrastructure.",
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  },
  {
    number: '02',
    title: 'Automated scanning',
    description: 'Our distributed engine simultaneously runs asset discovery, port scanning, and vulnerability detection across your full attack surface.',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  },
  {
    number: '03',
    title: 'Prioritised findings',
    description: 'Every vulnerability is scored by CVSS, enriched with business context, and ranked so your team knows exactly what to fix first.',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  },
  {
    number: '04',
    title: 'Continuous monitoring',
    description: 'Vyzor scans 24/7. New assets and vulnerabilities trigger instant alerts via Slack, email, or webhook to your SIEM.',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  },
];

const INTEGRATIONS = ['Slack', 'Jira', 'PagerDuty', 'Splunk', 'Microsoft Teams', 'ServiceNow', 'Webhook API'];

export default function HowItWorks() {
  return (
    <section id="product" className="py-28 relative" style={{ background: 'var(--bg-alt)' }}>
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-20">
          <span className="badge mb-5">How it works</span>
          <h2 className="font-black tracking-tight mb-5"
            style={{ fontSize: 'clamp(1.9rem, 4vw, 3rem)', color: 'var(--text-pri)', lineHeight: '1.1' }}>
            From domain to{' '}
            <span className="gradient-text">security intelligence</span>
            <br />in under 60 seconds
          </h2>
          <p className="mx-auto" style={{ maxWidth: '500px', color: 'var(--text-sec)', fontSize: '1rem', lineHeight: '1.7' }}>
            No agents to install, no complex configuration. Point Vyzor at your domain
            and watch your attack surface map itself.
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {STEPS.map((step, i) => (
            <div key={i} className="card-dark rounded-2xl p-7 relative">
              {/* Connector line */}
              {i < STEPS.length - 1 && (
                <div className="hidden lg:block absolute top-10 -right-3 w-6 h-px z-10"
                  style={{ background: 'rgba(52,211,153,0.2)' }} />
              )}
              <div className="text-xs font-black mb-5 font-mono"
                style={{ color: '#34d399', letterSpacing: '0.15em', opacity: 0.5 }}>
                {step.number}
              </div>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-5"
                style={{ background: 'rgba(52,211,153,0.08)', color: '#34d399', border: '1px solid rgba(52,211,153,0.15)' }}>
                {step.icon}
              </div>
              <h3 className="font-bold mb-2.5" style={{ color: 'var(--text-pri)', fontSize: '1rem', lineHeight: '1.3' }}>
                {step.title}
              </h3>
              <p style={{ color: 'var(--text-sec)', fontSize: '0.86rem', lineHeight: '1.65' }}>
                {step.description}
              </p>
            </div>
          ))}
        </div>

        {/* Integration bar */}
        <div className="card-dark rounded-2xl p-7 text-center">
          <p className="font-semibold mb-5 text-xs uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
            Integrates with your existing stack
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {INTEGRATIONS.map((name) => (
              <span key={name} className="px-4 py-2 rounded-lg text-sm font-medium"
                style={{ background: 'rgba(52,211,153,0.05)', border: '1px solid rgba(52,211,153,0.12)', color: 'var(--text-sec)' }}>
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
