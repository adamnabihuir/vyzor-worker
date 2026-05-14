const STATS = [
  { value: '12M+', label: 'Assets Monitored', sub: 'across all customer environments' },
  { value: '847K', label: 'Vulnerabilities Found', sub: 'before attackers exploited them' },
  { value: '99.97%', label: 'Platform Uptime', sub: 'SLA-backed reliability' },
  { value: '<60s', label: 'Time to First Finding', sub: 'from scan initiation' },
];

export default function Stats() {
  return (
    <section className="relative py-4 overflow-hidden" style={{ background: '#ffffff' }}>
      <div className="separator" />
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((stat, i) => (
            <div key={i} className="text-center">
              <div className="font-black mb-2 gradient-text" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>
                {stat.value}
              </div>
              <div className="font-semibold mb-1" style={{ color: '#0f172a', fontSize: '0.9rem' }}>
                {stat.label}
              </div>
              <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>{stat.sub}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="separator" />
    </section>
  );
}
