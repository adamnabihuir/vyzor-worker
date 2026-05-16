'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import Logo from '@/components/Logo';
import { useUser, useClerk } from '@clerk/nextjs';

const NAV = [
  { label: 'Dashboard',     href: '/dashboard',                icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg> },
  { label: 'Discovery',     href: '/dashboard/discovery',      icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg> },
  { label: 'Targets',       href: '/dashboard/targets',        icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg> },
  { label: 'Domains',       href: '/dashboard/domains/add',    icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg> },
  { label: 'Scans',         href: '/dashboard/scans',          icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg> },
  { label: 'Issues',        href: '/dashboard/vulnerabilities', icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m12 22 4-4H8l4 4Z"/><circle cx="12" cy="12" r="3"/></svg>, badge: '!', badgeColor: '#ef4444' },
  { label: 'Reports',       href: '/dashboard/reports',        icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg> },
  { label: 'Attack surface', href: '/dashboard/attack-surface', icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> },
  { label: 'Pentests',      href: '/dashboard/pentests',       icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m14.5 2-8.5 8.5 1.5 1.5 8.5-8.5-1.5-1.5z"/><path d="m7 14-5 5"/><path d="m15.5 4.5 4 4"/></svg>, badge: 'Beta', badgeColor: '#a78bfa' },
  { label: 'VyzorAI',       href: '/dashboard/ai',             icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="10" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/><circle cx="12" cy="16" r="1" fill="currentColor"/></svg>, badge: 'AI', badgeColor: '#34d399' },
];

const BOTTOM_NAV = [
  { label: 'Integrations',  href: '/dashboard/integrations',  icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="6" height="6" rx="1"/><rect x="16" y="7" width="6" height="6" rx="1"/><rect x="9" y="14" width="6" height="6" rx="1"/><path d="M5 7V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v2"/><path d="M12 13v1"/></svg> },
  { label: 'Notifications', href: '/dashboard/notifications', icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg> },
  { label: 'Settings',      href: '/dashboard/settings',      icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg> },
];

export default function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const pathname = usePathname();
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();

  const isActive = (href: string) => href === '/dashboard' ? pathname === href : pathname.startsWith(href);

  const initials = user?.firstName && user?.lastName
    ? `${user.firstName[0]}${user.lastName[0]}`
    : user?.emailAddresses?.[0]?.emailAddress?.slice(0, 2).toUpperCase() ?? '??';

  const displayName = user?.fullName ?? user?.emailAddresses?.[0]?.emailAddress ?? 'User';
  const displayEmail = user?.emailAddresses?.[0]?.emailAddress ?? '';

  return (
    <aside
      className="fixed left-0 top-0 h-full flex flex-col z-40 transition-all duration-300"
      style={{
        width: collapsed ? '64px' : '240px',
        background: '#031e15',
        borderRight: '1px solid rgba(16,185,129,0.12)',
        overflow: 'hidden',
      }}
    >
      {/* Logo + toggle */}
      <div className="flex items-center justify-between px-3 py-4"
        style={{ borderBottom: '1px solid rgba(16,185,129,0.1)', minHeight: 56 }}>
        {!collapsed && (
          <div className="transition-opacity duration-200">
            <Logo size={24} />
          </div>
        )}
        <button
          onClick={onToggle}
          title="Toggle sidebar"
          className="flex items-center justify-center rounded-lg transition-all flex-shrink-0"
          style={{
            width: 28, height: 28,
            background: 'rgba(52,211,153,0.15)',
            color: '#34d399',
            border: '1px solid rgba(52,211,153,0.3)',
            marginLeft: collapsed ? 'auto' : 0,
            marginRight: collapsed ? 'auto' : 0,
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(52,211,153,0.25)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(52,211,153,0.15)'; }}
        >
          {collapsed ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          )}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto overflow-x-hidden">
        {NAV.map(item => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className="flex items-center gap-3 rounded-xl text-sm font-medium transition-all duration-150"
              style={{
                padding: collapsed ? '8px 0' : '8px 12px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                background: active ? 'rgba(52,211,153,0.15)' : 'transparent',
                color: active ? '#ffffff' : 'rgba(255,255,255,0.55)',
              }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.85)'; } }}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.55)'; } }}
            >
              <span style={{ opacity: active ? 1 : 0.6, flexShrink: 0 }}>{item.icon}</span>
              {!collapsed && (
                <span className="flex-1 whitespace-nowrap">{item.label}</span>
              )}
              {!collapsed && item.badge && (
                <span className="text-xs font-bold px-1.5 py-0.5 rounded-full"
                  style={{ background: `${item.badgeColor}25`, color: item.badgeColor }}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom nav */}
      <div className="px-2 py-3 space-y-0.5" style={{ borderTop: '1px solid rgba(16,185,129,0.1)' }}>
        {BOTTOM_NAV.map(item => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className="flex items-center gap-3 rounded-xl text-sm font-medium transition-all duration-150"
              style={{
                padding: collapsed ? '8px 0' : '8px 12px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                background: active ? 'rgba(52,211,153,0.15)' : 'transparent',
                color: active ? '#ffffff' : 'rgba(255,255,255,0.55)',
              }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.85)'; } }}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.55)'; } }}
            >
              <span style={{ opacity: active ? 1 : 0.6, flexShrink: 0 }}>{item.icon}</span>
              {!collapsed && <span className="flex-1 whitespace-nowrap">{item.label}</span>}
            </Link>
          );
        })}

        {/* User row */}
        <div className="flex items-center gap-2.5 mt-1 rounded-xl transition-all"
          style={{
            padding: collapsed ? '8px 0' : '8px 12px',
            justifyContent: collapsed ? 'center' : 'flex-start',
            background: 'rgba(52,211,153,0.06)',
            border: '1px solid rgba(52,211,153,0.1)',
          }}>
          <div className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0"
            style={{ background: 'linear-gradient(135deg,#34d399,#059669)', color: '#021a12' }}>
            {initials}
          </div>
          {!collapsed && (
            <>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate" style={{ color: '#f0fdf4' }}>{displayName}</p>
                <p className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.45)' }}>{displayEmail}</p>
              </div>
              <button onClick={() => signOut(() => router.push('/auth/login'))}
                style={{ color: 'rgba(255,255,255,0.4)' }}
                onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
              </button>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}
