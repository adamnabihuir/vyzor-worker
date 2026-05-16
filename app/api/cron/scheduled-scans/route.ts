import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

// Vercel Cron — runs every hour (configured in vercel.json)
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();

  const { data: due, error } = await supabase
    .from('scheduled_scans')
    .select('*')
    .eq('active', true)
    .lte('next_run', new Date().toISOString());

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  let triggered = 0;
  for (const schedule of (due ?? [])) {
    // Insert a new scan row — the worker will pick it up
    const { error: insertErr } = await supabase
      .from('scans')
      .insert({ domain: schedule.domain, user_id: schedule.user_id });

    if (insertErr) {
      console.error('[cron/scheduled-scans] insert error:', insertErr.message);
      continue;
    }

    // Advance next_run
    const next = new Date();
    if      (schedule.frequency === 'daily')   next.setDate(next.getDate() + 1);
    else if (schedule.frequency === 'weekly')  next.setDate(next.getDate() + 7);
    else                                       next.setMonth(next.getMonth() + 1);

    await supabase
      .from('scheduled_scans')
      .update({ next_run: next.toISOString() })
      .eq('id', schedule.id);

    triggered++;
  }

  return NextResponse.json({ triggered, checked: (due ?? []).length });
}
