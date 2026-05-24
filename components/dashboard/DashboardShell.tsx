'use client';

import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import TrialGate from './TrialGate';
import { PlanProvider } from '@/components/providers/PlanProvider';

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    if (saved === 'true') setCollapsed(true);
    setMounted(true);
  }, []);

  const toggle = () => {
    setCollapsed(c => {
      localStorage.setItem('sidebar-collapsed', String(!c));
      return !c;
    });
  };

  const sidebarWidth = collapsed ? 64 : 240;

  return (
    <PlanProvider>
      <TrialGate />
      <Sidebar collapsed={collapsed} onToggle={toggle} />
      <main
        className="flex-1 min-h-screen"
        style={{
          marginLeft: mounted ? sidebarWidth : 240,
          transition: 'margin-left 300ms cubic-bezier(0.4,0,0.2,1)',
        }}
      >
        {children}
      </main>
    </PlanProvider>
  );
}
