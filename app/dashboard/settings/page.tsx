'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';

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

type Tab = 'profile' | 'billing' | 'security';

const TABS: { key: Tab; label: string }[] = [
  { key: 'profile', label: 'Profile' },
  { key: 'billing', label: 'Billing' },
  { key: 'security', label: 'Security' },
];

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

/* ── Profile tab ─────────────────────────────────────────────────────────────── */
function ProfileTab() {
  const { user, isLoaded } = useUser();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName]   = useState('');
  const [saving, setSaving]       = useState(false);
  const [saved, setSaved]         = useState(false);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName ?? '');
      setLastName(user.lastName ?? '');
    }
  }, [user]);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await user.update({ firstName, lastName });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const email = user?.primaryEmailAddress?.emailAddress ?? '';
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || '?';

  if (!isLoaded) return <div style={{ color: C.muted }} className="text-sm">Loading…</div>;

  return (
    <div className="space-y-5">
      <div className="rounded-2xl p-6" style={GLASS}>
        <h2 className="font-bold text-sm mb-5" style={{ color: C.text }}>Personal information</h2>

        <div className="flex items-center gap-4 mb-6">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center font-black text-xl flex-shrink-0"
            style={{ background: 'linear-gradient(135deg,#34d399,#059669)', color: '#021a12' }}
          >
            {initials}
          </div>
          <div>
            <p className="text-sm font-semibold mb-0.5" style={{ color: C.text }}>{firstName} {lastName}</p>
            <p className="text-xs" style={{ color: C.muted }}>{email}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-5">
          <Field label="First name">
            <input value={firstName} onChange={e => setFirstName(e.target.value)} style={inputStyle} />
          </Field>
          <Field label="Last name">
            <input value={lastName} onChange={e => setLastName(e.target.value)} style={inputStyle} />
          </Field>
          <Field label="Email address">
            <input value={email} readOnly style={{ ...inputStyle, opacity: 0.5, cursor: 'not-allowed' }} />
          </Field>
        </div>

        <button
          onClick={save}
          disabled={saving}
          className="text-sm font-bold px-5 py-2.5 rounded-xl transition-all"
          style={{ background: saved ? '#22c55e' : C.accent, color: '#021a12', opacity: saving ? 0.7 : 1 }}
        >
          {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save changes'}
        </button>
      </div>

      {/* Danger zone */}
      <div className="rounded-2xl p-6" style={{ ...GLASS, border: '1px solid rgba(239,68,68,0.2)' }}>
        <h2 className="font-bold text-sm mb-1" style={{ color: '#f87171' }}>Danger zone</h2>
        <p className="text-xs mb-4" style={{ color: C.muted }}>
          Deleting your account is permanent and cannot be undone.
        </p>
        <button
          className="text-xs font-bold px-4 py-2 rounded-xl transition-all"
          style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}
          onClick={() => {
            if (confirm('Are you sure? This cannot be undone.')) {
              user?.delete();
            }
          }}
        >
          Delete account
        </button>
      </div>
    </div>
  );
}

/* ── Billing tab ─────────────────────────────────────────────────────────────── */
type PlanInfo = { plan: string; limit: number; used: number; status: string };

function BillingTab() {
  const [info, setInfo]             = useState<PlanInfo | null>(null);
  const [loadingPortal, setLoadingPortal] = useState(false);

  useEffect(() => {
    fetch('/api/user/plan').then(r => r.json()).then(setInfo).catch(() => {});
  }, []);

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

  const planLabel = info ? info.plan.charAt(0).toUpperCase() + info.plan.slice(1) : '—';
  const statusColor = info?.status === 'active' ? '#34d399' : info?.status === 'trialing' ? '#fbbf24' : '#94a3b8';
  const usedPct = info ? Math.min(100, Math.round((info.used / info.limit) * 100)) : 0;

  return (
    <div className="space-y-5">
      <div className="rounded-2xl p-6" style={GLASS}>
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: C.muted }}>Current plan</p>
            <div className="flex items-center gap-3 mb-1">
              <span className="font-black text-2xl" style={{ color: C.text }}>{planLabel}</span>
              {info && (
                <span
                  className="text-xs font-bold px-2.5 py-0.5 rounded-full capitalize"
                  style={{ background: `${statusColor}18`, color: statusColor }}
                >
                  {info.status}
                </span>
              )}
            </div>
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

        {/* Scan usage bar */}
        {info && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold" style={{ color: C.muted }}>Scans this month</p>
              <p className="text-xs font-bold" style={{ color: C.text }}>{info.used} / {info.limit}</p>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${usedPct}%`,
                  background: usedPct >= 90 ? '#ef4444' : usedPct >= 70 ? '#f59e0b' : C.accent,
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Upgrade card */}
      {info?.plan !== 'growth' && info?.plan !== 'starter' && (
        <div className="rounded-2xl p-6" style={{ ...GLASS, border: '1px solid rgba(52,211,153,0.25)', background: 'rgba(52,211,153,0.04)' }}>
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: C.accent }}>Upgrade</span>
              <p className="font-black text-xl mt-1" style={{ color: C.text }}>Unlock full access</p>
              <p className="text-sm mt-0.5" style={{ color: C.muted }}>More scans, unlimited targets, priority support.</p>
            </div>
            <button
              onClick={openPortal}
              className="text-sm font-bold px-4 py-2.5 rounded-xl"
              style={{ background: C.accent, color: '#021a12' }}
            >
              Upgrade now
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Security tab ────────────────────────────────────────────────────────────── */
function SecurityTab() {
  return (
    <div className="space-y-5">
      <div className="rounded-2xl p-6" style={GLASS}>
        <h2 className="font-bold text-sm mb-1" style={{ color: C.text }}>Password & authentication</h2>
        <p className="text-xs mb-4" style={{ color: C.muted }}>
          Authentication is managed by Clerk. To change your password or enable 2FA, visit your account settings.
        </p>
        <a
          href="https://accounts.clerk.dev/user"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-bold px-4 py-2.5 rounded-xl inline-block"
          style={{ background: 'rgba(255,255,255,0.06)', color: C.muted, border: '1px solid rgba(255,255,255,0.1)' }}
        >
          Open Clerk account settings →
        </a>
      </div>

      <div className="rounded-2xl p-6" style={{ ...GLASS, border: '1px solid rgba(239,68,68,0.2)' }}>
        <h2 className="font-bold text-sm mb-1" style={{ color: '#f87171' }}>Sign out everywhere</h2>
        <p className="text-xs mb-4" style={{ color: C.muted }}>
          Revoke all active sessions on all devices.
        </p>
        <button
          className="text-xs font-bold px-4 py-2 rounded-xl"
          style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}
        >
          Sign out all devices
        </button>
      </div>
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────────────────────────── */
export default function SettingsPage() {
  const [tab, setTab] = useState<Tab>('profile');

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="font-black text-2xl mb-6" style={{ color: C.text }}>Settings</h1>

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

      {tab === 'profile'  && <ProfileTab />}
      {tab === 'billing'  && <BillingTab />}
      {tab === 'security' && <SecurityTab />}
    </div>
  );
}
