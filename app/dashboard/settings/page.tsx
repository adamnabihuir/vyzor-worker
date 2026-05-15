'use client';

import { useState } from 'react';

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
  bg: '#021a12',
  rowBg: 'rgba(255,255,255,0.04)',
  innerBorder: 'rgba(255,255,255,0.08)',
};

type Tab = 'profile' | 'billing' | 'team' | 'security' | 'notifications';

const TABS: { key: Tab; label: string }[] = [
  { key: 'profile', label: 'Profile' },
  { key: 'billing', label: 'Billing' },
  { key: 'team', label: 'Team' },
  { key: 'security', label: 'Security' },
  { key: 'notifications', label: 'Notifications' },
];

/* ── Toggle switch ─────────────────────────────────────── */
function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className="relative flex-shrink-0 transition-all"
      style={{
        width: 44, height: 24, borderRadius: 12,
        background: on ? C.accent : 'rgba(255,255,255,0.15)',
      }}
    >
      <span
        className="absolute top-1 transition-all"
        style={{
          left: on ? 22 : 4, width: 16, height: 16,
          borderRadius: '50%', background: '#fff',
          boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
        }}
      />
    </button>
  );
}

/* ── Field ─────────────────────────────────────────────── */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold mb-1.5" style={{ color: C.muted }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 14px', borderRadius: 10,
  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
  color: C.text, fontSize: 14, outline: 'none',
};

/* ── Profile tab ───────────────────────────────────────── */
function ProfileTab() {
  const [name, setName] = useState('Adam Bac');
  const [company, setCompany] = useState('AcmeCorp');
  const [jobTitle, setJobTitle] = useState('Security Engineer');
  const [timezone, setTimezone] = useState('Europe/Paris');
  const [saved, setSaved] = useState(false);

  const save = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-5">
      {/* Avatar + form */}
      <div className="rounded-2xl p-6" style={GLASS}>
        <h2 className="font-bold text-sm mb-5" style={{ color: C.text }}>Personal information</h2>

        {/* Avatar row */}
        <div className="flex items-center gap-4 mb-6">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center font-black text-xl flex-shrink-0"
            style={{ background: 'linear-gradient(135deg,#34d399,#059669)', color: '#021a12' }}
          >
            AB
          </div>
          <div>
            <p className="text-sm font-semibold mb-1.5" style={{ color: C.text }}>Profile photo</p>
            <button
              className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
              style={{ background: 'rgba(255,255,255,0.06)', color: C.muted, border: '1px solid rgba(255,255,255,0.1)' }}
            >
              Edit photo
            </button>
          </div>
        </div>

        {/* Form grid */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <Field label="Full name">
            <input value={name} onChange={e => setName(e.target.value)} style={inputStyle} />
          </Field>
          <Field label="Email address">
            <input value="adam@acmecorp.com" readOnly style={{ ...inputStyle, opacity: 0.5, cursor: 'not-allowed' }} />
          </Field>
          <Field label="Company">
            <input value={company} onChange={e => setCompany(e.target.value)} style={inputStyle} />
          </Field>
          <Field label="Job title">
            <input value={jobTitle} onChange={e => setJobTitle(e.target.value)} style={inputStyle} />
          </Field>
        </div>
        <div className="mb-5">
          <Field label="Timezone">
            <select
              value={timezone}
              onChange={e => setTimezone(e.target.value)}
              style={{ ...inputStyle }}
            >
              <option value="Europe/Paris">Europe/Paris (UTC+2)</option>
              <option value="America/New_York">America/New_York (UTC-4)</option>
              <option value="America/Los_Angeles">America/Los_Angeles (UTC-7)</option>
              <option value="Asia/Tokyo">Asia/Tokyo (UTC+9)</option>
              <option value="UTC">UTC</option>
            </select>
          </Field>
        </div>

        <button
          onClick={save}
          className="text-sm font-bold px-5 py-2.5 rounded-xl transition-all"
          style={{ background: saved ? '#22c55e' : C.accent, color: '#021a12' }}
        >
          {saved ? '✓ Saved' : 'Save changes'}
        </button>
      </div>
    </div>
  );
}

/* ── Billing tab ───────────────────────────────────────── */
function BillingTab() {
  const [loadingPortal, setLoadingPortal] = useState(false);

  const openPortal = async () => {
    setLoadingPortal(true);
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } finally {
      setLoadingPortal(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Current plan card */}
      <div className="rounded-2xl p-6" style={GLASS}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: C.muted }}>Current plan</p>
            <div className="flex items-center gap-3 mb-1">
              <span className="font-black text-2xl" style={{ color: C.text }}>Growth</span>
              <span
                className="text-xs font-bold px-2.5 py-0.5 rounded-full"
                style={{ background: 'rgba(251,191,36,0.12)', color: '#fbbf24' }}
              >
                Trialing
              </span>
            </div>
            <p className="text-sm" style={{ color: C.muted }}>11 days left · Next billing: 26 May 2025</p>
          </div>
          <button
            onClick={openPortal}
            disabled={loadingPortal}
            className="text-sm font-bold px-4 py-2.5 rounded-xl transition-all"
            style={{ background: C.accent, color: '#021a12', opacity: loadingPortal ? 0.7 : 1 }}
          >
            {loadingPortal ? 'Opening…' : 'Manage subscription'}
          </button>
        </div>

        {/* Usage */}
        <div className="grid grid-cols-3 gap-4 pt-4" style={{ borderTop: `1px solid ${C.innerBorder}` }}>
          {[
            { label: 'Targets used', used: 4, total: '10' },
            { label: 'Scans this month', used: 23, total: 'Unlimited' },
            { label: 'Users', used: 2, total: 'Unlimited' },
          ].map(({ label, used, total }) => (
            <div key={label}>
              <p className="text-xs font-semibold mb-1" style={{ color: C.muted }}>{label}</p>
              <p className="text-sm font-bold" style={{ color: C.text }}>
                {used}{' '}
                <span style={{ color: C.veryMuted, fontWeight: 400 }}>/ {total}</span>
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Upgrade to Pro card */}
      <div
        className="rounded-2xl p-6"
        style={{
          ...GLASS,
          border: '1px solid rgba(52,211,153,0.25)',
          background: 'rgba(52,211,153,0.04)',
        }}
      >
        <div className="flex items-start justify-between mb-3">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: C.accent }}>Pro plan</span>
            <p className="font-black text-xl mt-1" style={{ color: C.text }}>Upgrade to Pro</p>
            <p className="text-sm mt-0.5" style={{ color: C.muted }}>Everything in Growth, plus advanced features.</p>
          </div>
          <button
            className="text-sm font-bold px-4 py-2.5 rounded-xl"
            style={{ background: C.accent, color: '#021a12' }}
          >
            Upgrade now
          </button>
        </div>
        <ul className="mt-4 space-y-2">
          {[
            'Unlimited targets & scans',
            'Advanced CVE correlation engine',
            'Custom compliance reports (ISO 27001, NIS2)',
            'Priority 24/7 support',
            'API access with higher rate limits',
          ].map(f => (
            <li key={f} className="flex items-center gap-2 text-sm" style={{ color: C.muted }}>
              <span style={{ color: C.accent }}>✓</span> {f}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ── Team tab ──────────────────────────────────────────── */
function TeamTab() {
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [members] = useState([
    { name: 'Adam Bac', email: 'adam@acmecorp.com', role: 'Admin', initials: 'AB' },
    { name: 'Sarah Chen', email: 'sarah@acmecorp.com', role: 'Member', initials: 'SC' },
  ]);

  return (
    <div className="space-y-5">
      {/* Members table */}
      <div className="rounded-2xl overflow-hidden" style={GLASS}>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: `1px solid ${C.innerBorder}` }}>
          <div>
            <p className="font-bold text-sm" style={{ color: C.text }}>Team members</p>
            <p className="text-xs mt-0.5" style={{ color: C.muted }}>2 members · Growth Plan</p>
          </div>
          <button
            onClick={() => setInviteOpen(true)}
            className="text-xs font-bold px-4 py-2 rounded-xl"
            style={{ background: C.accent, color: '#021a12' }}
          >
            + Invite member
          </button>
        </div>

        {/* Header row */}
        <div
          className="grid px-6 py-2.5 text-xs font-bold uppercase tracking-wider"
          style={{ gridTemplateColumns: '1fr 1fr auto auto', gap: 16, background: C.rowBg, color: C.muted, borderBottom: `1px solid ${C.innerBorder}` }}
        >
          <span>Member</span>
          <span>Email</span>
          <span>Role</span>
          <span></span>
        </div>

        {members.map((m, i) => (
          <div
            key={m.email}
            className="flex items-center gap-4 px-6 py-4"
            style={{ borderBottom: i < members.length - 1 ? `1px solid ${C.innerBorder}` : 'none' }}
          >
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0"
              style={{ background: 'linear-gradient(135deg,#34d399,#059669)', color: '#021a12' }}
            >
              {m.initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold" style={{ color: C.text }}>{m.name}</p>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs" style={{ color: C.muted }}>{m.email}</p>
            </div>
            <span
              className="text-xs font-bold px-2.5 py-1 rounded-full"
              style={{
                background: m.role === 'Admin' ? 'rgba(52,211,153,0.1)' : C.rowBg,
                color: m.role === 'Admin' ? C.accent : C.muted,
                border: `1px solid ${m.role === 'Admin' ? 'rgba(52,211,153,0.2)' : C.innerBorder}`,
              }}
            >
              {m.role}
            </span>
            {m.role !== 'Admin' && (
              <button style={{ color: C.muted }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>
                </svg>
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Invite modal */}
      {inviteOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ background: 'rgba(2,26,18,0.85)', backdropFilter: 'blur(6px)' }}
          onClick={e => e.target === e.currentTarget && setInviteOpen(false)}
        >
          <div className="rounded-2xl p-6 w-full max-w-md" style={GLASS}>
            <h3 className="font-bold text-base mb-1" style={{ color: C.text }}>Invite team member</h3>
            <p className="text-xs mb-5" style={{ color: C.muted }}>They'll receive an email to join your workspace.</p>
            <Field label="Email address">
              <input
                type="email"
                value={inviteEmail}
                onChange={e => setInviteEmail(e.target.value)}
                placeholder="colleague@company.com"
                style={{ ...inputStyle, marginBottom: 16 }}
              />
            </Field>
            <div className="flex gap-3 mt-4">
              <button
                className="flex-1 text-sm font-bold py-2.5 rounded-xl"
                style={{ background: C.accent, color: '#021a12' }}
                onClick={() => { setInviteOpen(false); setInviteEmail(''); }}
              >
                Send invite
              </button>
              <button
                className="flex-1 text-sm font-bold py-2.5 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.06)', color: C.muted, border: '1px solid rgba(255,255,255,0.1)' }}
                onClick={() => setInviteOpen(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Security tab ──────────────────────────────────────── */
function SecurityTab() {
  const [keyCopied, setKeyCopied] = useState(false);

  const copyKey = () => {
    navigator.clipboard.writeText('vzr_live_4f8a2c1e9b3d7f6a0e5c8b2d4f1abc');
    setKeyCopied(true);
    setTimeout(() => setKeyCopied(false), 2000);
  };

  const SESSIONS = [
    { browser: 'Chrome 124 · macOS', location: 'Paris, France', date: '15 May 2025 — current session', current: true },
    { browser: 'Firefox 125 · Windows 11', location: 'Lyon, France', date: '12 May 2025 09:41', current: false },
  ];

  return (
    <div className="space-y-5">
      {/* Password — managed by Clerk */}
      <div className="rounded-2xl p-6" style={GLASS}>
        <h2 className="font-bold text-sm mb-1" style={{ color: C.text }}>Change password</h2>
        <p className="text-xs mb-4" style={{ color: C.muted }}>
          Authentication is managed by Clerk. Password changes are handled via your Clerk account settings.
        </p>
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-xl"
          style={{ background: C.rowBg, border: `1px solid ${C.innerBorder}` }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          <span className="text-sm" style={{ color: C.muted }}>Managed by Clerk</span>
        </div>
      </div>

      {/* Active sessions */}
      <div className="rounded-2xl overflow-hidden" style={GLASS}>
        <div className="px-6 py-4" style={{ borderBottom: `1px solid ${C.innerBorder}` }}>
          <h2 className="font-bold text-sm" style={{ color: C.text }}>Active sessions</h2>
          <p className="text-xs mt-0.5" style={{ color: C.muted }}>Devices currently logged into your account.</p>
        </div>
        {SESSIONS.map((s, i) => (
          <div
            key={i}
            className="flex items-center gap-4 px-6 py-4"
            style={{ borderBottom: i < SESSIONS.length - 1 ? `1px solid ${C.innerBorder}` : 'none' }}
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: C.rowBg, border: `1px solid ${C.innerBorder}` }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="1.8">
                <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold" style={{ color: C.text }}>{s.browser}</p>
              <p className="text-xs" style={{ color: C.muted }}>{s.location} · {s.date}</p>
            </div>
            {s.current
              ? <span className="text-xs font-bold px-2.5 py-0.5 rounded-full" style={{ background: 'rgba(52,211,153,0.1)', color: C.accent }}>Current</span>
              : <button className="text-xs font-semibold" style={{ color: '#ef4444' }}>Revoke</button>
            }
          </div>
        ))}
      </div>

      {/* API keys */}
      <div className="rounded-2xl overflow-hidden" style={GLASS}>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: `1px solid ${C.innerBorder}` }}>
          <div>
            <h2 className="font-bold text-sm" style={{ color: C.text }}>API Keys</h2>
            <p className="text-xs mt-0.5" style={{ color: C.muted }}>Use these keys to authenticate with the Vyzor API.</p>
          </div>
          <button
            className="text-xs font-bold px-3 py-2 rounded-xl"
            style={{ background: C.accent, color: '#021a12' }}
          >
            + Create API key
          </button>
        </div>

        {/* Demo key row */}
        <div className="flex items-center gap-4 px-6 py-4">
          <div
            className="flex-1 flex items-center gap-3 px-3 py-2.5 rounded-xl"
            style={{ background: C.rowBg, border: `1px solid ${C.innerBorder}` }}
          >
            <code className="text-xs flex-1" style={{ color: C.muted, fontFamily: 'monospace' }}>
              vzr_live_***...abc
            </code>
            <span className="text-xs" style={{ color: C.veryMuted }}>Created 1 May 2025</span>
          </div>
          <button
            onClick={copyKey}
            title="Copy key"
            style={{ color: keyCopied ? '#22c55e' : C.accent, flexShrink: 0 }}
          >
            {keyCopied
              ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            }
          </button>
          <button className="text-xs font-semibold" style={{ color: '#ef4444' }}>Revoke</button>
        </div>
      </div>
    </div>
  );
}

/* ── Notifications tab ─────────────────────────────────── */
function NotificationsTab() {
  const PREFS = [
    { label: 'New critical vulnerability', desc: 'Instant alert when a critical CVE is detected on your assets' },
    { label: 'Scan completed', desc: 'Notify when a scheduled or manual scan finishes' },
    { label: 'Weekly report', desc: 'Weekly summary of your security posture every Monday' },
    { label: 'New asset discovered', desc: 'Alert when new subdomains or IPs appear on your targets' },
    { label: 'Certificate expiry warning', desc: 'Warn 30 days before an SSL/TLS certificate expires' },
  ];
  const [toggles, setToggles] = useState<boolean[]>([true, true, false, true, true]);

  return (
    <div className="space-y-5">
      <div className="rounded-2xl overflow-hidden" style={GLASS}>
        <div className="px-6 py-4" style={{ borderBottom: `1px solid ${C.innerBorder}`, background: C.rowBg }}>
          <p className="text-xs font-bold uppercase tracking-wider" style={{ color: C.muted }}>Email notifications</p>
        </div>
        {PREFS.map((p, i) => (
          <div
            key={p.label}
            className="flex items-center gap-4 px-6 py-4"
            style={{ borderBottom: i < PREFS.length - 1 ? `1px solid ${C.innerBorder}` : 'none' }}
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold" style={{ color: C.text }}>{p.label}</p>
              <p className="text-xs mt-0.5" style={{ color: C.muted }}>{p.desc}</p>
            </div>
            <Toggle on={toggles[i]} onChange={() => setToggles(prev => prev.map((v, idx) => idx === i ? !v : v))} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Page ──────────────────────────────────────────────── */
export default function SettingsPage() {
  const [tab, setTab] = useState<Tab>('profile');

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="font-black text-2xl mb-6" style={{ color: C.text }}>Settings</h1>

      {/* Tab bar */}
      <div className="flex gap-0 mb-8" style={{ borderBottom: `1px solid ${C.innerBorder}` }}>
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className="px-4 py-2.5 text-sm font-semibold transition-all"
            style={{
              color: tab === t.key ? C.accent : C.muted,
              borderBottom: tab === t.key ? `2px solid ${C.accent}` : '2px solid transparent',
              marginBottom: -1,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'profile'       && <ProfileTab />}
      {tab === 'billing'       && <BillingTab />}
      {tab === 'team'          && <TeamTab />}
      {tab === 'security'      && <SecurityTab />}
      {tab === 'notifications' && <NotificationsTab />}
    </div>
  );
}
