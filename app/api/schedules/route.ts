import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getSupabaseAdmin } from '@/lib/supabase';

function nextRunDate(frequency: string): Date {
  const d = new Date();
  if (frequency === 'daily')   d.setDate(d.getDate() + 1);
  else if (frequency === 'weekly') d.setDate(d.getDate() + 7);
  else                          d.setMonth(d.getMonth() + 1);
  return d;
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('scheduled_scans')
    .select('*')
    .eq('user_id', userId)
    .eq('active', true)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const domain    = typeof body.domain    === 'string' ? body.domain.trim()    : '';
  const frequency = typeof body.frequency === 'string' ? body.frequency.trim() : '';

  if (!domain || !frequency) {
    return NextResponse.json({ error: 'domain and frequency are required' }, { status: 400 });
  }
  if (!['daily', 'weekly', 'monthly'].includes(frequency)) {
    return NextResponse.json({ error: 'frequency must be daily, weekly, or monthly' }, { status: 400 });
  }

  const clean = domain
    .replace(/^https?:\/\//, '')
    .replace(/\/.*/, '')
    .replace(/:\d+$/, '')
    .toLowerCase();

  if (!/^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z]{2,})+$/.test(clean)) {
    return NextResponse.json({ error: 'Invalid domain format' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('scheduled_scans')
    .insert({ user_id: userId, domain: clean, frequency, next_run: nextRunDate(frequency).toISOString() })
    .select('*')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
