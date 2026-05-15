import { auth, clerkClient } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Sidebar from '@/components/dashboard/Sidebar';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  if (!userId) redirect('/auth/login');

  // Check subscription status
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const sub = user.publicMetadata?.subscription as { status?: string } | undefined;
  const activeStatuses = ['trialing', 'active'];

  // Allow access with ?checkout=success (webhook may not have fired yet)
  // The actual check will re-run on next navigation
  const hasAccess = sub?.status && activeStatuses.includes(sub.status);

  if (!hasAccess) {
    redirect('/onboarding');
  }

  return (
    <div className="min-h-screen flex" style={{ background: '#f8fafc' }}>
      <Sidebar />
      <main className="flex-1 ml-60 min-h-screen">
        {children}
      </main>
    </div>
  );
}
