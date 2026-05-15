'use client';

import { useState } from 'react';

export default function SettingsPage() {
  const [tab, setTab] = useState<'profile' | 'team' | 'billing' | 'api'>('profile');
  const [saved, setSaved] = useState(false);
  const [name, setName] = useState('Adam Bac');
  const [email, setEmail] = useState('adam@acmecorp.com');
  const [company, setCompany] = useState('AcmeCorp');
  const [apiKeyCopied, setApiKeyCopied] = useState(false);

  const save = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const copyKey = () => {
    navigator.clipboard.writeText('vgd_live_sk_4f8a2c1e9b3d7f6a0e5c8b2d4f1a9e3c');
    setApiKeyCopied(true);
    setTimeout(() => setApiKeyCopied(false), 2000);
  };

  const TABS = [
    { key: 'profile', label: 'Profile' },
    { key: 'team', label: 'Team' },
    { key: 'billing', label: 'Billing' },
    { key: 'api', label: 'API' },
  ] as const;

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="font-black text-2xl mb-6" style={{ color: '#0f172a' }}>Settings</h1>

      {/* Tabs */}
      <div className="flex gap-0 mb-8" style={{ borderBottom: '1px solid #f1f5f9' }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className="px-4 py-2.5 text-sm font-semibold transition-all"
            style={{
              color: tab === t.key ? '#6366f1' : '#64748b',
              borderBottom: tab === t.key ? '2px solid #6366f1' : '2px solid transparent',
              marginBottom: '-1px',
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Profile */}
      {tab === 'profile' && (
        <div className="space-y-6">
          <div className="card-glass rounded-2xl p-6">
            <h2 className="font-bold text-sm mb-5" style={{ color: '#0f172a' }}>Personal information</h2>
            <div className="flex items-center gap-5 mb-6">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center font-black text-xl flex-shrink-0"
                style={{ background: 'linear-gradient(135deg,#6366f1,#0ea5e9)', color: '#fff' }}>
                AB
              </div>
              <div>
                <p className="text-sm font-semibold mb-1" style={{ color: '#0f172a' }}>Profile photo</p>
                <button className="text-xs font-semibold px-3 py-1.5 rounded-lg"
                  style={{ background: '#f1f5f9', color: '#475569' }}>Upload photo</button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: '#374151' }}>Full name</label>
                <input value={name} onChange={e => setName(e.target.value)}
                  className="scan-input w-full rounded-xl px-4 py-3 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: '#374151' }}>Company</label>
                <input value={company} onChange={e => setCompany(e.target.value)}
                  className="scan-input w-full rounded-xl px-4 py-3 text-sm" />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-xs font-semibold mb-1.5" style={{ color: '#374151' }}>Email address</label>
              <input value={email} onChange={e => setEmail(e.target.value)} type="email"
                className="scan-input w-full rounded-xl px-4 py-3 text-sm" />
            </div>
            <button onClick={save} className="btn-primary text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all"
              style={{ background: saved ? '#22c55e' : undefined }}>
              {saved ? '✓ Saved' : 'Save changes'}
            </button>
          </div>

          <div className="card-glass rounded-2xl p-6">
            <h2 className="font-bold text-sm mb-5" style={{ color: '#0f172a' }}>Change password</h2>
            <div className="space-y-4 mb-4">
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: '#374151' }}>Current password</label>
                <input type="password" className="scan-input w-full rounded-xl px-4 py-3 text-sm" placeholder="••••••••" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: '#374151' }}>New password</label>
                <input type="password" className="scan-input w-full rounded-xl px-4 py-3 text-sm" placeholder="••••••••" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: '#374151' }}>Confirm new password</label>
                <input type="password" className="scan-input w-full rounded-xl px-4 py-3 text-sm" placeholder="••••••••" />
              </div>
            </div>
            <button className="text-sm font-bold px-5 py-2.5 rounded-xl"
              style={{ background: '#f1f5f9', color: '#475569' }}>
              Update password
            </button>
          </div>

          <div className="card-glass rounded-2xl p-6" style={{ border: '1px solid rgba(239,68,68,0.15)' }}>
            <h2 className="font-bold text-sm mb-1" style={{ color: '#ef4444' }}>Danger zone</h2>
            <p className="text-xs mb-4" style={{ color: '#94a3b8' }}>Permanently delete your account and all associated data.</p>
            <button className="text-xs font-bold px-4 py-2 rounded-xl"
              style={{ background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
              Delete account
            </button>
          </div>
        </div>
      )}

      {/* Team */}
      {tab === 'team' && (
        <div className="space-y-6">
          <div className="card-glass rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: '1px solid #f1f5f9' }}>
              <div>
                <h2 className="font-bold text-sm" style={{ color: '#0f172a' }}>Team members</h2>
                <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>2 members on Growth Plan</p>
              </div>
              <button className="btn-primary text-white text-xs font-bold px-4 py-2 rounded-xl">+ Invite member</button>
            </div>
            {[
              { name: 'Adam Bac', email: 'adam@acmecorp.com', role: 'Owner', initials: 'AB' },
              { name: 'Sarah Chen', email: 'sarah@acmecorp.com', role: 'Admin', initials: 'SC' },
            ].map((member, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4"
                style={{ borderBottom: i === 0 ? '1px solid #f8fafc' : 'none' }}>
                <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg,#6366f1,#0ea5e9)', color: '#fff' }}>
                  {member.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold" style={{ color: '#0f172a' }}>{member.name}</p>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>{member.email}</p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                  style={{ background: member.role === 'Owner' ? 'rgba(99,102,241,0.1)' : '#f1f5f9', color: member.role === 'Owner' ? '#6366f1' : '#475569' }}>
                  {member.role}
                </span>
                {member.role !== 'Owner' && (
                  <button style={{ color: '#94a3b8' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Billing */}
      {tab === 'billing' && (
        <div className="space-y-6">
          {/* Current plan */}
          <div className="card-glass rounded-2xl p-6" style={{ border: '1px solid rgba(99,102,241,0.2)' }}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: '#94a3b8' }}>Current plan</p>
                <div className="flex items-center gap-2">
                  <p className="font-black text-2xl" style={{ color: '#0f172a' }}>Growth</p>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(99,102,241,0.1)', color: '#6366f1' }}>Active</span>
                </div>
                <p className="text-sm mt-1" style={{ color: '#94a3b8' }}>$999 / month · Billed monthly</p>
              </div>
              <button className="text-sm font-bold px-4 py-2.5 rounded-xl"
                style={{ background: 'rgba(99,102,241,0.08)', color: '#6366f1', border: '1px solid rgba(99,102,241,0.15)' }}>
                Upgrade to Enterprise
              </button>
            </div>
            <div className="grid grid-cols-3 gap-4 pt-4" style={{ borderTop: '1px solid #f1f5f9' }}>
              {[
                { label: 'Targets', used: 2, total: 10 },
                { label: 'Scans / month', used: 3, total: 'Unlimited' },
                { label: 'Team members', used: 2, total: 5 },
              ].map(({ label, used, total }) => (
                <div key={label}>
                  <p className="text-xs font-semibold mb-1" style={{ color: '#94a3b8' }}>{label}</p>
                  <p className="text-sm font-bold" style={{ color: '#0f172a' }}>{used} <span style={{ color: '#94a3b8', fontWeight: 400 }}>/ {total}</span></p>
                </div>
              ))}
            </div>
          </div>

          {/* Payment method */}
          <div className="card-glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-sm" style={{ color: '#0f172a' }}>Payment method</h2>
              <button className="text-xs font-semibold" style={{ color: '#6366f1' }}>+ Add card</button>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-xl" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <div className="w-10 h-7 rounded-md flex items-center justify-center font-bold text-xs"
                style={{ background: '#1a1f71', color: '#fff' }}>VISA</div>
              <div className="flex-1">
                <p className="text-sm font-semibold" style={{ color: '#0f172a' }}>Visa ending in 4242</p>
                <p className="text-xs" style={{ color: '#94a3b8' }}>Expires 08/2027</p>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e' }}>Default</span>
            </div>
          </div>

          {/* Billing history */}
          <div className="card-glass rounded-2xl overflow-hidden">
            <div className="px-6 py-4" style={{ borderBottom: '1px solid #f1f5f9' }}>
              <h2 className="font-bold text-sm" style={{ color: '#0f172a' }}>Billing history</h2>
            </div>
            {[
              { date: '1 May 2026', amount: '$999.00', status: 'Paid' },
              { date: '1 Apr 2026', amount: '$999.00', status: 'Paid' },
              { date: '1 Mar 2026', amount: '$999.00', status: 'Paid' },
            ].map((inv, i) => (
              <div key={i} className="flex items-center justify-between px-6 py-4"
                style={{ borderBottom: i < 2 ? '1px solid #f8fafc' : 'none' }}>
                <div>
                  <p className="text-sm font-semibold" style={{ color: '#0f172a' }}>Growth Plan — {inv.date}</p>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>{inv.amount}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e' }}>{inv.status}</span>
                  <button style={{ color: '#6366f1' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* API */}
      {tab === 'api' && (
        <div className="space-y-6">
          <div className="card-glass rounded-2xl p-6">
            <h2 className="font-bold text-sm mb-1" style={{ color: '#0f172a' }}>API Key</h2>
            <p className="text-xs mb-5" style={{ color: '#94a3b8' }}>Use this key to authenticate requests to the Vyzor API.</p>
            <div className="flex items-center gap-3 p-3 rounded-xl mb-4" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <code className="flex-1 text-xs" style={{ color: '#475569', fontFamily: 'monospace' }}>
                vgd_live_sk_4f8a2c1e9b3d7f6a0e5c8b2d4f1a9e3c
              </code>
              <button onClick={copyKey} style={{ color: apiKeyCopied ? '#22c55e' : '#6366f1', flexShrink: 0 }}>
                {apiKeyCopied
                  ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                }
              </button>
            </div>
            <div className="flex items-center gap-3">
              <button className="text-xs font-bold px-4 py-2 rounded-xl"
                style={{ background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.15)' }}>
                Regenerate key
              </button>
              <p className="text-xs" style={{ color: '#94a3b8' }}>Last used: Never</p>
            </div>
          </div>

          <div className="card-glass rounded-2xl p-6">
            <h2 className="font-bold text-sm mb-1" style={{ color: '#0f172a' }}>API Documentation</h2>
            <p className="text-xs mb-4" style={{ color: '#94a3b8' }}>Full REST API to automate your security workflows.</p>
            <div className="space-y-3">
              {[
                { method: 'GET', path: '/v1/targets', desc: 'List all targets' },
                { method: 'POST', path: '/v1/scans', desc: 'Trigger a new scan' },
                { method: 'GET', path: '/v1/issues', desc: 'List all issues' },
                { method: 'GET', path: '/v1/reports', desc: 'Generate a report' },
              ].map(({ method, path, desc }) => (
                <div key={path} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: '#f8fafc' }}>
                  <span className="text-xs font-bold px-2 py-1 rounded-lg w-14 text-center flex-shrink-0"
                    style={{ background: method === 'GET' ? 'rgba(14,165,233,0.1)' : 'rgba(34,197,94,0.1)', color: method === 'GET' ? '#0ea5e9' : '#22c55e' }}>
                    {method}
                  </span>
                  <code className="text-xs font-mono flex-1" style={{ color: '#0f172a' }}>{path}</code>
                  <span className="text-xs" style={{ color: '#94a3b8' }}>{desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
