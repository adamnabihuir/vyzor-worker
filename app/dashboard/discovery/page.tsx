'use client';

const RECON_FEATURES = [
  { icon: '🗂️', title: 'Container images', desc: 'Nothing detected. Add more cloud integrations to improve detection.', locked: false, empty: true },
  { icon: '🌐', title: 'Domain detection', desc: 'Discover domains related to your targets using automated detection tools.', locked: true },
  { icon: '🔍', title: 'Subdomain detection', desc: 'Keep track of all subdomains without the headache using automated enumeration.', locked: true },
  { icon: '🔒', title: 'Login detection', desc: 'Continuously monitor for login pages within your live targets.', locked: true },
  { icon: '⚙️', title: 'API detection', desc: 'Continuously monitor for APIs related to your live targets using domain detection tools.', locked: true },
];

const CLOUD_PROVIDERS = [
  { name: 'Amazon Web Services', icon: '☁️', color: '#f59e0b' },
  { name: 'Microsoft Azure', icon: '🔷', color: '#0ea5e9' },
  { name: 'Google Cloud', icon: '🌈', color: '#22c55e' },
  { name: 'Cloudflare', icon: '🔶', color: '#f97316' },
];

export default function DiscoveryPage() {
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-black text-2xl mb-1" style={{ color: '#0f172a' }}>Discovery</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Automatically map your external attack surface</p>
        </div>
        <button className="btn-primary text-white text-sm font-bold px-4 py-2.5 rounded-xl flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add asset
        </button>
      </div>

      {/* Target Recon */}
      <div className="card-glass rounded-2xl overflow-hidden mb-6">
        <div className="px-6 py-5" style={{ borderBottom: '1px solid #f1f5f9' }}>
          <h2 className="font-bold text-base" style={{ color: '#0f172a' }}>Target Recon</h2>
          <p className="text-sm mt-1" style={{ color: '#94a3b8' }}>Advanced reconnaissance — upgrade to Enterprise to unlock all features</p>
        </div>
        <div className="divide-y" style={{ borderColor: '#f8fafc' }}>
          {RECON_FEATURES.map((f, i) => (
            <div key={i} className="flex items-center justify-between px-6 py-5" style={{ opacity: f.locked ? 0.7 : 1 }}>
              <div className="flex items-start gap-4">
                <span className="text-xl">{f.icon}</span>
                <div>
                  <p className="font-semibold text-sm" style={{ color: '#0f172a' }}>{f.title}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#94a3b8', maxWidth: '480px' }}>{f.desc}</p>
                </div>
              </div>
              {f.locked ? (
                <button className="text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-2 transition-all"
                  style={{ background: 'rgba(99,102,241,0.08)', color: '#6366f1', border: '1px solid rgba(99,102,241,0.15)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.15)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(99,102,241,0.08)'}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  Talk to Sales
                </button>
              ) : f.empty ? (
                <span className="text-xs" style={{ color: '#94a3b8' }}>No data</span>
              ) : null}
            </div>
          ))}
        </div>
      </div>

      {/* Cloud Detection */}
      <div className="card-glass rounded-2xl overflow-hidden mb-6">
        <div className="px-6 py-5" style={{ borderBottom: '1px solid #f1f5f9' }}>
          <h2 className="font-bold text-base" style={{ color: '#0f172a' }}>Cloud Detection</h2>
          <p className="text-sm mt-1" style={{ color: '#94a3b8' }}>Assets detected from your targets that may be linked to cloud accounts</p>
        </div>
        <div className="px-6 py-5">
          <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.15)' }}>
            <div className="flex items-center gap-3">
              <span className="text-xl">🔷</span>
              <div>
                <p className="font-semibold text-sm" style={{ color: '#0f172a' }}>Unknown Azure account</p>
                <p className="text-xs" style={{ color: '#94a3b8' }}>Based on assets discovered in your targets</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
                style={{ background: 'rgba(99,102,241,0.08)', color: '#6366f1' }}>
                + Add integration
              </button>
              <button className="text-xs font-semibold px-3 py-1.5 rounded-lg" style={{ color: '#94a3b8' }}>
                × Dismiss
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Cloud Integrations */}
      <div className="card-glass rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: '1px solid #f1f5f9' }}>
          <div>
            <h2 className="font-bold text-base" style={{ color: '#0f172a' }}>Cloud Integrations</h2>
            <p className="text-sm mt-1" style={{ color: '#94a3b8' }}>Connect your cloud accounts to automatically discover and monitor assets</p>
          </div>
        </div>
        <div className="px-6 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {CLOUD_PROVIDERS.map((p, i) => (
              <button key={i}
                className="flex flex-col items-center gap-3 p-5 rounded-xl border-2 border-dashed transition-all"
                style={{ borderColor: '#e2e8f0', color: '#64748b' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.background = 'rgba(99,102,241,0.03)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = 'transparent'; }}>
                <span className="text-3xl">{p.icon}</span>
                <span className="text-xs font-semibold text-center" style={{ color: '#475569' }}>{p.name}</span>
                <span className="text-xs px-2 py-1 rounded-full" style={{ background: 'rgba(99,102,241,0.08)', color: '#6366f1' }}>+ Connect</span>
              </button>
            ))}
          </div>

          <div className="text-center py-8" style={{ borderTop: '1px solid #f1f5f9' }}>
            <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center text-3xl" style={{ background: '#f1f5f9' }}>☁️</div>
            <p className="font-semibold mb-1" style={{ color: '#0f172a' }}>No cloud assets connected yet</p>
            <p className="text-sm mb-4" style={{ color: '#94a3b8' }}>Connect AWS, Azure, GCP or Cloudflare to automatically manage and scan your assets</p>
            <button className="btn-primary text-white text-sm font-bold px-6 py-2.5 rounded-xl">
              + Add asset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
