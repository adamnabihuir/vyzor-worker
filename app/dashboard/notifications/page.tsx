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

type NType = 'critical' | 'scan' | 'asset' | 'fixed' | 'system';
type FilterTab = 'All' | 'Unread' | 'Alerts' | 'Scans' | 'System';

interface Notification {
  id: string;
  type: NType;
  title: string;
  subtitle: string;
  time: string;
  read: boolean;
}

const TYPE_CFG: Record<NType, { color: string; bg: string; dot: string }> = {
  critical: { color: '#f87171', bg: 'rgba(239,68,68,0.12)',   dot: '#ef4444' },
  scan:     { color: '#fbbf24', bg: 'rgba(245,158,11,0.12)',   dot: '#f59e0b' },
  asset:    { color: '#60a5fa', bg: 'rgba(59,130,246,0.12)',   dot: '#3b82f6' },
  fixed:    { color: C.accent,  bg: 'rgba(52,211,153,0.1)',    dot: C.accent  },
  system:   { color: '#a78bfa', bg: 'rgba(167,139,250,0.1)',   dot: '#8b5cf6' },
};

function TypeIcon({ type }: { type: NType }) {
  const cfg = TYPE_CFG[type];
  const paths: Record<NType, React.ReactNode> = {
    critical: <><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></>,
    scan:     <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>,
    asset:    <><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></>,
    fixed:    <polyline points="20 6 9 17 4 12"/>,
    system:   <><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>,
  };
  return (
    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
      style={{ background: cfg.bg, color: cfg.color }}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        {paths[type]}
      </svg>
    </div>
  );
}

const FILTER_TABS: FilterTab[] = ['All', 'Unread', 'Alerts', 'Scans', 'System'];
const FILTER_MAP: Record<FilterTab, (n: Notification) => boolean> = {
  All:    () => true,
  Unread: n => !n.read,
  Alerts: n => n.type === 'critical',
  Scans:  n => n.type === 'scan',
  System: n => n.type === 'system',
};

export default function NotificationsPage() {
  const [notifs, setNotifs]   = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState<FilterTab>('All');

  useEffect(() => {
    fetch('/api/notifications')
      .then(r => r.json())
      .then(data => setNotifs(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const unreadCount = notifs.filter(n => !n.read).length;
  const markAllRead = () => setNotifs(prev => prev.map(n => ({ ...n, read: true })));
  const markRead    = (id: string) => setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  const visible     = notifs.filter(FILTER_MAP[filter]);

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <h1 className="font-black text-2xl" style={{ color: C.text }}>Notifications</h1>
          {unreadCount > 0 && (
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full"
              style={{ background: 'rgba(239,68,68,0.12)', color: '#f87171' }}>
              {unreadCount} unread
            </span>
          )}
        </div>
        <button onClick={markAllRead} disabled={unreadCount === 0}
          className="text-xs font-semibold transition-all"
          style={{ color: C.accent, opacity: unreadCount > 0 ? 1 : 0.4 }}>
          Mark all as read
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-0 mb-7" style={{ borderBottom: `1px solid ${C.innerBorder}` }}>
        {FILTER_TABS.map(tab => {
          const count = tab === 'Unread' ? unreadCount : notifs.filter(FILTER_MAP[tab]).length;
          return (
            <button key={tab} onClick={() => setFilter(tab)}
              className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold transition-all"
              style={{
                color: filter === tab ? C.accent : C.muted,
                borderBottom: filter === tab ? `2px solid ${C.accent}` : '2px solid transparent',
                marginBottom: -1,
              }}>
              {tab}
              {count > 0 && tab !== 'All' && (
                <span className="text-xs font-bold px-1.5 py-0.5 rounded-full"
                  style={{ background: filter === tab ? 'rgba(52,211,153,0.15)' : C.rowBg, color: filter === tab ? C.accent : C.veryMuted, fontSize: 10 }}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {loading && (
        <div className="rounded-2xl p-10 text-center" style={GLASS}>
          <p className="text-sm" style={{ color: C.muted }}>Loading notifications…</p>
        </div>
      )}

      {!loading && visible.length === 0 && (
        <div className="rounded-2xl p-16 text-center" style={GLASS}>
          <div className="w-12 h-12 rounded-2xl mx-auto mb-4 flex items-center justify-center"
            style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.15)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="1.5">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
          </div>
          <p className="font-semibold text-sm mb-1" style={{ color: C.text }}>
            {filter === 'All' ? 'No notifications yet' : `No ${filter.toLowerCase()} notifications`}
          </p>
          <p className="text-xs" style={{ color: C.muted }}>
            Run a scan to start receiving alerts here.
          </p>
        </div>
      )}

      {!loading && visible.length > 0 && (
        <div className="rounded-2xl overflow-hidden" style={GLASS}>
          {visible.map((n, i) => {
            const cfg = TYPE_CFG[n.type];
            return (
              <div key={n.id} onClick={() => markRead(n.id)}
                className="flex items-start gap-4 px-5 py-4 cursor-pointer transition-colors"
                style={{
                  borderBottom: i < visible.length - 1 ? `1px solid ${C.innerBorder}` : 'none',
                  background: !n.read ? 'rgba(52,211,153,0.035)' : 'transparent',
                }}>
                <TypeIcon type={n.type} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm leading-snug" style={{ color: C.text, fontWeight: n.read ? 400 : 600 }}>
                      {n.title}
                    </p>
                    <span className="text-xs flex-shrink-0 mt-0.5" style={{ color: C.veryMuted }}>{n.time}</span>
                  </div>
                  <p className="text-xs mt-0.5 leading-relaxed" style={{ color: C.muted }}>{n.subtitle}</p>
                </div>
                {!n.read && (
                  <div className="w-2 h-2 rounded-full flex-shrink-0 mt-2" style={{ background: cfg.dot }} />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
