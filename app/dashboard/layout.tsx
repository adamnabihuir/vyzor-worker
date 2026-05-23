import { auth, clerkClient } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import DashboardShell from '@/components/dashboard/DashboardShell';
import { validateEmail } from '@/lib/auth/email-validation';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  if (!userId) redirect('/auth/login');

  const client = await clerkClient();
  const user = await client.users.getUser(userId);

  // Block non-corporate emails
  const primaryEmailObj = user.emailAddresses.find(e => e.id === user.primaryEmailAddressId);
  const primaryEmail    = primaryEmailObj?.emailAddress ?? '';
  const emailCheck      = validateEmail(primaryEmail);
  if (!emailCheck.valid) redirect('/signup?error=corporate_required');

  // Block accounts whose email is NOT verified (protects against create-instant bypass)
  const emailVerified = primaryEmailObj?.verification?.status === 'verified';
  if (!emailVerified) redirect('/signup?error=email_not_verified');

  // Block accounts that have no password — ensures only our signup flow was used.
  // Users who signed in via email link/code (bypassing password) are caught here.
  if (!user.passwordEnabled) redirect('/auth/force-password');

  return (
    <div className="min-h-screen flex" style={{ background: '#f8fafc' }}>
      <DashboardShell>{children}</DashboardShell>
    </div>
  );
}
