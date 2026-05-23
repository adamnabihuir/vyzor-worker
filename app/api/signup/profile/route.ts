import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { firstName, lastName, companyName, role, companySize, primaryGoal, referralSource } = body;

  if (!firstName || !lastName || !companyName || !role || !primaryGoal) {
    return NextResponse.json({ error: 'All required fields must be filled' }, { status: 400 });
  }

  const { error } = await supabase
    .from('users')
    .update({
      first_name: firstName,
      last_name: lastName,
      company_name: companyName,
      role,
      company_size: companySize,
      primary_goal: primaryGoal,
      referral_source: referralSource ?? null,
      onboarding_step: 'payment',
      updated_at: new Date().toISOString(),
    })
    .eq('clerk_id', userId);

  if (error) {
    console.error('[signup/profile]', error);
    return NextResponse.json({ error: 'Failed to save profile' }, { status: 500 });
  }

  // Log trial event
  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('clerk_id', userId)
    .single();

  if (user) {
    await supabase.from('trial_events').insert({
      user_id: user.id,
      event_type: 'profile_completed',
      metadata: { role, companySize, primaryGoal },
    });
  }

  return NextResponse.json({ success: true });
}
