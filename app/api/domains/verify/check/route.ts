import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { promises as dns } from 'dns';

const RESOLVERS = ['1.1.1.1', '8.8.8.8', '9.9.9.9'];

async function lookupTxt(hostname: string, resolver: string): Promise<string[][]> {
  const r = new dns.Resolver();
  r.setServers([resolver]);
  try {
    return await r.resolveTxt(hostname);
  } catch {
    return [];
  }
}

async function findToken(domain: string, token: string): Promise<boolean> {
  const expected = `vyzor-verify=${token}`;
  const hosts = [`_vyzor.${domain}`, domain];

  for (const host of hosts) {
    for (const resolver of RESOLVERS) {
      const records = await lookupTxt(host, resolver);
      for (const parts of records) {
        if (parts.join('').includes(expected)) return true;
      }
    }
  }
  return false;
}

// POST /api/domains/verify/check — check DNS propagation and mark verified
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const domain = typeof body.domain === 'string' ? body.domain.trim().toLowerCase() : '';

  if (!domain) return NextResponse.json({ error: 'Domain required' }, { status: 400 });

  const supabase = getSupabaseAdmin();

  const { data: record } = await supabase
    .from('domain_verifications')
    .select('*')
    .eq('user_id', userId)
    .eq('domain', domain)
    .single();

  if (!record) {
    return NextResponse.json({ error: 'No pending verification found for this domain' }, { status: 404 });
  }

  if (record.status === 'verified') {
    return NextResponse.json({ verified: true, status: 'verified' });
  }

  const found = await findToken(domain, record.verification_token);

  if (found) {
    await supabase
      .from('domain_verifications')
      .update({ status: 'verified', verified_at: new Date().toISOString() })
      .eq('id', record.id);

    return NextResponse.json({ verified: true, status: 'verified', domain });
  }

  return NextResponse.json({
    verified: false,
    status: 'pending',
    domain,
    hint: `Add a TXT record: host "_vyzor.${domain}", value "vyzor-verify=${record.verification_token}"`,
  });
}
