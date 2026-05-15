'use client';

import { useUser } from '@clerk/nextjs';
import { useState } from 'react';

type SubscriptionMeta = {
  status?: string;
  plan?: string;
  trialEnd?: number;
  currentPeriodEnd?: number;
};

export default function SubscriptionBanner() {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);

  const sub = user?.publicMetadata?.subscription as SubscriptionMeta | undefined;

  const startCheckout = async (plan: 'starter' | 'growth') => {
    setLoading(true);
    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan }),
    });
    const { url } = await res.json();
    if (url) window.location.href = url;
    setLoading(false);
  };

  const openPortal = async () => {
    setLoading(true);
    const res = await fetch('/api/stripe/portal', { method: 'POST' });
    const { url } = await res.json();
    if (url) window.location.href = url;
    setLoading(false);
  };

  // No subscription → show CTA
  if (!sub?.status) {
    return (
      <div className="mx-8 mb-6 rounded-2xl px-6 py-4 flex items-center justify-between"
        style={{ background: 'linear-gradient(135deg,rgba(99,102,241,0.08),rgba(52,211,153,0.06))', border: '1px solid rgba(99,102,241,0.15)' }}>
        <div>
          <p className="font-bold text-sm" style={{ color: '#0f172a' }}>Start your 14-day free trial</p>
          <p className="text-xs mt-0.5" style={{ color: '#64748b' }}>No charge today. Cancel anytime.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => startCheckout('starter')} disabled={loading}
            className="text-sm font-bold px-4 py-2 rounded-xl"
            style={{ background: '#6366f1', color: '#fff', opacity: loading ? 0.6 : 1 }}>
            {loading ? '...' : 'Starter – $129/mo'}
          </button>
          <button onClick={() => startCheckout('growth')} disabled={loading}
            className="text-sm font-bold px-4 py-2 rounded-xl"
            style={{ background: '#34d399', color: '#021a12', opacity: loading ? 0.6 : 1 }}>
            {loading ? '...' : 'Growth – $249/mo'}
          </button>
        </div>
      </div>
    );
  }

  // Trial active
  if (sub.status === 'trialing') {
    const daysLeft = sub.trialEnd
      ? Math.max(0, Math.ceil((sub.trialEnd * 1000 - Date.now()) / 86400000))
      : 14;
    return (
      <div className="mx-8 mb-6 rounded-2xl px-6 py-3 flex items-center justify-between"
        style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)' }}>
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full" style={{ background: '#22c55e' }} />
          <span className="text-sm font-semibold" style={{ color: '#16a34a' }}>
            Free trial — <strong>{daysLeft} days</strong> remaining
          </span>
        </div>
        <button onClick={openPortal} disabled={loading}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg"
          style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid rgba(34,197,94,0.3)' }}>
          Manage billing →
        </button>
      </div>
    );
  }

  // Active subscription
  if (sub.status === 'active') {
    return (
      <div className="mx-8 mb-6 rounded-2xl px-6 py-3 flex items-center justify-between"
        style={{ background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.15)' }}>
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full" style={{ background: '#6366f1' }} />
          <span className="text-sm font-semibold capitalize" style={{ color: '#4f46e5' }}>
            {sub.plan} Plan — Active
          </span>
        </div>
        <button onClick={openPortal} disabled={loading}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg"
          style={{ background: 'rgba(99,102,241,0.08)', color: '#6366f1', border: '1px solid rgba(99,102,241,0.2)' }}>
          Manage billing →
        </button>
      </div>
    );
  }

  // Past due / cancelled
  if (sub.status === 'past_due' || sub.status === 'canceled') {
    return (
      <div className="mx-8 mb-6 rounded-2xl px-6 py-3 flex items-center justify-between"
        style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)' }}>
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full" style={{ background: '#ef4444' }} />
          <span className="text-sm font-semibold" style={{ color: '#dc2626' }}>
            {sub.status === 'past_due' ? 'Payment failed — update your card' : 'Subscription cancelled'}
          </span>
        </div>
        <button onClick={openPortal} disabled={loading}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg"
          style={{ background: 'rgba(239,68,68,0.08)', color: '#dc2626', border: '1px solid rgba(239,68,68,0.2)' }}>
          {sub.status === 'past_due' ? 'Fix payment →' : 'Resubscribe →'}
        </button>
      </div>
    );
  }

  return null;
}
