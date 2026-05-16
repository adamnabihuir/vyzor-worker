import { NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';

export async function POST() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const clerk = await clerkClient();
  const user  = await clerk.users.getUser(userId);
  const meta  = user.publicMetadata as { integrations?: { slack?: { webhookUrl: string } } };
  const slackUrl = meta?.integrations?.slack?.webhookUrl;

  if (!slackUrl) {
    return NextResponse.json({ error: 'No Slack webhook configured' }, { status: 400 });
  }

  const res = await fetch(slackUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: '✅ *Vyzor test notification* — Slack integration is working correctly!',
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '✅ *Vyzor — Test notification*\nSlack integration is configured correctly. You will receive scan alerts here.',
          },
        },
      ],
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    console.error('[slack/test] Slack returned', res.status, body);
    return NextResponse.json({ error: `Slack returned ${res.status}: ${body}` }, { status: 502 });
  }

  return NextResponse.json({ sent: true });
}
