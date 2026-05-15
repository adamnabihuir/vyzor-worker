import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getStripe, PLANS, PlanKey } from '@/lib/stripe';

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { plan = 'starter' } = await req.json() as { plan?: PlanKey };
  const priceId = PLANS[plan]?.priceId;
  if (!priceId) return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin;

  const stripe = getStripe();
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
}
