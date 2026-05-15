'use client';

import { useState } from 'react';

const GLASS: React.CSSProperties = {
  background: 'rgba(255,255,255,0.07)',
  backdropFilter: 'blur(18px)',
  WebkitBackdropFilter: 'blur(18px)',
  border: '1px solid rgba(255,255,255,0.13)',
  boxShadow: '0 4px 28px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.1)',
};

const RISK_COLOR: Record<string, string> = {
  Critical: '#ef4444',
  High: '#f59e0b',
  Medium: '#3b82f6',
  Low: '#34d399',
};

const CATEGORIES = [
  {
    icon: '🌐',
    name: 'Web & APIs',
    assets: 89,
    issues: 4,
    score: 71,
    risk: 'High',
  },
  {
    icon: '☁️',
    name: 'Cloud Infrastructure',
    assets: 34,
    issues: 2,
    score: 61,
    risk: 'Medium',
  },
  {
    icon: '🔌',
    name: 'Network & Ports',
    assets: 12,
    issues: 3,
    score: 78,
    risk: 'High',
    assetLabel: 'open ports',
  },
  {
    icon: '🔒',
    name: 'Certificates & DNS',
    assets: 8,
    issues: 1,
    score: 45,
    risk: 'Medium',
    assetLabel: 'expiring soon',
  },
];

const TIMELINE = [
  { color: '#34d399', dot: '🟢', label: 'New subdomain discovered: api-v2.acmecorp.com', time: '2h ago' },
  { color: '#ef4444', dot: '🔴', label: 'Critical: S3 bucket publicly accessible', time: '5h ago' },
  { color: '#f59e0b', dot: '🟡', label: 'SSL cert expiring in 7 days: mail.acmecorp.com', time: '1d ago' },
  { color: '#34d399', dot: '🟢', label: '3 new assets mapped on techstart.io', time: '1d ago' },
  { color: '#3b82f6', dot: '🔵', label: 'Port 3389 detected open on admin.acmecorp.com', time: '2d ago' },
  { color: '#34d399', dot: '🟢', label: 'New CDN asset: cdn2.acmecorp.com', time: '3d ago' },
  { color: '#34d399', dot: '✅', label: 'Issue resolved: HTTP redirect on www', time: '4d ago' },
  { color: '#f59e0b', dot: '🟡', label: 'New dev environment: beta.techstart.io', time: '5d ago' },
];

const EXPOSED = [
  { port: '3389', service: 'RDP', host: 'admin.acmecorp.com', risk: 'Critical' },
  { port: '8080', service: 'HTTP-Alt', host: 'admin.acmecorp.com', risk: 'High' },
  { port: '587', service: 'SMTP', host: 'mail.acmecorp.com', risk: 'Medium' },
  { port: '3000', service: 'Dev server', host: 'dev.acmecorp.com', risk: 'Medium' },
  { port: '8443', service: 'HTTPS-Alt', host: 'dashboard.techstart.io', risk: 'Low' },
];

function GaugeArc({ score }: { score: number }) {
  const pct = score / 100;
  const r = 54;
  const cx = 70;
  const cy = 70;
  const startAngle = Math.PI;
  const endAngle = startAngle + pct * Math.PI;
  const x1 = cx + r * Math.cos(startAngle);
  const y1 = cy + r * Math.sin(startAngle);
  const x2 = cx + r * Math.cos(endAngle);
  const y2 = cy + r * Math.sin(endAngle);
  const largeArc = pct > 0.5 ? 1 : 0;

  return (
    <svg width="140" height="80" viewBox="0 0 140 80">
      {/* Track */}
      <path
        d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
        fill="none"
        stroke="rgba(255,255,255,0.08)"
        strokeWidth="10"
        strokeLinecap="round"
      />
      {/* Fill */}
      <path
        d={`M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`}
        fill="none"
        stroke="#f59e0b"
        strokeWidth="10"
        strokeLinecap="round"
      />
      {/* Score */}
      <text x={cx} y={cy - 6} textAnchor="middle" fill="#f0fdf4" fontSize="22" fontWeight="900">{score}</text>
      <text x={cx} y={cy + 10} textAnchor="middle" fill="rgba(167,243,208,0.55)" fontSize="10">/100</text>
    </svg>
  );
}

function ExposureBar({ label, pct, color }: { label: string; pct: number; color: string }) {
  return (
    <div className="mb-4">
      <div className="flex justify-between mb-1.5">
        <span style={{ color: 'rgba(167,243,208,0.55)', fontSize: '0.8rem' }}>{label}</span>
        <span style={{ color: '#f0fdf4', fontSize: '0.8rem', fontWeight: 700 }}>{pct}%</span>
      </div>
      <div className="rounded-full overflow-hidden" style={{ height: 6, background: 'rgba(255,255,255,0.08)' }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

export default function AttackSurfacePage() {
  const [_refresh, setRefresh] = useState(false);

  return (
    <div className="p-8" style={{ minHeight: '100vh' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-black text-2xl mb-1" style={{ color: '#f0fdf4' }}>Attack Surface</h1>
          <p style={{ color: 'rgba(167,243,208,0.55)', fontSize: '0.875rem' }}>Monitor and manage your complete external attack surface</p>
        </div>
        <button
          onClick={() => setRefresh(v => !v)}
          className="flex items-center gap-2 text-sm font-bold px-4 py-2.5 rounded-xl transition-all"
          style={{ background: '#34d399', color: '#021a12' }}
          onMouseEnter={e => (e.currentTarget.style.background = '#2ec48a')}
          onMouseLeave={e => (e.currentTarget.style.background = '#34d399')}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="1 4 1 10 7 10"/>
            <path d="M3.51 15a9 9 0 1 0 .49-3.1"/>
          </svg>
          Run full discovery
        </button>
      </div>

      {/* Risk overview */}
      <div className="rounded-2xl p-6 mb-6" style={GLASS}>
        <h2 className="font-bold text-sm mb-5 uppercase tracking-wide" style={{ color: 'rgba(167,243,208,0.4)' }}>Risk Overview</h2>
        <div className="grid grid-cols-3 gap-8">
          {/* Score gauge */}
          <div className="flex flex-col items-center justify-center">
            <GaugeArc score={74} />
            <div className="mt-2 text-center">
              <div className="font-black text-lg" style={{ color: '#f59e0b' }}>High Risk</div>
              <div style={{ color: 'rgba(167,243,208,0.55)', fontSize: '0.8rem' }}>Overall score: 74/100</div>
            </div>
          </div>

          {/* Exposure bars */}
          <div className="flex flex-col justify-center">
            <p className="font-bold text-sm mb-4" style={{ color: '#f0fdf4' }}>Exposure Breakdown</p>
            <ExposureBar label="External exposure" pct={82} color="#ef4444" />
            <ExposureBar label="Internal exposure" pct={23} color="#3b82f6" />
            <ExposureBar label="Cloud exposure" pct={61} color="#f59e0b" />
          </div>

          {/* Trend */}
          <div className="flex flex-col justify-center gap-3 pl-6" style={{ borderLeft: '1px solid rgba(255,255,255,0.08)' }}>
            <p className="font-bold text-sm mb-1" style={{ color: '#f0fdf4' }}>This Week</p>
            {[
              { icon: '↑', text: '3 new assets this week', color: '#f59e0b' },
              { icon: '↓', text: '2 issues resolved', color: '#34d399' },
              { icon: '→', text: '0 new critical', color: 'rgba(167,243,208,0.55)' },
            ].map(item => (
              <div key={item.text} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-lg flex-shrink-0" style={{ background: 'rgba(255,255,255,0.06)', color: item.color }}>{item.icon}</div>
                <span style={{ color: 'rgba(167,243,208,0.7)', fontSize: '0.8rem' }}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Category cards 2x2 */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {CATEGORIES.map(cat => (
          <div key={cat.name} className="rounded-2xl p-5" style={GLASS}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: 'rgba(255,255,255,0.07)' }}>
                  {cat.icon}
                </div>
                <div>
                  <p className="font-bold text-sm" style={{ color: '#f0fdf4' }}>{cat.name}</p>
                  <p style={{ color: 'rgba(167,243,208,0.55)', fontSize: '0.75rem' }}>
                    {cat.assets} {cat.assetLabel ?? 'assets'} · {cat.issues} issue{cat.issues !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-lg" style={{ background: `${RISK_COLOR[cat.risk]}20`, color: RISK_COLOR[cat.risk] }}>
                {cat.risk}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="rounded-full overflow-hidden flex-1" style={{ height: 5, background: 'rgba(255,255,255,0.08)', width: 120 }}>
                    <div style={{ height: '100%', width: `${cat.score}%`, background: RISK_COLOR[cat.risk], borderRadius: 9999 }} />
                  </div>
                  <span style={{ color: RISK_COLOR[cat.risk], fontSize: '0.75rem', fontWeight: 700 }}>{cat.score}/100</span>
                </div>
              </div>
              <button className="text-xs font-semibold transition-all" style={{ color: '#34d399' }}
                onMouseEnter={e => (e.currentTarget.style.textDecoration = 'underline')}
                onMouseLeave={e => (e.currentTarget.style.textDecoration = 'none')}>
                View details →
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom row */}
      <div className="grid gap-4" style={{ gridTemplateColumns: '1fr 380px' }}>
        {/* Timeline */}
        <div className="rounded-2xl p-6" style={GLASS}>
          <h2 className="font-bold text-sm mb-5" style={{ color: '#f0fdf4' }}>Recent Changes</h2>
          <div className="space-y-0">
            {TIMELINE.map((item, i) => (
              <div key={i} className="flex gap-4 pb-4">
                <div className="flex flex-col items-center gap-0">
                  <div className="w-3 h-3 rounded-full flex-shrink-0 mt-0.5" style={{ background: item.color }} />
                  {i < TIMELINE.length - 1 && (
                    <div style={{ width: 1, flex: 1, background: 'rgba(255,255,255,0.08)', marginTop: 4 }} />
                  )}
                </div>
                <div className="flex-1 pb-0">
                  <p style={{ color: 'rgba(167,243,208,0.8)', fontSize: '0.8rem', lineHeight: 1.5 }}>{item.label}</p>
                  <p style={{ color: 'rgba(167,243,208,0.4)', fontSize: '0.7rem', marginTop: 2 }}>{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Exposed services */}
        <div className="rounded-2xl p-6" style={GLASS}>
          <h2 className="font-bold text-sm mb-5" style={{ color: '#f0fdf4' }}>Most Exposed Services</h2>
          {/* Table header */}
          <div className="grid mb-2" style={{ gridTemplateColumns: '60px 90px 1fr 80px' }}>
            {['Port', 'Service', 'Host', 'Risk'].map(h => (
              <span key={h} style={{ color: 'rgba(167,243,208,0.4)', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</span>
            ))}
          </div>
          <div className="space-y-1">
            {EXPOSED.map((svc, i) => (
              <div
                key={i}
                className="grid py-2.5 px-2 rounded-lg"
                style={{
                  gridTemplateColumns: '60px 90px 1fr 80px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <span className="font-mono text-xs font-bold" style={{ color: '#f0fdf4' }}>{svc.port}</span>
                <span className="text-xs" style={{ color: 'rgba(167,243,208,0.7)' }}>{svc.service}</span>
                <span className="font-mono text-xs truncate" style={{ color: 'rgba(167,243,208,0.55)' }}>{svc.host}</span>
                <span>
                  <span className="text-xs font-bold px-1.5 py-0.5 rounded-md" style={{ background: `${RISK_COLOR[svc.risk]}20`, color: RISK_COLOR[svc.risk] }}>
                    {svc.risk}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
