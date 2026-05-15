'use client';

import { useState } from 'react';

const GLASS: React.CSSProperties = {
  background: 'rgba(255,255,255,0.07)',
  backdropFilter: 'blur(18px)',
  WebkitBackdropFilter: 'blur(18px)',
  border: '1px solid rgba(255,255,255,0.13)',
  boxShadow: '0 4px 28px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.1)',
};

const ASSETS = [
  { domain: 'api.acmecorp.com', type: 'API', ip: '104.21.8.1', status: 'Active', ports: '443', discovered: '14 May' },
  { domain: 'admin.acmecorp.com', type: 'Admin', ip: '104.21.8.2', status: 'Exposed', ports: '443, 8080', discovered: '14 May' },
  { domain: 'staging.acmecorp.com', type: 'Dev', ip: '104.21.8.3', status: 'Active', ports: '443', discovered: '14 May' },
  { domain: 'cdn.acmecorp.com', type: 'CDN', ip: '104.21.8.4', status: 'Active', ports: '80, 443', discovered: '13 May' },
  { domain: 'mail.acmecorp.com', type: 'Mail', ip: '104.21.8.5', status: 'Warn', ports: '25, 443, 587', discovered: '13 May' },
  { domain: 'dev.acmecorp.com', type: 'Dev', ip: '104.21.8.6', status: 'Active', ports: '3000', discovered: '12 May' },
  { domain: 'vpn.acmecorp.com', type: 'VPN', ip: '104.21.8.7', status: 'Active', ports: '1194', discovered: '12 May' },
  { domain: 's3.acmecorp.com', type: 'Cloud', ip: '104.21.8.8', status: 'Critical', ports: '443', discovered: '11 May' },
  { domain: 'api.techstart.io', type: 'API', ip: '185.53.177.10', status: 'Active', ports: '443', discovered: '11 May' },
  { domain: 'app.techstart.io', type: 'Web', ip: '185.53.177.11', status: 'Active', ports: '80, 443', discovered: '10 May' },
  { domain: 'beta.techstart.io', type: 'Dev', ip: '185.53.177.12', status: 'Active', ports: '3000', discovered: '10 May' },
  { domain: 'dashboard.techstart.io', type: 'Admin', ip: '185.53.177.13', status: 'Warn', ports: '443, 8443', discovered: '9 May' },
];

const TECHNOLOGIES = [
  { name: 'nginx', version: '1.24', assets: 8, category: 'Web Server' },
  { name: 'Apache', version: '2.4', assets: 4, category: 'Web Server' },
  { name: 'React', version: '18', assets: 6, category: 'Framework' },
  { name: 'Node.js', version: '20', assets: 5, category: 'Framework' },
  { name: 'PostgreSQL', version: '15', assets: 3, category: 'Database' },
  { name: 'Redis', version: '7', assets: 2, category: 'Database' },
  { name: 'AWS S3', version: '', assets: 4, category: 'Cloud' },
  { name: 'CloudFront', version: '', assets: 3, category: 'Cloud' },
  { name: "Let's Encrypt", version: '', assets: 9, category: 'CDN' },
  { name: 'Cloudflare', version: '', assets: 7, category: 'CDN' },
  { name: 'WordPress', version: '6.4', assets: 2, category: 'CMS' },
  { name: 'PHP', version: '8.2', assets: 3, category: 'Framework' },
  { name: 'Docker', version: '', assets: 5, category: 'Cloud' },
  { name: 'Kubernetes', version: '', assets: 2, category: 'Cloud' },
  { name: 'GitHub Actions', version: '', assets: 4, category: 'Framework' },
  { name: 'Stripe', version: '', assets: 2, category: 'Framework' },
];

const CATEGORY_COLORS: Record<string, { bg: string; color: string }> = {
  'Web Server': { bg: 'rgba(59,130,246,0.15)', color: '#3b82f6' },
  'Framework':  { bg: 'rgba(139,92,246,0.15)', color: '#a78bfa' },
  'Database':   { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b' },
  'Cloud':      { bg: 'rgba(14,165,233,0.15)', color: '#38bdf8' },
  'CDN':        { bg: 'rgba(52,211,153,0.12)', color: '#34d399' },
  'CMS':        { bg: 'rgba(239,68,68,0.12)', color: '#f87171' },
};

const TYPE_FILTERS = ['All', 'Subdomains', 'IPs', 'APIs', 'Admin panels', 'Cloud'];

function StatusBadge({ status }: { status: string }) {
  if (status === 'Active') {
    return (
      <div className="flex items-center gap-1.5">
        <div className="w-2 h-2 rounded-full" style={{ background: '#34d399' }} />
        <span style={{ color: '#34d399', fontSize: '0.75rem', fontWeight: 600 }}>Active</span>
      </div>
    );
  }
  if (status === 'Exposed') {
    return (
      <div className="flex items-center gap-1.5">
        <div className="w-2 h-2 rounded-full" style={{ background: '#f59e0b' }} />
        <span className="px-1.5 py-0.5 rounded-md text-xs font-bold" style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>Exposed</span>
      </div>
    );
  }
  if (status === 'Warn') {
    return (
      <div className="flex items-center gap-1.5">
        <div className="w-2 h-2 rounded-full" style={{ background: '#f59e0b' }} />
        <span className="px-1.5 py-0.5 rounded-md text-xs font-bold" style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>Warn</span>
      </div>
    );
  }
  if (status === 'Critical') {
    return (
      <div className="flex items-center gap-1.5">
        <div className="w-2 h-2 rounded-full" style={{ background: '#ef4444' }} />
        <span className="px-1.5 py-0.5 rounded-md text-xs font-bold" style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444' }}>Critical</span>
      </div>
    );
  }
  return null;
}

export default function DiscoveryPage() {
  const [tab, setTab] = useState<'assets' | 'technologies'>('assets');
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  const filteredAssets = ASSETS.filter(a => {
    if (search && !a.domain.toLowerCase().includes(search.toLowerCase())) return false;
    if (filter === 'All') return true;
    if (filter === 'APIs') return a.type === 'API';
    if (filter === 'Admin panels') return a.type === 'Admin';
    if (filter === 'Cloud') return a.type === 'Cloud';
    if (filter === 'Subdomains') return a.domain.split('.').length > 2;
    if (filter === 'IPs') return false;
    return true;
  });

  return (
    <div className="p-8" style={{ minHeight: '100vh' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-black text-2xl mb-1" style={{ color: '#f0fdf4' }}>Discovery</h1>
          <p style={{ color: 'rgba(167,243,208,0.55)', fontSize: '0.875rem' }}>All assets discovered across your targets</p>
        </div>
        <button
          className="flex items-center gap-2 text-sm font-bold px-4 py-2.5 rounded-xl transition-all"
          style={{ background: '#34d399', color: '#021a12' }}
          onMouseEnter={e => (e.currentTarget.style.background = '#2ec48a')}
          onMouseLeave={e => (e.currentTarget.style.background = '#34d399')}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Export
        </button>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total assets', value: '216', icon: '🗂️' },
          { label: 'Subdomains', value: '49', icon: '🌐' },
          { label: 'IPs', value: '34', icon: '🔌' },
          { label: 'Technologies', value: '28', icon: '⚙️' },
        ].map(stat => (
          <div key={stat.label} className="rounded-2xl p-5" style={GLASS}>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-xl">{stat.icon}</span>
              <span style={{ color: 'rgba(167,243,208,0.55)', fontSize: '0.75rem', fontWeight: 600 }}>{stat.label}</span>
            </div>
            <div className="font-black text-3xl" style={{ color: '#f0fdf4' }}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 rounded-xl w-fit" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
        {(['assets', 'technologies'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="px-5 py-2 rounded-lg text-sm font-semibold transition-all capitalize"
            style={{
              background: tab === t ? 'rgba(52,211,153,0.15)' : 'transparent',
              color: tab === t ? '#34d399' : 'rgba(167,243,208,0.55)',
              border: tab === t ? '1px solid rgba(52,211,153,0.25)' : '1px solid transparent',
            }}
          >
            {t === 'assets' ? 'Assets' : 'Technologies'}
          </button>
        ))}
      </div>

      {/* Assets tab */}
      {tab === 'assets' && (
        <div className="rounded-2xl overflow-hidden" style={GLASS}>
          {/* Filter bar */}
          <div className="flex items-center gap-3 px-5 py-4 flex-wrap" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="relative">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(167,243,208,0.4)" strokeWidth="2" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }}>
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                type="text"
                placeholder="Search assets..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '10px',
                  paddingLeft: '32px',
                  paddingRight: '12px',
                  paddingTop: '7px',
                  paddingBottom: '7px',
                  color: '#f0fdf4',
                  fontSize: '0.813rem',
                  outline: 'none',
                  width: '200px',
                }}
              />
            </div>
            <div className="flex gap-1 flex-wrap">
              {TYPE_FILTERS.map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                  style={{
                    background: filter === f ? 'rgba(52,211,153,0.15)' : 'rgba(255,255,255,0.05)',
                    color: filter === f ? '#34d399' : 'rgba(167,243,208,0.55)',
                    border: filter === f ? '1px solid rgba(52,211,153,0.25)' : '1px solid transparent',
                  }}
                >
                  {f}
                </button>
              ))}
            </div>
            <span className="ml-auto text-xs" style={{ color: 'rgba(167,243,208,0.4)' }}>{filteredAssets.length} assets</span>
          </div>

          {/* Table header */}
          <div className="grid px-5 py-3" style={{ gridTemplateColumns: '1fr 90px 130px 130px 130px 100px', borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)' }}>
            {['Domain', 'Type', 'IP Address', 'Status', 'Port(s)', 'Discovered'].map(h => (
              <span key={h} style={{ color: 'rgba(167,243,208,0.4)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</span>
            ))}
          </div>

          {/* Rows */}
          <div>
            {filteredAssets.map((asset, i) => (
              <div
                key={asset.domain}
                className="grid px-5 py-3.5 transition-colors"
                style={{
                  gridTemplateColumns: '1fr 90px 130px 130px 130px 100px',
                  borderBottom: i < filteredAssets.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                  background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.04)',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(52,211,153,0.04)')}
                onMouseLeave={e => (e.currentTarget.style.background = i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.04)')}
              >
                <span className="font-mono text-sm font-semibold" style={{ color: '#f0fdf4' }}>{asset.domain}</span>
                <span>
                  <span className="text-xs px-2 py-0.5 rounded-md font-semibold" style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(167,243,208,0.55)' }}>{asset.type}</span>
                </span>
                <span className="font-mono text-xs" style={{ color: 'rgba(167,243,208,0.55)' }}>{asset.ip}</span>
                <span><StatusBadge status={asset.status} /></span>
                <span className="font-mono text-xs" style={{ color: 'rgba(167,243,208,0.55)' }}>{asset.ports}</span>
                <span className="text-xs" style={{ color: 'rgba(167,243,208,0.4)' }}>{asset.discovered}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Technologies tab */}
      {tab === 'technologies' && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {TECHNOLOGIES.map(tech => {
            const cat = CATEGORY_COLORS[tech.category] ?? { bg: 'rgba(255,255,255,0.08)', color: 'rgba(167,243,208,0.55)' };
            return (
              <div key={tech.name} className="rounded-2xl p-5 flex flex-col gap-3" style={GLASS}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-bold text-sm" style={{ color: '#f0fdf4' }}>{tech.name}</p>
                    {tech.version && (
                      <p className="text-xs mt-0.5" style={{ color: 'rgba(167,243,208,0.4)' }}>v{tech.version}</p>
                    )}
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: cat.bg, color: cat.color }}>{tech.category}</span>
                </div>
                <div className="flex items-center gap-2 pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(167,243,208,0.4)" strokeWidth="2">
                    <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>
                  </svg>
                  <span style={{ color: 'rgba(167,243,208,0.55)', fontSize: '0.75rem' }}>
                    <strong style={{ color: '#34d399' }}>{tech.assets}</strong> assets
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
