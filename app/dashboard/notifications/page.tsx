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
  rowBg: 'rgba(255,255,255,0.04)',
  innerBorder: 'rgba(255,255,255,0.08)',
};

/* ── Types ─────────────────────────────────────────────── */
type NType = 'critical' | 'scan' | 'asset' | 'fixed' | 'system';
type FilterTab = 'All' | 'Unread' | 'Alerts' | 'Scans' | 'System';

interface Notification {
  id: number;
  type: NType;
  title: string;
  subtitle: string;
  time: string;
  group: 'Today' | 'Yesterday' | 'This week';
  read: boolean;
}

/* ── Color config per type ─────────────────────────────── */
const TYPE_CFG: Record<NType, { color: string; bg: string; dot: string }> = {
  critical: { color: '#f87171', bg: 'rgba(239,68,68,0.12)', dot: '#ef4444' },
  scan:     { color: '#fbbf24', bg: 'rgba(245,158,11,0.12)', dot: '#f59e0b' },
  asset:    { color: '#60a5fa', bg: 'rgba(59,130,246,0.12)', dot: '#3b82f6' },
  fixed:    { color: C.accent, bg: 'rgba(52,211,153,0.1)',   dot: C.accent },
  system:   { color: '#a78bfa', bg: 'rgba(167,139,250,0.1)', dot: '#8b5cf6' },
};

/* ── Icon per type ─────────────────────────────────────── */
function TypeIcon({ type }: { type: NType }) {
  const cfg = TYPE_CFG[type];
  const icons: Record<NType, React.ReactNode> = {
    critical: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
        <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
    ),
    scan: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
    asset: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
      </svg>
    ),
    fixed: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
    ),
    system: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
    ),
  };

  return (
    <div
      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
      style={{ background: cfg.bg, color: cfg.color }}
    >
      {icons[type]}
    </div>
  );
}

/* ── Data ──────────────────────────────────────────────── */
const INITIAL: Notification[] = [
  { id:  1, type: 'critical', title: 'Log4Shell detected on api.acmecorp.com',         subtitle: 'CVE-2021-44228 · CVSS 10.0 · Immediate action required',        time: '2h ago',    group: 'Today',     read: false },
  { id:  2, type: 'scan',     title: 'Scan of acmecorp.com completed — 11 findings',   subtitle: '3 critical · 4 high · 4 medium',                                time: '3h ago',    group: 'Today',     read: false },
  { id:  3, type: 'critical', title: 'RDP port exposed on admin.acmecorp.com',         subtitle: 'Port 3389 open to the internet · High risk',                     time: '5h ago',    group: 'Today',     read: false },
  { id:  4, type: 'asset',    title: '3 new subdomains discovered on acmecorp.com',    subtitle: 'api2.acmecorp.com, cdn.acmecorp.com, dev.acmecorp.com',          time: '6h ago',    group: 'Today',     read: false },
  { id:  5, type: 'fixed',    title: 'SSL misconfiguration resolved on mail.acmecorp.com', subtitle: 'Issue #41 closed · TLS 1.2 enforced',                      time: '8h ago',    group: 'Today',     read: false },
  { id:  6, type: 'system',   title: 'Scheduled scan started for techstart.io',        subtitle: 'Full scan · estimated 12 min',                                  time: 'Yesterday', group: 'Yesterday', read: true  },
  { id:  7, type: 'scan',     title: 'Weekly scan completed — 0 new critical issues',  subtitle: '2 targets scanned · no new critical or high findings',           time: 'Yesterday', group: 'Yesterday', read: true  },
  { id:  8, type: 'system',   title: 'API key vzr_live_*** was created',               subtitle: 'New API key added from Settings · Paris, France',               time: '2 days ago', group: 'This week', read: true  },
  { id:  9, type: 'asset',    title: 'New IP detected: 192.168.1.44',                  subtitle: 'New asset on techstart.io scope · review recommended',          time: '3 days ago', group: 'This week', read: true  },
  { id: 10, type: 'scan',     title: 'Emerging threat scan: CVE-2025-1234 checked',   subtitle: 'All assets checked · No exposure detected',                     time: '4 days ago', group: 'This week', read: true  },
  { id: 11, type: 'system',   title: 'Your trial ends in 14 days',                     subtitle: 'Upgrade to Growth or Pro to keep access after your trial',      time: '5 days ago', group: 'This week', read: true  },
  { id: 12, type: 'fixed',    title: 'Monthly report generated and ready',             subtitle: 'May 2025 security report · 14 pages · download from Reports',   time: '6 days ago', group: 'This week', read: true  },
];

/* ── Filter helpers ────────────────────────────────────── */
const FILTER_MAP: Record<FilterTab, (n: Notification) => boolean> = {
  All:     () => true,
  Unread:  n => !n.read,
  Alerts:  n => n.type === 'critical',
  Scans:   n => n.type === 'scan',
  System:  n => n.type === 'system',
};

const FILTER_TABS: FilterTab[] = ['All', 'Unread', 'Alerts', 'Scans', 'System'];
const GROUPS: Notification['group'][] = ['Today', 'Yesterday', 'This week'];

/* ── Page ──────────────────────────────────────────────── */
export default function NotificationsPage() {
  const [notifs, setNotifs] = useState<Notification[]>(INITIAL);
  const [filter, setFilter] = useState<FilterTab>('All');

  const unreadCount = notifs.filter(n => !n.read).length;

  const markAllRead = () => setNotifs(prev => prev.map(n => ({ ...n, read: true })));
  const markRead    = (id: number) => setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));

  const visible = notifs.filter(FILTER_MAP[filter]);

  return (
    <div className="p-8 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <h1 className="font-black text-2xl" style={{ color: C.text }}>Notifications</h1>
          {unreadCount > 0 && (
            <span
              className="text-xs font-bold px-2.5 py-0.5 rounded-full"
              style={{ background: 'rgba(239,68,68,0.12)', color: '#f87171' }}
            >
              {unreadCount} unread
            </span>
          )}
        </div>
        <button
          onClick={markAllRead}
          className="text-xs font-semibold transition-all"
          style={{ color: C.accent, opacity: unreadCount > 0 ? 1 : 0.4 }}
          disabled={unreadCount === 0}
        >
          Mark all as read
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-0 mb-7" style={{ borderBottom: `1px solid ${C.innerBorder}` }}>
        {FILTER_TABS.map(tab => {
          const count = tab === 'Unread' ? unreadCount : notifs.filter(FILTER_MAP[tab]).length;
          return (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold transition-all"
              style={{
                color: filter === tab ? C.accent : C.muted,
                borderBottom: filter === tab ? `2px solid ${C.accent}` : '2px solid transparent',
                marginBottom: -1,
              }}
            >
              {tab}
              {count > 0 && tab !== 'All' && (
                <span
                  className="text-xs font-bold px-1.5 py-0.5 rounded-full"
                  style={{
                    background: filter === tab ? 'rgba(52,211,153,0.15)' : C.rowBg,
                    color: filter === tab ? C.accent : C.veryMuted,
                    fontSize: 10,
                  }}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Notification list grouped by date */}
      {visible.length === 0 ? (
        <div className="rounded-2xl p-10 text-center" style={GLASS}>
          <p className="text-sm" style={{ color: C.muted }}>No notifications in this category.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {GROUPS.map(group => {
            const items = visible.filter(n => n.group === group);
            if (items.length === 0) return null;
            return (
              <div key={group}>
                {/* Group label */}
                <p
                  className="text-xs font-bold uppercase tracking-widest mb-3 px-1"
                  style={{ color: C.veryMuted }}
                >
                  {group}
                </p>

                {/* Group card */}
                <div className="rounded-2xl overflow-hidden" style={GLASS}>
                  {items.map((n, i) => {
                    const cfg = TYPE_CFG[n.type];
                    return (
                      <div
                        key={n.id}
                        onClick={() => markRead(n.id)}
                        className="flex items-start gap-4 px-5 py-4 cursor-pointer transition-colors"
                        style={{
                          borderBottom: i < items.length - 1 ? `1px solid ${C.innerBorder}` : 'none',
                          background: !n.read ? 'rgba(52,211,153,0.035)' : 'transparent',
                        }}
                      >
                        <TypeIcon type={n.type} />

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3">
                            <p
                              className="text-sm leading-snug"
                              style={{
                                color: C.text,
                                fontWeight: n.read ? 400 : 600,
                              }}
                            >
                              {n.title}
                            </p>
                            <span className="text-xs flex-shrink-0 mt-0.5" style={{ color: C.veryMuted }}>
                              {n.time}
                            </span>
                          </div>
                          <p className="text-xs mt-0.5 leading-relaxed" style={{ color: C.muted }}>
                            {n.subtitle}
                          </p>
                        </div>

                        {/* Unread dot */}
                        {!n.read && (
                          <div
                            className="w-2 h-2 rounded-full flex-shrink-0 mt-2"
                            style={{ background: cfg.dot }}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
