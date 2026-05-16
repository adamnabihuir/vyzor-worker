import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const domain = typeof body.domain === 'string' ? body.domain.trim() : '';

    if (!domain) {
      return NextResponse.json({ error: 'Domain is required' }, { status: 400 });
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
      .from('scans')
      .insert({ domain: clean, user_id: userId })
      .select('id')
      .single();

    if (error || !data) {
      console.error('[scan/start] Supabase error:', JSON.stringify(error));
      return NextResponse.json({ error: 'Supabase error', detail: error?.message }, { status: 500 });
    }

    return NextResponse.json({ scanId: data.id });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[scan/start]', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
