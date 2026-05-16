import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { randomUUID } from 'crypto';

function cleanDomain(raw: string): string {
  return raw
    .trim()
    .replace(/^https?:\/\//, '')
    .replace(/\/.*/, '')
    .replace(/:\d+$/, '')
    .toLowerCase();
}

function isValidDomain(d: string): boolean {
  return /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z]{2,})+$/.test(d);
}

// POST /api/domains/verify — initiate verification, returns TXT record to add
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const domain = cleanDomain(typeof body.domain === 'string' ? body.domain : '');

  if (!domain || !isValidDomain(domain)) {
    return NextResponse.json({ error: 'Invalid domain' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  // Check if already verified and not expired
  const { data: existing } = await supabase
    .from('domain_verifications')
    .select('*')
    .eq('user_id', userId)
    .eq('domain', domain)
    .single();

  if (existing?.status === 'verified' && new Date(existing.expires_at) > new Date()) {
    return NextResponse.json({ domain, status: 'verified', token: existing.verification_token });
  }

  // Reuse pending token if still fresh
  if (existing?.status === 'pending' && new Date(existing.expires_at) > new Date()) {
    return NextResponse.json({
      domain,
      status: 'pending',
      token: existing.verification_token,
      txtRecord: `vyzor-verify=${existing.verification_token}`,
      txtHost: `_vyzor.${domain}`,
    });
  }

  // Generate new verification
  const token = randomUUID();

  const { error } = await supabase
    .from('domain_verifications')
    .upsert(
      {
        user_id: userId,
        domain,
        verification_token: token,
        status: 'pending',
        verified_at: null,
        expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,domain' }
    );

  if (error) {
    console.error('[domains/verify] upsert error:', error);
    return NextResponse.json({ error: 'Failed to create verification' }, { status: 500 });
  }

  return NextResponse.json({
    domain,
    status: 'pending',
    token,
    txtRecord: `vyzor-verify=${token}`,
    txtHost: `_vyzor.${domain}`,
  });
}

// GET /api/domains/verify — list all verified domains for user
export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('domain_verifications')
    .select('id, domain, status, verified_at, expires_at, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data ?? []);
}
