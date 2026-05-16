import { auth, clerkClient } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import DashboardShell from '@/components/dashboard/DashboardShell';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  if (!userId) redirect('/auth/login');

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const sub = user.publicMetadata?.subscription as { status?: string } | undefined;
  const activeStatuses = ['trialing', 'active'];
  const hasAccess = sub?.status && activeStatuses.includes(sub.status);

  if (!hasAccess) redirect('/onboarding');

  return (
    <div className="min-h-screen flex" style={{ background: '#021a12' }}>
      <DashboardShell>{children}</DashboardShell>
    </div>
  );
}
