import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

export async function GET() {
  const checks: Record<string, string> = {};

  // Supabase check
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!,
    );
    const { error } = await supabase.from('scans').select('id').limit(1);
    checks.supabase = error ? 'error' : 'ok';
  } catch {
    checks.supabase = 'error';
  }

  const allOk = Object.values(checks).every(v => v === 'ok');

  return NextResponse.json({
    status: allOk ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    checks,
  }, { status: allOk ? 200 : 503 });
}
