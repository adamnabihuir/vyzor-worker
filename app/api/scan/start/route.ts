import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
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

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      return NextResponse.json({ error: `Missing env: URL=${!!url} KEY=${!!key}` }, { status: 500 });
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('scans')
      .insert({ domain: clean })
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
