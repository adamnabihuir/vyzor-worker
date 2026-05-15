import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { clerkClient } from '@clerk/nextjs/server';
import Stripe from 'stripe';

export const runtime = 'nodejs';

async function updateUserSubscription(userId: string, data: {
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  plan?: string;
  status?: string;
  trialEnd?: number | null;
  currentPeriodEnd?: number;
}) {
  const client = await clerkClient();
  await client.users.updateUserMetadata(userId, {
    publicMetadata: { subscription: data },
  });
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature')!;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature error:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        if (!userId || !session.subscription) break;

        const sub = await stripe.subscriptions.retrieve(session.subscription as string);
        await updateUserSubscription(userId, {
          stripeCustomerId: session.customer as string,
          stripeSubscriptionId: sub.id,
          plan: session.metadata?.plan ?? 'starter',
          status: sub.status,
          trialEnd: sub.trial_end,
          currentPeriodEnd: (sub as unknown as { current_period_end: number }).current_period_end,
        });
        break;
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.userId;
        if (!userId) break;

        await updateUserSubscription(userId, {
          stripeSubscriptionId: sub.id,
          plan: sub.metadata?.plan ?? 'starter',
          status: sub.status,
          trialEnd: sub.trial_end,
          currentPeriodEnd: (sub as unknown as { current_period_end: number }).current_period_end,
        });
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const subId = (invoice as { subscription?: string }).subscription;
        if (!subId) break;
        const sub = await stripe.subscriptions.retrieve(subId);
        const userId = sub.metadata?.userId;
        if (!userId) break;
        await updateUserSubscription(userId, { status: 'past_due' });
        break;
      }
    }
  } catch (err) {
    console.error('Webhook handler error:', err);
    return NextResponse.json({ error: 'Handler error' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
