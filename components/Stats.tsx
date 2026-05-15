const STATS = [
  { value: '12M+', label: 'Assets monitored', sub: 'across all customer environments' },
  { value: '847K', label: 'Vulnerabilities found', sub: 'before attackers exploited them' },
  { value: '99.97%', label: 'Platform uptime', sub: 'SLA-backed reliability' },
  { value: '<60s', label: 'Time to first finding', sub: 'from scan initiation' },
];

export default function Stats() {
  return (
    <section style={{ background: 'var(--bg-alt)' }}>
      <div className="separator" />
      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((stat, i) => (
            <div key={i} className="text-center">
              <div className="font-black mb-1.5 gradient-text" style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)' }}>
                {stat.value}
              </div>
              <div className="font-semibold mb-1" style={{ color: 'var(--text-pri)', fontSize: '0.88rem' }}>
                {stat.label}
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.74rem' }}>{stat.sub}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="separator" />
    </section>
  );
}
