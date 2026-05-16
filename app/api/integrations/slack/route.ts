import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';

type UserMeta = { integrations?: { slack?: { webhookUrl: string } } };

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const clerk = await clerkClient();
  const user  = await clerk.users.getUser(userId);
  const meta  = (user.publicMetadata ?? {}) as UserMeta;
  const url   = meta.integrations?.slack?.webhookUrl;

  return NextResponse.json({ configured: !!url, webhookUrl: url ? '***' : null });
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body       = await req.json().catch(() => ({}));
  const webhookUrl = typeof body.webhookUrl === 'string' ? body.webhookUrl.trim() : '';

  if (!webhookUrl.startsWith('https://hooks.slack.com/')) {
    return NextResponse.json({ error: 'Invalid Slack webhook URL' }, { status: 400 });
  }

  const clerk = await clerkClient();
  const user  = await clerk.users.getUser(userId);
  const meta  = (user.publicMetadata ?? {}) as UserMeta;

  await clerk.users.updateUserMetadata(userId, {
    publicMetadata: {
      ...meta,
      integrations: { ...meta.integrations, slack: { webhookUrl } },
    },
  });

  return NextResponse.json({ configured: true });
}

export async function DELETE() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const clerk = await clerkClient();
  const user  = await clerk.users.getUser(userId);
  const meta  = (user.publicMetadata ?? {}) as UserMeta;
  const integrations = { ...meta.integrations };
  delete integrations.slack;

  await clerk.users.updateUserMetadata(userId, {
    publicMetadata: { ...meta, integrations },
  });

  return NextResponse.json({ configured: false });
}
