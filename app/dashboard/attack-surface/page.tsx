'use client';

import { useState } from 'react';

const SERVICES = [
  { target: 'acmecorp.com', ip: '104.26.11.45', status: 'active', port: '443/tcp/https', product: 'Nginx', tls: { expiry: '2026-11-12', valid: true } },
  { target: 'acmecorp.com', ip: '104.26.11.45', status: 'active', port: '80/tcp/http', product: 'Nginx', tls: null },
  { target: 'acmecorp.com', ip: '104.26.10.45', status: 'active', port: '443/tcp/https', product: 'Cloudflare', tls: { expiry: '2026-08-20', valid: true } },
  { target: 'acmecorp.com', ip: '208.67.222.222', status: 'unresponsive', port: '22/tcp/ssh', product: 'OpenSSH', tls: null },
  { target: 'techstart.io', ip: '172.67.35.12', status: 'active', port: '443/tcp/https', product: 'Apache', tls: { expiry: '2026-07-15', valid: true } },
  { target: 'techstart.io', ip: '172.67.35.12', status: 'active', port: '80/tcp/http', product: 'Apache', tls: null },
];

const PRODUCTS = ['Nginx', 'OpenSSH', 'Apache', 'Cloudflare'];
const PRODUCT_COUNTS: Record<string, number> = { Nginx: 12, OpenSSH: 2, Apache: 2, Cloudflare: 1 };

export default function AttackSurfacePage() {
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [tlsFilter, setTlsFilter] = useState<string | null>(null);
  const [searchService, setSearchService] = useState('');

  const filtered = SERVICES.filter(s => {
    if (selectedProducts.length > 0 && !selectedProducts.includes(s.product)) return false;
    if (tlsFilter === 'expiring' && s.tls) {
      const days = Math.floor((new Date(s.tls.expiry).getTime() - Date.now()) / 86400000);
      if (days > 30) return false;
    }
    if (tlsFilter === 'expired' && (!s.tls || new Date(s.tls.expiry) > new Date())) return false;
    if (searchService && !s.port.includes(searchService) && !s.product.toLowerCase().includes(searchService.toLowerCase())) return false;
    return true;
  });

  const toggleProduct = (p: string) =>
    setSelectedProducts(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="font-black text-2xl mb-1" style={{ color: '#0f172a' }}>Attack surface</h1>
        <p className="text-sm" style={{ color: '#94a3b8' }}>Target and service information from automated network scans</p>
      </div>

      <div className="flex gap-6">
        {/* Filter sidebar */}
        <div style={{ width: '240px', flexShrink: 0 }} className="space-y-4">
          {/* TLS/SSL Certificates */}
          <div className="card-glass rounded-2xl overflow-hidden">
            <div className="px-4 py-3" style={{ borderBottom: '1px solid #f1f5f9' }}>
              <p className="text-xs font-bold uppercase tracking-wide" style={{ color: '#94a3b8' }}>TLS / SSL certificates</p>
            </div>
            <div className="px-4 py-3 space-y-2">
              {[
                { key: 'expiring', label: 'Expiring in 30 days', count: 3 },
                { key: 'expired', label: 'Expired', count: 1 },
              ].map(f => (
                <label key={f.key} className="flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" checked={tlsFilter === f.key}
                      onChange={() => setTlsFilter(tlsFilter === f.key ? null : f.key)}
                      className="rounded" />
                    <span className="text-xs" style={{ color: '#475569' }}>{f.label}</span>
                  </div>
                  <span className="text-xs font-bold" style={{ color: '#6366f1' }}>{f.count}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Products */}
          <div className="card-glass rounded-2xl overflow-hidden">
            <div className="px-4 py-3" style={{ borderBottom: '1px solid #f1f5f9' }}>
              <p className="text-xs font-bold uppercase tracking-wide" style={{ color: '#94a3b8' }}>Products</p>
            </div>
            <div className="px-4 py-3 space-y-1.5">
              <input type="text" placeholder="Search" className="scan-input w-full rounded-lg px-3 py-1.5 text-xs mb-2" />
              {PRODUCTS.map(p => (
                <label key={p} className="flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" checked={selectedProducts.includes(p)}
                      onChange={() => toggleProduct(p)} className="rounded" />
                    <span className="text-xs" style={{ color: '#475569' }}>{p}</span>
                  </div>
                  <span className="text-xs font-bold" style={{ color: '#6366f1' }}>{PRODUCT_COUNTS[p]}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Service names */}
          <div className="card-glass rounded-2xl overflow-hidden">
            <div className="px-4 py-3" style={{ borderBottom: '1px solid #f1f5f9' }}>
              <p className="text-xs font-bold uppercase tracking-wide" style={{ color: '#94a3b8' }}>Service names</p>
            </div>
            <div className="px-4 py-3 space-y-1.5">
              <input type="text" placeholder="Search service names" value={searchService} onChange={e => setSearchService(e.target.value)}
                className="scan-input w-full rounded-lg px-3 py-1.5 text-xs mb-2" />
              {[{ name: 'https', count: 29 }, { name: 'http', count: 6 }, { name: 'ssh', count: 2 }].map(s => (
                <label key={s.name} className="flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-xs font-mono" style={{ color: '#475569' }}>{s.name}</span>
                  </div>
                  <span className="text-xs font-bold" style={{ color: '#6366f1' }}>{s.count}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Upgrade banner */}
          <div className="rounded-2xl p-6 mb-6" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.06), rgba(14,165,233,0.06))', border: '1px solid rgba(99,102,241,0.15)' }}>
            <p className="font-bold text-sm mb-1" style={{ color: '#0f172a' }}>Unlock the benefits of comprehensive attack surface scanning</p>
            <p className="text-xs mb-4" style={{ color: '#64748b' }}>Upgrade to Vyzor's Enterprise plan to get network scanning features such as:</p>
            <ul className="space-y-1.5 mb-4">
              {['A growing list of 1,000+ attack surface checks', 'Daily network discovery scans', 'Visibility across your entire attack surface', 'Alerts from attack surface issues'].map(item => (
                <li key={item} className="flex items-center gap-2 text-xs" style={{ color: '#475569' }}>
                  <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(99,102,241,0.15)' }}>
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  {item}
                </li>
              ))}
            </ul>
            <button className="btn-primary text-white text-xs font-bold px-4 py-2 rounded-xl">Talk to Sales</button>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm font-semibold" style={{ color: '#64748b' }}>
              <strong style={{ color: '#0f172a' }}>{filtered.length} services</strong> · {new Set(filtered.map(s => s.target)).size} targets
            </span>
            <button className="ml-auto text-xs font-semibold px-3 py-1.5 rounded-lg" style={{ background: '#f1f5f9', color: '#475569' }}>Export</button>
          </div>

          {/* Services list */}
          <div className="space-y-3">
            {Object.entries(
              filtered.reduce((acc, s) => {
                if (!acc[s.target]) acc[s.target] = [];
                acc[s.target].push(s);
                return acc;
              }, {} as Record<string, typeof SERVICES>)
            ).map(([target, services]) => (
              <div key={target} className="card-glass rounded-2xl overflow-hidden">
                <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: '1px solid #f1f5f9', background: '#fafafa' }}>
                  <div className="w-2 h-2 rounded-full" style={{ background: '#22c55e' }} />
                  <span className="font-bold text-sm" style={{ color: '#0f172a' }}>{target}</span>
                  <span className="text-xs ml-auto" style={{ color: '#94a3b8' }}>{services.length} service{services.length !== 1 ? 's' : ''}</span>
                </div>
                {services.map((svc, i) => (
                  <div key={i} className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50 transition-colors"
                    style={{ borderBottom: i < services.length - 1 ? '1px solid #f8fafc' : 'none' }}>
                    <div className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ background: svc.status === 'active' ? '#22c55e' : '#94a3b8' }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-mono font-semibold" style={{ color: '#0f172a' }}>{svc.port}</span>
                        <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(99,102,241,0.08)', color: '#6366f1' }}>{svc.product}</span>
                      </div>
                      <span className="text-xs font-mono" style={{ color: '#94a3b8' }}>{svc.ip}</span>
                    </div>
                    {svc.tls && (
                      <div className="text-right">
                        <p className="text-xs font-semibold" style={{ color: '#0f172a' }}>TLS</p>
                        <p className="text-xs" style={{ color: '#94a3b8' }}>Expires {svc.tls.expiry}</p>
                      </div>
                    )}
                    <button style={{ color: '#94a3b8' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
                    </button>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
