'use client';

import { useState } from 'react';

const NOTIFICATIONS = [
  { id: 1, type: 'critical', title: 'Critical vulnerability detected', desc: 'Apache Log4j RCE (Log4Shell) found on techstart.io — immediate action required.', time: '2 min ago', read: false },
  { id: 2, type: 'scan', title: 'Scan completed', desc: 'Team scan finished — 2 targets scanned, 11 issues found.', time: '14 May 2026 09:35', read: false },
  { id: 3, type: 'high', title: 'New high severity issue', desc: 'Open RDP Port Exposed detected on acmecorp.com (port 3389).', time: '14 May 2026 09:30', read: false },
  { id: 4, type: 'info', title: 'Weekly scan scheduled', desc: 'Your next scheduled scan will run on 15 May 2026 at 02:00 UTC.', time: '13 May 2026 18:00', read: true },
  { id: 5, type: 'scan', title: 'Scan completed', desc: 'One-off scan finished — 1 target scanned, 4 issues found.', time: '12 May 2026 16:20', read: true },
  { id: 6, type: 'info', title: 'Network update detected', desc: '2 new services discovered on www.uir.ac.ma.', time: '12 May 2026 15:09', read: true },
  { id: 7, type: 'info', title: 'VyzorAI available', desc: 'Your AI security analyst is ready. Try asking it to validate your issues.', time: '10 May 2026 10:00', read: true },
];

const TYPE_CONFIG = {
  critical: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> },
  high: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> },
  scan: { color: '#6366f1', bg: 'rgba(99,102,241,0.1)', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg> },
  info: { color: '#0ea5e9', bg: 'rgba(14,165,233,0.1)', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> },
};

const NOTIF_SETTINGS = [
  { label: 'Critical vulnerabilities', desc: 'Instant alert when a critical issue is detected', email: true, slack: false },
  { label: 'High severity issues', desc: 'Alert when high severity vulnerabilities are found', email: true, slack: false },
  { label: 'Scan completed', desc: 'Notify when a scan finishes', email: true, slack: false },
  { label: 'New services discovered', desc: 'Alert when new services appear on your targets', email: false, slack: false },
  { label: 'Weekly digest', desc: 'Weekly summary of your security posture', email: true, slack: false },
  { label: 'Emerging threat scans', desc: 'Alert when an ETS scan runs automatically', email: true, slack: false },
];

export default function NotificationsPage() {
  const [tab, setTab] = useState<'inbox' | 'settings'>('inbox');
  const [notifs, setNotifs] = useState(NOTIFICATIONS);
  const [settings, setSettings] = useState(NOTIF_SETTINGS);

  const unread = notifs.filter(n => !n.read).length;

  const markAllRead = () => setNotifs(prev => prev.map(n => ({ ...n, read: true })));
  const markRead = (id: number) => setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));

  const toggleSetting = (i: number, field: 'email' | 'slack') =>
    setSettings(prev => prev.map((s, idx) => idx === i ? { ...s, [field]: !s[field] } : s));

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="font-black text-2xl" style={{ color: '#0f172a' }}>Notifications</h1>
          {unread > 0 && (
            <span className="text-xs font-bold px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>
              {unread} unread
            </span>
          )}
        </div>
        {tab === 'inbox' && unread > 0 && (
          <button onClick={markAllRead} className="text-xs font-semibold" style={{ color: '#6366f1' }}>
            Mark all as read
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-0 mb-6" style={{ borderBottom: '1px solid #f1f5f9' }}>
        {[{ key: 'inbox', label: 'Inbox' }, { key: 'settings', label: 'Preferences' }].map(t => (
          <button key={t.key} onClick={() => setTab(t.key as typeof tab)}
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

      {tab === 'inbox' && (
        <div className="card-glass rounded-2xl overflow-hidden">
          {notifs.map((notif, i) => {
            const cfg = TYPE_CONFIG[notif.type as keyof typeof TYPE_CONFIG];
            return (
              <div key={notif.id}
                onClick={() => markRead(notif.id)}
                className="flex items-start gap-4 px-5 py-4 cursor-pointer transition-colors hover:bg-gray-50"
                style={{
                  borderBottom: i < notifs.length - 1 ? '1px solid #f8fafc' : 'none',
                  background: !notif.read ? 'rgba(99,102,241,0.02)' : undefined,
                }}>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: cfg.bg, color: cfg.color }}>
                  {cfg.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold" style={{ color: '#0f172a' }}>{notif.title}</p>
                    <span className="text-xs flex-shrink-0 mt-0.5" style={{ color: '#94a3b8' }}>{notif.time}</span>
                  </div>
                  <p className="text-xs mt-0.5 leading-relaxed" style={{ color: '#64748b' }}>{notif.desc}</p>
                </div>
                {!notif.read && (
                  <div className="w-2 h-2 rounded-full flex-shrink-0 mt-2" style={{ background: '#6366f1' }} />
                )}
              </div>
            );
          })}
        </div>
      )}

      {tab === 'settings' && (
        <div className="space-y-4">
          <div className="card-glass rounded-2xl overflow-hidden">
            <div className="px-6 py-4 grid grid-cols-3 text-xs font-bold uppercase tracking-wide"
              style={{ borderBottom: '1px solid #f1f5f9', color: '#94a3b8', background: '#fafafa' }}>
              <span className="col-span-1">Notification</span>
              <span className="text-center">Email</span>
              <span className="text-center">Slack</span>
            </div>
            {settings.map((s, i) => (
              <div key={i} className="px-6 py-4 grid grid-cols-3 items-center"
                style={{ borderBottom: i < settings.length - 1 ? '1px solid #f8fafc' : 'none' }}>
                <div className="col-span-1 pr-4">
                  <p className="text-sm font-semibold" style={{ color: '#0f172a' }}>{s.label}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>{s.desc}</p>
                </div>
                <div className="flex justify-center">
                  <button onClick={() => toggleSetting(i, 'email')}
                    className="relative w-10 h-5 rounded-full transition-all"
                    style={{ background: s.email ? '#6366f1' : '#e2e8f0' }}>
                    <span className="absolute top-0.5 transition-all w-4 h-4 rounded-full bg-white shadow"
                      style={{ left: s.email ? '22px' : '2px' }} />
                  </button>
                </div>
                <div className="flex justify-center">
                  <button onClick={() => toggleSetting(i, 'slack')}
                    className="relative w-10 h-5 rounded-full transition-all"
                    style={{ background: s.slack ? '#6366f1' : '#e2e8f0' }}>
                    <span className="absolute top-0.5 transition-all w-4 h-4 rounded-full bg-white shadow"
                      style={{ left: s.slack ? '22px' : '2px' }} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="card-glass rounded-2xl p-5">
            <h2 className="font-bold text-sm mb-1" style={{ color: '#0f172a' }}>Slack integration</h2>
            <p className="text-xs mb-4" style={{ color: '#94a3b8' }}>Connect Slack to receive notifications directly in your workspace.</p>
            <button className="text-sm font-bold px-4 py-2.5 rounded-xl flex items-center gap-2"
              style={{ background: '#f1f5f9', color: '#475569' }}>
              <span>💬</span> Connect Slack
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
