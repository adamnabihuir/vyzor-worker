'use client';

import { useState } from 'react';

const INTEGRATIONS = [
  { name: 'Intruder API', desc: 'Manage your targets, scans and assets, and retrieve your results via our API.', icon: '⚡', category: 'API', connected: false },
  { name: 'AWS', desc: 'Authorize your cloud assets to save time and ensure complete coverage. Scan for misconfigurations and security weaknesses.', icon: '☁️', category: 'Cloud', connected: false },
  { name: 'Azure', desc: 'Authorize your cloud assets to save time and ensure complete coverage. Scan for misconfigurations and security weaknesses.', icon: '🔷', category: 'Cloud', connected: false },
  { name: 'Azure DevOps', desc: 'Create new issues for any new security vulnerabilities we discover.', icon: '🔵', category: 'DevOps', connected: false },
  { name: 'Cloudflare', desc: 'Automatically import any internet exposed assets so you make sure you\'re not missing anything.', icon: '🔶', category: 'Cloud', connected: false },
  { name: 'Graia', desc: 'Make vulnerability management compliance a snap by automatically sending your scan results.', icon: '📊', category: 'Compliance', connected: false },
  { name: 'Google Cloud', desc: 'Authorize your cloud assets to save time and ensure complete coverage. Scan for misconfigurations and security weaknesses.', icon: '🌈', category: 'Cloud', connected: false },
  { name: 'GitHub', desc: 'Create new issues for any new security vulnerabilities we discover.', icon: '🐙', category: 'DevOps', connected: false },
  { name: 'GitLab', desc: 'Create new issues for any new security vulnerabilities we discover.', icon: '🦊', category: 'DevOps', connected: false },
  { name: 'Jira', desc: 'Create new issues for any new security vulnerabilities we discover.', icon: '🔵', category: 'DevOps', connected: false },
  { name: 'Okta', desc: 'Manage users in Intruder using Okta as an identity manager.', icon: '🔐', category: 'Auth', connected: false },
  { name: 'Microsoft Sentinel', desc: 'Automatically send data from Intruder to Microsoft Sentinel.', icon: '🛡️', category: 'SIEM', connected: false },
  { name: 'ServiceNow', desc: 'Make new issues for any new security vulnerabilities we discover.', icon: '⚙️', category: 'ITSM', connected: false },
  { name: 'Slack', desc: 'Receive notifications from the Intruder portal.', icon: '💬', category: 'Notifications', connected: false },
  { name: 'Teams', desc: 'Receive notifications from the Intruder portal.', icon: '👥', category: 'Notifications', connected: false },
  { name: 'Zapier', desc: 'Connect Intruder to thousands of other apps using Zapier.', icon: '⚡', category: 'Automation', connected: false },
];

const CATEGORIES = ['All', 'Cloud', 'DevOps', 'SIEM', 'ITSM', 'Notifications', 'Compliance', 'Auth', 'Automation', 'API'];

export default function IntegrationsPage() {
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [connected, setConnected] = useState<Set<string>>(new Set());
  const [requested, setRequested] = useState(false);

  const filtered = INTEGRATIONS.filter(i => {
    if (category !== 'All' && i.category !== category) return false;
    if (search && !i.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const toggle = (name: string) =>
    setConnected(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-black text-2xl mb-1" style={{ color: '#0f172a' }}>Integrations</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Connect your favorite tools to Vyzor</p>
        </div>
        <button
          onClick={() => setRequested(true)}
          className="text-sm font-bold px-4 py-2.5 rounded-xl transition-all"
          style={{ background: requested ? 'rgba(99,102,241,0.1)' : '#f1f5f9', color: requested ? '#6366f1' : '#475569', border: '1px solid', borderColor: requested ? 'rgba(99,102,241,0.2)' : '#e2e8f0' }}>
          {requested ? '✓ Request submitted' : '+ Request integration'}
        </button>
      </div>

      {/* Search + category filter */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <div className="relative">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" className="absolute left-3 top-1/2 -translate-y-1/2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input type="text" placeholder="Search integrations..." value={search} onChange={e => setSearch(e.target.value)}
            className="scan-input rounded-xl pl-9 pr-4 py-2.5 text-sm" style={{ width: '220px' }} />
        </div>
        <div className="flex items-center gap-1 flex-wrap">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setCategory(cat)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={{
                background: category === cat ? 'rgba(99,102,241,0.1)' : '#f1f5f9',
                color: category === cat ? '#6366f1' : '#64748b',
              }}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Connected integrations */}
      {connected.size > 0 && (
        <div className="mb-8">
          <h2 className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: '#94a3b8' }}>Connected</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {INTEGRATIONS.filter(i => connected.has(i.name)).map(integration => (
              <div key={integration.name} className="card-glass rounded-2xl p-5" style={{ border: '1px solid rgba(34,197,94,0.2)' }}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: '#f1f5f9' }}>
                      {integration.icon}
                    </div>
                    <div>
                      <p className="font-bold text-sm" style={{ color: '#0f172a' }}>{integration.name}</p>
                      <span className="text-xs flex items-center gap-1" style={{ color: '#22c55e' }}>
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#22c55e' }} />
                        Connected
                      </span>
                    </div>
                  </div>
                  <button onClick={() => toggle(integration.name)}
                    className="text-xs font-semibold px-2 py-1 rounded-lg"
                    style={{ color: '#94a3b8' }}>
                    Disconnect
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All integrations */}
      <h2 className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: '#94a3b8' }}>
        {category === 'All' ? 'All integrations' : category} · {filtered.length}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.filter(i => !connected.has(i.name)).map(integration => (
          <div key={integration.name} className="card-glass rounded-2xl p-5 flex flex-col"
            style={{ border: '1px solid #f1f5f9' }}>
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style={{ background: '#f1f5f9' }}>
                {integration.icon}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="font-bold text-sm" style={{ color: '#0f172a' }}>{integration.name}</p>
                  <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: '#f1f5f9', color: '#94a3b8' }}>{integration.category}</span>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: '#64748b' }}>{integration.desc}</p>
              </div>
            </div>
            <div className="mt-auto pt-3" style={{ borderTop: '1px solid #f8fafc' }}>
              <button onClick={() => toggle(integration.name)}
                className="w-full py-2 rounded-xl text-xs font-bold transition-all"
                style={{ background: 'rgba(99,102,241,0.08)', color: '#6366f1', border: '1px solid rgba(99,102,241,0.15)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.15)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(99,102,241,0.08)'}>
                + Add
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
