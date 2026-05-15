import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Sidebar from '@/components/dashboard/Sidebar';
import SubscriptionBanner from '@/components/dashboard/SubscriptionBanner';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  if (!userId) redirect('/auth/login');

  return (
    <div className="min-h-screen flex" style={{ background: '#f8fafc' }}>
      <Sidebar />
      <main className="flex-1 ml-60 min-h-screen pt-6">
        <SubscriptionBanner />
        {children}
      </main>
    </div>
  );
}
