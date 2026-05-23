'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import Logo from '@/components/Logo';
import NotificationBell from '@/components/dashboard/NotificationBell';
import { useUser, useClerk } from '@clerk/nextjs';
import { usePlan } from '@/components/providers/PlanProvider';
import { canAccess, getPlanConfig } from '@/lib/plans';
import type { Plan } from '@/lib/plans';

/* ─── Nav definitions ─────────────────────────────────────────────────────── */
interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  requiredPlan?: Plan;
}

const NAV: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
  },
  {
    label: 'Scans',
    href: '/dashboard/scans',
    icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  },
  {
    label: 'Attack Surface',
    href: '/dashboard/attack-surface',
    icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  },
  {
    label: 'Vulnerabilities',
    href: '/dashboard/vulnerabilities',
    icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m12 22 4-4H8l4 4Z"/><circle cx="12" cy="12" r="3"/></svg>,
  },
  {
    label: 'Reports',
    href: '/dashboard/reports',
    icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  },
  {
    label: 'VyzorAI',
    href: '/dashboard/ai',
    icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="10" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/><circle cx="12" cy="16" r="1" fill="currentColor"/></svg>,
    requiredPlan: 'growth',
  },
];

const SECTION2: NavItem[] = [
  {
    label: 'Domains',
    href: '/dashboard/domains',
    icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>,
  },
  {
    label: 'Schedules',
    href: '/dashboard/schedules',
    icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    requiredPlan: 'starter',
  },
  {
    label: 'Integrations',
    href: '/dashboard/integrations',
    icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="6" height="6" rx="1"/><rect x="16" y="7" width="6" height="6" rx="1"/><rect x="9" y="14" width="6" height="6" rx="1"/><path d="M5 7V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v2"/><path d="M12 13v1"/></svg>,
  },
];

const BOTTOM_NAV: NavItem[] = [
  {
    label: 'Settings',
    href: '/dashboard/settings',
    icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  },
  {
    label: 'Billing',
    href: '/dashboard/billing',
    icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
  },
];

/* ─── NavLink component ───────────────────────────────────────────────────── */
function NavLink({
  item,
  collapsed,
  active,
  locked,
}: {
  item: NavItem;
  collapsed: boolean;
  active: boolean;
  locked: boolean;
}) {
  const router = useRouter();
  const lockColor = item.requiredPlan ? getPlanConfig(item.requiredPlan).color : '#94a3b8';

  const style: React.CSSProperties = {
    padding: collapsed ? '8px 0' : '8px 12px',
    justifyContent: collapsed ? 'center' : 'flex-start',
    background: active ? '#ecfdf5' : 'transparent',
    color: locked ? '#94a3b8' : active ? '#059669' : '#475569',
    opacity: locked ? 0.7 : 1,
  };

  const handleClick = (e: React.MouseEvent) => {
    if (locked) {
      e.preventDefault();
      router.push('/dashboard/billing');
    }
  };

  return (
    <Link
      href={item.href}
      title={collapsed ? item.label : undefined}
      onClick={handleClick}
      className="flex items-center gap-3 rounded-xl text-sm font-medium transition-all duration-150"
      style={style}
      onMouseEnter={e => {
        if (!active && !locked) {
          e.currentTarget.style.background = '#f1f5f9';
          e.currentTarget.style.color = '#1e293b';
        }
      }}
      onMouseLeave={e => {
        if (!active && !locked) {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.color = '#475569';
        }
      }}
    >
      <span style={{ opacity: locked ? 0.4 : active ? 1 : 0.7, flexShrink: 0 }}>{item.icon}</span>
      {!collapsed && <span className="flex-1 whitespace-nowrap">{item.label}</span>}
      {!collapsed && locked && item.requiredPlan && (
        <span className="flex items-center gap-1">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={lockColor} strokeWidth="2.5">
            <rect x="3" y="11" width="18" height="11" rx="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          <span className="text-xs font-bold" style={{ color: lockColor }}>
            {getPlanConfig(item.requiredPlan).label}
          </span>
        </span>
      )}
    </Link>
  );
}

/* ─── Section divider ─────────────────────────────────────────────────────── */
function Divider({ collapsed }: { collapsed: boolean }) {
  return (
    <div className="py-2 px-2">
      {!collapsed ? (
        <div style={{ height: 1, background: '#e2e8f0' }} />
      ) : (
        <div style={{ height: 1, background: '#e2e8f0', margin: '0 8px' }} />
      )}
    </div>
  );
}

/* ─── Main Sidebar ────────────────────────────────────────────────────────── */
export default function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const pathname = usePathname();
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const { plan, limit, used, loading } = usePlan();

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === href : pathname.startsWith(href);

  const isLocked = (item: NavItem) =>
    !!item.requiredPlan && !canAccess(plan, item.requiredPlan);

  const initials = user?.firstName && user?.lastName
    ? `${user.firstName[0]}${user.lastName[0]}`
    : user?.emailAddresses?.[0]?.emailAddress?.slice(0, 2).toUpperCase() ?? '??';

  const displayName = user?.fullName ?? user?.emailAddresses?.[0]?.emailAddress ?? 'User';
  const displayEmail = user?.emailAddresses?.[0]?.emailAddress ?? '';

  const planConfig = getPlanConfig(plan);
  const quotaPct = limit === Infinity ? 0 : Math.min((used / limit) * 100, 100);
  const quotaWarning = limit !== Infinity && used >= limit * 0.9;

  return (
    <aside
      className="fixed left-0 top-0 h-full flex flex-col z-40 transition-all duration-300"
      style={{
        width: collapsed ? '64px' : '240px',
        background: '#ffffff',
        borderRight: '1px solid #e2e8f0',
        overflow: 'hidden',
      }}
    >
      {/* Logo + toggle */}
      <div className="flex items-center justify-between px-3 py-4"
        style={{ borderBottom: '1px solid #e2e8f0', minHeight: 56 }}>
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
            background: '#f1f5f9',
            color: '#64748b',
            border: '1px solid #e2e8f0',
            marginLeft: collapsed ? 'auto' : 0,
            marginRight: collapsed ? 'auto' : 0,
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#e2e8f0'; }}
          onMouseLeave={e => { e.currentTarget.style.background = '#f1f5f9'; }}
        >
          {collapsed ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6"/></svg>
          )}
        </button>
      </div>

      {/* Plan badge + quota — collapsed shows just dot */}
      {!loading && (
        <div className="px-2 pt-3 pb-1">
          {collapsed ? (
            <div className="flex justify-center">
              <div className="w-2 h-2 rounded-full" style={{ background: planConfig.color }} title={`Plan: ${planConfig.label}`} />
            </div>
          ) : (
            <div className="rounded-xl px-3 py-2.5"
              style={{ background: `${planConfig.color}10`, border: `1px solid ${planConfig.color}25` }}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold" style={{ color: planConfig.color }}>
                  Plan {planConfig.label}
                </span>
                {plan !== 'pro' && (
                  <button
                    onClick={() => router.push('/dashboard/billing')}
                    className="text-xs font-bold px-1.5 py-0.5 rounded-lg transition-all"
                    style={{ background: `${planConfig.color}20`, color: planConfig.color }}
                  >
                    Upgrade
                  </button>
                )}
              </div>
              {/* Quota bar */}
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 rounded-full" style={{ background: '#e2e8f0' }}>
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: limit === Infinity ? '10%' : `${quotaPct}%`,
                      background: quotaWarning ? '#ef4444' : planConfig.color,
                    }}
                  />
                </div>
                <span className="text-xs whitespace-nowrap" style={{ color: '#94a3b8' }}>
                  {limit === Infinity ? `${used} scans` : `${used}/${limit}`}
                </span>
              </div>
              {quotaWarning && (
                <p className="text-xs mt-1" style={{ color: '#f87171' }}>
                  ⚠ Quota presque atteint
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Main nav */}
      <nav className="flex-1 px-2 py-2 space-y-0.5 overflow-y-auto overflow-x-hidden">
        {/* Section 1 — Core */}
        {NAV.map(item => (
          <NavLink
            key={item.href}
            item={item}
            collapsed={collapsed}
            active={isActive(item.href)}
            locked={isLocked(item)}
          />
        ))}

        <Divider collapsed={collapsed} />

        {/* Section 2 — Config */}
        {SECTION2.map(item => (
          <NavLink
            key={item.href}
            item={item}
            collapsed={collapsed}
            active={isActive(item.href)}
            locked={isLocked(item)}
          />
        ))}
      </nav>

      {/* Bottom nav */}
      <div className="px-2 py-3 space-y-0.5" style={{ borderTop: '1px solid #e2e8f0' }}>
        {BOTTOM_NAV.map(item => {
          const active = isActive(item.href);
          const isBilling = item.href === '/dashboard/billing';
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className="flex items-center gap-3 rounded-xl text-sm font-medium transition-all duration-150"
              style={{
                padding: collapsed ? '8px 0' : '8px 12px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                background: active
                  ? '#ecfdf5'
                  : isBilling && plan !== 'pro'
                  ? 'rgba(239,68,68,0.06)'
                  : 'transparent',
                color: active ? '#059669' : isBilling && plan !== 'pro' ? '#ef4444' : '#475569',
                border: isBilling && plan !== 'pro' && !active ? '1px solid rgba(239,68,68,0.2)' : '1px solid transparent',
              }}
              onMouseEnter={e => {
                if (!active) {
                  e.currentTarget.style.background = '#f1f5f9';
                  e.currentTarget.style.color = '#1e293b';
                }
              }}
              onMouseLeave={e => {
                if (!active) {
                  e.currentTarget.style.background =
                    isBilling && plan !== 'pro' ? 'rgba(239,68,68,0.06)' : 'transparent';
                  e.currentTarget.style.color =
                    isBilling && plan !== 'pro' ? '#ef4444' : '#475569';
                }
              }}
            >
              <span style={{ opacity: active ? 1 : 0.6, flexShrink: 0 }}>{item.icon}</span>
              {!collapsed && <span className="flex-1 whitespace-nowrap">{item.label}</span>}
              {!collapsed && isBilling && plan !== 'pro' && (
                <span className="text-xs font-bold px-1.5 py-0.5 rounded-full"
                  style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171' }}>
                  🔥 Upgrade
                </span>
              )}
            </Link>
          );
        })}

        {/* Notification bell */}
        <NotificationBell collapsed={collapsed} />

        {/* User row */}
        <div className="flex items-center gap-2.5 mt-1 rounded-xl transition-all"
          style={{
            padding: collapsed ? '8px 0' : '8px 12px',
            justifyContent: collapsed ? 'center' : 'flex-start',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
          }}>
          <div className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0"
            style={{ background: 'linear-gradient(135deg,#34d399,#059669)', color: '#ffffff' }}>
            {initials}
          </div>
          {!collapsed && (
            <>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate" style={{ color: '#1e293b' }}>{displayName}</p>
                <p className="text-xs truncate" style={{ color: '#94a3b8' }}>{displayEmail}</p>
              </div>
              <button
                onClick={() => signOut({ redirectUrl: '/sign-in' })}
                style={{ color: '#94a3b8' }}
                title="Sign out"
                onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
              </button>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}
