'use client';

import { useState, useEffect } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

type AssetType = 'subdomain' | 'port' | 'service' | 'url' | 'certificate';

type Asset = {
  id?: string;
  type: AssetType | string;
  value: string;
  ip_address?: string | null;
  port?: number | null;
  protocol?: string | null;
  service_name?: string | null;
  service_version?: string | null;
  http_status?: number | null;
  http_title?: string | null;
  tls_valid?: boolean | null;
  tls_expiry?: string | null;
  tls_grade?: string | null;
  is_cdn?: boolean;
  cdn_provider?: string | null;
  first_seen_at: string;
  last_seen_at: string;
};

type Change = {
  id: string;
  change_type: 'added' | 'removed' | 'changed';
  field: string;
  old_value?: string | null;
  new_value?: string | null;
  created_at: string;
};

type Summary = {
  totalAssets: number;
  subdomains: number;
  openPorts: number;
  services: number;
};

// ─── Risk port definitions ────────────────────────────────────────────────────

const RISKY_PORTS: Record<number, { label: string; reason: string; color: string }> = {
  21:   { label: 'FTP',     reason: 'Plaintext file transfer',         color: '#ef4444' },
  22:   { label: 'SSH',     reason: 'Direct shell access',             color: '#f59e0b' },
  23:   { label: 'Telnet',  reason: 'Unencrypted remote access',       color: '#ef4444' },
  25:   { label: 'SMTP',    reason: 'Mail relay / spam risk',          color: '#f59e0b' },
  3306: { label: 'MySQL',   reason: 'Database exposed to internet',    color: '#ef4444' },
  3389: { label: 'RDP',     reason: 'Remote desktop — high risk',      color: '#ef4444' },
  5432: { label: 'Postgres',reason: 'Database exposed to internet',    color: '#ef4444' },
  6379: { label: 'Redis',   reason: 'Cache DB — often unauthenticated',color: '#ef4444' },
  8080: { label: 'HTTP Alt',reason: 'Unencrypted HTTP alternative',    color: '#f59e0b' },
  27017:{ label: 'MongoDB', reason: 'Database exposed to internet',    color: '#ef4444' },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const GLASS: React.CSSProperties = {
  background: 'rgba(255,255,255,0.07)',
  backdropFilter: 'blur(18px)',
  WebkitBackdropFilter: 'blur(18px)',
  border: '1px solid rgba(255,255,255,0.13)',
  boxShadow: '0 4px 28px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.1)',
};

function fmtDate(iso: string) {
  try { return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }); }
  catch { return '—'; }
}

function fmtRelative(iso: string) {
  try {
    const diff = Date.now() - new Date(iso).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return 'today';
    if (days === 1) return 'yesterday';
    return `${days}d ago`;
  } catch { return '—'; }
}

function TLSGradeBadge({ grade }: { grade: string | null | undefined }) {
  if (!grade) return <span className="text-xs" style={{ color: 'rgba(167,243,208,0.3)' }}>—</span>;
  const color = grade === 'A+' ? '#34d399' : grade === 'A' ? '#34d399' : grade === 'B' ? '#f59e0b' : grade === 'C' ? '#f59e0b' : '#ef4444';
  return (
    <span className="text-xs font-black px-1.5 py-0.5 rounded"
      style={{ background: `${color}18`, color, border: `1px solid ${color}30` }}>
      {grade}
    </span>
  );
}

function TypeBadge({ type }: { type: string }) {
  const MAP: Record<string, { label: string; color: string }> = {
    subdomain:   { label: 'Subdomain',   color: '#34d399' },
    port:        { label: 'Port',        color: '#3b82f6' },
    service:     { label: 'Service',     color: '#a78bfa' },
    url:         { label: 'URL',         color: '#f59e0b' },
    certificate: { label: 'Certificate', color: '#94a3b8' },
  };
  const { label, color } = MAP[type] ?? { label: type, color: '#94a3b8' };
  return (
    <span className="text-xs font-bold px-2 py-0.5 rounded-full"
      style={{ background: `${color}15`, color, border: `1px solid ${color}25` }}>
      {label}
    </span>
  );
}

function HttpStatusDot({ status }: { status: number | null | undefined }) {
  if (!status) return null;
  const color = status < 300 ? '#34d399' : status < 400 ? '#f59e0b' : '#ef4444';
  return (
    <span className="flex items-center gap-1 text-xs font-mono" style={{ color }}>
      <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: color }} />
      {status}
    </span>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type FilterType = 'all' | 'subdomain' | 'port' | 'service';

export default function AttackSurfacePage() {
  const [assets, setAssets]       = useState<Asset[]>([]);
  const [summary, setSummary]     = useState<Summary>({ totalAssets: 0, subdomains: 0, openPorts: 0, services: 0 });
  const [changes, setChanges]     = useState<Change[]>([]);
  const [loading, setLoading]     = useState(true);
  const [isEmpty, setIsEmpty]     = useState(false);

  const [filter, setFilter]       = useState<FilterType>('all');
  const [search, setSearch]       = useState('');
  const [selected, setSelected]   = useState<Asset | null>(null);

  useEffect(() => {
    fetch('/api/attack-surface')
      .then(r => r.json())
      .then(data => {
        if (data.error || !data.assets || data.assets.length === 0) {
          setIsEmpty(true);
        } else {
          setAssets(data.assets);
          setSummary(data.summary);
          setChanges(data.recentChanges ?? []);
        }
      })
      .catch(() => setIsEmpty(true))
      .finally(() => setLoading(false));
  }, []);

  const filtered = assets.filter(a => {
    const matchType   = filter === 'all' || a.type === filter || (filter === 'service' && a.service_name);
    const matchSearch = !search || a.value.toLowerCase().includes(search.toLowerCase()) || (a.service_name ?? '').toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  // Derived risk signals
  const riskyPorts = assets.filter(a => a.type === 'port' && a.port != null && RISKY_PORTS[a.port as number]);
  const tlsIssues  = assets.filter(a => a.tls_valid === false || a.tls_grade === 'F' || a.tls_grade === 'C');
  const newAssets  = assets.filter(a => {
    const diff = Date.now() - new Date(a.first_seen_at).getTime();
    return diff < 7 * 24 * 60 * 60 * 1000;
  });

  // Service distribution
  const svcCounts: Record<string, number> = {};
  assets.forEach(a => { if (a.service_name) svcCounts[a.service_name] = (svcCounts[a.service_name] ?? 0) + 1; });
  const topServices = Object.entries(svcCounts).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const maxSvc = topServices[0]?.[1] ?? 1;

  const STAT_CARDS = [
    { label: 'Total assets',  value: summary.totalAssets, color: '#34d399', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg> },
    { label: 'Subdomains',    value: summary.subdomains,  color: '#34d399', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20"/></svg> },
    { label: 'Open ports',    value: summary.openPorts,   color: '#3b82f6', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg> },
    { label: 'Services',      value: summary.services,    color: '#a78bfa', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 20V10M12 20V4M6 20v-6"/></svg> },
  ];

  return (
    <div className="p-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-black text-2xl mb-1" style={{ color: '#f0fdf4' }}>Attack Surface</h1>
          <p className="text-sm" style={{ color: 'rgba(167,243,208,0.5)' }}>
            {isEmpty ? 'Add a domain and run a scan to map your attack surface' : `${summary.totalAssets} assets discovered across all your domains`}
          </p>
        </div>
        <button className="text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2"
          style={{ background: '#34d399', color: '#021a12' }}
          onClick={() => window.location.href = '/dashboard/domains/add'}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add domain
        </button>
      </div>

      {/* Empty state notice */}
      {isEmpty && !loading && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.15)' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20"/>
            </svg>
          </div>
          <h2 className="font-black text-lg mb-2" style={{ color: '#f0fdf4' }}>No assets yet</h2>
          <p className="text-sm mb-6 max-w-sm" style={{ color: 'rgba(167,243,208,0.5)' }}>
            Add a domain, verify ownership, and run a scan to discover your attack surface.
          </p>
          <button onClick={() => window.location.href = '/dashboard/domains/add'}
            className="font-bold px-5 py-2.5 rounded-xl text-sm flex items-center gap-2"
            style={{ background: '#34d399', color: '#021a12' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add your first domain
          </button>
        </div>
      )}

      {/* Stats strip */}
      {!isEmpty && <div className="grid grid-cols-4 gap-3 mb-6">
        {STAT_CARDS.map(card => (
          <div key={card.label} className="rounded-2xl px-4 py-3" style={GLASS}>
            <div className="flex items-center gap-2 mb-2" style={{ color: card.color }}>
              {card.icon}
              <p className="text-xs font-bold uppercase tracking-wide">{card.label}</p>
            </div>
            <p className="font-black text-3xl" style={{ color: '#f0fdf4' }}>
              {loading ? '—' : card.value}
            </p>
          </div>
        ))}
      </div>}

      {/* Risk signals strip */}
      {!loading && !isEmpty && (riskyPorts.length > 0 || tlsIssues.length > 0) && (
        <div className="flex gap-3 mb-5 flex-wrap">
          {riskyPorts.length > 0 && (
            <div className="flex items-start gap-3 px-4 py-3 rounded-xl flex-1 min-w-0"
              style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" style={{ flexShrink: 0, marginTop: '1px' }}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              <div className="min-w-0">
                <p className="text-xs font-bold mb-1" style={{ color: '#ef4444' }}>{riskyPorts.length} risky port{riskyPorts.length !== 1 ? 's' : ''} exposed</p>
                <p className="text-xs truncate" style={{ color: 'rgba(167,243,208,0.55)' }}>
                  {riskyPorts.slice(0, 3).map(a => {
                    const p = RISKY_PORTS[a.port as number];
                    return `${p.label} (${a.port})`;
                  }).join(' · ')}{riskyPorts.length > 3 ? ` +${riskyPorts.length - 3} more` : ''}
                </p>
              </div>
            </div>
          )}
          {tlsIssues.length > 0 && (
            <div className="flex items-start gap-3 px-4 py-3 rounded-xl flex-1 min-w-0"
              style={{ background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.2)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" style={{ flexShrink: 0, marginTop: '1px' }}><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              <div className="min-w-0">
                <p className="text-xs font-bold mb-1" style={{ color: '#f59e0b' }}>{tlsIssues.length} TLS issue{tlsIssues.length !== 1 ? 's' : ''}</p>
                <p className="text-xs" style={{ color: 'rgba(167,243,208,0.55)' }}>Assets with invalid or weak TLS configuration</p>
              </div>
            </div>
          )}
          {newAssets.length > 0 && (
            <div className="flex items-start gap-3 px-4 py-3 rounded-xl flex-1 min-w-0"
              style={{ background: 'rgba(59,130,246,0.07)', border: '1px solid rgba(59,130,246,0.2)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" style={{ flexShrink: 0, marginTop: '1px' }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
              <div className="min-w-0">
                <p className="text-xs font-bold mb-1" style={{ color: '#3b82f6' }}>{newAssets.length} new asset{newAssets.length !== 1 ? 's' : ''} this week</p>
                <p className="text-xs" style={{ color: 'rgba(167,243,208,0.55)' }}>Discovered in the last 7 days</p>
              </div>
            </div>
          )}
        </div>
      )}

      {!isEmpty && <div className="flex gap-4">

        {/* Main asset table */}
        <div className="flex-1 min-w-0">

          {/* Filter / search bar */}
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            {(['all', 'subdomain', 'port', 'service'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg capitalize transition-all"
                style={{ background: filter === f ? 'rgba(52,211,153,0.15)' : 'rgba(255,255,255,0.06)', color: filter === f ? '#34d399' : 'rgba(167,243,208,0.5)', border: '1px solid rgba(255,255,255,0.08)' }}>
                {f === 'all' ? `All (${assets.length})` : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
            <div className="ml-auto relative">
              <svg className="absolute left-2.5 top-1/2 -translate-y-1/2" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(167,243,208,0.4)" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <input type="text" placeholder="Search assets…" value={search} onChange={e => setSearch(e.target.value)}
                className="scan-input rounded-lg pl-8 pr-3 py-1.5 text-xs" style={{ width: '180px' }} />
            </div>
          </div>

          {/* Table */}
          <div className="rounded-2xl overflow-hidden" style={{ ...GLASS, width: selected ? 'calc(100% - 0px)' : '100%' }}>
            <div className="px-5 py-3 grid text-xs font-bold uppercase tracking-wide"
              style={{ gridTemplateColumns: 'minmax(0,3fr) 90px 100px 60px 80px 80px', gap: '8px', borderBottom: '1px solid rgba(255,255,255,0.08)', color: 'rgba(167,243,208,0.4)' }}>
              <span>Asset</span>
              <span>Type</span>
              <span>Service</span>
              <span>TLS</span>
              <span>Status</span>
              <span>First seen</span>
            </div>

            {loading ? (
              <div className="px-5 py-12 text-center">
                <p className="text-sm" style={{ color: 'rgba(167,243,208,0.4)' }}>Loading assets…</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="px-5 py-12 text-center">
                <p className="text-sm" style={{ color: 'rgba(167,243,208,0.4)' }}>No assets match the current filter.</p>
              </div>
            ) : (
              filtered.map((asset, i) => (
                <div key={asset.id ?? asset.value} onClick={() => setSelected(s => s?.value === asset.value ? null : asset)}
                  className="px-5 py-3.5 grid cursor-pointer transition-all"
                  style={{
                    gridTemplateColumns: 'minmax(0,3fr) 90px 100px 60px 80px 80px', gap: '8px',
                    borderBottom: i < filtered.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                    background: selected?.value === asset.value ? 'rgba(52,211,153,0.08)' : 'transparent',
                    borderLeft: selected?.value === asset.value ? '3px solid #34d399' : '3px solid transparent',
                  }}
                  onMouseEnter={e => { if (selected?.value !== asset.value) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                  onMouseLeave={e => { if (selected?.value !== asset.value) e.currentTarget.style.background = 'transparent'; }}>

                  {/* Asset value */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-mono font-semibold truncate" style={{ color: '#f0fdf4' }}>{asset.value}</p>
                      {asset.type === 'port' && asset.port != null && RISKY_PORTS[asset.port as number] && (
                        <span title={RISKY_PORTS[asset.port as number].reason} style={{ flexShrink: 0 }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={RISKY_PORTS[asset.port as number].color} strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                        </span>
                      )}
                    </div>
                    {asset.ip_address && (
                      <p className="text-xs font-mono mt-0.5 truncate" style={{ color: 'rgba(167,243,208,0.4)' }}>
                        {asset.ip_address}
                        {asset.is_cdn && <span className="ml-1.5 text-xs font-bold" style={{ color: '#f59e0b' }}>CDN</span>}
                        {asset.cdn_provider && <span className="ml-1" style={{ color: 'rgba(167,243,208,0.3)' }}>({asset.cdn_provider})</span>}
                      </p>
                    )}
                  </div>

                  {/* Type */}
                  <div className="flex items-center"><TypeBadge type={asset.type} /></div>

                  {/* Service */}
                  <div className="flex items-center min-w-0">
                    {asset.service_name ? (
                      <div className="min-w-0">
                        <p className="text-xs font-mono truncate" style={{ color: 'rgba(167,243,208,0.7)' }}>{asset.service_name}</p>
                        {asset.service_version && (
                          <p className="text-xs font-mono truncate" style={{ color: 'rgba(167,243,208,0.35)' }}>{asset.service_version}</p>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs" style={{ color: 'rgba(167,243,208,0.25)' }}>—</span>
                    )}
                  </div>

                  {/* TLS */}
                  <div className="flex items-center"><TLSGradeBadge grade={asset.tls_grade} /></div>

                  {/* HTTP Status */}
                  <div className="flex items-center"><HttpStatusDot status={asset.http_status} /></div>

                  {/* First seen */}
                  <div className="flex items-center">
                    <span className="text-xs" style={{ color: 'rgba(167,243,208,0.4)' }}>{fmtRelative(asset.first_seen_at)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right panel: detail or recent changes */}
        <div className="flex-shrink-0" style={{ width: '280px' }}>

          {/* Asset detail */}
          {selected ? (
            <div className="rounded-2xl overflow-hidden mb-4" style={GLASS}>
              <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <p className="text-xs font-bold uppercase tracking-wide" style={{ color: 'rgba(167,243,208,0.5)' }}>Asset Detail</p>
                <button onClick={() => setSelected(null)} style={{ color: 'rgba(167,243,208,0.4)' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
              <div className="px-5 py-4 space-y-3">
                <div>
                  <p className="text-xs font-mono font-bold break-all" style={{ color: '#f0fdf4' }}>{selected.value}</p>
                  <div className="mt-1"><TypeBadge type={selected.type} /></div>
                </div>
                {[
                  { label: 'IP',          value: selected.ip_address },
                  { label: 'Port',        value: selected.port ? String(selected.port) : null },
                  { label: 'Protocol',    value: selected.protocol },
                  { label: 'Service',     value: selected.service_name },
                  { label: 'Version',     value: selected.service_version },
                  { label: 'HTTP',        value: selected.http_status ? String(selected.http_status) : null },
                  { label: 'Page title',  value: selected.http_title },
                  { label: 'TLS grade',   value: selected.tls_grade },
                  { label: 'TLS expiry',  value: selected.tls_expiry ? fmtDate(selected.tls_expiry) : null },
                  { label: 'CDN',         value: selected.is_cdn ? (selected.cdn_provider ?? 'Yes') : null },
                  { label: 'First seen',  value: fmtDate(selected.first_seen_at) },
                  { label: 'Last seen',   value: fmtDate(selected.last_seen_at) },
                ].filter(r => r.value).map(({ label, value }) => (
                  <div key={label} className="flex justify-between gap-2">
                    <span className="text-xs font-semibold flex-shrink-0" style={{ color: 'rgba(167,243,208,0.4)' }}>{label}</span>
                    <span className="text-xs font-mono text-right break-all" style={{ color: 'rgba(167,243,208,0.8)' }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {/* Service distribution */}
          {topServices.length > 0 && (
            <div className="rounded-2xl overflow-hidden mb-4" style={GLASS}>
              <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <p className="text-xs font-bold uppercase tracking-wide" style={{ color: 'rgba(167,243,208,0.5)' }}>Services</p>
              </div>
              <div className="px-5 py-4 space-y-2.5">
                {topServices.map(([svc, count]) => (
                  <div key={svc}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-mono font-semibold" style={{ color: 'rgba(167,243,208,0.7)' }}>{svc}</span>
                      <span className="text-xs font-bold" style={{ color: '#f0fdf4' }}>{count}</span>
                    </div>
                    <div style={{ height: '4px', borderRadius: '999px', background: 'rgba(255,255,255,0.07)' }}>
                      <div style={{ height: '100%', width: `${Math.round((count / maxSvc) * 100)}%`, borderRadius: '999px', background: 'linear-gradient(90deg,#34d399,#059669)', transition: 'width 0.4s ease' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent changes */}
          <div className="rounded-2xl overflow-hidden" style={GLASS}>
            <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <p className="text-xs font-bold uppercase tracking-wide" style={{ color: 'rgba(167,243,208,0.5)' }}>Recent Changes</p>
            </div>
            {changes.length === 0 ? (
              <div className="px-5 py-6 text-center">
                <p className="text-xs" style={{ color: 'rgba(167,243,208,0.35)' }}>No changes detected yet. Run a second scan on the same domain to see diffs.</p>
              </div>
            ) : (
              changes.slice(0, 8).map(change => (
                <div key={change.id} className="px-5 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ background: change.change_type === 'added' ? '#34d399' : change.change_type === 'removed' ? '#ef4444' : '#f59e0b' }} />
                    <span className="text-xs font-bold capitalize"
                      style={{ color: change.change_type === 'added' ? '#34d399' : change.change_type === 'removed' ? '#ef4444' : '#f59e0b' }}>
                      {change.change_type}
                    </span>
                    <span className="text-xs ml-auto" style={{ color: 'rgba(167,243,208,0.35)' }}>{fmtRelative(change.created_at)}</span>
                  </div>
                  <p className="text-xs font-mono truncate" style={{ color: 'rgba(167,243,208,0.7)' }}>
                    {change.new_value ?? change.old_value ?? change.field}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

      </div>}
    </div>
  );
}
