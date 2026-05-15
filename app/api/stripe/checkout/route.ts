import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { PLANS, PlanKey } from '@/lib/stripe';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const plan = (body.plan ?? 'starter') as PlanKey;
    const priceId = PLANS[plan]?.priceId;

    if (!priceId) {
      return NextResponse.json({ error: `Invalid plan or missing STRIPE_${plan.toUpperCase()}_PRICE_ID env var` }, { status: 400 });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: 'STRIPE_SECRET_KEY not configured' }, { status: 500 });
    }

    const { default: Stripe } = await import('stripe');
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2026-04-22.dahlia' });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin;

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: {
        trial_period_days: 14,
        metadata: { userId, plan },
      },
      metadata: { userId, plan },
      success_url: `${baseUrl}/checkout/success`,
      cancel_url: `${baseUrl}/onboarding`,
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[stripe/checkout]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
