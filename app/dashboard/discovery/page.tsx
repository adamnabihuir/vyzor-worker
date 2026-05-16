'use client';

import { useState, useEffect } from 'react';

const GLASS: React.CSSProperties = {
  background: 'rgba(255,255,255,0.07)',
  backdropFilter: 'blur(18px)',
  WebkitBackdropFilter: 'blur(18px)',
  border: '1px solid rgba(255,255,255,0.13)',
  boxShadow: '0 4px 28px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.1)',
};

const C = {
  text: '#f0fdf4',
  muted: 'rgba(167,243,208,0.55)',
  veryMuted: 'rgba(167,243,208,0.4)',
  accent: '#34d399',
  rowBg: 'rgba(255,255,255,0.04)',
  innerBorder: 'rgba(255,255,255,0.08)',
};

type PortRow = { host: string; ip?: string; port: number; protocol: string; service: string; product?: string; version?: string };
type AttackSurface = {
  subdomains: string[];
  ports: PortRow[];
  stats: { assetsDiscovered: number; portsScanned: number; vulnerabilities: { critical: number; high: number; medium: number; low: number }; riskScore: number };
};

const RISKY_PORTS = new Set([21, 22, 23, 25, 3306, 3389, 5432, 5900, 6379, 9200, 27017]);

function statusFor(port: number): 'Critical' | 'Exposed' | 'Active' {
  if ([23, 3389, 6379, 9200, 27017, 5900].includes(port)) return 'Critical';
  if (RISKY_PORTS.has(port)) return 'Exposed';
  return 'Active';
}

function StatusBadge({ status }: { status: string }) {
  const cfg: Record<string, { bg: string; color: string }> = {
    Critical: { bg: 'rgba(239,68,68,0.12)', color: '#f87171' },
    Exposed:  { bg: 'rgba(245,158,11,0.12)', color: '#fbbf24' },
    Active:   { bg: 'rgba(52,211,153,0.1)',  color: '#34d399' },
  };
  const s = cfg[status] ?? cfg.Active;
  return (
    <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: s.bg, color: s.color }}>
      {status}
    </span>
  );
}

type Tab = 'assets' | 'ports';

export default function DiscoveryPage() {
  const [data, setData]       = useState<AttackSurface | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab]         = useState<Tab>('assets');
  const [search, setSearch]   = useState('');

  useEffect(() => {
    fetch('/api/attack-surface')
      .then(r => r.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const subdomains = data?.subdomains ?? [];
  const ports      = data?.ports ?? [];
  const stats      = data?.stats ?? { assetsDiscovered: 0, portsScanned: 0, vulnerabilities: { critical: 0, high: 0, medium: 0, low: 0 }, riskScore: 0 };

  const filteredAssets = subdomains.filter(s => s.toLowerCase().includes(search.toLowerCase()));
  const filteredPorts  = ports.filter(p =>
    p.host.toLowerCase().includes(search.toLowerCase()) ||
    p.service.toLowerCase().includes(search.toLowerCase()) ||
    String(p.port).includes(search)
  );

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-black text-2xl" style={{ color: C.text }}>Discovery</h1>
          <p className="text-sm mt-1" style={{ color: C.muted }}>Asset inventory from your latest scans</p>
        </div>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Assets discovered', value: loading ? '—' : stats.assetsDiscovered },
          { label: 'Open ports',        value: loading ? '—' : stats.portsScanned },
          { label: 'Critical findings', value: loading ? '—' : stats.vulnerabilities.critical, color: stats.vulnerabilities.critical > 0 ? '#f87171' : C.text },
          { label: 'Risk score',        value: loading ? '—' : `${stats.riskScore}/100`, color: stats.riskScore >= 75 ? '#f87171' : stats.riskScore >= 50 ? '#fbbf24' : C.accent },
        ].map((s, i) => (
          <div key={i} className="rounded-2xl p-5" style={GLASS}>
            <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: C.muted }}>{s.label}</p>
            <p className="font-black text-3xl" style={{ color: s.color ?? C.text }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs + search */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex gap-0" style={{ borderBottom: `1px solid ${C.innerBorder}` }}>
          {(['assets', 'ports'] as Tab[]).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className="px-5 py-2.5 text-sm font-semibold capitalize transition-all"
              style={{
                color: tab === t ? C.accent : C.muted,
                borderBottom: tab === t ? `2px solid ${C.accent}` : '2px solid transparent',
                marginBottom: -1,
              }}>
              {t === 'assets' ? `Subdomains (${subdomains.length})` : `Open ports (${ports.length})`}
            </button>
          ))}
        </div>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search…"
          className="text-sm px-3 py-2 rounded-xl"
          style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${C.innerBorder}`, color: C.text, outline: 'none', width: 200 }}
        />
      </div>

      {/* Content */}
      {loading && (
        <div className="rounded-2xl p-12 text-center" style={GLASS}>
          <p className="text-sm" style={{ color: C.muted }}>Loading discovery data…</p>
        </div>
      )}

      {!loading && tab === 'assets' && (
        <div className="rounded-2xl overflow-hidden" style={GLASS}>
          <div className="px-6 py-3 text-xs font-bold uppercase tracking-wider grid"
            style={{ gridTemplateColumns: '2fr 1fr 1fr', gap: 12, background: C.rowBg, borderBottom: `1px solid ${C.innerBorder}`, color: C.muted }}>
            <span>Host</span><span>Type</span><span>Status</span>
          </div>
          {filteredAssets.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-sm" style={{ color: C.muted }}>
                {subdomains.length === 0 ? 'Run a scan to discover assets.' : 'No results for your search.'}
              </p>
            </div>
          ) : filteredAssets.map((host, i) => {
            const hostPorts = ports.filter(p => p.host === host);
            const worstPort = hostPorts.reduce((worst, p) => {
              const s = statusFor(p.port);
              if (s === 'Critical') return s;
              if (s === 'Exposed' && worst !== 'Critical') return s;
              return worst;
            }, 'Active' as string);
            return (
              <div key={host} className="px-6 py-3.5 grid items-center"
                style={{ gridTemplateColumns: '2fr 1fr 1fr', gap: 12, borderBottom: i < filteredAssets.length - 1 ? `1px solid ${C.innerBorder}` : 'none', background: i % 2 === 0 ? 'transparent' : C.rowBg }}>
                <span className="text-sm font-mono font-semibold" style={{ color: C.text }}>{host}</span>
                <span className="text-xs" style={{ color: C.muted }}>
                  {hostPorts.length > 0 ? hostPorts.map(p => p.port).join(', ') : '—'}
                </span>
                <StatusBadge status={worstPort} />
              </div>
            );
          })}
        </div>
      )}

      {!loading && tab === 'ports' && (
        <div className="rounded-2xl overflow-hidden" style={GLASS}>
          <div className="px-6 py-3 text-xs font-bold uppercase tracking-wider grid"
            style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: 12, background: C.rowBg, borderBottom: `1px solid ${C.innerBorder}`, color: C.muted }}>
            <span>Host</span><span>Port</span><span>Protocol</span><span>Service</span><span>Status</span>
          </div>
          {filteredPorts.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-sm" style={{ color: C.muted }}>
                {ports.length === 0 ? 'No open ports found in recent scans.' : 'No results for your search.'}
              </p>
            </div>
          ) : filteredPorts.map((p, i) => {
            const status = statusFor(p.port);
            return (
              <div key={`${p.host}-${p.port}`} className="px-6 py-3.5 grid items-center"
                style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: 12, borderBottom: i < filteredPorts.length - 1 ? `1px solid ${C.innerBorder}` : 'none', background: i % 2 === 0 ? 'transparent' : C.rowBg }}>
                <span className="text-sm font-mono font-semibold truncate" style={{ color: C.text }}>{p.host}</span>
                <span className="text-sm font-bold" style={{ color: C.accent }}>{p.port}</span>
                <span className="text-xs" style={{ color: C.muted }}>{p.protocol.toUpperCase()}</span>
                <span className="text-xs" style={{ color: C.muted }}>{p.service}{p.product ? ` · ${p.product}` : ''}</span>
                <StatusBadge status={status} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
